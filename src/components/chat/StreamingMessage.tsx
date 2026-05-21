"use client";

import { MarkdownRenderer } from "@/lib/markdown";
import { Sparkles } from "lucide-react";

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="w-full py-5">
      <div className="chat-content">
        <div className="flex gap-3">
          {/* Avatar IA */}
          <div className="shrink-0 mt-0.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#10a37f] to-[#0d8c6d] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            {content ? (
              <div className="text-[15px] leading-[1.75] text-[var(--text-primary)]">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-2">
                <div className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-pulse-dot" />
                <div
                  className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-pulse-dot"
                  style={{ animationDelay: "0.15s" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-pulse-dot"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
