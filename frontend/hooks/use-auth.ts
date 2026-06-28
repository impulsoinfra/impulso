'use client'

import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react'
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'artist' | 'supporter'
  created_at: string
  updated_at: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  getClient: () => SupabaseClient | null
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
  const sbRef = useRef<SupabaseClient | null>(null)

  // Single Supabase client, lazily created in the browser only.
  // Exposed via context so all components share the same instance — no dual token-refresh conflicts.
  const getClient = useCallback((): SupabaseClient | null => {
    if (typeof window === 'undefined') return null
    if (!sbRef.current) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (url && key) sbRef.current = createClient(url, key)
    }
    return sbRef.current
  }, [])

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => { setIsClient(true) }, [])

  const loadUserProfile = useCallback(async (userId: string) => {
    const client = getClient()
    if (!client) return
    try {
      const { data } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) setProfile(data as UserProfile)
    } catch (err) {
      console.error('[loadUserProfile]', err)
    }
  }, [getClient])

  useEffect(() => {
    if (!isClient) return

    const client = getClient()
    if (!client) {
      setLoading(false)
      return
    }

    // Load initial session
    client.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) await loadUserProfile(session.user.id)
      setLoading(false)
    }).catch(() => setLoading(false))

    // Listen for auth changes (token refresh, sign in/out, etc.)
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          // Only clear profile on explicit sign-out, not on TOKEN_REFRESHED
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [isClient, getClient, loadUserProfile])

  const handleSignUp = useCallback(async (
    email: string, password: string, name: string, role: 'artist' | 'supporter'
  ) => {
    const client = getClient()
    if (!client) return { data: null, error: new Error('Client not available') }
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [getClient])

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const client = getClient()
    if (!client) return { data: null, error: new Error('Client not available') }
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw error
      // Don't await profile load here — onAuthStateChange handles it.
      // Awaiting here would block the login page's finally block.
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [getClient])

  const handleSignOut = useCallback(async () => {
    const client = getClient()
    if (!client) return { error: new Error('Client not available') }
    try {
      const { error } = await client.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      setSession(null)
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }, [getClient])

  const refreshProfile = useCallback(async () => {
    if (user) await loadUserProfile(user.id)
  }, [user, loadUserProfile])

  const value: AuthContextType = {
    user: isClient ? user : null,
    profile: isClient ? profile : null,
    session: isClient ? session : null,
    loading: isClient ? loading : true,
    getClient,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}
