/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "./supabase";

// ============================================================
// Helper: generate unique IDs
// ============================================================
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================
// WORKSPACES
// ============================================================
export async function loadWorkspaces(userId: string) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error || !data) return null;
  return data.map((w: any) => ({
    id: w.id,
    name: w.name,
    description: w.description || "",
    url: w.url || "",
    credits: w.credits,
    healthScore: w.health_score || 0,
    type: w.type || "Develop my idea",
    isArchived: w.is_archived || false,
    createdAt: w.created_at,
  }));
}

export async function saveWorkspace(ws: any) {
  await supabase.from("workspaces").upsert({
    id: ws.id,
    user_id: ws.userId,
    name: ws.name,
    description: ws.description,
    url: ws.url || "",
    credits: ws.credits,
    health_score: ws.healthScore,
    type: ws.type,
    is_archived: ws.isArchived,
    starting_path: ws.startingPath,
    onboarding_completed: ws.onboardingCompleted,
  });
}

export async function createWorkspaceInDb(ws: any) {
  await supabase.from("workspaces").insert({
    id: ws.id,
    user_id: ws.userId,
    name: ws.name,
    description: ws.description,
    credits: ws.credits,
    health_score: ws.healthScore,
    type: ws.type,
    is_archived: false,
    onboarding_completed: ws.onboardingCompleted,
  });
}

// ============================================================
// CANVAS DATA
// ============================================================
export async function loadCanvasData(workspaceId: string) {
  const { data } = await supabase.from("canvas_data").select("*").eq("workspace_id", workspaceId).single();
  if (!data) return null;
  return {
    customerSegments: data.customer_segments || "",
    problem: data.problem || "",
    uvp: data.uvp || "",
    solution: data.solution || "",
    channels: data.channels || "",
    revenueStreams: data.revenue_streams || "",
    costStructure: data.cost_structure || "",
    keyMetrics: data.key_metrics || "",
    unfairAdvantage: data.unfair_advantage || "",
  };
}

export async function saveCanvasData(workspaceId: string, canvas: any) {
  await supabase.from("canvas_data").upsert({
    workspace_id: workspaceId,
    customer_segments: canvas.customerSegments,
    problem: canvas.problem,
    uvp: canvas.uvp,
    solution: canvas.solution,
    channels: canvas.channels,
    revenue_streams: canvas.revenueStreams,
    cost_structure: canvas.costStructure,
    key_metrics: canvas.keyMetrics,
    unfair_advantage: canvas.unfairAdvantage,
  });
}

// ============================================================
// CUSTOMER SEGMENTS
// ============================================================
export async function loadSegments(workspaceId: string) {
  const { data } = await supabase.from("customer_segments").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: true });
  if (!data) return null;
  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    description: s.description || "",
  }));
}

export async function saveSegments(workspaceId: string, segments: any[]) {
  // Delete existing, then insert all
  await supabase.from("customer_segments").delete().eq("workspace_id", workspaceId);
  if (segments.length > 0) {
    await supabase.from("customer_segments").insert(
      segments.map((s: any) => ({
        id: s.id,
        workspace_id: workspaceId,
        name: s.name,
        description: s.description,
      }))
    );
  }
}

// ============================================================
// COMPLETED TASKS
// ============================================================
export async function loadCompletedTasks(workspaceId: string) {
  const { data } = await supabase.from("completed_tasks").select("task_id").eq("workspace_id", workspaceId);
  if (!data) return null;
  return data.map((t: any) => t.task_id);
}

export async function saveCompletedTasks(workspaceId: string, taskIds: string[]) {
  await supabase.from("completed_tasks").delete().eq("workspace_id", workspaceId);
  if (taskIds.length > 0) {
    await supabase.from("completed_tasks").insert(
      taskIds.map((taskId) => ({ workspace_id: workspaceId, task_id: taskId }))
    );
  }
}

