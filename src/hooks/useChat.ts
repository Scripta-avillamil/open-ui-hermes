"use client";

import { useState, useCallback } from "react";
import { Message, ChatMessage } from "@/types";
import { useStreaming } from "./useStreaming";
import { useConversations } from "./useConversations";

export function useChat() {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { streamingContent, isStreaming, startStreaming, stopStreaming } =
    useStreaming();
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

      try {
        let convId = activeConversationId;
        if (!convId) {
          const conv = await createConversation(
            content.substring(0, 50).trim() || "Nueva conversación"
          );
          if (!conv) {
            setError("Error al crear la conversación");
            return;
          }
          convId = conv.id;
          setActiveConversationId(convId);
        }

        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          role: "user",
          content,
          conversationId: convId,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        const chatMessages: ChatMessage[] = [...messages, userMessage].map(
          (m) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })
        );

        const assistantContent = await startStreaming(chatMessages, convId);

        const assistantMessage: Message = {
          id: `temp-${Date.now() + 1}`,
          role: "assistant",
          content: assistantContent,
          conversationId: convId,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        refreshConversations();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error desconocido";
        setError(message);
      }
    },
    [
      activeConversationId,
      messages,
      createConversation,
      startStreaming,
      refreshConversations,
    ]
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
    streamingContent,
    isStreaming,
    error,
    conversations,
    conversationsLoading,
    activeConversationId,
    sendMessage,
    stopStreaming,
    loadConversation,
    startNewChat,
    deleteConversation: handleDeleteConversation,
  };
}
