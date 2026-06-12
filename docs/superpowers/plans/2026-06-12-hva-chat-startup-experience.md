# HVA Chat-First Startup Experience — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the form-based onboarding with a conversational AI chat where HVA (Hipmipreneur Virtual Assistant) guides users through deep, probing dialogue to discover and shape their business idea.

**Architecture:** Three-card entry point on the dashboard creates a workspace and redirects to a full-screen chat page. The chat streams AI responses from Claude (Anthropic) with BluesMind/OpenRouter fallback. Insights are extracted after each AI response and saved to Supabase. When the conversation concludes, extracted data populates a draft Lean Canvas.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4 (Warm Glass theme), Supabase (PostgreSQL), Anthropic Messages API (streaming), BluesMind/OpenRouter (fallback)

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `app/dashboard/chat/[workspaceId]/page.tsx` | Full-screen chat page |
| `app/api/chat/route.ts` | Streaming chat endpoint (Claude → BluesMind fallback) |
| `app/api/chat/extract/route.ts` | Insight extraction from conversation |
| `components/chat/ChatContainer.tsx` | Chat orchestrator — manages messages, sends, receives stream |
| `components/chat/ChatMessage.tsx` | Single message bubble (user or AI) |
| `components/chat/ChatInput.tsx` | Input bar with send button |
| `components/chat/ChatHeader.tsx` | Header: back link, path label, insights counter |
| `components/chat/InsightsPanel.tsx` | Dropdown showing extracted insights |
| `components/chat/SuggestionChips.tsx` | Quick-reply chips below AI messages |

### Modified Files
| File | Change |
|------|--------|
| `lib/types.ts` | Add `ChatMessage`, `WorkspaceInsight`, path types |
| `lib/dataService.ts` | Add chat history + insights CRUD functions |
| `app/dashboard/get-started/page.tsx` | Add 3-card startup creation section at top |
| `app/dashboard/layout.tsx` | Conditionally hide sidebar/header for chat pages |
| `context/WorkspaceContext.tsx` | Add workspace creation for chat paths |

---

### Task 1: Types and Data Layer

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/dataService.ts`

- [ ] **Step 1: Add chat and insight types to `lib/types.ts`**

Add these types at the end of the file, before the re-exports:

```typescript
// ============================================================
// CHAT
// ============================================================

export interface ChatMessageType {
  id: string;
  workspaceId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestionChips?: string[];
}

export interface WorkspaceInsight {
  id: string;
  workspaceId: string;
  type: "customer_segment" | "problem" | "solution" | "uvp" | "revenue" | "skill";
  content: string;
  sourceMessageId: string;
  confidence: number;
  createdAt: string;
}

export type StartupPath = "find" | "develop" | "grow";

export interface StartupPathOption {
  path: StartupPath;
  title: string;
  description: string;
  icon: string;
  greeting: string;
}
```

- [ ] **Step 2: Add chat data service functions to `lib/dataService.ts`**

Add these functions at the end of the file:

```typescript
// ============================================================
// CHAT MESSAGES
// ============================================================
export async function loadChatMessages(workspaceId: string): Promise<ChatMessageType[] | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("timestamp", { ascending: true });
  if (error || !data) return null;
  return data.map((m: any) => ({
    id: m.id,
    workspaceId: m.workspace_id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
    suggestionChips: m.suggestion_chips || [],
  }));
}

export async function saveChatMessage(msg: {
  id: string;
  workspaceId: string;
  role: "user" | "assistant";
  content: string;
  suggestionChips?: string[];
}): Promise<void> {
  await supabase.from("chat_messages").insert({
    id: msg.id,
    workspace_id: msg.workspaceId,
    role: msg.role,
    content: msg.content,
    timestamp: new Date().toISOString(),
    suggestion_chips: msg.suggestionChips || [],
  });
}

// ============================================================
// WORKSPACE INSIGHTS
// ============================================================
export async function loadWorkspaceInsights(workspaceId: string): Promise<WorkspaceInsight[] | null> {
  const { data, error } = await supabase
    .from("workspace_insights")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  if (error || !data) return null;
  return data.map((i: any) => ({
    id: i.id,
    workspaceId: i.workspace_id,
    type: i.type,
    content: i.content,
    sourceMessageId: i.source_message_id,
    confidence: i.confidence,
    createdAt: i.created_at,
  }));
}

