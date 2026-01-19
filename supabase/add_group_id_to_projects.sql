-- Add group_id to projects table
ALTER TABLE public.projects 
ADD COLUMN group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

-- Enable RLS for this new column? Already enabled for table.
-- Policy Check:
-- Entrepreneurs can create projects with group_id if they are members (checked in app logic/RLS)
-- Investors can read projects with group_id (public)

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_projects_group_id ON public.projects(group_id);
