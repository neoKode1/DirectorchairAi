-- DirectorchairAI Migration Script for Existing VaryAi Database
-- This script adapts the existing VaryAi database structure for DirectorchairAI
-- Run this instead of the production schema since you already have tables

-- ============================================================================
-- ADD MISSING COLUMNS TO EXISTING USERS TABLE
-- ============================================================================

-- Add avatar_url column if it doesn't exist (for DirectorchairAI compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
  END IF;
END
$$;

-- Add credits column if it doesn't exist (DirectorchairAI uses 'credits' instead of 'credit_balance')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'credits'
  ) THEN
    ALTER TABLE public.users ADD COLUMN credits INTEGER DEFAULT 10 CHECK (credits >= 0);
  END IF;
END
$$;

-- ============================================================================
-- CREATE MISSING TABLES FOR DIRECTORCHAIR AI
-- ============================================================================

-- Create generated_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
  prompt TEXT NOT NULL,
  url TEXT NOT NULL,
  model_used TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES (IDEMPOTENT)
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Generated content indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON public.generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON public.generated_content(type);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (ENABLE IF NOT ALREADY ENABLED)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR DIRECTORCHAIR AI (IDEMPOTENT)
-- ============================================================================

-- USERS policies
DO $$
BEGIN
  -- Users can view own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'DirectorchairAI: Users can view own profile'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can view own profile" ON public.users
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = id);
  END IF;

  -- Users can update own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'DirectorchairAI: Users can update own profile'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can update own profile" ON public.users
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = id)
      WITH CHECK ((SELECT auth.uid()) = id);
  END IF;

  -- Users can insert own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'DirectorchairAI: Users can insert own profile'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can insert own profile" ON public.users
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = id);
  END IF;
END
$$;

-- GENERATED_CONTENT policies
DO $$
BEGIN
  -- Users can view own content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'DirectorchairAI: Users can view own content'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can view own content" ON public.generated_content
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can insert own content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'DirectorchairAI: Users can insert own content'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can insert own content" ON public.generated_content
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can update own content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'DirectorchairAI: Users can update own content'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can update own content" ON public.generated_content
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can delete own content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'DirectorchairAI: Users can delete own content'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can delete own content" ON public.generated_content
      FOR DELETE TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END
$$;

-- USER_SESSIONS policies
DO $$
BEGIN
  -- Users can view own sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'DirectorchairAI: Users can view own sessions'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can view own sessions" ON public.user_sessions
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can insert own sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'DirectorchairAI: Users can insert own sessions'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can insert own sessions" ON public.user_sessions
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can update own sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'DirectorchairAI: Users can update own sessions'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can update own sessions" ON public.user_sessions
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can delete own sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'DirectorchairAI: Users can delete own sessions'
  ) THEN
    CREATE POLICY "DirectorchairAI: Users can delete own sessions" ON public.user_sessions
      FOR DELETE TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END
$$;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at_directorchair'
  ) THEN
    CREATE TRIGGER update_users_updated_at_directorchair
      BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_sessions_updated_at_directorchair'
  ) THEN
    CREATE TRIGGER update_user_sessions_updated_at_directorchair
      BEFORE UPDATE ON public.user_sessions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Helper function for user creation (called automatically on auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user_directorchair()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    10  -- Start with 10 free credits
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_directorchair'
  ) THEN
    CREATE TRIGGER on_auth_user_created_directorchair
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_directorchair();
  END IF;
END
$$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'DirectorchairAI database migration completed successfully!';
  RAISE NOTICE 'Added: avatar_url and credits columns to users table';
  RAISE NOTICE 'Created: generated_content and user_sessions tables';
  RAISE NOTICE 'Applied: DirectorchairAI-specific RLS policies';
  RAISE NOTICE 'Ready for DirectorchairAI authentication and content management!';
END
$$;