export async function saveWorkspaceInsight(insight: {
  id: string;
  workspaceId: string;
  type: string;
  content: string;
  sourceMessageId: string;
  confidence: number;
}): Promise<void> {
  await supabase.from("workspace_insights").insert({
    id: insight.id,
    workspace_id: insight.workspaceId,
    type: insight.type,
    content: insight.content,
    source_message_id: insight.sourceMessageId,
    confidence: insight.confidence,
  });
}

export async function deleteWorkspaceInsight(id: string): Promise<void> {
  await supabase.from("workspace_insights").delete().eq("id", id);
}
```

Also add these imports at the top of `dataService.ts`:

```typescript
import type { ChatMessageType, WorkspaceInsight } from "./types";
```

- [ ] **Step 3: Commit types and data service**

```bash
git add lib/types.ts lib/dataService.ts
git commit -m "feat: add chat message and insight types + data service functions"
```

---

### Task 2: Supabase Tables

**Files:**
- No code files — run SQL against Supabase

- [ ] **Step 1: Create `chat_messages` table**

Run this SQL in the Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  suggestion_chips JSONB DEFAULT '[]'::jsonb
);

-- Index for fast loading by workspace
CREATE INDEX IF NOT EXISTS idx_chat_messages_workspace ON chat_messages(workspace_id, timestamp);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own workspace's messages
CREATE POLICY "Users can read own workspace chat messages"
  ON chat_messages FOR SELECT
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- Policy: users can insert messages into their own workspaces
CREATE POLICY "Users can insert own workspace chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
```

- [ ] **Step 2: Create `workspace_insights` table**

```sql
CREATE TABLE IF NOT EXISTS workspace_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('customer_segment', 'problem', 'solution', 'uvp', 'revenue', 'skill')),
  content TEXT NOT NULL,
  source_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_insights_workspace ON workspace_insights(workspace_id);

ALTER TABLE workspace_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workspace insights"
  ON workspace_insights FOR SELECT
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own workspace insights"
  ON workspace_insights FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own workspace insights"
  ON workspace_insights FOR DELETE
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
```

- [ ] **Step 3: Commit migration note**

```bash
git commit --allow-empty -m "chore: add Supabase migration for chat_messages and workspace_insights tables"
```

---

### Task 3: HVA System Prompt and Chat API

**Files:**
- Create: `app/api/chat/route.ts`

- [ ] **Step 1: Create the streaming chat API route**

Create `app/api/chat/route.ts`:

```typescript
import { NextRequest } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const BLUESMIND_KEY = process.env.BLUESMIND_API_KEY;
const BLUESMIND_URL = process.env.BLUESMIND_BASE_URL || process.env.BLUESMIND_API_URL || "https://api.bluesminds.com";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// ── HVA System Prompts ──────────────────────────────────────

const PATH_GREETINGS: Record<string, string> = {
  find: "I'm here to help you discover a business worth pursuing. I'd love to hear about your professional journey — what do you do, and what parts of your work excite you the most?",
  develop: "I'm here to help you shape your idea into something real. Tell me about the idea you've been thinking about — don't worry about perfection, just share what's on your mind.",
  grow: "I'm here to help you find your next growth lever. Tell me about your business — what do you offer, who are your customers, and where do you feel stuck?",
};

const PATH_TITLES: Record<string, string> = {
  find: "Finding Your Idea",
  develop: "Developing Your Idea",
  grow: "Growing Your Business",
};

function buildSystemPrompt(path: string): string {
  const greeting = PATH_GREETINGS[path] || PATH_GREETINGS.develop;
  return `You are HVA (Hipmipreneur Virtual Assistant), a world-class business strategist and startup advisor. You are having a one-on-one conversation with an aspiring entrepreneur.

## Your Identity
- Name: HVA (Hipmipreneur Virtual Assistant)
- Role: Strategic advisor who helps entrepreneurs discover, develop, and grow businesses
- Tone: Warm but direct. Professional but conversational. Like a brilliant mentor who genuinely cares.
- Language: English

