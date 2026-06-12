# HVA Chat-First Startup Experience

**Date:** 2026-06-12
**Scope:** Replace form-based onboarding with conversational AI chat that creates workspaces through dialogue

## Problem

The current onboarding flow requires users to fill out a form (venture name + description + path selection) before they even know what their startup is. Users who choose "Find my idea" don't have an idea yet — asking them for a venture name is putting the cart before the horse.

The existing AI integration is action-based (extract canvas, generate interviews) — there is no conversational chat interface. Users cannot have a natural dialogue with the AI to discover and refine their business idea.

## Solution: Chat-First with Progressive Workspace

Transform the startup creation into a chat experience where **HVA (Hipmipreneur Virtual Assistant)** guides the user through deep, probing conversation. The AI uncovers what the user truly wants — even if the user doesn't know it yet — and silently extracts business elements along the way.

## Flow

### Step 1: Three-Card Entry Point

Replace the current `/onboarding` form with a "My Startups" page showing 3 cards:

| Card | Title | Description | Path |
|------|-------|-------------|------|
| 💡 | Help me find an idea | Explore promising directions with HVA and discover a business worth pursuing | `find` |
| 📈 | Develop my idea | Shape your existing concept into a validated business model with HVA's guidance | `develop` |
| 🚀 | Grow my business | Identify growth opportunities and build go-to-market assets with HVA | `grow` |

- Cards appear in the existing dashboard layout, replacing the current "Create a new startup" section
- Clicking a card creates a workspace immediately (auto-named based on path, e.g. "New Venture — Finding Ideas") and redirects to the chat page
- No form to fill out — the venture name gets refined during the conversation

### Step 2: Chat Page (`/dashboard/chat/[workspaceId]`)

