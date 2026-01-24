-- Allow admins to delete products
CREATE POLICY "Admins can delete products" ON public.marketplace_products 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
