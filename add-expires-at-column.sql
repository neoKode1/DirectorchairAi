-- Add missing expires_at column to generations table
-- Run this in Supabase SQL Editor

-- Add the expires_at column if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Update existing records to have expires_at set
UPDATE public.generations 
SET expires_at = NOW() + INTERVAL '30 days' 
WHERE expires_at IS NULL;

-- Refresh the schema cache
SELECT pg_notify('pgrst', 'reload schema');
