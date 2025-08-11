import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { isValidId, sanitizeText } from '../utils/validation'

const prisma = new PrismaClient()

// Crear una nueva publicación
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { title, content, images, isExclusive, tierRequired } = req.body

    if (!userId) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      })
      return
    }

    // Verificar que el usuario sea artista
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId }
    })

    if (!artistProfile) {
      res.status(403).json({
        error: 'Solo los artistas pueden crear publicaciones'
      })
      return
    }

    // Validar y sanitizar datos
    if (!title || title.trim().length < 3 || title.trim().length > 100) {
      res.status(400).json({
        error: 'El título debe tener entre 3 y 100 caracteres'
      })
      return
    }

    if (!content || content.trim().length < 10 || content.trim().length > 2000) {
      res.status(400).json({
        error: 'El contenido debe tener entre 10 y 2000 caracteres'
      })
      return
    }

    // Crear la publicación
    const post = await prisma.post.create({
      data: {
        artistId: artistProfile.id,
        title: sanitizeText(title.trim()),
        content: sanitizeText(content.trim()),
        images: images || [],
        isExclusive: isExclusive || false,
        tierRequired: tierRequired || null
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    res.status(201).json({
      message: 'Publicación creada exitosamente',
      post
    })
  } catch (error) {
    console.error('Error al crear publicación:', error)
    res.status(500).json({
      error: 'Error al crear publicación'
    })
  }
}

// Obtener publicaciones del artista
export const getArtistPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { page = '1', limit = '10' } = req.query

    if (!userId) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      })
      return
    }

    // Verificar que el usuario sea artista
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId }
    })

    if (!artistProfile) {
      res.status(403).json({
        error: 'Solo los artistas pueden ver sus publicaciones'
      })
      return
    }

    const pageNum = parseInt(page as string) || 1
    const limitNum = parseInt(limit as string) || 10
    const skip = (pageNum - 1) * limitNum

    // Obtener publicaciones con paginación
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { artistId: artistProfile.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          _count: {
            select: {
              comments: true
            }
          }
        }
      }),
      prisma.post.count({
        where: { artistId: artistProfile.id }
      })
    ])

    const totalPages = Math.ceil(total / limitNum)

    res.json({
      posts,
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
    console.error('Error al obtener publicaciones:', error)
    res.status(500).json({
      error: 'Error al obtener publicaciones'
    })
  }
}

// Eliminar publicación
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      })
      return
    }

    if (!id || !isValidId(id)) {
      res.status(400).json({
        error: 'ID de publicación inválido'
      })
      return
    }

    // Verificar que la publicación pertenezca al usuario
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!post) {
      res.status(404).json({
        error: 'Publicación no encontrada'
      })
      return
    }

    if (post.artist.userId !== userId) {
      res.status(403).json({
        error: 'No tienes permisos para eliminar esta publicación'
      })
      return
    }

    // Eliminar la publicación
    await prisma.post.delete({
      where: { id }
    })

    res.json({
      message: 'Publicación eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar publicación:', error)
    res.status(500).json({
      error: 'Error al eliminar publicación'
    })
  }
}
