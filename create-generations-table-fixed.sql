-- Create the generations table for storing AI generation metadata
-- This fixes the "Could not find the table 'public.generations'" error

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_session_id ON public.generations(session_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);
CREATE INDEX IF NOT EXISTS idx_generations_expires_at ON public.generations(expires_at);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_generations_updated_at ON public.generations;
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own generations
CREATE POLICY "Users can view their own generations" ON public.generations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own generations
CREATE POLICY "Users can insert their own generations" ON public.generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own generations
CREATE POLICY "Users can update their own generations" ON public.generations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own generations
CREATE POLICY "Users can delete their own generations" ON public.generations
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.generations IS 'Stores metadata for AI content generations';
COMMENT ON COLUMN public.generations.id IS 'Unique identifier for the generation';
COMMENT ON COLUMN public.generations.user_id IS 'ID of the user who created the generation';
COMMENT ON COLUMN public.generations.session_id IS 'Session identifier for grouping related generations';
COMMENT ON COLUMN public.generations.model IS 'AI model used for generation (e.g., fal-ai/sora-2/image-to-video)';
COMMENT ON COLUMN public.generations.prompt IS 'Text prompt used for generation';
COMMENT ON COLUMN public.generations.output_url IS 'URL of the generated content (image, video, etc.)';
COMMENT ON COLUMN public.generations.status IS 'Current status of the generation process';
COMMENT ON COLUMN public.generations.metadata IS 'Additional metadata about the generation (aspect ratio, duration, etc.)';
COMMENT ON COLUMN public.generations.expires_at IS 'When the generation record should be cleaned up';
