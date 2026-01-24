-- Fix: Allow buyers to insert their own orders
-- This policy was missing from the initial schema, causing the RLS error.

CREATE POLICY "Buyers create own orders" ON public.marketplace_orders
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);
