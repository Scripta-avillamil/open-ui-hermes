"use client";

import { NewChatButton } from "./NewChatButton";
import { ConversationItem } from "./ConversationItem";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Conversation } from "@/types";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onLogout,
  isOpen,
  onClose,
  username,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10a37f] to-[#0d8c6d] flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8v-2h3V9h2v4h3v2h-3v4h-2z" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-[var(--text-primary)]">
              OpenClaw
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="px-3 pt-2 pb-3">
          <NewChatButton onClick={onNew} />
        </div>

        <div className="mx-4 my-1 h-px bg-[var(--border-color)]" />

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2 min-h-0">
          {conversations.length === 0 ? (
            <p className="text-[13px] text-[var(--text-secondary)] px-3 py-4 text-center opacity-60">
              Sin conversaciones aún
            </p>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                onClick={() => {
                  onSelect(conv.id);
                  onClose();
                }}
                onDelete={() => onDelete(conv.id)}
              />
            ))
          )}
        </div>

        {/* User */}
        <div className="p-3 border-t border-[var(--border-color)]">
          <Link
            href="/settings"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-sidebar-hover)] transition-colors text-left mb-1"
          >
            <Settings className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
            <span className="text-sm text-[var(--text-secondary)]">
              Configuración
            </span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-sidebar-hover)] transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {username || "Usuario"}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Cerrar sesión</p>
            </div>
            <LogOut className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
