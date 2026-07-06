"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/tasks";
import { useEscapeKey } from "@/hooks/useKeyboardShortcuts";
import type { Task, Priority, TaskStatus } from "@task-app/shared";

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "HIGH", label: "P1", color: "text-priority-high" },
  { value: "MEDIUM", label: "P2", color: "text-priority-medium" },
  { value: "LOW", label: "P3", color: "text-priority-low" },
  { value: "NONE", label: "P4", color: "text-text-muted" },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "未着手" },
  { value: "IN_PROGRESS", label: "進行中" },
  { value: "DONE", label: "完了" },
];

export function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const { updateTask, projects } = useTaskStore();
  useEscapeKey(onClose);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [selectedProject, setSelectedProject] = useState(task.projectId ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        status,
        projectId: selectedProject || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-slide-in">
        <h2 className="text-base font-semibold text-text mb-4">タスクを編集</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">タイトル</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスク名"
              className="input"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="説明（任意）"
              rows={2}
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">期日</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">ステータス</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="input"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">優先度</label>
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "flex-1 py-1.5 text-xs rounded-lg border transition-colors font-medium",
                    priority === p.value
                      ? "border-current bg-current/10"
                      : "border-border hover:border-border-strong",
                    p.color
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">プロジェクト</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="input"
              >
                <option value="">プロジェクトなし</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="btn-primary"
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
