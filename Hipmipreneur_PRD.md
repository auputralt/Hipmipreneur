# Product Requirements Document (PRD)
# Hipmipreneur — AI Co-Founder Platform for Indonesian Founders

**Version:** 1.0  
**Date:** June 2026  
**Owner:** Product Team  
**Status:** Draft — Ready for Developer Handoff

---

## 1. Executive Summary

Hipmipreneur is a web-based SaaS platform designed for Indonesian founders, startup teams, accelerators, incubators, and business consultants. It acts as an **AI Co-Founder** — guiding users from a raw idea through structured customer validation, buyer research, and automated go-to-market (GTM) asset generation.

The platform replaces gut-feel decisions with an evidence-driven workflow: users define their business model in a guided AI canvas, run customer interviews (AI-led, AI-assisted, or uploaded transcripts), get synthesized insights, and then generate high-quality GTM artifacts — buyer personas, positioning guides, landing pages, and sales pitch decks — in one click.

**Core promise:** *"Bangun dari riset, bukan dari asumsi."* (Build from research, not assumptions.)

**Target launch market:** Indonesia, with English-language UI and Indonesian Rupiah (IDR) pricing.

**Payment processing:** Midtrans (primary payment gateway), supporting Virtual Account (bank transfer), QRIS, GoPay, ShopeePay, and Credit/Debit Card.

---

## 2. Problem Statement

Most startup founders in Indonesia build products based on assumptions — they skip structured customer discovery because the process is slow, expensive, and technically complex. This leads to:

- Wasted development spend on features nobody wants
- Poor market positioning and messaging that fails to convert
- Weak pitch decks that do not survive investor scrutiny
- No repeatable process for validating new ideas or pivots

Hipmipreneur solves this by providing a structured, AI-powered workflow that compresses weeks of research into hours — then automatically converts those insights into launch-ready business artifacts.

---

## 3. Goals and Success Metrics

### 3.1 Business Goals

| Goal | Target (Year 1) |
|---|---|
| Registered workspaces | 2,000+ |
| Paid subscribers | 400+ |
| Monthly Recurring Revenue (MRR) | Rp 100,000,000+ |
| Workspace-to-paid conversion rate | ≥ 20% |
| Annual churn rate | ≤ 25% |

### 3.2 Product Success Metrics

| Metric | Definition |
|---|---|
| Workspace activation rate | % of new signups who complete Builder Task 1 within 7 days |
| Research launch rate | % of activated workspaces that start at least one research project |
| Interview completion rate | % of created interviews that reach "Completed" status |
| Asset generation rate | % of workspaces that generate at least one persona, landing page, or deck |
| Paid conversion from trial | % of free trial users who upgrade to a paid plan |
| Credit utilization rate | Average credits used per active workspace per month |

---

## 4. Product Principles

1. **Guided, stage-based workflow** — Users should never face a blank page; the platform always knows what step comes next.
2. **AI-first, human-editable** — AI generates strong first drafts; humans retain final control over all outputs.
3. **Research drives outputs** — No GTM asset should be generatable without underlying research; insights must feed downstream content.
4. **Context persistence** — Business model context from the canvas flows into every interview, insight, persona, and asset automatically.
5. **Credit transparency** — Users always know what they are spending credits on before they confirm an action.
6. **Indonesian-first monetization** — Pricing in IDR, payment methods suited to Indonesian users (QRIS, GoPay, Virtual Account), no FX risk.

---

## 5. Target Users and Personas

### 5.1 Primary User: The Data-Driven Founder

- **Role:** Founder, CEO, or CTO of an early-stage startup (pre-seed to seed)
- **Age range:** 22–38
- **Key pain:** Has ideas and passion but does not know how to systematically validate market demand or build a credible GTM story
- **Goal:** Make confident product and business decisions without wasting months or investor capital
- **Quote:** *"Saya perlu cara yang bisa diulang untuk memvalidasi ide sebelum menulis satu baris kode."*

### 5.2 Secondary Users

| Persona | Description | Primary Use Case |
|---|---|---|
| Product Manager | PM at growth-stage startup exploring new segments | Buyer persona research and messaging |
| Startup Consultant | Advisor or agency managing multiple client startups | Multi-workspace, asset generation for clients |
| Accelerator Mentor | HIPMI, Startup Studio, or incubator coach | Validating cohort startups, interview scripting |
| Business School Student | MBA/entrepreneurship student building a venture | Lean canvas, synthetic interviews, pitch deck |
| SME Owner | Existing business owner testing new revenue streams | Problem discovery research, positioning docs |

---

## 6. Information Architecture

The app is organized into a persistent left navigation with five major zones:

```
Left Navigation
├── Get Started
├── BUSINESS MODEL
│   ├── Canvas
│   └── Builder
├── VALIDATION
│   ├── Research
│   ├── Interviews
│   └── Scripts
├── GO-TO-MARKET
│   ├── Personas
│   ├── Positioning
│   ├── Landing Pages
│   └── Sales Decks
└── OPERATIONS
    ├── Analyses
    ├── Contacts
    ├── Calendar
    ├── Notes
    ├── Glossary
    └── Settings
```

The top header always shows:
- Active workspace name and switcher
- Invite button
- Help icon
- Notification bell
- User avatar/account menu

---

## 7. Core Features — Detailed Specification

### 7.1 Startup Workspace

**Description:** The primary organizational unit. Each workspace represents one startup, product, or business idea. All business model data, research, interviews, personas, and GTM assets live within a workspace.

**Functional requirements:**

- FR-1.1: User can create a new workspace by providing a name and optionally a description or URL.
- FR-1.2: User can switch between multiple workspaces from the header.
- FR-1.3: Workspace can be shared with collaborators with role-based access (Owner, Editor, Viewer).
- FR-1.4: Each workspace maintains independent credit usage tracking.
- FR-1.5: Workspace can be archived but not deleted (data retention).
- FR-1.6: Workspace has a "health" indicator showing how complete the business model and validation are.

**Multi-workspace access:** gated by subscription tier (see Section 12).

---

### 7.2 Get Started / Onboarding

**Description:** A guided onboarding experience that activates the workspace and connects the user to the right starting path.

**Functional requirements:**

