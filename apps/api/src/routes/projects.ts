import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../db";
import { authMiddleware } from "../middleware/auth";

export const projectRoutes = new Hono();
projectRoutes.use("*", authMiddleware);

const createSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const updateSchema = createSchema.partial();

projectRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { tasks: { where: { status: { not: "DONE" } } } } } },
  });
  return c.json(
    projects.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      userId: p.userId,
      taskCount: p._count.tasks,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  );
});

projectRoutes.post("/", zValidator("json", createSchema), async (c) => {
  const userId = c.get("userId");
  const { name, color } = c.req.valid("json");
  const project = await prisma.project.create({
    data: { name, color: color ?? "#6366f1", userId },
  });
  return c.json(
    { ...project, taskCount: 0, createdAt: project.createdAt.toISOString(), updatedAt: project.updatedAt.toISOString() },
    201
  );
});

projectRoutes.put("/:id", zValidator("json", updateSchema), async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();
  const data = c.req.valid("json");

  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) return c.json({ error: "Not found" }, 404);

  const updated = await prisma.project.update({ where: { id }, data });
  return c.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
});

projectRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();

  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) return c.json({ error: "Not found" }, 404);

  await prisma.project.delete({ where: { id } });
  return c.json({ success: true });
});
