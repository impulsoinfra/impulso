import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const { data, error } = await supabase.auth.signUp({
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
    const { data, error } = await supabase.auth.signInWithPassword({
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
    const { error } = await supabase.auth.signOut()
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
    const { data: { user }, error } = await supabase.auth.getUser()
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
