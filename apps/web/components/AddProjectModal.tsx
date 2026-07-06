"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/tasks";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6366f1", "#db4035", "#ff9a14", "#058527",
  "#14aaf5", "#eb5a46", "#a29bfe", "#00b894",
  "#e17055", "#6c5ce7", "#fdcb6e", "#00cec9",
];

interface AddProjectModalProps {
  onClose: () => void;
}

export function AddProjectModal({ onClose }: AddProjectModalProps) {
  const { createProject } = useTaskStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createProject(name.trim(), color);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-80 p-6 animate-slide-in">
        <h2 className="text-base font-semibold text-text mb-4">プロジェクトを追加</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">名前</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="プロジェクト名"
              className="input"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-2">カラー</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all",
                    color === c ? "ring-2 ring-offset-2 ring-current scale-110" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c, color: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">キャンセル</button>
            <button type="submit" disabled={!name.trim() || loading} className="btn-primary">
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