- FR-2.1: After workspace creation, the user is prompted to choose a starting path:
  - *Develop my idea* — has an idea, wants to validate
  - *Find my idea* — no clear idea yet
  - *Grow my business* — existing business exploring new direction
- FR-2.2: Get Started page shows phase-by-phase progress:
  - Phase 1: Validate with AI (synthetic research)
  - Phase 2: Validate with Real Customers (real interviews)
  - Phase 3: Build Go-To-Market
- FR-2.3: Each phase expands to show sub-tasks with completion checkmarks.
- FR-2.4: Completed tasks show "Mark as complete" buttons; in-progress tasks show action buttons (e.g., "Review Canvas," "View Research").
- FR-2.5: A guide link appears alongside each phase contextually.
- FR-2.6: IVA (the AI agent) introduces itself and its role during onboarding.

---

### 7.3 AI Canvas (Business Model)

**Description:** A structured Lean Canvas that captures the core business model. This is the foundation that feeds all downstream features.

**Lean Canvas sections:**
1. Customer Segments
2. Problem
3. Unique Value Proposition (UVP)
4. Solution
5. Channels
6. Revenue Streams
7. Cost Structure
8. Key Metrics
9. Unfair Advantage

**Functional requirements:**

- FR-3.1: User can populate the canvas via free-text conversation with IVA, by pasting text, or by providing a URL.
- FR-3.2: IVA extracts and structures canvas data from unstructured input.
- FR-3.3: Each canvas section is independently editable after AI generation.
- FR-3.4: Canvas data is versioned — user can see change history per section.
- FR-3.5: Canvas is exportable as a Markdown (.md) file.
- FR-3.6: Canvas data flows automatically into interview scripts, personas, and positioning.
- FR-3.7: Each customer segment in the canvas becomes a selectable segment across the platform.

---

### 7.4 Builder (Step-by-Step Business Model Tasks)

**Description:** A visual, task-driven interface that walks the founder through building their business model component by component in a recommended sequence.

**Builder task sequence:**

| Task | Description | Trigger |
|---|---|---|
| Task 1 | Identify Initial Customer Segments and Customer Problems | Available immediately |
| Task 2 | Define Your Unique Value Proposition | After Task 1 |
| Task 3 | Define Initial Solution Delivering On Your UVP | After Task 2 |
| Task 4 | Determine Your Unfair Advantage | After Task 3 |
| Task 5 | Pick Your Initial Traction Channels | After Task 4 |
| Task 6 | Identify Your Revenue Streams | After Task 5 |
| Research Kickoff: Problem Discovery | Ready to Start Problem Discovery & Validation Research | After Task 2 |
| Research Kickoff: Buyer Persona | Ready to Start Buyer Persona Research | After Task 4 |

**Functional requirements:**

- FR-4.1: Each task renders in a full content view with IVA guidance at the top.
- FR-4.2: Each task includes an input area (list-type or form) and an AI suggestions panel on the right.
- FR-4.3: AI suggestions are personalized to the workspace context (industry, segments already defined).
- FR-4.4: "I'm ready with this task" button marks the task complete and unlocks the next.
- FR-4.5: Completed tasks display a checkmark icon in the Builder flow diagram.
- FR-4.6: User can return to any completed task to edit.
- FR-4.7: Builder renders a visual flow diagram showing task nodes, arrows, and research kickoff waypoints.
- FR-4.8: User's IVA avatar appears at their current task position in the flow.
- FR-4.9: Task guidance includes educational context ("The single necessary and sufficient condition for a business is a paying customer...").
- FR-4.10: Approximate time estimates appear per task (e.g., "30–60 min").

---

### 7.5 Research Module

**Description:** A hub for creating and managing research projects. Each research project is tied to a customer segment and a research type.

**Research types:**

| Type | Purpose |
|---|---|
| Validate customer problems | Discover whether the problem is real, important, and widespread |
| Understand my buyers | Uncover buyer decision-making to inform marketing and sales |
| Analyze won/lost deals | Learn why deals were won or lost to improve messaging and offering |

**Functional requirements:**

- FR-5.1: User can create a new research project by selecting a research type, naming the project, and selecting a customer segment.
- FR-5.2: Each research project shows four tabs: Overview, Interviews, Insights, Quality.
- FR-5.3: Overview tab shows:
  - Customer segment tag
  - Research type label
  - Total interviews count
  - Breakdown of not-started / in-progress / completed interviews
  - AI-led interview toggle with shareable link
  - Insights Summary preview
  - Quality Score summary
- FR-5.4: AI-led interview links can be toggled on/off and copied from the Overview tab.
- FR-5.5: User can add interviews via the "+ Add interviews" dropdown on any tab.
- FR-5.6: Research project can be edited via "Edit research" button.
- FR-5.7: Research project status badge shows "In progress" or "Completed."
- FR-5.8: Multiple research projects can exist per workspace and per segment.

---

### 7.6 Interview System

**Description:** The core data collection engine. Supports three interview modes and two respondent types.

#### 7.6.1 Respondent Types

| Type | Description |
|---|---|
| Synthetic | AI-simulated personas generated by IVA based on the Lean Canvas and segment definition. Results available in minutes. Best for early signal and directional validation. |
| Real | Actual humans sourced by the user. Accessed via shareable interview link or direct invitation. |

Synthetic respondents are labeled with a "Synthetic" badge throughout the UI.

#### 7.6.2 Interview Modes

**a) AI-Led Interviews (IVA conducts autonomously)**

- IVA conducts the full interview via a shareable link (text or voice)
- User shares the link; IVA handles questioning, follow-ups, and transcript
- Two link types: personalized (one respondent) or reusable (many respondents)
- Respondents access the interview from a public URL — no login required

**b) AI-Assisted Interviews (User conducts, IVA co-pilots)**

- User runs the live interview (e.g., Google Meet, in-person)
- IVA monitors the conversation in real time and suggests the next question
- IVA flags key moments and captures insights live
- Interview is tracked against the script with section-by-section completion tracking

**c) Uploaded Transcript Analysis**

- User uploads an existing interview transcript (text file or paste)
- IVA analyzes the transcript and extracts structured insights

#### 7.6.3 Functional Requirements

