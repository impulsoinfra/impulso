'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, signUp, signIn, signOut, getUserProfile, UserProfile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string, role: 'artist' | 'supporter') => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserProfile(session.user.id)
      }

      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { profile, error } = await getUserProfile(userId)
      if (!error && profile) {
        setProfile(profile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const handleSignUp = async (email: string, password: string, name: string, role: 'artist' | 'supporter') => {
    const result = await signUp(email, password, name, role)
    if (result.data?.user) {
      setUser(result.data.user)
    }
    return result
  }

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password)
    if (result.data?.user) {
      setUser(result.data.user)
      await loadUserProfile(result.data.user.id)
    }
    return result
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (!result.error) {
      setUser(null)
      setProfile(null)
      setSession(null)
    }
    return result
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile
  }

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  )
}
