"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

export default function ResearchPage() {
  const {
    activeWorkspace,
    customerSegments,
    researchProjects,
    interviews,
    insightReports,
    addResearchProject,
    synthesizeResearchInsights
  } = useWorkspace();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "interviews" | "insights" | "quality">("overview");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Form States
  const [newProjName, setNewProjName] = useState("");
  const [selectedSegId, setSelectedSegId] = useState("");
  const [newProjType, setNewProjType] = useState("Validate customer problems");
  
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Filter projects by active workspace
  const workspaceProjects = activeWorkspace
    ? researchProjects.filter((p) => p.workspaceId === activeWorkspace.id)
    : [];

  // Determine active project
  const activeProject = workspaceProjects.find((p) => p.id === selectedProjectId) || workspaceProjects[0];

  const activeCanvas = activeWorkspace ? customerSegments[activeWorkspace.id] : [];

  // Get interviews for this project
  const projectInterviews = activeProject
    ? interviews.filter((i) => i.researchProjectId === activeProject.id)
    : [];

  // Get insight report
  const insightReport = activeProject ? insightReports[activeProject.id] : null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !newProjName.trim()) return;

    // Use first segment if none selected
    const segmentId = selectedSegId || (activeCanvas?.[0]?.id || "seg-default");

    addResearchProject(activeWorkspace.id, newProjName, segmentId, newProjType);
    setNewProjName("");
    setCreateModalOpen(false);
  };

  const handleSynthesize = async () => {
    if (!activeProject || isSynthesizing) return;
    setIsSynthesizing(true);
    try {
      await synthesizeResearchInsights(activeProject.id);
      alert("Sintesis berhasil! Insight baru kini tersedia di tab Insights.");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Kredit kurang.";
      alert(`Gagal mensintesis: ${errorMsg}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const copyPublicLink = () => {
    if (!activeProject) return;
    const url = `${window.location.origin}/interviews/public/${activeProject.id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading research hub...
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      {/* Page Header */}
      <header className="flex justify-between items-center border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">science</span>
            <span>Validation // Research Projects</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface font-sans">Research Discovery Hub</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Kelola riset segmentasi pasar. Kumpulkan transkrip wawancara nyata maupun sintetis, lalu petakan buktinya.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-surface-dim font-bold px-4 py-2.5 rounded-lg text-xs shadow-[0_0_15px_rgba(192,193,255,0.3)] hover:shadow-[0_0_20px_rgba(192,193,255,0.5)] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          <span>Proyek Riset Baru</span>
        </button>
      </header>

      {/* Main Layout Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left Column: Projects List (3/12) */}
        <div className="xl:col-span-3 glass-panel border border-outline-glow rounded-xl p-4 flex flex-col gap-4 overflow-y-auto max-h-[600px] xl:max-h-[calc(100vh-170px)]">
          <div className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest border-b border-outline-glow/30 pb-2">
            Daftar Proyek Riset
          </div>
          {workspaceProjects.length === 0 ? (
            <div className="text-center py-6 text-on-surface-variant/45 font-mono text-xs">
              Belum ada proyek. Silakan buat baru.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {workspaceProjects.map((p) => {
                const isActive = p.id === activeProject?.id;
                const completedCount = interviews.filter((i) => i.researchProjectId === p.id && i.status === "completed").length;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProjectId(p.id);
                      setActiveTab("overview");
                    }}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-primary/10 border-primary text-primary active-panel"
                        : "bg-surface-container-low border-outline-glow/40 hover:bg-surface-container/50 text-on-surface"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-headline font-bold text-xs truncate max-w-[80%]">{p.name}</span>
                      <span className={`w-2 h-2 rounded-full ${p.status === "Completed" ? "bg-secondary shadow-[0_0_5px_#5de6ff]" : "bg-error animate-pulse"}`}></span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant/80 font-mono truncate max-w-full">
                      {p.type}
                    </span>
                    <div className="flex justify-between items-center text-[9px] text-on-surface-variant border-t border-outline-glow/20 pt-2 mt-1 font-mono">
                      <span>{completedCount} Wawancara</span>
                      <span className={p.status === "Completed" ? "text-secondary" : "text-primary"}>
                        {p.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Project Detail Area (9/12) */}
        <div className="xl:col-span-9 flex flex-col h-[600px] xl:h-[calc(100vh-170px)] glass-panel border border-outline-glow rounded-xl overflow-hidden">
          {activeProject ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Tab Navigation Menu */}
              <div className="bg-surface-container-high/60 border-b border-outline-glow/30 px-5 pt-3.5 flex justify-between items-center shrink-0">
                <div className="flex gap-2 text-xs">
                  {(["overview", "interviews", "insights", "quality"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 border-b-2 font-semibold capitalize transition-all cursor-pointer ${
                        activeTab === tab
                          ? "border-primary text-primary"
                          : "border-transparent text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {/* Synthesis Trigger Button */}
                {activeProject.status === "In progress" && (
                  <button
                    onClick={handleSynthesize}
                    disabled={isSynthesizing || projectInterviews.length === 0}
                    className="mb-2 flex items-center gap-1.5 bg-secondary text-surface-dim font-bold px-3 py-1.5 rounded text-[10px] shadow-md hover:bg-secondary-fixed transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs animate-spin" style={{ display: isSynthesizing ? "inline" : "none" }}>sync</span>
                    <span>Sintesis AI Insight</span>
                  </button>
                )}
              </div>

              {/* Tab Body Viewports */}
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar min-h-0 text-xs">
                {/* Tab: Overview */}
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-surface-container-low border border-outline-glow/40 p-4 rounded-xl space-y-2">
                        <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider block">Tipe Riset</span>
                        <h4 className="font-bold text-on-surface text-sm">{activeProject.type}</h4>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="bg-primary/20 text-primary border border-primary/30 rounded-full px-2.5 py-0.5 text-[10px]">
                            {activeCanvas.find((s) => s.id === activeProject.segmentId)?.name || "Segment Utama"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-surface-container-low border border-outline-glow/40 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider block">Link Wawancara Publik (AI-Led)</span>
                          <p className="text-[10px] text-on-surface-variant mt-1.5">
                            Sebarkan tautan di bawah. Responden dapat diwawancarai oleh IVA secara otomatis.
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={copyPublicLink}
                            className="bg-surface-container-high border border-outline-glow hover:border-primary text-on-surface text-[10px] font-semibold px-3 py-2 rounded flex items-center gap-1 cursor-pointer w-full justify-center transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">content_copy</span>
                            <span>{linkCopied ? "Link Disalin!" : "Salin Link Publik"}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stats Widget */}
                    <div className="grid grid-cols-3 gap-4 border-t border-outline-glow/20 pt-4">
                      <div className="text-center p-3 bg-surface-deep border border-outline-glow/20 rounded-lg">
                        <span className="text-2xl font-mono font-bold text-primary">{projectInterviews.length}</span>
                        <span className="block text-[9px] text-on-surface-variant/80 uppercase font-mono mt-1">Total Responden</span>
                      </div>
                      <div className="text-center p-3 bg-surface-deep border border-outline-glow/20 rounded-lg">
                        <span className="text-2xl font-mono font-bold text-secondary">
                          {projectInterviews.filter((i) => i.isSynthetic).length}
                        </span>
                        <span className="block text-[9px] text-on-surface-variant/80 uppercase font-mono mt-1">Responden Sintetis</span>
                      </div>
                      <div className="text-center p-3 bg-surface-deep border border-outline-glow/20 rounded-lg">
                        <span className="text-2xl font-mono font-bold text-secondary">
                          {projectInterviews.length > 0
                            ? Math.round(projectInterviews.reduce((acc, curr) => acc + curr.qualityScore, 0) / projectInterviews.length) + "%"
                            : "0%"}
                        </span>
                        <span className="block text-[9px] text-on-surface-variant/80 uppercase font-mono mt-1">Rata-rata Skor Kualitas</span>
                      </div>
                    </div>

                    {/* Snapshot */}
                    <div className="border-t border-outline-glow/20 pt-4">
                      <h4 className="font-bold text-on-surface text-xs mb-2">Penjelasan Ringkas Hasil Riset</h4>
                      <p className="text-on-surface-variant leading-relaxed bg-surface-container-low/50 border border-outline-glow/20 p-3.5 rounded-lg">
                        {insightReport 
                          ? insightReport.qualityDetails 
                          : "Belum ada laporan insight yang dibuat. Jalankan beberapa wawancara sintetis atau nyata dan klik 'Sintesis AI Insight' untuk memetakan hasilnya."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab: Interviews List */}
                {activeTab === "interviews" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant/60 uppercase border-b border-outline-glow/20 pb-2 mb-1">
                      <span>Nama Responden</span>
                      <div className="flex gap-10">
                        <span>Skor Kualitas</span>
                        <span>Cakupan Skrip</span>
                      </div>
                    </div>

                    {projectInterviews.length === 0 ? (
                      <div className="text-center py-10 text-on-surface-variant/40 font-mono">
                        Belum ada transkrip wawancara untuk proyek ini.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {projectInterviews.map((int) => (
                          <div
                            key={int.id}
                            className="bg-surface-container-low border border-outline-glow/30 p-3 rounded-lg flex items-center justify-between hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-lg text-primary">chat_bubble</span>
                              <div>
                                <h4 className="font-bold text-on-surface text-xs flex items-center gap-1.5">
                                  {int.respondentName}
                                  {int.isSynthetic && (
                                    <span className="bg-secondary/15 text-secondary border border-secondary/30 rounded text-[9px] px-1 font-mono uppercase font-bold">
                                      Synthetic
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[10px] text-on-surface-variant mt-0.5">{int.jobRole} • Wawancara {int.mode}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 font-mono text-[11px] font-bold">
                              <span className="text-secondary">{int.qualityScore}%</span>
                              <span className="text-primary">{int.scriptCoveragePct}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Insights Report */}
                {activeTab === "insights" && (
                  <div className="space-y-5">
                    {!insightReport ? (
                      <div className="text-center py-12 text-on-surface-variant/40 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl animate-pulse">analytics</span>
                        <p className="font-mono text-xs">Belum ada insight. Silakan sintesis transkrip wawancara.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {insightReport.categories.map((cat, catIdx) => (
                          <div key={catIdx} className="space-y-3">
                            <h4 className="font-mono text-[10px] text-secondary font-bold uppercase tracking-wider border-b border-outline-glow/20 pb-2">
                              {cat.name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {cat.insights.map((ins, insIdx) => (
                                <div
                                  key={insIdx}
                                  className="bg-surface-container-low border border-outline-glow/40 hover:border-primary/30 p-3 rounded-lg flex flex-col gap-1 transition-all"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-on-surface text-xs leading-normal">{ins.title}</span>
                                    <span className="bg-primary/20 text-primary border border-primary/30 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                      {ins.pct}% ({ins.count} Responden)
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-on-surface-variant leading-relaxed font-body">
                                    {ins.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Research Quality */}
                {activeTab === "quality" && (
                  <div className="space-y-4">
                    {!insightReport ? (
                      <div className="text-center py-10 text-on-surface-variant/40 font-mono">
                        Hasil penilaian kualitas riset belum dievaluasi. Lakukan sintesis insight terlebih dahulu.
                      </div>
                    ) : (
                      <div className="bg-surface-container-low border border-outline-glow/40 p-5 rounded-xl space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full border-2 border-secondary/40 flex items-center justify-center font-mono text-base font-bold text-secondary shadow-[inset_0_0_10px_rgba(93,230,255,0.2)]">
                            {insightReport.qualityScore}%
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface text-sm">Skor Kredibilitas Validasi</h4>
                            <p className="text-[10px] text-on-surface-variant">Diukur berdasarkan bias pertanyaan, keselarasan skrip, dan kelengkapan responden.</p>
                          </div>
                        </div>

                        <div className="border-t border-outline-glow/30 pt-4 space-y-2 leading-relaxed">
                          <h5 className="font-bold text-on-surface text-xs">Penilaian Metodologi:</h5>
                          <p className="text-on-surface-variant text-[11px] leading-relaxed">
                            {insightReport.qualityDetails}
                          </p>
                        </div>

                        <div className="bg-surface-deep/60 border border-outline-glow/30 p-3.5 rounded-lg flex items-start gap-2.5 mt-2">
                          <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                          <div className="space-y-1">
                            <span className="font-bold text-[10px] text-on-surface">Saran Optimasi Lanjutan:</span>
                            <p className="text-[10px] text-on-surface-variant leading-relaxed font-body">
                              Kurangi proporsi Wawancara Sintetis dan tambahkan minimal **2 wawancara nyata** untuk memvalidasi bias hipotesis model luring Anda.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-on-surface-variant/50 font-mono">
              <span className="material-symbols-outlined text-5xl mb-2 text-on-surface-variant/40 animate-pulse">science</span>
              <h3>Silakan Pilih Proyek Riset</h3>
              <p className="text-[10px] max-w-sm mt-1 leading-normal font-sans">
                Pilih proyek di sidebar sebelah kiri atau klik &apos;Proyek Riset Baru&apos; untuk memetakan wawancara baru.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Research Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">science</span>
              Luncurkan Riset Validasi Baru
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 font-body">
              Buat proyek riset terisolasi untuk memetakan wawancara berdasarkan segmen konsumen tertentu.
            </p>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Nama Proyek Riset *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Validasi Masalah Pemilik Kafe"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/45 focus:border-primary outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Target Segmen Pelanggan</label>
                <select
                  value={selectedSegId}
                  onChange={(e) => setSelectedSegId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {activeCanvas.map((seg) => (
                    <option key={seg.id} value={seg.id}>{seg.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Tipe Riset Validasi</label>
                <select
                  value={newProjType}
                  onChange={(e) => setNewProjType(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="Validate customer problems">Validate customer problems (Early discovery)</option>
                  <option value="Understand my buyers">Understand my buyers (Product fit validation)</option>
                  <option value="Analyze won/lost deals">Analyze won/lost deals (Sales review)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
                >
                  Buat Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
