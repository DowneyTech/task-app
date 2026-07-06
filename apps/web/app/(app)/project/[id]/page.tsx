"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTaskStore } from "@/store/tasks";
import { useUIStore } from "@/store/ui";
import { useTaskListShortcuts } from "@/hooks/useKeyboardShortcuts";
import { TaskItem } from "@/components/TaskItem";
import { AddTaskForm } from "@/components/AddTaskForm";
import { EditTaskModal } from "@/components/EditTaskModal";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { tasks, projects, loading, fetchTasks, deleteProject } = useTaskStore();
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const setSelectedTaskId = useUIStore((s) => s.setSelectedTaskId);
  const editingTaskId = useUIStore((s) => s.editingTaskId);
  const openEditModal = useUIStore((s) => s.openEditModal);
  const closeEditModal = useUIStore((s) => s.closeEditModal);

  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    fetchTasks({ projectId: id });
  }, [fetchTasks, id]);

  const todo = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");
  const editingTask = tasks.find((t) => t.id === editingTaskId) ?? null;

  useTaskListShortcuts([...todo, ...done]);

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {project && (
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            )}
            <h1 className="text-xl font-semibold text-text">
              {project?.name ?? "プロジェクト"}
            </h1>
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            {todo.length > 0 ? `${todo.length}件のタスク` : "タスクなし"}
          </p>
        </div>
        {project && (
          <button
            onClick={() => {
              if (confirm(`"${project.name}" を削除しますか？`)) {
                deleteProject(project.id);
              }
            }}
            className="text-xs text-text-muted hover:text-red-500 transition-colors"
          >
            削除
          </button>
        )}
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
            <AddTaskForm projectId={id} />
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
