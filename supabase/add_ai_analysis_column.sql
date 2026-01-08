-- Add column to store the full AI analysis result (JSON)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS ai_analysis_result JSONB;

COMMENT ON COLUMN public.projects.ai_analysis_result IS 'Stores the detailed risk analysis and reasoning from Gemini AI';
