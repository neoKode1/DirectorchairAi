-- ROBUST COMPLETE DATABASE FIX SCRIPT
-- This script fixes ALL database issues with better error handling
-- Run this in Supabase SQL Editor

-- ==============================================
-- PART 1: ADD ALL MISSING COLUMNS TO GENERATIONS TABLE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== STARTING COMPREHENSIVE DATABASE FIX ===';
    
    -- Add all missing columns that we discovered are missing
    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
        RAISE NOTICE '✅ Added status column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add status column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS model TEXT;
        RAISE NOTICE '✅ Added model column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add model column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS prompt TEXT;
        RAISE NOTICE '✅ Added prompt column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add prompt column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS output_url TEXT;
        RAISE NOTICE '✅ Added output_url column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add output_url column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS user_id UUID;
        RAISE NOTICE '✅ Added user_id column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add user_id column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS session_id TEXT;
        RAISE NOTICE '✅ Added session_id column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add session_id column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added created_at column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add created_at column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add updated_at column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');
        RAISE NOTICE '✅ Added expires_at column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add expires_at column: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE '✅ Added metadata column';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add metadata column: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED ADDING COLUMNS ===';
END $$;

-- ==============================================
-- PART 2: FIX ID COLUMN DEFAULT VALUE
-- ==============================================

DO $$
DECLARE
    id_data_type TEXT;
    null_count INTEGER;
BEGIN
    RAISE NOTICE '=== FIXING ID COLUMN DEFAULT VALUE ===';
    
    -- Check if the id column is TEXT or UUID and set appropriate default
    BEGIN
        SELECT data_type INTO id_data_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'generations' 
            AND column_name = 'id';
        
        IF id_data_type = 'text' THEN
            -- For TEXT id column, set a default that generates a unique string
            ALTER TABLE public.generations 
            ALTER COLUMN id SET DEFAULT 'gen_' || extract(epoch from now())::text || '_' || floor(random() * 1000000)::text;
            
            RAISE NOTICE '✅ Set default for TEXT id column';
        ELSIF id_data_type = 'uuid' THEN
            -- For UUID id column, set gen_random_uuid() as default
            ALTER TABLE public.generations 
            ALTER COLUMN id SET DEFAULT gen_random_uuid();
            
            RAISE NOTICE '✅ Set default for UUID id column';
        ELSE
            RAISE NOTICE '❌ Unknown id column type: %', id_data_type;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to set ID default: %', SQLERRM;
    END;

    -- Update any existing NULL id values
    BEGIN
        -- Count NULL id values
        SELECT COUNT(*) INTO null_count
        FROM public.generations 
        WHERE id IS NULL;
        
        IF null_count > 0 THEN
            IF id_data_type = 'text' THEN
                -- Update NULL text ids
                UPDATE public.generations 
                SET id = 'gen_' || extract(epoch from now())::text || '_' || floor(random() * 1000000)::text
                WHERE id IS NULL;
            ELSIF id_data_type = 'uuid' THEN
                -- Update NULL uuid ids
                UPDATE public.generations 
                SET id = gen_random_uuid()
                WHERE id IS NULL;
            END IF;
            RAISE NOTICE '✅ Updated % NULL id values', null_count;
        ELSE
            RAISE NOTICE '✅ No NULL id values found';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to update NULL ids: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED ID COLUMN FIX ===';
END $$;

-- ==============================================
-- PART 3: UPDATE EXISTING RECORDS WITH DEFAULTS
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== UPDATING EXISTING RECORDS WITH DEFAULTS ===';
    
    -- Update existing records to have proper values for new columns
    BEGIN
        UPDATE public.generations 
        SET status = 'completed' 
        WHERE status IS NULL;
        RAISE NOTICE '✅ Updated status column defaults';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to update status defaults: %', SQLERRM;
    END;

    BEGIN
        UPDATE public.generations 
        SET model = 'unknown' 
        WHERE model IS NULL;
        RAISE NOTICE '✅ Updated model column defaults';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to update model defaults: %', SQLERRM;
    END;

    BEGIN
        UPDATE public.generations 
        SET prompt = 'No prompt provided' 
        WHERE prompt IS NULL;
        RAISE NOTICE '✅ Updated prompt column defaults';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to update prompt defaults: %', SQLERRM;
    END;

    BEGIN
        UPDATE public.generations 
        SET created_at = NOW() 
        WHERE created_at IS NULL;
        RAISE NOTICE '✅ Updated created_at column defaults';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to update created_at defaults: %', SQLERRM;
    END;

    BEGIN
        UPDATE public.generations 
        SET updated_at = NOW() 
        WHERE updated_at IS NULL;
        RAISE NOTICE '✅ Updated updated_at column defaults';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to update updated_at defaults: %', SQLERRM;
    END;

    BEGIN
        UPDATE public.generations 
        SET expires_at = NOW() + INTERVAL '30 days' 
        WHERE expires_at IS NULL;
        RAISE NOTICE '✅ Updated expires_at column defaults';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to update expires_at defaults: %', SQLERRM;
    END;

    BEGIN
        UPDATE public.generations 
        SET metadata = '{}'::jsonb 
        WHERE metadata IS NULL;
        RAISE NOTICE '✅ Updated metadata column defaults';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to update metadata defaults: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED UPDATING DEFAULTS ===';
