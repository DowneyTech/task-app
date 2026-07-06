import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./routes/auth";
import { projectRoutes } from "./routes/projects";
import { taskRoutes } from "./routes/tasks";
import { pomodoroRoutes } from "./routes/pomodoros";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:8081").split(","),
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/auth", authRoutes);
app.route("/projects", projectRoutes);
app.route("/tasks", taskRoutes);
app.route("/pomodoros", pomodoroRoutes);

const port = Number(process.env.API_PORT) || 3001;

serve({ fetch: app.fetch, port }, () => {
  console.log(`API server running on http://localhost:${port}`);
});
