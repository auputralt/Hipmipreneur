"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { SuggestionChips } from "./SuggestionChips";
import * as ds from "../../lib/dataService";
import type { ChatMessageType, WorkspaceInsight, StartupPath } from "../../lib/types";

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

const PATH_LABELS: Record<string, string> = {
  find: "Finding Your Idea",
  develop: "Developing Your Idea",
  grow: "Growing Your Business",
};

const INITIAL_CHIPS: Record<string, string[]> = {
  find: ["I work in tech", "I'm a freelancer", "I'm in corporate", "I'm a student"],
  develop: ["It's a SaaS product", "It's a marketplace", "It's a service business", "Let me just describe it"],
  grow: ["B2B company", "B2C / D2C brand", "Agency / consulting", "Let me explain my business"],
};

interface ChatContainerProps {
  workspaceId: string;
  path: StartupPath;
}

export function ChatContainer({ workspaceId, path }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [insights, setInsights] = useState<WorkspaceInsight[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeChips, setActiveChips] = useState<string[]>(INITIAL_CHIPS[path] || []);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load existing chat history and insights on mount
  useEffect(() => {
    async function load() {
      const [history, existingInsights] = await Promise.all([
        ds.loadChatMessages(workspaceId),
        ds.loadWorkspaceInsights(workspaceId),
      ]);

      if (history && history.length > 0) {
        setMessages(history);
      }
      if (existingInsights) {
        setInsights(existingInsights);
      }
      setIsLoadingHistory(false);

      // If no messages, send the initial greeting from HVA
      if (!history || history.length === 0) {
        sendHVAFirstMessage();
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const sendHVAFirstMessage = useCallback(async () => {
    const greetings: Record<string, string> = {
      find: "Hello! I'm HVA, your Hipmipreneur Virtual Assistant. I'm here to help you discover a business worth pursuing. I'd love to hear about your professional journey — what do you do, and what parts of your work excite you the most?",
      develop: "Hello! I'm HVA, your Hipmipreneur Virtual Assistant. I'm here to help you shape your idea into something real. Tell me about the idea you've been thinking about — don't worry about perfection, just share what's on your mind.",
      grow: "Hello! I'm HVA, your Hipmipreneur Virtual Assistant. I'm here to help you find your next growth lever. Tell me about your business — what do you offer, who are your customers, and where do you feel stuck?",
    };

    const content = greetings[path] || greetings.develop;
    const msgId = uid();

    const msg: ChatMessageType = {
      id: msgId,
      workspaceId,
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);
    await ds.saveChatMessage(msg);
  }, [workspaceId, path]);

  const extractInsights = useCallback(async (assistantContent: string, history: ChatMessageType[]) => {
    try {
      const res = await fetch("/api/chat/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantMessage: assistantContent,
          conversationHistory: history.map((m) => ({ role: m.role, content: m.content })),
          existingInsights: insights,
        }),
      });
      const data = await res.json();

      if (data.insights && Array.isArray(data.insights)) {
        for (const insight of data.insights) {
          const id = uid();
          await ds.saveWorkspaceInsight({
            id,
            workspaceId,
            type: insight.type,
            content: insight.content,
            sourceMessageId: "",
            confidence: insight.confidence || 0.7,
          });
          setInsights((prev) => [
            ...prev,
            {
              id,
              workspaceId,
              type: insight.type,
              content: insight.content,
              sourceMessageId: "",
              confidence: insight.confidence || 0.7,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Insight extraction failed:", err);
    }
  }, [workspaceId, insights]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Clear suggestion chips
      setActiveChips([]);

      // Add user message
      const userMsgId = uid();
      const userMsg: ChatMessageType = {
        id: userMsgId,
        workspaceId,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      await ds.saveChatMessage(userMsg);

      // Prepare messages for API (role mapping for Claude: "user"/"assistant")
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      // Start streaming AI response
      setIsStreaming(true);
      const aiMsgId = uid();
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, workspaceId, role: "assistant", content: "", timestamp: new Date().toISOString() },
      ]);

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, path, workspaceId }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Chat request failed");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let aiContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          aiContent += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: aiContent } : m))
          );
        }

        // Save the complete AI message
        const fullMsg: ChatMessageType = {
          id: aiMsgId,
          workspaceId,
          role: "assistant",
          content: aiContent,
          timestamp: new Date().toISOString(),
        };
        await ds.saveChatMessage(fullMsg);

        // Run insight extraction in background
        const updatedHistory = [...messages, userMsg, fullMsg];
        extractInsights(aiContent, updatedHistory);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
        console.error("Chat stream error:", err);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, workspaceId, path, extractInsights]
  );

  if (isLoadingHistory) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-on-surface-variant">Loading conversation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <ChatHeader
        pathLabel={PATH_LABELS[path] || "Chat"}
        insightCount={insights.length}
        insights={insights}
      />

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <ChatMessage
                role={msg.role}
                content={msg.content}
                isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === "assistant" && msg.content.length > 0}
              />
              {/* Show suggestion chips below the last AI message */}
              {msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id && activeChips.length > 0 && !isStreaming && (
                <SuggestionChips chips={activeChips} onSelect={sendMessage} disabled={isStreaming} />
              )}
            </React.Fragment>
          ))}

          {/* Streaming placeholder */}
          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex gap-3 items-start max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shrink-0">
                <span className="text-surface-dim font-headline font-bold text-xs">H</span>
              </div>
              <div className="flex gap-1 py-3">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
