import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Solo crear el cliente si las variables de entorno están disponibles
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Función helper para obtener el cliente de Supabase de manera segura
function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not available. Check your environment variables.')
  }
  return supabase
}

// Tipos para el usuario
export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'artist' | 'supporter'
  created_at: string
  updated_at: string
}

// Función para registrar un nuevo usuario
export async function signUp(email: string, password: string, name: string, role: 'artist' | 'supporter') {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    })

    if (error) {
      throw error
    }

    // El perfil se crea automáticamente por el trigger de Supabase
    // No necesitamos crearlo manualmente aquí

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Función para iniciar sesión
export async function signIn(email: string, password: string) {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Función para cerrar sesión
export async function signOut() {
  try {
    const client = getSupabaseClient()
    const { error } = await client.auth.signOut()
    if (error) {
      throw error
    }
    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Función para obtener el usuario actual
export async function getCurrentUser() {
  try {
    const client = getSupabaseClient()
    const { data: { user }, error } = await client.auth.getUser()
    if (error) {
      throw error
    }
    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

// Función para obtener el perfil del usuario
export async function getUserProfile(userId: string) {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    return { profile: data, error: null }
  } catch (error) {
    return { profile: null, error }
  }
}

// Función para actualizar el perfil del usuario
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (error) {
      throw error
    }

    return { profile: data[0], error: null }
  } catch (error) {
    return { profile: null, error }
  }
}
