-- Add payment details to investments table
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mobile_money' CHECK (payment_method IN ('mobile_money', 'crypto')),
ADD COLUMN IF NOT EXISTS tx_hash TEXT;

-- Ensure tx_hash is unique via a partial index to allow nulls (if we only require unique for crypto)
CREATE UNIQUE INDEX IF NOT EXISTS unique_crypto_tx_hash ON public.investments (tx_hash) WHERE tx_hash IS NOT NULL;
