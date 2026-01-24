-- Add payment details columns to marketplace_orders
ALTER TABLE public.marketplace_orders
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS transaction_hash TEXT;
