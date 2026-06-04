"use client";

import React, { useState } from "react";
import { useWorkspace, LandingPageAsset } from "../../../context/WorkspaceContext";

export default function LandingPagesPage() {
  const {
    activeWorkspace,
    personas,
    landingPages,
    generateLandingPage,
    updateGtmAsset
  } = useWorkspace();

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [externalBuilderOpen, setExternalBuilderOpen] = useState(false);

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading landing page panel...
      </div>
    );
  }

  const workspacePersonas = personas[activeWorkspace.id] || [];
  const activePersonaId = selectedPersonaId || (workspacePersonas[0]?.id || "");
  const selectedPersona = workspacePersonas.find(p => p.id === activePersonaId);

  const workspaceLps = landingPages[activeWorkspace.id] || [];
  const currentLp = workspaceLps.find(lp => lp.personaId === activePersonaId);

  const steps = [
    "IVA menyerap pilar messaging...",
    "Merumuskan headline penarik perhatian...",
    "Menulis teks deskripsi subheadline...",
    "Menyusun kartu fitur utama...",
    "Menyusun daftar pertanyaan umum (FAQs)..."
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
      await generateLandingPage(activeWorkspace.id, activePersonaId);
    } catch (err) {
      clearInterval(interval);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Gagal membuat landing page: ${errMsg || "Kredit tidak mencukupi."}`);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleUpdateField = (field: keyof LandingPageAsset, value: LandingPageAsset[keyof LandingPageAsset]) => {
    if (!currentLp) return;
    updateGtmAsset(activeWorkspace.id, "landing_page", currentLp.id, { [field]: value });
  };

  const handleUpdateFeature = (index: number, key: "title" | "description", value: string) => {
    if (!currentLp) return;
    const features = [...currentLp.features];
    features[index] = { ...features[index], [key]: value };
    updateGtmAsset(activeWorkspace.id, "landing_page", currentLp.id, { features });
  };

  const handleUpdateFaq = (index: number, key: "question" | "answer", value: string) => {
    if (!currentLp) return;
    const faq = [...currentLp.faq];
    faq[index] = { ...faq[index], [key]: value };
    updateGtmAsset(activeWorkspace.id, "landing_page", currentLp.id, { faq });
  };

  const copyHtmlCode = () => {
    if (!currentLp) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentLp.heroHeadline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0c1324] text-[#dce2fa] min-h-screen font-sans">
    <!-- Navigation -->
    <nav class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <div class="font-bold text-xl text-[#c0c1ff]">${activeWorkspace.name}</div>
        <a href="#" class="bg-[#c0c1ff] text-[#1000a9] px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all">${currentLp.ctaText}</a>
    </nav>

    <!-- Hero -->
    <header class="max-w-4xl mx-auto text-center px-6 py-20 space-y-6">
        <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#c0c1ff] to-[#5de6ff] leading-tight">${currentLp.heroHeadline}</h1>
        <p class="text-lg text-gray-400 max-w-2xl mx-auto">${currentLp.heroSubheadline}</p>
        <div>
            <button class="bg-[#5de6ff] text-[#00363e] px-8 py-3.5 rounded-lg font-bold text-base hover:opacity-90 transition-all shadow-[0_0_20px_rgba(93,230,255,0.3)]">${currentLp.ctaText}</button>
        </div>
        <p class="text-xs text-gray-500 font-mono">${currentLp.socialProof}</p>
    </header>

    <!-- Features -->
    <section class="max-w-7xl mx-auto px-6 py-16">
        <h2 class="text-center font-bold text-2xl mb-12">Fitur Utama Platform</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${currentLp.features.map(f => `
            <div class="bg-[#181f31] p-6 rounded-xl border border-gray-800 space-y-3">
                <h3 class="font-bold text-lg text-[#5de6ff]">${f.title}</h3>
                <p class="text-sm text-gray-400 leading-relaxed">${f.description}</p>
            </div>
            `).join("")}
        </div>
    </section>

    <!-- FAQs -->
    <section class="max-w-3xl mx-auto px-6 py-16 border-t border-gray-800">
        <h2 class="text-center font-bold text-2xl mb-10">Pertanyaan Umum (FAQs)</h2>
        <div class="space-y-6">
            ${currentLp.faq.map(faq => `
            <div class="space-y-2">
                <h4 class="font-bold text-base text-[#c0c1ff]">${faq.question}</h4>
                <p class="text-sm text-gray-400 leading-relaxed">${faq.answer}</p>
            </div>
            `).join("")}
        </div>
    </section>
</body>
</html>`;

    navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative font-sans">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">web</span>
            <span>Go-To-Market // Landing Pages</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Landing Page Generator</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Rancang teks landing page berkinerja tinggi. Tulis headline yang memikat lalu pratinjau tampilannya secara interaktif.
          </p>
        </div>

        {/* Persona Select Dropdown */}
        {workspacePersonas.length > 0 && (
          <div className="flex items-center gap-2 bg-surface-container-high/40 border border-outline-glow/50 rounded-lg p-1.5 backdrop-blur-sm self-start">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase px-2">Untuk Persona:</span>
            <select
              value={activePersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
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
              <h3 className="font-headline font-bold text-sm text-on-surface">Landing Page Terkunci</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Anda harus memiliki minimal **satu target persona** di menu Personas sebelum dapat merancang salinan landing page.
              </p>
            </div>
            <a
              href="/dashboard/personas"
              className="mt-2 bg-primary text-surface-dim font-bold px-5 py-3 rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
            >
              Buat Persona Baru
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
              <h3 className="font-headline font-bold text-sm text-primary">IVA Merancang Salinan Landing Page...</h3>
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
        ) : currentLp ? (
          /* Split Editor & Interactive Browser Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0 items-stretch">
            
            {/* Left Column: Copywriter Editor Pane (5/12) */}
            <div className="lg:col-span-5 glass-panel border border-outline-glow rounded-xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[600px] lg:max-h-[calc(100vh-170px)] custom-scrollbar">
              <span className="font-mono text-[9px] text-on-surface-variant/50 uppercase tracking-widest border-b border-outline-glow/20 pb-2">
                Editor Salinan (Copywriting)
              </span>

              {/* Text Fields */}
              <div className="space-y-4 text-xs font-body">
                <div className="space-y-1">
                  <label className="block font-bold text-on-surface">Hero Headline</label>
                  <textarea
                    rows={2}
                    value={currentLp.heroHeadline}
                    onChange={(e) => handleUpdateField("heroHeadline", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-on-surface">Hero Subheadline</label>
                  <textarea
                    rows={3}
                    value={currentLp.heroSubheadline}
                    onChange={(e) => handleUpdateField("heroSubheadline", e.target.value)}
                    className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface-variant leading-relaxed focus:border-primary outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-on-surface">Teks Tombol CTA</label>
                    <input
                      type="text"
                      value={currentLp.ctaText}
                      onChange={(e) => handleUpdateField("ctaText", e.target.value)}
                      className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-on-surface">Bukti Sosial (Social Proof)</label>
                    <input
                      type="text"
                      value={currentLp.socialProof}
                      onChange={(e) => handleUpdateField("socialProof", e.target.value)}
                      className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface-variant focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Fitur Utama */}
                <div className="space-y-2 border-t border-outline-glow/20 pt-3">
                  <label className="block font-bold text-secondary text-xs uppercase tracking-wider">Daftar Fitur Platform</label>
                  {currentLp.features.map((f, idx) => (
                    <div key={idx} className="bg-surface-container-low/30 border border-outline-glow/20 rounded-lg p-3 space-y-2">
                      <input
                        type="text"
                        value={f.title}
                        onChange={(e) => handleUpdateFeature(idx, "title", e.target.value)}
                        className="w-full bg-transparent font-bold text-xs text-primary border-b border-outline-glow/30 focus:border-primary outline-none py-0.5"
                      />
                      <textarea
                        rows={2}
                        value={f.description}
                        onChange={(e) => handleUpdateFeature(idx, "description", e.target.value)}
                        className="w-full bg-transparent text-[11px] text-on-surface-variant leading-relaxed outline-none resize-none font-body"
                      />
                    </div>
                  ))}
                </div>

                {/* FAQs */}
                <div className="space-y-2 border-t border-outline-glow/20 pt-3">
                  <label className="block font-bold text-secondary text-xs uppercase tracking-wider">Pertanyaan Umum (FAQs)</label>
                  {currentLp.faq.map((item, idx) => (
                    <div key={idx} className="bg-surface-container-low/30 border border-outline-glow/20 rounded-lg p-3 space-y-2">
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                        className="w-full bg-transparent font-bold text-xs text-on-surface border-b border-outline-glow/30 focus:border-primary outline-none py-0.5"
                      />
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                        className="w-full bg-transparent text-[11px] text-on-surface-variant leading-relaxed outline-none resize-none font-body"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-auto pt-4 border-t border-outline-glow/20">
                <button
                  onClick={() => setExternalBuilderOpen(true)}
                  className="flex-1 py-2.5 bg-surface-container-high border border-outline-glow hover:border-primary text-on-surface font-semibold rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors font-sans"
                >
                  <span className="material-symbols-outlined text-xs">rocket_launch</span>
                  <span>Edit di Lovable / Framer</span>
                </button>
                <button
                  onClick={copyHtmlCode}
                  className="flex-1 py-2.5 bg-primary text-surface-dim font-bold rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer hover:shadow-lg transition-all font-sans"
                >
                  <span className="material-symbols-outlined text-xs font-bold">code</span>
                  <span>{copiedHtml ? "HTML Disalin!" : "Salin Kode HTML"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Responsive Browser Mockup Preview (7/12) */}
            <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
              
              {/* Preview Bar Swapper */}
              <div className="flex justify-between items-center bg-surface-container-high/40 p-2 border border-outline-glow rounded-lg backdrop-blur-sm shrink-0">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
                  <span className="text-[10px] font-mono text-on-surface-variant ml-3 bg-surface-deep/80 px-4 py-0.5 rounded border border-outline-glow/30">
                    localhost:3000/landing-preview
                  </span>
                </div>
                <div className="flex gap-1 font-mono text-[9px]">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-2 py-1 rounded cursor-pointer ${previewMode === "desktop" ? "bg-primary text-surface-dim font-bold" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-2 py-1 rounded cursor-pointer ${previewMode === "mobile" ? "bg-primary text-surface-dim font-bold" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Rendered Browser Page Box */}
              <div className="flex-1 bg-surface-deep border border-outline-glow rounded-xl overflow-hidden min-h-[400px] flex flex-col items-stretch justify-start relative bg-grid-pattern opacity-95">
                <div 
                  className={`w-full h-full p-6 overflow-y-auto custom-scrollbar flex flex-col gap-10 transition-all duration-300 ${previewMode === "mobile" ? "max-w-[360px] border-x border-outline-glow/50 bg-[#070e1e] mx-auto" : "max-w-full"}`}
                >
                  
                  {/* Mock Navbar */}
                  <div className="flex justify-between items-center border-b border-outline-glow/20 pb-3 shrink-0">
                    <span className="font-headline font-bold text-xs text-primary tracking-tight">{activeWorkspace.name}</span>
                    <span className="bg-primary/20 text-primary border border-primary/40 rounded px-2.5 py-0.5 font-bold text-[9px] cursor-pointer">
                      {currentLp.ctaText}
                    </span>
                  </div>

                  {/* Mock Hero Section */}
                  <div className="text-center py-6 space-y-4 shrink-0">
                    <h2 className="font-headline text-gradient font-black text-lg leading-tight md:text-xl max-w-lg mx-auto">
                      {currentLp.heroHeadline}
                    </h2>
                    <p className="text-[10px] text-on-surface-variant/90 leading-relaxed max-w-sm mx-auto font-body">
                      {currentLp.heroSubheadline}
                    </p>
                    <div className="pt-2">
                      <button className="bg-secondary text-surface-dim font-headline font-bold text-[10px] px-6 py-2.5 rounded-lg neon-glow-secondary cursor-pointer hover:scale-[1.02] transition-transform">
                        {currentLp.ctaText}
                      </button>
                    </div>
                    <p className="text-[8px] text-on-surface-variant/50 font-mono uppercase tracking-widest">{currentLp.socialProof}</p>
                  </div>

                  {/* Mock Features Section */}
                  <div className="space-y-4 border-t border-outline-glow/10 pt-6">
                    <h4 className="text-center font-bold text-xs text-on-surface uppercase tracking-wider">Fitur Utama</h4>
                    <div className={`grid gap-4 ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                      {currentLp.features.map((f, idx) => (
                        <div key={idx} className="bg-surface-container/60 border border-outline-glow/30 p-3.5 rounded-lg space-y-1 hover:border-primary/45 transition-colors">
                          <h5 className="font-bold text-[10px] text-secondary">{f.title}</h5>
                          <p className="text-[9px] text-on-surface-variant/80 leading-relaxed font-body">{f.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock FAQs Section */}
                  <div className="space-y-4 border-t border-outline-glow/10 pt-6 pb-6">
                    <h4 className="text-center font-bold text-xs text-on-surface uppercase tracking-wider">Pertanyaan Umum</h4>
                    <div className="space-y-3 max-w-md mx-auto">
                      {currentLp.faq.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <h5 className="font-bold text-[10px] text-primary">{item.question}</h5>
                          <p className="text-[9px] text-on-surface-variant/80 leading-relaxed font-body">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Empty State View */
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 h-[400px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40 animate-pulse">
              <span className="material-symbols-outlined text-4xl">web</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">Landing Page Belum Dibuat</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                Draft teks landing page untuk persona <span className="text-primary font-semibold font-mono">{selectedPersona?.name}</span> secara instan dan pratinjau tampilannya.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="mt-2 flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-3 rounded-lg text-xs shadow-[0_0_15px_rgba(192,193,255,0.3)] hover:shadow-[0_0_20px_rgba(192,193,255,0.5)] transition-all cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-base">smart_toy</span>
              <span>Buat Landing Page (2,000 Kredit)</span>
            </button>
          </div>
        )}
      </div>

      {/* Lovable/Framer Mockup Modal */}
      {externalBuilderOpen && (
        <div className="fixed inset-0 bg-surface-deep/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-md w-full p-6 relative text-center flex flex-col items-center gap-4">
            <button
              onClick={() => setExternalBuilderOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-surface-dim text-2xl font-bold">rocket_launch</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-headline text-base font-bold text-primary">Koneksikan ke Eksternal Website Builder</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                GTM-API Hipmipreneur siap mengirimkan struktur kode HTML/CSS salinan Anda langsung ke editor visual eksternal.
              </p>
            </div>
            
            <div className="w-full bg-surface-deep border border-outline-glow/30 rounded-lg p-3 text-left space-y-2.5 font-mono text-[10px]">
              <div className="flex justify-between border-b border-outline-glow/20 pb-1.5">
                <span className="text-on-surface-variant">Builder Partner</span>
                <span className="text-secondary font-bold">Lovable.dev / Framer AI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status API Endpoint</span>
                <span className="text-primary font-bold">READY // LISTEN</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert("GTM Integrasi: 'Ekspor data sukses! Membuka tab Lovable baru dengan draft layout Anda...'");
                setExternalBuilderOpen(false);
              }}
              className="w-full py-2.5 bg-secondary text-surface-dim font-headline font-bold rounded-lg text-xs hover:bg-secondary-fixed transition-all cursor-pointer shadow-md"
            >
              Kirim ke Lovable.dev (Ekspor Satu-Klik)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
