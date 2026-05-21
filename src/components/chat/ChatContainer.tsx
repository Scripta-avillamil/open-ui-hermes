"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types";
import { Code, Shield, MessageSquare } from "lucide-react";

interface ChatContainerProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
}

const suggestions = [
  {
    label: "Explicar OpenClaw",
    text: "Explícame qué es OpenClaw",
    icon: MessageSquare,
    description: "Conoce la plataforma",
  },
  {
    label: "Escribir código",
    text: "Ayúdame a escribir un script en Python",
    icon: Code,
    description: "Genera o depura código",
  },
  {
    label: "Seguridad API",
    text: "Mejores prácticas de seguridad para APIs",
    icon: Shield,
    description: "Buenas prácticas",
  },
];

export function ChatContainer({
  messages,
  streamingContent,
  isStreaming,
  onSend,
  onStop,
}: ChatContainerProps) {
  const isEmpty = messages.length === 0 && !isStreaming;

  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-8">
          <div className="w-full max-w-3xl flex flex-col items-center animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10a37f] to-[#0d8c6d] flex items-center justify-center mb-6 shadow-lg shadow-[#10a37f]/20">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8v-2h3V9h2v4h3v2h-3v4h-2z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] mb-2 text-center tracking-tight">
              ¿En qué puedo ayudarte?
            </h1>
            <p className="text-[var(--text-secondary)] text-base mb-10 text-center">
              Pregunta lo que quieras, estoy aquí para ayudarte.
            </p>
            <div className="w-full">
              <ChatInput
                onSend={onSend}
                onStop={onStop}
                isStreaming={isStreaming}
                variant="centered"
              />
            </div>
            <div className="w-full mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => onSend(s.text)}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-all text-left group hover:border-[var(--accent)]/30"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mt-0.5">
                    <s.icon className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {s.label}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {s.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
      />
      <div className="shrink-0 w-full pt-4 pb-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)]/50">
        <ChatInput
          onSend={onSend}
          onStop={onStop}
          isStreaming={isStreaming}
          variant="bottom"
        />
      </div>
    </div>
  );
}
