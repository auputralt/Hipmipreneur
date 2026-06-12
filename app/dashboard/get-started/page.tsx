"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspace } from "../../../context/WorkspaceContext";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

interface Phase {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  description: string;
  guideUrl: string;
  tasks: TaskItem[];
}

export default function GetStartedPage() {
  const { activeWorkspace, completedTasks, completeTask, uncompleteTask, createWorkspaceForChat } = useWorkspace();

  const router = useRouter();

  const phases: Phase[] = [
    {
      id: "phase-1",
      num: 1,
      title: "Validate with AI (Synthetic Research)",
      subtitle: "PRE-VALIDATION FLOW",
      description: "Compress weeks of initial research into minutes. Populate your canvas and run simulated synthetic customer interviews to validate directional demand.",
      guideUrl: "#guide-synthetic",
      tasks: [
        {
          id: "canvas-builder-1",
          title: "Build Lean Canvas",
          description: "Define your core value propositions, segments, and channels using IVA's extraction capabilities.",
          link: "/dashboard/canvas",
          linkText: "Edit Canvas",
        },
        {
          id: "canvas-builder-2",
          title: "Identify Customer Segments & Problems",
          description: "Detail your target segments and rank the severity of their specific problems.",
          link: "/dashboard/builder",
          linkText: "Open Builder",
        },
        {
          id: "canvas-builder-uvp",
          title: "Define Unique Value Proposition (UVP)",
          description: "Craft a clear UVP statement that communicates your unique promise to target customers.",
          link: "/dashboard/builder",
          linkText: "Open Builder",
        },
        {
          id: "canvas-builder-solution",
          title: "Design MVP Solution",
          description: "Define the minimum viable product features that deliver on your UVP and solve the core problem.",
          link: "/dashboard/builder",
          linkText: "Open Builder",
        },
        {
          id: "canvas-builder-unfair",
          title: "Identify Unfair Advantage",
          description: "Document competitive moats that competitors cannot easily copy or buy.",
          link: "/dashboard/builder",
          linkText: "Open Builder",
        },
        {
          id: "canvas-builder-3",
          title: "Run Synthetic Interviews",
          description: "Simulate interviews with AI agents configured to match your target segment profile.",
          link: "/dashboard/interviews",
          linkText: "Simulate Personas",
        },
      ],
    },
    {
      id: "phase-2",
      num: 2,
      title: "Validate with Real Customers",
      subtitle: "CUSTOMER DISCOVERY",
      description: "Take your business model to real prospective buyers. Create interview scripts, record conversations, and auto-synthesize transcripts into evidence-driven insights.",
      guideUrl: "#guide-real",
      tasks: [
        {
          id: "validation-real-1",
          title: "Generate Interview Script",
          description: "Design structured question paths focusing on JTBD and trigger events.",
          link: "/dashboard/scripts",
          linkText: "Manage Scripts",
        },
        {
          id: "validation-real-2",
          title: "Launch Real Respondent Interviews",
          description: "Conduct interviews using IVA's public chat link or real-time co-pilot recorder.",
          link: "/dashboard/interviews",
          linkText: "Start Interview",
        },
        {
          id: "validation-real-3",
          title: "Synthesize Transcripts to Insights",
          description: "Cluster patterns from completed conversations into jobs, outcomes, and frustrations.",
          link: "/dashboard/research",
          linkText: "View Insights",
        },
      ],
    },
    {
      id: "phase-3",
      num: 3,
      title: "Build Go-To-Market",
      subtitle: "GTM ASSETS GENERATION",
      description: "Unlock high-quality launch assets powered by your structured research. Eliminate generic copies and construct a high-converting, targeted marketing engine.",
      guideUrl: "#guide-gtm",
      tasks: [
        {
          id: "gtm-assets-1",
          title: "Generate Buyer Personas",
          description: "Synthesize research profiles into a dynamic, updating buyer persona guide.",
          link: "/dashboard/personas",
          linkText: "Review Personas",
        },
        {
          id: "gtm-assets-2",
          title: "Define Positioning & messaging",
          description: "Establish core elevator pitches, status-quo fail factors, and RTB messaging grids.",
          link: "/dashboard/positioning",
          linkText: "Draft Messaging",
        },
        {
          id: "gtm-assets-3",
          title: "Launch Landing Page & Pitch Deck",
          description: "Generate launch HTML previews and exportable sales presentation deck files.",
          link: "/dashboard/landing-pages",
          linkText: "Generate Assets",
        },
      ],
    },
  ];

  const handleCheckboxChange = (taskId: string, currentStatus: boolean) => {
    if (currentStatus) {
      uncompleteTask(taskId);
    } else {
      completeTask(taskId);
    }
  };

  const activePathText = activeWorkspace?.type || "Develop my idea";

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6 relative">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-2 font-mono text-[10px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-xs">navigation</span>
            <span>Venture Shell // Get Started</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-on-surface">Venture Navigator</h1>
          <p className="font-body text-sm text-on-surface-variant mt-1.5 max-w-2xl">
            Welcome to the cockpit of <span className="text-primary font-semibold">{activeWorkspace?.name}</span>. Your active venture building path is set to <span className="text-secondary font-semibold">{activePathText}</span>.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="flex items-center gap-4 bg-surface-container-high/40 p-4 rounded-xl border border-outline-glow w-full md:w-80 backdrop-blur-md">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Validation Health</span>
              <span className="text-sm font-bold text-primary">{activeWorkspace?.healthScore}%</span>
            </div>
            <div className="h-2 w-full bg-surface-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 rounded-full"
                style={{ width: `${activeWorkspace?.healthScore}%` }}
              ></div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary ">
            {completedTasks.length}/{phases.reduce((sum, p) => sum + p.tasks.length, 0)}
          </div>
        </div>
      </header>

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

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Column: Progress Phases (8/12) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {phases.map((phase) => {
            const completedCount = phase.tasks.filter((t) => completedTasks.includes(t.id)).length;
            const phaseStatus =
              completedCount === phase.tasks.length
                ? "completed"
                : completedCount > 0
                ? "active"
                : "locked";

            return (
              <div
                key={phase.id}
                className={`glass-panel rounded-xl overflow-hidden transition-all duration-300 relative group ${ phaseStatus === "completed" ? "border-secondary/40 " : phaseStatus === "active" ? "border-primary/50 " : "opacity-75 border-outline-glow/50" }`}
              >
                {/* Header Strip Accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${ phaseStatus === "completed" ? "from-secondary to-secondary-container" : "from-primary to-primary-container" } opacity-70`}
                ></div>

                <div className="p-5 flex flex-col gap-4">
                  {/* Phase Summary */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] text-primary/70 uppercase tracking-widest">
                          {phase.subtitle}
                        </span>
                        <span className="text-on-surface-variant/40">•</span>
                        <span className="font-mono text-[9px] text-on-surface-variant uppercase">
                          Phase 0{phase.num}
                        </span>
                      </div>
                      <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2 group-hover:text-primary transition-colors">
                        {phase.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed">
                        {phase.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {completedCount}/{phase.tasks.length} Completed
                      </span>
                      <a
                        href={phase.guideUrl}
                        className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="View Academy Guide"
                      >
                        <span className="material-symbols-outlined text-base">help_outline</span>
                      </a>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="mt-2 border-t border-outline-glow/30 pt-4 flex flex-col gap-3">
                    {phase.tasks.map((task) => {
                      const done = completedTasks.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          className={`flex items-start justify-between gap-4 p-3 rounded-lg border transition-all ${ done ? "bg-surface-container-low/30 border-secondary/20" : "bg-surface-container-lowest/50 border-outline-glow/30 hover:border-outline-glow" }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox button */}
                            <button
                              type="button"
                              onClick={() => handleCheckboxChange(task.id, done)}
                              className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-all cursor-pointer ${ done ? "bg-secondary border-secondary text-surface-dim " : "border-outline-glow hover:border-primary bg-surface-container-high/40" }`}
                            >
                              {done && (
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                              )}
                            </button>
                            <div>
                              <h4 className={`text-xs font-bold ${done ? "line-through text-on-surface-variant/60" : "text-on-surface"}`}>
                                {task.title}
                              </h4>
                              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                                {task.description}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={task.link}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${ done ? "bg-surface-container text-on-surface-variant border border-outline-glow/50" : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-surface-dim " }`}
                          >
                            {task.linkText}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Right Column: IVA Assistant Sidebar (4/12) */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-5 border border-outline-glow flex flex-col gap-4 lg:sticky lg:top-4">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-outline-glow/30 pb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center ">
                  <span className="material-symbols-outlined text-surface-dim font-bold text-xl">smart_toy</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface-container"></span>
              </div>
              <div>
                <h3 className="font-headline text-sm font-bold text-on-surface leading-tight">IVA Onboarding</h3>
                <p className="text-[10px] text-secondary font-mono tracking-wider">AI ASSISTANT ACTIVE //</p>
              </div>
            </div>

            {/* Chat Speech Bubble */}
            <div className="bg-surface-container-low/40 rounded-xl rounded-tl-none p-4 border border-outline-glow/50 text-xs text-on-surface flex flex-col gap-2.5 relative">
              <p>
                Halo! I am **IVA**, your AI Co-Founder. Let&apos;s make sure we launch this venture based on *data and customer research*, not just gut feeling.
              </p>
              <p>
                Based on your current onboarding path **{activePathText}**, I highly recommend starting with:
              </p>
              <div className="bg-surface-deep/50 p-2.5 rounded border border-outline-glow/30">
                <p className="font-bold text-primary text-[10px] uppercase">Recommended Next Step:</p>
                <p className="mt-1 leading-relaxed">
                  Go to the **AI Lean Canvas** and describe your idea in plain text. I&apos;ll automatically generate your 9-section structure.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/dashboard/canvas"
                  className="w-full py-2 bg-primary text-on-primary font-bold text-center rounded-lg text-[10px] transition-all cursor-pointer"
                >
                  Start Lean Canvas Extraction
                </Link>
                <button
                  onClick={() => alert("IVA: 'I can simulate interviews, synthesize scripts, or generate mockups. Ask me anything once you populate your canvas!'")}
                  className="w-full py-2 bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-glow rounded-lg text-center text-[10px] transition-colors cursor-pointer"
                >
                  See What IVA Can Do
                </button>
              </div>
            </div>

            {/* Tip card */}
            <div className="bg-surface-container-lowest/50 p-3 rounded-lg border border-dashed border-outline-glow/60 flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                <span className="font-bold text-on-surface">Pro Tip:</span> Completing synthetic validation tasks first in Phase 1 allows IVA to automatically refine your interview scripts in Phase 2.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
