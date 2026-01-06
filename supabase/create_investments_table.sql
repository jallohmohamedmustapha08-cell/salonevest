-- Create Investments Table
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    status TEXT DEFAULT 'completed', -- 'pending' if we had real payments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors can see their own investments"
ON public.investments FOR SELECT
USING (auth.uid() = investor_id);

CREATE POLICY "Admins can see all investments"
ON public.investments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RPC Function to handle atomic investment (Insert + Update Funding)
CREATE OR REPLACE FUNCTION invest(project_id_arg BIGINT, investor_id_arg UUID, amount_arg NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated permissions to update projects
AS $$
DECLARE
    new_funding NUMERIC;
    target_goal NUMERIC;
BEGIN
    -- Check if project exists and get current stats
    SELECT funding, goal INTO new_funding, target_goal
    FROM public.projects
    WHERE id = project_id_arg;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Project not found');
    END IF;

    -- Insert Investment Record
    INSERT INTO public.investments (project_id, investor_id, amount)
    VALUES (project_id_arg, investor_id_arg, amount_arg);

    -- Update Project Funding
    UPDATE public.projects
    SET funding = COALESCE(funding, 0) + amount_arg
    WHERE id = project_id_arg;

    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