// ============================================================
// RESEARCH PROJECTS
// ============================================================
export async function loadResearchProjects(workspaceId: string) {
  const { data } = await supabase.from("research_projects").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (!data) return null;
  return data.map((p: any) => ({
    id: p.id,
    workspaceId: p.workspace_id,
    name: p.name,
    segmentId: p.segment_id || "",
    type: p.type || "Validate customer problems",
    status: p.status || "In progress",
    createdAt: p.created_at,
  }));
}

export async function saveResearchProject(project: any) {
  await supabase.from("research_projects").upsert({
    id: project.id,
    workspace_id: project.workspaceId,
    name: project.name,
    segment_id: project.segmentId,
    type: project.type,
    status: project.status,
  });
}

// ============================================================
// INTERVIEWS
// ============================================================
export async function loadInterviews(workspaceId: string) {
  const { data } = await supabase.from("interviews").select("*").eq("workspace_id", workspaceId).order("date", { ascending: false });
  if (!data) return null;
  return data.map((i: any) => ({
    id: i.id,
    researchProjectId: i.research_project_id,
    workspaceId: i.workspace_id,
    respondentName: i.respondent_name,
    jobRole: i.job_role || "",
    mode: i.mode || "upload",
    isSynthetic: i.is_synthetic || false,
    status: i.status || "completed",
    qualityScore: i.quality_score || 85,
    scriptCoveragePct: i.script_coverage_pct || 90,
    transcriptText: i.transcript_text || "",
    date: i.date || "",
  }));
}

export async function saveInterview(interview: any) {
  await supabase.from("interviews").upsert({
    id: interview.id,
    research_project_id: interview.researchProjectId,
    workspace_id: interview.workspaceId,
    respondent_name: interview.respondentName,
    job_role: interview.jobRole,
    mode: interview.mode,
    is_synthetic: interview.isSynthetic,
    status: interview.status,
    quality_score: interview.qualityScore,
    script_coverage_pct: interview.scriptCoveragePct,
    transcript_text: interview.transcriptText,
    date: interview.date,
  });
}

// ============================================================
// INSIGHT REPORTS
// ============================================================
export async function loadInsightReports(workspaceId: string) {
  // Load reports for projects belonging to this workspace
  const { data: projects } = await supabase.from("research_projects").select("id").eq("workspace_id", workspaceId);
  if (!projects || projects.length === 0) return null;
  const projectIds = projects.map((p: any) => p.id);

  const { data } = await supabase.from("insight_reports").select("*").in("project_id", projectIds);
  if (!data) return null;
  const result: Record<string, any> = {};
  for (const r of data) {
    result[r.project_id] = {
      projectId: r.project_id,
      generatedAt: r.generated_at,
      qualityScore: r.quality_score || 85,
      qualityDetails: r.quality_details || "",
      categories: r.categories || [],
    };
  }
  return result;
}

export async function saveInsightReport(report: any) {
  await supabase.from("insight_reports").upsert({
    project_id: report.projectId,
    generated_at: report.generatedAt,
    quality_score: report.qualityScore,
    quality_details: report.qualityDetails,
    categories: report.categories,
  });
}

// ============================================================
// PERSONAS
// ============================================================
export async function loadPersonas(workspaceId: string) {
  const { data } = await supabase.from("personas").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (!data) return null;
  return data.map((p: any) => ({
    id: p.id,
    workspaceId: p.workspace_id,
    segmentId: p.segment_id || "",
    name: p.name,
    archetype: p.archetype || "",
    summary: p.summary || "",
    coreQuote: p.core_quote || "",
    avatarUrl: p.avatar_url || "",
    ageRange: p.age_range || "",
    jobRoles: p.job_roles || "",
    priorityInitiatives: p.priority_initiatives || [],
    keyPains: p.key_pains || [],
    desiredOutcomes: p.desired_outcomes || [],
    decisionMaking: p.decision_making || [],
    evaluationCriteria: p.evaluation_criteria || [],
    messagingAngles: p.messaging_angles || [],
  }));
}