- FR-6.1: Interview record displays interviewee name, host (IVA or user), quality score, script coverage %, and interview date.
- FR-6.2: Interview quality score is calculated automatically after completion (e.g., 89% quality, 96% script coverage).
- FR-6.3: During AI-assisted interviews, IVA displays:
  - Interview script with section headers and question list
  - Completion checkmarks per question (green check = covered)
  - "WHAT IVA WOULD SAY NEXT" panel with suggested script and follow-up questions, numbered in sequence
  - Real-time transcript on the right panel
  - Notes area for the interviewer
  - Timer and completeness percentage in the header
  - "Finish Interview" button
- FR-6.4: AI-led interview (public link) shows:
  - Conversational chat interface
  - IVA avatar message bubbles
  - Voice input option (microphone icon)
  - Completeness percentage
  - Finish interview button
- FR-6.5: Script questions are organized into named sections with time estimates per section (e.g., "Look for Triggering Events (6 min) — 2/4").
- FR-6.6: IVA transcript view labels messages as: Script question, Follow-up question, or AI response.
- FR-6.7: Interviews list view shows filter tabs: Not started / In progress / Completed.
- FR-6.8: User can bulk-add synthetic respondents (e.g., generate 5 synthetic interviews).

---

### 7.7 Insight Analysis

**Description:** After interviews are completed, IVA synthesizes and clusters findings into structured insight categories.

**Insight categories:**

1. Insights Summary
2. Job-to-be-Done (JTBD)
3. Triggering Events
4. Desired Outcome
5. Actual Outcomes and Future Considerations
6. Solution Search and Evaluation
7. Experience of Using the Chosen Solution
8. Additional Insights (user-defined)

**Functional requirements:**

- FR-7.1: Insights tab shows a left-panel category list and a right-panel detail view.
- FR-7.2: Each insight category displays a count of supporting data points from completed interviews.
- FR-7.3: Within each category, individual insights are shown with:
  - Insight title
  - Supporting percentage (e.g., "86% (6 out of 7 interviewees)")
  - Detailed narrative description
  - "View details" link
- FR-7.4: Insights update automatically when new interviews are completed.
- FR-7.5: A Suggestions panel shows additional insight categories the user can add.
- FR-7.6: Insights are available even if only some interviews are completed (partial analysis).
- FR-7.7: Quality tab shows an overall quality score with written assessment and improvement suggestions.
- FR-7.8: Insights feed directly into persona generation, positioning, and GTM asset generation.

---

### 7.8 Buyer Persona

**Description:** A dynamic, research-backed profile of a customer segment that updates as more interviews are completed.

**Persona sections:**

- Name and archetype label (e.g., "Sofia — The Data-Driven Founder")
- Avatar / profile image (AI-generated)
- Summary description
- Core quote
- Customer segment tag
- Related research link
- Related assets count and link
- Profile: age range, job roles
- Priority Initiatives
- Key Pains and Frustrations
- Desired Outcomes (Success Factors)
- Decision-Making Process
- Solution Evaluation Criteria
- Messaging Angles

**Functional requirements:**

- FR-8.1: Persona is generated from completed buyer research.
- FR-8.2: Multiple personas can exist per workspace (one per segment).
- FR-8.3: Persona is editable after generation.
- FR-8.4: Persona updates automatically when additional research is added to the same segment.
- FR-8.5: Persona shows "Assets (N)" tab listing all artifacts generated for this persona.
- FR-8.6: "Generate assets" dropdown button allows direct creation of positioning, landing page, or sales deck from the persona view.
- FR-8.7: "Edit persona" button opens editable form.
- FR-8.8: Persona is exportable as Markdown.

---

### 7.9 Positioning and Messaging

**Description:** A complete positioning and messaging guide generated from persona and research data.

**Document sections:**

1. Core Positioning Statement (For/Who/Is/Unlike/We format)
2. Target Audience (primary persona, secondary influencers)
3. Market Context (category, competitive ladder, status quo failings)
4. Unique Value Proposition
5. Brand Voice and Personality
6. Reasons to Believe (RTBs)
7. Core Messaging Pillars
8. Elevator Pitch

**Functional requirements:**

- FR-9.1: Positioning doc is generated from buyer persona and underlying research.
- FR-9.2: Document is rendered in a rich-text editor with section navigation in the left sidebar.
- FR-9.3: Each section is independently editable with a formatting toolbar.
- FR-9.4: Document shows metadata panel on the right: asset type, buyer persona link, based-on research link, contributors, created date, last modified.
- FR-9.5: Document is regeneratable if persona data changes.
- FR-9.6: Document is exportable as Markdown.
- FR-9.7: Multiple positioning docs can exist per workspace (one per persona/segment).

---

### 7.10 Landing Page Generator

**Description:** Generates a complete draft landing page with copy, structure, and visual preview, based on the persona and positioning guide.

**Functional requirements:**

- FR-10.1: Landing page is generated from positioning and persona data.
- FR-10.2: Generated page renders as a live HTML preview inside the platform.
- FR-10.3: Preview header shows "Landing Page for [Persona Name]" and action buttons: Share, Edit in [External Builder], Regenerate preview.
- FR-10.4: Page sections include: hero headline, subheadline, body tagline, and CTA button.
- FR-10.5: Landing page copy targets the persona's core pain and desired outcome (e.g., "Your Roadmap is Based on Gut-Feel. Your Investors Know It.").
- FR-10.6: "Edit in [External Builder]" button integrates with Lovable, Framer, or similar (configurable).
- FR-10.7: "Regenerate preview" generates an alternative variation.
- FR-10.8: Share button provides a shareable preview link.
- FR-10.9: Multiple landing pages can be generated per persona.

---

### 7.11 Sales Deck Generator

**Description:** Generates a full sales pitch deck aligned with the persona's pain points, product value, and buying journey.

**Deck sections (default structure):**

1. Platform Introduction ("Stop Guessing. Start Proving.")
2. You Didn't Start This To Guess
3. The 'Trust Me' Era Is Over
4. Every Wrong Feature Burns Precious Resources
5. What If You Had a Data-Backed Map?
6. Your Real Enemy Hides In Plain Sight
7. Gut-Feel Doesn't Survive Investor Due Diligence
8. From Data Chaos to a Systematic Roadmap
9. Your Guided Path to Market Validation
10. The Proof Is in the Process
11. "This Is Our System for Certainty"
12. This Isn't a Beta. It's a Head Start.
13. Are you ready to build with certainty?

