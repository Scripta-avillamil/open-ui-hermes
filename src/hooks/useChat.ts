"use client";

import { useState, useCallback } from "react";
import { Message } from "@/types";
import { useConversations } from "./useConversations";

export function useChat() {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    conversations,
    loading: conversationsLoading,
    createConversation,
    deleteConversation,
    refreshConversations,
  } = useConversations();

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null);
      setIsLoading(true);

      try {
        let convId = activeConversationId;

        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          role: "user",
          content,
          conversationId: convId || "pending",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Show a loading indicator for the assistant
        const loadingMessage: Message = {
          id: `temp-loading`,
          role: "assistant",
          content: "",
          conversationId: convId || "pending",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, loadingMessage]);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, conversationId: convId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Error en la conexión");
        }

        const data = await response.json();

        if (!convId) {
          convId = data.conversationId;
          setActiveConversationId(convId);
        }

        const assistantMessage: Message = {
          id: `temp-${Date.now() + 1}`,
          role: "assistant",
          content: data.content,
          conversationId: convId,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);

        refreshConversations();
      } catch (err) {
        // Remove loading message on error
        setMessages((prev) => prev.slice(0, -1));
        const message =
          err instanceof Error ? err.message : "Error desconocido";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, createConversation, refreshConversations]
  );

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.conversation.messages || []);
        setActiveConversationId(id);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
    setError(null);
  }, []);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      const success = await deleteConversation(id);
      if (success) {
        if (activeConversationId === id) {
          setMessages([]);
          setActiveConversationId(null);
        }
      }
    },
    [activeConversationId, deleteConversation]
  );

  return {
    messages,
    isLoading,
    isStreaming: isLoading,
    streamingContent: "",
    error,
    conversations,
    conversationsLoading,
    activeConversationId,
    sendMessage,
    stopStreaming: () => {},
    loadConversation,
    startNewChat,
    deleteConversation: handleDeleteConversation,
  };
}
