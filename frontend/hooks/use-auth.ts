'use client'

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { getBrowserClient } from '@/lib/supabase-browser'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'creator' | 'supporter'
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
  signUp: (email: string, password: string, name: string, role: 'creator' | 'supporter') => Promise<{ data: any; error: any }>
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
  // Always the module-level singleton — never a per-mount instance.
  // This is what prevents refresh-token races and navigator.locks deadlocks.
  const getClient = useCallback((): SupabaseClient | null => getBrowserClient(), [])

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

    let active = true

    // Safety net: never let the app hang on the loading spinner. If getSession
    // stalls for any reason, render the app (logged-out) after a few seconds.
    const failsafe = setTimeout(() => {
      if (active) setLoading(false)
    }, 8000)

    // Load the initial session. The .then runs after the auth lock is
    // released, so awaiting a Supabase query (loadUserProfile) here is safe.
    client.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) await loadUserProfile(session.user.id)
      if (active) setLoading(false)
    }).catch(() => { if (active) setLoading(false) })

    // Listen for auth changes (token refresh, sign in/out, etc.)
    //
    // CRITICAL: this callback runs while GoTrueClient holds its auth lock.
    // It MUST stay synchronous — never `await`, and never call any Supabase
    // method (getSession, queries, etc.) directly inside it. Doing so
    // deadlocks the lock (the query needs the lock the callback is holding),
    // which freezes getSession forever and looks like "session lost on
    // refresh". So: update state synchronously and defer DB work to a
    // macrotask that runs after the lock is released.
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          const uid = session.user.id
          setTimeout(() => { if (active) loadUserProfile(uid) }, 0)
        } else if (event === 'SIGNED_OUT') {
          // Only clear profile on explicit sign-out, not on TOKEN_REFRESHED
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      active = false
      clearTimeout(failsafe)
      subscription.unsubscribe()
    }
  }, [isClient, getClient, loadUserProfile])

  const handleSignUp = useCallback(async (
    email: string, password: string, name: string, role: 'creator' | 'supporter'
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
      // Set state synchronously so the login page's redirect to /dashboard
      // sees `user` immediately (ProtectedRoute would otherwise bounce back).
      // Don't await the profile — it loads via onAuthStateChange / in the bg.
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
      }
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
