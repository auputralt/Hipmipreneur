"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import * as ds from "../../../../lib/dataService";

interface PublicProject {
  id: string;
  name: string;
  type: string;
  segmentId: string;
}

interface ChatMessage {
  sender: "iva" | "respondent";
  text: string;
}

export default function PublicInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<PublicProject | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  // Flow State
  const [step, setStep] = useState<"onboarding" | "chat" | "completed">("onboarding");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isIvaTyping, setIsIvaTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isVoiceMockActive, setIsVoiceMockActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load project directly from Supabase (no Clerk auth needed)
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await ds.loadPublicProject(projectId);
        if (!cancelled && data) {
          setProject(data);
        }
      } catch (err) {
        console.warn("Failed to load public project:", err);
      } finally {
        if (!cancelled) setIsLoadingProject(false);
      }
    })();

    return () => { cancelled = true; };
  }, [projectId]);

  const interviewQuestions = [
    "Halo! Saya **IVA**, asisten AI yang memandu riset ini. Bisa ceritakan apa kesibukan pekerjaan Anda sehari-hari secara singkat?",
    "Menarik sekali. Dalam operasional kerja Anda tersebut, apa masalah paling mengesalkan yang sering Anda hadapi dan mengganggu efisiensi waktu Anda?",
    "Bagaimana cara Anda menanggulangi masalah tersebut saat ini? Apakah ada alat bantuan atau aplikasi khusus yang sedang Anda gunakan?",
    "Kami sedang merancang solusi berupa asisten pintar terpadu untuk mendeteksi kendala tersebut lebih awal secara otomatis. Apa pandangan awal Anda tentang konsep ini? Apakah Anda bersedia mencobanya?"
  ];

  const handleStartOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setStep("chat");
    setIsIvaTyping(true);

    setTimeout(() => {
      setChatMessages([
        { sender: "iva", text: `Halo ${name}! Terima kasih banyak atas kesediaan Anda meluangkan waktu untuk berpartisipasi dalam riset validasi kami.` },
        { sender: "iva", text: interviewQuestions[0] }
      ]);
      setIsIvaTyping(false);
      setQuestionIndex(1);
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isIvaTyping || questionIndex >= interviewQuestions.length) return;

    const userText = currentInput;
    setCurrentInput("");

    setChatMessages((prev) => [...prev, { sender: "respondent", text: userText }]);

    if (questionIndex < interviewQuestions.length) {
      setIsIvaTyping(true);

      setTimeout(() => {
        setChatMessages((prev) => [...prev, { sender: "iva", text: interviewQuestions[questionIndex] }]);
        setIsIvaTyping(false);
        setQuestionIndex(questionIndex + 1);
      }, 1500);
    } else {
      setIsIvaTyping(true);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: "iva", text: "Terima kasih banyak atas seluruh tanggapan berharga Anda! Kami telah mencatat masukan ini untuk menyusun riset kami. Klik 'Kirim Wawancara' di bawah untuk menyelesaikan sesi." }
        ]);
        setIsIvaTyping(false);
        setQuestionIndex(questionIndex + 1);
      }, 1000);
    }
  };

  const handleSubmitInterview = async () => {
    if (!project) return;

    setIsSubmitting(true);

    const transcriptText = chatMessages
      .map((msg) => `${msg.sender === "iva" ? "IVA" : name}: ${msg.text}`)
      .join("\n\n");

    try {
      // Submit directly to Supabase (no WorkspaceContext needed)
      await ds.submitPublicInterview({
        id: `int-pub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
        researchProjectId: project.id,
        workspaceId: "", // Will be filled by trigger or known from project
        respondentName: name,
        jobRole: role || "Responden Publik",
        transcriptText,
      });
      setStep("completed");
    } catch (err) {
      console.error("Failed to submit interview:", err);
      alert("Gagal mengirim wawancara. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isIvaTyping]);

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-surface-deep flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-on-surface-variant font-mono">Memuat sesi riset...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-on-surface-variant font-mono text-center p-6 gap-2">
        <span className="material-symbols-outlined text-4xl text-error animate-bounce">warning</span>
        <h2 className="text-sm font-bold text-on-surface">Riset Tidak Ditemukan</h2>
        <p className="text-xs">Tautan wawancara ini tidak valid atau telah kedaluwarsa.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-deep flex flex-col justify-center items-center p-4">
      {/* Container Card */}
      <div className="w-full max-w-xl bg-surface-container border border-outline-glow rounded-2xl flex flex-col overflow-hidden h-[600px]">
        {/* Top Branding Header */}
        <header className="bg-surface-container-high/70 border-b border-outline-glow/30 px-5 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-surface-dim font-bold text-base">smart_toy</span>
            </div>
            <div>
              <h2 className="font-headline text-xs font-bold text-on-surface">Wawancara Validasi Ide</h2>
              <p className="text-[9px] text-secondary font-mono tracking-widest uppercase">Powered by IVA Assistant</p>
            </div>
          </div>
          <div className="text-[9px] text-on-surface-variant/80 font-mono bg-surface-deep border border-outline-glow/20 px-2 py-0.5 rounded">
            Target: {project.name.replace("Problem Discovery - ", "")}
          </div>
        </header>

        {/* STEP 1: ONBOARDING */}
        {step === "onboarding" && (
          <div className="flex-1 p-6 flex flex-col justify-center max-w-sm mx-auto w-full gap-5">
            <div className="text-center space-y-1">
              <h3 className="font-headline font-bold text-on-surface text-base">Selamat Datang di Sesi Riset</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tanggapan jujur Anda sangat membantu kami menciptakan solusi yang tepat guna. Masukkan nama Anda untuk memulai.
              </p>
            </div>

            <form onSubmit={handleStartOnboarding} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2.5 text-xs text-on-surface outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Jabatan / Pekerjaan (Opsional)</label>
                <input
                  type="text"
                  placeholder="e.g. Supervisor Pabrik / Pemilik Kios"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2.5 text-xs text-on-surface outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-surface-dim font-bold rounded-xl text-xs shadow-md hover:bg-primary-fixed transition-all cursor-pointer font-headline"
              >
                Mulai Sesi Chat
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: LIVE CHAT */}
        {step === "chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatMessages.map((msg, idx) => {
                const isIva = msg.sender === "iva";
                return (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${isIva ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                    {isIva && (
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 self-end mb-1">
                        <span className="material-symbols-outlined text-xs text-primary font-bold">smart_toy</span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${ isIva ? "bg-surface-container-low border border-outline-glow/50 text-on-surface rounded-bl-none font-body" : "bg-primary text-surface-dim rounded-br-none font-sans font-semibold shadow-md" }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {isIvaTyping && (
                <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xs text-primary font-bold animate-spin">sync</span>
                  </div>
                  <div className="p-3 bg-surface-container-low border border-outline-glow/50 rounded-xl rounded-bl-none text-xs text-on-surface-variant italic">
                    IVA sedang mengetik...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Actions Bar */}
            <div className="p-3 border-t border-outline-glow/30 bg-surface-container-lowest/50 shrink-0 flex flex-col gap-2">
              {questionIndex > interviewQuestions.length && !isIvaTyping ? (
                <button
                  onClick={handleSubmitInterview}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-secondary text-surface-dim font-bold rounded-xl text-xs hover:bg-secondary-fixed transition-all cursor-pointer font-headline shadow-lg text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      Mengirim...
                    </>
                  ) : (
                    "Kirim Wawancara Anda"
                  )}
                </button>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  {/* Mock Microphone Voice Input button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsVoiceMockActive(!isVoiceMockActive);
                      if (!isVoiceMockActive) {
                        setCurrentInput("Tentu, saya sangat tertarik karena kami butuh solusi yang cepat.");
                      }
                    }}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${ isVoiceMockActive ? "bg-error border-error text-white " : "bg-surface-container-low border-outline-glow hover:border-primary text-on-surface-variant" }`}
                    title="Gunakan Input Suara (Mock)"
                  >
                    <span className="material-symbols-outlined text-base">mic</span>
                  </button>

                  <input
                    type="text"
                    disabled={isIvaTyping}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Ketik tanggapan Anda di sini..."
                    className="flex-1 bg-surface-container-low border border-outline-glow rounded-xl px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isIvaTyping || !currentInput.trim()}
                    className="bg-primary text-surface-dim font-bold rounded-xl px-4 py-2 hover:bg-primary-fixed transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">send</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED */}
        {step === "completed" && (
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center max-w-sm mx-auto w-full gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(52, 211, 153, 0.12)] animate-bounce">
              <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-headline font-bold text-on-surface text-base">Wawancara Selesai Kirim!</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                Terima kasih banyak atas waktu Anda, tanggapan Anda telah berhasil diunggah langsung ke dasbor riset tim pendiri.
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-2 px-5 py-2 bg-surface-container-high border border-outline-glow hover:border-on-surface/40 text-on-surface rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Kembali ke Landing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