export async function savePersona(persona: any) {
  await supabase.from("personas").upsert({
    id: persona.id,
    workspace_id: persona.workspaceId,
    segment_id: persona.segmentId,
    name: persona.name,
    archetype: persona.archetype,
    summary: persona.summary,
    core_quote: persona.coreQuote,
    avatar_url: persona.avatarUrl,
    age_range: persona.ageRange,
    job_roles: persona.jobRoles,
    priority_initiatives: persona.priorityInitiatives,
    key_pains: persona.keyPains,
    desired_outcomes: persona.desiredOutcomes,
    decision_making: persona.decisionMaking,
    evaluation_criteria: persona.evaluationCriteria,
    messaging_angles: persona.messagingAngles,
  });
}

// ============================================================
// POSITIONING DOCS
// ============================================================
export async function loadPositioningDocs(workspaceId: string) {
  const { data } = await supabase.from("positioning_docs").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (!data) return null;
  return data.map((d: any) => ({
    id: d.id,
    workspaceId: d.workspace_id,
    personaId: d.persona_id || "",
    corePositioning: d.core_positioning || "",
    targetAudience: d.target_audience || "",
    marketContext: d.market_context || "",
    uvp: d.uvp || "",
    brandVoice: d.brand_voice || "",
    reasonsToBelieve: d.reasons_to_believe || [],
    messagingPillars: d.messaging_pillars || [],
    elevatorPitch: d.elevator_pitch || "",
  }));
}

export async function savePositioningDoc(doc: any) {
  await supabase.from("positioning_docs").upsert({
    id: doc.id,
    workspace_id: doc.workspaceId,
    persona_id: doc.personaId,
    core_positioning: doc.corePositioning,
    target_audience: doc.targetAudience,
    market_context: doc.marketContext,
    uvp: doc.uvp,
    brand_voice: doc.brandVoice,
    reasons_to_believe: doc.reasonsToBelieve,
    messaging_pillars: doc.messagingPillars,
    elevator_pitch: doc.elevatorPitch,
  });
}

// ============================================================
// LANDING PAGES
// ============================================================
export async function loadLandingPages(workspaceId: string) {
  const { data } = await supabase.from("landing_pages").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (!data) return null;
  return data.map((lp: any) => ({
    id: lp.id,
    workspaceId: lp.workspace_id,
    personaId: lp.persona_id || "",
    heroHeadline: lp.hero_headline || "",
    heroSubheadline: lp.hero_subheadline || "",
    ctaText: lp.cta_text || "",
    features: lp.features || [],
    socialProof: lp.social_proof || "",
    faq: lp.faq || [],
  }));
}

export async function saveLandingPage(lp: any) {
  await supabase.from("landing_pages").upsert({
    id: lp.id,
    workspace_id: lp.workspaceId,
    persona_id: lp.personaId,
    hero_headline: lp.heroHeadline,
    hero_subheadline: lp.heroSubheadline,
    cta_text: lp.ctaText,
    features: lp.features,
    social_proof: lp.socialProof,
    faq: lp.faq,
  });
}

// ============================================================
// SALES DECKS
// ============================================================
export async function loadSalesDecks(workspaceId: string) {
  const { data } = await supabase.from("sales_decks").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (!data) return null;
  return data.map((d: any) => ({
    id: d.id,
    workspaceId: d.workspace_id,
    personaId: d.persona_id || "",
    slides: d.slides || [],
  }));
}

export async function saveSalesDeck(deck: any) {
  await supabase.from("sales_decks").upsert({
    id: deck.id,
    workspace_id: deck.workspaceId,
    persona_id: deck.personaId,
    slides: deck.slides,
  });
}

