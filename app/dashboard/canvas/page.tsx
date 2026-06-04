"use client";

import React, { useState } from "react";
import { useWorkspace, LeanCanvas } from "../../../context/WorkspaceContext";

export default function CanvasPage() {
  const { activeWorkspace, canvasData, updateCanvasSection, extractCanvasWithAI, completeTask } = useWorkspace();
  const [chatInput, setChatInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "iva"; text: string; time: string }>>([
    {
      sender: "iva",
      text: "Halo! Saya **IVA**, Co-Founder AI Anda. Deskripsikan ide bisnis Anda di bawah (misalnya: *'Saya ingin membuat platform langganan kopi harian di kota besar'*), dan saya akan mengekstraknya menjadi kanvas bisnis 9-bagian.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [editingSection, setEditingSection] = useState<keyof LeanCanvas | null>(null);
  const [editValue, setEditValue] = useState("");

  const canvas = activeWorkspace ? canvasData[activeWorkspace.id] : null;

  // Handle Chat Submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeWorkspace || isExtracting) return;

    const userText = chatInput;
    setChatInput("");
    
    // Add User Message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsExtracting(true);

    // Add IVA Processing Message
    setMessages((prev) => [
      ...prev,
      {
        sender: "iva",
        text: "Sedang menganalisis ide Anda dan menyusun Lean Canvas... *(Ekstraksi membutuhkan 500 Kredit)*",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      await extractCanvasWithAI(activeWorkspace.id, userText);
      setMessages((prev) => [
        ...prev,
        {
          sender: "iva",
          text: "Kanvas Anda telah berhasil diperbarui! Anda sekarang dapat memeriksa kesembilan bagian di sebelah kanan dan melakukan penyesuaian langsung jika diperlukan.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memproses ide.";
      setMessages((prev) => [
        ...prev,
        {
          sender: "iva",
          text: `Maaf, terjadi kesalahan: ${errorMsg}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsExtracting(false);
    }
  };

  // Open Edit Modal/Inline Input
  const startEdit = (section: keyof LeanCanvas) => {
    if (!canvas) return;
    setEditingSection(section);
    setEditValue(canvas[section] || "");
  };

  // Save Edit
  const saveEdit = () => {
    if (!activeWorkspace || !editingSection) return;
    updateCanvasSection(activeWorkspace.id, editingSection, editValue);
    setEditingSection(null);
    completeTask("canvas-builder-1");
  };

  // Export Canvas
  const handleExportMarkdown = () => {
    if (!canvas || !activeWorkspace) return;
    const mdContent = `# Lean Canvas: ${activeWorkspace.name}
Tanggal: ${new Date().toLocaleDateString('id-ID')}

## 1. Customer Segments
${canvas.customerSegments}

## 2. Problem
${canvas.problem}

## 3. Unique Value Proposition
${canvas.uvp}

## 4. Solution
${canvas.solution}

## 5. Channels
${canvas.channels}

## 6. Revenue Streams
${canvas.revenueStreams}

## 7. Cost Structure
${canvas.costStructure}

## 8. Key Metrics
${canvas.keyMetrics}

## 9. Unfair Advantage
${canvas.unfairAdvantage}
`;
    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lean-canvas-${activeWorkspace.name.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading venture workspace...
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto w-full flex flex-col gap-5 h-full relative">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-outline-glow/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[10px]">view_quilt</span>
            <span>Business Model // Lean Canvas</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">AI Business Model Canvas</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Visualisasikan pondasi model bisnis Anda. Klik langsung pada kartu untuk mengedit teks.
          </p>
        </div>
        <button
          onClick={handleExportMarkdown}
          className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-glow text-on-surface px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          <span>Ekspor Markdown</span>
        </button>
      </header>

      {/* Workspace Area split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left Column: Chat with IVA (4/12) */}
        <div className="xl:col-span-4 flex flex-col glass-panel rounded-xl overflow-hidden border border-outline-glow h-[600px] xl:h-[calc(100vh-170px)]">
          <div className="bg-surface-container-high/60 border-b border-outline-glow/30 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-surface-dim font-bold text-base">smart_toy</span>
              </div>
              <div>
                <h3 className="font-headline text-xs font-bold text-on-surface">Asisten Ekstraksi Canvas</h3>
                <p className="text-[9px] text-secondary font-mono tracking-wider">IVA ACTIVE</p>
              </div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded px-2 py-0.5 text-[9px] font-mono text-primary">
              Est: 500 Cr.
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {msg.sender === "iva" && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 self-end">
                    <span className="material-symbols-outlined text-xs text-primary font-bold">smart_toy</span>
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed relative ${
                    msg.sender === "user"
                      ? "bg-primary text-surface-dim rounded-br-none shadow-[0_0_10px_rgba(192,193,255,0.2)]"
                      : "bg-surface-container-low border border-outline-glow/50 text-on-surface rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`block text-[9px] mt-1.5 text-right opacity-60 ${msg.sender === "user" ? "text-surface-dim" : "text-on-surface-variant"}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {isExtracting && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xs text-primary font-bold animate-spin">sync</span>
                </div>
                <div className="p-3 bg-surface-container-low border border-outline-glow/50 rounded-xl rounded-bl-none text-xs text-on-surface-variant">
                  IVA sedang memproses input Anda...
                </div>
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleChatSubmit} className="p-3 border-t border-outline-glow/30 bg-surface-container-lowest/50 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                disabled={isExtracting}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Deskripsikan ide bisnis Anda..."
                className="flex-1 bg-surface-container-low border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-all disabled:opacity-55"
              />
              <button
                type="submit"
                disabled={isExtracting}
                className="bg-primary text-surface-dim font-bold rounded-lg px-3 py-2 hover:bg-primary-fixed hover:shadow-lg transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-55"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Lean Canvas Grid (8/12) */}
        <div className="xl:col-span-8 flex flex-col h-[600px] xl:h-[calc(100vh-170px)]">
          {canvas ? (
            <div className="grid grid-cols-10 grid-rows-3 gap-2.5 h-full min-h-0 text-xs">
              {/* Problem Section */}
              <div
                onClick={() => startEdit("problem")}
                className="col-span-2 row-span-2 glass-panel hover:border-secondary/70 hover:shadow-[0_0_15px_rgba(93,230,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase font-mono">
                  <span>1. Masalah (Problem)</span>
                  <span className="material-symbols-outlined text-xs">warning</span>
                </div>
                <p className="whitespace-pre-line text-[11px] text-on-surface-variant leading-relaxed">
                  {canvas.problem || "Belum ada deskripsi masalah. Klik untuk mengedit..."}
                </p>
              </div>

              {/* Solution & Metrics Column */}
              <div className="col-span-2 row-span-2 flex flex-col gap-2.5 min-h-0">
                {/* Solution */}
                <div
                  onClick={() => startEdit("solution")}
                  className="flex-1 glass-panel hover:border-secondary/70 hover:shadow-[0_0_15px_rgba(93,230,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase font-mono">
                    <span>4. Solusi (Solution)</span>
                    <span className="material-symbols-outlined text-xs">build</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {canvas.solution || "Belum ada solusi. Klik untuk mengedit..."}
                  </p>
                </div>
                {/* Key Metrics */}
                <div
                  onClick={() => startEdit("keyMetrics")}
                  className="flex-1 glass-panel hover:border-secondary/70 hover:shadow-[0_0_15px_rgba(93,230,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase font-mono">
                    <span>8. Ukuran Kunci</span>
                    <span className="material-symbols-outlined text-xs">bar_chart</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {canvas.keyMetrics || "Belum ada key metrics. Klik untuk mengedit..."}
                  </p>
                </div>
              </div>

              {/* UVP Section */}
              <div
                onClick={() => startEdit("uvp")}
                className="col-span-2 row-span-2 glass-panel hover:border-primary/70 hover:shadow-[0_0_15px_rgba(192,193,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar border-primary/30"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-primary uppercase font-mono">
                  <span>3. UVP (Proporsi Nilai)</span>
                  <span className="material-symbols-outlined text-xs">workspace_premium</span>
                </div>
                <p className="whitespace-pre-line text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                  {canvas.uvp || "Belum ada proporsi nilai unik. Klik untuk mengedit..."}
                </p>
              </div>

              {/* Unfair Advantage & Channels Column */}
              <div className="col-span-2 row-span-2 flex flex-col gap-2.5 min-h-0">
                {/* Unfair Advantage */}
                <div
                  onClick={() => startEdit("unfairAdvantage")}
                  className="flex-1 glass-panel hover:border-secondary/70 hover:shadow-[0_0_15px_rgba(93,230,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase font-mono">
                    <span>9. Keunggulan</span>
                    <span className="material-symbols-outlined text-xs">star</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {canvas.unfairAdvantage || "Belum ada keunggulan tidak adil. Klik..."}
                  </p>
                </div>
                {/* Channels */}
                <div
                  onClick={() => startEdit("channels")}
                  className="flex-1 glass-panel hover:border-secondary/70 hover:shadow-[0_0_15px_rgba(93,230,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase font-mono">
                    <span>5. Saluran (Channels)</span>
                    <span className="material-symbols-outlined text-xs">share</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {canvas.channels || "Belum ada saluran distribusi. Klik..."}
                  </p>
                </div>
              </div>

              {/* Customer Segments Section */}
              <div
                onClick={() => startEdit("customerSegments")}
                className="col-span-2 row-span-2 glass-panel hover:border-secondary/70 hover:shadow-[0_0_15px_rgba(93,230,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase font-mono">
                  <span>2. Segmen (Segments)</span>
                  <span className="material-symbols-outlined text-xs">group</span>
                </div>
                <p className="whitespace-pre-line text-[11px] text-on-surface-variant leading-relaxed">
                  {canvas.customerSegments || "Belum ada target segmen pelanggan. Klik..."}
                </p>
              </div>

              {/* Cost Structure (Bottom Left) */}
              <div
                onClick={() => startEdit("costStructure")}
                className="col-span-5 glass-panel hover:border-secondary/70 hover:shadow-[0_0_15px_rgba(93,230,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase font-mono">
                  <span>6. Struktur Biaya (Cost Structure)</span>
                  <span className="material-symbols-outlined text-xs">payments</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {canvas.costStructure || "Belum ada struktur biaya. Klik..."}
                </p>
              </div>

              {/* Revenue Streams (Bottom Right) */}
              <div
                onClick={() => startEdit("revenueStreams")}
                className="col-span-5 glass-panel hover:border-secondary/70 hover:shadow-[0_0_15px_rgba(93,230,255,0.15)] rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase font-mono">
                  <span>7. Aliran Pendapatan (Revenue Streams)</span>
                  <span className="material-symbols-outlined text-xs">local_atm</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {canvas.revenueStreams || "Belum ada aliran pendapatan. Klik..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 glass-panel rounded-xl flex flex-col items-center justify-center text-center p-6 border-dashed border-outline-glow/50">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3 animate-pulse">view_quilt</span>
              <h3 className="font-headline font-bold text-on-surface mb-1">Canvas Kosong</h3>
              <p className="text-xs text-on-surface-variant max-w-sm">
                Hubungi **IVA** di sebelah kiri untuk mengisi kanvas Anda dengan mengekstrak deskripsi ide bisnis kasar Anda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editing Dialog Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setEditingSection(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-sm font-bold text-primary mb-3 uppercase tracking-wider font-mono">
              Edit Bagian Kanvas: {editingSection}
            </h3>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={6}
              className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all resize-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-primary text-surface-dim font-bold rounded-lg text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
              >
                Simpan Bagian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
