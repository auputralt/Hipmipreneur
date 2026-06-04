"use client";

import React, { useState } from "react";
import { useWorkspace, PositioningDoc } from "../../../context/WorkspaceContext";

export default function PositioningPage() {
  const {
    activeWorkspace,
    personas,
    positioningDocs,
    generatePositioning,
    updateGtmAsset
  } = useWorkspace();

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [copiedMd, setCopiedMd] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("corePositioning");

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading positioning panel...
      </div>
    );
  }

  const workspacePersonas = personas[activeWorkspace.id] || [];
  const activePersonaId = selectedPersonaId || (workspacePersonas[0]?.id || "");
  const selectedPersona = workspacePersonas.find(p => p.id === activePersonaId);

  const workspaceDocs = positioningDocs[activeWorkspace.id] || [];
  const currentDoc = workspaceDocs.find(doc => doc.personaId === activePersonaId);

  const steps = [
    "IVA menganalisis data persona...",
    "Merumuskan pernyataan positioning (For/Who/Is)...",
    "Menyusun keunggulan brand & alasan percaya (RTBs)...",
    "Membentuk 3 messaging pillars utama...",
    "Menyusun elevator pitch berdurasi 30 detik..."
  ];

  const handleGenerate = async () => {
    if (!activePersonaId || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep(0);

    const interval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 450);

    try {
      await generatePositioning(activeWorkspace.id, activePersonaId);
    } catch (err) {
      clearInterval(interval);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Gagal membuat positioning: ${errMsg || "Kredit tidak mencukupi."}`);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleUpdateField = (field: keyof PositioningDoc, value: PositioningDoc[keyof PositioningDoc]) => {
    if (!currentDoc) return;
    updateGtmAsset(activeWorkspace.id, "positioning", currentDoc.id, { [field]: value });
  };

  const handleUpdatePillar = (index: number, key: "title" | "body", value: string) => {
    if (!currentDoc) return;
    const pillars = [...currentDoc.messagingPillars];
    pillars[index] = { ...pillars[index], [key]: value };
    updateGtmAsset(activeWorkspace.id, "positioning", currentDoc.id, { messagingPillars: pillars });
  };

  const handleUpdateRTB = (index: number, value: string) => {
    if (!currentDoc) return;
    const rtbs = [...currentDoc.reasonsToBelieve];
    rtbs[index] = value;
    updateGtmAsset(activeWorkspace.id, "positioning", currentDoc.id, { reasonsToBelieve: rtbs });
  };

  const exportToMarkdown = () => {
    if (!currentDoc || !selectedPersona) return;

    const mdContent = `# Positioning & Messaging Guide: ${selectedPersona.name}
    
## 1. Core Positioning Statement
${currentDoc.corePositioning}

## 2. Target Audience Profile
${currentDoc.targetAudience}

## 3. Market Context
${currentDoc.marketContext}

## 4. Unique Value Proposition (UVP)
${currentDoc.uvp}

## 5. Brand Voice & Tone
${currentDoc.brandVoice}

## 6. Reasons to Believe (RTB)
${currentDoc.reasonsToBelieve.map((rtb, idx) => `${idx + 1}. ${rtb}`).join("\n")}

## 7. Core Messaging Pillars
${currentDoc.messagingPillars.map(p => `### ${p.title}\n${p.body}`).join("\n\n")}

## 8. 30-Second Elevator Pitch
${currentDoc.elevatorPitch}
    `;

    navigator.clipboard.writeText(mdContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const outlineItems = [
    { id: "corePositioning", label: "1. Core Positioning" },
    { id: "targetAudience", label: "2. Target Audience" },
    { id: "marketContext", label: "3. Market Context" },
    { id: "uvp", label: "4. Value Proposition" },
    { id: "brandVoice", label: "5. Brand Voice" },
    { id: "rtbs", label: "6. Reasons to Believe" },
    { id: "pillars", label: "7. Messaging Pillars" },
    { id: "elevatorPitch", label: "8. Elevator Pitch" }
  ];

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0 font-sans">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">campaign</span>
            <span>Go-To-Market // Positioning Guide</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Positioning & Messaging</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Susun panduan positioning produk Anda. Rancang pesan inti, voice tone, dan elevator pitch berlandaskan riset pasar.
          </p>
        </div>

        {/* Persona Select Dropdown */}
        {workspacePersonas.length > 0 && (
          <div className="flex items-center gap-2 bg-surface-container-high/40 border border-outline-glow/50 rounded-lg p-1.5 backdrop-blur-sm self-start">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase px-2">Berdasarkan Persona:</span>
            <select
              value={activePersonaId}
              onChange={(e) => {
                setSelectedPersonaId(e.target.value);
                setActiveSection("corePositioning");
              }}
              className="bg-surface-deep/80 border border-outline-glow/30 text-xs rounded px-2.5 py-1 text-on-surface outline-none cursor-pointer focus:border-primary transition-all font-semibold"
            >
              {workspacePersonas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.archetype})
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Viewport content */}
      <div className="flex-1 min-h-0">
        {workspacePersonas.length === 0 ? (
          /* Locked State - No Persona Created */
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 h-[400px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40 animate-pulse">
              <span className="material-symbols-outlined text-4xl">lock</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">Pernyataan Positioning Terkunci</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Anda harus menyelesaikan dan membuat minimal **satu target persona** di menu Personas sebelum dapat merumuskan pesan positioning.
              </p>
            </div>
            <a
              href="/dashboard/personas"
              className="mt-2 bg-primary text-surface-dim font-bold px-5 py-3 rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
            >
              Buat Target Persona
            </a>
          </div>
        ) : isGenerating ? (
          /* AI Progress Loader */
          <div className="glass-panel border border-outline-glow rounded-xl p-10 flex flex-col items-center justify-center text-center h-[500px] gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(192,193,255,0.6)] animate-pulse">
                <span className="material-symbols-outlined text-surface-dim font-bold text-3xl animate-spin">sync</span>
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-secondary rounded-full border-2 border-surface-container"></span>
            </div>

            <div className="space-y-2">
              <h3 className="font-headline font-bold text-sm text-primary">IVA Merancang Positioning & Messaging...</h3>
              <p className="text-[11px] font-mono text-secondary max-w-sm h-8">
                {steps[generationStep]}
              </p>
            </div>

            <div className="w-64 h-1.5 bg-surface-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-300 rounded-full"
                style={{ width: `${((generationStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-on-surface-variant font-mono uppercase tracking-widest">
              Memotong 2,000 Kredit
            </span>
          </div>
        ) : currentDoc ? (
          /* Split Layout Editor View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0 items-start">
            
            {/* Left Column: Navigator & Sidebar (3/12) */}
            <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-4">
              <div className="glass-panel border border-outline-glow rounded-xl p-4 flex flex-col gap-2">
                <span className="font-mono text-[9px] text-on-surface-variant/50 uppercase tracking-widest border-b border-outline-glow/20 pb-2 mb-1">
                  Daftar Konten Panduan
                </span>
                {outlineItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all font-semibold cursor-pointer ${
                      activeSection === item.id
                        ? "bg-primary/10 border-l-4 border-primary text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high/30 hover:text-on-surface"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Document Meta Information */}
              <div className="glass-panel border border-outline-glow rounded-xl p-4 space-y-3.5 text-[10px]">
                <div className="border-b border-outline-glow/20 pb-2 font-mono text-on-surface-variant/50 uppercase tracking-widest">
                  Metadata Dokumen
                </div>
                <div className="space-y-2 text-on-surface-variant/80 font-body">
                  <div className="flex justify-between">
                    <span>Target Persona:</span>
                    <span className="font-semibold text-on-surface">{selectedPersona?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Riset Dasar:</span>
                    <span className="text-secondary font-semibold font-mono">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metodologi AI:</span>
                    <span className="font-mono text-primary font-bold">GPT-4o Agent</span>
                  </div>
                </div>
                <button
                  onClick={exportToMarkdown}
                  className="w-full mt-2 py-2 bg-primary text-surface-dim font-bold rounded text-xs flex items-center justify-center gap-1 cursor-pointer hover:shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined text-sm font-bold">download</span>
                  <span>{copiedMd ? "MD Disalin!" : "Salin Markdown"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Dynamic Form Editor (9/12) */}
            <div className="lg:col-span-9 glass-panel border border-outline-glow rounded-xl p-6 min-h-[450px] lg:max-h-[calc(100vh-170px)] overflow-y-auto custom-scrollbar font-body">
              
              {/* Core Positioning Section */}
              {activeSection === "corePositioning" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-secondary">view_quilt</span>
                      Core Positioning Statement
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Rumusan posisi dasar brand di pasar (For [Who] / Our product is [Category] / Unlike [Competitors] / We [Unfair Advantage]).
                    </p>
                  </div>
                  <textarea
                    rows={6}
                    value={currentDoc.corePositioning}
                    onChange={(e) => handleUpdateField("corePositioning", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-xl p-4 text-xs text-on-surface leading-relaxed focus:border-primary outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              )}

              {/* Target Audience Section */}
              {activeSection === "targetAudience" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-secondary">groups</span>
                      Target Audience Profile
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Deskripsi kelompok pembeli primer, sekunder, dan influencer keputusan.
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    value={currentDoc.targetAudience}
                    onChange={(e) => handleUpdateField("targetAudience", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-xl p-4 text-xs text-on-surface leading-relaxed focus:border-primary outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              )}

              {/* Market Context Section */}
              {activeSection === "marketContext" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-secondary">insights</span>
                      Market Context & Status Quo Failures
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Konteks pasar saat ini dan mengapa solusi alternatif gagal memuaskan keluhan pembeli.
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    value={currentDoc.marketContext}
                    onChange={(e) => handleUpdateField("marketContext", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-xl p-4 text-xs text-on-surface leading-relaxed focus:border-primary outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              )}

              {/* UVP Section */}
              {activeSection === "uvp" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-secondary">star</span>
                      Unique Value Proposition (UVP)
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Kalimat penawaran tunggal yang menjelaskan nilai paling berharga dari produk Anda.
                    </p>
                  </div>
                  <textarea
                    rows={4}
                    value={currentDoc.uvp}
                    onChange={(e) => handleUpdateField("uvp", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-xl p-4 text-xs text-on-surface leading-relaxed focus:border-primary outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              )}

              {/* Brand Voice Section */}
              {activeSection === "brandVoice" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-secondary">record_voice_over</span>
                      Brand Voice & Tone
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Karakter kepribadian komunikasi brand dalam menyampaikan pesan ke pelanggan.
                    </p>
                  </div>
                  <textarea
                    rows={4}
                    value={currentDoc.brandVoice}
                    onChange={(e) => handleUpdateField("brandVoice", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-xl p-4 text-xs text-on-surface leading-relaxed focus:border-primary outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              )}

              {/* Reasons to Believe Section */}
              {activeSection === "rtbs" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-secondary">verified</span>
                      Reasons to Believe (RTB)
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                      Bukti kredibilitas, lisensi, atau inovasi teknologi yang membuktikan bahwa UVP Anda nyata.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {currentDoc.reasonsToBelieve.map((rtb, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-glow flex items-center justify-center font-mono text-xs text-primary font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={rtb}
                          onChange={(e) => handleUpdateRTB(idx, e.target.value)}
                          className="flex-1 bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messaging Pillars Section */}
              {activeSection === "pillars" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-secondary">architecture</span>
                      Core Messaging Pillars
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Tiga pilar komunikasi utama yang mendasari pembuatan konten landing page maupun slide deck pemasaran.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {currentDoc.messagingPillars.map((p, idx) => (
                      <div key={idx} className="bg-surface-container-low/50 border border-outline-glow/40 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/20 text-primary border border-primary/30 font-mono text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                            P{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) => handleUpdatePillar(idx, "title", e.target.value)}
                            className="bg-transparent font-headline font-bold text-xs text-on-surface focus:border-b border-primary outline-none py-0.5 w-full"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={p.body}
                          onChange={(e) => handleUpdatePillar(idx, "body", e.target.value)}
                          className="w-full bg-surface-container-lowest/50 border border-outline-glow/20 rounded-lg p-2.5 text-[11px] text-on-surface-variant leading-relaxed focus:border-primary outline-none transition-all resize-none font-body"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Elevator Pitch Section */}
              {activeSection === "elevatorPitch" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary animate-pulse">campaign</span>
                      30-Second Elevator Pitch
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Penjelasan bisnis singkat berdurasi 30 detik untuk dibaca di depan calon mitra, prospek, atau investor.
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    value={currentDoc.elevatorPitch}
                    onChange={(e) => handleUpdateField("elevatorPitch", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-xl p-4 text-xs text-on-surface leading-relaxed focus:border-primary outline-none transition-all resize-none shadow-inner font-body"
                  />
                </div>
              )}

            </div>
          </div>
        ) : (
          /* Empty State View */
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 h-[400px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40 animate-pulse">
              <span className="material-symbols-outlined text-4xl">campaign</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">Panduan Positioning Belum Dibuat</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                Gunakan riset dari target persona <span className="text-primary font-semibold font-mono">{selectedPersona?.name}</span> untuk merumuskan panduan positioning produk otomatis.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="mt-2 flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-3 rounded-lg text-xs shadow-[0_0_15px_rgba(192,193,255,0.3)] hover:shadow-[0_0_20px_rgba(192,193,255,0.5)] transition-all cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-base">smart_toy</span>
              <span>Draft Positioning dengan AI (2,000 Kredit)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
