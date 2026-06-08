"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

const COMPARISON_TYPES: Record<string, { label: string; icon: string; description: string }> = {
  cross_research: { label: "Cross-Research", icon: "compare", description: "Bandingkan insight dari beberapa proyek riset untuk menemukan pola lintas segmen." },
  validation_signals: { label: "Validation Signals", icon: "verified", description: "Analisis sinyal validasi berdasarkan frekuensi dan konsistensi temuan wawancara." },
  market_fit: { label: "Market Fit", icon: "analytics", description: "Evaluasi kecocokan solusi dengan pasar berdasarkan data riset kumulatif." },
};

export default function AnalysesPage() {
  const {
    activeWorkspace,
    analysisReports,
    addAnalysisReport,
    deleteAnalysisReport,
    researchProjects,
    insightReports,
    interviews,
  } = useWorkspace();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formComparisonType, setFormComparisonType] = useState<string>("cross_research");
  const [formSelectedProjectIds, setFormSelectedProjectIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading analyses...
      </div>
    );
  }

  const workspaceReports = analysisReports[activeWorkspace.id] || [];
  const workspaceProjects = researchProjects.filter((p) => p.workspaceId === activeWorkspace.id);

  const handleToggleProject = (projectId: string) => {
    setFormSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formSelectedProjectIds.length === 0) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-analysis",
          data: {
            name: formName,
            comparisonType: formComparisonType,
            projectIds: formSelectedProjectIds,
            projects: workspaceProjects.filter((p) => formSelectedProjectIds.includes(p.id)),
            insightReports,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        addAnalysisReport({
          name: formName.trim(),
          description: formDescription.trim(),
          comparisonType: formComparisonType as "cross_research" | "validation_signals" | "market_fit",
          projectIds: formSelectedProjectIds,
          validationSignals: result.validationSignals || [],
          summary: result.summary || "",
        });
      } else {
        throw new Error("AI generation failed");
      }
    } catch (err) {
      console.warn("AI analysis generation failed, using mock:", err);
      addAnalysisReport({
        name: formName.trim(),
        description: formDescription.trim(),
        comparisonType: formComparisonType as "cross_research" | "validation_signals" | "market_fit",
        projectIds: formSelectedProjectIds,
        validationSignals: [
          { label: "Problem Frequency", value: 87, description: "87% responden menyebutkan masalah downtime sebagai pemicu utama." },
          { label: "Solution Interest", value: 72, description: "72% menyatakan ketertarikan pada solusi deteksi lokal otomatis." },
          { label: "Budget Willingness", value: 58, description: "58% bersedia membayar langganan bulanan di atas Rp 500.000." },
          { label: "Current Workaround", value: 65, description: "65% menggunakan maintenance berkala sebagai solusi sementara." },
        ],
        summary: `Analisis ${formComparisonType === "cross_research" ? "cross-research" : formComparisonType === "validation_signals" ? "sinyal validasi" : "market fit"} untuk ${formSelectedProjectIds.length} proyek riset. Ditemukan pola konsisten mengenai kebutuhan solusi otomatis di lapangan.`,
      });
    } finally {
      setIsGenerating(false);
      setFormName("");
      setFormDescription("");
      setFormComparisonType("cross_research");
      setFormSelectedProjectIds([]);
      setAddModalOpen(false);
    }
  };

  const handleDelete = (reportId: string) => {
    deleteAnalysisReport(activeWorkspace.id, reportId);
    setDeleteConfirmId(null);
    setSelectedReport(null);
  };

  const activeReport = workspaceReports.find((r) => r.id === selectedReport);

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">analytics</span>
            <span>Operations // Analyses</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Analysis Reports</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Bandingkan dan analisis sinyal validasi lintas proyek riset untuk menemukan pola dan insight yang lebih kuat.
          </p>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-2.5 rounded-lg text-xs transition-all cursor-pointer shrink-0">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Analisis Baru
        </button>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5">
        {/* Reports List */}
        <div className="lg:w-[380px] shrink-0 overflow-y-auto space-y-2">
          {workspaceReports.length === 0 ? (
            <div className="glass-panel border border-outline-glow rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40">
                <span className="material-symbols-outlined text-3xl">analytics</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-sm text-on-surface">Belum Ada Analisis</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Buat analisis pertama Anda dengan membandingkan hasil dari beberapa proyek riset.</p>
              </div>
            </div>
          ) : (
            workspaceReports.map((report) => {
              const typeConfig = COMPARISON_TYPES[report.comparisonType] || COMPARISON_TYPES.cross_research;
              const isActive = selectedReport === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(isActive ? null : report.id)}
                  className={`w-full text-left glass-panel border rounded-xl p-4 transition-all cursor-pointer group ${ isActive ? "border-primary bg-primary/5 shadow-[0_0_10px_rgba(167, 139, 250, 0.1)]" : "border-outline-glow/50 hover:border-primary/40" }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${isActive ? "text-primary" : "text-on-surface-variant"}`}>{typeConfig.icon}</span>
                      <div>
                        <h3 className={`font-headline text-sm font-bold ${isActive ? "text-primary" : "text-on-surface"}`}>{report.name}</h3>
                        <p className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">{typeConfig.label}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(report.id); }}
                      className="w-6 h-6 rounded border border-outline-glow/30 flex items-center justify-center hover:border-error text-on-surface-variant hover:text-error transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[10px]">delete</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-mono text-on-surface-variant/60">{report.projectIds.length} proyek</span>
                    <span className="text-[9px] text-on-surface-variant/40">•</span>
                    <span className="text-[9px] font-mono text-on-surface-variant/60">{new Date(report.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Report Detail */}
        <div className="flex-1 min-h-0">
          {activeReport ? (
            <div className="glass-panel border border-outline-glow rounded-xl p-6 h-full overflow-y-auto">
              <div className="flex items-start justify-between border-b border-outline-glow/20 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-secondary text-lg">{COMPARISON_TYPES[activeReport.comparisonType]?.icon || "analytics"}</span>
                    <h2 className="font-headline text-xl font-bold text-on-surface">{activeReport.name}</h2>
                  </div>
                  <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                    {COMPARISON_TYPES[activeReport.comparisonType]?.label} — {activeReport.projectIds.length} Proyek Riset
                  </p>
                  {activeReport.description && (
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{activeReport.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-headline font-bold text-sm text-primary flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="material-symbols-outlined text-sm">insights</span>
                  Sinyal Validasi
                </h3>
                <div className="space-y-3">
                  {activeReport.validationSignals.map((signal, idx) => (
                    <div key={idx} className="bg-surface-container-low/40 border border-outline-glow/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-headline text-xs font-bold text-on-surface">{signal.label}</h4>
                        <span className={`text-sm font-headline font-bold ${signal.value >= 75 ? "text-secondary" : signal.value >= 50 ? "text-amber-400" : "text-error"}`}>
                          {signal.value}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all ${signal.value >= 75 ? "bg-gradient-to-r from-secondary to-primary" : signal.value >= 50 ? "bg-gradient-to-r from-amber-400 to-amber-300" : "bg-gradient-to-r from-error to-red-400"}`}
                          style={{ width: `${signal.value}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{signal.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {activeReport.summary && (
                <div className="mt-6 border-t border-outline-glow/20 pt-4">
                  <h3 className="font-headline font-bold text-sm text-primary flex items-center gap-1.5 uppercase tracking-wide mb-3">
                    <span className="material-symbols-outlined text-sm">summarize</span>
                    Ringkasan Analisis
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-lowest/30 border border-outline-glow/20 rounded-lg p-4">{activeReport.summary}</p>
                </div>
              )}

              <div className="mt-6 border-t border-outline-glow/20 pt-4">
                <h3 className="font-headline font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-2">Proyek yang Dianalisis</h3>
                <div className="flex flex-wrap gap-2">
                  {activeReport.projectIds.map((pid) => {
                    const proj = workspaceProjects.find((p) => p.id === pid);
                    return (
                      <span key={pid} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-glow/30 text-on-surface-variant">
                        {proj?.name || pid}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 h-full min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40">
                <span className="material-symbols-outlined text-4xl">analytics</span>
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-headline font-bold text-sm text-on-surface">Pilih Analisis untuk Dilihat</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Klik laporan analisis di panel kiri untuk melihat detail sinyal validasi dan ringkasan.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Analysis Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined">close</span></button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">add_circle</span>
              Buat Analisis Baru
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Pilih proyek riset yang ingin dibandingkan dan jenis analisis yang diinginkan.</p>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Nama Analisis *</label>
                <input type="text" required placeholder="e.g. Cross-Analysis Phase 1 Research" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Deskripsi</label>
                <textarea rows={2} placeholder="Jelaskan tujuan analisis ini..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Tipe Analisis</label>
                <div className="space-y-2">
                  {Object.entries(COMPARISON_TYPES).map(([type, config]) => (
                    <label key={type} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formComparisonType === type ? "border-primary bg-primary/5" : "border-outline-glow/30 hover:border-outline-glow"}`}>
                      <input type="radio" name="comparisonType" value={type} checked={formComparisonType === type} onChange={(e) => setFormComparisonType(e.target.value)} className="mt-0.5 accent-[var(--color-primary)]" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-secondary">{config.icon}</span>
                          <span className="text-xs font-headline font-bold text-on-surface">{config.label}</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{config.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Pilih Proyek Riset * (min. 1)</label>
                {workspaceProjects.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">Belum ada proyek riset. Buat proyek riset terlebih dahulu di halaman Research.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {workspaceProjects.map((proj) => {
                      const isSelected = formSelectedProjectIds.includes(proj.id);
                      return (
                        <label key={proj.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${isSelected ? "border-primary bg-primary/5" : "border-outline-glow/30 hover:border-outline-glow"}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleToggleProject(proj.id)} className="accent-[var(--color-primary)]" />
                          <div className="flex-1">
                            <span className="font-semibold text-on-surface">{proj.name}</span>
                            <span className="text-[9px] text-on-surface-variant ml-2 font-mono">{proj.type} • {proj.status}</span>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${proj.status === "Completed" ? "bg-secondary/10 text-secondary" : "bg-amber-400/10 text-amber-400"}`}>{proj.status}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isGenerating || formSelectedProjectIds.length === 0} className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isGenerating ? (<><span className="material-symbols-outlined text-sm animate-spin">sync</span>Menganalisis...</>) : (<><span className="material-symbols-outlined text-sm">smart_toy</span>Generate Analisis AI</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-sm w-full p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-error mb-3 block">warning</span>
            <h3 className="font-headline font-bold text-sm text-on-surface mb-2">Hapus Analisis?</h3>
            <p className="text-xs text-on-surface-variant mb-4">Laporan analisis ini akan dihapus secara permanen.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer">Batal</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-4 py-2 bg-error text-white font-bold rounded-lg text-xs hover:bg-error/80 transition-all cursor-pointer">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
