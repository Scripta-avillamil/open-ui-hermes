"use client";

import { ArrowUp, Square } from "lucide-react";
import { useState, useRef, KeyboardEvent, FormEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  variant?: "centered" | "bottom";
  className?: string;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isStreaming = false,
  variant = "bottom",
  className = "",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  };

  const canSend = value.trim() && !disabled && !isStreaming;

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="chat-content">
        <div
          className={`relative flex items-center bg-[var(--bg-input)] rounded-[28px] border border-[var(--border-input)] transition-all focus-within:border-[var(--accent)]/50 focus-within:shadow-[0_0_0_3px_var(--accent)/10] ${
            variant === "centered" ? "shadow-[var(--shadow-input)]" : ""
          }`}
          style={{ minHeight: "56px" }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta lo que quieras..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] py-[18px] pl-6 pr-14 max-h-[200px] focus:outline-none text-base leading-relaxed"
          />
          <div className="absolute right-3 bottom-[10px]">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity"
                aria-label="Detener"
              >
                <Square className="w-3.5 h-3.5" fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--accent)] text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all hover:opacity-90 hover:scale-105 disabled:hover:scale-100"
                aria-label="Enviar"
              >
                <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
        {variant === "bottom" && (
          <p className="text-[11px] text-center text-[var(--text-secondary)] mt-4 opacity-50">
            OpenClaw puede cometer errores. Verifica la información importante.
          </p>
        )}
      </form>
    </div>
  );
}
