"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/tasks";
import type { Pomodoro, Task } from "@task-app/shared";

const CIRCUMFERENCE = 2 * Math.PI * 36;

const DURATIONS = [
  { label: "25分", minutes: 25 },
  { label: "15分", minutes: 15 },
  { label: "5分", minutes: 5 },
];

type Phase = "idle" | "running" | "paused" | "finished" | "select";

interface PomodoroTimerProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onTasksCompleted?: (taskIds: string[]) => void;
}

export function PomodoroTimer({ taskId, taskTitle, onClose, onTasksCompleted }: PomodoroTimerProps) {
  const { tasks, completeTask } = useTaskStore();

  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([taskId]));
  const [confirming, setConfirming] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<Pomodoro | null>(null);
  // session state は sessionRef に集約（updater 内クロージャの stale 回避）

  // タイマーカウントダウン（updater 内に副作用なし）
  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  // タイマー自然終了を検知
  useEffect(() => {
    if (phase !== "running" || remaining > 0) return;
    clearInterval(intervalRef.current!);
    const s = sessionRef.current;
    if (s) {
      api.pomodoros.end(s.id).catch(console.error);
      sessionRef.current = null;
    }
    setPhase("finished");
  }, [remaining, phase]);

  useEffect(() => {
    setRemaining(duration * 60);
  }, [duration]);

  const start = async () => {
    const s = await api.pomodoros.start(taskId);
    sessionRef.current = s;
    setRemaining(duration * 60);
    setPhase("running");
  };

  const pause = () => {
    clearInterval(intervalRef.current!);
    setPhase("paused");
  };

  const resume = () => setPhase("running");

  const stop = async () => {
    clearInterval(intervalRef.current!);
    const s = sessionRef.current;
    if (s) await api.pomodoros.end(s.id);
    sessionRef.current = null;
    setRemaining(duration * 60);
    setPhase("idle");
  };

  const reset = () => {
    sessionRef.current = null;
    setSelectedIds(new Set([taskId]));
    setRemaining(duration * 60);
    setPhase("idle");
  };

  const goToSelect = () => {
    setSelectedIds(new Set([taskId]));
    setPhase("select");
  };

  const toggleTask = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmComplete = async () => {
    if (selectedIds.size === 0) { setPhase("idle"); onClose(); return; }
    setConfirming(true);
    try {
      await Promise.all([...selectedIds].map((id) => completeTask(id)));
      onTasksCompleted?.([...selectedIds]);
      onClose();
    } catch {
      onClose();
    } finally {
      setConfirming(false);
    }
  };

  const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");
  const progress = 1 - remaining / (duration * 60);
  const strokeDash = CIRCUMFERENCE * (1 - progress);

  // タスク選択フェーズに表示するタスク（未完了のみ）
  const selectableTasks: Task[] = tasks.filter((t) => t.status !== "DONE");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none"
      aria-modal="true"
    >
      <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-border w-80 animate-slide-in overflow-hidden">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-brand">
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            </span>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">ポモドーロ</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1 rounded hover:bg-surface-muted">
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 4L4 12M4 4l8 8"/>
            </svg>
          </button>
        </div>

        {/* タスク名 */}
        {phase !== "select" && (
          <p className="text-sm font-medium text-text px-5 mb-4 truncate">{taskTitle}</p>
        )}

        {/* ─── タイマーフェーズ ─── */}
        {phase !== "select" && (
          <div className="px-5 pb-5 space-y-4">
            {/* 時間選択（idle のみ） */}
            {phase === "idle" && (
              <div className="flex gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d.minutes}
                    onClick={() => setDuration(d.minutes)}
                    className={cn(
                      "flex-1 py-1.5 text-xs rounded-lg transition-colors font-medium",
                      duration === d.minutes
                        ? "bg-brand text-white"
                        : "bg-surface-muted text-text-secondary hover:bg-surface-subtle"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}

            {/* サークルタイマー */}
            <div className="flex justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#f0f0f0" strokeWidth="5"/>
                  <circle
                    cx="40" cy="40" r="36" fill="none"
                    stroke={phase === "finished" ? "#22c55e" : phase === "paused" ? "#f59e0b" : "#db4035"}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDash}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {phase === "finished" ? (
                    <span className="text-3xl">🎉</span>
                  ) : (
                    <>
                      <span className="text-2xl font-semibold tabular-nums text-text leading-none">
                        {mins}:{secs}
                      </span>
                      <span className="text-xs text-text-muted mt-0.5">
                        {phase === "paused" ? "一時停止中" : phase === "running" ? "集中中" : `${duration}分`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {phase === "finished" && (
              <p className="text-center text-sm text-green-600 font-medium">
                お疲れさまでした！
              </p>
            )}

            {/* コントロール */}
            <div className="flex gap-2">
              {phase === "idle" && (
                <button onClick={start} className="btn-primary flex-1 py-2">開始</button>
              )}
              {phase === "running" && (
                <>
                  <button onClick={pause} className="btn-ghost flex-1 py-2">一時停止</button>
                  <button onClick={stop} className="flex-1 py-2 text-xs text-red-500 rounded-md hover:bg-red-50 transition-colors">中止</button>
                </>
              )}
              {phase === "paused" && (
                <>
                  <button onClick={resume} className="btn-primary flex-1 py-2">再開</button>
                  <button onClick={stop} className="flex-1 py-2 text-xs text-red-500 rounded-md hover:bg-red-50 transition-colors">中止</button>
                </>
              )}
              {phase === "finished" && (
                <>
                  <button onClick={reset} className="btn-ghost flex-1 py-2">もう一度</button>
                  <button onClick={goToSelect} className="btn-primary flex-1 py-2">タスクを完了</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── タスク選択フェーズ ─── */}
        {phase === "select" && (
          <div className="pb-5">
            <div className="px-5 mb-3">
              <p className="text-sm font-semibold text-text">完了したタスクを選択</p>
              <p className="text-xs text-text-muted mt-0.5">この集中セッションで完了したタスクにチェックを入れてください</p>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-border/60">
              {selectableTasks.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">未完了のタスクはありません</p>
              ) : (
                selectableTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors",
                      selectedIds.has(t.id) ? "bg-brand/5" : "hover:bg-surface-subtle"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                        selectedIds.has(t.id)
                          ? "bg-brand border-brand"
                          : "border-border-strong"
                      )}
                    >
                      {selectedIds.has(t.id) && (
                        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-none stroke-white" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M2 5l2.5 2.5L8 3"/>
                        </svg>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text truncate">{t.title}</p>
                      {t.project && (
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.project.color }} />
                          {t.project.name}
                        </p>
                      )}
                    </div>
                    {t.id === taskId && (
                      <span className="text-xs text-brand font-medium shrink-0">開始タスク</span>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-2 px-5 mt-4">
              <button
                onClick={() => setPhase("finished")}
                className="btn-ghost flex-1 py-2"
              >
                戻る
              </button>
              <button
                onClick={confirmComplete}
                disabled={confirming}
                className="btn-primary flex-1 py-2"
              >
                {confirming
                  ? "完了中..."
                  : selectedIds.size > 0
                  ? `${selectedIds.size}件を完了`
                  : "スキップ"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
