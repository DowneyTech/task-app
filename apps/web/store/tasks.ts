"use client";

import { create } from "zustand";
import type { Task, Project, CreateTaskInput, UpdateTaskInput } from "@task-app/shared";
import { api } from "@/lib/api";

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  loading: boolean;
  fetchTasks: (params?: { projectId?: string; today?: boolean }) => Promise<void>;
  fetchProjects: () => Promise<void>;
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createProject: (name: string, color: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  projects: [],
  loading: false,

  fetchTasks: async (params) => {
    set({ loading: true });
    try {
      const tasks = await api.tasks.list(params);
      set({ tasks });
    } finally {
      set({ loading: false });
    }
  },

  fetchProjects: async () => {
    const projects = await api.projects.list();
    set({ projects });
  },

  createTask: async (data) => {
    const task = await api.tasks.create(data);
    set((s) => ({ tasks: [task, ...s.tasks] }));
    if (task.projectId) {
      await get().fetchProjects();
    }
    return task;
  },

  updateTask: async (id, data) => {
    const task = await api.tasks.update(id, data);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }));
  },

  completeTask: async (id) => {
    const task = await api.tasks.complete(id);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }));
  },

  deleteTask: async (id) => {
    await api.tasks.delete(id);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  createProject: async (name, color) => {
    const project = await api.projects.create({ name, color });
    set((s) => ({ projects: [...s.projects, project] }));
    return project;
  },

  deleteProject: async (id) => {
    await api.projects.delete(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.filter((t) => t.projectId !== id),
    }));
  },
}));