## Your Current Mission
You are in the "${path}" phase. Your opening line should be:
"Hello! I'm HVA, your Hipmipreneur Virtual Assistant. ${greeting}"

## Behavioral Rules (CRITICAL — follow these always)

1. **NEVER accept surface-level answers.** When someone says "I want to build an app," ask: "What kind of app? For whom? What problem does it solve? Why do YOU care about this particular problem?"

2. **Probe with specificity.** "Small businesses" is not a segment. Push for: "Give me a specific person. What's their name, what do they do all day, what keeps them up at night?"

3. **Challenge assumptions.** If someone says "There's a big market for X," push back: "Big markets attract big competitors. What's your unfair angle? Why would someone choose YOU over the incumbent?"

4. **Connect dots across the conversation.** Reference things they said 5 messages ago. "You mentioned earlier that you're frustrated with Y — could that frustration itself be the business opportunity?"

5. **Confirm understanding before moving on.** "Let me make sure I'm hearing you right. You're saying [rephrase in your own words]. Is that accurate?"

6. **When they reject your suggestion, dig into why.** "Interesting — why does that not resonate with you? What part feels off? Help me understand what you're actually looking for."

7. **Recommend when you have enough context.** After 6-10 exchanges, start synthesizing: "Based on everything you've told me, I see a few directions that could work. Here's what I think makes the most sense for you..."

8. **Push for ONE clear direction.** Don't let the conversation stay vague. Your job is to help them nail down something specific.

## Conversation Phases
- **Discovery (messages 1-4):** Learn about their background, skills, what they care about
- **Problem Exploration (messages 5-10):** Identify real problems, pain points, frustrations
- **Idea Shaping (messages 8-15):** Connect problems to solutions, propose directions
- **Validation Pushback (messages 12-18):** Challenge the emerging idea, stress-test it
- **Synthesis (when ready):** Summarize clearly, present the refined direction

## Formatting
- Use short paragraphs (2-3 sentences max)
- Ask ONE question at a time — never multiple questions in one message
- Use bold for key terms they mentioned: "So the core problem is **inconsistent supply**"
- When presenting options, use numbered lists

## Important
- Do NOT role-play or break character
- Do NOT mention you are an AI, language model, or Claude
- Do NOT give generic startup advice — tailor everything to what THIS user has told you
- Keep responses concise — aim for 3-5 short paragraphs maximum per message
- Every message should end with a question or a prompt that moves the conversation forward`;
}

// ── Streaming helpers ────────────────────────────────────────

async function streamClaude(systemPrompt: string, messages: { role: string; content: string }[]) {
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText}`);
  }

  return response.body;
}

async function streamBluesMind(systemPrompt: string, messages: { role: string; content: string }[]) {
  if (!BLUESMIND_KEY) throw new Error("BLUESMIND_API_KEY not configured");

  const response = await fetch(`${BLUESMIND_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BLUESMIND_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`BluesMind error ${response.status}`);
  return response.body;
}

async function streamOpenRouter(systemPrompt: string, messages: { role: string; content: string }[]) {
  if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not configured");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "HTTP-Referer": "https://hipmipreneur.com",
      "X-Title": "Hipmipreneur",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error ${response.status}`);
  return response.body;
}