**Functional requirements:**

- FR-11.1: Sales deck is generated from positioning and persona data.
- FR-11.2: Deck is rendered in both slide view (visual) and document view (editable outline).
- FR-11.3: Document view shows full text content, bullet points, and presenter notes for each slide.
- FR-11.4: Left sidebar shows all slide section titles as navigation.
- FR-11.5: Right panel shows metadata: asset type, buyer persona, based-on source, contributors, timestamps.
- FR-11.6: Deck is regeneratable ("Regenerate slide deck" button).
- FR-11.7: Deck is downloadable (download icon in header).
- FR-11.8: Deck integrates with Google Slides for export.
- FR-11.9: Slide preview shows visual layout with title, bullets, and hero image per slide.

---

### 7.12 Interview Scripts

**Description:** Reusable templates and custom scripts that guide AI-led and AI-assisted interviews.

**Functional requirements:**

- FR-12.1: Scripts are generated automatically when a research project is created.
- FR-12.2: Scripts are organized into sections with time estimates per section.
- FR-12.3: Each section has a list of script questions.
- FR-12.4: Scripts are editable before interviews begin.
- FR-12.5: Custom script sections can be added by the user.
- FR-12.6: Scripts are versioned.

---

### 7.13 Contacts

**Description:** A lightweight CRM for managing interview respondents and outreach contacts.

**Functional requirements:**

- FR-13.1: User can add contacts manually.
- FR-13.2: LinkedIn import integration for bulk contact adding.
- FR-13.3: Contacts can be tagged to customer segments.
- FR-13.4: Contact records link to interview history.
- FR-13.5: Contact list is searchable and filterable.

---

### 7.14 Analyses, Notes, Calendar, Glossary

**Description:** Supporting productivity tools within the workspace.

- **Analyses:** Saved research summaries and cross-research comparisons.
- **Notes:** Free-form text notes attached to the workspace.
- **Calendar:** Schedule upcoming interviews and reminders.
- **Glossary:** Shared terminology definitions for the workspace team.

---

## 8. IVA — The AI Agent

IVA (Hipmipreneur Virtual Assistant) is the central AI intelligence layer of the platform. It is not a generic chatbot but a context-aware, workflow-aware co-founder agent.

### 8.1 IVA Capabilities

| Capability | Description |
|---|---|
| Business model extraction | Extracts Lean Canvas from unstructured input (text, URL, document) |
| Segment and problem suggestion | Suggests customer segments and problems based on context |
| Script generation | Creates interview scripts tailored to research type and segment |
| Synthetic interview simulation | Simulates realistic respondent answers based on persona profiles |
| Live interview co-pilot | Suggests next questions and flags key moments in real time |
| Insight synthesis | Clusters and quantifies patterns across all completed interviews |
| Persona generation | Builds a dynamic buyer persona from research data |
| Positioning generation | Writes a complete positioning and messaging guide |
| Landing page copy generation | Writes headline, subheadline, tagline, CTA, and page structure |
| Sales deck generation | Writes full deck content with presenter notes per slide |

### 8.2 IVA Context Model

IVA always has access to:
- The workspace's Lean Canvas
- Active customer segments
- Completed and in-progress interviews and transcripts
- Existing personas and positioning documents
- The user's current task and stage in the workflow

### 8.3 Credit Costs (Illustrative)

| Action | Estimated Credit Cost |
|---|---|
| Lean Canvas generation from input | 500 credits |
| Synthetic respondent interview (full) | 1,500 credits |
| AI-led interview (real respondent, full session) | 2,000 credits |
| Insight synthesis (per research project) | 1,000 credits |
| Persona generation | 1,500 credits |
| Positioning and messaging doc | 2,000 credits |
| Landing page generation | 2,000 credits |
| Sales deck generation | 3,000 credits |
| AI co-pilot suggestion (per prompt) | 50 credits |

*Credit costs are configurable in the admin panel. Final values should be determined based on actual LLM API cost per operation.*

---

## 9. User Flows

### Flow A: New Founder — Validate an Idea

```
1. Visit hipmipreneur.com → click "Mulai Gratis"
2. Register with email (no credit card required for trial)
3. Create first workspace → enter startup name and description
4. Choose starting path → "Develop my idea"
5. IVA prompts for idea input → user types or pastes description
6. IVA generates Lean Canvas → user reviews and edits
7. Builder Task 1: Define customer segments and problems
8. IVA suggests segments → user confirms or edits
9. Builder Task 2: Define UVP
10. Research Kickoff unlocks → user starts Problem Validation Research
11. Launch synthetic interviews → IVA generates 5 synthetic respondents
12. IVA conducts AI-led interviews automatically
13. Review completed interview list (7 interviews, all scored)
14. Open Insights tab → review Desired Outcomes, JTBD, Triggers
15. Proceed to Buyer Persona Research
16. Generate Buyer Persona
17. Generate Positioning and Messaging
18. Generate Landing Page → preview and share
19. Generate Sales Deck → review and download
```

### Flow B: Founder Runs Live Customer Interview

```
1. From Research project → click "+ Add interviews" → "Interview a real person"
2. System creates interview record with respondent name
3. Start interview session → AI-Assisted mode opens
4. Interviewer reads script question; IVA suggests what to say next
5. Conversation captured in real-time transcript
6. IVA marks questions as covered (green checkmarks)
7. "Finish Interview" → IVA calculates quality and script coverage scores
8. Interview added to completed list
9. Insights tab auto-updates with new data point percentages
```

### Flow C: Share AI-Led Interview Link

```
1. In Research project Overview → enable "AI-led interviews"
2. Copy shareable link
3. Distribute via email, WhatsApp, LinkedIn
4. Respondent opens link → IVA-led chat or voice interview begins
5. IVA conducts the full interview using the script
6. Transcript auto-saves to the platform
7. Interview appears in Completed list with quality score
8. Insights auto-update
```

### Flow D: Subscription and Payment (Midtrans)

