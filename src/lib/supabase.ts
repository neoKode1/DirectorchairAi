// Re-export the Supabase clients from utils
export { createClient as createServerClient } from '@/utils/supabase/server'
export { createClient as createBrowserClient } from '@/utils/supabase/client'

// For backward compatibility, create a default client
import { createClient } from '@supabase/supabase-js'

// Lazy initialization of the default client
let _supabase: any = null;

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!_supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables not found. Please check your .env.local file.');
      }
      
      _supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    }
    return _supabase[prop];
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          model: string
          prompt: string
          result_data: any
          status: 'pending' | 'completed' | 'failed'
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          model: string
          prompt: string
          result_data?: any
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          model?: string
          prompt?: string
          result_data?: any
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      media_files: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          generation_id: string | null
          file_type: 'image' | 'video' | 'audio'
          file_url: string
          file_name: string
          file_size: number
          mime_type: string
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          generation_id?: string | null
          file_type: 'image' | 'video' | 'audio'
          file_url: string
          file_name: string
          file_size: number
          mime_type: string
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          generation_id?: string | null
          file_type?: 'image' | 'video' | 'audio'
          file_url?: string
          file_name?: string
          file_size?: number
          mime_type?: string
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
    }
  }
}

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const getExpirationDate = (hours: number = 72) => {
  const now = new Date()
  now.setHours(now.getHours() + hours)
  return now.toISOString()
}
