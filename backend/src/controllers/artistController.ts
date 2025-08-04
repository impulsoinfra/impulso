import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Obtener todos los artistas
export const getArtists = async (req: Request, res: Response) => {
  try {
    const artists = await prisma.artistProfile.findMany({
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
    })

    res.json({ artists })
  } catch (error) {
    console.error('Error al obtener artistas:', error)
    res.status(500).json({
      error: 'Error al obtener artistas'
    })
  }
}

// Obtener artista por ID
export const getArtistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

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
      return res.status(404).json({
        error: 'Artista no encontrado'
      })
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
export const updateArtist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId
    const { bio, category, goal, socialLinks } = req.body

    // Verificar que el usuario sea el propietario del perfil
    const artist = await prisma.artistProfile.findUnique({
      where: { id }
    })

    if (!artist || artist.userId !== userId) {
      return res.status(403).json({
        error: 'No tienes permisos para editar este perfil'
      })
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
export const followArtist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const followerId = req.user?.userId

    if (!followerId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      })
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