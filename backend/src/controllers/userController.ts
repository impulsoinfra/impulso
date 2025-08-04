import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Obtener perfil del usuario
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      })
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
      return res.status(404).json({
        error: 'Usuario no encontrado'
      })
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
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    const { name, avatar } = req.body

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      })
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