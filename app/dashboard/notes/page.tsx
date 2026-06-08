"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

const COLOR_OPTIONS = [
  { id: "default", label: "Default" },
  { id: "blue", label: "Biru" },
  { id: "green", label: "Hijau" },
  { id: "yellow", label: "Kuning" },
  { id: "red", label: "Merah" },
];

const COLOR_BG: Record<string, string> = {
  default: "bg-surface-container-low/40",
  blue: "bg-primary/8",
  green: "bg-secondary/8",
  yellow: "bg-amber-500/8",
  red: "bg-error/8",
};

const COLOR_BORDER: Record<string, string> = {
  default: "border-outline-glow/30",
  blue: "border-primary/20",
  green: "border-secondary/20",
  yellow: "border-amber-500/20",
  red: "border-error/20",
};

export default function NotesPage() {
  const {
    activeWorkspace,
    notes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    customerSegments,
    canvasData,
  } = useWorkspace();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formColorTag, setFormColorTag] = useState("default");
  const [formLinkedSegmentId, setFormLinkedSegmentId] = useState("");
  const [formLinkedCanvasSection, setFormLinkedCanvasSection] = useState("");

  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading notes...
      </div>
    );
  }

  const workspaceNotes = notes[activeWorkspace.id] || [];
  const segments = customerSegments[activeWorkspace.id] || [];
  const canvas = canvasData[activeWorkspace.id];

  const sortedNotes = [...workspaceNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const filtered = sortedNotes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  const CANVAS_SECTIONS = canvas
    ? [
        { key: "customerSegments", label: "Customer Segments" },
        { key: "problem", label: "Problem" },
        { key: "uvp", label: "UVP" },
        { key: "solution", label: "Solution" },
        { key: "channels", label: "Channels" },
        { key: "revenueStreams", label: "Revenue Streams" },
        { key: "costStructure", label: "Cost Structure" },
        { key: "keyMetrics", label: "Key Metrics" },
        { key: "unfairAdvantage", label: "Unfair Advantage" },
      ]
    : [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    addNote({
      title: formTitle.trim(),
      content: formContent.trim(),
      colorTag: formColorTag,
      linkedSegmentId: formLinkedSegmentId,
      linkedCanvasSection: formLinkedCanvasSection,
      isPinned: false,
    });
    setFormTitle("");
    setFormContent("");
    setFormColorTag("default");
    setFormLinkedSegmentId("");
    setFormLinkedCanvasSection("");
    setAddModalOpen(false);
  };

  const handleOpenEdit = (note: (typeof workspaceNotes)[0]) => {
    setEditId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNote(activeWorkspace.id, editId, { title: editTitle.trim(), content: editContent.trim() });
    setEditModalOpen(false);
  };

  const handleDelete = (noteId: string) => {
    deleteNote(activeWorkspace.id, noteId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">sticky_note_2</span>
            <span>Operations // Notes</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Venture Notes</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Catat ide, insight, dan observasi penting selama perjalanan riset dan pengembangan usaha Anda.
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-2.5 rounded-lg text-xs transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-sm">note_add</span>
          Catatan Baru
        </button>
      </header>

      {/* Search */}
      <div className="relative shrink-0">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/50">search</span>
        <input
          type="text"
          placeholder="Cari catatan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-xs bg-surface-container-lowest border border-outline-glow rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Notes Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40">
              <span className="material-symbols-outlined text-4xl">sticky_note_2</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">
                {workspaceNotes.length === 0 ? "Belum Ada Catatan" : "Tidak Ditemukan"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {workspaceNotes.length === 0
                  ? "Mulai catat insight penting dari riset Anda agar tidak terlupakan."
                  : "Coba ubah pencarian untuk menemukan catatan yang dicari."}
              </p>
            </div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-3 space-y-3">
            {filtered.map((note) => {
              const segment = segments.find((s) => s.id === note.linkedSegmentId);
              return (
                <div
                  key={note.id}
                  className={`break-inside-avoid ${COLOR_BG[note.colorTag] || COLOR_BG.default} border ${COLOR_BORDER[note.colorTag] || COLOR_BORDER.default} rounded-xl p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors group relative`}
                >
                  {note.isPinned && (
                    <div className="absolute top-2 right-2">
                      <span className="material-symbols-outlined text-sm text-primary">push_pin</span>
                    </div>
                  )}

                  <h3 className="font-headline text-sm font-bold text-on-surface pr-6">{note.title}</h3>

                  {note.content && (
                    <p className="text-[11px] text-on-surface-variant leading-relaxed whitespace-pre-line line-clamp-6">{note.content}</p>
                  )}

                  {(segment || note.linkedCanvasSection) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {segment && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">{segment.name}</span>
                      )}
                      {note.linkedCanvasSection && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary uppercase tracking-wider">{note.linkedCanvasSection}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-outline-glow/10">
                    <span className="text-[9px] text-on-surface-variant/60 font-mono">
                      {new Date(note.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => togglePinNote(activeWorkspace.id, note.id)} className="w-6 h-6 rounded border border-outline-glow/30 flex items-center justify-center hover:border-primary text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title={note.isPinned ? "Lepas pin" : "Pin catatan"}>
                        <span className="material-symbols-outlined text-[11px]">push_pin</span>
                      </button>
                      <button onClick={() => handleOpenEdit(note)} className="w-6 h-6 rounded border border-outline-glow/30 flex items-center justify-center hover:border-primary text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title="Edit">
                        <span className="material-symbols-outlined text-[11px]">edit</span>
                      </button>
                      <button onClick={() => setDeleteConfirmId(note.id)} className="w-6 h-6 rounded border border-outline-glow/30 flex items-center justify-center hover:border-error text-on-surface-variant hover:text-error transition-colors cursor-pointer" title="Hapus">
                        <span className="material-symbols-outlined text-[11px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">note_add</span>
              Catatan Baru
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Catat insight, observasi, atau ide dari sesi riset dan pengembangan usaha Anda.</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Judul *</label>
                <input type="text" required placeholder="e.g. Insight: Downtime sangat menguras profit" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Isi Catatan</label>
                <textarea rows={4} placeholder="Tulis catatan detail di sini..." value={formContent} onChange={(e) => setFormContent(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Warna Tag</label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setFormColorTag(color.id)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${COLOR_BG[color.id]} ${
                          formColorTag === color.id ? "border-primary shadow-sm scale-110" : `border-outline-glow/30 hover:border-outline-glow`
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Tautkan ke Segmen</label>
                  <select value={formLinkedSegmentId} onChange={(e) => setFormLinkedSegmentId(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer">
                    <option value="">-- Tidak terkait --</option>
                    {segments.map((seg) => (<option key={seg.id} value={seg.id}>{seg.name}</option>))}
                  </select>
                </div>
              </div>
              {CANVAS_SECTIONS.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Tautkan ke Bagian Canvas</label>
                  <select value={formLinkedCanvasSection} onChange={(e) => setFormLinkedCanvasSection(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer">
                    <option value="">-- Tidak terkait --</option>
                    {CANVAS_SECTIONS.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer">Simpan Catatan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-md w-full p-6 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">edit</span>
              Edit Catatan
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Judul</label>
                <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Isi</label>
                <textarea rows={5} value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none" />
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
            <h3 className="font-headline font-bold text-sm text-on-surface mb-2">Hapus Catatan?</h3>
            <p className="text-xs text-on-surface-variant mb-4">Catatan ini akan dihapus secara permanen.</p>
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
