-- Recreate the wallet address function with correct search_path
CREATE OR REPLACE FUNCTION public.generate_wallet_address()
RETURNS text
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  RETURN '0x' || ENCODE(extensions.gen_random_bytes(20), 'hex');
END;
$$;