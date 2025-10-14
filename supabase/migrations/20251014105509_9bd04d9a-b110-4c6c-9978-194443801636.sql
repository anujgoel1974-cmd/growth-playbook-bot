-- Add trend_analysis column to saved_analyses table
ALTER TABLE public.saved_analyses 
ADD COLUMN trend_analysis jsonb;