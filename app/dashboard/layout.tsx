"use client";

import React from "react";
import { SideNavBar } from "../../components/SideNavBar";
import { TopHeader } from "../../components/TopHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body relative flex overflow-hidden">
      {/* Background decoration grid and blurs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.35]"></div>
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[110px]"></div>
      </div>

      {/* Persistent left navigation */}
      <SideNavBar />

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col md:ml-[280px] relative z-10 min-w-0">
        {/* Top header navbar */}
        <TopHeader />

        {/* Dashboard inner canvas */}
        <main className="flex-1 pt-16 h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
