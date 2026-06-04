"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

interface ScriptSection {
  id: string;
  title: string;
  duration: string;
  questions: string[];
}

export default function ScriptsPage() {
  const { activeWorkspace, researchProjects, completeTask } = useWorkspace();

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sections, setSections] = useState<ScriptSection[]>([
    {
      id: "sec-warmup",
      title: "1. Perkenalan & Warmup (Introduction)",
      duration: "5 Menit",
      questions: [
        "Ceritakan sedikit tentang keseharian peran pekerjaan Anda saat ini?",
        "Apa tanggung jawab utama Anda di bidang operasional atau bisnis Anda?"
      ]
    },
    {
      id: "sec-triggers",
      title: "2. Eksplorasi Masalah & Pemicu (Trigger Events)",
      duration: "10 Menit",
      questions: [
        "Kapan terakhir kali Anda mengalami masalah macet atau kendala downtime dalam operasional?",
        "Berapa kerugian materiil atau waktu yang timbul akibat kendala tersebut?",
        "Bagaimana cara Anda menanggulanginya saat pertama kali terjadi?"
      ]
    },
    {
      id: "sec-solutions",
      title: "3. Solusi Terkini & Evaluasi (Existing Solutions)",
      duration: "10 Menit",
      questions: [
        "Alternatif atau software apa saja yang sudah Anda coba gunakan untuk memecahkan masalah ini?",
        "Apa kekurangan terbesar dari alternatif produk yang saat ini Anda gunakan?",
        "Berapa biaya pengeluaran bulanan Anda untuk solusi tersebut?"
      ]
    },
    {
      id: "sec-closing",
      title: "4. Masukan & Penutup (Value Validation)",
      duration: "5 Menit",
      questions: [
        "Jika ada produk baru yang dapat menyelesaikan masalah itu secara instan dengan harga lebih terjangkau, apa kekhawatiran terbesar Anda untuk bermigrasi?",
        "Siapa pengambil keputusan utama untuk pengeluaran anggaran di tim Anda?"
      ]
    }
  ]);

  const [editingQuestion, setEditingQuestion] = useState<{ secId: string; index: number; text: string } | null>(null);
  const [newQuestionText, setNewQuestionText] = useState<Record<string, string>>({});

  // Filter projects by active workspace
  const workspaceProjects = activeWorkspace
    ? researchProjects.filter((p) => p.workspaceId === activeWorkspace.id)
    : [];

  const activeProject = workspaceProjects.find((p) => p.id === selectedProjectId) || workspaceProjects[0];

  const handleEditQuestion = (secId: string, index: number, text: string) => {
    setEditingQuestion({ secId, index, text });
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === editingQuestion.secId) {
          const updatedQs = [...sec.questions];
          updatedQs[editingQuestion.index] = editingQuestion.text;
          return { ...sec, questions: updatedQs };
        }
        return sec;
      })
    );
    setEditingQuestion(null);
    completeTask("validation-real-1");
  };

  const handleAddQuestion = (secId: string) => {
    const text = newQuestionText[secId]?.trim();
    if (!text) return;

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === secId) {
          return { ...sec, questions: [...sec.questions, text] };
        }
        return sec;
      })
    );

    setNewQuestionText((prev) => ({ ...prev, [secId]: "" }));
    completeTask("validation-real-1");
  };

  const handleDeleteQuestion = (secId: string, index: number) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === secId) {
          return { ...sec, questions: sec.questions.filter((_, idx) => idx !== index) };
        }
        return sec;
      })
    );
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading interview scripts...
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 relative">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-outline-glow/30 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">description</span>
            <span>Validation // Scripts Builder</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface font-sans">Interview Script Designer</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Rancang template panduan pertanyaan wawancara. IVA akan menggunakan pola skrip ini untuk melakukan simulasi.
          </p>
        </div>

        {/* Project Selector dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-on-surface-variant/80 font-mono">Proyek:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-surface-container-high border border-outline-glow rounded-lg px-3 py-1.5 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer font-body"
          >
            {workspaceProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Grid Viewport */}
      {activeProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Script Sections List (8/12) */}
          <div className="lg:col-span-8 space-y-4">
            {sections.map((sec) => (
              <div key={sec.id} className="glass-panel border border-outline-glow rounded-xl overflow-hidden">
                {/* Section Header */}
                <div className="bg-surface-container-high/60 border-b border-outline-glow/30 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-headline font-bold text-xs text-on-surface tracking-wide uppercase">{sec.title}</h3>
                  <span className="text-[10px] text-secondary font-mono bg-surface-deep px-2.5 py-0.5 rounded border border-outline-glow/20">
                    Est: {sec.duration}
                  </span>
                </div>

                {/* Section Questions */}
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    {sec.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-container-low border border-outline-glow/30 px-3.5 py-3 rounded-lg flex items-center justify-between gap-3 text-xs leading-relaxed"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-primary font-bold text-[10px] mt-0.5">Q{idx + 1}.</span>
                          <p className="text-on-surface-variant font-body">{q}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditQuestion(sec.id, idx, q)}
                            className="w-7 h-7 rounded bg-surface-container-high border border-outline-glow/50 flex items-center justify-center hover:text-primary transition-colors cursor-pointer"
                            title="Edit Pertanyaan"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(sec.id, idx)}
                            className="w-7 h-7 rounded bg-surface-container-high border border-outline-glow/50 flex items-center justify-center hover:text-error transition-colors cursor-pointer"
                            title="Hapus Pertanyaan"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Question input bar */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Masukkan pertanyaan wawancara baru..."
                      value={newQuestionText[sec.id] || ""}
                      onChange={(e) => setNewQuestionText((prev) => ({ ...prev, [sec.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleAddQuestion(sec.id)}
                      className="flex-1 bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all font-body"
                    />
                    <button
                      onClick={() => handleAddQuestion(sec.id)}
                      className="bg-primary/20 text-primary border border-primary/30 font-bold rounded-lg px-3 py-2 text-xs hover:bg-primary hover:text-surface-dim transition-all shrink-0 cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Tips & Guidelines (4/12) */}
          <aside className="lg:col-span-4 sticky top-4 flex flex-col gap-4">
            <div className="glass-panel border border-outline-glow rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-outline-glow/30 pb-3">
                <span className="material-symbols-outlined text-primary text-lg">lightbulb</span>
                <h3 className="font-headline font-bold text-on-surface text-xs leading-tight">Panduan Menyusun Skrip</h3>
              </div>

              <div className="space-y-3.5 text-xs text-on-surface-variant leading-relaxed">
                <p>
                  Skrip wawancara dirancang menggunakan metodologi **Jobs-to-be-Done (JTBD)**.
                </p>
                <ul className="list-disc pl-4 space-y-1.5 font-body">
                  <li>Hindari menanyakan fitur masa depan (&ldquo;Apakah Anda akan membeli jika...?&rdquo;).</li>
                  <li>Fokuslah pada fakta perilaku masa lalu dan emosi pemicu (Trigger).</li>
                  <li>Biarkan responden menceritakan keluh kesah mereka secara lepas.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="glass-panel rounded-xl flex flex-col items-center justify-center text-center p-12 text-on-surface-variant/40 font-mono">
          <span className="material-symbols-outlined text-5xl mb-2 text-on-surface-variant/40">description</span>
          <h3>Proyek Riset Belum Ditautkan</h3>
          <p className="text-[10px] max-w-sm mt-1 leading-normal font-sans">
            Tautkan proyek riset Anda terlebih dahulu agar skrip wawancara dapat disesuaikan otomatis dengan segmen pelanggan.
          </p>
        </div>
      )}

      {/* Editing Dialog Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setEditingQuestion(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-xs font-bold text-primary mb-3 uppercase tracking-wider font-mono">
              Edit Pertanyaan Wawancara
            </h3>
            <textarea
              value={editingQuestion.text}
              onChange={(e) => setEditingQuestion((prev) => prev ? { ...prev, text: e.target.value } : null)}
              rows={4}
              className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all resize-none mb-4 font-body"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer font-headline"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
