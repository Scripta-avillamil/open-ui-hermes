"use client";

import { useState, useCallback, useEffect } from "react";
import { Conversation } from "@/types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = useCallback(async (title?: string) => {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      const data = await res.json();
      setConversations((prev) => [data.conversation, ...prev]);
      return data.conversation as Conversation;
    }
    return null;
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/conversations/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
    return false;
  }, []);

  const updateConversationTitle = useCallback(
    async (id: string, title: string) => {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c))
        );
      }
    },
    []
  );

  const refreshConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    createConversation,
    deleteConversation,
    updateConversationTitle,
    refreshConversations,
  };
}
