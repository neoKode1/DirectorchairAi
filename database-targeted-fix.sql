-- Targeted Database Fix Script
-- This script only adds what's missing based on your analysis
-- Run this in Supabase SQL Editor

-- ==============================================
-- PART 1: FIX GENERATIONS TABLE
-- ==============================================

-- Add missing expires_at column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Update existing records to have expires_at set
UPDATE public.generations 
SET expires_at = NOW() + INTERVAL '30 days' 
WHERE expires_at IS NULL;

-- ==============================================
-- PART 2: CREATE MISSING SESSIONS TABLE
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
-- PART 3: CREATE MISSING MEDIA TABLE
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
-- PART 4: ADD INDEXES FOR PERFORMANCE
-- ==============================================

-- Generations table indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_session_id ON public.generations(session_id);
CREATE INDEX IF NOT EXISTS idx_generations_model ON public.generations(model);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);
CREATE INDEX IF NOT EXISTS idx_generations_expires_at ON public.generations(expires_at);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);

-- Media table indexes
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_generation_id ON public.media(generation_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);

-- ==============================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on new tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PART 6: CREATE RLS POLICIES FOR NEW TABLES
-- ==============================================

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
-- PART 7: GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.sessions TO service_role;
GRANT ALL ON public.media TO service_role;

-- ==============================================
-- PART 8: CREATE HELPER FUNCTIONS (if needed)
-- ==============================================

-- Function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on new tables
DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- PART 9: REFRESH SCHEMA CACHE
-- ==============================================

-- Refresh the PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- ==============================================
-- PART 10: VERIFICATION
-- ==============================================

-- Verify all tables now exist
SELECT '=== VERIFICATION ===' as status;
SELECT 
    tablename,
    CASE 
        WHEN tablename = 'generations' THEN '✅ Generations table exists'
        WHEN tablename = 'users' THEN '✅ Users table exists'
        WHEN tablename = 'sessions' THEN '✅ Sessions table exists'
        WHEN tablename = 'media' THEN '✅ Media table exists'
        ELSE '✅ ' || tablename || ' table exists'
    END as table_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify expires_at column exists
SELECT '=== EXPIRES_AT COLUMN ===' as status;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'expires_at') 
        THEN '✅ expires_at column exists in generations table'
        ELSE '❌ expires_at column still missing'
    END as expires_at_status;

-- Test insert operation
SELECT '=== TESTING INSERT ===' as status;
DO $$
DECLARE
    test_id UUID;
BEGIN
    INSERT INTO public.generations (model, prompt, status) 
    VALUES ('test-model', 'test prompt for verification', 'completed') 
    RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Test insert successful! Generated ID: %', test_id;
    
    -- Clean up test record
    DELETE FROM public.generations WHERE id = test_id;
    RAISE NOTICE '✅ Test record cleaned up';
END $$;

-- Final status
SELECT '=== FINAL STATUS ===' as status;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions' AND schemaname = 'public')
        AND EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'media' AND schemaname = 'public')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'expires_at')
        THEN '🎉 ALL MISSING TABLES AND COLUMNS ADDED SUCCESSFULLY!'
        ELSE '❌ SOME ISSUES REMAIN - CHECK ABOVE'
    END as final_status;
