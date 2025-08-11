// Funciones de validación para el backend

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar contraseña
export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

// Validar nombre
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100
}

// Validar rol
export function isValidRole(role: string): boolean {
  return ['artist', 'supporter'].includes(role)
}

// Validar categoría de artista
export function isValidArtistCategory(category: string): boolean {
  const validCategories = [
    'Ilustración',
    'Música',
    'Fotografía',
    'Video',
    'Escritura',
    'Diseño',
    'Arte Digital',
    'Pintura',
    'Escultura',
    'Otros'
  ]
  return validCategories.includes(category)
}

// Validar bio
export function isValidBio(bio: string): boolean {
  return bio.trim().length >= 10 && bio.trim().length <= 500
}

// Validar URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validar monto monetario
export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000
}

// Validar ID de MongoDB/Prisma
export function isValidId(id: string): boolean {
  return Boolean(id && id.trim().length > 0)
}

// Sanitizar texto para prevenir XSS
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Validar parámetros de paginación
export function validatePaginationParams(page: string, limit: string): { page: number; limit: number } {
  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 12
  
  return {
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum))
  }
}

// Validar parámetros de búsqueda
export function validateSearchParams(search: string): string {
  return search ? search.trim().slice(0, 100) : ''
}

// Validar parámetros de ordenamiento
export function validateSortParams(sortBy: string): string {
  const validSortOptions = ['popular', 'earnings', 'name', 'recent']
  return validSortOptions.includes(sortBy) ? sortBy : 'popular'
}
