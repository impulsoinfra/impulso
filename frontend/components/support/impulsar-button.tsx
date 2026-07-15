'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Heart, Loader2, AlertCircle } from 'lucide-react'
import { PRICING } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'

const PRESETS = [1000, 2000, 5000, 10000]

interface ImpulsarButtonProps {
  creatorId: string
  creatorName: string
  creatorUsername: string
  postId?: string
  postTitle?: string | null
  /** Whether the creator has connected MercadoPago (can receive money) */
  creatorConnected?: boolean
  /** Visual variants: 'post' = compact ghost button, 'primary' = filled button */
  variant?: 'post' | 'primary'
  label?: string
}

export function ImpulsarButton({
  creatorId,
  creatorName,
  creatorUsername,
  postId,
  postTitle,
  creatorConnected = true,
  variant = 'post',
  label,
}: ImpulsarButtonProps) {
  const firstName = creatorName?.split(' ')[0] || creatorUsername
  const { getClient } = useAuth()

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number>(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedAmount = customAmount
    ? parseInt(customAmount.replace(/\D/g, ''), 10) || 0
    : amount

  function reset() {
    setAmount(1000)
    setCustomAmount('')
    setMessage('')
    setLoading(false)
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
      // Attach the supporter's session token if logged in (optional attribution).
      let token: string | undefined
      const client = getClient()
      if (client) {
        const { data } = await client.auth.getSession()
        token = data.session?.access_token
      }
      const res = await fetch('/api/mp/preference', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ creatorId, postId, amount: selectedAmount, message }),
      })
      if (res.status === 409) {
        setError('Este creador todavía no configuró sus cobros.')
        return
      }
      if (!res.ok) {
        setError('No se pudo iniciar el pago. Intentá de nuevo.')
        return
      }
      const { init_point } = await res.json()
      if (!init_point) {
        setError('No se pudo iniciar el pago. Intentá de nuevo.')
        return
      }
      window.location.href = init_point // → MercadoPago Checkout Pro
    } catch {
      setError('No se pudo iniciar el pago. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {variant === 'primary' ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-rosa hover:bg-rosa-hover text-white rounded-lg px-[18px] py-[11px] text-[13px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
        >
          <Heart className="w-3.5 h-3.5" />
          {label ?? `Apoyar a ${firstName}`}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="border border-rosa text-rosa hover:bg-rosa/[0.06] rounded-md px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <Heart className="w-3 h-3" />
          {label ?? 'Impulsar'}
        </button>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white">
          {!creatorConnected ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-naranja/15 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-naranja-ink" />
              </div>
              <h3 className="disp text-tinta text-lg mb-1">TODAVÍA NO PODÉS APOYAR</h3>
              <p className="text-txt2 text-sm">
                {firstName} todavía no configuró sus cobros con MercadoPago. Volvé pronto para apoyar su trabajo.
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-5 w-full bg-rosa hover:bg-rosa-hover text-white rounded-lg py-3 text-sm font-semibold transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-tinta">
                  <Heart className="w-4 h-4 text-rosa" />
                  Impulsar a {firstName}
                </DialogTitle>
                <DialogDescription className="text-txt2">
                  {postTitle
                    ? `Apoyá esta publicación: "${postTitle}"`
                    : `Apoyá el trabajo de ${firstName} con el monto que quieras.`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-tinta">Elegí un monto (ARS)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((p) => {
                      const active = !customAmount && amount === p
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { setAmount(p); setCustomAmount('') }}
                          className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${
                            active
                              ? 'border-rosa bg-rosa/[0.06] text-rosa'
                              : 'border-borde text-tinta hover:border-rosa/50'
                          }`}
                        >
                          ${p.toLocaleString('es-AR')}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="custom-amount" className="text-tinta">Otro monto</Label>
                  <div className="flex items-center border border-borde rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rosa/30">
                    <span className="px-3 text-muted2 bg-crema border-r border-borde h-11 flex items-center">$</span>
                    <input
                      id="custom-amount"
                      inputMode="numeric"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ingresá otro monto"
                      className="flex-1 px-3 h-11 text-sm outline-none text-tinta"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="impulso-msg" className="text-tinta">Mensaje (opcional)</Label>
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

              <button
                onClick={handleImpulsar}
                disabled={loading || selectedAmount <= 0}
                className="w-full bg-rosa hover:bg-rosa-hover text-white rounded-lg py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                Impulsar ${selectedAmount > 0 ? selectedAmount.toLocaleString('es-AR') : '0'}
              </button>
              <p className="text-center text-xs text-muted2 -mt-1">
                Pago seguro con MercadoPago · {firstName} recibe el 90%
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
