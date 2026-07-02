'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Heart, Loader2, CheckCircle } from 'lucide-react'
import { PRICING } from '@/lib/constants'

const PRESETS = [500, 1000, 2000]

interface ImpulsarButtonProps {
  creatorId: string
  creatorName: string
  creatorUsername: string
  postId?: string
  postTitle?: string | null
  /** Visual variants: 'post' = compact ghost button, 'primary' = big filled button */
  variant?: 'post' | 'primary'
  label?: string
}

export function ImpulsarButton({
  creatorId,
  creatorName,
  creatorUsername,
  postId,
  postTitle,
  variant = 'post',
  label,
}: ImpulsarButtonProps) {
  const firstName = creatorName?.split(' ')[0] || creatorUsername

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number>(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const selectedAmount = customAmount
    ? parseInt(customAmount.replace(/\D/g, ''), 10) || 0
    : amount

  function reset() {
    setAmount(1000)
    setCustomAmount('')
    setMessage('')
    setLoading(false)
    setDone(false)
    setError('')
  }

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setTimeout(reset, 200)
  }

  async function handleImpulsar() {
    setError('')
    if (selectedAmount < PRICING.MIN_SUPPORT_AMOUNT) {
      setError(`El monto mínimo es $${PRICING.MIN_SUPPORT_AMOUNT}.`)
      return
    }
    if (selectedAmount > PRICING.MAX_SUPPORT_AMOUNT) {
      setError(`El monto máximo es $${PRICING.MAX_SUPPORT_AMOUNT.toLocaleString('es-AR')}.`)
      return
    }
    setLoading(true)
    try {
      // TODO(mercadopago): create a Checkout Pro preference on the backend and
      // redirect to init_point. Payload ready to send:
      //   { creatorId, postId, amount: selectedAmount, message }
      // The webhook then records the donation and adds it to the active goal.
      await new Promise((r) => setTimeout(r, 700)) // simulate request
      setDone(true)
    } catch {
      setError('No se pudo iniciar el impulso. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {variant === 'primary' ? (
        <Button
          size="lg"
          onClick={() => setOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-8 gap-2"
        >
          <Heart className="w-4 h-4" />
          {label ?? `Apoyar a ${firstName}`}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <Heart className="w-3.5 h-3.5" />
          {label ?? 'Impulsar'}
        </Button>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          {done ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">¡Gracias por tu impulso!</h3>
              <p className="text-gray-500 text-sm">
                Estás por apoyar a {firstName} con{' '}
                <span className="font-semibold text-rose-600">
                  ${selectedAmount.toLocaleString('es-AR')}
                </span>
                . El pago con MercadoPago se habilita muy pronto — te vamos a avisar.
              </p>
              <Button
                onClick={() => onOpenChange(false)}
                className="mt-5 w-full bg-rose-600 hover:bg-rose-700 text-white"
              >
                Listo
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" />
                  Impulsar a {firstName}
                </DialogTitle>
                <DialogDescription>
                  {postTitle
                    ? `Apoyá esta publicación: "${postTitle}"`
                    : `Apoyá el trabajo de ${firstName} con el monto que quieras.`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Elegí un monto (ARS)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map((p) => {
                      const active = !customAmount && amount === p
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { setAmount(p); setCustomAmount('') }}
                          className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${
                            active
                              ? 'border-rose-600 bg-rose-50 text-rose-700'
                              : 'border-gray-200 text-gray-700 hover:border-rose-300'
                          }`}
                        >
                          ${p.toLocaleString('es-AR')}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="custom-amount">Otro monto</Label>
                  <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-200">
                    <span className="px-3 text-gray-400 bg-gray-50 border-r h-11 flex items-center">$</span>
                    <input
                      id="custom-amount"
                      inputMode="numeric"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ingresá otro monto"
                      className="flex-1 px-3 h-11 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="impulso-msg">Mensaje (opcional)</Label>
                  <Textarea
                    id="impulso-msg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Dejale un mensaje a ${firstName}...`}
                    rows={2}
                    maxLength={280}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <Button
                onClick={handleImpulsar}
                disabled={loading || selectedAmount <= 0}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2 h-11"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                Impulsar ${selectedAmount > 0 ? selectedAmount.toLocaleString('es-AR') : '0'}
              </Button>
              <p className="text-center text-xs text-gray-400 -mt-1">
                Pago seguro con MercadoPago · {firstName} recibe el 90%
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
