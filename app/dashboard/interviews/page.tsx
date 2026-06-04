"use client";

import React, { useState } from "react";
import { useWorkspace, Interview } from "../../../context/WorkspaceContext";

export default function InterviewsPage() {
  const {
    activeWorkspace,
    researchProjects,
    interviews,
    generateSyntheticInterviews,
    addInterviewTranscript
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<"all" | "completed" | "in_progress" | "not_started">("all");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Simulation Modals
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [simProjectId, setSimProjectId] = useState("");
  const [simCount, setSimCount] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Upload Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProjId, setUploadProjId] = useState("");
  const [respName, setRespName] = useState("");
  const [respRole, setRespRole] = useState("");
  const [rawTranscript, setRawTranscript] = useState("");

  // Filter projects by active workspace
  const workspaceProjects = activeWorkspace
    ? researchProjects.filter((p) => p.workspaceId === activeWorkspace.id)
    : [];

  const workspaceProjectIds = workspaceProjects.map((p) => p.id);

  // Filter interviews by active projects
  const workspaceInterviews = interviews.filter((i) => workspaceProjectIds.includes(i.researchProjectId));

  // Filter by status tab
  const filteredInterviews = workspaceInterviews.filter((i) => {
    if (activeTab === "all") return true;
    return i.status === activeTab;
  });

  const handleStartSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simProjectId || isSimulating) return;

    setIsSimulating(true);
    setSimStep(1); // Step 1: Configuring Persona

    try {
      // Custom animation delay steps
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSimStep(2); // Step 2: Simulating Conversation
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSimStep(3); // Step 3: Assessing Coverage
      await new Promise((resolve) => setTimeout(resolve, 800));

      await generateSyntheticInterviews(simProjectId, simCount);
      setIsSimulating(false);
      setSimulationModalOpen(false);
      setSimCount(1);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Kredit kurang.";
      alert(`Gagal simulasi: ${errorMsg}`);
      setIsSimulating(false);
    }
  };

  const handleUploadTranscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadProjId || !respName.trim() || !rawTranscript.trim()) return;

    addInterviewTranscript(uploadProjId, respName, respRole, rawTranscript, false);
    
    // Clear form
    setRespName("");
    setRespRole("");
    setRawTranscript("");
    setUploadModalOpen(false);
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading interview sessions...
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 relative h-full">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-outline-glow/30 pb-4 gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">forum</span>
            <span>Validation // Interviews</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Interview Registry</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Pantau seluruh sesi wawancara. Simulasikan responden kecerdasan buatan (synthetic) atau unggah log manual.
          </p>
        </div>

        {/* Action Dropdown/Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (workspaceProjects.length === 0) {
                alert("Silakan buat Proyek Riset terlebih dahulu di halaman Research.");
                return;
              }
              setSimProjectId(workspaceProjects[0].id);
              setSimulationModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-primary text-surface-dim font-bold px-3.5 py-2.5 rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">smart_toy</span>
            <span>Simulasi Responden</span>
          </button>
          <button
            onClick={() => {
              if (workspaceProjects.length === 0) {
                alert("Silakan buat Proyek Riset terlebih dahulu di halaman Research.");
                return;
              }
              setUploadProjId(workspaceProjects[0].id);
              setUploadModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-glow text-on-surface px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            <span>Unggah Transkrip</span>
          </button>
        </div>
      </header>

      {/* Tabs Selector & Registry List */}
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Tab Header Filter */}
        <div className="flex gap-2 border-b border-outline-glow/20 pb-2">
          {([
            { id: "all", label: "Semua Sesi" },
            { id: "completed", label: "Completed" },
            { id: "in_progress", label: "In Progress" },
            { id: "not_started", label: "Not Started" }
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === t.id
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_10px_rgba(192,193,255,0.1)]"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Interviews List Table */}
        <div className="glass-panel border border-outline-glow rounded-xl overflow-hidden flex-1 overflow-y-auto custom-scrollbar min-h-0 max-h-[600px] xl:max-h-[calc(100vh-230px)]">
          {filteredInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 text-on-surface-variant/40 font-mono">
              <span className="material-symbols-outlined text-4xl mb-2 animate-pulse">forum</span>
              <p className="text-xs">Tidak ada sesi wawancara yang sesuai.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-glow/20">
              {filteredInterviews.map((int) => {
                const project = researchProjects.find((p) => p.id === int.researchProjectId);
                return (
                  <div
                    key={int.id}
                    onClick={() => int.status === "completed" && setSelectedInterview(int)}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 transition-colors ${
                      int.status === "completed" ? "hover:bg-surface-container-low/50 cursor-pointer" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${int.isSynthetic ? "bg-secondary/10 border border-secondary/30" : "bg-primary/10 border border-primary/30"}`}>
                        <span className={`material-symbols-outlined text-base ${int.isSynthetic ? "text-secondary" : "text-primary"}`}>
                          {int.isSynthetic ? "smart_toy" : "person"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-xs text-on-surface flex items-center gap-2">
                          {int.respondentName}
                          {int.isSynthetic && (
                            <span className="bg-secondary/15 text-secondary border border-secondary/30 rounded text-[9px] px-1 font-mono uppercase font-bold">
                              Synthetic
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-body">
                          {int.jobRole} • Proyek: <span className="font-semibold text-primary">{project?.name || "Riset"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-[10px] self-end sm:self-auto">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[9px] text-on-surface-variant/60 uppercase">Kualitas</span>
                        <span className="font-bold text-secondary text-xs">{int.qualityScore}%</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[9px] text-on-surface-variant/60 uppercase">Cakupan</span>
                        <span className="font-bold text-primary text-xs">{int.scriptCoveragePct}%</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[9px] text-on-surface-variant/60 uppercase">Tanggal</span>
                        <span className="text-on-surface-variant">{int.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Synthetic Interview Simulation */}
      {simulationModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            {/* Header / Loading Overlay */}
            {isSimulating ? (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                <span className="material-symbols-outlined text-4xl text-secondary animate-spin">sync</span>
                <h3 className="font-headline font-bold text-on-surface">Simulasi Responden Aktif</h3>
                <div className="w-full max-w-xs bg-surface-deep h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-300 rounded-full"
                    style={{ width: `${simStep * 33}%` }}
                  ></div>
                </div>
                <p className="font-mono text-[10px] text-primary uppercase tracking-widest animate-pulse">
                  {simStep === 1 && "Mengonfigurasi Kepribadian Agen..."}
                  {simStep === 2 && "Menjalankan Percakapan Wawancara..."}
                  {simStep === 3 && "Memetakan Cakupan Pertanyaan..."}
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setSimulationModalOpen(false)}
                  className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">smart_toy</span>
                  Simulasi Agen Sintetis
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 font-body">
                  Hasilkan transkrip percakapan buatan dengan agen virtual yang disesuaikan dengan segmentasi dan kanvas bisnis.
                </p>
                <form onSubmit={handleStartSimulation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Target Proyek Riset *</label>
                    <select
                      value={simProjectId}
                      onChange={(e) => setSimProjectId(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer font-body"
                    >
                      {workspaceProjects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1 flex justify-between">
                      <span>Jumlah Responden (1-5)</span>
                      <span className="font-mono text-secondary">{simCount} Profil</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={simCount}
                      onChange={(e) => setSimCount(parseInt(e.target.value))}
                      className="w-full bg-surface-deep cursor-pointer"
                    />
                  </div>

                  {/* Credit Alert Pack */}
                  <div className="bg-surface-deep border border-outline-glow/30 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Biaya Kredit:</span>
                    <span className="text-secondary font-bold">{(simCount * 1500).toLocaleString("id-ID")} Cr.</span>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSimulationModalOpen(false)}
                      className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer font-headline"
                    >
                      Luncurkan Simulasi
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Upload Raw Transcript */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">upload_file</span>
              Unggah Transkrip Wawancara Nyata
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 font-body">
              Masukkan hasil transkrip percakapan langsung Anda dengan calon pembeli luar untuk dianalisis oleh IVA.
            </p>
            <form onSubmit={handleUploadTranscript} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Nama Responden *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budi Santoso"
                    value={respName}
                    onChange={(e) => setRespName(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Jabatan Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="e.g. Store Owner"
                    value={respRole}
                    onChange={(e) => setRespRole(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Proyek Riset *</label>
                <select
                  value={uploadProjId}
                  onChange={(e) => setUploadProjId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer font-body"
                >
                  {workspaceProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Transkrip Percakapan *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="e.g. Interviewer: Halo, bagaimana tantangan Anda?&#10;Responden: Sangat sulit sekali mencari bahan baku murah..."
                  value={rawTranscript}
                  onChange={(e) => setRawTranscript(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow focus:border-primary rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
                >
                  Unggah Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Transcript Viewer Dialog */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-2xl w-full p-6 relative flex flex-col h-[550px] overflow-hidden">
            <button
              onClick={() => setSelectedInterview(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            {/* Header */}
            <div className="border-b border-outline-glow/20 pb-3 flex items-center gap-3 shrink-0">
              <span className="material-symbols-outlined text-2xl text-secondary">chat_bubble</span>
              <div>
                <h3 className="font-headline text-sm font-bold text-on-surface">Transkrip: {selectedInterview.respondentName}</h3>
                <p className="text-[10px] text-on-surface-variant">{selectedInterview.jobRole} • Mode {selectedInterview.mode}</p>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="flex gap-4 bg-surface-container-low border border-outline-glow/30 p-3 rounded-lg my-3 shrink-0 font-mono text-[10px]">
              <div>
                <span className="text-on-surface-variant">Skor Kualitas:</span>
                <span className="text-secondary font-bold ml-1.5">{selectedInterview.qualityScore}%</span>
              </div>
              <div className="h-4 w-[1px] bg-outline-glow/40"></div>
              <div>
                <span className="text-on-surface-variant">Cakupan Skrip:</span>
                <span className="text-primary font-bold ml-1.5">{selectedInterview.scriptCoveragePct}%</span>
              </div>
            </div>

            {/* Conversation Log bubbles */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 border border-outline-glow/20 rounded-lg bg-surface-deep/50 custom-scrollbar">
              {selectedInterview.transcriptText.split("\n").filter(line => line.trim() !== "").map((bubble, bIdx) => {
                const isIva = bubble.startsWith("IVA:") || bubble.startsWith("Interviewer:");
                const isInterviewer = bubble.startsWith("Interviewer:");
                const isUserOrIva = isIva || isInterviewer;
                const textOnly = bubble.replace(/^(IVA:|Interviewer:|[\w\s\(\)#]+:)\s*/, "");
                const nameLabel = bubble.match(/^([\w\s\(\)#]+:)/)?.[0]?.slice(0, -1) || "Speaker";

                return (
                  <div key={bIdx} className={`flex max-w-[85%] flex-col ${isUserOrIva ? "mr-auto" : "ml-auto items-end"}`}>
                    <span className="text-[9px] font-mono text-on-surface-variant/65 mb-1 px-1">{nameLabel}</span>
                    <div
                      className={`p-3 rounded-xl text-[11px] leading-relaxed ${
                        isUserOrIva
                          ? "bg-surface-container border border-outline-glow/40 text-on-surface rounded-tl-none"
                          : "bg-primary text-surface-dim rounded-tr-none"
                      }`}
                    >
                      <p>{textOnly}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 shrink-0">
              <button
                onClick={() => setSelectedInterview(null)}
                className="px-4 py-2 bg-surface-container-high border border-outline-glow hover:border-on-surface/40 text-on-surface rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
