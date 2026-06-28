'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, TrendingUp, Users, Calendar, Loader2 } from 'lucide-react'
import { transactionsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface EarningsData {
  earnings: {
    total: number
    totalTransactions: number
    averageTransaction: number
    period: string
  }
  transactions: Array<{
    id: string
    amount: number
    createdAt: string
    supporter: {
      name: string
      avatar: string
    }
    tier?: {
      name: string
      price: number
    }
  }>
  monthlyData: Record<string, number>
  topSupporters: Array<{
    id: string
    name: string
    avatar: string
    totalAmount: number
    transactionCount: number
  }>
}

export function EarningsCard() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const [error, setError] = useState<string | null>(null)

  const fetchEarnings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await transactionsApi.getArtistEarnings({ period })
      setEarningsData(data)
    } catch (err) {
      setError('Error al cargar ganancias')
      console.error('Error fetching earnings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [period])

  if (loading && !earningsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ganancias
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ganancias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={fetchEarnings} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!earningsData) return null

  const { earnings, transactions, topSupporters } = earningsData

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ganancias
            </CardTitle>
            <CardDescription>
              Resumen de tus ingresos y transacciones
            </CardDescription>
          </div>
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-rose-50 rounded-lg">
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(earnings.total)}
            </div>
            <p className="text-sm text-gray-600">Total {period === 'week' ? 'semanal' : period === 'month' ? 'mensual' : period === 'year' ? 'anual' : 'general'}</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {earnings.totalTransactions}
            </div>
            <p className="text-sm text-gray-600">Transacciones</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(earnings.averageTransaction)}
            </div>
            <p className="text-sm text-gray-600">Promedio por transacción</p>
          </div>
        </div>

        {/* Top Supporters */}
        {topSupporters.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Principales Apoyadores
            </h4>
            <div className="space-y-2">
              {topSupporters.map((supporter) => (
                <div key={supporter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-rose-600">
                        {supporter.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{supporter.name}</p>
                      <p className="text-sm text-gray-500">
                        {supporter.transactionCount} {supporter.transactionCount === 1 ? 'apoyo' : 'apoyos'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(supporter.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transacciones recientes */}
        {transactions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Transacciones Recientes
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {transaction.supporter.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.supporter.name}</p>
                      {transaction.tier && (
                        <p className="text-sm text-gray-500">{transaction.tier.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay transacciones en este período</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
