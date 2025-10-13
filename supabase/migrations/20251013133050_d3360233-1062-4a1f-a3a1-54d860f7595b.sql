-- Create analysis sessions table for tracking orchestration
CREATE TABLE IF NOT EXISTS public.analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT
);

-- Create analysis progress table for real-time section updates
CREATE TABLE IF NOT EXISTS public.analysis_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.analysis_sessions(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  data JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_progress_session_id ON public.analysis_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_progress_status ON public.analysis_progress(status);

-- Enable realtime for frontend updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_progress;

-- Add RLS policies (public access for now since no auth)
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to analysis_sessions"
ON public.analysis_sessions FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to analysis_sessions"
ON public.analysis_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to analysis_sessions"
ON public.analysis_sessions FOR UPDATE
USING (true);

CREATE POLICY "Allow public read access to analysis_progress"
ON public.analysis_progress FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to analysis_progress"
ON public.analysis_progress FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to analysis_progress"
ON public.analysis_progress FOR UPDATE
USING (true);