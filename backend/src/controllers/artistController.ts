import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { 
  validatePaginationParams, 
  validateSearchParams, 
  validateSortParams
} from '../utils/validation'

const prisma = new PrismaClient()

// Obtener todos los artistas con filtros, búsqueda y ordenamiento
export const getArtists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      search, 
      category, 
      sortBy = 'popular', 
      page = '1', 
      limit = '12' 
    } = req.query

    // Validar y sanitizar parámetros
    const { page: pageNum, limit: limitNum } = validatePaginationParams(page as string, limit as string)
    const sanitizedSearch = validateSearchParams(search as string)
    const validSortBy = validateSortParams(sortBy as string)
    
    const skip = (pageNum - 1) * limitNum

    // Construir filtros
    const where: any = {}
    
    if (sanitizedSearch) {
      where.OR = [
        { user: { name: { contains: sanitizedSearch, mode: 'insensitive' } } },
        { bio: { contains: sanitizedSearch, mode: 'insensitive' } }
      ]
    }
    
    if (category && category !== 'all') {
      where.category = category
    }

    // Construir ordenamiento
    let orderBy: any = {}
    switch (validSortBy) {
      case 'popular':
        orderBy = { totalSupporters: 'desc' }
        break
      case 'earnings':
        orderBy = { totalEarnings: 'desc' }
        break
      case 'name':
        orderBy = { user: { name: 'asc' } }
        break
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { totalSupporters: 'desc' }
    }

    // Obtener artistas con paginación
    const [artists, total] = await Promise.all([
      prisma.artistProfile.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
      prisma.artistProfile.count({ where })
    ])

    // Formatear respuesta
    const artistsWithStats = artists.map((artist) => ({
      id: artist.id,
      name: artist.user.name,
      category: artist.category,
      avatar: artist.user.avatar,
      bio: artist.bio,
      isVerified: artist.isVerified,
      totalSupporters: artist.totalSupporters,
      totalEarnings: artist.totalEarnings,
      createdAt: artist.createdAt,
      updatedAt: artist.updatedAt
    }))

    const totalPages = Math.ceil(total / limitNum)

    res.json({
      artists: artistsWithStats,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Error al obtener artistas:', error)
    res.status(500).json({
      error: 'Error al obtener artistas'
    })
  }
}

// Obtener artista por ID
export const getArtistById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({
        error: 'ID de artista requerido'
      })
      return
    }

    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        supportTiers: true,
        posts: true
      }
    })

    if (!artist) {
      res.status(404).json({
        error: 'Artista no encontrado'
      })
      return
    }

    res.json({ artist })
  } catch (error) {
    console.error('Error al obtener artista:', error)
    res.status(500).json({
      error: 'Error al obtener artista'
    })
  }
}

// Actualizar perfil de artista
export const updateArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?.userId
    const { bio, category, goal, socialLinks } = req.body

    if (!id) {
      res.status(400).json({
        error: 'ID de artista requerido'
      })
      return
    }

    if (!userId) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      })
      return
    }

    // Verificar que el usuario sea el propietario del perfil
    const artist = await prisma.artistProfile.findUnique({
      where: { id }
    })

    if (!artist || artist.userId !== userId) {
      res.status(403).json({
        error: 'No tienes permisos para editar este perfil'
      })
      return
    }

    const updatedArtist = await prisma.artistProfile.update({
      where: { id },
      data: {
        bio,
        category,
        goal,
        socialLinks
      }
    })

    res.json({
      message: 'Perfil actualizado exitosamente',
      artist: updatedArtist
    })
  } catch (error) {
    console.error('Error al actualizar artista:', error)
    res.status(500).json({
      error: 'Error al actualizar perfil'
    })
  }
}

// Seguir/dejar de seguir artista
export const followArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const followerId = req.user?.userId

    if (!id) {
      res.status(400).json({
        error: 'ID de artista requerido'
      })
      return
    }

    if (!followerId) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      })
      return
    }

    // Verificar si ya está siguiendo
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id
        }
      }
    })

    if (existingFollow) {
      // Dejar de seguir
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: id
          }
        }
      })

      res.json({
        message: 'Dejaste de seguir al artista'
      })
    } else {
      // Seguir
      await prisma.follows.create({
        data: {
          followerId,
          followingId: id
        }
      })

      res.json({
        message: 'Ahora estás siguiendo al artista'
      })
    }
  } catch (error) {
    console.error('Error al seguir artista:', error)
    res.status(500).json({
      error: 'Error al procesar la acción'
    })
  }
} 