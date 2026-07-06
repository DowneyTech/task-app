"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ShortcutsHelpModal } from "@/components/ShortcutsHelpModal";
import { useAuthStore } from "@/store/auth";
import { useTaskStore } from "@/store/tasks";
import { useUIStore } from "@/store/ui";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { fetchProjects } = useTaskStore();
  const helpModalOpen = useUIStore((s) => s.helpModalOpen);
  const closeHelpModal = useUIStore((s) => s.closeHelpModal);

  useGlobalShortcuts();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProjects();
  }, [isAuthenticated, router, fetchProjects]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-surface">
        {children}
      </main>
      {helpModalOpen && <ShortcutsHelpModal onClose={closeHelpModal} />}
    </div>
  );
}
