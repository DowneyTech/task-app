"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Task, Priority } from "@task-app/shared";
import { useTaskStore } from "@/store/tasks";
import { useUIStore } from "@/store/ui";

const PRIORITY_MAP: Record<string, Priority> = {
  "1": "HIGH",
  "2": "MEDIUM",
  "3": "LOW",
  "4": "NONE",
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
};

/** モーダルやフォームをEscキーで閉じるための共通フック */
export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);
}

/** アプリ全体で有効なショートカット（タスク追加・ページ移動・ヘルプ表示） */
export function useGlobalShortcuts() {
  const router = useRouter();
  const openAddTaskForm = useUIStore((s) => s.openAddTaskForm);
  const toggleHelpModal = useUIStore((s) => s.toggleHelpModal);
  const pendingG = useRef(false);
  const pendingGTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // G→I（インボックス）/ G→T（今日）の2段キー
      if (pendingG.current) {
        pendingG.current = false;
        if (pendingGTimeout.current) clearTimeout(pendingGTimeout.current);
        const key = e.key.toLowerCase();
        if (key === "i") {
          e.preventDefault();
          router.push("/inbox");
        } else if (key === "t") {
          e.preventDefault();
          router.push("/today");
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case "g":
          pendingG.current = true;
          pendingGTimeout.current = setTimeout(() => {
            pendingG.current = false;
          }, 1500);
          break;
        case "q":
        case "a":
          e.preventDefault();
          openAddTaskForm();
          break;
        case "?":
          e.preventDefault();
          toggleHelpModal();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (pendingGTimeout.current) clearTimeout(pendingGTimeout.current);
    };
  }, [router, openAddTaskForm, toggleHelpModal]);
}

/** タスク一覧ページ（今日/インボックス/プロジェクト）で有効なショートカット */
export function useTaskListShortcuts(visibleTasks: Task[]) {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const setSelectedTaskId = useUIStore((s) => s.setSelectedTaskId);
  const openEditModal = useUIStore((s) => s.openEditModal);
  const completeTask = useTaskStore((s) => s.completeTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  useEffect(() => {
    return () => setSelectedTaskId(null);
  }, [setSelectedTaskId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (visibleTasks.length === 0) return;

      const currentIndex = visibleTasks.findIndex((t) => t.id === selectedTaskId);
      const selectedTask = currentIndex !== -1 ? visibleTasks[currentIndex] : null;

      // Cmd/Ctrl+E: 編集
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "e") {
        if (!selectedTask) return;
        e.preventDefault();
        openEditModal(selectedTask.id);
        return;
      }

      // Cmd+Backspace（Mac）/ Shift+Backspace（Windows）: 削除
      if ((e.metaKey || e.shiftKey) && !e.ctrlKey && !e.altKey && e.key === "Backspace") {
        if (!selectedTask) return;
        e.preventDefault();
        deleteTask(selectedTask.id);
        setSelectedTaskId(null);
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case "j":
        case "arrowdown": {
          e.preventDefault();
          const next = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, visibleTasks.length - 1);
          setSelectedTaskId(visibleTasks[next].id);
          break;
        }
        case "k":
        case "arrowup": {
          e.preventDefault();
          const prev = currentIndex === -1 ? 0 : Math.max(currentIndex - 1, 0);
          setSelectedTaskId(visibleTasks[prev].id);
          break;
        }
        case "e": {
          if (!selectedTask) break;
          e.preventDefault();
          completeTask(selectedTask.id);
          break;
        }
        case "1":
        case "2":
        case "3":
        case "4": {
          if (!selectedTask) break;
          e.preventDefault();
          updateTask(selectedTask.id, { priority: PRIORITY_MAP[key] });
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visibleTasks, selectedTaskId, setSelectedTaskId, openEditModal, completeTask, updateTask, deleteTask]);
}
