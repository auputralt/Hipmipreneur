"use client";

import React, { useState } from "react";
import { useWorkspace, LeanCanvas } from "../../../context/WorkspaceContext";

interface BuilderTask {
  id: number;
  taskId: string;
  title: string;
  duration: string;
  description: string;
  instructions: string;
  fields: Array<{ label: string; placeholder: string; key: keyof LeanCanvas }>;
  educationalQuote: string;
}

export default function BuilderPage() {
  const { activeWorkspace, canvasData, updateCanvasSection, completedTasks, completeTask } = useWorkspace();
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [formInputs, setFormInputs] = useState<Record<string, string>>({});

  const canvas = activeWorkspace ? canvasData[activeWorkspace.id] : null;

  const builderTasks: BuilderTask[] = [
    {
      id: 1,
      taskId: "canvas-builder-2",
      title: "Task 1: Segmen & Masalah Pelanggan",
      duration: "30-60 min",
      description: "Identifikasi target segmen pelanggan awal Anda dan jelaskan 3 masalah krusial mereka.",
      instructions: "Sebelum membuat produk, Anda harus memetakan siapa yang bersedia membayar untuk memecahkan masalah ini. Tulis detail segmen Anda dan masalah yang dialami.",
      fields: [
        { label: "Target Segmen Pelanggan", placeholder: "e.g. Pemilik kedai kopi independen di Jakarta Selatan", key: "customerSegments" },
        { label: "Tiga Masalah Utama (Problem)", placeholder: "e.g. 1. Fluktuasi harga bahan baku biji kopi\n2. Kesulitan melacak arus logistik pesanan\n3. Kurangnya eksposur promosi kedai", key: "problem" }
      ],
      educationalQuote: "Satu-satunya syarat mutlak dan cukup bagi sebuah bisnis adalah adanya pelanggan yang membayar (paying customer). Mulailah dari masalah mereka."
    },
    {
      id: 2,
      taskId: "canvas-builder-uvp",
      title: "Task 2: Unique Value Proposition (UVP)",
      duration: "20-40 min",
      description: "Tentukan proporsi nilai unik Anda — apa yang membuat Anda berbeda dan layak dipilih.",
      instructions: "UVP adalah janji nilai yang akan Anda sampaikan ke pelanggan. Tulis dalam formula yang jelas: Untuk siapa, memecahkan apa, dengan keunikan apa.",
      fields: [
        { label: "Unique Value Proposition (UVP)", placeholder: "e.g. Beli kopi harian hemat diskon 50% di puluhan kafe mitra melalui satu aplikasi langganan.", key: "uvp" }
      ],
      educationalQuote: "Fokuslah pada hasil akhir yang diterima pelanggan, bukan hanya pada fitur keren produk Anda. Apa kontras pembeda Anda?"
    },
    {
      id: 3,
      taskId: "canvas-builder-solution",
      title: "Task 3: Solusi Produk (Solution)",
      duration: "20-30 min",
      description: "Definisikan solusi awal yang menghantarkan janji nilai UVP Anda.",
      instructions: "Rancang MVP (Minimum Viable Product) Anda. Deskripsikan 3 fitur terpenting yang langsung memecahkan masalah di Task 1.",
      fields: [
        { label: "Solusi Minimum Viable Product", placeholder: "e.g. 1. Aplikasi pemesanan voucher kopi\n2. Peta integrasi kafe terdekat\n3. Sistem voucher QR code", key: "solution" }
      ],
      educationalQuote: "Jangan jatuh cinta pada solusi Anda sendiri, jatuh cintalah pada masalah pelanggan Anda. Buat solusi sesederhana mungkin."
    },
    {
      id: 4,
      taskId: "canvas-builder-unfair",
      title: "Task 4: Keunggulan Tak Adil (Unfair Advantage)",
      duration: "15-30 min",
      description: "Tentukan keunggulan kompetitif yang tidak dapat dengan mudah ditiru atau dibeli kompetitor.",
      instructions: "Pikirkan tentang paten, tim ahli, database eksklusif, atau kerjasama strategis khusus yang Anda miliki.",
      fields: [
        { label: "Unfair Advantage", placeholder: "e.g. Kerjasama eksklusif dengan Asosiasi Petani Kopi Gayo dan 100 kedai terdaftar di DKI.", key: "unfairAdvantage" }
      ],
      educationalQuote: "Keunggulan tak adil adalah pertahanan Anda dari kepungan kompetitor yang akan datang setelah melihat kesuksesan Anda."
    }
  ];

  const currentTask = builderTasks[activeTaskIndex];

  // Load canvas data into form if editable
  const getFieldValue = (key: keyof LeanCanvas) => {
    if (formInputs[key] !== undefined) return formInputs[key];
    if (canvas) return canvas[key] || "";
    return "";
  };

  const handleInputChange = (key: keyof LeanCanvas, value: string) => {
    setFormInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAndProceed = () => {
    if (!activeWorkspace) return;

    // Save inputs to context canvas
    currentTask.fields.forEach((field) => {
      const val = getFieldValue(field.key);
      updateCanvasSection(activeWorkspace.id, field.key, val);
    });

    // Mark task complete
    completeTask(currentTask.taskId);

    // Proceed to next task if available
    if (activeTaskIndex < builderTasks.length - 1) {
      setActiveTaskIndex(activeTaskIndex + 1);
    } else {
      alert("Hebat! Anda telah menyelesaikan keempat Tugas Builder Utama. Model bisnis Anda kini kokoh untuk divalidasi.");
    }
  };

  // Get IVA Context suggestions
  const getIvaSuggestions = () => {
    if (!activeWorkspace) return [];
    const isNexus = activeWorkspace.id === "ws-nexus";
    
    if (activeTaskIndex === 0) {
      return isNexus
        ? [
            { text: "Segmen: Kepala Pabrik Perakitan Otomotif", desc: "Masalah: Dinamo overheat mendadak menghentikan robot pengelasan." },
            { text: "Segmen: Direktur Logistik Pelabuhan", desc: "Masalah: Koneksi cloud drop membuat tracking conveyor mati mendadak." }
          ]
        : [
            { text: "Segmen: Penjual Sembako wet-market", desc: "Masalah: Margin tipis tergerus ongkir motor ojek online biasa." },
            { text: "Segmen: Driver Kurir Lepas Lokal", desc: "Masalah: Jam kerja kosong tidak beraturan karena order terpusat di mal." }
          ];
    }
    if (activeTaskIndex === 1) {
      return isNexus
        ? [
            { text: "Predictive Edge Anomaly", desc: "'Downtime mesin pabrik hilang 100% dengan pemantauan getaran AI lokal tanpa internet.'" }
          ]
        : [
            { text: "Supply Chain Rakyat", desc: "'Layanan logistik pasar basah dengan ongkir termurah karena rute searah multi-kiosk.'" }
          ];
    }
    return [
      { text: "Saran Struktur Konten", desc: "Tuliskan poin-poin dengan penomoran 1, 2, 3 agar asisten AI kami dapat mengklasifikasikan transkrip riset Anda secara detail." }
    ];
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading builder tasks...
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 relative">
      {/* Header */}
      <header className="flex justify-between items-end border-b border-outline-glow/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">account_tree</span>
            <span>Business Model // Task Builder</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Venture Builder Checklist</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Panduan bertahap membangun rencana bisnis terstruktur. Selesaikan tugas untuk membuka pemicu riset pasar.
          </p>
        </div>
      </header>

      {/* Steps Visual Navigator */}
      <section className="bg-surface-container-low/40 p-4 rounded-xl border border-outline-glow flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
        {builderTasks.map((t, idx) => {
          const isCompleted = completedTasks.includes(t.taskId);
          const isActive = idx === activeTaskIndex;
          return (
            <React.Fragment key={t.id}>
              {idx > 0 && <div className="h-[2px] flex-1 min-w-[30px] bg-outline-glow/50 circuit-line"></div>}
              <button
                onClick={() => setActiveTaskIndex(idx)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-primary/10 border-primary text-primary active-panel"
                    : isCompleted
                    ? "bg-surface-container border-secondary/40 text-secondary"
                    : "bg-surface-container-lowest/30 border-outline-glow/40 text-on-surface-variant hover:border-outline-glow"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                  isActive
                    ? "bg-primary text-surface-dim shadow-[0_0_10px_rgba(192,193,255,0.4)]"
                    : isCompleted
                    ? "bg-secondary text-surface-dim"
                    : "bg-surface-container-highest border border-outline-glow"
                }`}>
                  {isCompleted ? <span className="material-symbols-outlined text-xs font-bold">check</span> : t.id}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wide">Tugas 0{t.id}</h4>
                  <p className="text-[10px] text-on-surface-variant font-mono">{t.duration}</p>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </section>

      {/* Main Grid: Content (8/12) & Suggestions (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Area: Form and instructions */}
        <div className="lg:col-span-8 glass-panel rounded-xl border border-outline-glow overflow-hidden">
          {/* Header Bar */}
          <div className="bg-surface-container-high/60 px-5 py-4 border-b border-outline-glow/30 flex justify-between items-center">
            <h3 className="font-headline font-bold text-on-surface text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">edit_note</span>
              {currentTask.title}
            </h3>
            <span className="text-[10px] text-on-surface-variant font-mono bg-surface-deep px-2.5 py-1 rounded border border-outline-glow/40">
              {currentTask.duration}
            </span>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Instructions */}
            <div className="bg-surface-container-low/50 border border-outline-glow/30 p-3.5 rounded-lg text-xs leading-relaxed text-on-surface-variant">
              {currentTask.instructions}
            </div>

            {/* Input fields */}
            <div className="space-y-4">
              {currentTask.fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface">{field.label}</label>
                  <textarea
                    rows={4}
                    placeholder={field.placeholder}
                    value={getFieldValue(field.key)}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-glow focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all resize-none font-body"
                  />
                </div>
              ))}
            </div>

            {/* Educational Quote */}
            <div className="border-l-2 border-primary/50 pl-3.5 py-1 my-2">
              <p className="text-[10px] italic text-on-surface-variant/80 leading-normal">
                &ldquo;{currentTask.educationalQuote}&rdquo;
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-outline-glow/30 mt-2">
              <button
                onClick={() => activeTaskIndex > 0 && setActiveTaskIndex(activeTaskIndex - 1)}
                disabled={activeTaskIndex === 0}
                className="px-4 py-2 border border-outline-glow hover:border-on-surface/40 rounded-lg text-xs font-semibold text-on-surface transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={handleSaveAndProceed}
                className="px-5 py-2.5 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-[0_0_15px_rgba(192,193,255,0.3)] hover:shadow-[0_0_20px_rgba(192,193,255,0.5)] transition-all cursor-pointer"
              >
                {activeTaskIndex === builderTasks.length - 1 ? "Selesaikan Rencana" : "Simpan & Lanjutkan"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: IVA Advice (4/12) */}
        <aside className="lg:col-span-4 flex flex-col gap-4 sticky top-4">
          <div className="glass-panel border border-outline-glow rounded-xl p-5 flex flex-col gap-4">
            {/* Title */}
            <div className="flex items-center gap-2.5 border-b border-outline-glow/30 pb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-primary text-base">smart_toy</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface text-xs leading-tight">Saran Alternatif IVA</h3>
                <p className="text-[9px] text-secondary font-mono tracking-wider">CONTEXT SUGGESTION</p>
              </div>
            </div>

            {/* Suggestions list */}
            <div className="space-y-3">
              {getIvaSuggestions().map((sug, sIdx) => (
                <div key={sIdx} className="bg-surface-container-low/40 p-3 rounded-lg border border-outline-glow/50 flex flex-col gap-1 hover:border-primary/50 transition-colors">
                  <span className="text-[10px] font-bold text-primary font-mono">{sug.text}</span>
                  <span className="text-[10px] text-on-surface-variant/90 leading-relaxed font-body">{sug.desc}</span>
                  <button
                    onClick={() => {
                      // Autocomplete/fill active task first field
                      const firstField = currentTask.fields[0];
                      const currentValue = getFieldValue(firstField.key);
                      const addition = currentValue ? currentValue + "\n" + sug.text + " - " + sug.desc : sug.text + " - " + sug.desc;
                      handleInputChange(firstField.key, addition);
                    }}
                    className="text-[9px] text-secondary hover:text-white font-bold text-left mt-2 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    Salin ke Input
                  </button>
                </div>
              ))}
            </div>

            {/* Tip card */}
            <div className="bg-surface-container-lowest/50 p-3 rounded-lg border border-dashed border-outline-glow/60 flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
              <p className="text-[9px] text-on-surface-variant leading-relaxed">
                Tuliskan data Anda dengan jujur. AI akan membantu melengkapi, namun pondasi dasar berasal dari riset empirik Anda.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
