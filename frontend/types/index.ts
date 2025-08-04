// Tipos principales de la aplicación

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'artist' | 'supporter' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Artist extends User {
  role: 'artist'
  bio: string
  category: string
  socialLinks: {
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
  }
  isVerified: boolean
  totalSupporters: number
  totalEarnings: number
  goal: number // Objetivo de recaudación
}

export interface Supporter extends User {
  role: 'supporter'
  supportedArtists: string[]
  totalContributed: number
}

export interface SupportTier {
  id: string
  artistId: string
  name: string
  description: string
  price: number
  benefits: string[]
  isActive: boolean
  maxSupporters?: number
  currentSupporters: number
}

export interface SupportTransaction {
  id: string
  supporterId: string
  artistId: string
  tierId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: Date
  paymentMethod: string
}

export interface Post {
  id: string
  artistId: string
  title: string
  content: string
  images?: string[]
  isExclusive: boolean
  tierRequired?: string
  createdAt: Date
  updatedAt: Date
  likes: number
  comments: Comment[]
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: Date
  user: User
}

export interface Notification {
  id: string
  userId: string
  type: 'support' | 'post' | 'comment' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  data?: Record<string, any>
}

// Tipos para formularios
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'artist' | 'supporter'
}

export interface ArtistProfileForm {
  bio: string
  category: string
  socialLinks: {
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
  }
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
} 