Full-screen chat experience. Sidebar hidden. Clean, focused, no distractions.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ← My Startups   "Finding Your Idea"    💡 4    │  Header (glass)
├─────────────────────────────────────────────────┤
│                                                 │
│  [HVA avatar]                                   │
│  HVA message (streamed)...                      │
│                                                 │
│              ┌──────────────────────┐            │
│              │ User message         │            │
│              └──────────────────────┘            │
│                                                 │
│  [HVA avatar]                                   │
│  HVA follow-up (streamed)...                    │
│                                                 │
│  [Suggestion chips: "Option A" "Option B"]      │
│                                                 │
├─────────────────────────────────────────────────┤
│  📎  🎤  [Type a message...          ]  ▶       │  Input bar (glass)
└─────────────────────────────────────────────────┘
```

**Components:**
- `ChatHeader` — Back link, path label, insights counter badge
- `ChatMessage` — AI and user message bubbles (glass style)
- `ChatInput` — Text input + attach + voice + send
- `SuggestionChips` — Optional quick-reply chips below AI messages
- `InsightsPanel` — Dropdown showing extracted business insights in real-time

### Step 3: HVA Conversation Behavior

HVA's personality is the soul of this feature. The AI must:

1. **Probe deeply** — Never accept surface answers. Ask "Why?" and "Can you give me a specific example?"
2. **Challenge assumptions** — "That's a crowded space. What makes you think you can do it differently?"
3. **Connect dots** — "Earlier you mentioned frustration with X. Could that be the opportunity itself?"
4. **Confirm understanding** — "Let me make sure I'm hearing you right. You're saying [rephrase]. Is that accurate?"
5. **Push for specificity** — "What kind of people? Not 'small businesses' — give me a real person you imagine using this."
6. **Recommend** — When enough context is gathered, suggest specific directions with reasoning

**Conversation phases** (tracked internally via system prompt, not shown to user):

| Phase | Focus | Approx. exchanges |
|-------|-------|-------------------|
| Discovery | Background, skills, passions, frustrations | 3-5 |
| Problem exploration | What problems exist? Which hurt most? | 4-8 |
| Idea shaping | Connect problems to potential solutions | 4-8 |
| Validation pushback | Challenge the idea — is it real? | 2-4 |
| Synthesis | Summarize, present refined direction | 2-3 |

**Path-specific first messages:**

- **find**: "Hello! I'm HVA, your Hipmipreneur Virtual Assistant. I'm here to help you discover a business worth pursuing. I'd love to hear about your professional journey — what do you do, and what parts of your work excite you the most?"
- **develop**: "Hello! I'm HVA, your Hipmipreneur Virtual Assistant. I'm here to help you shape your idea into something real. Tell me about the idea you've been thinking about — don't worry about perfection, just share what's on your mind."
- **grow**: "Hello! I'm HVA, your Hipmipreneur Virtual Assistant. I'm here to help you find your next growth lever. Tell me about your business — what do you offer, who are your customers, and where do you feel stuck?"

### Step 4: Real-Time Extraction

As the conversation flows, HVA's responses are post-processed to extract key business elements:

| Element | Detection Pattern |
|---------|-------------------|
| Customer segment | User describes who they want to serve |
| Problem | User expresses frustration or pain point |
| Solution concept | User describes an idea or approach |
| Unique value prop | User states what makes it different |
| Revenue model | User mentions monetization |
| Skills/assets | User describes their background advantages |

**Implementation:** After each AI response, a lightweight extraction pass runs server-side, identifying and saving any new insights to `workspace_insights` table. The insights counter in the header updates live.

### Step 5: Conversation Conclusion

When HVA determines sufficient clarity (based on conversation length + extracted insight count + natural language signals), it:

1. Presents a summary: "Here's what I've understood about your venture..."
2. Shows extracted business elements for user review
3. Asks: "Does this capture your vision? Want me to adjust anything?"
4. On confirmation: Updates workspace name from auto-generated to a meaningful name based on the conversation
5. Populates a draft Lean Canvas from extracted insights
6. Shows a "Continue to Dashboard" button that leads to `/dashboard/get-started`

If the user doesn't reach natural conclusion, they can always click "Back to My Startups" and return later — conversation persists.

## Technical Architecture

### New Files

```
app/dashboard/chat/[workspaceId]/page.tsx    — Chat page (full-screen)
app/api/chat/route.ts                         — Streaming chat API
app/api/chat/history/route.ts                 — Chat history CRUD (load/save)
app/api/chat/extract/route.ts                 — Insight extraction endpoint
components/chat/ChatContainer.tsx              — Main chat orchestrator
components/chat/ChatMessage.tsx                — Single message bubble
components/chat/ChatInput.tsx                  — Input bar with attachments
components/chat/ChatHeader.tsx                — Header with back + insights
components/chat/InsightsPanel.tsx              — Extracted insights dropdown
components/chat/SuggestionChips.tsx           — Quick reply options
```

### Modified Files

```
app/dashboard/get-started/page.tsx             — Add 3-card creation section at top
app/onboarding/page.tsx                       — Simplify or redirect to dashboard
lib/types.ts                                   — Add chat/insight type definitions
lib/dataService.ts                             — Add chat/insight CRUD operations
context/WorkspaceContext.tsx                   — Add chat state management
```

### Chat API (`/api/chat`)

**Request:** POST
```json
{
  "messages": [{"role": "user", "content": "..."}],
  "path": "find|develop|grow",
  "workspaceId": "uuid",
  "existingInsights": ["..."]
}
```

**Response:** Server-Sent Events (SSE) streaming
- Each chunk is a text delta streamed to the client
- After stream completes, a separate extraction pass runs asynchronously

**AI Provider:** Claude (Anthropic Messages API) with streaming — superior at nuanced multi-turn conversation with consistent persona adherence.
**Fallback:** BluesMind/OpenRouter (existing `callLLM` pattern) if Claude is unavailable.

### HVA System Prompt

The system prompt is constructed server-side based on the `path` parameter. It defines:
- HVA's identity and role
- The conversation phase framework
- Behavioral rules (probe, challenge, confirm, recommend)
- Language: English (configurable later)
- Extraction instructions (tag business elements in internal thinking, not shown to user)
- Conversation length guidance (know when to wrap up)

### Data Model (New Supabase Tables)

**`chat_messages`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| workspace_id | uuid | FK to workspaces |
| role | enum | `user` or `assistant` |
| content | text | Message content |
| timestamp | timestamptz | When sent |
| extraction_tags | jsonb | Tags for extracted insights (e.g. `["customer_segment", "problem"]`) |

**`workspace_insights`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| workspace_id | uuid | FK to workspaces |
| type | enum | `customer_segment`, `problem`, `solution`, `uvp`, `revenue`, `skill` |
| content | text | The extracted insight text |
| source_message_id | uuid | FK to chat_messages |
| confidence | float | 0-1 confidence score |
| created_at | timestamptz | When extracted |

### Design Style

Warm Glass dark theme — consistent with the app's current visual direction. Glassmorphism panels, purple/indigo accents, soft blurs. Uses existing CSS custom properties from the Warm Glass redesign spec.

### Credit Cost

Chat messages will cost **10 credits per exchange** (user message + AI response). This is sustainable with the default 5000 starting credits (allows ~500 exchanges, more than enough for a deep conversation).

## Out of Scope

- Voice input/output (UI element present but non-functional for MVP)
- File upload in chat (UI element present but non-functional for MVP)
- Multi-language support (English only for MVP)
- Chat history search
- Branching conversations
- Multiple chat sessions per workspace
