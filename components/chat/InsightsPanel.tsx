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
