"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/tasks";
import { useUIStore } from "@/store/ui";
import { useTaskListShortcuts } from "@/hooks/useKeyboardShortcuts";
import { TaskItem } from "@/components/TaskItem";
import { AddTaskForm } from "@/components/AddTaskForm";
import { EditTaskModal } from "@/components/EditTaskModal";

export default function InboxPage() {
  const { tasks, loading, fetchTasks } = useTaskStore();
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const setSelectedTaskId = useUIStore((s) => s.setSelectedTaskId);
  const editingTaskId = useUIStore((s) => s.editingTaskId);
  const openEditModal = useUIStore((s) => s.openEditModal);
  const closeEditModal = useUIStore((s) => s.closeEditModal);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const todo = tasks.filter((t) => t.status !== "DONE" && !t.projectId);
  const done = tasks.filter((t) => t.status === "DONE" && !t.projectId);
  const editingTask = tasks.find((t) => t.id === editingTaskId) ?? null;

  useTaskListShortcuts([...todo, ...done]);

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">インボックス</h1>
        <p className="text-sm text-text-muted mt-0.5">
          プロジェクト未分類のタスク{todo.length > 0 && ` • ${todo.length}件`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <ul className="mb-2">
            {todo.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={(t) => openEditModal(t.id)}
                selected={task.id === selectedTaskId}
                onSelect={(t) => setSelectedTaskId(t.id)}
              />
            ))}
          </ul>
          <div className="mt-2">
            <AddTaskForm />
          </div>
          {done.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                完了済み ({done.length})
              </h2>
              <ul>
                {done.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={(t) => openEditModal(t.id)}
                    selected={task.id === selectedTaskId}
                    onSelect={(t) => setSelectedTaskId(t.id)}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {editingTask && (
        <EditTaskModal task={editingTask} onClose={closeEditModal} />
      )}
    </div>
  );
}
