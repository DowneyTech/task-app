import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../db";
import { authMiddleware } from "../middleware/auth";

export const taskRoutes = new Hono();
taskRoutes.use("*", authMiddleware);

const priorityEnum = z.enum(["HIGH", "MEDIUM", "LOW", "NONE"]);
const statusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  dueDate: z.string().datetime({ offset: true }).optional(),
  priority: priorityEnum.optional(),
  projectId: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  projectId: z.string().nullable().optional(),
});

const toTask = (t: {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string | null;
  userId: string;
  project?: { id: string; name: string; color: string } | null;
  _count?: { pomodoros: number };
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  dueDate: t.dueDate?.toISOString() ?? null,
  priority: t.priority,
  status: t.status,
  projectId: t.projectId,
  project: t.project ?? null,
  userId: t.userId,
  pomodoroCount: t._count?.pomodoros ?? 0,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

taskRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const { projectId, status, today } = c.req.query();

  const where: Record<string, unknown> = { userId };
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (today === "true") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    where.dueDate = { gte: start, lte: end };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
    include: {
      project: { select: { id: true, name: true, color: true } },
      _count: { select: { pomodoros: true } },
    },
  });

  return c.json(tasks.map(toTask));
});

taskRoutes.post("/", zValidator("json", createSchema), async (c) => {
  const userId = c.get("userId");
  const { title, description, dueDate, priority, projectId } = c.req.valid("json");

  if (projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) return c.json({ error: "Project not found" }, 404);
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority ?? "NONE",
      projectId,
      userId,
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      _count: { select: { pomodoros: true } },
    },
  });

  return c.json(toTask(task), 201);
});

taskRoutes.put("/:id", zValidator("json", updateSchema), async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();
  const data = c.req.valid("json");

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      _count: { select: { pomodoros: true } },
    },
  });

  return c.json(toTask(task));
});

taskRoutes.patch("/:id/complete", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const newStatus = existing.status === "DONE" ? "TODO" : "DONE";
  const task = await prisma.task.update({
    where: { id },
    data: { status: newStatus },
    include: {
      project: { select: { id: true, name: true, color: true } },
      _count: { select: { pomodoros: true } },
    },
  });

  return c.json(toTask(task));
});

taskRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.task.delete({ where: { id } });
  return c.json({ success: true });
});