// ── Main handler ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, path, workspaceId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(path || "develop");

    // Try providers in order: Claude → BluesMind → OpenRouter
    let stream: ReadableStream<Uint8Array> | null = null;
    let provider = "none";

    for (const [name, fn] of [
      ["claude", () => streamClaude(systemPrompt, messages)],
      ["bluesmind", () => streamBluesMind(systemPrompt, messages)],
      ["openrouter", () => streamOpenRouter(systemPrompt, messages)],
    ] as const) {
      try {
        stream = await fn();
        provider = name;
        break;
      } catch (err) {
        console.warn(`${name} streaming failed:`, err instanceof Error ? err.message : err);
        continue;
      }
    }

    if (!stream) {
      return new Response(
        JSON.stringify({ error: "All AI providers are currently unavailable. Please try again." }),
        { status: 503 }
      );
    }

    // Transform stream to SSE format
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = stream!.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += new TextDecoder().decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || line.startsWith("event:")) continue;

              // Claude SSE format
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);

                  // Claude: content_block_delta with text
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    controller.enqueue(encoder.encode(parsed.delta.text));
                  }

                  // OpenAI-compatible: choices[0].delta.content
                  if (parsed.choices?.[0]?.delta?.content) {
                    controller.enqueue(encoder.encode(parsed.choices[0].delta.content));
                  }
                } catch {
                  // Non-JSON data line, skip
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream read error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-AI-Provider": provider,
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

- [ ] **Step 2: Commit chat API**

```bash
git add app/api/chat/route.ts
git commit -m "feat: add streaming chat API with Claude primary and BluesMind/OpenRouter fallback"
```

---

### Task 4: Insight Extraction API

**Files:**
- Create: `app/api/chat/extract/route.ts`

- [ ] **Step 1: Create the extraction endpoint**

Create `app/api/chat/extract/route.ts`:

```typescript
import { NextResponse } from "next/server";

const BLUESMIND_KEY = process.env.BLUESMIND_API_KEY;
const BLUESMIND_URL = process.env.BLUESMIND_BASE_URL || process.env.BLUESMIND_API_URL || "https://api.bluesminds.com";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  // Try BluesMind
  try {
    const res = await fetch(`${BLUESMIND_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${BLUESMIND_KEY}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (e) {
    console.warn("BluesMind extract failed:", e);
  }

  // Try OpenRouter
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_KEY}`, "HTTP-Referer": "https://hipmipreneur.com", "X-Title": "Hipmipreneur" },
      body: JSON.stringify({ model: "openrouter/free", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (e) {
    console.warn("OpenRouter extract failed:", e);
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { assistantMessage, conversationHistory, existingInsights } = await req.json();

    if (!assistantMessage) {
      return NextResponse.json({ error: "assistantMessage is required" }, { status: 400 });
    }

    const systemPrompt = `You are a business insight extraction engine. Analyze the AI assistant's latest message and the conversation history to identify any NEW business insights.

For each insight found, output a JSON object. If no new insights are found, output an empty array: []

Valid insight types:
- "customer_segment" — who the user wants to serve (specific personas, demographics)
- "problem" — pain points, frustrations, unmet needs
- "solution" — proposed solutions, product ideas, approaches
- "uvp" — unique value propositions, differentiators
- "revenue" — monetization models, pricing, revenue streams
- "skill" — user's skills, assets, competitive advantages

Rules:
- Only extract NEW insights not already captured in existingInsights
- Each insight must be a short, specific statement (1-2 sentences)
- Assign confidence 0.0-1.0 (how clearly the insight is stated)
- Output ONLY a valid JSON array, no markdown, no code blocks
- Maximum 3 insights per extraction pass`;

    const existingList = (existingInsights || []).map((i: { content: string }) => i.content).join("\n- ");

    const userPrompt = `Latest assistant message:
"""
${assistantMessage}
"""

Recent conversation context:
${conversationHistory.slice(-10).map((m: { role: string; content: string }) => `[${m.role}]: ${m.content}`).join("\n\n")}

Already extracted insights (skip these):
- ${existingList || "None yet"}

Extract any new insights from this exchange:`;

    const raw = await callLLM(systemPrompt, userPrompt);
    if (!raw) {
      return NextResponse.json({ insights: [] });
    }

    // Parse JSON from possibly markdown-wrapped response
    let cleaned = raw.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const insights = JSON.parse(cleaned);
    return NextResponse.json({ insights: Array.isArray(insights) ? insights : [] });
  } catch (err) {
    console.error("Extract API error:", err);
    return NextResponse.json({ insights: [] });
  }
}
```

- [ ] **Step 2: Commit extraction API**

```bash
git add app/api/chat/extract/route.ts
git commit -m "feat: add insight extraction API endpoint"
```

---

### Task 5: Dashboard Layout — Hide Chrome for Chat

**Files:**
- Modify: `app/dashboard/layout.tsx`

- [ ] **Step 1: Modify dashboard layout to detect chat pages and hide sidebar**

Replace the entire content of `app/dashboard/layout.tsx` with:

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SideNavBar } from "../../components/SideNavBar";
import { TopHeader } from "../../components/TopHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Chat pages get full-screen treatment (no sidebar, no header)
  const isChatPage = pathname.startsWith("/dashboard/chat");

  if (isChatPage) {
    return (
      <div className="h-screen bg-background text-on-surface font-body relative">
        {/* Subtle ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[15%] left-[25%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] bg-secondary/[0.03] rounded-full blur-[120px]"></div>
        </div>
        <main className="relative z-10 h-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-on-surface font-body relative flex">
      {/* Subtle ambient background — two soft blobs, no grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[15%] left-[25%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] bg-secondary/[0.03] rounded-full blur-[120px]"></div>
      </div>

      {/* Backdrop overlay for mobile menu drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Persistent left navigation / mobile drawer */}
      <SideNavBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col md:ml-[280px] relative z-10 min-w-0">
        {/* Top header navbar */}
        <TopHeader onMenuToggle={() => setIsMobileMenuOpen(true)} />

        {/* Dashboard inner canvas */}
        <main className="flex-1 pt-16 h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit layout change**

```bash
git add app/dashboard/layout.tsx
git commit -m "feat: hide sidebar/header on chat pages for full-screen experience"
```

---

### Task 6: Chat UI Components

**Files:**
- Create: `components/chat/ChatMessage.tsx`
- Create: `components/chat/ChatInput.tsx`
- Create: `components/chat/ChatHeader.tsx`
- Create: `components/chat/SuggestionChips.tsx`
- Create: `components/chat/InsightsPanel.tsx`

- [ ] **Step 1: Create ChatMessage component**

Create `components/chat/ChatMessage.tsx`:

```typescript
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
```

- [ ] **Step 2: Create ChatInput component**

Create `components/chat/ChatInput.tsx`:

```typescript
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
```

- [ ] **Step 3: Create ChatHeader component**

Create `components/chat/ChatHeader.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { InsightsPanel } from "./InsightsPanel";

interface ChatHeaderProps {
  pathLabel: string;
  insightCount: number;
  insights: { id: string; type: string; content: string }[];
}

export function ChatHeader({ pathLabel, insightCount, insights }: ChatHeaderProps) {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <header className="w-full h-14 border-b border-outline/30 bg-surface-container-low/20 backdrop-blur-md flex items-center justify-between px-4 shrink-0 relative z-20">
      {/* Left: back + title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/get-started"
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-medium cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="hidden sm:inline">My Startups</span>
        </Link>
        <span className="text-on-surface-variant/20">|</span>
        <span className="text-xs font-medium text-on-surface">{pathLabel}</span>
      </div>

      {/* Right: insights counter */}
      <button
        onClick={() => setShowInsights(!showInsights)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high/40 hover:bg-surface-container-high/70 border border-outline/30 text-xs text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm text-primary">lightbulb</span>
        <span>{insightCount} insight{insightCount !== 1 ? "s" : ""}</span>
      </button>

      {/* Insights dropdown */}
      {showInsights && (
        <InsightsPanel insights={insights} onClose={() => setShowInsights(false)} />
      )}
    </header>
  );
}
```

- [ ] **Step 4: Create SuggestionChips component**

Create `components/chat/SuggestionChips.tsx`:

```typescript
"use client";

import React from "react";

interface SuggestionChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ chips, onSelect, disabled }: SuggestionChipsProps) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 ml-11 max-w-3xl">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => !disabled && onSelect(chip)}
          disabled={disabled}
          className="px-3.5 py-1.5 rounded-full bg-surface-container-high/50 backdrop-blur-sm border border-outline/30 text-xs text-on-surface-variant hover:text-on-surface hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create InsightsPanel component**

Create `components/chat/InsightsPanel.tsx`:

```typescript
"use client";

import React from "react";

interface Insight {
  id: string;
  type: string;
  content: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  onClose: () => void;
}

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  customer_segment: { label: "Customer", icon: "group", color: "text-primary" },
  problem: { label: "Problem", icon: "crisis_alert", color: "text-error" },
  solution: { label: "Solution", icon: "lightbulb", color: "text-secondary" },
  uvp: { label: "UVP", icon: "star", color: "text-primary" },
  revenue: { label: "Revenue", icon: "payments", color: "text-secondary" },
  skill: { label: "Skill", icon: "workspace_premium", color: "text-on-surface-variant" },
};

export function InsightsPanel({ insights, onClose }: InsightsPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-4 top-full mt-2 z-40 w-80 max-h-96 overflow-y-auto bg-surface-container-high/80 backdrop-blur-xl border border-outline/40 rounded-xl shadow-2xl">
        <div className="p-3 border-b border-outline/30 flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface">Extracted Insights</span>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-2 flex flex-col gap-1">
          {insights.length === 0 ? (
            <p className="text-xs text-on-surface-variant p-3 text-center">No insights captured yet. Keep chatting with HVA!</p>
          ) : (
            insights.map((insight) => {
              const meta = TYPE_LABELS[insight.type] || TYPE_LABELS.skill;
              return (
                <div key={insight.id} className="p-2.5 rounded-lg bg-surface-container/50 border border-outline/20 flex items-start gap-2.5">
                  <span className={`material-symbols-outlined text-base shrink-0 mt-0.5 ${meta.color}`}>{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">{meta.label}</span>
                    <p className="text-xs text-on-surface mt-0.5 leading-relaxed">{insight.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 6: Commit all chat UI components**

```bash
git add components/chat/
git commit -m "feat: add chat UI components — message bubbles, input, header, insights panel, suggestion chips"
```

---

### Task 7: ChatContainer — Main Orchestrator

**Files:**
- Create: `components/chat/ChatContainer.tsx`

- [ ] **Step 1: Create the ChatContainer component**

Create `components/chat/ChatContainer.tsx`:

```typescript
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
```

- [ ] **Step 2: Commit ChatContainer**

```bash
git add components/chat/ChatContainer.tsx
git commit -m "feat: add ChatContainer orchestrator with streaming, history, and insight extraction"
```

---

### Task 8: Chat Page

**Files:**
- Create: `app/dashboard/chat/[workspaceId]/page.tsx`

- [ ] **Step 1: Create the chat page**

Create `app/dashboard/chat/[workspaceId]/page.tsx`:

```typescript
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ChatContainer } from "../../../../components/chat/ChatContainer";

export default function ChatPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  // Path from query param, default to "develop"
  // We'll read it from the workspace type instead
  // For now, use a simple approach — the path is embedded in the URL or workspace

  return (
    <div className="h-full">
      <ChatContainer workspaceId={workspaceId} path="develop" />
    </div>
  );
}
```

**Note:** The `path` will be dynamically resolved from the workspace type in Task 10 when we wire up the entry point. For now, this is functional.

- [ ] **Step 2: Commit chat page**

```bash
git add app/dashboard/chat/[workspaceId]/page.tsx
git commit -m "feat: add chat page with ChatContainer"
```

---

### Task 9: Three-Card Entry Point on Get-Started Page

**Files:**
- Modify: `app/dashboard/get-started/page.tsx`
- Modify: `context/WorkspaceContext.tsx`

- [ ] **Step 1: Add `createWorkspaceForChat` function to WorkspaceContext**

In `context/WorkspaceContext.tsx`, find the `createWorkspace` function and add a new convenience function after it:

```typescript
const createWorkspaceForChat = useCallback(
  (path: "find" | "develop" | "grow") => {
    const pathNames: Record<string, string> = {
      find: "Find my idea",
      develop: "Develop my idea",
      grow: "Grow my business",
    };
    const defaultNames: Record<string, string> = {
      find: "New Venture — Finding Ideas",
      develop: "New Venture — Developing Idea",
      grow: "New Venture — Growing Business",
    };

    const id = uid();
    const newWorkspace: Workspace = {
      id,
      name: defaultNames[path],
      description: "",
      credits: 5000,
      healthScore: 0,
      type: pathNames[path],
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    setWorkspaces((prev) => [...prev, newWorkspace]);
    setActiveWorkspaceId(id);

    // Persist to Supabase
    const userId = user?.id;
    if (userId) {
      ds.createWorkspaceInDb({
        ...newWorkspace,
        userId,
        onboardingCompleted: true,
      });
    }

    return id;
  },
  [user]
);
```

Then add `createWorkspaceForChat` to the context provider value. Find the `<WorkspaceContext.Provider value={{...}}>` line and add `createWorkspaceForChat` to the value object.

- [ ] **Step 2: Add 3-card startup creation section to get-started page**

In `app/dashboard/get-started/page.tsx`, add these imports at the top:

```typescript
import { useRouter } from "next/navigation";
```

Update the component destructuring to include `createWorkspaceForChat`:

```typescript
const { activeWorkspace, completedTasks, completeTask, uncompleteTask, createWorkspaceForChat } = useWorkspace();
```

Add the router hook:

```typescript
const router = useRouter();
```

Add the three-card section. Insert this block **after the closing `</header>` tag** and **before the `<div className="grid ...">` main grid**:

```tsx
{/* Startup Creation Cards */}
<section className="flex flex-col gap-4">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="font-headline text-lg font-bold text-on-surface">Create a new startup</h2>
      <p className="text-xs text-on-surface-variant mt-1">Choose your starting point and let HVA guide you.</p>
    </div>
    <div className="flex items-center gap-1.5 text-on-surface-variant/40">
      <span className="material-symbols-outlined text-sm">rocket_launch</span>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[
      {
        path: "find" as const,
        title: "Help me find an idea",
        description: "Explore promising directions with HVA and discover a business worth pursuing.",
        icon: "lightbulb",
        colorClass: "group-hover:border-primary/50",
        iconBg: "bg-primary/10 text-primary",
      },
      {
        path: "develop" as const,
        title: "Develop my idea",
        description: "Shape your existing concept into a validated business model with HVA's guidance.",
        icon: "build",
        colorClass: "group-hover:border-secondary/50",
        iconBg: "bg-secondary/10 text-secondary",
      },
      {
        path: "grow" as const,
        title: "Grow my business",
        description: "Identify growth opportunities and build go-to-market assets with HVA.",
        icon: "trending_up",
        colorClass: "group-hover:border-primary/50",
        iconBg: "bg-primary/10 text-primary",
      },
    ].map((card) => (
      <button
        key={card.path}
        onClick={() => {
          const wsId = createWorkspaceForChat(card.path);
          router.push(`/dashboard/chat/${wsId}?path=${card.path}`);
        }}
        className="glass-panel p-5 rounded-xl border border-outline/30 text-left flex flex-col gap-3 transition-all hover:shadow-lg hover:shadow-primary/5 group cursor-pointer"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg} transition-all group-hover:scale-110`}>
          <span className="material-symbols-outlined text-xl">{card.icon}</span>
        </div>
        <div>
          <h3 className="font-headline text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
            {card.title}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed line-clamp-3">
            {card.description}
          </p>
        </div>
        <div className="flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
          <span>Start with HVA</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </div>
      </button>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Commit entry point UI**

```bash
git add app/dashboard/get-started/page.tsx context/WorkspaceContext.tsx
git commit -m "feat: add 3-card startup creation entry point on get-started page"
```

---

### Task 10: Wire Up Chat Page with Dynamic Path

**Files:**
- Modify: `app/dashboard/chat/[workspaceId]/page.tsx`

- [ ] **Step 1: Update chat page to read path from URL and workspace**

Replace `app/dashboard/chat/[workspaceId]/page.tsx` with:

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChatContainer } from "../../../../components/chat/ChatContainer";
import { useWorkspace } from "../../../../context/WorkspaceContext";
import type { StartupPath } from "../../../../lib/types";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = params.workspaceId as string;
  const { activeWorkspace } = useWorkspace();

  const [path, setPath] = useState<StartupPath>("develop");

  useEffect(() => {
    // Priority 1: URL query param
    const queryPath = searchParams.get("path");
    if (queryPath && ["find", "develop", "grow"].includes(queryPath)) {
      setPath(queryPath as StartupPath);
      return;
    }

    // Priority 2: Workspace type mapping
    if (activeWorkspace?.type) {
      const typeMap: Record<string, StartupPath> = {
        "Find my idea": "find",
        "Develop my idea": "develop",
        "Grow my business": "grow",
      };
      const mapped = typeMap[activeWorkspace.type];
      if (mapped) {
        setPath(mapped);
      }
    }
  }, [searchParams, activeWorkspace]);

  return (
    <div className="h-full">
      <ChatContainer workspaceId={workspaceId} path={path} />
    </div>
  );
}
```

- [ ] **Step 2: Commit dynamic path wiring**

```bash
git add app/dashboard/chat/[workspaceId]/page.tsx
git commit -m "feat: wire chat page to dynamic path from URL and workspace type"
```

---

### Task 11: Onboarding Redirect

**Files:**
- Modify: `app/onboarding/page.tsx`

- [ ] **Step 1: Simplify onboarding to redirect directly to dashboard**

Replace the content of `app/onboarding/page.tsx` with a minimal page that creates a default workspace and redirects:

```typescript
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "@clerk/nextjs";

export default function OnboardingPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { workspaces, createWorkspace, completeOnboarding } = useWorkspace();

  useEffect(() => {
    // If user already has workspaces, skip onboarding
    if (workspaces && workspaces.length > 0) {
      completeOnboarding();
      router.replace("/dashboard/get-started");
      return;
    }

    // Create a default workspace and go to dashboard
    if (userId && workspaces !== null) {
      createWorkspace("My First Venture", "", "Develop my idea");
      completeOnboarding();
      router.replace("/dashboard/get-started");
    }
  }, [userId, workspaces, createWorkspace, completeOnboarding, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm text-on-surface-variant">Setting up your workspace...</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit onboarding redirect**

```bash
git add app/onboarding/page.tsx
git commit -m "feat: simplify onboarding to auto-create workspace and redirect to dashboard"
```

---

### Task 12: Environment Variable Setup

- [ ] **Step 1: Add ANTHROPIC_API_KEY to environment**

Add `ANTHROPIC_API_KEY` to the project's `.env.local` file (create if needed):

```
ANTROPIC_API_KEY=sk-ant-...
```

The existing `.env.local` should already have `BLUESMIND_API_KEY`, `BLUESMIND_BASE_URL`, `OPENROUTER_API_KEY`, and the Supabase credentials.

- [ ] **Step 2: Verify all required env vars are present**

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
BLUESMIND_API_KEY=
BLUESMIND_BASE_URL=
OPENROUTER_API_KEY=
```

---

### Task 13: Manual Testing Checklist

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test the complete flow**

1. Open the app in browser, sign in (or create account)
2. Verify onboarding creates a default workspace and redirects to `/dashboard/get-started`
3. Verify the 3-card "Create a new startup" section appears at the top of get-started
4. Click "Help me find an idea" → verify it creates a new workspace and redirects to `/dashboard/chat/[id]?path=find`
5. Verify HVA sends the correct greeting message for the "find" path
6. Type a message → verify HVA responds with streaming text
7. Verify suggestion chips appear below HVA's first message
8. Click a suggestion chip → verify it sends as a user message
9. Have a 4-5 exchange conversation → verify the insights counter updates
10. Click the insights counter → verify the panel shows extracted insights
11. Click "← My Startups" → verify it returns to get-started
12. Verify the new workspace appears in the workspace dropdown
13. Navigate back to the chat → verify conversation history is preserved
14. Click "Develop my idea" and "Grow my business" → verify different greetings and paths
15. Test on mobile viewport → verify responsive layout (no sidebar, full-screen chat)

- [ ] **Step 3: Test error handling**

1. Test with no internet → verify graceful error message
2. Test with Claude API key missing → verify BluesMind fallback works
3. Test very long messages → verify input textarea scrolls properly

---

### Task 14: Final Commit and Polish

- [ ] **Step 1: Final review — check all files compile**

```bash
npm run build
```

Fix any TypeScript or build errors.

- [ ] **Step 2: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build issues from HVA chat integration"
```

- [ ] **Step 3: Tag the feature**

```bash
git tag -a v0.2.0-hva-chat -m "HVA Chat-First Startup Experience"
```
