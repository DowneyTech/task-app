export type Priority = "HIGH" | "MEDIUM" | "LOW" | "NONE";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  userId: string;
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  projectId: string | null;
  project?: Pick<Project, "id" | "name" | "color"> | null;
  userId: string;
  pomodoroCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pomodoro {
  id: string;
  taskId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  projectId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  projectId?: string | null;
}

export interface CreateProjectInput {
  name: string;
  color?: string;
}

export interface UpdateProjectInput {
  name?: string;
  color?: string;
}
