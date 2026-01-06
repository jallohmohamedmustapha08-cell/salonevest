-- Create Verification Reports Table
CREATE TABLE IF NOT EXISTS public.verification_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_text TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'Submitted', -- Submitted, Reviewed, Verified, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.verification_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agents can see their own reports" ON public.verification_reports;
CREATE POLICY "Agents can see their own reports"
ON public.verification_reports FOR SELECT
USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Agents can create reports" ON public.verification_reports;
CREATE POLICY "Agents can create reports"
ON public.verification_reports FOR INSERT
WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Admins can see all reports" ON public.verification_reports;
CREATE POLICY "Admins can see all reports"
ON public.verification_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create storage bucket for verification images
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-images', 'verification-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "Public Access Verification" ON storage.objects;
CREATE POLICY "Public Access Verification"
ON storage.objects FOR SELECT
USING ( bucket_id = 'verification-images' );

DROP POLICY IF EXISTS "Authenticated Upload Verification" ON storage.objects;
CREATE POLICY "Authenticated Upload Verification"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-images' 
  AND auth.role() = 'authenticated'
);
