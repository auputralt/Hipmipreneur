"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  interview: { label: "Interview", icon: "forum", color: "primary" },
  mentor_sync: { label: "Mentor Sync", icon: "school", color: "secondary" },
  team_followup: { label: "Team Follow-up", icon: "group", color: "tertiary" },
  deadline: { label: "Deadline", icon: "alarm", color: "error" },
  other: { label: "Lainnya", icon: "event", color: "on-surface-variant" },
};

export default function CalendarPage() {
  const {
    activeWorkspace,
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    completeCalendarEvent,
    contacts,
    researchProjects,
  } = useWorkspace();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "upcoming">("upcoming");

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEventType, setFormEventType] = useState<string>("interview");
  const [formLinkedContactId, setFormLinkedContactId] = useState("");
  const [formLinkedProjectId, setFormLinkedProjectId] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formLocation, setFormLocation] = useState("");

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading calendar...
      </div>
    );
  }

  const workspaceEvents = calendarEvents[activeWorkspace.id] || [];
  const workspaceContacts = contacts[activeWorkspace.id] || [];
  const workspaceProjects = researchProjects.filter((p) => p.workspaceId === activeWorkspace.id);

  const upcomingEvents = workspaceEvents
    .filter((e) => !e.isCompleted && new Date(e.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastEvents = workspaceEvents
    .filter((e) => e.isCompleted || new Date(e.startTime) < new Date())
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const displayEvents = viewMode === "upcoming" ? upcomingEvents : pastEvents;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartTime) return;
    addCalendarEvent({
      title: formTitle.trim(),
      description: formDescription.trim(),
      eventType: formEventType as "interview" | "mentor_sync" | "team_followup" | "deadline" | "other",
      linkedContactId: formLinkedContactId,
      linkedProjectId: formLinkedProjectId,
      startTime: formStartTime,
      endTime: formEndTime || "",
      location: formLocation.trim(),
      isCompleted: false,
    });
    setFormTitle("");
    setFormDescription("");
    setFormEventType("interview");
    setFormLinkedContactId("");
    setFormLinkedProjectId("");
    setFormStartTime("");
    setFormEndTime("");
    setFormLocation("");
    setAddModalOpen(false);
  };

  const handleDelete = (eventId: string) => {
    deleteCalendarEvent(activeWorkspace.id, eventId);
    setDeleteConfirmId(null);
  };

  const formatTimeShort = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-outline-glow/30 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">calendar_month</span>
            <span>Operations // Calendar</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Research Calendar</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Jadwalkan interview, mentor sync, dan deadline riset Anda dari satu kalender terpadu.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="flex items-center bg-surface-container-high/40 border border-outline-glow/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode("upcoming")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer ${ viewMode === "upcoming" ? "bg-primary text-surface-dim shadow-sm" : "text-on-surface-variant hover:text-on-surface" }`}
            >
              Mendatang ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer ${ viewMode === "list" ? "bg-primary text-surface-dim shadow-sm" : "text-on-surface-variant hover:text-on-surface" }`}
            >
              Semua ({workspaceEvents.length})
            </button>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-surface-dim font-bold px-5 py-2.5 rounded-lg text-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Jadwal Baru
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => {
          const count = workspaceEvents.filter((e) => e.eventType === type && !e.isCompleted).length;
          return (
            <div key={type} className="glass-panel border border-outline-glow/30 rounded-lg p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-${config.color}/10 border border-${config.color}/20 flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-sm text-${config.color}`}>{config.icon}</span>
              </div>
              <div>
                <p className="text-lg font-headline font-bold text-on-surface leading-none">{count}</p>
                <p className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">{config.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Events List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {displayEvents.length === 0 ? (
          <div className="glass-panel border border-outline-glow rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high/60 border border-outline-glow flex items-center justify-center text-on-surface-variant/40">
              <span className="material-symbols-outlined text-4xl">calendar_month</span>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-headline font-bold text-sm text-on-surface">
                {viewMode === "upcoming" ? "Tidak Ada Jadwal Mendatang" : "Belum Ada Riwayat"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {viewMode === "upcoming"
                  ? "Jadwalkan interview responden atau pertemuan mentor untuk memulai riset Anda."
                  : "Event yang sudah selesai akan muncul di sini."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {displayEvents.map((event) => {
              const config = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.other;
              const contact = workspaceContacts.find((c) => c.id === event.linkedContactId);
              const project = workspaceProjects.find((p) => p.id === event.linkedProjectId);
              const isPast = new Date(event.startTime) < new Date();

              return (
                <div
                  key={event.id}
                  className={`glass-panel border rounded-xl p-4 flex items-center gap-4 transition-colors group ${ event.isCompleted ? "border-outline-glow/20 opacity-60" : isPast ? "border-error/30 bg-error/5" : "border-outline-glow/50 hover:border-primary/40" }`}
                >
                  <div className="flex flex-col items-center min-w-[60px] shrink-0">
                    <span className="text-lg font-headline font-bold text-on-surface leading-none">
                      {new Date(event.startTime).getDate()}
                    </span>
                    <span className="text-[9px] font-mono text-on-surface-variant uppercase">
                      {new Date(event.startTime).toLocaleDateString("id-ID", { month: "short" })}
                    </span>
                    <span className="text-[10px] font-mono text-secondary mt-1">
                      {formatTimeShort(event.startTime)}
                    </span>
                  </div>

                  <div className="w-px h-12 bg-outline-glow/30 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-headline text-sm font-bold ${event.isCompleted ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
                        {event.title}
                      </h3>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full bg-${config.color}/10 border border-${config.color}/20 text-${config.color} uppercase tracking-wider`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-on-surface-variant">
                      {contact && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">person</span>
                          {contact.name}
                        </span>
                      )}
                      {project && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">science</span>
                          {project.name}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">location_on</span>
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-[11px] text-on-surface-variant/70 mt-1 truncate">{event.description}</p>
                    )}
                  </div>

                  <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!event.isCompleted && (
                      <button
                        onClick={() => completeCalendarEvent(activeWorkspace.id, event.id)}
                        className="w-7 h-7 rounded-lg border border-outline-glow/30 flex items-center justify-center hover:border-secondary text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
                        title="Tandai selesai"
                      >
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirmId(event.id)}
                      className="w-7 h-7 rounded-lg border border-outline-glow/30 flex items-center justify-center hover:border-error text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">add_circle</span>
              Jadwalkan Event Baru
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Tambahkan interview, mentor sync, atau deadline ke kalender riset Anda.</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Judul Event *</label>
                <input type="text" required placeholder="e.g. Interview dengan Budi Santoso" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Tipe Event</label>
                  <select value={formEventType} onChange={(e) => setFormEventType(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer">
                    {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
                      <option key={type} value={type}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Lokasi</label>
                  <input type="text" placeholder="e.g. Zoom, Google Meet, Kantor" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Waktu Mulai *</label>
                  <input type="datetime-local" required value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Waktu Selesai</label>
                  <input type="datetime-local" value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Kontak Terkait</label>
                  <select value={formLinkedContactId} onChange={(e) => setFormLinkedContactId(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer">
                    <option value="">-- Pilih Kontak --</option>
                    {workspaceContacts.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.jobRole || "No role"})</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Proyek Riset</label>
                  <select value={formLinkedProjectId} onChange={(e) => setFormLinkedProjectId(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer">
                    <option value="">-- Pilih Proyek --</option>
                    {workspaceProjects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface mb-1">Deskripsi</label>
                <textarea rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer">Simpan Jadwal</button>
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
            <h3 className="font-headline font-bold text-sm text-on-surface mb-2">Hapus Jadwal?</h3>
            <p className="text-xs text-on-surface-variant mb-4">Event ini akan dihapus secara permanen dari kalender Anda.</p>
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