```
1. User exhausts trial credits → upgrade prompt appears
2. User clicks "Upgrade" → billing page opens
3. User selects plan (Monthly / Annual)
4. Midtrans Snap UI opens → user chooses payment method:
   - QRIS (scan with any e-wallet)
   - GoPay / ShopeePay
   - Bank Transfer (Virtual Account: BCA, BNI, BRI, Mandiri, Permata)
   - Credit/Debit Card
5. User completes payment
6. Midtrans webhook confirms payment → workspace credits top up
7. Subscription record created → renewal date set
8. For recurring (monthly/annual), Midtrans recurring token stored
9. Auto-charge triggered on renewal date
10. User receives email receipt
```

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Requirement | Target |
|---|---|
| Page load time (first contentful paint) | < 2.0 seconds |
| AI generation response time (canvas, persona, positioning) | < 30 seconds |
| Interview synthesis time | < 60 seconds after all interviews completed |
| Landing page / deck generation | < 45 seconds |
| Uptime SLA | 99.5% monthly |

### 10.2 Security

- All user data encrypted at rest (AES-256) and in transit (TLS 1.3).
- PCI DSS compliance delegated entirely to Midtrans — the platform never stores card numbers or CVV.
- Midtrans tokenization used for all recurring charges.
- Workspace isolation enforced at database row level (no cross-workspace data leakage).
- JWT-based authentication with short-lived tokens and refresh rotation.
- GDPR-informed data handling (opt-in consent for data processing, export, and deletion).

### 10.3 Scalability

- AI generation jobs processed asynchronously via a task queue (e.g., BullMQ or equivalent).
- Generation status shown with loading indicators; no blocking UI.
- System should handle 10,000 concurrent workspaces without degraded performance.

### 10.4 Accessibility

- WCAG 2.1 AA compliance for all core user flows.
- Keyboard navigable.
- Minimum touch targets 44×44px for all interactive elements.

### 10.5 Localization

- UI language: Bahasa Indonesia and English (toggleable).
- All generated AI content: Bahasa Indonesia and English (user-selectable).
- Interview language support: Bahasa Indonesia, English, and optionally other languages in later phases.
- Currency: IDR (Indonesian Rupiah) throughout billing and pricing UI.

---

## 11. Monetization and Pricing

### 11.1 Pricing Philosophy

- Transparent IDR pricing with no hidden fees.
- Free trial with credit allowance — no credit card required.
- Credit-based AI usage within subscription caps.
- Multiple payment methods tailored to Indonesian users via Midtrans.

### 11.2 Subscription Plans

| Feature | Free Trial | Starter (Monthly) | Growth (Annual) | Pro |
|---|---|---|---|---|
| **Price** | Gratis | Rp 299.000/bulan | Rp 179.000/bulan (tagih tahunan Rp 2.148.000) | Rp 499.000/bulan |
| **Credits/month** | 5.000 | 20.000 | 20.000 + 30.000 bonus/tahun | 60.000 |
| **Workspaces** | 1 | 1 | 3 | Unlimited |
| **Synthetic interviews** | Up to 3 | Unlimited | Unlimited | Unlimited |
| **Real interviews** | Up to 5 | Unlimited | Unlimited | Unlimited |
| **Asset generation** | 1 per type | Unlimited | Unlimited | Unlimited |
| **Collaborators** | 0 | 1 | 3 | 10 |
| **Export (Markdown)** | ✗ | ✓ | ✓ | ✓ |
| **Multi-language interviews** | ✗ | ✗ | ✓ | ✓ |
| **Priority support** | ✗ | ✗ | ✓ | ✓ |
| **White-label interviews** | ✗ | ✗ | ✗ | ✓ |

*Pricing in IDR, exclusive of 11% PPN. Final pricing subject to market validation.*

### 11.3 Credit Top-Up (à la carte)

Users on any paid plan can purchase additional credits:

| Pack | Credits | Price (IDR) |
|---|---|---|
| Starter Pack | 10.000 | Rp 89.000 |
| Standard Pack | 30.000 | Rp 229.000 |
| Power Pack | 75.000 | Rp 499.000 |

### 11.4 Referral Program

- Referrer earns 10.000 bonus credits when a referred user starts their first paid subscription.
- Referee earns 5.000 bonus credits on first paid subscription.
- Managed via unique referral link per user.

---

## 12. Payment Integration — Midtrans

### 12.1 Why Midtrans

Midtrans is Indonesia's most complete payment gateway, offering 24+ payment methods with no setup fee and a simple per-transaction fee model. It supports recurring/subscription charges via tokenization and is PCI DSS Level 1 certified, making it the correct choice for a SaaS product targeting Indonesian founders.

### 12.2 Supported Payment Methods

| Method | Fee | Notes |
|---|---|---|
| Bank Transfer / Virtual Account (BCA, BNI, BRI, Mandiri, Permata) | Rp 4.000/transaksi | Most common for B2B; recommended for annual plans |
| QRIS | 0,7%/transaksi | Universal QR; works with all e-wallets |
| GoPay | 2%/transaksi | High adoption among founders |
| ShopeePay | 1,5%/transaksi | Growing adoption |
| Kartu Kredit/Debit (Visa, Mastercard, JCB, Amex) | 2,9% + Rp 2.000/transaksi | Required for recurring subscriptions |

*All fees exclude PPN (11%).*

### 12.3 Integration Method

**Midtrans Snap** (recommended for subscriptions and one-time payments):

- Frontend calls backend to create a Snap transaction token.
- Backend calls `POST /v1/transactions` to Midtrans API with order details.
- Snap.js opens the payment UI modal.
- User completes payment.
- Midtrans sends HTTP notification (webhook) to the platform's backend endpoint.
- Backend verifies the notification signature and updates subscription/credit status.

**Recurring Subscriptions:**

- Use Midtrans Recurring Token (credit/debit card only) or manual invoice for bank transfer.
- On first payment, save `saved_token_id` from Midtrans callback.
- On renewal date, trigger `POST /v2/charge` with the saved token (Core API).
- No customer interaction needed for renewal.
- For non-card methods (VA, QRIS, GoPay), send renewal invoice emails with fresh payment links.

### 12.4 Webhook and Event Handling

