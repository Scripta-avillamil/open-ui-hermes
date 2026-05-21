"use client";

import { PenSquare } from "lucide-react";

interface NewChatButtonProps {
  onClick: () => void;
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-sidebar-hover)] text-[var(--text-primary)] text-sm font-medium transition-all duration-150 shadow-sm"
    >
      <PenSquare className="w-4 h-4 shrink-0" />
      Nuevo chat
    </button>
  );
}
