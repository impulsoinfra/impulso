import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Variable para almacenar el cliente de Supabase (singleton)
let supabaseClient: SupabaseClient | null = null

// Función helper para obtener las variables de entorno en tiempo de ejecución
function getEnvVars() {
  // Leer las variables de entorno en tiempo de ejecución
  // Esto es importante porque en Next.js las variables pueden no estar disponibles
  // durante el build o en ciertos contextos de SSR
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return { url, key }
}

// Función helper para validar y crear el cliente de Supabase
function createSupabaseClient(): SupabaseClient {
  // Si el cliente ya existe, retornarlo
  if (supabaseClient) {
    return supabaseClient
  }

  // Obtener las variables de entorno en tiempo de ejecución
  const { url: supabaseUrl, key: supabaseAnonKey } = getEnvVars()

  // Validar que las variables estén disponibles
  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = []
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    const isProduction = process.env.NODE_ENV === 'production'
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isClient = typeof window !== 'undefined'
    
    // Solo mostrar errores detallados si estamos en el cliente y realmente necesitamos el cliente
    // Durante SSR/build, las variables pueden no estar disponibles pero eso está bien
    if (isClient) {
      console.error('❌ Missing Supabase environment variables:', missingVars)
      console.error('Current env values:', {
        url: supabaseUrl ? '✅ set' : '❌ missing',
        key: supabaseAnonKey ? '✅ set' : '❌ missing'
      })
      
      // Mensajes de ayuda específicos según el entorno
      if (isProduction) {
        console.error('\n🚀 PRODUCTION ENVIRONMENT DETECTED')
        console.error('💡 To fix this in production (Vercel):')
        console.error('1. Go to your Vercel project dashboard')
        console.error('2. Navigate to Settings > Environment Variables')
        console.error('3. Add the following variables:')
        console.error('   - NEXT_PUBLIC_SUPABASE_URL')
        console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
        console.error('4. Make sure to select "Production" environment')
        console.error('5. Redeploy your application after adding the variables')
        console.error('\n📋 Values can be found in:')
        console.error('   - Supabase Dashboard > Settings > API')
        console.error('   - Project URL → NEXT_PUBLIC_SUPABASE_URL')
        console.error('   - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY')
      } else if (isDevelopment) {
        console.error('\n💡 Troubleshooting tips for development:')
        console.error('1. Check that .env.local exists in the frontend directory')
        console.error('2. Verify the variables start with NEXT_PUBLIC_')
        console.error('3. Restart your Next.js dev server after adding env variables')
        console.error('4. Check that the file is not in .gitignore')
        console.error('5. Make sure you are running the dev server from the frontend directory')
      }
    }
    
    const errorMessage = isProduction
      ? `Supabase client is not available in production. Missing environment variables: ${missingVars.join(', ')}. ` +
        `Please configure these variables in your Vercel project settings (Settings > Environment Variables) ` +
        `and redeploy your application.`
      : `Supabase client is not available. Missing environment variables: ${missingVars.join(', ')}. ` +
        `Please check your .env.local file and ensure these variables are set. ` +
        `Make sure to restart your Next.js dev server after adding environment variables.`
    
    throw new Error(errorMessage)
  }

  // Crear el cliente y almacenarlo
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Función helper para obtener el cliente de Supabase de manera segura
function getSupabaseClient(): SupabaseClient {
  // Si el cliente ya existe, retornarlo
  if (supabaseClient) {
    return supabaseClient
  }
  
  // Intentar crear el cliente - esto lanzará un error descriptivo si las variables no están disponibles
  return createSupabaseClient()
}

// Exportar el cliente (lazy initialization)
// Se crea la primera vez que se accede, leyendo las variables en tiempo de ejecución
// No lanzamos errores aquí porque las variables pueden no estar disponibles durante SSR/build
// pero sí estarán disponibles en el cliente cuando se necesiten
export const supabase: SupabaseClient | null = (() => {
  // Solo intentar crear el cliente si estamos en el cliente y las variables están disponibles
  if (typeof window === 'undefined') {
    // En el servidor, retornar null - el cliente se creará cuando sea necesario
    return null
  }
  
  try {
    const { url, key } = getEnvVars()
    if (url && key) {
      return createSupabaseClient()
    }
    // Si no hay variables, retornar null sin error - se creará más tarde si es necesario
    return null
  } catch (error) {
    // No lanzar error aquí, solo retornar null
    // El cliente se creará más tarde cuando se necesite y las variables estén disponibles
    return null
  }
})()

// Tipos para el usuario
export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'creator' | 'supporter'
  created_at: string
  updated_at: string
}

// Función para registrar un nuevo usuario
export async function signUp(email: string, password: string, name: string, role: 'creator' | 'supporter') {
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
