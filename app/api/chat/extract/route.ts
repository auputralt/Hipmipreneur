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
