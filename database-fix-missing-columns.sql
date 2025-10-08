-- Fix Missing Columns in Generations Table
-- This script checks what columns exist and adds missing ones
-- Run this in Supabase SQL Editor

-- ==============================================
-- PART 1: CHECK WHAT COLUMNS ACTUALLY EXIST
-- ==============================================

SELECT '=== CHECKING EXISTING COLUMNS ===' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'generations'
ORDER BY ordinal_position;

-- ==============================================
-- PART 2: ADD MISSING COLUMNS
-- ==============================================

-- Add status column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add model column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS model TEXT;

-- Add prompt column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS prompt TEXT;

-- Add output_url column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS output_url TEXT;

-- Add user_id column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add session_id column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add created_at column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add expires_at column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Add metadata column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ==============================================
-- PART 3: UPDATE EXISTING RECORDS
-- ==============================================

-- Update existing records to have default values for new columns
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
-- PART 4: ADD CONSTRAINTS
-- ==============================================

-- Make model and prompt NOT NULL if they aren't already
ALTER TABLE public.generations 
ALTER COLUMN model SET NOT NULL;

ALTER TABLE public.generations 
ALTER COLUMN prompt SET NOT NULL;

-- ==============================================
-- PART 5: CREATE MEDIA TABLE WITH CORRECT FOREIGN KEY
-- ==============================================

-- Drop the media table if it exists
DROP TABLE IF EXISTS public.media CASCADE;

-- Create media table with TEXT foreign key to match generations.id
CREATE TABLE public.media (
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
-- PART 6: ADD INDEXES
-- ==============================================

-- Generations table indexes
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_session_id ON public.generations(session_id);
CREATE INDEX IF NOT EXISTS idx_generations_model ON public.generations(model);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);
CREATE INDEX IF NOT EXISTS idx_generations_expires_at ON public.generations(expires_at);

-- Media table indexes
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_generation_id ON public.media(generation_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);

-- ==============================================
-- PART 7: ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PART 8: CREATE RLS POLICIES
-- ==============================================

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
-- PART 9: GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.media TO service_role;

-- ==============================================
-- PART 10: REFRESH SCHEMA CACHE
-- ==============================================

-- Refresh the PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- ==============================================
-- PART 11: VERIFICATION
-- ==============================================

-- Verify all columns now exist
SELECT '=== VERIFICATION - ALL COLUMNS ===' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'generations'
ORDER BY ordinal_position;

-- Test insert operation
SELECT '=== TESTING INSERT ===' as status;
DO $$
DECLARE
    test_generation_id TEXT;
    test_media_id UUID;
BEGIN
    -- Create a test generation
    INSERT INTO public.generations (model, prompt, status) 
    VALUES ('test-model', 'test prompt for verification', 'completed') 
    RETURNING id INTO test_generation_id;
    
    RAISE NOTICE '✅ Test generation created with ID: %', test_generation_id;
    
    -- Create a test media record
    INSERT INTO public.media (generation_id, file_url, file_type) 
    VALUES (test_generation_id, 'https://example.com/test.jpg', 'image') 
    RETURNING id INTO test_media_id;
    
    RAISE NOTICE '✅ Test media created with ID: %', test_media_id;
    
    -- Clean up test records
    DELETE FROM public.media WHERE id = test_media_id;
    DELETE FROM public.generations WHERE id = test_generation_id;
    RAISE NOTICE '✅ Test records cleaned up';
END $$;

-- Final status
SELECT '=== FINAL STATUS ===' as status;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'status')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'model')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'prompt')
        AND EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'media' AND schemaname = 'public')
        THEN '🎉 ALL COLUMNS AND TABLES CREATED SUCCESSFULLY!'
        ELSE '❌ SOME ISSUES REMAIN - CHECK ABOVE'
    END as final_status;
