-- SIMPLE DATABASE FIX - STEP BY STEP
-- Run each section one at a time in Supabase SQL Editor

-- STEP 1: Add missing columns to generations table
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS prompt TEXT;
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- STEP 2: Fix ID column default
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
        ALTER TABLE public.generations ALTER COLUMN id SET DEFAULT 'gen_' || extract(epoch from now())::text || '_' || floor(random() * 1000000)::text;
    ELSIF id_data_type = 'uuid' THEN
        ALTER TABLE public.generations ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END $$;

-- STEP 3: Create missing tables
CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    generation_id TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    duration DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- STEP 4: Add indexes
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_model ON public.generations(model);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_expires_at ON public.generations(expires_at);

-- STEP 5: Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create basic RLS policies
DROP POLICY IF EXISTS "Users can view their own generations" ON public.generations;
CREATE POLICY "Users can view their own generations" ON public.generations
    FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own generations" ON public.generations;
CREATE POLICY "Users can insert their own generations" ON public.generations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

-- STEP 7: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- STEP 8: Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- STEP 9: Test the fix
INSERT INTO public.generations (model, prompt, status) 
VALUES ('test-model', 'test prompt', 'completed') 
RETURNING id;