Backend must handle the following Midtrans notification types:

| Event | Platform Action |
|---|---|
| `payment_type: credit_card`, `transaction_status: capture` | Activate subscription, top up credits |
| `transaction_status: settlement` | Confirm bank transfer/QRIS/e-wallet payment, activate subscription |
| `transaction_status: expire` | Mark payment as expired, send retry email |
| `transaction_status: cancel` | Log cancellation, do not activate |
| `transaction_status: deny` | Log failure, prompt user to retry |
| Recurring charge success | Renew subscription period, top up credits |
| Recurring charge failure | Send payment failure email, provide manual payment link |

### 12.5 Billing Portal Features

- View current plan and next renewal date.
- View credit balance and usage history.
- Download payment receipts (auto-generated).
- Upgrade / downgrade plan.
- Cancel subscription.
- View invoices with Midtrans transaction IDs.
- Add/change payment method.

### 12.6 Tax Handling

Midtrans fees already account for PPN deduction. The platform should:
- Display all plan prices in IDR exclusive of PPN.
- Add a "PPN 11% applied on transaction fees" disclosure on the billing page.
- For invoices, show PPN breakdown per Midtrans standard.

---

## 13. Recommended Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15 + React 19 + Tailwind CSS v4 | SSR/SSG for marketing, CSR for app; used by the reference app |
| UI Components | Shadcn/ui + Radix UI | Accessible, headless, customizable |
| Backend | Next.js API Routes + Node.js service layer | Unified repo; easy deployment |
| Database | PostgreSQL + Prisma ORM | Relational for workspace/research data |
| Auth | Clerk or Supabase Auth | Email, Google login; JWT |
| AI/LLM | OpenAI GPT-4o (primary) + Anthropic Claude fallback | Quality for complex reasoning tasks |
| Vector DB | Pinecone or pgvector | Semantic search across interview transcripts |
| Job Queue | BullMQ (Redis-backed) | Async AI generation jobs |
| File Storage | AWS S3 or Cloudflare R2 | Transcripts, exports, generated assets |
| Payment | Midtrans Snap + Core API | Indonesian market; recurring subscriptions |
| Email | Resend or SendGrid | Transactional + marketing emails |
| Deployment | Vercel (frontend) + Railway/Fly.io (backend services) | Easy CI/CD |
| Monitoring | Sentry + Datadog | Error tracking and APM |
| Analytics | PostHog | Product analytics and feature flags |

---

## 14. Data Model (Core Entities)

```
User
├── id, email, name, avatar_url, created_at
└── has many: WorkspaceMemberships, CreditTransactions, Subscriptions

Workspace
├── id, name, description, owner_id, created_at
├── has one: LeanCanvas
├── has many: CustomerSegments, ResearchProjects, Personas, GtmAssets
└── has many (through WorkspaceMembership): Users

LeanCanvas
├── id, workspace_id
└── sections: customer_segments, problem, uvp, solution,
             channels, revenue_streams, cost_structure,
             key_metrics, unfair_advantage, version_history

CustomerSegment
├── id, workspace_id, name, color, description
└── belongs to: Workspace

ResearchProject
├── id, workspace_id, segment_id, type, name, status
├── has one: InterviewScript
├── has many: Interviews
└── has one: InsightReport

InterviewScript
├── id, research_project_id
└── sections: [{title, duration_min, questions: [{text, type}]}]

Interview
├── id, research_project_id, respondent_id, mode (ai_led | ai_assisted | upload)
├── is_synthetic: boolean
├── status (not_started | in_progress | completed)
├── quality_score, script_coverage_pct
├── transcript_text, interview_date
└── belongs to: Respondent

Respondent
├── id, workspace_id, name, email, job_role, is_synthetic
└── profile_data: JSON

InsightReport
├── id, research_project_id, generated_at
└── categories: [{name, insights: [{title, pct, count, description}]}]

Persona
├── id, workspace_id, segment_id, name, archetype
├── summary, core_quote, avatar_url
├── profile_data, priority_initiatives, key_pains, desired_outcomes,
    decision_making, evaluation_criteria, messaging_angles
└── version_history, export_md

GtmAsset
├── id, workspace_id, persona_id, type (positioning | landing_page | sales_deck)
├── content_json, generated_at, last_edited_at
└── export_url

Subscription
├── id, user_id, plan, status, billing_cycle
├── midtrans_recurring_token, current_period_start, current_period_end
└── cancelled_at

CreditLedger
├── id, workspace_id, action_type, credits_used, balance_after, created_at
└── belongs to: Workspace

Contact
├── id, workspace_id, name, email, linkedin_url, segment_id
└── interview_history: [Interview]
```

---

## 15. Build Phases

### Phase 1 — Core Validation Loop (Months 1–3)

**Goal:** Founder can create workspace, build canvas, run synthetic interviews, and see insights.

- Auth (email registration, login, password reset)
- Workspace creation and management
- IVA canvas extraction and editor
- Builder (Task 1–4 with AI suggestions)
- Research project creation
- Interview scripts
- Synthetic interviews (AI-generated respondents)
- AI-led interview (public link)
- Insight synthesis and display
- Basic admin dashboard
- Midtrans Snap integration (one-time payments)
- Free trial credit system

### Phase 2 — GTM Asset Generation (Months 3–5)

**Goal:** Founder can generate and download/share all GTM artifacts.

- Buyer Persona generation and editor
- Positioning and Messaging doc generation and editor
- Landing Page copy generation and preview
- Sales Deck generation, editor, and download
- Export to Markdown
- Get Started onboarding flow with progress tracking
- Subscription billing (monthly/annual plans)
- Midtrans recurring token for auto-renewal

### Phase 3 — Real Interviews and Collaboration (Months 5–7)

**Goal:** Support real customer interviews and team usage.

- AI-assisted live interview co-pilot
- Uploaded transcript analysis
- Contacts and LinkedIn import
- Multi-collaborator workspaces
- Workspace sharing and role management
- Notes, Calendar, Glossary modules
- Credit top-up store
- Referral program

### Phase 4 — Scale and Polish (Months 7–9)

**Goal:** Localization, multi-language interviews, Pro tier.

