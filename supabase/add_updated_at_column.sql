-- Add updated_at column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Verify (optional logging)
DO $$
BEGIN
    RAISE NOTICE 'Checked/Added updated_at column.';
END $$;
