"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "@clerk/nextjs";

export default function OnboardingPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { workspaces, createWorkspace, completeOnboarding } = useWorkspace();

  useEffect(() => {
    // If user already has workspaces, skip onboarding
    if (workspaces && workspaces.length > 0) {
      completeOnboarding();
      router.replace("/dashboard/get-started");
      return;
    }

    // Create a default workspace and go to dashboard
    if (userId && workspaces !== null) {
      createWorkspace("My First Venture", "", "Develop my idea");
      completeOnboarding();
      router.replace("/dashboard/get-started");
    }
  }, [userId, workspaces, createWorkspace, completeOnboarding, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm text-on-surface-variant">Setting up your workspace...</span>
      </div>
    </div>
  );
}
