-- Add bio column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add business_name column if it doesn't exist (useful for Entrepreneurs)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Verify columns (optional logging)
DO $$
BEGIN
    RAISE NOTICE 'Checked/Added bio and business_name columns.';
END $$;
