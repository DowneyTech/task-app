import type {
  AuthResponse,
  Task,
  Project,
  Pomodoro,
  CreateTaskInput,
  UpdateTaskInput,
  CreateProjectInput,
  UpdateProjectInput,
} from "@task-app/shared";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (data: { email: string; name: string; password: string }) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<AuthResponse["user"]>("/auth/me"),
  },

  projects: {
    list: () => request<Project[]>("/projects"),
    create: (data: CreateProjectInput) =>
      request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: UpdateProjectInput) =>
      request<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/projects/${id}`, { method: "DELETE" }),
  },

  tasks: {
    list: (params?: { projectId?: string; status?: string; today?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.projectId) qs.set("projectId", params.projectId);
      if (params?.status) qs.set("status", params.status);
      if (params?.today) qs.set("today", "true");
      return request<Task[]>(`/tasks${qs.size ? `?${qs}` : ""}`);
    },
    create: (data: CreateTaskInput) =>
      request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTaskInput) =>
      request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    complete: (id: string) =>
      request<Task>(`/tasks/${id}/complete`, { method: "PATCH" }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/tasks/${id}`, { method: "DELETE" }),
  },

  pomodoros: {
    start: (taskId: string) =>
      request<Pomodoro>("/pomodoros/start", {
        method: "POST",
        body: JSON.stringify({ taskId }),
      }),
    end: (id: string) =>
      request<Pomodoro>(`/pomodoros/${id}/end`, { method: "PATCH" }),
    list: (params?: { taskId?: string; active?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.taskId) qs.set("taskId", params.taskId);
      if (params?.active) qs.set("active", "true");
      return request<Pomodoro[]>(`/pomodoros${qs.size ? `?${qs}` : ""}`);
    },
  },
};
