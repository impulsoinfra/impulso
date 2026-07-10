// Transactional email via Resend. No-op until RESEND_API_KEY is configured, so
// the donation flow never breaks if email isn't set up yet.
const RESEND_URL = 'https://api.resend.com/emails'

interface DonationEmailInput {
  to: string
  creatorName: string
  amount: number
  supporterName?: string | null
  message?: string | null
  goalTitle?: string | null
  goalCurrent?: number | null
  goalTarget?: number | null
}

const money = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

export function buildDonationEmailHtml(input: DonationEmailInput): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://impulso-gamma.vercel.app').replace(/\/$/, '')
  const firstName = input.creatorName?.split(' ')[0] || 'creador'
  const supporter = input.supporterName?.trim() || 'Alguien'
  const amountStr = money(input.amount)

  const goalBlock =
    input.goalTitle && input.goalCurrent != null && input.goalTarget != null
      ? `<p style="margin:0 0 4px;font-size:13px;color:#5F5E5A">Tu meta <strong style="color:#1B1A2E">${escapeHtml(input.goalTitle)}</strong> va en</p>
         <p style="margin:0 0 20px;font-size:15px;color:#1B1A2E"><strong>${money(input.goalCurrent)}</strong> <span style="color:#8A887F">de ${money(input.goalTarget)}</span></p>`
      : ''

  const messageBlock = input.message?.trim()
    ? `<div style="background:#FBF7F2;border-radius:10px;padding:12px 14px;margin:0 0 20px">
         <p style="margin:0;font-size:13px;color:#5F5E5A;font-style:italic">"${escapeHtml(input.message.trim())}"</p>
         <p style="margin:6px 0 0;font-size:11px;color:#8A887F">— ${escapeHtml(supporter)}</p>
       </div>`
    : ''

  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#FBF7F2;padding:32px 16px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid rgba(27,26,46,0.12);border-radius:16px;overflow:hidden">
      <div style="background:#1B1A2E;padding:16px 24px">
        <span style="color:#FBF7F2;font-size:17px;font-weight:800;letter-spacing:0.5px">IMPULSO</span>
      </div>
      <div style="padding:28px 24px">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#F0355C">Nuevo apoyo</p>
        <h1 style="margin:0 0 4px;font-size:24px;color:#1B1A2E">¡Recibiste ${amountStr}! 🎉</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#5F5E5A">${escapeHtml(supporter)} apoyó tu trabajo, ${escapeHtml(firstName)}.</p>
        ${messageBlock}
        ${goalBlock}
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#F0355C;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:8px">Ver mi panel</a>
      </div>
      <div style="padding:16px 24px;border-top:1px solid rgba(27,26,46,0.08)">
        <p style="margin:0;font-size:11px;color:#8A887F">Recibís este aviso porque alguien apoyó tu perfil en Impulso.</p>
      </div>
    </div>
  </div>`
}

export async function sendDonationNotification(input: DonationEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !input.to) return

  const from = process.env.EMAIL_FROM || 'Impulso <onboarding@resend.dev>'
  const amountStr = money(input.amount)
  const html = buildDonationEmailHtml(input)

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `¡Recibiste ${amountStr} de apoyo en Impulso!`,
      html,
    }),
  })
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
