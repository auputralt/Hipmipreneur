-- HipmiPreneur Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- =============================================
-- 1. WORKSPACES
-- =============================================
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  url TEXT DEFAULT '',
  credits INTEGER DEFAULT 5000,
  health_score INTEGER DEFAULT 15,
  type TEXT DEFAULT 'Develop my idea',
  is_archived BOOLEAN DEFAULT FALSE,
  starting_path TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. LEAN CANVAS
-- =============================================
CREATE TABLE IF NOT EXISTS canvas_data (
  workspace_id TEXT PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_segments TEXT DEFAULT '',
  problem TEXT DEFAULT '',
  uvp TEXT DEFAULT '',
  solution TEXT DEFAULT '',
  channels TEXT DEFAULT '',
  revenue_streams TEXT DEFAULT '',
  cost_structure TEXT DEFAULT '',
  key_metrics TEXT DEFAULT '',
  unfair_advantage TEXT DEFAULT ''
);

-- =============================================
-- 3. CUSTOMER SEGMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS customer_segments (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_segments_workspace ON customer_segments(workspace_id);

-- =============================================
-- 4. COMPLETED TASKS
-- =============================================
CREATE TABLE IF NOT EXISTS completed_tasks (
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  PRIMARY KEY (workspace_id, task_id)
);

-- =============================================
-- 5. RESEARCH PROJECTS
-- =============================================
CREATE TABLE IF NOT EXISTS research_projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  segment_id TEXT DEFAULT '',
  type TEXT DEFAULT 'Validate customer problems',
  status TEXT DEFAULT 'In progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_workspace ON research_projects(workspace_id);

-- =============================================
-- 6. INTERVIEWS
-- =============================================
CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  research_project_id TEXT REFERENCES research_projects(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  respondent_name TEXT NOT NULL,
  job_role TEXT DEFAULT '',
  mode TEXT DEFAULT 'upload',
  is_synthetic BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'completed',
  quality_score INTEGER DEFAULT 85,
  script_coverage_pct INTEGER DEFAULT 90,
  transcript_text TEXT DEFAULT '',
  date TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_interviews_project ON interviews(research_project_id);
CREATE INDEX IF NOT EXISTS idx_interviews_workspace ON interviews(workspace_id);

-- =============================================
-- 7. INSIGHT REPORTS
-- =============================================
CREATE TABLE IF NOT EXISTS insight_reports (
  project_id TEXT PRIMARY KEY REFERENCES research_projects(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  quality_score INTEGER DEFAULT 85,
  quality_details TEXT DEFAULT '',
  categories JSONB DEFAULT '[]'
);

-- =============================================
-- 8. PERSONAS
-- =============================================
CREATE TABLE IF NOT EXISTS personas (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  segment_id TEXT DEFAULT '',
  name TEXT NOT NULL,
  archetype TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  core_quote TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  age_range TEXT DEFAULT '',
  job_roles TEXT DEFAULT '',
  priority_initiatives JSONB DEFAULT '[]',
  key_pains JSONB DEFAULT '[]',
  desired_outcomes JSONB DEFAULT '[]',
  decision_making JSONB DEFAULT '[]',
  evaluation_criteria JSONB DEFAULT '[]',
  messaging_angles JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personas_workspace ON personas(workspace_id);

-- =============================================
-- 9. POSITIONING DOCS
-- =============================================
CREATE TABLE IF NOT EXISTS positioning_docs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  persona_id TEXT DEFAULT '',
  core_positioning TEXT DEFAULT '',
  target_audience TEXT DEFAULT '',
  market_context TEXT DEFAULT '',
  uvp TEXT DEFAULT '',
  brand_voice TEXT DEFAULT '',
  reasons_to_believe JSONB DEFAULT '[]',
  messaging_pillars JSONB DEFAULT '[]',
  elevator_pitch TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. LANDING PAGES
-- =============================================
CREATE TABLE IF NOT EXISTS landing_pages (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  persona_id TEXT DEFAULT '',
  hero_headline TEXT DEFAULT '',
  hero_subheadline TEXT DEFAULT '',
  cta_text TEXT DEFAULT '',
  features JSONB DEFAULT '[]',
  social_proof TEXT DEFAULT '',
  faq JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. SALES DECKS
-- =============================================
CREATE TABLE IF NOT EXISTS sales_decks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  persona_id TEXT DEFAULT '',
  slides JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 12. SUBSCRIPTION PLANS
-- =============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  workspace_id TEXT PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'Free Trial'
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- =============================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE positioning_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/write their own data
CREATE POLICY "Users can manage their own workspaces"
  ON workspaces FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own canvas"
  ON canvas_data FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own segments"
  ON customer_segments FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own tasks"
  ON completed_tasks FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own projects"
  ON research_projects FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own interviews"
  ON interviews FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own insights"
  ON insight_reports FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own personas"
  ON personas FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own positioning"
  ON positioning_docs FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own landing pages"
  ON landing_pages FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own sales decks"
  ON sales_decks FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own subscriptions"
  ON subscription_plans FOR ALL
  USING (true);

-- =============================================
-- 13. CONTACTS (Lightweight CRM)
-- =============================================
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  company TEXT DEFAULT '',
  job_role TEXT DEFAULT '',
  segment_id TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  notes TEXT DEFAULT '',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_workspace ON contacts(workspace_id);

-- =============================================
-- 14. CALENDAR EVENTS
-- =============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_type TEXT DEFAULT 'interview',
  linked_contact_id TEXT DEFAULT '',
  linked_project_id TEXT DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT DEFAULT '',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calendar_workspace ON calendar_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_start ON calendar_events(start_time);

-- =============================================
-- 15. NOTES
-- =============================================
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  linked_segment_id TEXT DEFAULT '',
  linked_canvas_section TEXT DEFAULT '',
  color_tag TEXT DEFAULT 'default',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notes_workspace ON notes(workspace_id);

-- =============================================
-- 16. GLOSSARY TERMS
-- =============================================
CREATE TABLE IF NOT EXISTS glossary_terms (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  source_interview_id TEXT DEFAULT '',
  source_project_id TEXT DEFAULT '',
  is_auto_detected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_glossary_workspace ON glossary_terms(workspace_id);

-- =============================================
-- 17. ANALYSIS REPORTS
-- =============================================
CREATE TABLE IF NOT EXISTS analysis_reports (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  comparison_type TEXT DEFAULT 'cross_research',
  project_ids TEXT[] DEFAULT '{}',
  validation_signals JSONB DEFAULT '[]',
  summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analysis_workspace ON analysis_reports(workspace_id);

-- =============================================
-- 18. INTERVIEW SCRIPTS
-- =============================================
CREATE TABLE IF NOT EXISTS interview_scripts (
  workspace_id TEXT PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  sections JSONB DEFAULT '[]'
);

-- RLS for new tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own contacts"
  ON contacts FOR ALL USING (true);
CREATE POLICY "Users can manage their own calendar"
  ON calendar_events FOR ALL USING (true);
CREATE POLICY "Users can manage their own notes"
  ON notes FOR ALL USING (true);
CREATE POLICY "Users can manage their own glossary"
  ON glossary_terms FOR ALL USING (true);
CREATE POLICY "Users can manage their own analyses"
  ON analysis_reports FOR ALL USING (true);
CREATE POLICY "Users can manage their own scripts"
  ON interview_scripts FOR ALL USING (true);
