"use client";

import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    messages,
    streamingContent,
    isStreaming,
    error,
    conversations,
    activeConversationId,
    sendMessage,
    stopStreaming,
    loadConversation,
    startNewChat,
    deleteConversation,
  } = useChat();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const activeTitle =
    conversations.find((c) => c.id === activeConversationId)?.title ||
    "Nueva conversación";

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={loadConversation}
        onNew={startNewChat}
        onDelete={deleteConversation}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        username={user.username}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="shrink-0 flex items-center gap-3 px-4 h-14 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
            aria-label="Menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-[var(--text-primary)] truncate flex-1 lg:ml-0">
            {activeTitle}
          </h1>
        </header>

        {error && (
          <div className="shrink-0 px-4 py-2">
            <div className="chat-content p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-sm">
              {error}
            </div>
          </div>
        )}

        <ChatContainer
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          onSend={sendMessage}
          onStop={stopStreaming}
        />
      </div>
    </div>
  );
}
