-- Enable pgcrypto extension for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the wallet address function
CREATE OR REPLACE FUNCTION public.generate_wallet_address()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN '0x' || ENCODE(gen_random_bytes(20), 'hex');
END;
$$;