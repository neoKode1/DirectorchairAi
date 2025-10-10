-- DirectorchairAI Database Schema for Supabase (Production-Ready, Idempotent)
-- This script can be run multiple times safely without errors
-- Designed for Supabase's managed PostgreSQL environment

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 10 CHECK (credits >= 0),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_content table
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

-- Create user_sessions table for storing user session data
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Create indexes for better performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON public.generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON public.generated_content(type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (IDEMPOTENT)
-- ============================================================================

-- USERS policies
DO $$
BEGIN
  -- Users can view own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.users
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = id);
  END IF;

  -- Users can update own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.users
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = id)
      WITH CHECK ((SELECT auth.uid()) = id);
  END IF;

  -- Users can insert own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.users
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
    WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Users can view own content'
  ) THEN
    CREATE POLICY "Users can view own content" ON public.generated_content
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can insert own content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Users can insert own content'
  ) THEN
    CREATE POLICY "Users can insert own content" ON public.generated_content
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can update own content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Users can update own content'
  ) THEN
    CREATE POLICY "Users can update own content" ON public.generated_content
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can delete own content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Users can delete own content'
  ) THEN
    CREATE POLICY "Users can delete own content" ON public.generated_content
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
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'Users can view own sessions'
  ) THEN
    CREATE POLICY "Users can view own sessions" ON public.user_sessions
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can insert own sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'Users can insert own sessions'
  ) THEN
    CREATE POLICY "Users can insert own sessions" ON public.user_sessions
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can update own sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'Users can update own sessions'
  ) THEN
    CREATE POLICY "Users can update own sessions" ON public.user_sessions
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- Users can delete own sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'Users can delete own sessions'
  ) THEN
    CREATE POLICY "Users can delete own sessions" ON public.user_sessions
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
  -- Only update if the row actually changed to avoid unnecessary writes
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_user_sessions_updated_at
      BEFORE UPDATE ON public.user_sessions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Helper function for user creation (called automatically on auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- ============================================================================
-- PERMISSIONS (SECURE DEFAULTS)
-- ============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Table permissions: read-only for anon, full access for authenticated (RLS applies)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Sequence permissions for authenticated users
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Function permissions: authenticated only
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, public;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Specific function permissions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'DirectorchairAI database schema setup completed successfully!';
  RAISE NOTICE 'Tables created: users, generated_content, user_sessions';
  RAISE NOTICE 'RLS policies: ✓ Enabled and configured';
  RAISE NOTICE 'Permissions: ✓ Secure defaults applied';
  RAISE NOTICE 'Ready for production use!';
END
$$;
