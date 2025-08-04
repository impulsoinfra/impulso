import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Crear una transacción de apoyo
export const createSupport = async (req: Request, res: Response) => {
  try {
    const { artistId, amount, tierId } = req.body
    const supporterId = req.user?.userId

    if (!supporterId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      })
    }

    // Crear transacción de apoyo
    const supportTransaction = await prisma.supportTransaction.create({
      data: {
        supporterId,
        artistId,
        tierId,
        amount: parseFloat(amount),
        status: 'PENDING',
        paymentMethod: 'mercadopago'
      }
    })

    res.status(201).json({
      message: 'Apoyo creado exitosamente',
      transaction: supportTransaction
    })
  } catch (error) {
    console.error('Error al crear apoyo:', error)
    res.status(500).json({
      error: 'Error al procesar el apoyo'
    })
  }
}

// Obtener historial de apoyos del usuario
export const getSupportHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      })
    }

    const history = await prisma.supportTransaction.findMany({
      where: {
        supporterId: userId
      },
      include: {
        tier: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      history
    })
  } catch (error) {
    console.error('Error al obtener historial:', error)
    res.status(500).json({
      error: 'Error al obtener historial'
    })
  }
} 