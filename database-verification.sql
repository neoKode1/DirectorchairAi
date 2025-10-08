-- Database Verification Script
-- Run this after the comprehensive fix to verify everything is working

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- 1. Check if all tables exist
SELECT '=== TABLE VERIFICATION ===' as status;
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

-- 2. Check if all required columns exist in generations table
SELECT '=== GENERATIONS TABLE COLUMNS ===' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name = 'id' THEN '✅ ID column'
        WHEN column_name = 'user_id' THEN '✅ User ID column'
        WHEN column_name = 'session_id' THEN '✅ Session ID column'
        WHEN column_name = 'model' THEN '✅ Model column'
        WHEN column_name = 'prompt' THEN '✅ Prompt column'
        WHEN column_name = 'output_url' THEN '✅ Output URL column'
        WHEN column_name = 'status' THEN '✅ Status column'
        WHEN column_name = 'created_at' THEN '✅ Created at column'
        WHEN column_name = 'updated_at' THEN '✅ Updated at column'
        WHEN column_name = 'expires_at' THEN '✅ Expires at column'
        WHEN column_name = 'metadata' THEN '✅ Metadata column'
        ELSE '✅ ' || column_name || ' column'
    END as column_status
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'generations'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled
SELECT '=== ROW LEVEL SECURITY ===' as status;
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS enabled'
        ELSE '❌ RLS disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Check if policies exist
SELECT '=== RLS POLICIES ===' as status;
SELECT 
    tablename,
    policyname,
    cmd,
    '✅ Policy exists' as policy_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Check if indexes exist
SELECT '=== INDEXES ===' as status;
SELECT 
    tablename,
    indexname,
    '✅ Index exists' as index_status
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. Test insert operation
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

-- 7. Test select operation
SELECT '=== TESTING SELECT ===' as status;
SELECT 
    COUNT(*) as total_generations,
    '✅ Select operation working' as select_status
FROM public.generations;

-- 8. Check permissions
SELECT '=== PERMISSIONS ===' as status;
SELECT 
    table_name,
    privilege_type,
    '✅ Permission granted' as permission_status
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND grantee IN ('authenticated', 'service_role')
    AND table_name = 'generations'
ORDER BY table_name, privilege_type;

-- Final status
SELECT '=== FINAL STATUS ===' as status;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'generations' AND schemaname = 'public') 
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'expires_at')
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generations' AND schemaname = 'public')
        THEN '🎉 DATABASE IS FULLY CONFIGURED AND READY!'
        ELSE '❌ DATABASE STILL HAS ISSUES - CHECK ABOVE'
    END as final_status;
