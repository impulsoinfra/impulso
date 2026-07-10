import crypto from 'crypto'

// MercadoPago Split de Pagos 1:1 (marketplace) helpers. Server-only.
const OAUTH_TOKEN_URL = 'https://api.mercadopago.com/oauth/token'
const PREFERENCES_URL = 'https://api.mercadopago.com/checkout/preferences'
const PAYMENTS_URL = 'https://api.mercadopago.com/v1/payments'
// Argentina auth host (MLA)
export const MP_AUTH_HOST = 'https://auth.mercadopago.com.ar'

// Marketplace commission (10% of the donation). MP deducts its own fee first,
// then this marketplace_fee is taken from the remainder; the rest goes to the creator.
export const MARKETPLACE_FEE_RATE = 0.10

export function mpClientId() {
  const v = process.env.MP_CLIENT_ID
  if (!v) throw new Error('Missing MP_CLIENT_ID')
  return v
}
export function mpClientSecret() {
  const v = process.env.MP_CLIENT_SECRET
  if (!v) throw new Error('Missing MP_CLIENT_SECRET')
  return v
}

// ---- OAuth state signing (HMAC, stateless — no DB round-trip) --------------
function stateSecret() {
  return process.env.MP_STATE_SECRET || process.env.MP_CLIENT_SECRET || 'impulso-dev-secret'
}

export function signState(creatorId: string): string {
  const exp = Date.now() + 10 * 60 * 1000 // 10 min, matches MP's authorization_code TTL
  const payload = `${creatorId}.${exp}`
  const sig = crypto.createHmac('sha256', stateSecret()).update(payload).digest('base64url')
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

export function verifyState(state: string): string | null {
  try {
    const [creatorId, exp, sig] = Buffer.from(state, 'base64url').toString().split('.')
    if (!creatorId || !exp || !sig) return null
    const expected = crypto.createHmac('sha256', stateSecret()).update(`${creatorId}.${exp}`).digest('base64url')
    if (sig !== expected) return null
    if (Date.now() > Number(exp)) return null
    return creatorId
  } catch {
    return null
  }
}

// ---- OAuth token exchange --------------------------------------------------
interface TokenResponse {
  access_token: string
  public_key: string
  refresh_token: string
  live_mode: boolean
  user_id: number
  token_type: string
  expires_in: number
  scope: string
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: mpClientId(),
    client_secret: mpClientSecret(),
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  })
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body,
  })
  if (!res.ok) throw new Error(`MP token exchange failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: mpClientId(),
    client_secret: mpClientSecret(),
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body,
  })
  if (!res.ok) throw new Error(`MP token refresh failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ---- Checkout Pro preference (created with the SELLER's access token) -------
export interface PreferenceInput {
  sellerAccessToken: string
  title: string
  amount: number
  marketplaceFee: number
  externalReference: string
  notificationUrl: string
  backUrls: { success: string; failure: string; pending: string }
  payerEmail?: string
  metadata?: Record<string, unknown>
}

export async function createPreference(input: PreferenceInput): Promise<{ id: string; init_point: string; sandbox_init_point: string }> {
  const pref = {
    items: [
      {
        title: input.title,
        quantity: 1,
        unit_price: input.amount,
        currency_id: 'ARS',
      },
    ],
    marketplace_fee: input.marketplaceFee,
    external_reference: input.externalReference,
    notification_url: input.notificationUrl,
    back_urls: input.backUrls,
    auto_return: 'approved',
    ...(input.payerEmail ? { payer: { email: input.payerEmail } } : {}),
    metadata: input.metadata ?? {},
  }
  const res = await fetch(PREFERENCES_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ${input.sellerAccessToken}`,
    },
    body: JSON.stringify(pref),
  })
  if (!res.ok) throw new Error(`MP create preference failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ---- Read a payment (with the seller's access token) -----------------------
export interface MpPayment {
  id: number
  status: string // approved | pending | rejected | refunded | ...
  status_detail: string
  transaction_amount: number
  external_reference: string | null
  payer?: { email?: string }
}

export async function getPayment(accessToken: string, paymentId: string): Promise<MpPayment> {
  const res = await fetch(`${PAYMENTS_URL}/${paymentId}`, {
    headers: { accept: 'application/json', Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`MP get payment failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ---- Webhook signature validation (HMAC-SHA256 of the MP manifest) ----------
// Validates the `x-signature` header MP sends. Disabled (returns true) when
// MP_WEBHOOK_SECRET is not set, so it can be turned on once configured in the
// MP panel (Tus integraciones → Webhooks).
export function verifyWebhookSignature(opts: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true
  if (!opts.xSignature || !opts.dataId) return false

  let ts = ''
  let v1 = ''
  for (const part of opts.xSignature.split(',')) {
    const [k, val] = part.split('=').map((s) => s?.trim())
    if (k === 'ts') ts = val
    else if (k === 'v1') v1 = val
  }
  if (!ts || !v1) return false

  const id = opts.dataId.toLowerCase()
  let manifest = `id:${id};`
  if (opts.xRequestId) manifest += `request-id:${opts.xRequestId};`
  manifest += `ts:${ts};`

  const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(v1))
  } catch {
    return false
  }
}
