"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { createWorkspace, completeOnboarding } = useWorkspace();
  const [selectedPath, setSelectedPath] = useState<string>("Develop my idea");
  const [ventureName, setVentureName] = useState("");
  const [ventureDesc, setVentureDesc] = useState("");

  const paths = [
    {
      name: "Develop my idea",
      description: "You have a raw startup concept. IVA will guide you through mapping initial customer segments, identifying core problems, and kicking off early validation.",
      icon: "lightbulb",
      badge: "Pre-validation",
      color: "border-primary hover:border-primary",
      glowColor: "rgba(128, 131, 255, 0.2)",
    },
    {
      name: "Find my idea",
      description: "You want to build a startup but don't have a clear idea yet. IVA will help you scan market opportunities, research pain points, and explore viable business models.",
      icon: "search",
      badge: "Opportunity Scan",
      color: "border-secondary hover:border-secondary",
      glowColor: "rgba(93, 230, 255, 0.2)",
    },
    {
      name: "Grow my business",
      description: "You have an existing product or business. You want to synthesize research into target buyer personas, write crisp messaging positioning, and generate launch assets.",
      icon: "trending_up",
      badge: "GTM Acceleration",
      color: "border-tertiary hover:border-tertiary",
      glowColor: "rgba(128, 131, 255, 0.2)",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ventureName.trim()) {
      createWorkspace(ventureName, ventureDesc, selectedPath);
      completeOnboarding();
      router.push("/dashboard/get-started");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full flex flex-col gap-8">
        {/* Brand logo & header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 flex items-center justify-center">
            <Image
              src="/Logo/Transpart.png"
              alt="Hipmipreneur Logo"
              width={64}
              height={64}
              className="object-contain filter drop-shadow-[0_0_15px_rgba(128,131,255,0.5)]"
            />
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary mt-2">Welcome to Hipmipreneur</h1>
          <p className="text-sm text-on-surface-variant max-w-lg">
            Let&apos;s configure your AI Co-Founder platform environment. Every successful venture in Indonesia starts here.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-8 shadow-2xl">
          {/* Section 1: Venture Profile */}
          <div className="flex flex-col gap-4">
            <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-glow/50 pb-2">
              <span className="font-mono text-primary text-sm">01 //</span> Venture Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Venture or Startup Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Alpha, Warung Pintar"
                  value={ventureName}
                  onChange={(e) => setVentureName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Elevator Pitch or Brief Idea</label>
                <input
                  type="text"
                  placeholder="e.g. B2B marketplace connecting farmers to restaurants"
                  value={ventureDesc}
                  onChange={(e) => setVentureDesc(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Path Selector */}
          <div className="flex flex-col gap-4">
            <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-glow/50 pb-2">
              <span className="font-mono text-primary text-sm">02 //</span> Choose Your Starting Path
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paths.map((p, idx) => {
                const active = selectedPath === p.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPath(p.name)}
                    className={`glass-panel p-5 rounded-xl border text-left flex flex-col gap-3 transition-all relative group cursor-pointer ${
                      active
                        ? "border-primary active-panel transform scale-[1.01]"
                        : "border-outline-glow hover:border-on-surface-variant"
                    }`}
                    style={{
                      boxShadow: active ? `inset 0 0 15px ${p.glowColor}, 0 0 15px ${p.glowColor}` : "none",
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? "bg-primary text-surface-dim shadow-[0_0_15px_rgba(128,131,255,0.4)]" : "bg-surface-container-high text-primary"} transition-all`}>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                          {p.icon}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-[9px] font-mono border border-outline-glow">
                        {p.badge}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className={`font-headline text-sm font-bold ${active ? "text-primary" : "text-on-surface"}`}>
                        {p.name}
                      </h4>
                      <p className="text-xs text-on-surface-variant/80 mt-1 line-clamp-4 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-4 border-t border-outline-glow/50">
            <button
              type="submit"
              disabled={!ventureName.trim()}
              className={`px-8 py-3 bg-inverse-primary text-on-primary font-bold text-sm rounded-xl neon-glow-primary hover:bg-primary hover:text-on-primary hover:shadow-[0_0_30px_rgba(192,193,255,0.6)] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer ${
                !ventureName.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span>Launch Venture Hub</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
