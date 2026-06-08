"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "../context/WorkspaceContext";

export default function Home() {
  const router = useRouter();
  const { onboardingCompleted } = useWorkspace();

  useEffect(() => {
    if (!onboardingCompleted) {
      router.replace("/onboarding");
    } else {
      router.replace("/dashboard/get-started");
    }
  }, [onboardingCompleted, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/[0.04] rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-on-primary font-bold text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            hub
          </span>
        </div>
        <p className="text-sm text-on-surface-variant font-mono uppercase tracking-widest animate-pulse">
          Synchronizing venture environment...
        </p>
      </div>
    </div>
  );
}
