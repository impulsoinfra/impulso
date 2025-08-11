// Servicios para consumir las APIs del backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Tipos para las respuestas de la API
export interface Artist {
  id: string
  name: string
  category: string
  avatar: string
  bio: string
  isVerified: boolean
  totalSupporters: number
  totalEarnings: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface UserStats {
  daysAsMember: number
  lastLogin: string
  status: string
  totalSupporters: number
  totalPosts: number
  totalEarnings: number
  totalFollowing: number
  totalFollowers: number
}

// Función helper para hacer requests
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// API de Artistas
export const artistsApi = {
  // Obtener artistas con filtros y paginación
  getArtists: async (params: {
    search?: string
    category?: string
    sortBy?: string
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<Artist>> => {
    const searchParams = new URLSearchParams()
    
    if (params.search) searchParams.append('search', params.search)
    if (params.category) searchParams.append('category', params.category)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    
    const queryString = searchParams.toString()
    const endpoint = `/api/artists${queryString ? `?${queryString}` : ''}`
    
    return apiRequest<PaginatedResponse<Artist>>(endpoint)
  },

  // Obtener artista por ID
  getArtistById: async (id: string): Promise<{ artist: Artist }> => {
    return apiRequest<{ artist: Artist }>(`/api/artists/${id}`)
  }
}

// API de Usuarios
export const usersApi = {
  // Obtener estadísticas del usuario
  getUserStats: async (): Promise<{ stats: UserStats }> => {
    return apiRequest<{ stats: UserStats }>('/api/users/stats', {
      credentials: 'include'
    })
  },

  // Obtener perfil del usuario
  getUserProfile: async (): Promise<{ user: any }> => {
    return apiRequest<{ user: any }>('/api/users/profile', {
      credentials: 'include'
    })
  }
}

// API de Autenticación
export const authApi = {
  // Registrar usuario
  signUp: async (data: {
    email: string
    password: string
    name: string
    role: 'artist' | 'supporter'
  }): Promise<any> => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Iniciar sesión
  signIn: async (data: {
    email: string
    password: string
  }): Promise<any> => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Cerrar sesión
  signOut: async (): Promise<any> => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  }
}

// API de Posts
export const postsApi = {
  // Crear nueva publicación
  createPost: async (data: {
    title: string
    content: string
    images?: string[]
    isExclusive?: boolean
    tierRequired?: string
  }): Promise<any> => {
    return apiRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include'
    })
  },

  // Obtener publicaciones del artista
  getMyPosts: async (params: {
    page?: number
    limit?: number
  } = {}): Promise<any> => {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    
    const queryString = searchParams.toString()
    const endpoint = `/api/posts/my-posts${queryString ? `?${queryString}` : ''}`
    
    return apiRequest(endpoint, {
      credentials: 'include'
    })
  },

  // Eliminar publicación
  deletePost: async (id: string): Promise<any> => {
    return apiRequest(`/api/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
  }
}

// API de Transacciones
export const transactionsApi = {
  // Obtener ganancias del artista
  getArtistEarnings: async (params: {
    period?: 'week' | 'month' | 'year' | 'all'
  } = {}): Promise<any> => {
    const searchParams = new URLSearchParams()
    
    if (params.period) searchParams.append('period', params.period)
    
    const queryString = searchParams.toString()
    const endpoint = `/api/transactions/earnings${queryString ? `?${queryString}` : ''}`
    
    return apiRequest(endpoint, {
      credentials: 'include'
    })
  },

  // Obtener resumen de ganancias para dashboard
  getEarningsSummary: async (): Promise<any> => {
    return apiRequest('/api/transactions/earnings-summary', {
      credentials: 'include'
    })
  }
}
