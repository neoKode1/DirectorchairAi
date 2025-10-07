-- Simple script to create the generations table
-- This handles cases where some policies already exist

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    output_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_session_id ON public.generations(session_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);
CREATE INDEX IF NOT EXISTS idx_generations_expires_at ON public.generations(expires_at);

-- Create the update function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_generations_updated_at ON public.generations;
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can delete their own generations" ON public.generations;

-- Create RLS policies
CREATE POLICY "Users can view their own generations" ON public.generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations" ON public.generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations" ON public.generations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations" ON public.generations
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
