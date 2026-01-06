-- Allow anyone to read verified reports (so investors can see them)
DROP POLICY IF EXISTS "Public can see verified reports" ON public.verification_reports;
CREATE POLICY "Public can see verified reports"
ON public.verification_reports FOR SELECT
USING (status = 'Verified');
