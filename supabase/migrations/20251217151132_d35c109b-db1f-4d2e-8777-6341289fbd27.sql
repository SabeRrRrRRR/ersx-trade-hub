-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'buy', 'sell', 'transfer', 'referral_bonus');

-- Create enum for withdrawal status
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'denied');

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('active', 'frozen', 'banned');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  status user_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create wallets table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ERSX',
  balance DECIMAL(18, 8) DEFAULT 0,
  address TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, currency)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT DEFAULT 'ERSX',
  price DECIMAL(18, 8),
  fee DECIMAL(18, 8) DEFAULT 0,
  status TEXT DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT DEFAULT 'ERSX',
  wallet_address TEXT NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  admin_note TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Enable insert for user registration" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallets policies
CREATE POLICY "Users can view own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all wallets" ON public.wallets
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Withdrawals policies
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update withdrawals" ON public.withdrawals
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (TRUE);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'ERSX' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$;

-- Function to generate wallet address
CREATE OR REPLACE FUNCTION public.generate_wallet_address()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN '0x' || ENCODE(GEN_RANDOM_BYTES(20), 'hex');
END;
$$;

-- Trigger to create profile and wallet on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, username, email, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    public.generate_referral_code(),
    NEW.raw_user_meta_data->>'referred_by'
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create wallet with bonus
  INSERT INTO public.wallets (user_id, currency, balance, address)
  VALUES (NEW.id, 'ERSX', 100.00, public.generate_wallet_address());
  
  -- Add welcome bonus transaction
  INSERT INTO public.transactions (user_id, type, amount, description)
  VALUES (NEW.id, 'referral_bonus', 100.00, 'Welcome bonus');
  
  -- Add referral bonus if referred
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    UPDATE public.wallets 
    SET balance = balance + 50
    WHERE user_id = (
      SELECT id FROM public.profiles WHERE referral_code = NEW.raw_user_meta_data->>'referred_by'
    ) AND currency = 'ERSX';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();