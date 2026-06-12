/* eslint-disable @typescript-eslint/no-explicit-any */
// New feature interfaces for Hipmipreneur

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

// ============================================================
// CHAT
// ============================================================

export interface ChatMessageType {
  id: string;
  workspaceId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestionChips?: string[];
}

export interface WorkspaceInsight {
  id: string;
  workspaceId: string;
  type: "customer_segment" | "problem" | "solution" | "uvp" | "revenue" | "skill";
  content: string;
  sourceMessageId: string;
  confidence: number;
  createdAt: string;
}

export type StartupPath = "find" | "develop" | "grow";

export interface StartupPathOption {
  path: StartupPath;
  title: string;
  description: string;
  icon: string;
  greeting: string;
}

// Re-export existing types that pages need
export type { LeanCanvas, CustomerSegment, Workspace, UserProfile, ResearchProject, Interview, InsightReport, Persona, PositioningDoc, LandingPageAsset, SalesDeckAsset, SalesDeckSlide } from "../context/WorkspaceContext";
