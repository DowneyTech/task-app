"use client";

import { useEscapeKey } from "@/hooks/useKeyboardShortcuts";

interface ShortcutsHelpModalProps {
  onClose: () => void;
}

const SHORTCUT_GROUPS: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: "タスク操作",
    items: [
      { keys: ["Q", "A"], label: "タスクを追加" },
      { keys: ["E"], label: "選択中のタスクを完了/未完了にする" },
      { keys: ["⌘", "E"], label: "選択中のタスクを編集" },
      { keys: ["1", "〜", "4"], label: "選択中のタスクの優先度をP1〜P4に設定" },
      { keys: ["⌘", "Backspace"], label: "選択中のタスクを削除" },
    ],
  },
  {
    title: "ナビゲーション",
    items: [
      { keys: ["J", "/", "↓"], label: "次のタスクを選択" },
      { keys: ["K", "/", "↑"], label: "前のタスクを選択" },
      { keys: ["G", "I"], label: "インボックスへ移動" },
      { keys: ["G", "T"], label: "今日へ移動" },
    ],
  },
  {
    title: "その他",
    items: [
      { keys: ["Esc"], label: "開いているモーダル/フォームを閉じる" },
      { keys: ["?"], label: "このヘルプを表示" },
    ],
  },
];

export function ShortcutsHelpModal({ onClose }: ShortcutsHelpModalProps) {
  useEscapeKey(onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-slide-in max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text">キーボードショートカット</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="min-w-[1.5rem] text-center px-1.5 py-0.5 text-xs font-mono border border-border rounded bg-surface-subtle text-text"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
