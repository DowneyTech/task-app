"use client";

import { create } from "zustand";

interface UIState {
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;

  editingTaskId: string | null;
  openEditModal: (id: string) => void;
  closeEditModal: () => void;

  addTaskFormOpen: boolean;
  openAddTaskForm: () => void;
  closeAddTaskForm: () => void;

  helpModalOpen: boolean;
  openHelpModal: () => void;
  closeHelpModal: () => void;
  toggleHelpModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  editingTaskId: null,
  openEditModal: (id) => set({ editingTaskId: id }),
  closeEditModal: () => set({ editingTaskId: null }),

  addTaskFormOpen: false,
  openAddTaskForm: () => set({ addTaskFormOpen: true }),
  closeAddTaskForm: () => set({ addTaskFormOpen: false }),

  helpModalOpen: false,
  openHelpModal: () => set({ helpModalOpen: true }),
  closeHelpModal: () => set({ helpModalOpen: false }),
  toggleHelpModal: () => set((s) => ({ helpModalOpen: !s.helpModalOpen })),
}));
