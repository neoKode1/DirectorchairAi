-- Comprehensive Database Fix Script
-- This script will create/fix all tables, columns, indexes, and policies
-- Run this in Supabase SQL Editor

-- ==============================================
-- PART 1: DROP AND RECREATE GENERATIONS TABLE
-- ==============================================

-- Drop existing generations table and all related objects
DROP TABLE IF EXISTS public.generations CASCADE;

-- Create the generations table with all required columns
CREATE TABLE public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id TEXT,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    output_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ==============================================
-- PART 2: CREATE USERS TABLE (if needed)
-- ==============================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    credits INTEGER DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- ==============================================
-- PART 3: CREATE SESSIONS TABLE (if needed)
-- ==============================================

CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ==============================================
-- PART 4: CREATE MEDIA TABLE (if needed)
-- ==============================================

CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'image', 'video', 'audio'
    file_size BIGINT,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    duration DECIMAL, -- for videos/audio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ==============================================
-- PART 5: CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Generations table indexes
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_session_id ON public.generations(session_id);
CREATE INDEX IF NOT EXISTS idx_generations_model ON public.generations(model);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);
CREATE INDEX IF NOT EXISTS idx_generations_expires_at ON public.generations(expires_at);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);

-- Media table indexes
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_generation_id ON public.media(generation_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);

-- ==============================================
-- PART 6: ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PART 7: CREATE RLS POLICIES
-- ==============================================

-- Generations policies
DROP POLICY IF EXISTS "Users can view their own generations" ON public.generations;
CREATE POLICY "Users can view their own generations" ON public.generations
    FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own generations" ON public.generations;
CREATE POLICY "Users can insert their own generations" ON public.generations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own generations" ON public.generations;
CREATE POLICY "Users can update their own generations" ON public.generations
    FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own generations" ON public.generations;
CREATE POLICY "Users can delete their own generations" ON public.generations
    FOR DELETE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
CREATE POLICY "Users can view their own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.sessions;
CREATE POLICY "Users can insert their own sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
CREATE POLICY "Users can update their own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;
CREATE POLICY "Users can delete their own sessions" ON public.sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Media policies
DROP POLICY IF EXISTS "Users can view their own media" ON public.media;
CREATE POLICY "Users can view their own media" ON public.media
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own media" ON public.media;
CREATE POLICY "Users can insert their own media" ON public.media
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own media" ON public.media;
CREATE POLICY "Users can update their own media" ON public.media
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own media" ON public.media;
CREATE POLICY "Users can delete their own media" ON public.media
    FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- PART 8: GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.generations TO service_role;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.sessions TO service_role;
GRANT ALL ON public.media TO service_role;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- ==============================================
-- PART 9: CREATE HELPER FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_generations_updated_at ON public.generations;
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- PART 10: REFRESH SCHEMA CACHE
-- ==============================================

-- Refresh the PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- ==============================================
-- PART 11: VERIFICATION QUERIES
-- ==============================================

-- Verify tables exist
SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Verify columns exist
SELECT 'Generations table columns:' as status;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'generations' 
ORDER BY ordinal_position;

-- Verify policies exist
SELECT 'RLS policies created:' as status;
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

-- Test insert (this should work now)
SELECT 'Testing insert...' as status;
INSERT INTO public.generations (model, prompt, status) 
VALUES ('test-model', 'test prompt', 'completed') 
RETURNING id, model, prompt, status, created_at;
