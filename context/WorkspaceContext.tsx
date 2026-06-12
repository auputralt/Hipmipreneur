/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import * as ds from "../lib/dataService";

export interface Workspace {
  id: string;
  name: string;
  description: string;
  url?: string;
  credits: number;
  healthScore: number;
  type: string; // "Develop my idea" | "Find my idea" | "Grow my business"
  isArchived: boolean;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatar: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
}

export interface LeanCanvas {
  customerSegments: string;
  problem: string;
  uvp: string;
  solution: string;
  channels: string;
  revenueStreams: string;
  costStructure: string;
  keyMetrics: string;
  unfairAdvantage: string;
}

export interface ResearchProject {
  id: string;
  workspaceId: string;
  name: string;
  segmentId: string;
  type: string; // "Validate customer problems" | "Understand my buyers" | "Analyze won/lost deals"
  status: "In progress" | "Completed";
  createdAt: string;
}

export interface Interview {
  id: string;
  researchProjectId: string;
  respondentName: string;
  jobRole: string;
  mode: "ai_led" | "ai_assisted" | "upload";
  isSynthetic: boolean;
  status: "not_started" | "in_progress" | "completed";
  qualityScore: number;
  scriptCoveragePct: number;
  transcriptText: string;
  date: string;
}

export interface Insight {
  title: string;
  pct: number;
  count: number;
  description: string;
}

export interface InsightCategory {
  name: string;
  insights: Insight[];
}

export interface InsightReport {
  projectId: string;
  generatedAt: string;
  qualityScore: number;
  qualityDetails: string;
  categories: InsightCategory[];
}

export interface Persona {
  id: string;
  workspaceId: string;
  segmentId: string;
  name: string;
  archetype: string;
  summary: string;
  coreQuote: string;
  avatarUrl: string;
  ageRange: string;
  jobRoles: string;
  priorityInitiatives: string[];
  keyPains: string[];
  desiredOutcomes: string[];
  decisionMaking: string[];
  evaluationCriteria: string[];
  messagingAngles: string[];
}

export interface PositioningDoc {
  id: string;
  workspaceId: string;
  personaId: string;
  corePositioning: string;
  targetAudience: string;
  marketContext: string;
  uvp: string;
  brandVoice: string;
  reasonsToBelieve: string[];
  messagingPillars: { title: string; body: string }[];
  elevatorPitch: string;
}

export interface LandingPageAsset {
  id: string;
  workspaceId: string;
  personaId: string;
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  features: { title: string; description: string }[];
  socialProof: string;
  faq: { question: string; answer: string }[];
}

export interface SalesDeckSlide {
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  notes: string;
}

export interface SalesDeckAsset {
  id: string;
  workspaceId: string;
  personaId: string;
  slides: SalesDeckSlide[];
}

export interface ScriptSection {
  id: string;
  title: string;
  duration: string;
  questions: string[];
}

