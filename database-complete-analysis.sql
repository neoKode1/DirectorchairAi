-- Complete Database Analysis Script
-- This will catch ALL missing columns, tables, and schema issues
-- Run this in Supabase SQL Editor

-- ==============================================
-- PART 1: COMPLETE SCHEMA OVERVIEW
-- ==============================================

SELECT '=== COMPLETE DATABASE SCHEMA ANALYSIS ===' as status;

-- Check what tables exist
SELECT '=== EXISTING TABLES ===' as status;
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ==============================================
-- PART 2: DETAILED COLUMN ANALYSIS
-- ==============================================

-- Check ALL columns in ALL tables
SELECT '=== ALL COLUMNS IN ALL TABLES ===' as status;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ==============================================
-- PART 3: GENERATIONS TABLE SPECIFIC ANALYSIS
-- ==============================================

SELECT '=== GENERATIONS TABLE ANALYSIS ===' as status;

-- Check if generations table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'generations' AND schemaname = 'public') 
        THEN '✅ Generations table EXISTS'
        ELSE '❌ Generations table MISSING'
    END as generations_table_status;

-- Check ALL columns in generations table
SELECT '=== GENERATIONS TABLE COLUMNS ===' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'generations'
ORDER BY ordinal_position;

-- Check for missing REQUIRED columns in generations table
SELECT '=== MISSING COLUMNS IN GENERATIONS TABLE ===' as status;
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'id') 
        THEN '❌ MISSING: id column'
        ELSE '✅ OK: id column exists'
    END as id_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'user_id') 
        THEN '❌ MISSING: user_id column'
        ELSE '✅ OK: user_id column exists'
    END as user_id_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'session_id') 
        THEN '❌ MISSING: session_id column'
        ELSE '✅ OK: session_id column exists'
    END as session_id_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'model') 
        THEN '❌ MISSING: model column'
        ELSE '✅ OK: model column exists'
    END as model_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'prompt') 
        THEN '❌ MISSING: prompt column'
        ELSE '✅ OK: prompt column exists'
    END as prompt_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'output_url') 
        THEN '❌ MISSING: output_url column'
        ELSE '✅ OK: output_url column exists'
    END as output_url_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'status') 
        THEN '❌ MISSING: status column'
        ELSE '✅ OK: status column exists'
    END as status_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'created_at') 
        THEN '❌ MISSING: created_at column'
        ELSE '✅ OK: created_at column exists'
    END as created_at_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'updated_at') 
        THEN '❌ MISSING: updated_at column'
        ELSE '✅ OK: updated_at column exists'
    END as updated_at_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'expires_at') 
        THEN '❌ MISSING: expires_at column'
        ELSE '✅ OK: expires_at column exists'
    END as expires_at_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'metadata') 
        THEN '❌ MISSING: metadata column'
        ELSE '✅ OK: metadata column exists'
    END as metadata_status;

-- ==============================================
-- PART 4: OTHER TABLES ANALYSIS
-- ==============================================

SELECT '=== OTHER TABLES STATUS ===' as status;
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') 
        THEN '❌ MISSING: users table'
        ELSE '✅ OK: users table exists'
    END as users_table_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions' AND schemaname = 'public') 
        THEN '❌ MISSING: sessions table'
        ELSE '✅ OK: sessions table exists'
    END as sessions_table_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'media' AND schemaname = 'public') 
        THEN '❌ MISSING: media table'
        ELSE '✅ OK: media table exists'
    END as media_table_status;

-- ==============================================
-- PART 5: DATA TYPE ANALYSIS
-- ==============================================

SELECT '=== DATA TYPE ANALYSIS ===' as status;
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'text' THEN 'TEXT'
        WHEN data_type = 'uuid' THEN 'UUID'
        WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
        WHEN data_type = 'jsonb' THEN 'JSONB'
        WHEN data_type = 'bigint' THEN 'BIGINT'
        WHEN data_type = 'integer' THEN 'INTEGER'
        WHEN data_type = 'numeric' THEN 'NUMERIC'
        ELSE data_type
    END as data_type_summary
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ==============================================
-- PART 6: INDEXES ANALYSIS
-- ==============================================

SELECT '=== INDEXES ANALYSIS ===' as status;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ==============================================
-- PART 7: RLS POLICIES ANALYSIS
-- ==============================================

SELECT '=== RLS POLICIES ANALYSIS ===' as status;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================
-- PART 8: PERMISSIONS ANALYSIS
-- ==============================================

SELECT '=== PERMISSIONS ANALYSIS ===' as status;
SELECT 
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND grantee IN ('authenticated', 'service_role', 'anon')
ORDER BY table_name, grantee, privilege_type;

-- ==============================================
-- PART 9: SUMMARY REPORT
-- ==============================================

SELECT '=== SUMMARY REPORT ===' as status;
SELECT 
    'Total Tables' as metric,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Total Columns' as metric,
    COUNT(*) as count
FROM information_schema.columns 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'Total Indexes' as metric,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Total Policies' as metric,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- ==============================================
-- PART 10: CRITICAL ISSUES SUMMARY
-- ==============================================

SELECT '=== CRITICAL ISSUES SUMMARY ===' as status;
SELECT 
    'Missing Columns in Generations' as issue_type,
    COUNT(*) as count
FROM (
    SELECT 'id' as column_name
    UNION SELECT 'user_id'
    UNION SELECT 'session_id'
    UNION SELECT 'model'
    UNION SELECT 'prompt'
    UNION SELECT 'output_url'
    UNION SELECT 'status'
    UNION SELECT 'created_at'
    UNION SELECT 'updated_at'
    UNION SELECT 'expires_at'
    UNION SELECT 'metadata'
) required_columns
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
        AND table_name = 'generations' 
        AND column_name = required_columns.column_name
)

UNION ALL

SELECT 
    'Missing Tables' as issue_type,
    COUNT(*) as count
FROM (
    SELECT 'sessions' as table_name
    UNION SELECT 'media'
) required_tables
WHERE NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename = required_tables.table_name
);
