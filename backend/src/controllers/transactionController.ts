import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Obtener ganancias del artista
export const getArtistEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { period = 'all' } = req.query

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
        error: 'Solo los artistas pueden ver sus ganancias'
      })
      return
    }

    // Construir filtros de fecha según el período
    let dateFilter: any = {}
    const now = new Date()
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = {
          createdAt: {
            gte: weekAgo
          }
        }
        break
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFilter = {
          createdAt: {
            gte: monthAgo
          }
        }
        break
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        dateFilter = {
          createdAt: {
            gte: yearAgo
          }
        }
        break
      default:
        // 'all' - no filter
        break
    }

    // Obtener transacciones completadas
    const transactions = await prisma.supportTransaction.findMany({
      where: {
        artistId: artistProfile.id,
        status: 'COMPLETED',
        ...dateFilter
      },
      include: {
        supporter: {
          select: {
            name: true,
            avatar: true
          }
        },
        tier: {
          select: {
            name: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular estadísticas
    const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalTransactions = transactions.length
    const averageTransaction = totalTransactions > 0 ? totalEarnings / totalTransactions : 0

    // Agrupar por mes para gráfico
    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.createdAt).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)

    // Obtener top supporters
    const topSupporters = transactions.reduce((acc, transaction) => {
      const supporterId = transaction.supporterId
      if (!acc[supporterId]) {
        acc[supporterId] = {
          id: supporterId,
          name: transaction.supporter.name,
          avatar: transaction.supporter.avatar,
          totalAmount: 0,
          transactionCount: 0
        }
      }
      acc[supporterId].totalAmount += transaction.amount
      acc[supporterId].transactionCount += 1
      return acc
    }, {} as Record<string, any>)

    const topSupportersArray = Object.values(topSupporters)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 5)

    res.json({
      earnings: {
        total: totalEarnings,
        totalTransactions,
        averageTransaction,
        period
      },
      transactions: transactions.slice(0, 20), // Últimas 20 transacciones
      monthlyData,
      topSupporters: topSupportersArray
    })
  } catch (error) {
    console.error('Error al obtener ganancias:', error)
    res.status(500).json({
      error: 'Error al obtener ganancias'
    })
  }
}

// Obtener resumen de ganancias para el dashboard
export const getEarningsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId

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
        error: 'Solo los artistas pueden ver sus ganancias'
      })
      return
    }

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Obtener ganancias por período
    const [weeklyEarnings, monthlyEarnings, totalEarnings] = await Promise.all([
      prisma.supportTransaction.aggregate({
        where: {
          artistId: artistProfile.id,
          status: 'COMPLETED',
          createdAt: { gte: weekAgo }
        },
        _sum: { amount: true }
      }),
      prisma.supportTransaction.aggregate({
        where: {
          artistId: artistProfile.id,
          status: 'COMPLETED',
          createdAt: { gte: monthAgo }
        },
        _sum: { amount: true }
      }),
      prisma.supportTransaction.aggregate({
        where: {
          artistId: artistProfile.id,
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      })
    ])

    res.json({
      summary: {
        weekly: weeklyEarnings._sum.amount || 0,
        monthly: monthlyEarnings._sum.amount || 0,
        total: totalEarnings._sum.amount || 0
      }
    })
  } catch (error) {
    console.error('Error al obtener resumen de ganancias:', error)
    res.status(500).json({
      error: 'Error al obtener resumen de ganancias'
    })
  }
}
