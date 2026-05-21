"use client";

import { Conversation } from "@/types";
import { Trash2 } from "lucide-react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: ConversationItemProps) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
        isActive
          ? "bg-[var(--bg-sidebar-hover)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="flex-1 truncate text-[14px]">{conversation.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-red-500 transition-all shrink-0"
        aria-label="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
