# Hipmipreneur — AI Co-Founder Platform for Indonesian Founders

[![Framework](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-square&logo=next.dotjs)](https://nextjs.org/)
[![Language](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Payment](https://img.shields.io/badge/Payment-Midtrans-navy?style=flat-square)](https://midtrans.com/)

> *"Bangun dari riset, bukan dari asumsi."* (Build from research, not assumptions.)

Hipmipreneur is an **AI Co-Founder SaaS platform** designed for Indonesian founders, startup teams, accelerators, and business consultants. It guides users through an evidence-driven validation workflow: starting from a raw idea, running structured customer discovery (using both real interviews and AI-led synthetic validation), generating deep insight summaries, and auto-producing premium Go-To-Market (GTM) assets—such as buyer personas, positioning guides, landing pages, and investor pitch decks—in one click.

---

## 🌟 Core Features

- 📋 **AI Lean Canvas:** Define and refine your core business model through free-text conversation with IVA (our AI Assistant) or direct URL ingestion.
- 🛣️ **Founder Roadmap / Builder:** A step-by-step sequential checklist (Tasks 1-6) that moves you from customer segment mapping to UVP and revenue stream definition.
- 🔬 **Validation & Research Hub:** Manage problem discovery research campaigns, map customer segments, and track validation health.
- 🗣️ **Flexible Interview System:**
  - **AI-Led Interviews:** IVA conducts automated customer interviews autonomously via shareable public URLs.
  - **AI-Assisted Interviews:** Conduct interviews yourself with IVA co-piloting, displaying script checklists, suggesting follow-up questions, and transcribing in real-time.
  - **Synthetic Respondent Simulation:** Simulate realistic respondent feedback in minutes using research-backed buyer profiles.
- 📊 **Insight Analysis & Clustering:** Group interview feedback into Jobs-to-be-Done (JTBD), desired outcomes, triggering events, and actual solution search behaviors.
- 👤 **Dynamic Buyer Personas:** Synthesize persona profiles including demographic profiles, key initiatives, decision-making processes, and messaging angles.
- 🎯 **Go-To-Market Asset Generation:**
  - **Positioning & Messaging Guide:** Core positioning statements, competitive laddering, and elevator pitches.
  - **Landing Page Generator:** Structured copy, headlines, CTAs, and a responsive HTML live preview.
  - **Sales & Pitch Deck Generator:** Editable outline, presenter notes, and fully stylized slides ready for export.

---

## 🛠️ Technology Stack

- **Frontend:** [Next.js 15](https://nextjs.org) (App Router), [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **State Management:** React Context API & React Hooks
- **AI Engine:** OpenRouter API (`openrouter/free` & fallback models) + Workspace context-aware prompting layer
- **Database (Target):** PostgreSQL with Prisma ORM
- **Payment Gateway (Target):** Midtrans (QRIS, GoPay, Virtual Account, Credit Card)

---

## 📂 Project Structure

```
Hipmipreneur/
├── app/                      # Next.js App Router Pages & APIs
│   ├── api/                  # Backend API routes (AI, analytics, workspaces)
│   │   └── ai/               # AI generation endpoint utilizing OpenRouter
│   ├── dashboard/            # Core workspace dashboard pages
│   │   ├── interviews/       # AI-assisted & AI-led interviews dashboard
│   │   ├── landing-pages/    # Generated landing page previews
│   │   ├── personas/         # Buyer persona viewer and editor
│   │   ├── research/         # Research project tracker & validation score
│   │   └── sales-decks/      # Investor pitch deck customizer & exporter
│   ├── onboarding/           # Onboarding path selection & setup
│   ├── globals.css           # Tailwind custom rules & design system configurations
│   ├── layout.tsx            # Global layout layout structure
│   └── page.tsx              # Public homepage / landing page
├── components/               # Reusable UI components & layouts
│   ├── SideNavBar.tsx        # Persistent dashboard navigation sidebar
│   └── ...
├── context/                  # Global context providers
│   └── WorkspaceContext.tsx  # Persists active workspace state and context across views
├── public/                   # Static assets, branding, and logos
│   ├── Logo/                 # Branding vectors
│   └── App Design/           # Design mockups and design references
├── Hipmipreneur_PRD.md       # Product Requirements Document
├── next.config.ts            # Next.js runtime configurations
├── package.json              # Dependencies and build scripts
└── tsconfig.json             # TypeScript rules configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js (v18.x or later)** and **npm** installed on your local machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/auputralt/Hipmipreneur.git
   cd Hipmipreneur
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables by copying the example file:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your APIs keys:
   ```env
   OPENROUTER_API_KEY=your-openrouter-key-here
   # Add additional configs (Midtrans, Supabase, etc.) when deploying
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your web browser to interact with the platform.

---

## ⚙️ Configuration & Environment Variables

The project uses `.env.local` for local secrets. The essential keys include:

| Key | Description | Example |
|---|---|---|
| `OPENROUTER_API_KEY` | Key for OpenRouter API requests | `sk-or-v1-...` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Public key for Midtrans payment gateway UI | `SB-Mid-client-...` |
| `MIDTRANS_SERVER_KEY` | Server-side authentication key for Midtrans transactions | `SB-Mid-server-...` |

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
