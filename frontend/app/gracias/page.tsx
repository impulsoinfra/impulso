'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

function GraciasContent() {
  const params = useSearchParams()
  const status = params.get('status') || 'success'

  // Settle the donation from the MP payment on return (works even if the
  // webhook is delayed or doesn't fire in test mode). Idempotent server-side.
  useEffect(() => {
    const donationId = params.get('d') || params.get('external_reference')
    const paymentId = params.get('payment_id') || params.get('collection_id')
    if (donationId && paymentId) {
      fetch('/api/mp/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ donationId, paymentId }),
      }).catch(() => {})
    }
  }, [params])

  const config = {
    success: {
      icon: <CheckCircle className="w-8 h-8 text-exito" />,
      bg: 'bg-exito/10',
      title: '¡GRACIAS POR TU IMPULSO!',
      text: 'Tu apoyo se registró con éxito. El creador ya lo va a poder ver reflejado en su meta.',
    },
    pending: {
      icon: <Clock className="w-8 h-8 text-naranja-ink" />,
      bg: 'bg-naranja/15',
      title: 'TU PAGO ESTÁ PENDIENTE',
      text: 'Estamos esperando la confirmación de MercadoPago. En cuanto se acredite, tu apoyo va a impactar en la meta.',
    },
    failure: {
      icon: <XCircle className="w-8 h-8 text-red-500" />,
      bg: 'bg-red-50',
      title: 'NO PUDIMOS PROCESAR EL PAGO',
      text: 'El pago no se completó. Podés intentar de nuevo desde el perfil del creador.',
    },
  }[status] ?? {
    icon: <CheckCircle className="w-8 h-8 text-exito" />,
    bg: 'bg-exito/10',
    title: '¡GRACIAS!',
    text: 'Gracias por apoyar a los creadores de Impulso.',
  }

  return (
    <div className="w-full max-w-[440px] bg-white border border-borde rounded-2xl p-8 text-center">
      <div className={`w-16 h-16 rounded-full ${config.bg} flex items-center justify-center mx-auto mb-4`}>
        {config.icon}
      </div>
      <h1 className="disp text-tinta text-[22px] uppercase mb-2">{config.title}</h1>
      <p className="text-txt2 text-sm leading-relaxed mb-6">{config.text}</p>
      <div className="flex flex-col gap-2">
        <Link href={ROUTES.DISCOVER} className="bg-rosa hover:bg-rosa-hover text-white rounded-lg py-3 text-sm font-semibold transition-colors">
          Explorar más creadores
        </Link>
        <Link href={ROUTES.HOME} className="text-txt2 hover:text-tinta text-[13px] font-medium transition-colors">
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={null}>
          <GraciasContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
