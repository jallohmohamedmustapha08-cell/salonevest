-- Add deleted_at column for soft delete
ALTER TABLE public.marketplace_products
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update RLS to allow updates to deleted_at (if not already covered by update policy)
-- Existing policy "Entrepreneurs manage own products" covers UPDATE.
-- Admin policy needs to cover UPDATE if we want admins to soft delete.

CREATE POLICY "Admins can update products" ON public.marketplace_products 
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
