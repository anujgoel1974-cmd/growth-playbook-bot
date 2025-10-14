-- Create saved_analyses table for storing complete analysis results
CREATE TABLE public.saved_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.analysis_sessions(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now(),
  accessed_at timestamp with time zone DEFAULT now(),
  is_favorite boolean DEFAULT false,
  
  -- Store the complete analysis data as JSONB for fast retrieval
  analysis_data jsonb NOT NULL,
  
  -- Metadata for quick filtering/searching
  product_name text,
  brand_name text,
  channels text[],
  
  CONSTRAINT saved_analyses_session_id_key UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth yet)
CREATE POLICY "Allow public read access to saved_analyses"
  ON public.saved_analyses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to saved_analyses"
  ON public.saved_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to saved_analyses"
  ON public.saved_analyses FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete to saved_analyses"
  ON public.saved_analyses FOR DELETE
  USING (true);

-- Indexes for performance
CREATE INDEX idx_saved_analyses_created_at ON public.saved_analyses(created_at DESC);
CREATE INDEX idx_saved_analyses_url ON public.saved_analyses(url);
CREATE INDEX idx_saved_analyses_channels ON public.saved_analyses USING GIN(channels);