export interface Contact {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobRole: string;
  segmentId: string;
  tags: string[];
  source: "manual" | "interview" | "import";
  notes: string;
  lastContactedAt: string | null;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  eventType: "interview" | "mentor_sync" | "team_followup" | "deadline" | "other";
  linkedContactId: string;
  linkedProjectId: string;
  startTime: string;
  endTime: string;
  location: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface VentureNote {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  linkedSegmentId: string;
  linkedCanvasSection: string;
  colorTag: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GlossaryTerm {
  id: string;
  workspaceId: string;
  term: string;
  definition: string;
  category: string;
  sourceInterviewId: string;
  sourceProjectId: string;
  isAutoDetected: boolean;
  createdAt: string;
}

export interface AnalysisReport {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  comparisonType: "cross_research" | "validation_signals" | "market_fit";
  projectIds: string[];
  validationSignals: { label: string; value: number; description: string }[];
  summary: string;
  createdAt: string;
}

export interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeWorkspace: Workspace | undefined;
  userProfile: UserProfile;
  startingPath: string | null;
  onboardingCompleted: boolean;
  completedTasks: string[]; // List of completed tasks by ID, e.g. "canvas-builder-1"
  canvasData: Record<string, LeanCanvas>; // Mapped by workspaceId
  customerSegments: Record<string, CustomerSegment[]>; // Mapped by workspaceId
  researchProjects: ResearchProject[];
  interviews: Interview[];
  insightReports: Record<string, InsightReport>; // Mapped by projectId
  personas: Record<string, Persona[]>; // Mapped by workspaceId
  positioningDocs: Record<string, PositioningDoc[]>; // Mapped by workspaceId
  landingPages: Record<string, LandingPageAsset[]>; // Mapped by workspaceId
  salesDecks: Record<string, SalesDeckAsset[]>; // Mapped by workspaceId
  subscriptionPlans: Record<string, string>; // Mapped by workspaceId
  // New feature state
  contacts: Record<string, Contact[]>; // Mapped by workspaceId
  calendarEvents: Record<string, CalendarEvent[]>; // Mapped by workspaceId
  notes: Record<string, VentureNote[]>; // Mapped by workspaceId
  glossaryTerms: Record<string, GlossaryTerm[]>; // Mapped by workspaceId
  analysisReports: Record<string, AnalysisReport[]>; // Mapped by workspaceId
  interviewScripts: Record<string, ScriptSection[]>; // Mapped by workspaceId
  isDataLoaded: boolean; // True once initial Supabase load completes
  createWorkspace: (name: string, description: string, type: string) => Workspace;
  createWorkspaceForChat: (path: "find" | "develop" | "grow") => string;
  switchWorkspace: (id: string) => void;
  updateStartingPath: (path: string) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  completeOnboarding: () => void;
  updateCanvasSection: (workspaceId: string, section: keyof LeanCanvas, content: string) => void;
  extractCanvasWithAI: (workspaceId: string, rawInput: string) => Promise<{ usedAI: boolean }>;
  addResearchProject: (workspaceId: string, name: string, segmentId: string, type: string) => void;
  generateSyntheticInterviews: (projectId: string, count: number) => Promise<void>;
  synthesizeResearchInsights: (projectId: string) => Promise<void>;
  addInterviewTranscript: (projectId: string, respondentName: string, jobRole: string, transcript: string, isSynthetic: boolean) => void;
  deductCredits: (workspaceId: string, amount: number) => boolean;
  generatePersona: (workspaceId: string, segmentId: string) => Promise<void>;
  generatePositioning: (workspaceId: string, personaId: string) => Promise<void>;
  generateLandingPage: (workspaceId: string, personaId: string) => Promise<void>;
  generateSalesDeck: (workspaceId: string, personaId: string) => Promise<void>;
  updateGtmAsset: (workspaceId: string, type: "positioning" | "landing_page" | "sales_deck", assetId: string, content: any) => void;
  updatePersona: (workspaceId: string, personaId: string, content: Partial<Persona>) => void;
  upgradeSubscription: (workspaceId: string, plan: string) => void;
  purchaseCredits: (workspaceId: string, amount: number) => void;
  updateWorkspaceDetails: (workspaceId: string, name: string, description: string) => void;
  // New feature functions
  addContact: (contact: Omit<Contact, "id" | "workspaceId" | "createdAt">) => void;
  updateContact: (workspaceId: string, contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (workspaceId: string, contactId: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, "id" | "workspaceId" | "createdAt">) => void;
  updateCalendarEvent: (workspaceId: string, eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (workspaceId: string, eventId: string) => void;
  completeCalendarEvent: (workspaceId: string, eventId: string) => void;
  addNote: (note: Omit<VentureNote, "id" | "workspaceId" | "createdAt" | "updatedAt">) => void;
  updateNote: (workspaceId: string, noteId: string, updates: Partial<VentureNote>) => void;
  deleteNote: (workspaceId: string, noteId: string) => void;
  togglePinNote: (workspaceId: string, noteId: string) => void;
  addGlossaryTerm: (term: Omit<GlossaryTerm, "id" | "workspaceId" | "createdAt">) => void;
  updateGlossaryTerm: (workspaceId: string, termId: string, updates: Partial<GlossaryTerm>) => void;
  deleteGlossaryTerm: (workspaceId: string, termId: string) => void;
  autoDetectTermsFromTranscript: (workspaceId: string, projectId: string) => Promise<void>;
  addAnalysisReport: (report: Omit<AnalysisReport, "id" | "workspaceId" | "createdAt">) => void;
  updateAnalysisReport: (workspaceId: string, reportId: string, updates: Partial<AnalysisReport>) => void;
  deleteAnalysisReport: (workspaceId: string, reportId: string) => void;
  saveInterviewScripts: (workspaceId: string, sections: ScriptSection[]) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

// Helper: safely parse API error JSON to extract human-readable message
function parseApiError(text: string): string {
  try {
    const parsed = JSON.parse(text);
    if (parsed.error && typeof parsed.error === "string") return parsed.error;
    return text;
  } catch {
    return text;
  }
}

// Helper: HTML-escape a string for safe interpolation in templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Re-export escapeHtml for use in landing pages component
export { escapeHtml };

// Initial static seed data for mock
const SEED_CANVASES: Record<string, LeanCanvas> = {
  "ws-nexus": {
    customerSegments: "Industrial IoT operators, manufacturing warehouse managers, logistics facility executives.",
    problem: "1. Unexpected machine downtime causing costly assembly line delays.\n2. Inefficient network bandwidth usage in remote edge facilities.\n3. High latency in critical system safety alerts.",
    uvp: "Real-time Edge AI computing that predicts machine failure locally with zero latency, reducing data transfers by 90%.",
    solution: "Local edge device monitoring software with pre-trained anomaly detection models.",
    channels: "Direct sales to manufacturing teams, tech consultancies, industrial hardware distributors.",
    revenueStreams: "Monthly software subscription based on connected edge nodes (Rp 500.000/node/month), onboarding services.",
    costStructure: "AWS cloud hosting (training models), embedded hardware developer salaries, direct sales commissions.",
    keyMetrics: "Active edge nodes, average latency reduction, hardware node uptime, customer CAC.",
    unfairAdvantage: "Proprietary low-compute model compression algorithm developed in-house (uses 1/10th RAM of standard models)."
  },
  "ws-dummy": {
    customerSegments: "Traditional market kiosk owners, local warung operators, urban motorcycle couriers.",
    problem: "1. Inability to track demand fluctuations in traditional markets.\n2. High commission fees on existing ride-sharing platforms.\n3. Delayed logistics resulting in fresh food spoilage.",
    uvp: "Direct supply-chain coordination matching Traditional Kiosk orders to local couriers in real-time with under 2% transaction fees.",
    solution: "Sederhana mobile app enabling local couriers to receive bulk orders direct from market coordinators.",
    channels: "On-the-ground agents visiting local markets (HIPMI mentors/agents), word of mouth, WhatsApp groups.",
    revenueStreams: "Flat 1.5% transaction processing fee, premium route prioritization for couriers.",
    costStructure: "Serverless database hosting, offline community marketing, customer support personnel.",
    keyMetrics: "Daily orders processed, average courier payout, courier retention rate.",
    unfairAdvantage: "Direct partnerships with traditional market associations (APPSI chapters) granting exclusive access to coordinator logs."
  }
};

const SEED_SEGMENTS: Record<string, CustomerSegment[]> = {
  "ws-nexus": [
    { id: "seg-nexus-1", name: "IoT Operators", description: "Engineers responsible for maintaining physical factory floor machinery and network operations." },
    { id: "seg-nexus-2", name: "Warehouse Managers", description: "Operations leads overseeing sorting and distribution facilities." }
  ],
  "ws-dummy": [
    { id: "seg-dummy-1", name: "Traditional Kiosk Owners", description: "SME owners selling groceries and fresh foods in wet markets." },
    { id: "seg-dummy-2", name: "Motorcycle Couriers", description: "Independent local logistics providers seeking reliable dispatch orders." }
  ]
};

const SEED_PROJECTS: ResearchProject[] = [
  {
    id: "proj-nexus-1",
    workspaceId: "ws-nexus",
    name: "Problem Discovery - High-Tech Operators",
    segmentId: "seg-nexus-1",
    type: "Validate customer problems",
    status: "Completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "proj-dummy-1",
    workspaceId: "ws-dummy",
    name: "Problem Discovery - Traditional Sellers",
    segmentId: "seg-dummy-1",
    type: "Validate customer problems",
    status: "In progress",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_INTERVIEWS: Interview[] = [
  {
    id: "int-1",
    researchProjectId: "proj-nexus-1",
    respondentName: "Budi Santoso",
    jobRole: "Factory Operations Lead",
    mode: "upload",
    isSynthetic: false,
    status: "completed",
    qualityScore: 92,
    scriptCoveragePct: 100,
    transcriptText: "Budi: Kami sering mengalami downtime mendadak di lini produksi nomor 3. Sekali mati, rugi puluhan juta rupiah per jam. Kami butuh deteksi dini yang tidak bergantung penuh pada internet awan karena koneksi pabrik kami tidak stabil.\nInterviewer: Bagaimana cara Anda menangani ini sekarang?\nBudi: Saat ini kami hanya melakukan maintenance berkala setiap bulan, tapi itu sering kekolongan. Kami butuh alert real-time langsung di alatnya.",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: "int-2",
    researchProjectId: "proj-nexus-1",
    respondentName: "Sarah Wijaya",
    jobRole: "IoT Systems Engineer",
    mode: "ai_led",
    isSynthetic: true,
    status: "completed",
    qualityScore: 88,
    scriptCoveragePct: 95,
    transcriptText: "IVA: Apa tantangan terbesar Anda saat mengelola data dari ratusan sensor pabrik?\nSarah (Synthetic): Masalah utama adalah bandwidth. Mengirim semua data sensor mentah ke cloud memakan biaya internet yang besar dan seringkali lag. Kami butuh pemrosesan data lokal di edge sebelum dikirim ke server pusat.",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: "int-3",
    researchProjectId: "proj-nexus-1",
    respondentName: "Hendry Siregar",
    jobRole: "Logistics Director",
    mode: "ai_assisted",
    isSynthetic: false,
    status: "completed",
    qualityScore: 84,
    scriptCoveragePct: 88,
    transcriptText: "Interviewer: Mengapa latency menjadi krusial di pusat sortir barang?\nHendry: Jika konveyor macet lebih dari 10 detik tanpa alert, barang akan menumpuk dan merusak motor penggerak. Alert harus instan, kurang dari 1 detik.",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

const SEED_INSIGHTS: Record<string, InsightReport> = {
  "proj-nexus-1": {
    projectId: "proj-nexus-1",
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    qualityScore: 88,
    qualityDetails: "Sangat valid. Penelitian ini melibatkan 3 wawancara selesai dengan rata-rata cakupan skrip sebesar 94%. Hasil menunjukkan pola kuat mengenai kegagalan konektivitas awan lokal dan kerugian finansial akibat downtime.",
    categories: [
      {
        name: "Jobs-to-be-Done (JTBD)",
        insights: [
          { title: "Deteksi Kegagalan Lini Produksi", pct: 100, count: 3, description: "Memantau status mesin perakitan secara berkelanjutan tanpa tergantung pada jaringan luar." },
          { title: "Penghematan Bandwidth Sensor", pct: 67, count: 2, description: "Menyaring data telemetri di level lokal sebelum mengirimkan kompresi ringkasan ke database pusat." }
        ]
      },
      {
        name: "Triggering Events (Pemicu)",
        insights: [
          { title: "Downtime Lini Perakitan Mendadak", pct: 100, count: 3, description: "Terjadinya kerusakan fatal pada dinamo atau motor yang menghentikan operasional pabrik seketika." },
          { title: "Kenaikan Tagihan Bandwidth Bulanan", pct: 67, count: 2, description: "Lonjakan kuota internet akibat pengiriman log telemetri mentah secara berkala." }
        ]
      },
      {
        name: "Desired Outcome (Hasil yang Diharapkan)",
        insights: [
          { title: "Waktu Deteksi Di Bawah 1 Detik", pct: 100, count: 3, description: "Menerima alert kerusakan dalam hitungan milidetik agar mesin otomatis mati sebelum rusak parah." },
          { title: "Reduksi Biaya Transfer Data", pct: 67, count: 2, description: "Mengurangi pengeluaran bandwidth internet hingga minimal 80%." }
        ]
      }
    ]
  }
};

const SEED_PERSONAS: Record<string, Persona[]> = {
  "ws-nexus": [
    {
      id: "pers-nexus-1",
      workspaceId: "ws-nexus",
      segmentId: "seg-nexus-1",
      name: "Sofia",
      archetype: "The Data-Driven IoT Operator",
      summary: "Sofia manages industrial networks in remote warehouse facilities. She is highly technical, focuses on minimizing latency and server downtime, and is frustrated by high internet bandwidth usage.",
      coreQuote: "Downtime lini produksi merugikan kami ratusan juta per jam. Saya butuh alert real-time luring.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      ageRange: "28-35",
      jobRoles: "IoT Systems Engineer, Operations Lead",
      priorityInitiatives: [
        "Menurunkan downtime perakitan hingga < 1%",
        "Mengurangi bandwidth data awan sebesar 80%",
        "Meningkatkan kecepatan peringatan bahaya"
      ],
      keyPains: [
        "Koneksi pabrik tidak stabil untuk pemrosesan cloud",
        "Biaya bandwidth log telemetri membengkak",
        "Downtime mendadak merusak conveyor motor"
      ],
      desiredOutcomes: [
        "Deteksi anomali lokal di bawah 1 detik",
        "Pemrosesan lokal hemat RAM",
        "Visualisasi log kegagalan terpusat"
      ],
      decisionMaking: [
        "Mengevaluasi latensi performa",
        "Memverifikasi integrasi perangkat keras sensor",
        "Persetujuan anggaran CTO"
      ],
      evaluationCriteria: [
        "Kecepatan alert lokal",
        "Konsumsi memori edge",
        "Skalabilitas node"
      ],
      messagingAngles: [
        "Bangun Deteksi Kegagalan Tanpa Tergantung Cloud",
        "Reduksi Biaya Bandwidth Sensor Hingga 90%"
      ]
    }
  ]
};

const SEED_POSITIONING: Record<string, PositioningDoc[]> = {
  "ws-nexus": [
    {
      id: "pos-nexus-1",
      workspaceId: "ws-nexus",
      personaId: "pers-nexus-1",
      corePositioning: "Untuk IoT Operators yang mengalami kerugian akibat downtime pabrik mendadak, Nexus AI adalah Edge AI computing platform yang menyediakan deteksi kegagalan lokal berlatensi nol milidetik. Tidak seperti pemrosesan awan lambat, kami memproses anomali sensor lokal dengan model terkompresi super hemat RAM.",
      targetAudience: "IoT Systems Engineers, Operations Directors, Factory Floor Supervisors",
      marketContext: "Platform Edge Computing IoT Industri Indonesia",
      uvp: "Real-time Edge AI computing that predicts machine failure locally with zero latency, reducing data transfers by 90%.",
      brandVoice: "Teknis, Visioner, Presisi, Andal",
      reasonsToBelieve: [
        "Teknologi kompresi model lokal hemat memori",
        "Tingkat akurasi deteksi anomali di atas 98.4%",
        "Kemitraan uji coba dengan HIPMI Manufaktur"
      ],
      messagingPillars: [
        { title: "Deteksi Tanpa Jaringan", body: "Deteksi lokal berjalan stabil bahkan saat koneksi internet pabrik terputus sepenuhnya." },
        { title: "Kompresi Model 1/10 RAM", body: "Menjalankan deep learning langsung pada mikrokontroler murah tanpa upgrade perangkat keras." },
        { title: "Reduksi Biaya Bandwidth", body: "Hanya mengirim ringkasan anomali terkompresi ke server pusat, menghemat biaya internet." }
      ],
      elevatorPitch: "Nexus AI membantu operator pabrik memprediksi kegagalan mesin secara instan di level lokal tanpa bergantung pada koneksi cloud. Dengan algoritma kompresi 1/10 RAM, kami memproses telemetri sensor secara luring untuk mendeteksi downtime sebelum terjadi, memangkas biaya transfer data hingga 90%."
    }
  ]
};

const SEED_LANDING_PAGES: Record<string, LandingPageAsset[]> = {
  "ws-nexus": [
    {
      id: "lp-nexus-1",
      workspaceId: "ws-nexus",
      personaId: "pers-nexus-1",
      heroHeadline: "Downtime Pabrik Merugikan Anda. Deteksi Secara Instan Sebelum Terjadi.",
      heroSubheadline: "Platform Edge AI lokal untuk memantau mesin secara luring dengan latensi nol dan reduksi bandwidth internet hingga 90%.",
      ctaText: "Mulai Uji Coba Gratis",
      features: [
        { title: "Pemrosesan Luring 100%", description: "Tidak peduli koneksi internet naik-turun, algoritma AI tetap siaga mendeteksi anomali mesin secara lokal." },
        { title: "Model Kompresi Ekstrim", description: "Jalankan model neural network canggih langsung di sensor Edge dengan memori RAM minim." },
        { title: "Notifikasi Alert Milidetik", description: "Dapatkan pemberitahuan kegagalan conveyor dalam di bawah 1 detik untuk meminimalkan kerusakan motor." }
      ],
      socialProof: "Dipercaya oleh HIPMI Manufaktur Jawa Barat dan 12+ fasilitas perakitan lokal.",
      faq: [
        { question: "Apakah kami perlu membeli perangkat keras baru?", answer: "Tidak, Nexus AI kompatibel dengan sebagian besar sensor IoT standar industri yang sudah terpasang." },
        { question: "Bagaimana jika koneksi internet mati?", answer: "Algoritma tetap memproses telemetri secara lokal di edge dan mengirim alarm via sirkuit lokal, data log disinkronkan saat online kembali." }
      ]
    }
  ]
};

const SEED_SALES_DECKS: Record<string, SalesDeckAsset[]> = {
  "ws-nexus": [
    {
      id: "sd-nexus-1",
      workspaceId: "ws-nexus",
      personaId: "pers-nexus-1",
      slides: [
        { title: "Nexus AI: Menghentikan Downtime Pabrik Secara Instan", subtitle: "Edge AI Computing Terlokalisasi Tanpa Latensi Cloud", bulletPoints: ["Solusi prediksi kegagalan mesin luring", "Deteksi anomali milidetik langsung di perangkat", "Hemat bandwidth internet hingga 90%"], notes: "Slide pembuka. Sapa audiens, perkenalkan Nexus AI sebagai solusi Edge AI presisi untuk industri manufaktur Indonesia." },
        { title: "Dilema Industri: Downtime Menguras Profit", subtitle: "Masalah Utama Factory Operations", bulletPoints: ["Downtime lini produksi merugikan Rp 50jt+ per jam", "Pemeliharaan terjadwal sering terlambat mendeteksi", "Koneksi cloud tidak stabil untuk peringatan darurat"], notes: "Garis bawahi rasa sakit utama Budi Santoso (Operations Lead). Setiap menit conveyer mati adalah kerugian nyata." },
        { title: "Awan Lambat, Jaringan Rapuh", subtitle: "Mengapa Cloud IoT Gagal di Lapangan", bulletPoints: ["Latensi transmisi data di atas 10 detik", "Tarif kuota upload log mentah membengkak", "Ketergantungan penuh pada koneksi internet luar"], notes: "Jelaskan kelemahan solusi cloud saat ini. Mengapa cloud IoT kurang andal di pabrik remote." },
        { title: "Solusi Kami: Nexus Edge AI", subtitle: "Bangun Keamanan dari Deteksi Lokal", bulletPoints: ["AI lokal siaga mendeteksi anomali", "Tanpa delay cloud, respon dalam milidetik", "Berjalan mandiri tanpa internet eksternal"], notes: "Perkenalkan solusi. Tunjukkan model lokal yang terpasang langsung di perangkat sensor." },
        { title: "Algoritma Kompresi Unik 1/10 RAM", subtitle: "Keunggulan Teknologi Nexus", bulletPoints: ["Mengompres model neural network standar", "Dapat dijalankan di memori RAM mikrofon/sensor kecil", "Akurasi analisis anomali mencapai 98.4%"], notes: "Soroti Unfair Advantage kita. Model yang sangat ramping dibanding kompetitor luar." }
      ]
    }
  ]
};

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "ws-nexus",
    name: "Project Alpha",
    description: "B2B SaaS Edge AI computing platform for Industrial IoT networks.",
    url: "https://nexus-ai.id",
    credits: 14250,
    healthScore: 65,
    type: "Grow my business",
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ws-dummy",
    name: "SME Local Delivery",
    description: "Hyperlocal supply chain coordination for Indonesian traditional markets.",
    url: "",
    credits: 5000,
    healthScore: 15,
    type: "Develop my idea",
    isArchived: false,
    createdAt: new Date().toISOString(),
  }
];

const DEFAULT_USER: UserProfile = {
  name: "Alex Chen",
  role: "Founder, Nexus AI",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbqqnkvcAMm5pQYKhBHhE2JvniuVMi4j4zUbwVKFNeQTOZ1bwp00oHicL-A3-8uTlxf2IFXW_a5Y2HEE8VabFVauIwVfiDiiAOzuTgvkTJcrVyu2ueMlfh1xy1pqTFrL_4EG27pXtU85fLRWTVATLaTjZY-2UbUJG6ShemJGKma96btBufd61FUI9_Jb6ZQe9tvMJ2RKXMc8gBUBH52HW-g7LOW9B1jJlMjd5S6nhsciK1X9Aiox9J5IEwvva1jFdYt_qCrtCC7SsC",
};

// Deduction lock to prevent race conditions on concurrent credit deductions
const deductionLocks = new Map<string, boolean>();

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, isLoaded } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("ws-nexus");
  const [userProfile] = useState<UserProfile>(DEFAULT_USER);
  const [startingPath, setStartingPath] = useState<string | null>("Grow my business");
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true);
  const [completedTasksRecord, setCompletedTasksRecord] = useState<Record<string, string[]>>({
    "ws-nexus": [
      "canvas-builder-1",
      "canvas-builder-2",
      "canvas-builder-uvp",
      "canvas-builder-solution",
      "canvas-builder-unfair",
      "canvas-builder-3",
      "validation-real-1",
      "validation-real-2",
      "validation-real-3",
      "gtm-assets-1",
      "gtm-assets-2",
      "gtm-assets-3"
    ],
    "ws-dummy": []
  });

  // Core validation loop state additions
  const [canvasData, setCanvasData] = useState<Record<string, LeanCanvas>>(SEED_CANVASES);
  const [customerSegments, setCustomerSegments] = useState<Record<string, CustomerSegment[]>>(SEED_SEGMENTS);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>(SEED_PROJECTS);
  const [interviews, setInterviews] = useState<Interview[]>(SEED_INTERVIEWS);
  const [insightReports, setInsightReports] = useState<Record<string, InsightReport>>(SEED_INSIGHTS);

  // GTM states additions
  const [personas, setPersonas] = useState<Record<string, Persona[]>>(SEED_PERSONAS);
  const [positioningDocs, setPositioningDocs] = useState<Record<string, PositioningDoc[]>>(SEED_POSITIONING);
  const [landingPages, setLandingPages] = useState<Record<string, LandingPageAsset[]>>(SEED_LANDING_PAGES);
  const [salesDecks, setSalesDecks] = useState<Record<string, SalesDeckAsset[]>>(SEED_SALES_DECKS);
  const [subscriptionPlans, setSubscriptionPlans] = useState<Record<string, string>>({ "ws-nexus": "Growth", "ws-dummy": "Free Trial" });

  // New feature states
  const [contacts, setContacts] = useState<Record<string, Contact[]>>({});
  const [calendarEvents, setCalendarEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [notes, setNotes] = useState<Record<string, VentureNote[]>>({});
  const [glossaryTerms, setGlossaryTerms] = useState<Record<string, GlossaryTerm[]>>({});
  const [analysisReports, setAnalysisReports] = useState<Record<string, AnalysisReport[]>>({});
  const [interviewScripts, setInterviewScripts] = useState<Record<string, ScriptSection[]>>(({}));
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Refs for accessing latest state in async callbacks without stale closures
  const canvasDataRef = useRef(canvasData);
  const customerSegmentsRef = useRef(customerSegments);
  const researchProjectsRef = useRef(researchProjects);
  const interviewsRef = useRef(interviews);
  const insightReportsRef = useRef(insightReports);
  const personasRef = useRef(personas);
  const positioningDocsRef = useRef(positioningDocs);
  const workspacesRef = useRef(workspaces);

  canvasDataRef.current = canvasData;
  customerSegmentsRef.current = customerSegments;
  researchProjectsRef.current = researchProjects;
  interviewsRef.current = interviews;
  insightReportsRef.current = insightReports;
  personasRef.current = personas;
  positioningDocsRef.current = positioningDocs;
  workspacesRef.current = workspaces;

  // ============================================================
  // LOAD FROM SUPABASE — called once when Clerk userId is available
  // ============================================================
  useEffect(() => {
    if (!userId || isDataLoaded) return;
    let cancelled = false;

    (async () => {
      try {
        // Try loading from Supabase
        const dbWorkspaces = await ds.loadWorkspaces(userId);
        if (cancelled) return;

        if (dbWorkspaces && dbWorkspaces.length > 0) {
          setWorkspaces(dbWorkspaces);
          setActiveWorkspaceId(dbWorkspaces[0].id);
          const ws = dbWorkspaces[0];
          if (ws.type) setStartingPath(ws.type);

          // Load all data for each workspace in parallel
          const results = await Promise.allSettled([
            ds.loadCanvasData(dbWorkspaces[0].id),
            ds.loadSegments(dbWorkspaces[0].id),
            ds.loadResearchProjects(dbWorkspaces[0].id),
            ds.loadInterviews(dbWorkspaces[0].id),
            ds.loadCompletedTasks(dbWorkspaces[0].id),
            ds.loadPersonas(dbWorkspaces[0].id),
            ds.loadPositioningDocs(dbWorkspaces[0].id),
            ds.loadLandingPages(dbWorkspaces[0].id),
            ds.loadSalesDecks(dbWorkspaces[0].id),
            ds.loadSubscriptionPlans(dbWorkspaces[0].id),
            ds.loadContacts(dbWorkspaces[0].id),
            ds.loadCalendarEvents(dbWorkspaces[0].id),
            ds.loadNotes(dbWorkspaces[0].id),
            ds.loadGlossaryTerms(dbWorkspaces[0].id),
            ds.loadAnalysisReports(dbWorkspaces[0].id),
            ds.loadInterviewScripts(dbWorkspaces[0].id),
          ]);

          if (cancelled) return;
          const v = (i: number) => results[i].status === "fulfilled" ? results[i].value : undefined;
          if (v(0)) setCanvasData(prev => ({ ...prev, [dbWorkspaces[0].id]: v(0) }));
          if (v(1)) setCustomerSegments(prev => ({ ...prev, [dbWorkspaces[0].id]: v(1) }));
          if (v(2)) setResearchProjects(v(2));
          if (v(3)) setInterviews(v(3));
          if (v(4)) setCompletedTasksRecord(prev => ({ ...prev, [dbWorkspaces[0].id]: v(4) }));
          if (v(5)) setPersonas(prev => ({ ...prev, [dbWorkspaces[0].id]: v(5) }));
          if (v(6)) setPositioningDocs(prev => ({ ...prev, [dbWorkspaces[0].id]: v(6) }));
          if (v(7)) setLandingPages(prev => ({ ...prev, [dbWorkspaces[0].id]: v(7) }));
          if (v(8)) setSalesDecks(prev => ({ ...prev, [dbWorkspaces[0].id]: v(8) }));
          if (v(9)) setSubscriptionPlans(v(9));
          if (v(10)) setContacts(prev => ({ ...prev, [dbWorkspaces[0].id]: v(10) }));
          if (v(11)) setCalendarEvents(prev => ({ ...prev, [dbWorkspaces[0].id]: v(11) }));
          if (v(12)) setNotes(prev => ({ ...prev, [dbWorkspaces[0].id]: v(12) }));
          if (v(13)) setGlossaryTerms(prev => ({ ...prev, [dbWorkspaces[0].id]: v(13) }));
          if (v(14)) setAnalysisReports(prev => ({ ...prev, [dbWorkspaces[0].id]: v(14) }));
          if (v(15)) setInterviewScripts(prev => ({ ...prev, [dbWorkspaces[0].id]: v(15) }));
        }
      } catch (err) {
        console.warn("Failed to load from Supabase, using seed data:", err);
      } finally {
        setIsDataLoaded(true);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, isDataLoaded]);

  // Calculate health dynamically based on completed tasks on-the-fly for all workspaces
  // Total known tasks: 12 (6 Phase 1 + 3 Phase 2 + 3 Phase 3)
  const TOTAL_TASKS = 12;
  const derivedWorkspaces = workspaces.map((ws) => {
    const wsTasks = completedTasksRecord[ws.id] || [];
    return { ...ws, healthScore: Math.min(Math.round((Math.min(wsTasks.length, TOTAL_TASKS) / TOTAL_TASKS) * 100), 100) };
  });

  const activeWorkspace = derivedWorkspaces.find((w) => w.id === activeWorkspaceId);
  const completedTasks = completedTasksRecord[activeWorkspaceId] || [];

  const createWorkspace = (name: string, description: string, type: string): Workspace => {
    const newId = `ws-${Math.random().toString(36).substring(2, 11)}`;
    const newWorkspace: Workspace = {
      id: newId,
      name,
      description,
      credits: 5000, // starting credit pack for new workspace
      healthScore: 15,
      type,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    setWorkspaces((prev) => [...prev, newWorkspace]);
    setActiveWorkspaceId(newId);
    setStartingPath(type);
    setCompletedTasksRecord((prev) => ({ ...prev, [newId]: [] }));
    // BUG FIX: Don't reset onboarding for users who already completed it
    // Only set to false if this is the very first workspace being created
    // (onboardingCompleted is already true for existing users)

    // Initialize blank canvas data
    setCanvasData((prev) => ({
      ...prev,
      [newId]: {
        customerSegments: "",
        problem: "",
        uvp: "",
        solution: "",
        channels: "",
        revenueStreams: "",
        costStructure: "",
        keyMetrics: "",
        unfairAdvantage: ""
      }
    }));

    // Initialize empty segment listing
    setCustomerSegments((prev) => ({
      ...prev,
      [newId]: [
        { id: `seg-${newId}-1`, name: "Target Segment A", description: "Primary demographic or business persona targeted by the venture." }
      ]
    }));

    return newWorkspace;
  };

  const createWorkspaceForChat = useCallback(
    (path: "find" | "develop" | "grow") => {
      const pathNames: Record<string, string> = {
        find: "Find my idea",
        develop: "Develop my idea",
        grow: "Grow my business",
      };
      const defaultNames: Record<string, string> = {
        find: "New Venture — Finding Ideas",
        develop: "New Venture — Developing Idea",
        grow: "New Venture — Growing Business",
      };

      const id = ds.uid();
      const newWorkspace: Workspace = {
        id,
        name: defaultNames[path],
        description: "",
        credits: 5000,
        healthScore: 0,
        type: pathNames[path],
        isArchived: false,
        createdAt: new Date().toISOString(),
      };

      setWorkspaces((prev) => [...prev, newWorkspace]);
      setActiveWorkspaceId(id);

      // Persist to Supabase
      if (userId) {
        ds.createWorkspaceInDb({
          ...newWorkspace,
          userId,
          onboardingCompleted: true,
        });
      }

      return id;
    },
    [userId]
  );

  const switchWorkspace = (id: string) => {
    if (workspaces.some((w) => w.id === id)) {
      setActiveWorkspaceId(id);
      const ws = workspaces.find((w) => w.id === id);
      if (ws) {
        setStartingPath(ws.type);
      }
    }
  };

  const updateStartingPath = (path: string) => {
    setStartingPath(path);
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === activeWorkspaceId ? { ...w, type: path } : w))
    );
  };

  const completeTask = (taskId: string) => {
    setCompletedTasksRecord((prev) => {
      const current = prev[activeWorkspaceId] || [];
      if (!current.includes(taskId)) {
        return {
          ...prev,
          [activeWorkspaceId]: [...current, taskId]
        };
      }
      return prev;
    });
  };

  const uncompleteTask = (taskId: string) => {
    setCompletedTasksRecord((prev) => {
      const current = prev[activeWorkspaceId] || [];
      return {
        ...prev,
        [activeWorkspaceId]: current.filter((id) => id !== taskId)
      };
    });
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  // BUG FIX: deductCredits now uses a synchronous check with a lock to prevent race conditions
  // and returns the correct boolean value
  const deductCredits = useCallback((workspaceId: string, amount: number): boolean => {
    // Prevent concurrent deductions on the same workspace
    if (deductionLocks.get(workspaceId)) return false;
    deductionLocks.set(workspaceId, true);

    let success = false;

    // Synchronously read current credits from the ref (always up-to-date)
    const currentWs = workspacesRef.current.find((ws) => ws.id === workspaceId);
    if (currentWs && currentWs.credits >= amount) {
      success = true;
      setWorkspaces((prev) =>
        prev.map((ws) => {
          if (ws.id === workspaceId) {
            return { ...ws, credits: ws.credits - amount };
          }
          return ws;
        })
      );
    }

    // Release lock on next tick to allow the batch to flush
    setTimeout(() => deductionLocks.delete(workspaceId), 0);

    return success;
  }, []);

  const updateCanvasSection = (workspaceId: string, section: keyof LeanCanvas, content: string) => {
    setCanvasData((prev) => {
      const current = prev[workspaceId] || {
        customerSegments: "",
        problem: "",
        uvp: "",
        solution: "",
        channels: "",
        revenueStreams: "",
        costStructure: "",
        keyMetrics: "",
        unfairAdvantage: ""
      };
      return {
        ...prev,
        [workspaceId]: {
          ...current,
          [section]: content
        }
      };
    });
  };

  // AI Canvas Extraction — tries real AI first, falls back to mock templates
  const extractCanvasWithAI = async (workspaceId: string, rawInput: string): Promise<{ usedAI: boolean }> => {
    if (!deductCredits(workspaceId, 500)) {
      throw new Error("Kredit tidak mencukupi untuk melakukan ekstraksi kanvas AI.");
    }

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extract-canvas",
          data: { rawInput }
        })
      });

      if (!response.ok) {
        throw new Error(parseApiError(await response.text()));
      }

      const generatedCanvas: LeanCanvas = await response.json();

      setCanvasData((prev) => ({
        ...prev,
        [workspaceId]: generatedCanvas
      }));

      // Generate segments matching this canvas
      const newSegments: CustomerSegment[] = generatedCanvas.customerSegments.split(",").map((segName, index) => ({
        id: `seg-${workspaceId}-${index + 1}`,
        name: segName.trim(),
        description: `Target kelompok pengguna: ${segName.trim()} yang divalidasi lewat proses riset.`
      }));

      setCustomerSegments((prev) => ({
        ...prev,
        [workspaceId]: newSegments
      }));

      completeTask("canvas-builder-1");
      return { usedAI: true };
    } catch (err) {
      console.warn("Real AI extraction failed, falling back to mock:", err);
      // Mock Fallback
      const inputLower = rawInput.toLowerCase();
      let generatedCanvas: LeanCanvas;

      if (inputLower.includes("kopi") || inputLower.includes("food") || inputLower.includes("kuliner") || inputLower.includes("makanan")) {
        generatedCanvas = {
          customerSegments: "Pecinta kopi specialty, mahasiswa/pekerja WFH di perkotaan, kafe lokal sebagai mitra.",
          problem: "1. Kopi berkualitas tinggi seringkali mahal di perkotaan.\n2. Kedai kopi lokal kesulitan mendapatkan pasokan biji kopi stabil.\n3. Mahasiswa mencari tempat nyaman kerja dengan harga kopi terjangkau.",
          uvp: "Platform langganan kopi harian yang menghubungkan pecinta kopi dengan ratusan kafe independen lokal berharga hemat.",
          solution: "Sistem voucher digital seluler dan marketplace pengadaan biji kopi B2B terintegrasi.",
          channels: "Promosi media sosial (Instagram, TikTok), kemitraan offline dengan kafe, iklan target berbasis geolokasi.",
          revenueStreams: "Biaya keanggotaan langganan bulanan konsumen, komisi 10% transaksi kafe, penjualan pasokan biji kopi B2B.",
          costStructure: "Subsidi harga kopi ke mitra kafe, biaya pemeliharaan server aplikasi, pemasaran komunitas lokal.",
          keyMetrics: "Jumlah pengguna aktif bulanan (MAU), retensi langganan, volume transaksi harian kafe.",
          unfairAdvantage: "Kerjasama eksklusif dengan 50 jaringan kedai kopi lokal (HIPMI Kuliner Jakarta)."
        };
      } else if (inputLower.includes("health") || inputLower.includes("sehat") || inputLower.includes("medis") || inputLower.includes("dokter")) {
        generatedCanvas = {
          customerSegments: "Pasien penyakit kronis lansia, keluarga pengasuh (caregiver), klinik kesehatan swasta lokal.",
          problem: "1. Antrean konsultasi medis yang panjang dan tidak efisien.\n2. Kesulitan melacak kepatuhan minum obat harian lansia.\n3. Akses rekam medis yang terfragmentasi antar klinik.",
          uvp: "Asisten kesehatan IoT terintegrasi yang memantau vitalitas harian dan mengirimkan rekam medis otomatis ke klinik langganan Anda.",
          solution: "Aplikasi mobile pendamping pasien and stasiun pemantau kesehatan (vital signs) pintar di rumah.",
          channels: "Rekomendasi dokter spesialis, iklan online target umur 30-50 (anak lansia), event komunitas warga.",
          revenueStreams: "Sewa perangkat keras pemantau bulanan, langganan portal monitoring untuk dokter/klinik.",
          costStructure: "Pabrikasi dan perakitan sensor hardware, sertifikasi izin dinas kesehatan, server database terenkripsi.",
          keyMetrics: "Jumlah perangkat aktif, skor kepatuhan pengobatan pasien, kunjungan kembali pasien ke klinik.",
          unfairAdvantage: "Algoritma analisis aritmia jantung lokal berlisensi resmi dari Ikatan Dokter Indonesia (IDI)."
        };
      } else {
        // Default general extraction
        generatedCanvas = {
          customerSegments: "Pelaku UMKM digital Indonesia, pengguna e-commerce aktif, kurir logistik lokal.",
          problem: "1. Proses pembukuan keuangan manual yang rumit dan rentan kesalahan.\n2. Biaya pengiriman ekspedisi yang mahal untuk pesanan berat.\n3. Minimnya akses permodalan karena tidak terdaftar bankable.",
          uvp: "Platform mikro-fintech terpadu yang mencatat arus kas UMKM otomatis dan menyediakan pembiayaan invoice instan berbasis skor transaksi.",
          solution: "Aplikasi kasir POS mobile gratis terintegrasi dengan gateway pinjaman peer-to-peer.",
          channels: "Kemitraan dengan paguyuban UMKM daerah, program bimbingan HIPMI, iklan search engine.",
          revenueStreams: "Bunga pembagian hasil 2.5% dari pinjaman cair, langganan fitur premium ekspor laporan pajak.",
          costStructure: "Akuisisi pengguna baru (CAC), provisi risiko kredit macet, lisensi sistem keuangan OJK.",
          keyMetrics: "Total volume transaksi terproses (GTV), jumlah UMKM terdanai, tingkat NPL (non-performing loan).",
          unfairAdvantage: "Akses data histori transaksi logistik lokal melalui kerjasama dengan platform kurir partner."
        };
      }

      setCanvasData((prev) => ({
        ...prev,
        [workspaceId]: generatedCanvas
      }));

      // Generate segments matching this canvas
      const newSegments: CustomerSegment[] = generatedCanvas.customerSegments.split(",").map((segName, index) => ({
        id: `seg-${workspaceId}-${index + 1}`,
        name: segName.trim(),
        description: `Target kelompok pengguna: ${segName.trim()} yang divalidasi lewat proses riset.`
      }));

      setCustomerSegments((prev) => ({
        ...prev,
        [workspaceId]: newSegments
      }));

      completeTask("canvas-builder-1");
      return { usedAI: false };
    }
  };

  const addResearchProject = (workspaceId: string, name: string, segmentId: string, type: string) => {
    const newProj: ResearchProject = {
      id: `proj-${Math.random().toString(36).substring(2, 11)}`,
      workspaceId,
      name,
      segmentId,
      type,
      status: "In progress",
      createdAt: new Date().toISOString()
    };
    setResearchProjects((prev) => [newProj, ...prev]);
  };

  // Simulates IVA generating synthetic interviews
  // BUG FIX: Uses refs to avoid stale closures
  const generateSyntheticInterviews = async (projectId: string, count: number): Promise<void> => {
    const project = researchProjectsRef.current.find((p) => p.id === projectId);
    if (!project) return;

    if (!deductCredits(project.workspaceId, count * 1500)) {
      throw new Error("Kredit tidak mencukupi untuk simulasi wawancara sintetis.");
    }

    try {
      const canvas = canvasDataRef.current[project.workspaceId] || { uvp: "Startup", problem: "Masalah", solution: "Solusi" };
      const segment = customerSegmentsRef.current[project.workspaceId]?.find(s => s.id === project.segmentId) || { name: "Target Segment", description: "Deskripsi segment" };

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-interviews",
          data: {
            count,
            canvas,
            projectName: project.name,
            segmentName: segment.name,
            segmentDesc: segment.description,
            researchType: project.type
          }
        })
      });

      if (!response.ok) {
        throw new Error(parseApiError(await response.text()));
      }

      const generatedList = await response.json();
      const updatedInterviews: Interview[] = generatedList.map((item: any) => ({
        id: `int-syn-${Math.random().toString(36).substring(2, 11)}`,
        researchProjectId: projectId,
        respondentName: item.respondentName,
        jobRole: item.jobRole,
        mode: "ai_led",
        isSynthetic: true,
        status: "completed",
        qualityScore: item.qualityScore || 85,
        scriptCoveragePct: item.scriptCoveragePct || 90,
        transcriptText: item.transcriptText,
        date: new Date().toISOString().split('T')[0]
      }));

      setInterviews((prev) => [...updatedInterviews, ...prev]);
      completeTask("canvas-builder-3");
    } catch (err) {
      console.warn("Real AI synthetic interviews failed, falling back to mock:", err);
      // Mock Fallback
      const canvas = canvasDataRef.current[project.workspaceId] || { uvp: "Startup Ide" };
      const mockNames = ["Andi Wijaya", "Rina Kartika", "Dian Sastro", "Eko Prasetyo", "Feri Irawan"];
      const mockRoles = ["Operator Lapangan", "Manager Operasional", "Pemilik Toko", "Supervisor Logistik", "Konsultan Bisnis"];
      const newInterviews: Interview[] = [];

      for (let i = 0; i < count; i++) {
        const respondentName = mockNames[i % mockNames.length] + ` (Synthetic #${i + 1})`;
        const jobRole = mockRoles[i % mockRoles.length];
        const id = `int-syn-${Math.random().toString(36).substring(2, 11)}`;

        const transcriptText = `IVA: Halo ${respondentName}, saya ingin menanyakan perihal masalah Anda terkait ${canvas.problem.split('\n')[0] || "proses kerja"}.\n\n` +
          `${respondentName}: Iya benar, itu sangat mengganggu kami sehari-hari. Biasanya kami kehilangan waktu sekitar 2-3 jam untuk koordinasi manual.\n\n` +
          `IVA: Bagaimana dengan solusi kami berupa ${canvas.uvp}?\n\n` +
          `${respondentName}: Solusi tersebut terdengar menarik, terutama jika bisa diakses secara luring tanpa internet yang kencang. Kami pasti bersedia mencoba jika harganya masuk akal.`;

        newInterviews.push({
          id,
          researchProjectId: projectId,
          respondentName,
          jobRole,
          mode: "ai_led",
          isSynthetic: true,
          status: "completed",
          qualityScore: Math.floor(Math.random() * 15) + 80,
          scriptCoveragePct: Math.floor(Math.random() * 10) + 90,
          transcriptText,
          date: new Date().toISOString().split('T')[0]
        });
      }

      setInterviews((prev) => [...newInterviews, ...prev]);
      completeTask("canvas-builder-3");
    }
  };

  // Synthesize completed interviews to cluster insights
  const synthesizeResearchInsights = async (projectId: string): Promise<void> => {
    const project = researchProjectsRef.current.find((p) => p.id === projectId);
    if (!project) return;

    if (!deductCredits(project.workspaceId, 1000)) {
      throw new Error("Kredit tidak mencukupi untuk melakukan sintesis insights riset.");
    }

    try {
      const canvas = canvasDataRef.current[project.workspaceId] || { uvp: "Startup", problem: "Masalah" };
      const projectInterviews = interviewsRef.current.filter(i => i.researchProjectId === projectId && i.status === "completed");

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "synthesize-insights",
          data: {
            projectName: project.name,
            canvas,
            interviews: projectInterviews
          }
        })
      });

      if (!response.ok) {
        throw new Error(parseApiError(await response.text()));
      }

      const report = await response.json();
      const insightReport: InsightReport = {
        projectId,
        generatedAt: new Date().toISOString(),
        qualityScore: report.qualityScore || 85,
        qualityDetails: report.qualityDetails || "Sintesis berhasil diselesaikan.",
        categories: report.categories || []
      };

      setInsightReports((prev) => ({
        ...prev,
        [projectId]: insightReport
      }));

      // Update project status to Completed
      setResearchProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: "Completed" } : p))
      );

      completeTask("validation-real-3");
    } catch (err) {
      console.warn("Real AI insight synthesis failed, falling back to mock:", err);
      // Mock Fallback
      const newReport: InsightReport = {
        projectId,
        generatedAt: new Date().toISOString(),
        qualityScore: 90,
        qualityDetails: "Sangat baik. Analisis klastering berhasil mensintesis seluruh transkrip wawancara yang tersedia. Menunjukkan 3 klaster masalah utama dan 2 pola pembelian yang konsisten.",
        categories: [
          {
            name: "Jobs-to-be-Done (JTBD)",
            insights: [
              { title: "Otomatisasi Laporan Berkala", pct: 90, count: 4, description: "Pengguna ingin sistem secara otomatis menyusun ringkasan mingguan tanpa harus menarik data manual." },
              { title: "Pengurangan Margin Kesalahan Input", pct: 75, count: 3, description: "Meminimalkan kesalahan ketik koordinat atau data pesanan logistik di lapangan." }
            ]
          },
          {
            name: "Triggering Events (Pemicu)",
            insights: [
              { title: "Kehilangan Barang Saat Pengiriman", pct: 85, count: 4, description: "Insiden kehilangan barang yang memaksa tim mencari sistem pemantau real-time." },
              { title: "Tuntutan Audit Eksternal Mendadak", pct: 70, count: 3, description: "Desakan regulasi dari pemangku kepentingan untuk memiliki log operasional yang transparan." }
            ]
          },
          {
            name: "Desired Outcome (Hasil yang Diharapkan)",
            insights: [
              { title: "Efisiensi Waktu Kerja > 40%", pct: 95, count: 4, description: "Menghemat minimal 3 jam kerja admin gudang setiap harinya." },
              { title: "Keamanan Data Enkripsi", pct: 80, count: 3, description: "Akses riwayat yang aman tanpa takut dicuri oleh kompetitor lokal." }
            ]
          }
        ]
      };

      setInsightReports((prev) => ({
        ...prev,
        [projectId]: newReport
      }));

      // Update project status to Completed
      setResearchProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: "Completed" } : p))
      );

      completeTask("validation-real-3");
    }
  };

  const addInterviewTranscript = (projectId: string, respondentName: string, jobRole: string, transcript: string, isSynthetic: boolean) => {
    const newInt: Interview = {
      id: `int-${Math.random().toString(36).substring(2, 11)}`,
      researchProjectId: projectId,
      respondentName,
      jobRole,
      mode: "upload",
      isSynthetic,
      status: "completed",
      qualityScore: 85,
      scriptCoveragePct: 90,
      transcriptText: transcript,
      date: new Date().toISOString().split('T')[0]
    };
    setInterviews((prev) => [newInt, ...prev]);
  };

  const generatePersona = async (workspaceId: string, segmentId: string): Promise<void> => {
    if (!deductCredits(workspaceId, 1500)) {
      throw new Error("Kredit tidak mencukupi untuk pembuatan persona B2B.");
    }

    try {
      const canvas = canvasDataRef.current[workspaceId] || { uvp: "Startup", problem: "Masalah", solution: "Solusi" };
      const segment = customerSegmentsRef.current[workspaceId]?.find(s => s.id === segmentId) || { name: "Segment", description: "Deskripsi" };

      // Find research project and insights for this segment if any
      const project = researchProjectsRef.current.find(p => p.workspaceId === workspaceId && p.segmentId === segmentId);
      const insights = project ? insightReportsRef.current[project.id] : null;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-persona",
          data: {
            canvas,
            segmentName: segment.name,
            segmentDesc: segment.description,
            insights
          }
        })
      });

      if (!response.ok) {
        throw new Error(parseApiError(await response.text()));
      }

      const rawPersona = await response.json();
      const newPersona: Persona = {
        id: `pers-${Math.random().toString(36).substring(2, 11)}`,
        workspaceId,
        segmentId,
        name: rawPersona.name,
        archetype: rawPersona.archetype,
        summary: rawPersona.summary,
        coreQuote: rawPersona.coreQuote,
        avatarUrl: rawPersona.avatarUrl,
        ageRange: rawPersona.ageRange,
        jobRoles: rawPersona.jobRoles,
        priorityInitiatives: rawPersona.priorityInitiatives || [],
        keyPains: rawPersona.keyPains || [],
        desiredOutcomes: rawPersona.desiredOutcomes || [],
        decisionMaking: rawPersona.decisionMaking || [],
        evaluationCriteria: rawPersona.evaluationCriteria || [],
        messagingAngles: rawPersona.messagingAngles || []
      };

      setPersonas((prev) => ({
        ...prev,
        [workspaceId]: [newPersona, ...(prev[workspaceId] || [])]
      }));
      completeTask("gtm-assets-1");
    } catch (err) {
      console.warn("Real AI persona generation failed, falling back to mock:", err);
      // Mock Fallback
      const canvas = canvasDataRef.current[workspaceId] || { uvp: "Startup", problem: "Masalah" };
      const isKopi = canvas.uvp.toLowerCase().includes("kopi") || canvas.problem.toLowerCase().includes("kopi");
      const isHealth = canvas.uvp.toLowerCase().includes("health") || canvas.problem.toLowerCase().includes("sehat");

      let newPersona: Persona;

      if (isKopi) {
        newPersona = {
          id: `pers-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          segmentId,
          name: "Rian",
          archetype: "The Modern Coffee Merchant",
          summary: `Rian mengelola jaringan kedai kopi lokal di kota besar. Dia terbebani oleh harga pasokan biji kopi yang naik-turun dan fluktuasi kunjungan konsumen harian.`,
          coreQuote: "Saya butuh kepastian pasokan biji kopi berkualitas dengan harga bersahabat dan cara menarik pelanggan loyal.",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
          ageRange: "25-32",
          jobRoles: "Cafe Owner, Retail Entrepreneur",
          priorityInitiatives: [
            "Mendapatkan biji kopi berkualitas dengan harga diskon partai",
            "Meningkatkan frekuensi transaksi pelanggan tetap harian",
            "Membuka cabang baru di area perkantoran"
          ],
          keyPains: [
            "Harga bahan baku yang tidak dapat diprediksi",
            "Loyalitas pelanggan rendah akibat banyaknya kompetitor",
            "Biaya komisi pesanan antar-makanan ojol terlalu tinggi (hingga 20%)"
          ],
          desiredOutcomes: [
            "Mendapatkan supplier biji kopi terpercaya berskala lokal",
            "Menghemat biaya operasional pengadaan minimal 15%",
            "Meningkatkan retensi pelanggan mingguan via promo mandiri"
          ],
          decisionMaking: [
            "Membandingkan harga supplier",
            "Menguji kualitas rasa biji sampel",
            "Memilih platform yang mudah dioperasikan staf barista"
          ],
          evaluationCriteria: [
            "Persentase komisi transaksi",
            "Stabilitas supply rantai pasok",
            "Kemudahan pencairan dana modal"
          ],
          messagingAngles: [
            "Beli Biji Kopi Langsung dari Petani Mitra dengan Harga 20% Lebih Murah",
            "Tarik Pelanggan Setia Tanpa Biaya Komisi Ojol yang Mencekik"
          ]
        };
      } else if (isHealth) {
        newPersona = {
          id: `pers-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          segmentId,
          name: "Dr. Anita",
          archetype: "The Tech-Forward Clinic Manager",
          summary: "Dr. Anita mengoperasikan klinik medis mandiri kelas menengah di area urban. Dia frustrasi dengan rumitnya sistem administrasi dan lambatnya rujukan rekam medis pasien kronis.",
          coreQuote: "Pasien kronis kami sering kesulitan mengawasi kepatuhan minum obat di rumah, dan antrean administrasi klinik kami melelahkan.",
          avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200&auto=format&fit=crop",
          ageRange: "35-45",
          jobRoles: "Chief Medical Officer, Clinic Administrator",
          priorityInitiatives: [
            "Mengurangi antrean pasien di loket administrasi sebesar 50%",
            "Memasang sistem rekam medis elektronik terintegrasi",
            "Menyediakan sistem monitoring kesehatan jarak jauh untuk lansia"
          ],
          keyPains: [
            "Kehilangan pasien akibat antrean pelayanan yang lambat",
            "Ketiadaan data vital sign pasien saat terjadi kondisi darurat di rumah",
            "Kesalahan input dosis obat pada log resep pasien"
          ],
          desiredOutcomes: [
            "Akses rekam medis digital instan di bawah 3 detik",
            "Tingkat kepatuhan obat pasien kronis meningkat > 90%",
            "Notifikasi peringatan vital sign real-time langsung ke ponsel dokter"
          ],
          decisionMaking: [
            "Mengevaluasi standar keamanan data medis OJK/Kemenkes",
            "Kemudahan adopsi bagi pasien lanjut usia",
            "Biaya langganan cloud per dokter"
          ],
          evaluationCriteria: [
            "Kepatuhan standar enkripsi medis",
            "Kecepatan transmisi alert vital sign",
            "Dukungan teknis on-site"
          ],
          messagingAngles: [
            "Pantau Kesehatan Vital Pasien Anda 24/7 Tanpa Batasan Jarak",
            "Pangkas Waktu Antre Klinik dengan Otomatisasi Rekam Medis Pintar"
          ]
        };
      } else {
        newPersona = {
          id: `pers-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          segmentId,
          name: "Bambang",
          archetype: "The Hustling SME Seller",
          summary: `Bambang menjual produk fashion/kebutuhan rumah tangga secara online di marketplace Indonesia. Dia berjuang mengelola pembukuan arus kas yang tercampur dengan uang pribadi.`,
          coreQuote: "Catatan keuangan kami berantakan dan kami sulit mengajukan pinjaman modal usaha ke bank karena tidak punya laporan formal.",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
          ageRange: "24-30",
          jobRoles: "Online Shop Owner, SME Retailer",
          priorityInitiatives: [
            "Merapikan laporan laba-rugi operasional bulanan",
            "Mendapatkan modal kerja tambahan Rp 50jt untuk stok lebaran",
            "Meningkatkan efisiensi pengepakan barang harian"
          ],
          keyPains: [
            "Arus kas macet karena piutang pelanggan atau waktu settlement platform e-commerce",
            "Ditolak pengajuan modal oleh bank konvensional akibat ketiadaan SIUP/laporan keuangan resmi",
            "Kesulitan melacak stok barang yang terjual di multi-channel"
          ],
          desiredOutcomes: [
            "Laporan arus kas otomatis yang selesai dalam 5 menit",
            "Persetujuan pinjaman modal cepat tanpa agunan sertifikat fisik",
            "Integrasi pencatatan stok otomatis antar toko online"
          ],
          decisionMaking: [
            "Bunga pinjaman bulanan yang rendah",
            "Kecepatan pencairan dana modal",
            "Kemudahan impor data dari e-commerce"
          ],
          evaluationCriteria: [
            "Keamanan data transaksi (terlisensi OJK)",
            "Biaya admin langganan software kasir",
            "Fleksibilitas tenor cicilan"
          ],
          messagingAngles: [
            "Catat Keuangan Toko Otomatis & Dapatkan Akses Modal Usaha Tanpa Agunan",
            "Kelola Multi-Toko E-commerce Anda dalam Satu Dashboard Pembukuan Praktis"
          ]
        };
      }

      setPersonas((prev) => ({
        ...prev,
        [workspaceId]: [newPersona, ...(prev[workspaceId] || [])]
      }));
      completeTask("gtm-assets-1");
    }
  };

  const generatePositioning = async (workspaceId: string, personaId: string): Promise<void> => {
    if (!deductCredits(workspaceId, 2000)) {
      throw new Error("Kredit tidak mencukupi untuk penyusunan positioning statement.");
    }

    const workspacePersonas = personasRef.current[workspaceId] || [];
    const persona = workspacePersonas.find(p => p.id === personaId);
    if (!persona) return;

    try {
      const canvas = canvasDataRef.current[workspaceId] || { uvp: "Startup", problem: "Masalah", solution: "Solusi", unfairAdvantage: "Pembeda" };
      const workspace = workspacesRef.current.find(w => w.id === workspaceId);

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-positioning",
          data: {
            workspaceName: workspace?.name || "Startup",
            canvas,
            persona
          }
        })
      });

      if (!response.ok) {
        throw new Error(parseApiError(await response.text()));
      }

      const rawPositioning = await response.json();
      const newDoc: PositioningDoc = {
        id: `pos-${Math.random().toString(36).substring(2, 11)}`,
        workspaceId,
        personaId,
        corePositioning: rawPositioning.corePositioning,
        targetAudience: rawPositioning.targetAudience,
        marketContext: rawPositioning.marketContext,
        uvp: rawPositioning.uvp,
        brandVoice: rawPositioning.brandVoice,
        reasonsToBelieve: rawPositioning.reasonsToBelieve || [],
        messagingPillars: rawPositioning.messagingPillars || [],
        elevatorPitch: rawPositioning.elevatorPitch
      };

      setPositioningDocs((prev) => ({
        ...prev,
        [workspaceId]: [newDoc, ...(prev[workspaceId] || [])]
      }));
      completeTask("gtm-assets-2");
    } catch (err) {
      console.warn("Real AI positioning generation failed, falling back to mock:", err);
      // Mock Fallback
      const canvas = canvasDataRef.current[workspaceId] || { uvp: "Startup", problem: "Masalah", channels: "Online" };
      const isKopi = canvas.uvp.toLowerCase().includes("kopi") || canvas.problem.toLowerCase().includes("kopi");
      const isHealth = canvas.uvp.toLowerCase().includes("health") || canvas.problem.toLowerCase().includes("sehat");

      let newDoc: PositioningDoc;

      if (isKopi) {
        newDoc = {
          id: `pos-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          personaId,
          corePositioning: `Untuk ${persona.name} (${persona.archetype}) yang dirugikan oleh fluktuasi harga bahan baku, platform kami menyediakan rantai pasok B2B terotomatisasi yang menghubungkan pemilik kafe langsung dengan petani lokal daerah. Tidak seperti perantara konvensional yang menimbun margin, kami menjamin efisiensi pasokan dengan komisi hanya 1.5%.`,
          targetAudience: "Pemilik Kedai Kopi Independen, Manajer Operasional FnB, Supplier Kopi Lokal",
          marketContext: "Layanan Supply Chain Pengadaan Bahan Baku Kuliner Indonesia",
          uvp: canvas.uvp || "Rantai Pasok Biji Kopi B2B Hemat Komisi untuk Kedai Kopi Lokal.",
          brandVoice: "Merakyat, Solutif, Jujur, Transparan",
          reasonsToBelieve: [
            "Kemitraan langsung dengan 200+ kelompok tani kopi Indonesia",
            "Sistem logistik pengiriman satu hari sampai (Next-day delivery)",
            "Uji coba gratis pengadaan 10kg biji kopi pertama"
          ],
          messagingPillars: [
            { title: "Pangkas Perantara", body: "Hubungkan pesanan Anda langsung ke produsen tanpa biaya perantara komisi berlapis." },
            { title: "Jaminan Kualitas Konstan", body: "Setiap biji kopi disortir dan dikontrol kualitasnya sesuai standar cita rasa kafe Anda." },
            { title: "Pembayaran Fleksibel Tempo", body: "Fasilitas bayar tempo (credit terms) hingga 30 hari untuk menjaga perputaran arus kas kafe." }
          ],
          elevatorPitch: `Platform pengadaan kopi kami membantu ${persona.name} mendapatkan biji kopi segar langsung dari petani dengan memotong jalur tengkulak. Kami memberikan harga 20% lebih hemat dan stabilitas stok sepanjang tahun, didukung opsi pembayaran tunda agar arus kas kedai kopi tetap aman.`
        };
      } else if (isHealth) {
        newDoc = {
          id: `pos-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          personaId,
          corePositioning: `Untuk ${persona.name} (${persona.archetype}) yang terhambat administrasi pasien kronis, platform asisten kesehatan kami mengamankan vital signs pasien secara luring dan memproses rekam medis instan. Tidak seperti portal awan lambat, kami menjamin akses data darurat di bawah 1 detik tanpa bergantung koneksi internet luar.`,
          targetAudience: "Dokter Spesialis Mandiri, Pengelola Klinik Pratama, Caregiver Keluarga Lansia",
          marketContext: "Layanan Rekam Medis & Monitoring Kesehatan Terlokalisasi",
          uvp: canvas.uvp || "Edge Health AI monitoring dengan proteksi rekam medis luring berlatensi nol.",
          brandVoice: "Profesional, Empatis, Akurat, Aman",
          reasonsToBelieve: [
            "Algoritma vital sign tersertifikasi IDI",
            "Standar keamanan database rekam medis terenkripsi AES-256",
            "Kompatibel dengan 90% hardware sensor tensi/gula darah nirkabel"
          ],
          messagingPillars: [
            { title: "Pemantauan Luring Siaga", body: "Mendeteksi aritmia jantung atau lonjakan tensi seketika tanpa membutuhkan koneksi internet awan." },
            { title: "Rekam Medis Instan", body: "Administrasi pendaftaran dan data vital pasien terintegrasi otomatis dalam satu kali scan QR." },
            { title: "Keamanan Data Medis", body: "Data medis disimpan secara lokal pada perangkat terenkripsi, meminimalisir risiko kebocoran cloud." }
          ],
          elevatorPitch: `Sistem kami membantu ${persona.name} mengawasi kesehatan pasien kronis di rumah mereka dengan latensi di bawah 1 detik melalui AI lokal. Kami menyederhanakan pelaporan rekam medis dan meningkatkan kepatuhan obat lansia, memberikan ketenangan ekstra bagi dokter dan keluarga.`
        };
      } else {
        newDoc = {
          id: `pos-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          personaId,
          corePositioning: `Untuk ${persona.name} (${persona.archetype}) yang kesulitan mendapatkan pinjaman modal usaha formal, platform pembukuan kami mencatat kas toko otomatis dan menyajikan scoring kelayakan kredit instan. Tidak seperti bank konvensional yang rumit, kami menyetujui pembiayaan faktur e-commerce Anda dalam waktu 24 jam berbasis data transaksi riil.`,
          targetAudience: "Pelaku UMKM Digital, Penjual Multi-Channel E-commerce, Reseller Online Shop",
          marketContext: "Aplikasi POS Pembukuan Keuangan & Pembiayaan UMKM Indonesia",
          uvp: canvas.uvp || "Pembukuan Kasir UMKM Otomatis Terintegrasi Pinjaman Modal Invoice Tanpa Agunan.",
          brandVoice: "Praktis, Edukatif, Tepercaya, Mendukung",
          reasonsToBelieve: [
            "Telah membantu penyaluran modal usaha ke 5.000+ UMKM di Indonesia",
            "Scoring instan selesai dalam 10 menit dengan sinkronisasi API toko",
            "Keamanan terdaftar resmi di Otoritas Jasa Keuangan (OJK)"
          ],
          messagingPillars: [
            { title: "Pencatatan Tanpa Ribet", body: "Cukup hubungkan akun e-commerce Anda, laporan arus kas akan tersusun otomatis dalam 5 menit." },
            { title: "Akses Modal Tanpa Sertifikat", body: "Dapatkan pembiayaan invoice bergulir hanya bermodalkan riwayat penjualan online Anda." },
            { title: "Analisis Arus Kas Real-time", body: "Ketahui performa laba bersih Anda dari seluruh marketplace dalam satu dashboard ringkas." }
          ],
          elevatorPitch: `Aplikasi pembukuan kami membantu ${persona.name} merapikan laporan arus kas toko online secara otomatis dari berbagai e-commerce. Data pembukuan ini langsung terkonversi menjadi skor kredit untuk mencairkan pinjaman modal usaha tanpa agunan fisik hanya dalam 24 jam.`
        };
      }

      setPositioningDocs((prev) => ({
        ...prev,
        [workspaceId]: [newDoc, ...(prev[workspaceId] || [])]
      }));
      completeTask("gtm-assets-2");
    }
  };

  const generateLandingPage = async (workspaceId: string, personaId: string): Promise<void> => {
    if (!deductCredits(workspaceId, 2000)) {
      throw new Error("Kredit tidak mencukupi untuk pembuatan draf landing page.");
    }

    const workspacePersonas = personasRef.current[workspaceId] || [];
    const persona = workspacePersonas.find(p => p.id === personaId);
    const workspacePositioning = positioningDocsRef.current[workspaceId] || [];
    const positioning = workspacePositioning.find(p => p.personaId === personaId);

    if (!persona || !positioning) return;

    try {
      const canvas = canvasDataRef.current[workspaceId] || { uvp: "Startup", problem: "Masalah" };

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-landing-page",
          data: {
            canvas,
            persona,
            positioning
          }
        })
      });

      if (!response.ok) {
        throw new Error(parseApiError(await response.text()));
      }

      const rawLp = await response.json();
      const newLp: LandingPageAsset = {
        id: `lp-${Math.random().toString(36).substring(2, 11)}`,
        workspaceId,
        personaId,
        heroHeadline: rawLp.heroHeadline,
        heroSubheadline: rawLp.heroSubheadline,
        ctaText: rawLp.ctaText,
        features: rawLp.features || [],
        socialProof: rawLp.socialProof,
        faq: rawLp.faq || []
      };

      setLandingPages((prev) => {
        const current = prev[workspaceId] || [];
        return { ...prev, [workspaceId]: [newLp, ...current] };
      });

      const wDecks = salesDecks[workspaceId] || [];
      if (wDecks.some(d => d.personaId === personaId)) {
        completeTask("gtm-assets-3");
      }
    } catch (err) {
      console.warn("Real AI landing page generation failed, falling back to mock:", err);
      // Mock Fallback
      const canvas = canvasDataRef.current[workspaceId] || { uvp: "Startup", problem: "Masalah" };
      const isKopi = canvas.uvp.toLowerCase().includes("kopi") || canvas.problem.toLowerCase().includes("kopi");
      const isHealth = canvas.uvp.toLowerCase().includes("health") || canvas.problem.toLowerCase().includes("sehat");

      let newLp: LandingPageAsset;

      if (isKopi) {
        newLp = {
          id: `lp-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          personaId,
          heroHeadline: "Biji Kopi Premium Langsung Dari Petani, Harga Jauh Lebih Hemat.",
          heroSubheadline: "Pangkas biaya pengadaan bahan baku kedai kopi Anda hingga 20% dengan jaminan suplai konstan dan fitur bayar tempo.",
          ctaText: "Hubungkan Supplier Kopi Anda",
          features: [
            { title: "Harga Langsung Petani", description: "Beli biji kopi berkualitas grade-1 tanpa melewati tengkulak lokal dengan sistem transaksi transparan." },
            { title: "Fitur Bayar Tempo (30 Hari)", description: "Jaga stabilitas cash flow kedai kopi Anda dengan mengajukan limit pembayaran tunda tanpa bunga tersembunyi." },
            { title: "Jaminan Pengiriman Cepat", description: "Kami menggaransi pengiriman bahan baku kafe Anda tiba tepat waktu dengan armada logistik khusus." }
          ],
          socialProof: "Telah diandalkan oleh 450+ mitra kedai kopi independen dan UMKM kuliner di seluruh Indonesia.",
          faq: [
            { question: "Berapa batas minimum pemesanan biji kopi?", answer: "Batas minimum pemesanan adalah 5 kg untuk pengiriman gratis di wilayah pulau Jawa." },
            { question: "Apakah kualitas biji kopi terjamin konsisten?", answer: "Ya, kami melakukan cupping test berkala pada setiap batch petani mitra untuk memastikan profil rasa kopi tidak berubah." }
          ]
        };
      } else if (isHealth) {
        newLp = {
          id: `lp-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          personaId,
          heroHeadline: "Pantau Vital Sign Pasien Anda Secara Real-time Tanpa Ketergantungan Cloud.",
          heroSubheadline: "Asisten pemantau kesehatan luring berlatensi di bawah 1 detik dengan standar enkripsi medis terkuat untuk klinik Anda.",
          ctaText: "Mulai Pasang di Klinik",
          features: [
            { title: "Akurasi Latensi Nol", description: "Menerima alert vital signs darurat pasien di bawah 1 detik menggunakan sirkuit pemrosesan lokal." },
            { title: "Rekam Medis EHR Pintar", description: "Otomatis mengintegrasikan vital sign harian pasien langsung ke form laporan rekam medis digital klinik." },
            { title: "Proteksi Enkripsi AES-256", description: "Menjamin privasi data medis pasien tetap aman di tingkat lokal tanpa risiko kebocoran server publik." }
          ],
          socialProof: "Direkomendasikan oleh praktisi kesehatan dan diuji coba pada 20+ klinik kesehatan rawat jalan.",
          faq: [
            { question: "Apakah sistem ini membutuhkan instalasi internet khusus?", answer: "Tidak, sistem ini menggunakan jaringan area lokal (LAN/Wi-Fi internal) sehingga dapat berjalan 100% tanpa internet luar." },
            { question: "Perangkat medis apa saja yang didukung?", answer: "Sistem kami terintegrasi dengan tensimeter nirkabel, oximeter Bluetooth, dan termometer sensor pintar terstandarisasi." }
          ]
        };
      } else {
        newLp = {
          id: `lp-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          personaId,
          heroHeadline: "Pembukuan Kasir UMKM Otomatis & Akses Modal Invoice Tanpa Agunan.",
          heroSubheadline: "Kelola arus kas toko online Anda dalam satu dashboard terpadu dan cairkan pembiayaan stok barang dalam 24 jam.",
          ctaText: "Dapatkan Limit Modal Usaha",
          features: [
            { title: "Laporan Keuangan Instan", description: "Impor transaksi dari Tokopedia, Shopee, dan TikTok Shop dalam sekali klik untuk menyusun laporan laba rugi." },
            { title: "Pembiayaan Invoice Cepat", description: "Ajukan pinjaman modal kerja hingga Rp 100 juta berdasarkan riwayat transaksi penjualan online Anda." },
            { title: "Scoring Kredit Instan", description: "Nilai kelayakan pinjaman toko Anda dihitung otomatis oleh AI kami dalam waktu kurang dari 10 menit." }
          ],
          socialProof: "Dipercaya oleh 10.000+ pedagang online e-commerce Indonesia dan diawasi oleh Otoritas Jasa Keuangan (OJK).",
          faq: [
            { question: "Bagaimana cara menyambungkan toko online saya?", answer: "Cukup masuk ke menu integrasi e-commerce, pilih marketplace Anda, dan beri izin baca transaksi toko via API resmi." },
            { question: "Berapa suku bunga pinjaman modalnya?", answer: "Suku bunga kami bersahabat untuk UMKM, mulai dari 0.9% flat per bulan tanpa biaya admin tambahan yang disembunyikan." }
          ]
        };
      }

      setLandingPages((prev) => {
        const current = prev[workspaceId] || [];
        return { ...prev, [workspaceId]: [newLp, ...current] };
      });

      const wDecks = salesDecks[workspaceId] || [];
      if (wDecks.some(d => d.personaId === personaId)) {
        completeTask("gtm-assets-3");
      }
    }
  };

  const generateSalesDeck = async (workspaceId: string, personaId: string): Promise<void> => {
    if (!deductCredits(workspaceId, 3000)) {
      throw new Error("Kredit tidak mencukupi untuk perancangan pitch deck.");
    }

    const workspacePersonas = personasRef.current[workspaceId] || [];
    const persona = workspacePersonas.find(p => p.id === personaId);
    const workspacePositioning = positioningDocsRef.current[workspaceId] || [];
    const positioning = workspacePositioning.find(p => p.personaId === personaId);

    if (!persona || !positioning) return;

    try {
      const canvas = canvasDataRef.current[workspaceId] || { uvp: "Startup" };
      const workspace = workspacesRef.current.find((w) => w.id === workspaceId);

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-sales-deck",
          data: {
            workspaceName: workspace?.name || "Startup",
            canvas,
            persona,
            positioning
          }
        })
      });

      if (!response.ok) {
        throw new Error(parseApiError(await response.text()));
      }

      const rawDeck = await response.json();
      const newDeck: SalesDeckAsset = {
        id: `sd-${Math.random().toString(36).substring(2, 11)}`,
        workspaceId,
        personaId,
        slides: rawDeck.slides || []
      };

      setSalesDecks((prev) => {
        const current = prev[workspaceId] || [];
        return { ...prev, [workspaceId]: [newDeck, ...current] };
      });

      const wPages = landingPages[workspaceId] || [];
      if (wPages.some(lp => lp.personaId === personaId)) {
        completeTask("gtm-assets-3");
      }
    } catch (err) {
      console.warn("Real AI sales deck generation failed, falling back to mock:", err);
      // Mock Fallback
      const ws = workspacesRef.current.find((w) => w.id === workspaceId);
      const wsName = ws ? ws.name : "Startup";
      const canvas = canvasDataRef.current[workspaceId] || { uvp: "Startup", problem: "Masalah", solution: "Solusi" };
      const isKopi = canvas.uvp.toLowerCase().includes("kopi") || canvas.problem.toLowerCase().includes("kopi");
      const isHealth = canvas.uvp.toLowerCase().includes("health") || canvas.problem.toLowerCase().includes("sehat");

      let slides: SalesDeckSlide[] = [];

      if (isKopi) {
        slides = [
          { title: `${wsName || "B2B Kopi"}: Efisiensi Rantai Pasok Biji Kopi B2B`, subtitle: "Menghubungkan Kedai Kopi Independen Langsung ke Petani Mitra", bulletPoints: ["Solusi pengadaan bahan baku hemat perantara", "Pangkas harga pengadaan kopi hingga 20%", "Kemudahan pembayaran tempo term 30 hari"], notes: "Slide pembuka. Sapa calon investor / mitra kedai kopi. Tekankan visi platform untuk meratakan kesejahteraan petani dan menghemat pengeluaran kafe." },
          { title: "Tantangan FnB: Harga Fluktuatif & Komisi Mencekik", subtitle: "Rasa Sakit Utama Rian (Modern Coffee Merchant)", bulletPoints: ["Harga biji kopi naik-turun merusak stabilitas menu", "Komisi ojek online 20% memotong margin laba bersih", "Tengkulak mengambil keuntungan besar tanpa kontribusi kualitas"], notes: "Gambarkan masalah operasional yang dihadapi pemilik kafe independen. Tunjukkan betapa tipisnya keuntungan akibat komisi platform lain." },
          { title: "Solusi Kami: Direct Sourcing Digital Marketplace", subtitle: "Masa Depan Pengadaan Bahan Baku Kopi", bulletPoints: ["Platform transaksi transparan langsung petani-kafe", "Jaminan logistik next-day delivery sampai lokasi", "Fasilitas bayar tunda (tempo) untuk modal operasional"], notes: "Tunjukkan solusi digital kita. Tekankan pada kemudahan bertransaksi langsung dan fitur limit pembayaran tempo." },
          { title: "Market Size & Traction", subtitle: "Potensi Besar Pasar Kopi Indonesia", bulletPoints: ["Lebih dari 4.000 kedai kopi independen baru di Jabodetabek", "Konsumsi kopi nasional meningkat 12.5% per tahun", "Traction awal: 450 kafe bergabung dengan transaksi bulanan Rp 1.2 Milyar"], notes: "Sajikan angka potensi pasar kuliner kopi Indonesia yang sangat besar dan pertumbuhan kedai kopi milenial." },
          { title: "Mengapa Kemitraan Kami Tidak Terkalahkan", subtitle: "Unfair Advantage & Hubungan Kelompok Tani", bulletPoints: ["Kontrak eksklusif dengan 12 koperasi tani kopi terkemuka", "Sistem kurasi profil rasa kopi otomatis dengan IoT cupping tool", "Afiliasi komunitas HIPMI Kuliner di daerah"], notes: "Soroti kelebihan kompetitif kita. Mengapa supplier luar sulit meniru rantai pasok kita." }
        ];
      } else if (isHealth) {
        slides = [
          { title: `${wsName || "Edge Health"}: Proteksi Vital Sign & Rekam Medis Luring`, subtitle: "Edge AI Monitoring Berlatensi Nol Milidetik untuk Klinik Mandiri", bulletPoints: ["Deteksi kondisi darurat pasien di bawah 1 detik", "Aplikasi rekam medis digital EHR terenkripsi penuh", "Dapat berjalan stabil 100% tanpa internet eksternal"], notes: "Slide pembuka. Perkenalkan platform Edge Health AI. Tekankan pentingnya latensi nol dan kedaulatan data medis pasien." },
          { title: "Masalah Klinik: Latensi Cloud & Risiko Kebocoran Data", subtitle: "Rasa Sakit Utama Dr. Anita (Clinic Manager)", bulletPoints: ["Antrean pasien menumpuk karena sistem administrasi EHR lambat", "Server cloud rawan down saat pemantauan pasien darurat", "Risiko tuntutan hukum akibat kebocoran data medis pasien kronis"], notes: "Paparkan problem nyata klinis medis. Tunjukkan risiko fatal yang dihadapi jika sistem monitoring bergantung pada cloud publik." },
          { title: "Solusi: Edge Health Gateway & Local Database", subtitle: "Mengamankan Vital Sign dari Tingkat Terdekat", bulletPoints: ["Sistem POS administrasi rekam medis instan via QR code", "Gateway sensor nirkabel lokal dengan latensi < 1 detik", "Penyimpanan database terenkripsi AES-256 lokal pada sirkuit internal"], notes: "Perkenalkan solusi hardware/software kita. Jelaskan cara kerja pengolahan data lokal tanpa internet luar." },
          { title: "Sertifikasi & Kredibilitas Ilmiah", subtitle: "Validasi Medis Tingkat Tinggi", bulletPoints: ["Algoritma deteksi kelainan jantung tersertifikasi IDI", "Kepatuhan standar data rekam medis internasional EHR-HL7", "Uji klinis pada 3 rumah sakit daerah dengan margin error < 0.2%"], notes: "Tekankan kualitas medis platform. Ini sangat krusial untuk meyakinkan kepala klinik atau dokter spesialis." },
          { title: "Skalabilitas Bisnis & Model Langganan", subtitle: "B2B SaaS dengan Unit Economics yang Kuat", bulletPoints: ["Sewa perangkat keras monitoring bulanan per klinik", "Biaya lisensi dashboard analisis per dokter spesialis", "Kredit top-up untuk notifikasi alarm darurat SMS/WA"], notes: "Jelaskan bagaimana kita menghasilkan uang. Rincikan pricing model sewa alat IoT dan langganan software medis." }
        ];
      } else {
        slides = [
          { title: `${wsName || "Fintech UMKM"}: Pembukuan Kasir & Scoring Modal Usaha`, subtitle: "Menyediakan Kredit Usaha Tanpa Agunan untuk Merchant Online", bulletPoints: ["Laporan laba-rugi arus kas otomatis dalam 5 menit", "Scoring kelayakan kredit berbasis transaksi riil e-commerce", "Pencairan pinjaman invoice modal usaha dalam 24 jam"], notes: "Slide pembuka. Perkenalkan visi Fintech UMKM. Jelaskan bagaimana pembukuan kasir terintegrasi dapat menjadi pintu gerbang permodalan." },
          { title: "Masalah UMKM: Arus Kas Macet & Ditolak Bank", subtitle: "Rasa Sakit Utama Bambang (Online Shop Owner)", bulletPoints: ["Pencatatan pembukuan kas tercampur uang pribadi secara berantakan", "Tertahan dana settlement e-commerce hingga berhari-hari", "Ditolak pengajuan KUR bank karena tidak memiliki pembukuan formal"], notes: "Gambarkan frustrasi pedagang online kecil di Indonesia. Tunjukkan ketimpangan akses kredit meskipun omset penjualan mereka bagus." },
          { title: "Solusi: Dashboard POS Multi-Marketplace & Invoice Financing", subtitle: "Koleksi Data Transaksi Menjadi Jaminan Kredit", bulletPoints: ["Sinkronisasi pencatatan stok dan kasir dari banyak e-commerce", "Analisis scoring kelayakan pinjaman otomatis dalam 10 menit", "Pembiayaan invoice bergulir instan tanpa membutuhkan agunan fisik"], notes: "Jelaskan solusi integrasi POS kita. Terangkan bahwa histori penjualan mereka adalah pengganti agunan sertifikat tanah." },
          { title: "Keamanan Finansial & Lisensi OJK", subtitle: "Membangun Kepercayaan Layanan Keuangan", bulletPoints: ["Sistem fintech terdaftar dan diawasi resmi oleh OJK", "Kerjasama penyaluran dana dengan 5 Bank Pembangunan Daerah", "Tingkat NPL (kredit macet) terjaga ketat di bawah 1.8%"], notes: "Yakinkan calon investor/mitra mengenai keamanan kepatuhan hukum keuangan Indonesia. Tunjukkan skor NPL yang sehat." },
          { title: "Prospek Pasar & Strategi Akuisisi UMKM", subtitle: "Menjangkau Jutaan Pedagang Online Indonesia", bulletPoints: ["Kemitraan pelatihan UMKM dengan HIPMI daerah", "Komunitas online seller dengan 50.000+ anggota aktif", "Biaya akuisisi pengguna (CAC) rendah melalui integrasi e-commerce store"], notes: "Slide penutup. Jelaskan strategi go-to-market. Tunjukkan bagaimana kita menjangkau merchant dalam jumlah besar dengan biaya murah." }
        ];
      }

      const newDeck: SalesDeckAsset = {
        id: `sd-${Math.random().toString(36).substring(2, 11)}`,
        workspaceId,
        personaId,
        slides
      };

      setSalesDecks((prev) => {
        const current = prev[workspaceId] || [];
        return { ...prev, [workspaceId]: [newDeck, ...current] };
      });

      const wPages = landingPages[workspaceId] || [];
      if (wPages.some(lp => lp.personaId === personaId)) {
        completeTask("gtm-assets-3");
      }
    }
  };

  const updateGtmAsset = (workspaceId: string, type: "positioning" | "landing_page" | "sales_deck", assetId: string, content: any) => {
    if (type === "positioning") {
      setPositioningDocs((prev) => ({
        ...prev,
        [workspaceId]: (prev[workspaceId] || []).map((doc) => doc.id === assetId ? { ...doc, ...content } : doc)
      }));
    } else if (type === "landing_page") {
      setLandingPages((prev) => ({
        ...prev,
        [workspaceId]: (prev[workspaceId] || []).map((lp) => lp.id === assetId ? { ...lp, ...content } : lp)
      }));
    } else if (type === "sales_deck") {
      setSalesDecks((prev) => ({
        ...prev,
        [workspaceId]: (prev[workspaceId] || []).map((sd) => sd.id === assetId ? { ...sd, ...content } : sd)
      }));
    }
  };

  const updatePersona = (workspaceId: string, personaId: string, content: Partial<Persona>) => {
    setPersonas((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((p) => p.id === personaId ? { ...p, ...content } : p)
    }));
  };

  const upgradeSubscription = (workspaceId: string, plan: string) => {
    setSubscriptionPlans((prev) => ({
      ...prev,
      [workspaceId]: plan
    }));
    let creditAdd = 0;
    if (plan === "Starter") creditAdd = 20000;
    else if (plan === "Growth") creditAdd = 50000;
    else if (plan === "Pro") creditAdd = 60000;

    setWorkspaces((prev) =>
      prev.map((ws) => ws.id === workspaceId ? { ...ws, credits: ws.credits + creditAdd } : ws)
    );
  };

  const purchaseCredits = (workspaceId: string, amount: number) => {
    setWorkspaces((prev) =>
      prev.map((ws) => ws.id === workspaceId ? { ...ws, credits: ws.credits + amount } : ws)
    );
  };

  const updateWorkspaceDetails = (workspaceId: string, name: string, description: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => ws.id === workspaceId ? { ...ws, name, description } : ws)
    );
  };

  // ============================================================
  // NEW FEATURE FUNCTIONS
  // ============================================================

  const addContact = (contact: Omit<Contact, "id" | "workspaceId" | "createdAt">) => {
    const newContact: Contact = {
      ...contact,
      id: `ct-${Math.random().toString(36).substring(2, 11)}`,
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
    };
    setContacts((prev) => ({
      ...prev,
      [activeWorkspaceId]: [newContact, ...(prev[activeWorkspaceId] || [])]
    }));
    ds.upsertContact(newContact);
  };

  const updateContact = (workspaceId: string, contactId: string, updates: Partial<Contact>) => {
    setContacts((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((c) => c.id === contactId ? { ...c, ...updates } : c)
    }));
    const contact = contacts[workspaceId]?.find(c => c.id === contactId);
    if (contact) ds.upsertContact({ ...contact, ...updates });
  };

  const deleteContact = (workspaceId: string, contactId: string) => {
    setContacts((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((c) => c.id !== contactId)
    }));
    ds.deleteContact(contactId);
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, "id" | "workspaceId" | "createdAt">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `cal-${Math.random().toString(36).substring(2, 11)}`,
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
    };
    setCalendarEvents((prev) => ({
      ...prev,
      [activeWorkspaceId]: [newEvent, ...(prev[activeWorkspaceId] || [])]
    }));
    ds.upsertCalendarEvent(newEvent);
  };

  const updateCalendarEvent = (workspaceId: string, eventId: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((e) => e.id === eventId ? { ...e, ...updates } : e)
    }));
    const event = calendarEvents[workspaceId]?.find(e => e.id === eventId);
    if (event) ds.upsertCalendarEvent({ ...event, ...updates });
  };

  const deleteCalendarEvent = (workspaceId: string, eventId: string) => {
    setCalendarEvents((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((e) => e.id !== eventId)
    }));
    ds.deleteCalendarEvent(eventId);
  };

  const completeCalendarEvent = (workspaceId: string, eventId: string) => {
    setCalendarEvents((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((e) => e.id === eventId ? { ...e, isCompleted: true } : e)
    }));
    const event = calendarEvents[workspaceId]?.find(e => e.id === eventId);
    if (event) ds.upsertCalendarEvent({ ...event, isCompleted: true });
  };

  const addNote = (note: Omit<VentureNote, "id" | "workspaceId" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newNote: VentureNote = {
      ...note,
      id: `note-${Math.random().toString(36).substring(2, 11)}`,
      workspaceId: activeWorkspaceId,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => ({
      ...prev,
      [activeWorkspaceId]: [newNote, ...(prev[activeWorkspaceId] || [])]
    }));
    ds.upsertNote(newNote);
  };

  const updateNote = (workspaceId: string, noteId: string, updates: Partial<VentureNote>) => {
    setNotes((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((n) => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
    }));
    const note = notes[workspaceId]?.find(n => n.id === noteId);
    if (note) ds.upsertNote({ ...note, ...updates, updatedAt: new Date().toISOString() });
  };

  const deleteNote = (workspaceId: string, noteId: string) => {
    setNotes((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((n) => n.id !== noteId)
    }));
    ds.deleteNote(noteId);
  };

  const togglePinNote = (workspaceId: string, noteId: string) => {
    setNotes((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((n) => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n)
    }));
    const note = notes[workspaceId]?.find(n => n.id === noteId);
    if (note) ds.upsertNote({ ...note, isPinned: !note.isPinned });
  };

  const addGlossaryTerm = (term: Omit<GlossaryTerm, "id" | "workspaceId" | "createdAt">) => {
    const newTerm: GlossaryTerm = {
      ...term,
      id: `glos-${Math.random().toString(36).substring(2, 11)}`,
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
    };
    setGlossaryTerms((prev) => ({
      ...prev,
      [activeWorkspaceId]: [newTerm, ...(prev[activeWorkspaceId] || [])]
    }));
    ds.upsertGlossaryTerm(newTerm);
  };

  const updateGlossaryTerm = (workspaceId: string, termId: string, updates: Partial<GlossaryTerm>) => {
    setGlossaryTerms((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((t) => t.id === termId ? { ...t, ...updates } : t)
    }));
    const term = glossaryTerms[workspaceId]?.find(t => t.id === termId);
    if (term) ds.upsertGlossaryTerm({ ...term, ...updates });
  };

  const deleteGlossaryTerm = (workspaceId: string, termId: string) => {
    setGlossaryTerms((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((t) => t.id !== termId)
    }));
    ds.deleteGlossaryTerm(termId);
  };

  const autoDetectTermsFromTranscript = async (workspaceId: string, projectId: string): Promise<void> => {
    const project = researchProjectsRef.current.find((p) => p.id === projectId);
    if (!project) return;

    const projectInterviews = interviewsRef.current.filter(i => i.researchProjectId === projectId && i.status === "completed");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto-detect-terms",
          data: {
            transcripts: projectInterviews.map(i => i.transcriptText),
            existingTerms: (glossaryTerms[workspaceId] || []).map(t => t.term)
          }
        })
      });

      if (!response.ok) {
        throw new Error(parseApiError(await response.text()));
      }

      const detectedTerms: { term: string; definition: string; category: string }[] = await response.json();

      for (const detected of detectedTerms) {
        const newTerm: GlossaryTerm = {
          id: `glos-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          term: detected.term,
          definition: detected.definition,
          category: detected.category || "general",
          sourceInterviewId: projectInterviews[0]?.id || "",
          sourceProjectId: projectId,
          isAutoDetected: true,
          createdAt: new Date().toISOString(),
        };
        setGlossaryTerms((prev) => ({
          ...prev,
          [workspaceId]: [newTerm, ...(prev[workspaceId] || [])]
        }));
        ds.upsertGlossaryTerm(newTerm);
      }
    } catch (err) {
      console.warn("Auto-detect terms failed, falling back to mock:", err);
      // Mock fallback
      const mockTerms: GlossaryTerm[] = [
        {
          id: `glos-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          term: "Downtime",
          definition: "Periode ketika mesin atau sistem berhenti beroperasi karena kerusakan atau pemeliharaan, menyebabkan kerugian produktivitas dan finansial.",
          category: "operational",
          sourceInterviewId: projectInterviews[0]?.id || "",
          sourceProjectId: projectId,
          isAutoDetected: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: `glos-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          term: "Edge Computing",
          definition: "Pemrosesan data di titik terdekat dengan sumber data (perangkat sensor/edge) tanpa harus mengirim ke server cloud pusat, mengurangi latensi.",
          category: "technical",
          sourceInterviewId: projectInterviews[0]?.id || "",
          sourceProjectId: projectId,
          isAutoDetected: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: `glos-${Math.random().toString(36).substring(2, 11)}`,
          workspaceId,
          term: "Telemetri",
          definition: "Pengumpulan data pengukuran jarak jauh dari sensor perangkat IoT dan transmisi ke sistem pemantauan untuk analisis.",
          category: "technical",
          sourceInterviewId: projectInterviews[0]?.id || "",
          sourceProjectId: projectId,
          isAutoDetected: true,
          createdAt: new Date().toISOString(),
        },
      ];

      for (const term of mockTerms) {
        setGlossaryTerms((prev) => ({
          ...prev,
          [workspaceId]: [term, ...(prev[workspaceId] || [])]
        }));
        ds.upsertGlossaryTerm(term);
      }
    }
  };

  const addAnalysisReport = (report: Omit<AnalysisReport, "id" | "workspaceId" | "createdAt">) => {
    const newReport: AnalysisReport = {
      ...report,
      id: `anal-${Math.random().toString(36).substring(2, 11)}`,
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
    };
    setAnalysisReports((prev) => ({
      ...prev,
      [activeWorkspaceId]: [newReport, ...(prev[activeWorkspaceId] || [])]
    }));
    ds.upsertAnalysisReport(newReport);
  };

  const updateAnalysisReport = (workspaceId: string, reportId: string, updates: Partial<AnalysisReport>) => {
    setAnalysisReports((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((r) => r.id === reportId ? { ...r, ...updates } : r)
    }));
    const report = analysisReports[workspaceId]?.find(r => r.id === reportId);
    if (report) ds.upsertAnalysisReport({ ...report, ...updates });
  };

  const deleteAnalysisReport = (workspaceId: string, reportId: string) => {
    setAnalysisReports((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((r) => r.id !== reportId)
    }));
    ds.deleteAnalysisReport(reportId);
  };

  const saveInterviewScripts = (workspaceId: string, sections: ScriptSection[]) => {
    setInterviewScripts((prev) => ({
      ...prev,
      [workspaceId]: sections
    }));
    ds.saveInterviewScripts(workspaceId, sections);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: derivedWorkspaces,
        activeWorkspaceId,
        activeWorkspace,
        userProfile,
        startingPath,
        onboardingCompleted,
        completedTasks,
        canvasData,
        customerSegments,
        researchProjects,
        interviews,
        insightReports,
        personas,
        positioningDocs,
        landingPages,
        salesDecks,
        subscriptionPlans,
        contacts,
        calendarEvents,
        notes,
        glossaryTerms,
        analysisReports,
        interviewScripts,
        isDataLoaded,
        createWorkspace,
        createWorkspaceForChat,
        switchWorkspace,
        updateStartingPath,
        completeTask,
        uncompleteTask,
        completeOnboarding,
        updateCanvasSection,
        extractCanvasWithAI,
        addResearchProject,
        generateSyntheticInterviews,
        synthesizeResearchInsights,
        addInterviewTranscript,
        deductCredits,
        generatePersona,
        generatePositioning,
        generateLandingPage,
        generateSalesDeck,
        updateGtmAsset,
        updatePersona,
        upgradeSubscription,
        purchaseCredits,
        updateWorkspaceDetails,
        addContact,
        updateContact,
        deleteContact,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        completeCalendarEvent,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        addGlossaryTerm,
        updateGlossaryTerm,
        deleteGlossaryTerm,
        autoDetectTermsFromTranscript,
        addAnalysisReport,
        updateAnalysisReport,
        deleteAnalysisReport,
        saveInterviewScripts
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
