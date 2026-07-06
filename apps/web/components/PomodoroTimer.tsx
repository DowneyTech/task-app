"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Pomodoro } from "@task-app/shared";

const DURATIONS = [
  { label: "25分", minutes: 25 },
  { label: "15分", minutes: 15 },
  { label: "5分", minutes: 5 },
];

interface PomodoroTimerProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

export function PomodoroTimer({ taskId, taskTitle, onClose }: PomodoroTimerProps) {
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(duration * 60);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState<Pomodoro | null>(null);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setFinished(true);
          if (session) api.pomodoros.end(session.id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [running, session]);

  useEffect(() => {
    setRemaining(duration * 60);
    setFinished(false);
  }, [duration]);

  const start = async () => {
    const s = await api.pomodoros.start(taskId);
    setSession(s);
    setRemaining(duration * 60);
    setRunning(true);
    setFinished(false);
  };

  const pause = () => {
    clearInterval(intervalRef.current!);
    setRunning(false);
  };

  const stop = async () => {
    clearInterval(intervalRef.current!);
    setRunning(false);
    if (session) await api.pomodoros.end(session.id);
    setSession(null);
    setRemaining(duration * 60);
    setFinished(false);
  };

  const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");
  const progress = 1 - remaining / (duration * 60);
  const circumference = 2 * Math.PI * 36;
  const strokeDash = circumference * (1 - progress);

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-border w-72 p-5 animate-slide-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">ポモドーロ</p>
          <p className="text-sm font-medium text-text truncate max-w-[180px]">{taskTitle}</p>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* 時間選択 */}
      {!running && !session && (
        <div className="flex gap-1 mb-4">
          {DURATIONS.map((d) => (
            <button
              key={d.minutes}
              onClick={() => setDuration(d.minutes)}
              className={cn(
                "flex-1 py-1 text-xs rounded-md transition-colors font-medium",
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

      {/* タイマー */}
      <div className="flex justify-center my-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#f0f0f0" strokeWidth="6"/>
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke={finished ? "#22c55e" : "#db4035"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums text-text">
              {finished ? "✓" : `${mins}:${secs}`}
            </span>
          </div>
        </div>
      </div>

      {finished && (
        <p className="text-center text-sm text-green-600 font-medium mb-3">完了！お疲れさまでした 🎉</p>
      )}

      {/* コントロール */}
      <div className="flex gap-2 justify-center">
        {!running && !session && (
          <button onClick={start} className="btn-primary flex-1">開始</button>
        )}
        {running && (
          <>
            <button onClick={pause} className="btn-ghost flex-1">一時停止</button>
            <button onClick={stop} className="btn-ghost flex-1 text-red-500 hover:bg-red-50">中止</button>
          </>
        )}
        {!running && session && !finished && (
          <>
            <button onClick={() => setRunning(true)} className="btn-primary flex-1">再開</button>
            <button onClick={stop} className="btn-ghost flex-1 text-red-500 hover:bg-red-50">中止</button>
          </>
        )}
        {finished && (
          <button onClick={() => { setSession(null); setFinished(false); setRemaining(duration * 60); }} className="btn-primary flex-1">
            もう一度
          </button>
        )}
      </div>
    </div>
  );
}