- Bahasa Indonesia UI localization
- Multi-language interview support (Bahasa Indonesia default)
- White-label interview experience (Pro tier)
- Multi-workspace support (Pro tier)
- Advanced analytics and usage reporting
- API access (Pro tier)
- Google Slides export for sales deck
- Win/Loss research type

---

## 16. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| High AI API cost from uncapped generation | High | High | Credit system limits usage; admin cost monitoring per action type |
| Synthetic interviews perceived as low trust | Medium | Medium | Clear "Synthetic" labeling; position as directional validation, not proof |
| Generated assets feel generic | Medium | High | Allow full editing; add regenerate with different angle; improve prompts continuously |
| Midtrans recurring fails for non-card users | High | Medium | Send manual renewal invoice emails with fresh payment links for VA/QRIS users |
| Large scope delays V1 | High | High | Strict Phase 1 scope; no GTM assets in Phase 1 |
| Low market awareness in Indonesia | Medium | High | Partner with HIPMI chapters, startup incubators, business schools |
| Data privacy concerns around interview data | Low | High | Clear privacy policy, data deletion on request, no third-party sharing of transcripts |

---

## 17. Legal and Compliance

- **Privacy Policy:** Must describe collection of interview transcripts, AI processing, and data retention.
- **Terms of Use:** Must cover AI-generated content disclaimers (outputs are suggestions, not professional advice), credit refund policy, and acceptable use.
- **Cookie Policy:** Analytics and session cookies; consent banner required.
- **Midtrans compliance:** Platform is classified as a Midtrans merchant; no storage of raw card data; follow Midtrans merchant onboarding requirements.
- **AI content disclosure:** All AI-generated content should carry a visible "Generated by AI" indicator in editable mode.

---

## 18. Launch Checklist (MVP Release Criteria)

- [ ] User can register, create workspace, and complete business model setup
- [ ] IVA can extract and populate Lean Canvas from free text
- [ ] User can launch a research project and run synthetic interviews
- [ ] IVA conducts AI-led interviews via shareable link
- [ ] Insight synthesis generates at least 4 insight categories with percentage data
- [ ] Buyer persona is generated from completed research
- [ ] Positioning and messaging doc is generated
- [ ] Landing page preview is generated and shareable
- [ ] Sales deck is generated with editable content and visual preview
- [ ] User can edit and save any generated artifact
- [ ] Credit system tracks usage and shows balance
- [ ] Midtrans Snap accepts QRIS, GoPay, Virtual Account, and credit card
- [ ] Subscription activates workspace credits on successful payment
- [ ] App is responsive and functional on desktop and mobile
- [ ] IVA has a consistent voice, avatar, and UX across all modes
- [ ] Privacy policy, terms of use, and cookie consent are live
- [ ] Error states, empty states, and loading states are designed and implemented

---

*Document Version: 1.0 | Prepared for Hipmipreneur development team | June 2026*

---

## 19. Open-Source Code References and Architecture Guidance

This section documents the best open-source projects to use as code references and technical inspiration when building Hipmipreneur. Each project was selected based on its feature overlap with one or more modules in the platform.

---

### 19.1 Selection Summary

| Module | Recommended Reference | Rationale |
|---|---|---|
| IVA Agent orchestration | VettIQ + Idea Validation Agents | Structured multi-step AI agent with LangGraph and web search |
| GTM asset editor (canvas, docs, decks) | Open Canvas (LangChain) | Best-in-class collaborative AI document writing with versioning |
| Platform shell (auth, workspace, DB) | AI Co-Founder (harshmriduhash) | Full-stack Next.js + PostgreSQL starter closest to the target app |
| Validation workflow logic | Idea Validation Agents | 9-step structured validation flow; direct process inspiration |
| Market research enrichment | VettIQ | LangGraph + web search for real-time market/competitor context |

---

### 19.2 Project Profiles

#### A. Open Canvas — LangChain AI
**Repo:** https://github.com/langchain-ai/open-canvas  
**Stars:** 5,500+  
**Stack:** Next.js, LangGraph, Supabase  
**Why use it:**  
This is the strongest technical reference for Hipmipreneur's asset generation modules — Positioning & Messaging, Landing Page copy, and Sales Deck. It implements:
- Collaborative document writing where the AI drafts, revises, and remembers context across sessions
- LangGraph-powered agent that can be steered to rewrite in different tones, styles, or structures
- Built-in document versioning and diff comparison
- Supabase for auth and storage — directly compatible with the Hipmipreneur stack

**How to apply it:**  
Use Open Canvas's LangGraph agent graph structure as the foundation for the `GtmAssetGenerator` service. The agent receives workspace context (canvas, persona, insights) as system memory and generates structured document output. The document editor UI pattern — split-screen with AI panel on the left and editable rich text on the right — mirrors the screenshot layout of the Positioning doc and Sales Deck modules.

**Key files to study:**
- `apps/web/src/agent/` — the LangGraph graph definition and node implementations
- `apps/web/src/components/canvas/` — the collaborative editor UI
- `apps/web/src/hooks/use-graph.ts` — how the agent state is managed client-side

---

#### B. VettIQ — AI Market Validation
**Repo:** https://github.com/Nirikshan95/VettIQ  
**Stars:** 15  
**Stack:** FastAPI, Streamlit, LangGraph  
**Why use it:**  
VettIQ is the best reference for the IVA agent's market analysis and research synthesis capabilities. It implements:
- LangGraph orchestration with parallel tool-use agents (web search, competitor analysis, risk assessment)
- Market analysis pipeline that takes an idea as input and returns structured findings
- Strategic advisory layer that summarizes research into actionable recommendations

**How to apply it:**  
Use VettIQ's LangGraph agent graph as the reference for IVA's `InsightSynthesizer` and `CanvasExtractor` agents. Specifically, the parallel tool-calling pattern (run competitor research and customer analysis simultaneously) is directly applicable to Hipmipreneur's insight clustering step, where multiple interview transcripts must be analyzed in parallel before being merged.

**Key patterns to adopt:**
- `StateGraph` with typed state schema for each IVA workflow (canvas generation, insight synthesis, persona building)
- Tool nodes for web search enrichment when the user provides a URL or company name during canvas creation
- Conditional routing in the graph based on whether synthetic or real respondents are being analyzed

