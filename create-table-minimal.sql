-- Minimal script to create just the generations table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id TEXT,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    output_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Grant basic permissions
GRANT ALL ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
