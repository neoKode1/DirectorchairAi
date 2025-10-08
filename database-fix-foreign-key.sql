-- Fix Foreign Key Constraint Issue
-- The generations.id column is TEXT, not UUID
-- Run this in Supabase SQL Editor

-- ==============================================
-- PART 1: CHECK ACTUAL DATA TYPES
-- ==============================================

-- Check the actual data type of generations.id
SELECT '=== CHECKING DATA TYPES ===' as status;
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'generations' 
    AND column_name = 'id';

-- ==============================================
-- PART 2: DROP AND RECREATE MEDIA TABLE WITH CORRECT TYPES
-- ==============================================

-- Drop the media table if it exists
DROP TABLE IF EXISTS public.media CASCADE;

-- Create media table with TEXT foreign key to match generations.id
CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    generation_id TEXT REFERENCES public.generations(id) ON DELETE CASCADE, -- Changed to TEXT
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
-- PART 3: ADD INDEXES
-- ==============================================

-- Media table indexes
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_generation_id ON public.media(generation_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);

-- ==============================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PART 5: CREATE RLS POLICIES
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
-- PART 6: GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.media TO service_role;

-- ==============================================
-- PART 7: REFRESH SCHEMA CACHE
-- ==============================================

-- Refresh the PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- ==============================================
-- PART 8: VERIFICATION
-- ==============================================

-- Verify the media table was created correctly
SELECT '=== VERIFICATION ===' as status;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'media'
ORDER BY ordinal_position;

-- Test insert operation with correct data types
SELECT '=== TESTING INSERT ===' as status;
DO $$
DECLARE
    test_generation_id TEXT;
    test_media_id UUID;
BEGIN
    -- First create a test generation
    INSERT INTO public.generations (model, prompt, status) 
    VALUES ('test-model', 'test prompt for media test', 'completed') 
    RETURNING id INTO test_generation_id;
    
    RAISE NOTICE '✅ Test generation created with ID: %', test_generation_id;
    
    -- Then create a test media record
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
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'media' AND schemaname = 'public')
        THEN '🎉 MEDIA TABLE CREATED SUCCESSFULLY WITH CORRECT FOREIGN KEY!'
        ELSE '❌ MEDIA TABLE CREATION FAILED'
    END as final_status;
