-- Fix ID Column Default Value Issue
-- The generations.id column needs a default value
-- Run this in Supabase SQL Editor

-- ==============================================
-- PART 1: CHECK CURRENT ID COLUMN CONFIGURATION
-- ==============================================

SELECT '=== CHECKING ID COLUMN CONFIGURATION ===' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'generations' 
    AND column_name = 'id';

-- ==============================================
-- PART 2: FIX ID COLUMN DEFAULT VALUE
-- ==============================================

SELECT '=== FIXING ID COLUMN DEFAULT VALUE ===' as status;

-- Check if the id column is TEXT or UUID
DO $$
DECLARE
    id_data_type TEXT;
BEGIN
    SELECT data_type INTO id_data_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
        AND table_name = 'generations' 
        AND column_name = 'id';
    
    IF id_data_type = 'text' THEN
        -- For TEXT id column, set a default that generates a unique string
        ALTER TABLE public.generations 
        ALTER COLUMN id SET DEFAULT 'gen_' || extract(epoch from now())::text || '_' || floor(random() * 1000000)::text;
        
        RAISE NOTICE '✅ Set default for TEXT id column';
    ELSIF id_data_type = 'uuid' THEN
        -- For UUID id column, set gen_random_uuid() as default
        ALTER TABLE public.generations 
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        RAISE NOTICE '✅ Set default for UUID id column';
    ELSE
        RAISE NOTICE '❌ Unknown id column type: %', id_data_type;
    END IF;
END $$;

-- ==============================================
-- PART 3: UPDATE EXISTING NULL ID VALUES
-- ==============================================

SELECT '=== UPDATING EXISTING NULL ID VALUES ===' as status;

-- Update any existing records that have NULL id values
DO $$
DECLARE
    id_data_type TEXT;
    null_count INTEGER;
BEGIN
    -- Check the data type
    SELECT data_type INTO id_data_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
        AND table_name = 'generations' 
        AND column_name = 'id';
    
    -- Count NULL id values
    SELECT COUNT(*) INTO null_count
    FROM public.generations 
    WHERE id IS NULL;
    
    RAISE NOTICE 'Found % records with NULL id values', null_count;
    
    IF null_count > 0 THEN
        IF id_data_type = 'text' THEN
            -- Update NULL text ids
            UPDATE public.generations 
            SET id = 'gen_' || extract(epoch from now())::text || '_' || floor(random() * 1000000)::text
            WHERE id IS NULL;
            
            RAISE NOTICE '✅ Updated % NULL text id values', null_count;
        ELSIF id_data_type = 'uuid' THEN
            -- Update NULL uuid ids
            UPDATE public.generations 
            SET id = gen_random_uuid()
            WHERE id IS NULL;
            
            RAISE NOTICE '✅ Updated % NULL uuid id values', null_count;
        END IF;
    ELSE
        RAISE NOTICE '✅ No NULL id values found';
    END IF;
END $$;

-- ==============================================
-- PART 4: VERIFY ID COLUMN IS FIXED
-- ==============================================

SELECT '=== VERIFYING ID COLUMN FIX ===' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    '✅ ID column configured' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'generations' 
    AND column_name = 'id';

-- ==============================================
-- PART 5: TEST INSERT OPERATION
-- ==============================================

SELECT '=== TESTING INSERT OPERATION ===' as status;
DO $$
DECLARE
    test_id TEXT;
    id_data_type TEXT;
BEGIN
    -- Check the data type
    SELECT data_type INTO id_data_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
        AND table_name = 'generations' 
        AND column_name = 'id';
    
    -- Test insert without specifying id (should use default)
    IF id_data_type = 'text' THEN
        INSERT INTO public.generations (model, prompt, status) 
        VALUES ('test-model', 'test prompt for id fix verification', 'completed') 
        RETURNING id INTO test_id;
    ELSE
        INSERT INTO public.generations (model, prompt, status) 
        VALUES ('test-model', 'test prompt for id fix verification', 'completed') 
        RETURNING id::text INTO test_id;
    END IF;
    
    RAISE NOTICE '✅ Test insert successful! Generated ID: %', test_id;
    
    -- Clean up test record
    DELETE FROM public.generations WHERE id = test_id;
    RAISE NOTICE '✅ Test record cleaned up';
END $$;

-- ==============================================
-- PART 6: REFRESH SCHEMA CACHE
-- ==============================================

SELECT '=== REFRESHING SCHEMA CACHE ===' as status;
SELECT pg_notify('pgrst', 'reload schema');

-- ==============================================
-- PART 7: FINAL STATUS
-- ==============================================

SELECT '=== FINAL STATUS ===' as status;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'generations' 
                AND column_name = 'id' 
                AND column_default IS NOT NULL
        )
        THEN '🎉 ID COLUMN DEFAULT VALUE FIXED SUCCESSFULLY!'
        ELSE '❌ ID COLUMN STILL NEEDS FIXING'
    END as final_status;
