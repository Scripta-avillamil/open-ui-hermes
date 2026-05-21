"use client";

import { MessageBubble } from "./MessageBubble";
import { StreamingMessage } from "./StreamingMessage";
import { Message } from "@/types";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
}

export function MessageList({
  messages,
  streamingContent,
  isStreaming,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isStreaming]);

  // Check if last message is an empty assistant message (loading state)
  const lastMessage = messages[messages.length - 1];
  const isLoading = isStreaming && lastMessage?.role === "assistant" && !lastMessage.content;

  // Filter out empty loading messages from the regular render
  const displayMessages = isLoading
    ? messages.slice(0, -1)
    : messages;

  return (
    <div className="flex-1 overflow-y-auto w-full min-h-0">
      <div className="w-full py-10">
        {displayMessages.map((message, index) => (
          <div key={message.id}>
            <MessageBubble
              role={message.role as "user" | "assistant" | "system"}
              content={message.content}
            />
            {index < displayMessages.length - 1 && (
              <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
                <div className="h-px bg-[var(--border-color)]/40" />
              </div>
            )}
          </div>
        ))}
        {(isLoading || (isStreaming && streamingContent)) && (
          <StreamingMessage content={streamingContent} />
        )}
      </div>
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
