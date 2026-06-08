"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

export default function PersonasPage() {
  const {
    activeWorkspace,
    customerSegments,
    personas,
    generatePersona,
    updatePersona
  } = useWorkspace();

  const [selectedSegId, setSelectedSegId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editArchetype, setEditArchetype] = useState("");
  const [editQuote, setEditQuote] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // BUG FIX: Clean up interval on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading buyer personas...
      </div>
    );
  }

  const workspaceSegments = customerSegments[activeWorkspace.id] || [];
  
  // Set default selected segment if empty
  const activeSegId = selectedSegId || (workspaceSegments[0]?.id || "");
  const selectedSegment = workspaceSegments.find(s => s.id === activeSegId);

  // Find persona for the active segment
  const workspacePersonas = personas[activeWorkspace.id] || [];
  const currentPersona = workspacePersonas.find(p => p.segmentId === activeSegId);

  const steps = [
    "IVA memuat transkrip penelitian...",
    "Clustering keluhan utama konsumen...",
    "Memetakan prioritas inisiatif & kriteria keputusan...",
    "Merumuskan sudut pesan pemasaran (messaging angles)...",
    "Menyusun profil persona akhir..."
  ];

  const handleGenerate = async () => {
    // BUG FIX: Guard against empty segment
    if (!activeSegId || !workspaceSegments.length || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep(0);

    // Simulated multi-step AI loader progress
    const interval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 400);
    intervalRef.current = interval;

    try {
      await generatePersona(activeWorkspace.id, activeSegId);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Gagal membuat persona: ${errMsg || "Kredit tidak mencukupi."}`);
    } finally {
      clearInterval(interval);
      intervalRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleOpenEdit = () => {
    if (!currentPersona) return;
    setEditName(currentPersona.name);
    setEditArchetype(currentPersona.archetype);
    setEditQuote(currentPersona.coreQuote);
    setEditSummary(currentPersona.summary);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPersona) return;

    updatePersona(activeWorkspace.id, currentPersona.id, {
      name: editName,
      archetype: editArchetype,
      coreQuote: editQuote,
      summary: editSummary
    });
    setEditModalOpen(false);
  };

  const exportToMarkdown = () => {
    if (!currentPersona) return;
    
    const mdContent = `# Buyer Persona: ${currentPersona.name} - ${currentPersona.archetype}
    
> "${currentPersona.coreQuote}"

## Ringkasan Profil
${currentPersona.summary}

- **Rentang Usia:** ${currentPersona.ageRange}
- **Peran Pekerjaan:** ${currentPersona.jobRoles}

## Prioritas Inisiatif
${currentPersona.priorityInitiatives.map(item => `- ${item}`).join("\n")}

## Masalah & Keluhan Utama (Key Pains)
${currentPersona.keyPains.map(item => `- ${item}`).join("\n")}

## Hasil yang Diharapkan (Desired Outcomes)
${currentPersona.desiredOutcomes.map(item => `- ${item}`).join("\n")}

## Proses Pengambilan Keputusan
${currentPersona.decisionMaking.map(item => `- ${item}`).join("\n")}

## Kriteria Evaluasi Solusi
${currentPersona.evaluationCriteria.map(item => `- ${item}`).join("\n")}

## Sudut Pesan Pemasaran (Messaging Angles)
${currentPersona.messagingAngles.map(item => `- ${item}`).join("\n")}
    `;

    navigator.clipboard.writeText(mdContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">assignment_ind</span>
            <span>Go-To-Market // Buyer Personas</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Target Buyer Personas</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Ubah riset pelanggan menjadi profil pembeli yang detail. Persona memandu sudut pesan pemasaran dan desain GTM Anda.
          </p>
        </div>

        {/* Segment Picker */}
        <div className="flex items-center gap-2 bg-surface-container-high/40 border border-outline-glow/50 rounded-lg p-1.5 backdrop-blur-sm self-start">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase px-2">Segmen:</span>
          <select
            value={activeSegId}
            onChange={(e) => setSelectedSegId(e.target.value)}
            className="bg-surface-deep/80 border border-outline-glow/30 text-xs rounded px-2.5 py-1 text-on-surface outline-none cursor-pointer focus:border-primary transition-all font-semibold"
          >
            {workspaceSegments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content Pane */}
      <div className="flex-1 min-h-0">
        {isGenerating ? (
          /* AI Generating Progress Screen */
          <div className="glass-panel border border-outline-glow rounded-xl p-10 flex flex-col items-center justify-center text-center h-[500px] gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(167, 139, 250, 0.4)] animate-pulse">
                <span className="material-symbols-outlined text-surface-dim font-bold text-3xl animate-spin">sync</span>
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-secondary rounded-full border-2 border-surface-container"></span>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-sm text-primary">IVA Sedang Menyusun Persona Pembeli...</h3>
              <p className="text-[11px] font-mono text-secondary max-w-sm">
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
              Memotong 1,500 Kredit
            </span>
          </div>
        ) : currentPersona ? (
          /* Persona Visual Dashboard View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0">
            
            {/* Left Box: Persona Core Card (4/12) */}
            <div className="lg:col-span-4 glass-panel border border-outline-glow rounded-xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[600px] lg:max-h-[calc(100vh-170px)] lg:sticky lg:top-4">
              {/* Profile Avatar Card */}
              <div className="flex flex-col items-center text-center gap-3 border-b border-outline-glow/20 pb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(167, 139, 250, 0.2)] bg-surface-container relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={currentPersona.name}
                    className="w-full h-full object-cover"
                    src={currentPersona.avatarUrl}
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full"></div>
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold text-on-surface">{currentPersona.name}</h2>
                  <p className="font-mono text-[9px] text-secondary uppercase tracking-wider mt-0.5">
                    {currentPersona.archetype}
                  </p>
                </div>
                <div className="flex gap-4 font-mono text-[10px] text-on-surface-variant/80 border-t border-outline-glow/10 pt-2 w-full justify-center">
                  <span>Usia: {currentPersona.ageRange}</span>
                  <span>•</span>
                  <span>Peran: {currentPersona.jobRoles}</span>
                </div>
              </div>

              {/* Core Quote Box */}
              <div className="bg-surface-container-low/60 border border-outline-glow/30 p-3.5 rounded-lg text-xs italic text-on-surface text-center shadow-inner relative">
                <span className="absolute -top-2 left-4 text-3xl font-serif text-primary/30 leading-none">&ldquo;</span>
                <p className="relative z-10 leading-relaxed font-body">&ldquo;{currentPersona.coreQuote}&rdquo;</p>
              </div>

              {/* Summary narrative */}
              <div className="space-y-1 bg-surface-container-lowest/30 p-3 rounded-lg border border-outline-glow/20 text-xs">
                <span className="font-bold text-[10px] text-primary uppercase block">Deskripsi Profil</span>
                <p className="text-on-surface-variant leading-relaxed font-body">
                  {currentPersona.summary}
                </p>
              </div>

              {/* Quick Actions & Actions Bar */}
              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-outline-glow/20">
                <button
                  onClick={handleOpenEdit}
                  className="w-full py-2 bg-surface-container-high border border-outline-glow hover:border-primary text-on-surface font-semibold rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">edit</span>
                  <span>Edit Profil Persona</span>
                </button>
                <button
                  onClick={exportToMarkdown}
                  className="w-full py-2 bg-surface-container-high border border-outline-glow hover:border-primary text-on-surface font-semibold rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  <span>{copiedMd ? "MD Disalin!" : "Salin Format Markdown"}</span>
                </button>
              </div>
            </div>

            {/* Right Box: Profile Details Grid (8/12) */}
            <div className="lg:col-span-8 glass-panel border border-outline-glow rounded-xl p-5 overflow-y-auto max-h-[600px] lg:max-h-[calc(100vh-170px)] custom-scrollbar">
              <div className="space-y-6">
                
                {/* Category: Initiatives and Key Pains */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low/40 border border-outline-glow/30 p-4 rounded-xl space-y-3">
                    <h3 className="font-headline font-bold text-xs text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-sm text-secondary">trending_up</span>
                      Inisiatif Utama (Prioritas)
                    </h3>
                    <ul className="space-y-2 text-[11px] text-on-surface-variant font-body">
                      {currentPersona.priorityInitiatives.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-secondary mt-0.5">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-surface-container-low/40 border border-outline-glow/30 p-4 rounded-xl space-y-3">
                    <h3 className="font-headline font-bold text-xs text-error flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Masalah Utama (Key Pains)
                    </h3>
                    <ul className="space-y-2 text-[11px] text-on-surface-variant font-body">
                      {currentPersona.keyPains.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-error mt-0.5">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Category: Outcomes & Decisions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low/40 border border-outline-glow/30 p-4 rounded-xl space-y-3">
                    <h3 className="font-headline font-bold text-xs text-secondary flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Hasil yang Diharapkan
                    </h3>
                    <ul className="space-y-2 text-[11px] text-on-surface-variant font-body">
                      {currentPersona.desiredOutcomes.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-secondary mt-0.5">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-surface-container-low/40 border border-outline-glow/30 p-4 rounded-xl space-y-3">
                    <h3 className="font-headline font-bold text-xs text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                      Faktor Pengambil Keputusan
                    </h3>
                    <ul className="space-y-2 text-[11px] text-on-surface-variant font-body">
                      {currentPersona.decisionMaking.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Category: Criteria & Messaging Angles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low/40 border border-outline-glow/30 p-4 rounded-xl space-y-3">
                    <h3 className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-sm text-secondary">fact_check</span>
                      Kriteria Evaluasi
                    </h3>
                    <ul className="space-y-2 text-[11px] text-on-surface-variant font-body">
                      {currentPersona.evaluationCriteria.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-secondary mt-0.5">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-surface-container-low/40 border border-outline-glow/30 p-4 rounded-xl space-y-3">
                    <h3 className="font-headline font-bold text-xs text-secondary flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-sm text-primary animate-pulse">campaign</span>
                      Sudut Pesan Pemasaran (GTM Angles)
                    </h3>
                    <ul className="space-y-2 text-[11px] text-on-surface-variant font-body">
                      {currentPersona.messagingAngles.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="leading-relaxed font-semibold">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* Empty State View */
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 h-[450px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40 animate-pulse">
              <span className="material-symbols-outlined text-4xl">assignment_ind</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">Persona Pembeli Belum Dibuat</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Riset pembeli untuk segmen <span className="text-primary font-semibold font-mono">{selectedSegment?.name}</span> siap dipetakan. Jalankan IVA untuk mensintesis detail pembeli.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="mt-2 flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-3 rounded-lg text-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">smart_toy</span>
              <span>Buat Persona dengan AI (1,500 Kredit)</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">edit</span>
              Edit Profil Persona
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Perbarui ringkasan atau kutipan utama persona agar lebih mewakili prospek Anda.
            </p>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Nama Persona</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Archetype Label</label>
                <input
                  type="text"
                  required
                  value={editArchetype}
                  onChange={(e) => setEditArchetype(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Kutipan Utama (Core Quote)</label>
                <textarea
                  required
                  rows={2}
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Ringkasan Profil (Narrative)</label>
                <textarea
                  required
                  rows={3}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
