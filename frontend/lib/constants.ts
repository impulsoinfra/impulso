// Constantes de la aplicación

export const APP_NAME = 'Impulso'
export const APP_DESCRIPTION = 'Apoyá a quienes te inspiran'

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  ARTIST_PROFILE: '/artist/[id]',
  ARTIST_EDIT: '/artist/edit',
  DISCOVER: '/discover',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  SUPPORT: '/support',
} as const

// Categorías de artistas
export const ARTIST_CATEGORIES = [
  'Ilustración',
  'Música',
  'Fotografía',
  'Video',
  'Escritura',
  'Diseño',
  'Arte Digital',
  'Arte Tradicional',
  'Podcast',
  'Otro',
] as const

// Estados de transacciones
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  SUPPORT: 'support',
  POST: 'post',
  COMMENT: 'comment',
  SYSTEM: 'system',
} as const

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
} as const

// Configuración de validación
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_BIO_LENGTH: 500,
  MAX_POST_LENGTH: 2000,
  MAX_COMMENT_LENGTH: 500,
} as const

// Configuración de precios
export const PRICING = {
  MIN_SUPPORT_AMOUNT: 100,
  MAX_SUPPORT_AMOUNT: 100000,
  PLATFORM_FEE_PERCENTAGE: 0.05, // 5%
} as const

// Configuración de redes sociales
export const SOCIAL_LINKS = {
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
} as const

// Configuración de temas
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

// Configuración de idiomas
export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
} as const

// Configuración de monedas
export const CURRENCIES = {
  ARS: 'ARS',
  USD: 'USD',
} as const

// Configuración de zonas horarias
export const TIMEZONES = {
  ARGENTINA: 'America/Argentina/Buenos_Aires',
  UTC: 'UTC',
} as const 