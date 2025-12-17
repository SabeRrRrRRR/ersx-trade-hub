-- Fix function search paths
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN 'ERSX' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_wallet_address()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN '0x' || ENCODE(GEN_RANDOM_BYTES(20), 'hex');
END;
$$;