import { NextResponse } from "next/server";

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const BLUESMIND_KEY = process.env.BLUESMIND_API_KEY;
const BLUESMIND_URL = process.env.BLUESMIND_API_URL || "https://api.bluesminds.com";

// Helper to extract JSON content even if wrapped in markdown code blocks
function cleanAndParseJSON(text: string) {
  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  cleanText = cleanText.trim();
  return JSON.parse(cleanText);
}

async function callLLM(systemPrompt: string, userPrompt: string) {
  let errorMsg = "";

  // 1. Try OpenRouter (Primary)
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": "https://hipmipreneur.com",
        "X-Title": "Hipmipreneur"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    } else {
      errorMsg = `OpenRouter returned status ${response.status}: ${await response.text()}`;
      console.warn("OpenRouter failed, falling back to BluesMind:", errorMsg);
    }
  } catch (e: any) {
    errorMsg = `OpenRouter error: ${e?.message || e}`;
    console.warn("OpenRouter failed, falling back to BluesMind:", errorMsg);
  }

  // 2. Try BluesMind (Fallback)
  try {
    const response = await fetch(`${BLUESMIND_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BLUESMIND_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    } else {
      throw new Error(`BluesMind returned status ${response.status}: ${await response.text()}`);
    }
  } catch (e: any) {
    throw new Error(`Both LLM providers failed. Primary error: ${errorMsg}. Secondary error: ${e?.message || e}`);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "extract-canvas": {
        systemPrompt = `You are IVA (Hipmipreneur Virtual Assistant), an expert startup co-founder and business consultant specialized in the Indonesian market.
Your task is to extract a structured Lean Canvas from the user's raw startup idea.
Respond ONLY with a valid JSON object in Indonesian. Do NOT include markdown formatting, markdown code blocks, or conversational filler.
The JSON must have precisely the following structure:
{
  "customerSegments": "string (indonesian description of target customer segments)",
  "problem": "string (bullet points of 1-3 core customer problems, separated by newlines)",
  "uvp": "string (the Unique Value Proposition summarizing the main promise)",
  "solution": "string (how the product resolves the UVP and problems)",
  "channels": "string (marketing and distribution channels)",
  "revenueStreams": "string (monetization model and price estimation in Rupiah)",
  "costStructure": "string (primary operational expenditures)",
  "keyMetrics": "string (1-3 key metrics to track progress)",
  "unfairAdvantage": "string (what makes this venture extremely hard to copy)"
}`;
        userPrompt = `Extract the Lean Canvas for the following startup description:
"${data.rawInput}"`;
        break;
      }

      case "generate-interviews": {
        systemPrompt = `You are IVA (Hipmipreneur Virtual Assistant), an expert customer development interviewer.
Your task is to generate realistic, detailed, high-quality simulated interview transcripts (synthetic interviews) based on the startup's Lean Canvas and research parameters.
Respond ONLY with a valid JSON array of objects. Do NOT include markdown code block wrappers or conversational filler.
The array must contain exactly the number of interviews requested by 'count'.
Each interview object in the JSON array must have precisely this structure:
{
  "respondentName": "string (realistic Indonesian name)",
  "jobRole": "string (job title matching the target customer segment)",
  "transcriptText": "string (a highly detailed, word-for-word conversational transcript between 'IVA' and the respondent. IVA asks open-ended discovery questions based on the problem, and the respondent gives authentic, detailed, and slightly raw answers about their frustrations, triggers, and current workarounds. Use a mix of formal Indonesian and local colloquialisms if appropriate for their persona, e.g. using 'saya', 'kami', or 'kami merasa')",
  "qualityScore": "number (an integer between 80 and 99 representing transcript depth)",
  "scriptCoveragePct": "number (an integer between 85 and 100 representing how well it covered the research scope)"
}`;
        userPrompt = `Generate exactly ${data.count} synthetic interviews.
Workspace Lean Canvas details:
- Customer Segments: ${data.canvas.customerSegments}
- Problems: ${data.canvas.problem}
- Unique Value Proposition: ${data.canvas.uvp}
- Solution: ${data.canvas.solution}

Research Project:
- Name: ${data.projectName}
- Target Segment: ${data.segmentName} (${data.segmentDesc})
- Research Type: ${data.researchType}`;
        break;
      }

      case "synthesize-insights": {
        systemPrompt = `You are IVA (Hipmipreneur Virtual Assistant), a data analyst specializing in qualitative research analysis.
Your task is to synthesize and cluster the findings from multiple customer interview transcripts into structured insight categories.
Respond ONLY with a valid JSON object. Do NOT include markdown formatting or conversational filler.
The JSON must have precisely the following structure:
{
  "qualityScore": "number (integer between 70 and 100 based on validation signal)",
  "qualityDetails": "string (detailed paragraph evaluating validation, interview counts, and key behavioral trends)",
  "categories": [
    {
      "name": "string (must be one of these exact categories: 'Jobs-to-be-Done (JTBD)', 'Triggering Events (Pemicu)', 'Desired Outcome (Hasil yang Diharapkan)', 'Solution Search and Evaluation', 'Experience of Using the Chosen Solution')",
      "insights": [
        {
          "title": "string (short 3-5 word title of the pattern)",
          "pct": "number (integer representing percentage of interviewees who experienced this, e.g., 75)",
          "count": "number (integer count of supporting interviews, e.g., 3)",
          "description": "string (detailed description explaining the pain point or behavior observed)"
        }
      ]
    }
  ]
}`;
        userPrompt = `Synthesize these interview transcripts for the research project "${data.projectName}".
Lean Canvas Context:
- UVP: ${data.canvas.uvp}
- Problems: ${data.canvas.problem}

Completed Interviews:
${data.interviews.map((int: any, idx: number) => `
--- INTERVIEW #${idx + 1} ---
Respondent: ${int.respondentName} (${int.jobRole})
Transcript:
${int.transcriptText}
`).join("\n")}`;
        break;
      }

      case "generate-persona": {
        systemPrompt = `You are IVA (Hipmipreneur Virtual Assistant), a product marketing manager.
Your task is to construct a detailed, dynamic buyer persona profile based on the startup's Lean Canvas and research insights.
Respond ONLY with a valid JSON object in Indonesian. Do NOT include markdown formatting or conversational filler.
The JSON must have precisely this structure:
{
  "name": "string (appropriate Indonesian first name)",
  "archetype": "string (archetype label, e.g., 'The Tech-Forward Factory Owner')",
  "summary": "string (1-2 paragraph description summarizing their background, day-to-day workflow, and business challenges)",
  "coreQuote": "string (a realistic quote encapsulating their primary frustration in their own words)",
  "avatarUrl": "string (use a high-quality portrait photo URL from unsplash. Choose a professional profile, e.g., https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop for male, or https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop for female)",
  "ageRange": "string (e.g. '28-35')",
  "jobRoles": "string (job titles)",
  "priorityInitiatives": "array of 3 strings (top operational goals they want to achieve)",
  "keyPains": "array of 3 strings (their biggest frustrations related to the business model)",
  "desiredOutcomes": "array of 3 strings (what success looks like for them)",
  "decisionMaking": "array of 3 strings (how they buy products, who they consult, budget approval processes)",
  "evaluationCriteria": "array of 3 strings (technical/business criteria they look at when comparing options)",
  "messagingAngles": "array of 2 strings (short marketing hook titles that would grab their attention)"
}`;
        userPrompt = `Generate a buyer persona for the customer segment: "${data.segmentName}" (${data.segmentDesc}).
Lean Canvas context:
- Problems: ${data.canvas.problem}
- UVP: ${data.canvas.uvp}
- Solution: ${data.canvas.solution}

Research Insights Context:
${JSON.stringify(data.insights || {})}`;
        break;
      }

      case "generate-positioning": {
        systemPrompt = `You are IVA (Hipmipreneur Virtual Assistant), a positioning and branding strategist.
Your task is to write a comprehensive positioning and messaging guide for a startup based on its Lean Canvas and target buyer persona.
Respond ONLY with a valid JSON object in Indonesian. Do NOT include markdown formatting or conversational filler.
The JSON must have precisely this structure:
{
  "corePositioning": "string (a standard elevator positioning statement matching this format: 'Untuk [Target Persona] yang mengalami [Masalah Utama], [Nama Produk/Workspace] adalah [Kategori Produk] yang menyediakan [UVP]. Berbeda dengan [Kompetitor/Alternatif], kami [Unfair Advantage/Pembeda].')",
  "targetAudience": "string (detailed description of primary buyer roles and secondary stakeholders)",
  "marketContext": "string (current market category and статус quo inefficiencies)",
  "uvp": "string (unique value proposition)",
  "brandVoice": "string (3-4 comma-separated brand personality traits, e.g., 'Merakyat, Solutif, Jujur, Transparan')",
  "reasonsToBelieve": "array of 3 strings (concrete proof points or features that justify the positioning)",
  "messagingPillars": "array of 3 objects, each representing a pillar: { \"title\": \"string (short title)\", \"body\": \"string (detailed copy explanation)\" }",
  "elevatorPitch": "string (2-3 sentence high-impact elevator pitch summarizing the UVP, problem, and results)"
}`;
        userPrompt = `Generate a positioning and messaging guide.
Workspace Name: ${data.workspaceName}
Lean Canvas context:
- UVP: ${data.canvas.uvp}
- Problems: ${data.canvas.problem}
- Solution: ${data.canvas.solution}
- Unfair Advantage: ${data.canvas.unfairAdvantage}

Target Buyer Persona:
- Name: ${data.persona.name} (${data.persona.archetype})
- Pains: ${data.persona.keyPains.join(", ")}
- Desired Outcomes: ${data.persona.desiredOutcomes.join(", ")}`;
        break;
      }

      case "generate-landing-page": {
        systemPrompt = `You are IVA (Hipmipreneur Virtual Assistant), an expert landing page copywriter.
Your task is to generate high-converting landing page copy based on the startup's positioning and buyer persona.
Respond ONLY with a valid JSON object in Indonesian. Do NOT include markdown formatting or conversational filler.
The JSON must have precisely this structure:
{
  "heroHeadline": "string (powerful, benefit-driven headline addressing the persona's core pain)",
  "heroSubheadline": "string (clear subheadline explaining how the UVP works to deliver the desired outcome)",
  "ctaText": "string (strong call-to-action button text)",
  "features": "array of 3 objects, each representing a core feature: { \"title\": \"string (feature title)\", \"description\": \"string (concise explanation of value)\" }",
  "socialProof": "string (compelling social proof tag line or customer trust stats)",
  "faq": "array of 2 objects, each representing a FAQ item: { \"question\": \"string (common objection or query)\", \"answer\": \"string (persuasive response)\" }"
}`;
        userPrompt = `Generate landing page copy.
Lean Canvas UVP: ${data.canvas.uvp}
Target Persona: ${data.persona.name} (${data.persona.archetype})
Positioning Statement: ${data.positioning.corePositioning}
Elevator Pitch: ${data.positioning.elevatorPitch}
Messaging Pillars: ${JSON.stringify(data.positioning.messagingPillars)}`;
        break;
      }

      case "generate-sales-deck": {
        systemPrompt = `You are IVA (Hipmipreneur Virtual Assistant), a pitch deck designer and sales consultant.
Your task is to generate a structured 5-slide sales pitch outline optimized for the target persona.
Respond ONLY with a valid JSON object containing a slides array. Do NOT include markdown formatting or conversational filler.
The JSON must have precisely this structure:
{
  "slides": [
    {
      "title": "string (slide header)",
      "subtitle": "string (short subheading)",
      "bulletPoints": "array of 3 strings (main takeaways of this slide)",
      "notes": "string (presenter's spoken notes for this slide)"
    }
  ]
}`;
        userPrompt = `Generate a 5-slide sales deck outline.
Workspace Name: ${data.workspaceName}
Lean Canvas UVP: ${data.canvas.uvp}
Target Persona: ${data.persona.name} (${data.persona.archetype})
Positioning Guide: ${data.positioning.corePositioning}
Elevator Pitch: ${data.positioning.elevatorPitch}`;
        break;
      }

      default:
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    // Call the LLM with primary/fallback routing
    const textOutput = await callLLM(systemPrompt, userPrompt);
    const parsedData = cleanAndParseJSON(textOutput);

    return NextResponse.json(parsedData);
  } catch (err: any) {
    console.error("AI route error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
