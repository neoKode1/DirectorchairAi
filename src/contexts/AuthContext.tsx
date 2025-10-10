'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          console.log('Initial session loaded:', session?.user?.email || 'No user')
        }
      } catch (error) {
        console.error('Failed to get initial session:', error)
        setSession(null)
        setUser(null)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        switch (event) {
          case 'SIGNED_IN':
            setSession(session)
            setUser(session?.user ?? null)
            console.log('User signed in:', session?.user?.email)
            break
          case 'SIGNED_OUT':
            setSession(null)
            setUser(null)
            console.log('User signed out')
            break
          case 'TOKEN_REFRESHED':
            setSession(session)
            setUser(session?.user ?? null)
            console.log('Token refreshed for:', session?.user?.email)
            break
          case 'USER_UPDATED':
            setSession(session)
            setUser(session?.user ?? null)
            console.log('User updated:', session?.user?.email)
            break
          default:
            setSession(session)
            setUser(session?.user ?? null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      })
      return { error }
    } catch (error) {
      console.error('Sign up error:', error)
      return { 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } as AuthError 
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (data.session) {
        console.log('Sign in successful, session created')
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      }
      
      return { error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } as AuthError 
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      return { error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } as AuthError 
      }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
