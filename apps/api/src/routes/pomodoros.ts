import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../db";
import { authMiddleware } from "../middleware/auth";

export const pomodoroRoutes = new Hono();
pomodoroRoutes.use("*", authMiddleware);

const startSchema = z.object({
  taskId: z.string(),
});

pomodoroRoutes.post("/start", zValidator("json", startSchema), async (c) => {
  const userId = c.get("userId");
  const { taskId } = c.req.valid("json");

  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) return c.json({ error: "Task not found" }, 404);

  const active = await prisma.pomodoro.findFirst({
    where: { userId, endedAt: null },
  });
  if (active) return c.json({ error: "A pomodoro session is already active" }, 409);

  const pomodoro = await prisma.pomodoro.create({
    data: { taskId, userId },
  });

  return c.json(
    {
      ...pomodoro,
      startedAt: pomodoro.startedAt.toISOString(),
      endedAt: null,
      createdAt: pomodoro.createdAt.toISOString(),
    },
    201
  );
});

pomodoroRoutes.patch("/:id/end", async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();

  const pomodoro = await prisma.pomodoro.findFirst({ where: { id, userId } });
  if (!pomodoro) return c.json({ error: "Not found" }, 404);
  if (pomodoro.endedAt) return c.json({ error: "Already ended" }, 409);

  const endedAt = new Date();
  const duration = Math.round((endedAt.getTime() - pomodoro.startedAt.getTime()) / 60000);

  const updated = await prisma.pomodoro.update({
    where: { id },
    data: { endedAt, duration },
  });

  return c.json({
    ...updated,
    startedAt: updated.startedAt.toISOString(),
    endedAt: updated.endedAt!.toISOString(),
    createdAt: updated.createdAt.toISOString(),
  });
});

pomodoroRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const { taskId, active } = c.req.query();

  const where: Record<string, unknown> = { userId };
  if (taskId) where.taskId = taskId;
  if (active === "true") where.endedAt = null;

  const pomodoros = await prisma.pomodoro.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return c.json(
    pomodoros.map((p) => ({
      ...p,
      startedAt: p.startedAt.toISOString(),
      endedAt: p.endedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    }))
  );
});
