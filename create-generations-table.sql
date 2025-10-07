-- Create generations table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- First, create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the generations table
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For non-authenticated users
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  output_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- For session-based data cleanup
  metadata JSONB
);

-- Create the media_files table
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For non-authenticated users
  generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'audio')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- For session-based data cleanup
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for generations table
DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can insert own generations" ON public.generations;
CREATE POLICY "Users can insert own generations" ON public.generations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can update own generations" ON public.generations;
CREATE POLICY "Users can update own generations" ON public.generations
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can delete own generations" ON public.generations;
CREATE POLICY "Users can delete own generations" ON public.generations
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

-- Create policies for media_files table
DROP POLICY IF EXISTS "Users can view own media files" ON public.media_files;
CREATE POLICY "Users can view own media files" ON public.media_files
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can insert own media files" ON public.media_files;
CREATE POLICY "Users can insert own media files" ON public.media_files
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can update own media files" ON public.media_files;
CREATE POLICY "Users can update own media files" ON public.media_files
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can delete own media files" ON public.media_files;
CREATE POLICY "Users can delete own media files" ON public.media_files
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_session_id ON public.generations(session_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);
CREATE INDEX IF NOT EXISTS idx_generations_expires_at ON public.generations(expires_at);

CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_session_id ON public.media_files(session_id);
CREATE INDEX IF NOT EXISTS idx_media_files_generation_id ON public.media_files(generation_id);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON public.media_files(created_at);
CREATE INDEX IF NOT EXISTS idx_media_files_expires_at ON public.media_files(expires_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_generations_updated_at ON public.generations;
CREATE TRIGGER update_generations_updated_at BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_files_updated_at ON public.media_files;
CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON public.media_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the tables by inserting a sample record
INSERT INTO public.generations (model, prompt, status, session_id)
VALUES ('test-model', 'test prompt', 'completed', 'test-session-' || extract(epoch from now()))
ON CONFLICT DO NOTHING;

-- Verify the tables exist
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'generations', 'media_files');
