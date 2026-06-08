"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

export default function ContactsPage() {
  const {
    activeWorkspace,
    contacts,
    addContact,
    updateContact,
    deleteContact,
    customerSegments,
  } = useWorkspace();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSegment, setFilterSegment] = useState<string>("all");

  // Add form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formJobRole, setFormJobRole] = useState("");
  const [formSegmentId, setFormSegmentId] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Edit form
  const [editId, setEditId] = useState("");
  const [editNotes, setEditNotes] = useState("");

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading contacts...
      </div>
    );
  }

  const workspaceContacts = contacts[activeWorkspace.id] || [];
  const segments = customerSegments[activeWorkspace.id] || [];

  const filtered = workspaceContacts.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment =
      filterSegment === "all" || c.segmentId === filterSegment;
    return matchesSearch && matchesSegment;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    addContact({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      company: formCompany.trim(),
      jobRole: formJobRole.trim(),
      segmentId: formSegmentId,
      tags: formTags.split(",").map((t) => t.trim()).filter(Boolean),
      source: "manual",
      notes: formNotes.trim(),
      lastContactedAt: null,
    });
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormCompany("");
    setFormJobRole("");
    setFormSegmentId("");
    setFormTags("");
    setFormNotes("");
    setAddModalOpen(false);
  };

  const handleOpenEdit = (contact: (typeof workspaceContacts)[0]) => {
    setEditId(contact.id);
    setEditNotes(contact.notes);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContact(activeWorkspace.id, editId, { notes: editNotes });
    setEditModalOpen(false);
  };

  const handleDelete = (contactId: string) => {
    deleteContact(activeWorkspace.id, contactId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">contacts</span>
            <span>Operations // Contacts</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Contact Registry</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Kelola kontak responden, mitra, dan pemangku kepentingan riset Anda dalam satu tempat.
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-2.5 rounded-lg text-xs transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Tambah Kontak
        </button>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 shrink-0">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/50">search</span>
          <input
            type="text"
            placeholder="Cari nama, email, perusahaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg pl-9 pr-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-all"
          />
        </div>
        <select
          value={filterSegment}
          onChange={(e) => setFilterSegment(e.target.value)}
          className="bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface outline-none cursor-pointer focus:border-primary transition-all"
        >
          <option value="all">Semua Segmen</option>
          {segments.map((seg) => (
            <option key={seg.id} value={seg.id}>{seg.name}</option>
          ))}
        </select>
      </div>

      {/* Contact List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40">
              <span className="material-symbols-outlined text-4xl">contacts</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">
                {workspaceContacts.length === 0 ? "Belum Ada Kontak" : "Tidak Ditemukan"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {workspaceContacts.length === 0
                  ? "Mulai tambahkan kontak responden atau mitra untuk mengelola jaringan riset Anda."
                  : "Coba ubah filter pencarian untuk menemukan kontak yang dicari."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((contact) => {
              const segment = segments.find((s) => s.id === contact.segmentId);
              return (
                <div
                  key={contact.id}
                  className="glass-panel border border-outline-glow/50 rounded-xl p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm font-headline shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-headline text-sm font-bold text-on-surface truncate">{contact.name}</h3>
                        <p className="text-[10px] text-on-surface-variant font-mono truncate">
                          {contact.jobRole || "No role"} {contact.company ? `@ ${contact.company}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleOpenEdit(contact)}
                        className="w-7 h-7 rounded-lg border border-outline-glow/30 flex items-center justify-center hover:border-primary text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="Edit catatan"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(contact.id)}
                        className="w-7 h-7 rounded-lg border border-outline-glow/30 flex items-center justify-center hover:border-error text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                        title="Hapus kontak"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {contact.email && (
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[11px] text-secondary">mail</span>
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[11px] text-secondary">phone</span>
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {segment && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
                        {segment.name}
                      </span>
                    )}
                    {contact.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-glow/30 text-on-surface-variant"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 3 && (
                      <span className="text-[9px] text-on-surface-variant/60">+{contact.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-on-surface-variant/60 font-mono pt-1 border-t border-outline-glow/10">
                    <span className="material-symbols-outlined text-[10px]">
                      {contact.source === "interview" ? "forum" : contact.source === "import" ? "upload" : "person_add"}
                    </span>
                    <span className="uppercase">
                      {contact.source === "interview" ? "Dari Interview" : contact.source === "import" ? "Import" : "Manual"}
                    </span>
                    {contact.lastContactedAt && (
                      <span className="ml-auto">
                        Terakhir: {new Date(contact.lastContactedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">person_add</span>
              Tambah Kontak Baru
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Tambahkan responden, mitra, atau pemangku kepentingan ke registri Anda.</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Nama Lengkap *</label>
                  <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Email</label>
                  <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Telepon</label>
                  <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Perusahaan</label>
                  <input type="text" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Jabatan</label>
                  <input type="text" value={formJobRole} onChange={(e) => setFormJobRole(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Segmen Terkait</label>
                  <select value={formSegmentId} onChange={(e) => setFormSegmentId(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer">
                    <option value="">-- Pilih Segmen --</option>
                    {segments.map((seg) => (<option key={seg.id} value={seg.id}>{seg.name}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Tags (pisah dengan koma)</label>
                <input type="text" placeholder="e.g. mentor, investor, early-adopter" value={formTags} onChange={(e) => setFormTags(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Catatan</label>
                <textarea rows={2} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer">Simpan Kontak</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-md w-full p-6 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">edit_note</span>
              Edit Catatan Kontak
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Catatan</label>
                <textarea rows={4} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none" />
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
            <h3 className="font-headline font-bold text-sm text-on-surface mb-2">Hapus Kontak?</h3>
            <p className="text-xs text-on-surface-variant mb-4">Kontak ini akan dihapus secara permanen dari registri Anda.</p>
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
