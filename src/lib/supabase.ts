import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  credits: number
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface GeneratedContent {
  id: string
  user_id: string
  type: 'image' | 'video' | 'audio'
  prompt: string
  url: string
  model_used: string
  metadata?: Record<string, any>
  created_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_data: Record<string, any>
  created_at: string
  updated_at: string
}

// Auth helpers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/timeline`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helpers
export const createUserProfile = async (user: {
  id: string
  email: string
  name?: string
  avatar_url?: string
}) => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        credits: 10, // Free tier starts with 10 credits
        subscription_tier: 'free'
      }
    ])
    .select()
    .single()

  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

export const updateUserCredits = async (userId: string, credits: number) => {
  const { data, error } = await supabase
    .from('users')
    .update({ credits, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

export const saveGeneratedContent = async (content: Omit<GeneratedContent, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('generated_content')
    .insert([content])
    .select()
    .single()

  return { data, error }
}

export const getUserContent = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export const deleteUserContent = async (contentId: string, userId: string) => {
  const { data, error } = await supabase
    .from('generated_content')
    .delete()
    .eq('id', contentId)
    .eq('user_id', userId)

  return { data, error }
}

export const saveUserSession = async (userId: string, sessionData: Record<string, any>) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .upsert([
      {
        user_id: userId,
        session_data: sessionData,
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  return { data, error }
}

export const getUserSession = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}
