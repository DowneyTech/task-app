"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/tasks";
import { useAuthStore } from "@/store/auth";
import { AddProjectModal } from "./AddProjectModal";

const NAV_ITEMS = [
  {
    href: "/inbox",
    label: "インボックス",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V7h8v2z"/>
      </svg>
    ),
  },
  {
    href: "/today",
    label: "今日",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { projects } = useTaskStore();
  const { user, logout } = useAuthStore();
  const [showAddProject, setShowAddProject] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <aside className="w-64 bg-[#1f1f1f] text-white h-screen flex flex-col select-none">
        {/* ユーザー */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 cursor-pointer group">
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <span className="text-sm font-medium truncate flex-1">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity text-xs"
              title="ログアウト"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="px-2 space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                    pathname === href
                      ? "bg-white/15 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className={pathname === href ? "text-brand" : "text-white/50"}>{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* プロジェクト */}
          <div className="mt-4 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">プロジェクト</span>
              <button
                onClick={() => setShowAddProject(true)}
                className="text-white/40 hover:text-white/80 transition-colors w-5 h-5 flex items-center justify-center rounded"
                title="プロジェクトを追加"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
            <ul className="space-y-0.5">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/project/${project.id}`}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                      pathname === `/project/${project.id}`
                        ? "bg-white/15 text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1 truncate">{project.name}</span>
                    {project.taskCount != null && project.taskCount > 0 && (
                      <span className="text-xs text-white/40">{project.taskCount}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {showAddProject && <AddProjectModal onClose={() => setShowAddProject(false)} />}
    </>
  );
}