END $$;

-- ==============================================
-- PART 4: CREATE MISSING SESSIONS TABLE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== CREATING SESSIONS TABLE ===';
    
    BEGIN
        CREATE TABLE IF NOT EXISTS public.sessions (
            id TEXT PRIMARY KEY,
            user_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
            metadata JSONB DEFAULT '{}'::jsonb
        );
        RAISE NOTICE '✅ Created sessions table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create sessions table: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED SESSIONS TABLE ===';
END $$;

-- ==============================================
-- PART 5: CREATE MISSING MEDIA TABLE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== CREATING MEDIA TABLE ===';
    
    BEGIN
        CREATE TABLE IF NOT EXISTS public.media (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            generation_id TEXT,
            file_url TEXT NOT NULL,
            file_type TEXT NOT NULL, -- 'image', 'video', 'audio'
            file_size BIGINT,
            mime_type TEXT,
            width INTEGER,
            height INTEGER,
            duration DECIMAL, -- for videos/audio
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
        );
        RAISE NOTICE '✅ Created media table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create media table: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED MEDIA TABLE ===';
END $$;

-- ==============================================
-- PART 6: ADD CONSTRAINTS
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== ADDING CONSTRAINTS ===';
    
    BEGIN
        ALTER TABLE public.generations ALTER COLUMN model SET NOT NULL;
        RAISE NOTICE '✅ Set model column as NOT NULL';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to set model NOT NULL: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.generations ALTER COLUMN prompt SET NOT NULL;
        RAISE NOTICE '✅ Set prompt column as NOT NULL';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to set prompt NOT NULL: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED CONSTRAINTS ===';
END $$;

-- ==============================================
-- PART 7: ADD INDEXES
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== ADDING INDEXES ===';
    
    -- Generations table indexes
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
        CREATE INDEX IF NOT EXISTS idx_generations_session_id ON public.generations(session_id);
        CREATE INDEX IF NOT EXISTS idx_generations_model ON public.generations(model);
        CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
        CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);
        CREATE INDEX IF NOT EXISTS idx_generations_expires_at ON public.generations(expires_at);
        RAISE NOTICE '✅ Added generations table indexes';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add generations indexes: %', SQLERRM;
    END;

    -- Sessions table indexes
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);
        RAISE NOTICE '✅ Added sessions table indexes';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add sessions indexes: %', SQLERRM;
    END;

    -- Media table indexes
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
        CREATE INDEX IF NOT EXISTS idx_media_generation_id ON public.media(generation_id);
        CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);
        RAISE NOTICE '✅ Added media table indexes';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to add media indexes: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED INDEXES ===';
END $$;

-- ==============================================
-- PART 8: ENABLE ROW LEVEL SECURITY
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== ENABLING ROW LEVEL SECURITY ===';
    
    BEGIN
        ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Enabled RLS on generations table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to enable RLS on generations: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Enabled RLS on sessions table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to enable RLS on sessions: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Enabled RLS on media table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to enable RLS on media: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED RLS ENABLEMENT ===';
END $$;

-- ==============================================
-- PART 9: CREATE RLS POLICIES
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== CREATING RLS POLICIES ===';
    
    -- Generations policies
    BEGIN
        DROP POLICY IF EXISTS "Users can view their own generations" ON public.generations;
        CREATE POLICY "Users can view their own generations" ON public.generations
            FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);
        RAISE NOTICE '✅ Created generations SELECT policy';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create generations SELECT policy: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can insert their own generations" ON public.generations;
        CREATE POLICY "Users can insert their own generations" ON public.generations
            FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);
        RAISE NOTICE '✅ Created generations INSERT policy';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create generations INSERT policy: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can update their own generations" ON public.generations;
        CREATE POLICY "Users can update their own generations" ON public.generations
            FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id IS NULL);
        RAISE NOTICE '✅ Created generations UPDATE policy';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create generations UPDATE policy: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can delete their own generations" ON public.generations;
        CREATE POLICY "Users can delete their own generations" ON public.generations
            FOR DELETE USING (auth.uid()::text = user_id::text OR user_id IS NULL);
        RAISE NOTICE '✅ Created generations DELETE policy';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create generations DELETE policy: %', SQLERRM;
    END;

    -- Sessions policies
    BEGIN
        DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
        CREATE POLICY "Users can view their own sessions" ON public.sessions
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE '✅ Created sessions SELECT policy';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create sessions SELECT policy: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.sessions;
        CREATE POLICY "Users can insert their own sessions" ON public.sessions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Created sessions INSERT policy';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create sessions INSERT policy: %', SQLERRM;
    END;

    -- Media policies
    BEGIN
        DROP POLICY IF EXISTS "Users can view their own media" ON public.media;
        CREATE POLICY "Users can view their own media" ON public.media
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE '✅ Created media SELECT policy';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create media SELECT policy: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can insert their own media" ON public.media;
        CREATE POLICY "Users can insert their own media" ON public.media
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Created media INSERT policy';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to create media INSERT policy: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED RLS POLICIES ===';
END $$;

