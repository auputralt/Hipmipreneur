"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

const CATEGORY_COLORS: Record<string, string> = {
  general: "text-on-surface-variant border-on-surface-variant/20 bg-on-surface-variant/5",
  technical: "text-primary border-primary/20 bg-primary/5",
  operational: "text-secondary border-secondary/20 bg-secondary/5",
  business: "text-amber-400 border-amber-400/20 bg-amber-400/5",
  market: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
};

export default function GlossaryPage() {
  const {
    activeWorkspace,
    glossaryTerms,
    addGlossaryTerm,
    updateGlossaryTerm,
    deleteGlossaryTerm,
    autoDetectTermsFromTranscript,
    researchProjects,
    interviews,
  } = useWorkspace();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const [formTerm, setFormTerm] = useState("");
  const [formDefinition, setFormDefinition] = useState("");
  const [formCategory, setFormCategory] = useState("general");

  const [editId, setEditId] = useState("");
  const [editDefinition, setEditDefinition] = useState("");
  const [editCategory, setEditCategory] = useState("");

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading glossary...
      </div>
    );
  }

  const workspaceTerms = glossaryTerms[activeWorkspace.id] || [];
  const workspaceProjects = researchProjects.filter((p) => p.workspaceId === activeWorkspace.id);
  const workspaceInterviews = interviews.filter((i) => workspaceProjects.some((p) => p.id === i.researchProjectId));

  const categories = Array.from(new Set(workspaceTerms.map((t) => t.category)));

  const filtered = workspaceTerms.filter((t) => {
    const matchesSearch = !searchQuery || t.term.toLowerCase().includes(searchQuery.toLowerCase()) || t.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTerm.trim() || !formDefinition.trim()) return;
    addGlossaryTerm({
      term: formTerm.trim(),
      definition: formDefinition.trim(),
      category: formCategory,
      sourceInterviewId: "",
      sourceProjectId: "",
      isAutoDetected: false,
    });
    setFormTerm("");
    setFormDefinition("");
    setFormCategory("general");
    setAddModalOpen(false);
  };

  const handleOpenEdit = (term: (typeof workspaceTerms)[0]) => {
    setEditId(term.id);
    setEditDefinition(term.definition);
    setEditCategory(term.category);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlossaryTerm(activeWorkspace.id, editId, { definition: editDefinition, category: editCategory });
    setEditModalOpen(false);
  };

  const handleDelete = (termId: string) => {
    deleteGlossaryTerm(activeWorkspace.id, termId);
    setDeleteConfirmId(null);
  };

  const handleAutoDetect = async () => {
    if (workspaceProjects.length === 0) return;
    setIsAutoDetecting(true);
    try {
      await autoDetectTermsFromTranscript(activeWorkspace.id, workspaceProjects[0].id);
    } catch (err) {
      console.error("Auto-detect failed:", err);
    } finally {
      setIsAutoDetecting(false);
    }
  };

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">menu_book</span>
            <span>Operations // Glossary</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Research Glossary</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">Kumpulkan dan definisikan istilah penting yang muncul selama riset.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAutoDetect}
            disabled={isAutoDetecting || workspaceProjects.length === 0}
            className="flex items-center gap-2 bg-surface-container-high border border-outline-glow hover:border-secondary text-on-surface font-bold px-4 py-2.5 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`material-symbols-outlined text-sm ${isAutoDetecting ? "animate-spin" : ""}`}>
              {isAutoDetecting ? "sync" : "auto_fix_high"}
            </span>
            {isAutoDetecting ? "Mendeteksi..." : "Auto-Deteksi dari Transkrip"}
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-2.5 rounded-lg text-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Istilah
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 shrink-0">
        <div className="glass-panel border border-outline-glow/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-primary">bookmark</span>
          <span className="text-sm font-headline font-bold text-on-surface">{workspaceTerms.length}</span>
          <span className="text-[10px] text-on-surface-variant font-mono">Total Istilah</span>
        </div>
        <div className="glass-panel border border-outline-glow/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-secondary">auto_fix_high</span>
          <span className="text-sm font-headline font-bold text-on-surface">{workspaceTerms.filter((t) => t.isAutoDetected).length}</span>
          <span className="text-[10px] text-on-surface-variant font-mono">Auto-Terdeteksi</span>
        </div>
        <div className="glass-panel border border-outline-glow/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">science</span>
          <span className="text-sm font-headline font-bold text-on-surface">{workspaceInterviews.length}</span>
          <span className="text-[10px] text-on-surface-variant font-mono">Transkrip Tersedia</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 shrink-0">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/50">search</span>
          <input type="text" placeholder="Cari istilah atau definisi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-all" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface outline-none cursor-pointer focus:border-primary transition-all">
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>))}
        </select>
      </div>

      {/* Glossary Terms */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40">
              <span className="material-symbols-outlined text-4xl">menu_book</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">{workspaceTerms.length === 0 ? "Belum Ada Istilah" : "Tidak Ditemukan"}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {workspaceTerms.length === 0 ? "Gunakan auto-deteksi untuk mengekstrak istilah dari transkrip wawancara Anda, atau tambahkan secara manual." : "Coba ubah filter pencarian."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((term) => {
              const catColor = CATEGORY_COLORS[term.category] || CATEGORY_COLORS.general;
              return (
                <div key={term.id} className="glass-panel border border-outline-glow/50 rounded-xl p-4 flex items-start gap-4 hover:border-primary/40 transition-colors group">
                  <div className="shrink-0 flex flex-col items-center gap-1 min-w-[80px]">
                    <span className="font-headline text-sm font-bold text-primary">{term.term}</span>
                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${catColor}`}>{term.category}</span>
                    {term.isAutoDetected && (
                      <span className="flex items-center gap-0.5 text-[8px] text-secondary font-mono">
                        <span className="material-symbols-outlined text-[9px]">auto_fix_high</span>AI
                      </span>
                    )}
                  </div>
                  <div className="w-px h-10 bg-outline-glow/30 shrink-0 self-center" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">{term.definition}</p>
                    {term.sourceProjectId && (
                      <p className="text-[9px] text-on-surface-variant/50 font-mono mt-1">Sumber: {workspaceProjects.find((p) => p.id === term.sourceProjectId)?.name || "Proyek"}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(term)} className="w-7 h-7 rounded-lg border border-outline-glow/30 flex items-center justify-center hover:border-primary text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title="Edit"><span className="material-symbols-outlined text-xs">edit</span></button>
                    <button onClick={() => setDeleteConfirmId(term.id)} className="w-7 h-7 rounded-lg border border-outline-glow/30 flex items-center justify-center hover:border-error text-on-surface-variant hover:text-error transition-colors cursor-pointer" title="Hapus"><span className="material-symbols-outlined text-xs">delete</span></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Term Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-md w-full p-6 relative">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined">close</span></button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-secondary">add</span>Tambah Istilah Baru</h3>
            <p className="text-xs text-on-surface-variant mb-4">Definisikan istilah penting dari riset Anda untuk referensi tim.</p>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Istilah *</label>
                <input type="text" required placeholder="e.g. Edge Computing" value={formTerm} onChange={(e) => setFormTerm(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Definisi *</label>
                <textarea required rows={3} placeholder="Jelaskan arti istilah ini dalam konteks usaha Anda..." value={formDefinition} onChange={(e) => setFormDefinition(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Kategori</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer">
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="operational">Operational</option>
                  <option value="business">Business</option>
                  <option value="market">Market</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer">Simpan Istilah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Term Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-md w-full p-6 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined">close</span></button>
            <h3 className="font-headline text-lg font-bold text-primary mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-secondary">edit</span>Edit Istilah</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Definisi</label>
                <textarea required rows={3} value={editDefinition} onChange={(e) => setEditDefinition(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Kategori</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer">
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="operational">Operational</option>
                  <option value="business">Business</option>
                  <option value="market">Market</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer">Simpan</button>
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
            <h3 className="font-headline font-bold text-sm text-on-surface mb-2">Hapus Istilah?</h3>
            <p className="text-xs text-on-surface-variant mb-4">Istilah ini akan dihapus dari glosarium Anda.</p>
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
