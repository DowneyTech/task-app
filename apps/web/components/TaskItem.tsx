"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@task-app/shared";
import { cn, priorityColor, priorityLabel, formatDueDate, isOverdue } from "@/lib/utils";
import { useTaskStore } from "@/store/tasks";
import { PomodoroTimer } from "./PomodoroTimer";

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  selected?: boolean;
  onSelect?: (task: Task) => void;
}

export function TaskItem({ task, onEdit, selected, onSelect }: TaskItemProps) {
  const { completeTask, deleteTask } = useTaskStore();
  const [completing, setCompleting] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const liRef = useRef<HTMLLIElement>(null);
  const done = task.status === "DONE";

  useEffect(() => {
    if (selected) liRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const handleComplete = async () => {
    setCompleting(true);
    await completeTask(task.id).finally(() => setCompleting(false));
  };

  const dueDateStr = formatDueDate(task.dueDate);
  const overdue = isOverdue(task.dueDate) && !done;

  return (
    <li
      ref={liRef}
      onClick={() => onSelect?.(task)}
      className={cn(
        "group flex items-start gap-3 py-2.5 px-1 border-b border-border/60 transition-colors hover:bg-surface-subtle rounded-md",
        selected && "bg-brand/5 ring-1 ring-inset ring-brand/40"
      )}
    >
      {/* チェックボックス */}
      <button
        onClick={handleComplete}
        disabled={completing}
        className={cn(
          "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150",
          done
            ? "border-text-muted bg-text-muted"
            : priorityColor[task.priority].replace("text-", "border-"),
          !done && "hover:bg-surface-muted"
        )}
        aria-label={done ? "完了を取り消す" : "完了にする"}
      >
        {done && (
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-white animate-check-in">
            <path d="M10 3L4.5 8.5 2 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className={cn("text-sm leading-5 flex-1", done && "line-through text-text-muted")}>
            {task.title}
          </p>
          {task.priority !== "NONE" && (
            <span className={cn("text-xs font-medium shrink-0 mt-0.5", priorityColor[task.priority])}>
              {priorityLabel[task.priority]}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
        )}

        {/* メタ情報 */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {dueDateStr && (
            <span className={cn("text-xs flex items-center gap-1", overdue ? "text-red-500" : "text-text-muted")}>
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
                <path d="M12 2h-1V0h-2v2H7V0H5v2H4C2.9 2 2 2.9 2 4v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H4V6h8v8zM6 8h2v2H6z"/>
              </svg>
              {dueDateStr}
            </span>
          )}
          {task.project && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.project.color }} />
              {task.project.name}
            </span>
          )}
          {task.pomodoroCount != null && task.pomodoroCount > 0 && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
              {task.pomodoroCount}
            </span>
          )}
        </div>
      </div>

      {/* アクション */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowPomodoro(!showPomodoro)}
          className="p-1 rounded hover:bg-surface-muted text-text-muted hover:text-brand transition-colors"
          title="ポモドーロを開始"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded hover:bg-surface-muted text-text-muted hover:text-text transition-colors"
            title="編集"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
              <path d="M11.5 2.5a2.12 2.12 0 0 1 3 3L5 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        <button
          onClick={() => deleteTask(task.id)}
          className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
          title="削除"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
            <path d="M6 2h4a1 1 0 0 1 1 1v1H5V3a1 1 0 0 1 1-1zM3 5h10l-1 9H4L3 5zm3 2v5h1V7H6zm3 0v5h1V7H9z"/>
          </svg>
        </button>
      </div>

      {showPomodoro && (
        <PomodoroTimer
          taskId={task.id}
          taskTitle={task.title}
          onClose={() => setShowPomodoro(false)}
        />
      )}
    </li>
  );
}
