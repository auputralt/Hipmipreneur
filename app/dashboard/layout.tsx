"use client";

import React, { useState } from "react";
import { SideNavBar } from "../../components/SideNavBar";
import { TopHeader } from "../../components/TopHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-background text-on-surface font-body relative flex">
      {/* Subtle ambient background — two soft blobs, no grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[15%] left-[25%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] bg-secondary/[0.03] rounded-full blur-[120px]"></div>
      </div>

      {/* Backdrop overlay for mobile menu drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Persistent left navigation / mobile drawer */}
      <SideNavBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col md:ml-[280px] relative z-10 min-w-0">
        {/* Top header navbar */}
        <TopHeader onMenuToggle={() => setIsMobileMenuOpen(true)} />

        {/* Dashboard inner canvas */}
        <main className="flex-1 pt-16 h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
