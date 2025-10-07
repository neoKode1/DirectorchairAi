'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, signInWithEmail, signUpWithEmail, signOut } from '@/lib/supabase'
import { db } from '@/lib/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Migrate session data to user account when user signs in
      if (event === 'SIGNED_IN' && session?.user) {
        await db.migrateSessionToUser(session.user.id)
      }

      // Clear session data when user signs out
      if (event === 'SIGNED_OUT') {
        await db.clearSessionData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password)
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await signUpWithEmail(email, password, fullName)
    return { error }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
