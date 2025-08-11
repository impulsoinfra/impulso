import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Obtener perfil del usuario
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        artistProfile: true
      }
    })

    if (!user) {
      res.status(404).json({
        error: 'Usuario no encontrado'
      })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    res.status(500).json({
      error: 'Error al obtener perfil'
    })
  }
}

// Actualizar perfil del usuario
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { name, avatar } = req.body

    if (!userId) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      })
      return
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        avatar
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    })

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    res.status(500).json({
      error: 'Error al actualizar perfil'
    })
  }
}

// Obtener estadísticas del usuario
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        error: 'Usuario no autenticado'
      })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        artistProfile: {
          select: {
            totalSupporters: true,
            totalEarnings: true
          }
        },
        _count: {
          select: {
            following: true,
            followers: true,
            comments: true
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({
        error: 'Usuario no encontrado'
      })
      return
    }

    // Calcular días de membresía
    const now = new Date()
    const createdAt = new Date(user.createdAt)
    const daysSinceCreation = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

    // Calcular estadísticas según el rol
    let stats = {
      daysAsMember: daysSinceCreation,
      lastLogin: new Date().toISOString(),
      status: 'Activo',
      totalSupporters: 0,
      totalPosts: user._count.comments, // Usar comentarios como aproximación de actividad
      totalEarnings: 0,
      totalFollowing: user._count.following,
      totalFollowers: user._count.followers
    }

    if (user.role === 'ARTIST' && user.artistProfile) {
      stats.totalSupporters = user.artistProfile.totalSupporters || 0
      stats.totalEarnings = user.artistProfile.totalEarnings || 0
    }

    res.json({ stats })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({
      error: 'Error al obtener estadísticas'
    })
  }
} 