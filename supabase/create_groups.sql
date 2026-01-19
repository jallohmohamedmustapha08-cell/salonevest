-- Create Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES public.profiles(id) NOT NULL,
  location TEXT,
  joint_liability_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Group Members Table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(group_id, member_id)
);

-- Add trust_score to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trust_score') THEN
        ALTER TABLE public.profiles ADD COLUMN trust_score NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Create Project Payouts Table
CREATE TABLE IF NOT EXISTS public.project_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id), -- Group Leader
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved_ready', 'completed')),
  approvals JSONB DEFAULT '[]'::JSONB, -- List of member_ids who approved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Authenticated create groups" ON public.groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Leaders can update groups" ON public.groups FOR UPDATE USING (auth.uid() = leader_id);

-- Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read group_members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Members can insert themselves" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = member_id);
-- Allow leaders to remove members (optional, skipping for MVP complexity)

-- Payouts
ALTER TABLE public.project_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view relevant payouts" ON public.project_payouts FOR SELECT 
USING (
  auth.uid() = recipient_id OR 
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.member_id = auth.uid() 
    AND gm.group_id IN (
        SELECT id FROM public.groups WHERE leader_id = project_payouts.recipient_id
    )
  )
);
