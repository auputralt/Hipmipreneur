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
