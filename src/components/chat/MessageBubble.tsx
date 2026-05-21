"use client";

import { MarkdownRenderer } from "@/lib/markdown";
import { Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="w-full py-5 animate-fade-in-up">
        <div className="chat-content flex justify-end">
          <div className="max-w-[75%] px-5 py-3.5 rounded-2xl rounded-br-md bg-[var(--user-bubble)] text-[var(--text-primary)] border border-[var(--border-color)]">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-5 animate-fade-in-up">
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
            <div className="relative group">
              <div className="text-[15px] leading-[1.75] text-[var(--text-primary)]">
                <MarkdownRenderer content={content} />
              </div>
              <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
