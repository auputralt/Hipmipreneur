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
