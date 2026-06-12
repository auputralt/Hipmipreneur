"use client";

import React from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isAI = role === "assistant";

  return (
    <div className={`flex gap-3 ${isAI ? "items-start" : "items-end"} w-full max-w-3xl`}>
      {/* AI avatar */}
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <span className="text-surface-dim font-headline font-bold text-xs">H</span>
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAI
            ? "bg-surface-container-high/60 backdrop-blur-md border border-outline/50 text-on-surface rounded-tl-md max-w-[85%]"
            : "bg-primary/15 backdrop-blur-md border border-primary/20 text-on-surface ml-auto rounded-tr-md"
        }`}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
}