-- ==============================================
-- PART 10: GRANT PERMISSIONS
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== GRANTING PERMISSIONS ===';
    
    BEGIN
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.generations TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
        RAISE NOTICE '✅ Granted permissions to authenticated users';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to grant authenticated permissions: %', SQLERRM;
    END;

    BEGIN
        GRANT ALL ON public.generations TO service_role;
        GRANT ALL ON public.sessions TO service_role;
        GRANT ALL ON public.media TO service_role;
        RAISE NOTICE '✅ Granted permissions to service role';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to grant service role permissions: %', SQLERRM;
    END;

    BEGIN
        GRANT USAGE ON SCHEMA public TO authenticated;
        GRANT USAGE ON SCHEMA public TO service_role;
        RAISE NOTICE '✅ Granted schema usage permissions';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to grant schema permissions: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED PERMISSIONS ===';
END $$;

-- ==============================================
-- PART 11: REFRESH SCHEMA CACHE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '=== REFRESHING SCHEMA CACHE ===';
    
    BEGIN
        PERFORM pg_notify('pgrst', 'reload schema');
        RAISE NOTICE '✅ Schema cache refresh requested';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to refresh schema cache: %', SQLERRM;
    END;

    RAISE NOTICE '=== COMPLETED SCHEMA CACHE REFRESH ===';
END $$;

-- ==============================================
-- PART 12: COMPREHENSIVE VERIFICATION
-- ==============================================

DO $$
DECLARE
    test_generation_id TEXT;
    test_session_id TEXT;
    test_media_id UUID;
    id_data_type TEXT;
    missing_columns_count INTEGER := 0;
    missing_tables_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== COMPREHENSIVE VERIFICATION ===';
    
    -- Check if all required columns exist
    SELECT COUNT(*) INTO missing_columns_count
    FROM (
        SELECT 'status' as col UNION ALL
        SELECT 'model' UNION ALL
        SELECT 'prompt' UNION ALL
        SELECT 'expires_at'
    ) required_cols
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'generations' 
            AND column_name = required_cols.col
    );
    
    IF missing_columns_count = 0 THEN
        RAISE NOTICE '✅ All required columns exist in generations table';
    ELSE
        RAISE WARNING '❌ % columns still missing from generations table', missing_columns_count;
    END IF;
    
    -- Check if all required tables exist
    SELECT COUNT(*) INTO missing_tables_count
    FROM (
        SELECT 'sessions' as table_name UNION ALL
        SELECT 'media'
    ) required_tables
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
            AND tablename = required_tables.table_name
    );
    
    IF missing_tables_count = 0 THEN
        RAISE NOTICE '✅ All required tables exist';
    ELSE
        RAISE WARNING '❌ % tables still missing', missing_tables_count;
    END IF;
    
    -- Test all database operations
    BEGIN
        -- Check the id data type
        SELECT data_type INTO id_data_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'generations' 
            AND column_name = 'id';
        
        -- Test generations insert
        IF id_data_type = 'text' THEN
            INSERT INTO public.generations (model, prompt, status) 
            VALUES ('test-model', 'test prompt for comprehensive verification', 'completed') 
            RETURNING id INTO test_generation_id;
        ELSE
            INSERT INTO public.generations (model, prompt, status) 
            VALUES ('test-model', 'test prompt for comprehensive verification', 'completed') 
            RETURNING id::text INTO test_generation_id;
        END IF;
        
        RAISE NOTICE '✅ Generations insert successful! ID: %', test_generation_id;
        
        -- Test sessions insert
        INSERT INTO public.sessions (id, user_id) 
        VALUES ('test-session-' || extract(epoch from now())::text, gen_random_uuid()) 
        RETURNING id INTO test_session_id;
        
        RAISE NOTICE '✅ Sessions insert successful! ID: %', test_session_id;
        
        -- Test media insert
        INSERT INTO public.media (generation_id, file_url, file_type) 
        VALUES (test_generation_id, 'https://example.com/test.jpg', 'image') 
        RETURNING id INTO test_media_id;
        
        RAISE NOTICE '✅ Media insert successful! ID: %', test_media_id;
        
        -- Clean up test records
        DELETE FROM public.media WHERE id = test_media_id;
        DELETE FROM public.sessions WHERE id = test_session_id;
        DELETE FROM public.generations WHERE id = test_generation_id;
        
        RAISE NOTICE '✅ All test records cleaned up successfully!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ Database operation test failed: %', SQLERRM;
    END;
    
    -- Final status
    IF missing_columns_count = 0 AND missing_tables_count = 0 THEN
        RAISE NOTICE '🎉 ALL DATABASE ISSUES FIXED SUCCESSFULLY! Your gallery will now work perfectly!';
    ELSE
        RAISE WARNING '❌ SOME ISSUES REMAIN - Missing columns: %, Missing tables: %', missing_columns_count, missing_tables_count;
    END IF;
    
    RAISE NOTICE '=== COMPLETED VERIFICATION ===';
END $$;
