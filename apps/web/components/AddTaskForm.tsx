"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/tasks";
import { useUIStore } from "@/store/ui";
import { useEscapeKey } from "@/hooks/useKeyboardShortcuts";
import type { Priority } from "@task-app/shared";

interface AddTaskFormProps {
  projectId?: string;
  onAdded?: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "HIGH", label: "P1", color: "text-priority-high" },
  { value: "MEDIUM", label: "P2", color: "text-priority-medium" },
  { value: "LOW", label: "P3", color: "text-priority-low" },
  { value: "NONE", label: "P4", color: "text-text-muted" },
];

export function AddTaskForm({ projectId, onAdded }: AddTaskFormProps) {
  const { createTask, projects } = useTaskStore();
  const open = useUIStore((s) => s.addTaskFormOpen);
  const openForm = useUIStore((s) => s.openAddTaskForm);
  const closeForm = useUIStore((s) => s.closeAddTaskForm);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("NONE");
  const [selectedProject, setSelectedProject] = useState(projectId ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => closeForm, [closeForm]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("NONE");
    setSelectedProject(projectId ?? "");
    closeForm();
  };

  useEscapeKey(() => {
    if (open) reset();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        priority,
        projectId: selectedProject || undefined,
      });
      reset();
      onAdded?.();
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={openForm}
        className="flex items-center gap-2 w-full py-2 px-1 text-text-muted hover:text-brand transition-colors group"
      >
        <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center group-hover:border-brand">
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="text-sm">タスクを追加</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border rounded-lg p-3 animate-slide-in bg-surface"
    >
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タスク名"
        className="w-full text-sm font-medium text-text placeholder:text-text-muted outline-none"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="説明（任意）"
        className="w-full text-xs text-text-secondary placeholder:text-text-muted outline-none mt-1"
      />

      {/* メタ情報バー */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="text-xs text-text-secondary border border-border rounded px-1.5 py-0.5 focus:outline-none focus:border-brand"
        />

        {/* 優先度 */}
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={cn(
                "text-xs px-1.5 py-0.5 rounded border transition-colors",
                priority === p.value
                  ? "border-current bg-current/10"
                  : "border-transparent hover:border-border",
                p.color
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* プロジェクト選択 */}
        {!projectId && projects.length > 0 && (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-xs text-text-secondary border border-border rounded px-1.5 py-0.5 focus:outline-none focus:border-brand"
          >
            <option value="">プロジェクトなし</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-3">
        <button type="button" onClick={reset} className="btn-ghost">キャンセル</button>
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="btn-primary"
        >
          追加
        </button>
      </div>
    </form>
  );
}
