-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create doctor_profiles table
CREATE TABLE public.doctor_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    bio TEXT,
    years_of_experience INTEGER,
    consultation_fee NUMERIC(10, 2),
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_doctor_profiles_specialization ON public.doctor_profiles(specialization);
CREATE INDEX idx_doctor_profiles_is_verified ON public.doctor_profiles(is_verified);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_doctor_profiles
    BEFORE UPDATE ON public.doctor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for doctor_profiles
CREATE POLICY "Doctors can view own doctor profile"
    ON public.doctor_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Doctors can insert own doctor profile"
    ON public.doctor_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can update own doctor profile"
    ON public.doctor_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view all doctor profiles"
    ON public.doctor_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public can view verified doctor profiles"
    ON public.doctor_profiles FOR SELECT
    TO anon
    USING (is_verified = true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.doctor_profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.doctor_profiles TO anon;
