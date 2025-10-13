-- Phase 1: Create Agent Context Table for Multi-Agent Communication

CREATE TABLE agent_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id text NOT NULL,
  agent_name text NOT NULL,
  output_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(analysis_id, agent_name)
);

CREATE INDEX idx_agent_context_analysis ON agent_context(analysis_id);

-- Enable RLS
ALTER TABLE agent_context ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (same as other analysis tables)
CREATE POLICY "Allow public insert to agent_context"
ON agent_context FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Allow public read access to agent_context"
ON agent_context FOR SELECT TO public
USING (true);

CREATE POLICY "Allow public update to agent_context"
ON agent_context FOR UPDATE TO public
USING (true);

-- Enable realtime for agent progress tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_context;