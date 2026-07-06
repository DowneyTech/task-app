import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Priority } from "@task-app/shared";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const priorityColor: Record<Priority, string> = {
  HIGH: "text-priority-high",
  MEDIUM: "text-priority-medium",
  LOW: "text-priority-low",
  NONE: "text-priority-none",
};

export const priorityBg: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  LOW: "bg-blue-100 text-blue-700",
  NONE: "bg-gray-100 text-gray-500",
};

export const priorityLabel: Record<Priority, string> = {
  HIGH: "P1",
  MEDIUM: "P2",
  LOW: "P3",
  NONE: "P4",
};

export const formatDueDate = (dueDate: string | null): string => {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return "今日";
  if (d.getTime() === tomorrow.getTime()) return "明日";
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
};

export const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
};
