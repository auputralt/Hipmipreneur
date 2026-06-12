"use client";

import React, { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full border-t border-outline/40 bg-surface-container-low/30 backdrop-blur-md px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        {/* Attachment placeholder (non-functional for MVP) */}
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 transition-colors shrink-0 cursor-pointer"
          title="Attach file (coming soon)"
        >
          <span className="material-symbols-outlined text-lg">attach_file</span>
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-surface-container/60 backdrop-blur-sm border border-outline/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            disabled || !value.trim()
              ? "bg-surface-container-high/40 text-on-surface-variant/30 cursor-not-allowed"
              : "bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          }`}
        >
          <span className="material-symbols-outlined text-lg">arrow_upward</span>
        </button>
      </div>
    </div>
  );
}
