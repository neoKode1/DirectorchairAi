-- Simple script to add missing columns to existing tables
-- This can be run safely even if columns already exist

-- Add missing columns to generations table
DO $$ 
BEGIN
    -- Add output_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'generations' 
                   AND column_name = 'output_url') THEN
        ALTER TABLE public.generations ADD COLUMN output_url TEXT;
        RAISE NOTICE 'Added output_url column to generations table';
    ELSE
        RAISE NOTICE 'output_url column already exists in generations table';
    END IF;

    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'generations' 
                   AND column_name = 'metadata') THEN
        ALTER TABLE public.generations ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added metadata column to generations table';
    ELSE
        RAISE NOTICE 'metadata column already exists in generations table';
    END IF;

    -- Remove result_data column if it exists (we're replacing it with output_url and metadata)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'generations' 
               AND column_name = 'result_data') THEN
        ALTER TABLE public.generations DROP COLUMN result_data;
        RAISE NOTICE 'Removed result_data column from generations table';
    ELSE
        RAISE NOTICE 'result_data column does not exist in generations table';
    END IF;
END $$;
