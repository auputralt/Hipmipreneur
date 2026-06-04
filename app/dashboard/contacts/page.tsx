"use client";

import React from "react";
import Link from "next/link";

export default function ContactsPage() {
  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 relative font-sans">
      {/* Header */}
      <header className="border-b border-outline-glow/30 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
          <span className="material-symbols-outlined text-[10px]">contacts</span>
          <span>Operations // Contacts</span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Venture Contacts CRM</h1>
        <p className="font-body text-xs text-on-surface-variant mt-1">
          Manage target interviewees, client outreach pipelines, and stakeholder directories.
        </p>
      </header>

      {/* Main card */}
      <div className="w-full glass-panel border border-outline-glow rounded-xl p-10 text-center flex flex-col items-center justify-center gap-6 h-[400px] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="absolute -top-1/4 -right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(128,131,255,0.3)] animate-pulse">
            <span className="material-symbols-outlined text-surface-dim font-bold text-3xl">contacts</span>
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary rounded-full border-2 border-surface-container"></span>
        </div>

        <div className="space-y-2 w-[450px] max-w-full relative z-10">
          <h3 className="font-headline font-bold text-primary text-sm uppercase tracking-wider font-mono">Contacts CRM Coming Soon</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-body">
            Kami sedang merancang CRM ringan terintegrasi. Modul ini akan memungkinkan Anda mengimpor daftar prospek langsung dari LinkedIn, menandai segmen pelanggan mereka, menjadwalkan wawancara langsung, dan mencatat riwayat interaksi riset mereka.
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <Link
            href="/dashboard/get-started"
            className="bg-primary text-surface-dim font-headline font-bold text-[11px] px-5 py-2.5 rounded-lg shadow-md hover:bg-primary-fixed hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali ke Get Started</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
