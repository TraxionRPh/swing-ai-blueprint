
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  handicap_level TEXT,
  goals TEXT,
  has_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own profile
CREATE POLICY select_own_profile ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to insert only their own profile
CREATE POLICY insert_own_profile ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update only their own profile
CREATE POLICY update_own_profile ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ensure the drills table has all the necessary columns
ALTER TABLE IF EXISTS public.drills
  ADD COLUMN IF NOT EXISTS instructions TEXT;

