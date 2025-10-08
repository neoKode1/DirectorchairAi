-- Comprehensive Database Schema Analysis and Fix Script
-- Run this in Supabase SQL Editor to analyze and fix your entire database

-- ==============================================
-- PART 1: ANALYZE CURRENT SCHEMA
-- ==============================================

-- Check what tables exist
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

-- Check what columns exist in each table
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

-- Check what indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check what constraints exist
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- Check what functions exist
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check what policies exist
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
-- PART 2: CHECK SPECIFIC ISSUES
-- ==============================================

-- Check if generations table has all required columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'generations'
ORDER BY ordinal_position;

-- Check if there are any missing columns in generations table
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'id') 
        THEN 'MISSING: id column'
        ELSE 'OK: id column exists'
    END as id_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'user_id') 
        THEN 'MISSING: user_id column'
        ELSE 'OK: user_id column exists'
    END as user_id_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'session_id') 
        THEN 'MISSING: session_id column'
        ELSE 'OK: session_id column exists'
    END as session_id_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'model') 
        THEN 'MISSING: model column'
        ELSE 'OK: model column exists'
    END as model_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'prompt') 
        THEN 'MISSING: prompt column'
        ELSE 'OK: prompt column exists'
    END as prompt_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'output_url') 
        THEN 'MISSING: output_url column'
        ELSE 'OK: output_url column exists'
    END as output_url_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'status') 
        THEN 'MISSING: status column'
        ELSE 'OK: status column exists'
    END as status_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'created_at') 
        THEN 'MISSING: created_at column'
        ELSE 'OK: created_at column exists'
    END as created_at_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'updated_at') 
        THEN 'MISSING: updated_at column'
        ELSE 'OK: updated_at column exists'
    END as updated_at_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'expires_at') 
        THEN 'MISSING: expires_at column'
        ELSE 'OK: expires_at column exists'
    END as expires_at_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generations' AND column_name = 'metadata') 
        THEN 'MISSING: metadata column'
        ELSE 'OK: metadata column exists'
    END as metadata_status;

-- Check what other tables might be missing
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') 
        THEN 'MISSING: users table'
        ELSE 'OK: users table exists'
    END as users_table_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions' AND schemaname = 'public') 
        THEN 'MISSING: sessions table'
        ELSE 'OK: sessions table exists'
    END as sessions_table_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'media' AND schemaname = 'public') 
        THEN 'MISSING: media table'
        ELSE 'OK: media table exists'
    END as media_table_status;
