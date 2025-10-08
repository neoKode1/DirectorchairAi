-- Final Comprehensive Database Fix
-- Fixes all 4 missing columns + 2 missing tables
-- Run this in Supabase SQL Editor

-- ==============================================
-- PART 1: ADD ALL MISSING COLUMNS TO GENERATIONS
-- ==============================================

SELECT '=== ADDING MISSING COLUMNS TO GENERATIONS TABLE ===' as status;

-- Add all missing columns with proper defaults
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS model TEXT;

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS prompt TEXT;

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS output_url TEXT;

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS session_id TEXT;

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ==============================================
-- PART 2: UPDATE EXISTING RECORDS WITH DEFAULTS
-- ==============================================

SELECT '=== UPDATING EXISTING RECORDS ===' as status;

-- Update existing records to have proper values
UPDATE public.generations 
SET status = 'completed' 
WHERE status IS NULL;

UPDATE public.generations 
SET model = 'unknown' 
WHERE model IS NULL;

UPDATE public.generations 
SET prompt = 'No prompt provided' 
WHERE prompt IS NULL;

UPDATE public.generations 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE public.generations 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

UPDATE public.generations 
SET expires_at = NOW() + INTERVAL '30 days' 
WHERE expires_at IS NULL;

UPDATE public.generations 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL;

-- ==============================================
-- PART 3: ADD CONSTRAINTS
-- ==============================================

SELECT '=== ADDING CONSTRAINTS ===' as status;

-- Make required columns NOT NULL
ALTER TABLE public.generations 
ALTER COLUMN model SET NOT NULL;

ALTER TABLE public.generations 
ALTER COLUMN prompt SET NOT NULL;

-- ==============================================
-- PART 4: CREATE MISSING SESSIONS TABLE
-- ==============================================

SELECT '=== CREATING SESSIONS TABLE ===' as status;

CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ==============================================
-- PART 5: CREATE MISSING MEDIA TABLE
-- ==============================================

SELECT '=== CREATING MEDIA TABLE ===' as status;

CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    generation_id TEXT REFERENCES public.generations(id) ON DELETE CASCADE,
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
-- PART 6: ADD ALL INDEXES
-- ==============================================

SELECT '=== ADDING INDEXES ===' as status;

-- Generations table indexes
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
-- PART 7: ENABLE ROW LEVEL SECURITY
-- ==============================================

SELECT '=== ENABLING ROW LEVEL SECURITY ===' as status;

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PART 8: CREATE ALL RLS POLICIES
-- ==============================================

SELECT '=== CREATING RLS POLICIES ===' as status;

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
-- PART 9: GRANT ALL PERMISSIONS
-- ==============================================

SELECT '=== GRANTING PERMISSIONS ===' as status;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.generations TO service_role;
GRANT ALL ON public.sessions TO service_role;
GRANT ALL ON public.media TO service_role;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- ==============================================
-- PART 10: CREATE HELPER FUNCTIONS
-- ==============================================

SELECT '=== CREATING HELPER FUNCTIONS ===' as status;

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

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- PART 11: REFRESH SCHEMA CACHE
-- ==============================================

SELECT '=== REFRESHING SCHEMA CACHE ===' as status;

-- Refresh the PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- ==============================================
-- PART 12: COMPREHENSIVE VERIFICATION
-- ==============================================

SELECT '=== COMPREHENSIVE VERIFICATION ===' as status;

-- Verify all tables exist
SELECT 'Tables created:' as verification_type;
SELECT 
    tablename,
    '✅ Table exists' as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify all columns exist in generations table
SELECT 'Generations table columns:' as verification_type;
SELECT 
    column_name,
    data_type,
    '✅ Column exists' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'generations'
ORDER BY ordinal_position;

-- Test insert operations
SELECT 'Testing database operations:' as verification_type;
DO $$
DECLARE
    test_generation_id TEXT;
    test_session_id TEXT;
    test_media_id UUID;
BEGIN
    -- Test generations insert
    INSERT INTO public.generations (model, prompt, status) 
    VALUES ('test-model', 'test prompt for verification', 'completed') 
    RETURNING id INTO test_generation_id;
    
    RAISE NOTICE '✅ Generations insert successful! ID: %', test_generation_id;
    
    -- Test sessions insert
    INSERT INTO public.sessions (id, user_id) 
    VALUES ('test-session-123', gen_random_uuid()) 
    RETURNING id INTO test_session_id;
    
    RAISE NOTICE '✅ Sessions insert successful! ID: %', test_session_id;
    
    -- Test media insert
    INSERT INTO public.media (generation_id, file_url, file_type) 
    VALUES (test_generation_id, 'https://example.com/test.jpg', 'image') 
    RETURNING id INTO test_media_id;
    
    RAISE NOTICE '✅ Media insert successful! ID: %', test_media_id;
    
    -- Clean up test records
    DELETE FROM public.media WHERE id = test_media_id;
    DELETE FROM public.sessions WHERE id = test_session_id;
    DELETE FROM public.generations WHERE id = test_generation_id;
    
    RAISE NOTICE '✅ All test records cleaned up successfully!';
END $$;

-- Final success message
SELECT '=== FINAL STATUS ===' as status;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'status')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'model')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'prompt')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'expires_at')
        AND EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions' AND schemaname = 'public')
        AND EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'media' AND schemaname = 'public')
        THEN '🎉 ALL 4 MISSING COLUMNS + 2 MISSING TABLES FIXED SUCCESSFULLY!'
        ELSE '❌ SOME ISSUES REMAIN - CHECK ABOVE'
    END as final_status;
