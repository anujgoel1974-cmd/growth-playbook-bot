-- Add missing url column to analysis_progress table
ALTER TABLE public.analysis_progress 
ADD COLUMN url TEXT NOT NULL DEFAULT '';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_analysis_progress_url ON public.analysis_progress(url);

-- Update the default to make it explicit for future inserts
ALTER TABLE public.analysis_progress 
ALTER COLUMN url DROP DEFAULT;