// ============================================================
// SUBSCRIPTION PLANS
// ============================================================
export async function loadSubscriptionPlans(workspaceId: string) {
  const { data } = await supabase.from("subscription_plans").select("plan").eq("workspace_id", workspaceId);
  if (!data) return null;
  const result: Record<string, string> = {};
  for (const row of data) {
    result[workspaceId] = row.plan;
  }
  return result;
}

export async function saveSubscriptionPlan(workspaceId: string, plan: string) {
  await supabase.from("subscription_plans").upsert({ workspace_id: workspaceId, plan });
}

// ============================================================
// NEW FEATURES: CONTACTS
// ============================================================
export async function loadContacts(workspaceId: string) {
  const { data } = await supabase.from("contacts").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (!data) return null;
  return data.map((c: any) => ({
    id: c.id,
    workspaceId: c.workspace_id,
    name: c.name,
    email: c.email || "",
    phone: c.phone || "",
    company: c.company || "",
    jobRole: c.job_role || "",
    segmentId: c.segment_id || "",
    tags: c.tags || [],
    source: c.source || "manual",
    notes: c.notes || "",
    lastContactedAt: c.last_contacted_at || null,
    createdAt: c.created_at,
  }));
}

export async function upsertContact(c: any) {
  await supabase.from("contacts").upsert({
    id: c.id,
    workspace_id: c.workspaceId,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.company,
    job_role: c.jobRole,
    segment_id: c.segmentId,
    tags: c.tags,
    source: c.source,
    notes: c.notes,
    last_contacted_at: c.lastContactedAt,
  });
}

export async function deleteContact(contactId: string) {
  await supabase.from("contacts").delete().eq("id", contactId);
}

// ============================================================
// NEW FEATURES: CALENDAR EVENTS
// ============================================================
export async function loadCalendarEvents(workspaceId: string) {
  const { data } = await supabase.from("calendar_events").select("*").eq("workspace_id", workspaceId).order("start_time", { ascending: true });
  if (!data) return null;
  return data.map((e: any) => ({
    id: e.id,
    workspaceId: e.workspace_id,
    title: e.title,
    description: e.description || "",
    eventType: e.event_type || "other",
    linkedContactId: e.linked_contact_id || "",
    linkedProjectId: e.linked_project_id || "",
    startTime: e.start_time,
    endTime: e.end_time || null,
    location: e.location || "",
    isCompleted: e.is_completed || false,
    createdAt: e.created_at,
  }));
}

export async function upsertCalendarEvent(e: any) {
  await supabase.from("calendar_events").upsert({
    id: e.id,
    workspace_id: e.workspaceId,
    title: e.title,
    description: e.description,
    event_type: e.eventType,
    linked_contact_id: e.linkedContactId,
    linked_project_id: e.linkedProjectId,
    start_time: e.startTime,
    end_time: e.endTime,
    location: e.location,
    is_completed: e.isCompleted,
  });
}

export async function deleteCalendarEvent(eventId: string) {
  await supabase.from("calendar_events").delete().eq("id", eventId);
}

// ============================================================
// NEW FEATURES: NOTES
// ============================================================
export async function loadNotes(workspaceId: string) {
  const { data } = await supabase.from("notes").select("*").eq("workspace_id", workspaceId).order("is_pinned", { ascending: false }).order("updated_at", { ascending: false });
  if (!data) return null;
  return data.map((n: any) => ({
    id: n.id,
    workspaceId: n.workspace_id,
    title: n.title,
    content: n.content || "",
    linkedSegmentId: n.linked_segment_id || "",
    linkedCanvasSection: n.linked_canvas_section || "",
    colorTag: n.color_tag || "default",
    isPinned: n.is_pinned || false,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  }));
}

export async function upsertNote(n: any) {
  await supabase.from("notes").upsert({
    id: n.id,
    workspace_id: n.workspaceId,
    title: n.title,
    content: n.content,
    linked_segment_id: n.linkedSegmentId,
    linked_canvas_section: n.linkedCanvasSection,
    color_tag: n.colorTag,
    is_pinned: n.isPinned,
    updated_at: n.updatedAt,
  });
}

