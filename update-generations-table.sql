-- Update the generations table to match the expected schema
-- Add missing columns if they don't exist

-- Add output_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'generations' AND column_name = 'output_url') THEN
        ALTER TABLE public.generations ADD COLUMN output_url TEXT;
    END IF;
END $$;

-- Add metadata column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'generations' AND column_name = 'metadata') THEN
        ALTER TABLE public.generations ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Remove result_data column if it exists (we're replacing it with output_url and metadata)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'generations' AND column_name = 'result_data') THEN
        ALTER TABLE public.generations DROP COLUMN result_data;
    END IF;
END $$;