---

#### C. Idea Validation Agents — MaxKmet
**Repo:** https://github.com/MaxKmet/idea-validation-agents  
**Stars:** 245  
**Stack:** Markdown-based agent workflows, Claude/Cursor  
**Why use it:**  
This project is the closest structural match to Hipmipreneur's guided validation workflow. It implements a 9-step venture analyst process covering: idea generation, problem discovery, market deep-dive, customer segment validation, and pivot optimization. While it is not a web application, the step definitions and agent prompt engineering are directly transferable.

**How to apply it:**  
Use this project's workflow definitions and prompts as the source for:
- IVA's Builder task guidance text
- Interview script section structures (Triggering Events, JTBD, Desired Outcomes)
- Insight category definitions and their analysis heuristics
- The decision logic for when IVA recommends proceeding vs. pivoting after research

**Key files to study:**
- The validation step markdown files — each step contains a structured prompt framework
- The market deep-dive agent prompt — directly applicable to the market context section of the Positioning doc
- The pivot optimization step — applicable to IVA's "proceed/pivot" recommendation feature

---

#### D. AI Co-Founder — harshmriduhash
**Repo:** https://github.com/harshmriduhash/AI_CO_FOUNDER  
**Stars:** 4  
**Stack:** React, Node.js, PostgreSQL  
**Why use it:**  
This is the most direct structural reference for Hipmipreneur's application shell — it attempts to build a full platform with auth, workspace, chat-based AI interaction, document generation, and a PostgreSQL backend. While early-stage, the architectural decisions are directly relevant.

**How to apply it:**  
Use as a reference for:
- The workspace + auth database schema design
- The pattern for passing AI conversation history as context to generation endpoints
- The React component structure for the chat-with-IVA onboarding experience
- Node.js API route organization for AI generation endpoints

**Key patterns to adopt:**
- AI context object that accumulates workspace data across sessions
- Document generation endpoints that accept structured input (not raw chat) for deterministic output quality
- PostgreSQL schema for user → workspace → artifact relationships

---

### 19.3 Recommended Architecture Stack (with References)

Based on the open-source analysis, the recommended architecture for Hipmipreneur combines the best patterns from each project:

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│  Next.js 15 + React 19 + Tailwind + Shadcn/ui      │
│  Pattern ref: AI Co-Founder shell + Open Canvas UI │
└──────────────────────┬──────────────────────────────┘
                       │ API Routes / tRPC
┌──────────────────────▼──────────────────────────────┐
│                  BACKEND SERVICES                   │
│                                                     │
│  ┌─────────────────────────────────────┐            │
│  │  IVA Agent Service (LangGraph)      │            │
│  │  Ref: Open Canvas + VettIQ          │            │
│  │  Agents:                            │            │
│  │  - CanvasExtractor                  │            │
│  │  - InterviewConductor               │            │
│  │  - InsightSynthesizer               │            │
│  │  - PersonaBuilder                   │            │
│  │  - PositioningGenerator             │            │
│  │  - LandingPageGenerator             │            │
│  │  - SalesDeckGenerator               │            │
│  └─────────────────────────────────────┘            │
│                                                     │
│  ┌─────────────────────────────────────┐            │
│  │  Job Queue (BullMQ + Redis)         │            │
│  │  All generation tasks async         │            │
│  └─────────────────────────────────────┘            │
│                                                     │
│  ┌─────────────────────────────────────┐            │
│  │  Payment Service (Midtrans Snap)    │            │
│  │  Subscription + Credit Management  │            │
│  └─────────────────────────────────────┘            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  DATA LAYER                         │
│  PostgreSQL (primary) + pgvector (transcripts)     │
│  Prisma ORM                                        │
│  Ref: AI Co-Founder schema + Open Canvas Supabase  │
└─────────────────────────────────────────────────────┘
```

---

### 19.4 LangGraph Agent Design for IVA

Based on the VettIQ and Open Canvas patterns, the IVA agent should be implemented as a **LangGraph StateGraph** with the following node structure:

```
CanvasExtractionGraph
├── input_parser_node         → Extract type: text | url | document
├── canvas_drafter_node       → Generate initial Lean Canvas JSON
├── canvas_refinement_node    → Apply user edits and re-enrich
└── canvas_finalizer_node     → Validate completeness, flag gaps

InsightSynthesisGraph
├── transcript_loader_node    → Load all completed interview transcripts
├── parallel_analysis_nodes   → [JTBD analyzer | Trigger analyzer | Outcome analyzer] (parallel)
├── cluster_merge_node        → Merge parallel results, deduplicate insights
├── quantification_node       → Count and percentage per insight category
└── insight_report_node       → Structure final InsightReport JSON

GtmGenerationGraph
├── context_loader_node       → Load canvas + persona + insights
├── positioning_node          → Generate positioning doc
├── landing_page_node         → Generate landing page copy
├── sales_deck_node           → Generate deck content JSON
└── asset_saver_node          → Persist to GtmAsset table
```

Each graph node is a typed function that receives and returns the graph's `State` object. The state schema should be defined with Zod for full TypeScript safety across the frontend and backend.

---

### 19.5 Key Open-Source Libraries to Include

Based on all four reference projects, the following libraries should be in the Hipmipreneur dependency tree:

| Library | Use | Reference Source |
|---|---|---|
| `@langchain/langgraph` | IVA agent orchestration | Open Canvas, VettIQ |
| `@langchain/openai` | LLM calls via LangChain | Open Canvas |
| `@langchain/community` | Web search tool nodes | VettIQ |
| `ai` (Vercel AI SDK) | Streaming LLM responses to frontend | Open Canvas |
| `@tiptap/react` | Rich text editor for asset documents | Open Canvas |
| `bullmq` | Async job queue for generation tasks | Standard |
| `ioredis` | Redis client for BullMQ | Standard |
| `prisma` | PostgreSQL ORM | AI Co-Founder |
| `@midtrans/midtrans-node` | Midtrans server-side SDK | Indonesian market |
| `zod` | Schema validation across agent state | All |
| `@radix-ui/react-*` | Headless UI components | Standard |
| `lucide-react` | Icons | Standard |

---

*Section 19 added June 2026 — Code Reference Addendum*