export async function deleteNote(noteId: string) {
  await supabase.from("notes").delete().eq("id", noteId);
}

// ============================================================
// NEW FEATURES: GLOSSARY TERMS
// ============================================================
export async function loadGlossaryTerms(workspaceId: string) {
  const { data } = await supabase.from("glossary_terms").select("*").eq("workspace_id", workspaceId).order("term", { ascending: true });
  if (!data) return null;
  return data.map((t: any) => ({
    id: t.id,
    workspaceId: t.workspace_id,
    term: t.term,
    definition: t.definition || "",
    category: t.category || "general",
    sourceInterviewId: t.source_interview_id || "",
    sourceProjectId: t.source_project_id || "",
    isAutoDetected: t.is_auto_detected || false,
    createdAt: t.created_at,
  }));
}

export async function upsertGlossaryTerm(t: any) {
  await supabase.from("glossary_terms").upsert({
    id: t.id,
    workspace_id: t.workspaceId,
    term: t.term,
    definition: t.definition,
    category: t.category,
    source_interview_id: t.sourceInterviewId,
    source_project_id: t.sourceProjectId,
    is_auto_detected: t.isAutoDetected,
  });
}

export async function deleteGlossaryTerm(termId: string) {
  await supabase.from("glossary_terms").delete().eq("id", termId);
}

// ============================================================
// NEW FEATURES: ANALYSIS REPORTS
// ============================================================
export async function loadAnalysisReports(workspaceId: string) {
  const { data } = await supabase.from("analysis_reports").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (!data) return null;
  return data.map((r: any) => ({
    id: r.id,
    workspaceId: r.workspace_id,
    name: r.name,
    description: r.description || "",
    comparisonType: r.comparison_type || "cross_research",
    projectIds: r.project_ids || [],
    validationSignals: r.validation_signals || [],
    summary: r.summary || "",
    createdAt: r.created_at,
  }));
}

export async function upsertAnalysisReport(r: any) {
  await supabase.from("analysis_reports").upsert({
    id: r.id,
    workspace_id: r.workspaceId,
    name: r.name,
    description: r.description,
    comparison_type: r.comparisonType,
    project_ids: r.projectIds,
    validation_signals: r.validationSignals,
    summary: r.summary,
  });
}

export async function deleteAnalysisReport(reportId: string) {
  await supabase.from("analysis_reports").delete().eq("id", reportId);
}

// ============================================================
// NEW FEATURES: INTERVIEW SCRIPTS
// ============================================================
export async function loadInterviewScripts(workspaceId: string) {
  const { data } = await supabase.from("interview_scripts").select("sections").eq("workspace_id", workspaceId).single();
  if (!data) return null;
  return data.sections || [];
}

export async function saveInterviewScripts(workspaceId: string, sections: any[]) {
  await supabase.from("interview_scripts").upsert({
    workspace_id: workspaceId,
    sections,
  });
}

// ============================================================
// PUBLIC (no auth required)
// ============================================================
export async function loadPublicProject(projectId: string) {
  const { data } = await supabase.from("research_projects").select("id, name, type, segment_id").eq("id", projectId).single();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    segmentId: data.segment_id || "",
  };
}

export async function submitPublicInterview(interview: any) {
  await supabase.from("interviews").insert({
    id: interview.id,
    research_project_id: interview.researchProjectId,
    workspace_id: interview.workspaceId,
    respondent_name: interview.respondentName,
    job_role: interview.jobRole,
    mode: "ai_led",
    is_synthetic: false,
    status: "completed",
    quality_score: 85,
    script_coverage_pct: 90,
    transcript_text: interview.transcriptText,
    date: new Date().toISOString().split("T")[0],
  });
}

// Export the uid helper
export { uid };
