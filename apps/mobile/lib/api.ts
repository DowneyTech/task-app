import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AuthResponse,
  Task,
  Project,
  Pomodoro,
  CreateTaskInput,
  UpdateTaskInput,
} from "@task-app/shared";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem("token");
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
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
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    register: (data: { email: string; name: string; password: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    me: () => request<AuthResponse["user"]>("/auth/me"),
  },
  projects: {
    list: () => request<Project[]>("/projects"),
  },
  tasks: {
    list: (params?: { projectId?: string; today?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.projectId) qs.set("projectId", params.projectId);
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
      request<Pomodoro>("/pomodoros/start", { method: "POST", body: JSON.stringify({ taskId }) }),
    end: (id: string) =>
      request<Pomodoro>(`/pomodoros/${id}/end`, { method: "PATCH" }),
  },
};
