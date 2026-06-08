"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

export default function SalesDecksPage() {
  const {
    activeWorkspace,
    personas,
    salesDecks,
    generateSalesDeck,
    updateGtmAsset
  } = useWorkspace();

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [downloadingDeck, setDownloadingDeck] = useState(false);

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading sales deck panel...
      </div>
    );
  }

  const workspacePersonas = personas[activeWorkspace.id] || [];
  const activePersonaId = selectedPersonaId || (workspacePersonas[0]?.id || "");
  const selectedPersona = workspacePersonas.find(p => p.id === activePersonaId);

  const workspaceDecks = salesDecks[activeWorkspace.id] || [];
  const currentDeck = workspaceDecks.find(d => d.personaId === activePersonaId);

  const steps = [
    "IVA memproses kerangka penawaran (storyboard)...",
    "Menyusun slide pembuka & rumusan masalah...",
    "Menyusun analisis kegagalan cloud/jaringan...",
    "Merumuskan slide detail solusi & arsitektur lokal...",
    "Menyusun pilar model bisnis & monetisasi...",
    "Memformulasikan slide penutup (call to action)..."
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
    }, 400);

    try {
      await generateSalesDeck(activeWorkspace.id, activePersonaId);
      setActiveSlideIdx(0);
    } catch (err) {
      clearInterval(interval);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Gagal membuat sales deck: ${errMsg || "Kredit tidak mencukupi."}`);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleUpdateSlideField = (key: "title" | "subtitle" | "notes", value: string) => {
    if (!currentDeck) return;
    const slides = [...currentDeck.slides];
    slides[activeSlideIdx] = { ...slides[activeSlideIdx], [key]: value };
    updateGtmAsset(activeWorkspace.id, "sales_deck", currentDeck.id, { slides });
  };

  const handleUpdateBulletPoint = (bulletIdx: number, value: string) => {
    if (!currentDeck) return;
    const slides = [...currentDeck.slides];
    const bulletPoints = [...slides[activeSlideIdx].bulletPoints];
    bulletPoints[bulletIdx] = value;
    slides[activeSlideIdx] = { ...slides[activeSlideIdx], bulletPoints };
    updateGtmAsset(activeWorkspace.id, "sales_deck", currentDeck.id, { slides });
  };

  const handleDownloadDeck = () => {
    if (!currentDeck) return;
    setDownloadingDeck(true);

    const slides = currentDeck.slides.map((slide, idx) => `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 3rem;background:#0c1324;color:#dce2fa;font-family:sans-serif;">
        <div style="max-width:900px;width:100%;text-align:center;">
          <p style="font-size:12px;color:#5de6ff;font-family:monospace;margin-bottom:0.5rem;">${activeWorkspace.name} // PITCH DECK</p>
          <p style="font-size:11px;color:#5de6ff;opacity:0.5;margin-bottom:2rem;">Slide ${idx + 1} of ${currentDeck.slides.length}</p>
          <h1 style="font-size:2rem;font-weight:900;background:linear-gradient(to right,#c0c1ff,#5de6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.3;margin-bottom:0.75rem;">${slide.title}</h1>
          ${slide.subtitle ? `<p style="color:#5de6ff;font-family:monospace;font-size:13px;margin-bottom:2rem;">${slide.subtitle}</p>` : ''}
          <ul style="list-style:none;padding:0;max-width:700px;margin:0 auto;text-align:left;">
            ${slide.bulletPoints.map(bp => `<li style="margin-bottom:0.75rem;font-size:14px;color:#dce2fa;padding-left:1.5rem;position:relative;"><span style="position:absolute;left:0;color:#5de6ff;">▶</span> ${bp}</li>`).join("")}
          </ul>
        </div>
      </div>`).join("\n");

    const htmlContent = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${activeWorkspace.name} — Pitch Deck</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#0c1324;}</style></head><body>${slides}</body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeWorkspace.name.replace(/\s+/g, "_")}_Pitch_Deck.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadingDeck(false);
  };

  const activeSlide = currentDeck?.slides?.[activeSlideIdx];

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative font-sans">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">slideshow</span>
            <span>Go-To-Market // Pitch Decks</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Sales Presentation Decks</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Rancang draf presentasi pitch deck investor atau proposal kemitraan B2B yang didorong oleh temuan riset.
          </p>
        </div>

        {/* Persona Select Dropdown */}
        {workspacePersonas.length > 0 && (
          <div className="flex items-center gap-2 bg-surface-container-high/40 border border-outline-glow/50 rounded-lg p-1.5 backdrop-blur-sm self-start">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase px-2">Untuk Persona:</span>
            <select
              value={activePersonaId}
              onChange={(e) => {
                setSelectedPersonaId(e.target.value);
                setActiveSlideIdx(0);
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

      {/* Main Content Workspace */}
      <div className="flex-1 min-h-0">
        {workspacePersonas.length === 0 ? (
          /* Locked State */
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 h-[400px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40 animate-pulse">
              <span className="material-symbols-outlined text-4xl">lock</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">Sales Deck Terkunci</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Anda harus menyelesaikan dan membuat minimal **satu target persona** di menu Personas sebelum dapat menyusun pitch deck.
              </p>
            </div>
            <a
              href="/dashboard/personas"
              className="mt-2 bg-primary text-surface-dim font-bold px-5 py-3 rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
            >
              Buat Persona Pertama
            </a>
          </div>
        ) : isGenerating ? (
          /* AI Progress Loader */
          <div className="glass-panel border border-outline-glow rounded-xl p-10 flex flex-col items-center justify-center text-center h-[500px] gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(167, 139, 250, 0.4)] animate-pulse">
                <span className="material-symbols-outlined text-surface-dim font-bold text-3xl animate-spin">sync</span>
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-secondary rounded-full border-2 border-surface-container"></span>
            </div>

            <div className="space-y-2">
              <h3 className="font-headline font-bold text-sm text-primary">IVA Menyusun Rangka Pitch Deck...</h3>
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
              Memotong 3,000 Kredit
            </span>
          </div>
        ) : currentDeck ? (
          /* Interactive Slideshow Deck View */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full min-h-0 items-stretch">
            
            {/* Left Box: Slides Thumbnail Sidebar (2.5 / 12) */}
            <div className="xl:col-span-3 glass-panel border border-outline-glow rounded-xl p-3 flex flex-col gap-3 overflow-y-auto max-h-[600px] xl:max-h-[calc(100vh-170px)] custom-scrollbar">
              <span className="font-mono text-[9px] text-on-surface-variant/50 uppercase tracking-widest border-b border-outline-glow/20 pb-2 mb-1 px-1">
                Daftar Slide Dek
              </span>
              <div className="flex flex-col gap-2.5">
                {currentDeck.slides.map((slide, idx) => {
                  const isSlideActive = idx === activeSlideIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1.5 cursor-pointer relative group ${ isSlideActive ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-low border-outline-glow/30 hover:bg-surface-container/50 text-on-surface" }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-[9px] text-on-surface-variant font-bold">SLIDE {idx + 1}</span>
                        {isSlideActive && <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_5px_#5de6ff]"></span>}
                      </div>
                      <span className="font-headline font-bold text-[10px] truncate max-w-[90%] block">{slide.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Box: Slide Preview Canvas (6 / 12) */}
            <div className="xl:col-span-6 flex flex-col gap-3 min-h-0 justify-center">
              {activeSlide && (
                <div className="flex-1 bg-surface-deep border border-outline-glow rounded-xl aspect-video flex flex-col p-8 justify-center relative overflow-hidden">
                  
                  {/* Glowing decoration circle in background */}
                  <div className="absolute -top-1/4 -right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                  <div className="absolute -bottom-1/4 -left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] pointer-events-none"></div>

                  {/* Header bar branding */}
                  <div className="absolute top-4 left-6 right-6 flex justify-between items-center text-[9px] font-mono text-on-surface-variant/40 border-b border-outline-glow/10 pb-1.5">
                    <span>{activeWorkspace.name} {"// PITCH DECK"}</span>
                    <span>Slide {activeSlideIdx + 1} of {currentDeck.slides.length}</span>
                  </div>

                  {/* Slide Content */}
                  <div className="space-y-4 my-auto relative z-10">
                    <div>
                      <h2 className="font-headline font-black text-lg md:text-xl leading-tight max-w-lg">
                        {activeSlide.title}
                      </h2>
                      {activeSlide.subtitle && (
                        <p className="text-[10px] text-secondary font-mono tracking-wide mt-1">
                          {activeSlide.subtitle}
                        </p>
                      )}
                    </div>
                    <ul className="space-y-2.5 pt-2 text-[10px] text-on-surface-variant leading-relaxed max-w-md font-body">
                      {activeSlide.bulletPoints.map((bp, bpIdx) => (
                        <li key={bpIdx} className="flex gap-2.5 items-start">
                          <span className="material-symbols-outlined text-xs text-secondary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                          </span>
                          <span className="leading-relaxed">{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer decoration */}
                  <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[8px] font-mono text-on-surface-variant/35">
                    <span>CONFIDENTIAL // {activeWorkspace.url || "hipmipreneur.com"}</span>
                    <span>© {new Date().getFullYear()}</span>
                  </div>
                </div>
              )}

              {/* Slider Navigation Buttons */}
              <div className="flex justify-between items-center bg-surface-container-high/40 p-2.5 border border-outline-glow rounded-lg backdrop-blur-sm shrink-0">
                <button
                  disabled={activeSlideIdx === 0}
                  onClick={() => setActiveSlideIdx(prev => Math.max(0, prev - 1))}
                  className="bg-surface-container-high border border-outline-glow hover:border-primary text-on-surface text-[10px] font-semibold px-4 py-2 rounded flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                  <span>Previous</span>
                </button>
                
                <span className="text-[10px] font-mono text-on-surface-variant">
                  Slide {activeSlideIdx + 1} / {currentDeck.slides.length}
                </span>

                <button
                  disabled={activeSlideIdx === currentDeck.slides.length - 1}
                  onClick={() => setActiveSlideIdx(prev => Math.min(currentDeck.slides.length - 1, prev + 1))}
                  className="bg-surface-container-high border border-outline-glow hover:border-primary text-on-surface text-[10px] font-semibold px-4 py-2 rounded flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Right Box: Presenter Notes & Content Outline Editor (3.5 / 12) */}
            <div className="xl:col-span-3 glass-panel border border-outline-glow rounded-xl p-4 flex flex-col gap-4 overflow-y-auto max-h-[600px] xl:max-h-[calc(100vh-170px)] custom-scrollbar">
              
              {/* Speaker Notes Area */}
              <div className="space-y-2 border-b border-outline-glow/20 pb-4 shrink-0 font-body">
                <div className="flex items-center gap-1.5 text-primary text-[10px] font-mono uppercase tracking-wider">
                  <span className="material-symbols-outlined text-xs">speaker_notes</span>
                  <span>Catatan Presenter (Speaker Notes)</span>
                </div>
                <textarea
                  rows={4}
                  value={activeSlide?.notes || ""}
                  onChange={(e) => handleUpdateSlideField("notes", e.target.value)}
                  className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg p-2.5 text-[10.5px] text-on-surface-variant leading-relaxed focus:border-primary outline-none transition-all resize-none shadow-inner"
                  placeholder="Ketik catatan presentasi Anda di sini..."
                />
              </div>

              {/* Slide Text Content Editor */}
              <div className="space-y-4 flex-1 text-xs">
                <span className="font-mono text-[9px] text-on-surface-variant/50 uppercase tracking-widest block">
                  Edit Outline Slide
                </span>
                
                <div className="space-y-1">
                  <label className="block font-bold text-on-surface">Judul Slide</label>
                  <input
                    type="text"
                    value={activeSlide?.title || ""}
                    onChange={(e) => handleUpdateSlideField("title", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all font-bold font-headline"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-on-surface">Sub-Judul / Label</label>
                  <input
                    type="text"
                    value={activeSlide?.subtitle || ""}
                    onChange={(e) => handleUpdateSlideField("subtitle", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-secondary focus:border-primary outline-none transition-all font-semibold font-mono"
                  />
                </div>

                {/* Bullets outline */}
                <div className="space-y-2 border-t border-outline-glow/15 pt-3">
                  <label className="block font-bold text-on-surface">Butir Presentasi (Bullets)</label>
                  {activeSlide?.bulletPoints.map((bp, bpIdx) => (
                    <div key={bpIdx} className="flex gap-2 items-center">
                      <span className="text-[10px] text-on-surface-variant font-mono">#{bpIdx + 1}</span>
                      <input
                        type="text"
                        value={bp}
                        onChange={(e) => handleUpdateBulletPoint(bpIdx, e.target.value)}
                        className="flex-1 bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-1.5 text-[10.5px] text-on-surface-variant focus:border-primary outline-none transition-all font-body"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* PDF Compile action */}
              <div className="border-t border-outline-glow/20 pt-3 shrink-0">
                <button
                  onClick={handleDownloadDeck}
                  disabled={downloadingDeck}
                  className="w-full py-2.5 bg-secondary text-surface-dim font-headline font-bold rounded-lg text-xs hover:bg-secondary-fixed transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm animate-spin" style={{ display: downloadingDeck ? "inline" : "none" }}>sync</span>
                  <span className="material-symbols-outlined text-sm font-bold" style={{ display: downloadingDeck ? "none" : "inline" }}>download</span>
                  <span>{downloadingDeck ? "Membuat PDF..." : "Unduh PDF Presentasi"}</span>
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* Empty State View */
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 h-[400px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40 animate-pulse">
              <span className="material-symbols-outlined text-4xl">slideshow</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">Sales Presentation Deck Belum Dibuat</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                Formulasikan draf pitch deck presentasi otomatis berbasis pilar messaging persona <span className="text-primary font-semibold font-mono">{selectedPersona?.name}</span>.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="mt-2 flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-3 rounded-lg text-xs transition-all cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-base">smart_toy</span>
              <span>Buat Pitch Deck (3,000 Kredit)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
