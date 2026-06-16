// ─────────────────────────────────────────────────────────
// GoalFlow — To'lov yordamchi kutubxonasi
// Payme va Click checkout-ga yo'naltiradi
// ─────────────────────────────────────────────────────────

const PAYME_ID  = import.meta.env.VITE_PAYME_MERCHANT_ID  || ''
const CLICK_ID  = import.meta.env.VITE_CLICK_SERVICE_ID   || ''
const APP_URL   = import.meta.env.VITE_APP_URL             || window.location.origin

// ── Payme Checkout ──────────────────────────────────────
// Payme to'lov sahifasini yangi oynada ochadi
// amountSom: so'm da (masalan 69000)
export function openPaymeCheckout({ orderId, amountSom, description = 'GoalFlow Pro' }) {
  if (!PAYME_ID) {
    console.warn('[Payment] VITE_PAYME_MERCHANT_ID env yozilmagan')
    return false
  }
  const amountTiyin = amountSom * 100   // Payme tiyin qabul qiladi
  const returnUrl   = `${APP_URL}/subscription?payment=success&order=${orderId}`
  const cancelUrl   = `${APP_URL}/subscription?payment=cancel`

  // Payme checkout parametrlari (base64 encoded)
  const params = [
    `m=${PAYME_ID}`,
    `ac.order_id=${orderId}`,
    `ac.description=${encodeURIComponent(description)}`,
    `a=${amountTiyin}`,
    `l=uz`,
    `c=${encodeURIComponent(returnUrl)}`,
    `ct=${encodeURIComponent(cancelUrl)}`,
  ].join(';')

  const url = `https://checkout.paycom.uz/${btoa(params)}`
  const popup = window.open(url, 'payme_checkout', 'width=700,height=580,left=200,top=100')

  // Popup bloklangan bo'lsa tab ochadi
  if (!popup || popup.closed) window.location.href = url
  return true
}

// ── Click Checkout ──────────────────────────────────────
export function openClickCheckout({ orderId, amountSom, description = 'GoalFlow' }) {
  if (!CLICK_ID) {
    console.warn('[Payment] VITE_CLICK_SERVICE_ID env yozilmagan')
    return false
  }
  const returnUrl = `${APP_URL}/subscription?payment=success&order=${orderId}`
  const params = new URLSearchParams({
    service_id:        CLICK_ID,
    merchant_id:       CLICK_ID,
    amount:            amountSom,
    transaction_param: orderId,
    merchant_trans_id: orderId,
    return_url:        returnUrl,
  })

  const url = `https://my.click.uz/services/pay?${params}`
  const popup = window.open(url, 'click_checkout', 'width=700,height=580,left=200,top=100')
  if (!popup || popup.closed) window.location.href = url
  return true
}

// ── Narx hisoblash ───────────────────────────────────────
export const PLAN_PRICES = {
  pro: {
    monthly: 69_000,
    yearly:  588_000,
  },
  premium: {
    monthly: 169_000,
    yearly:  1_428_000,
  },
}

export function getPlanAmount(plan, cycle) {
  return PLAN_PRICES[plan]?.[cycle] ?? 0
}

// ── Noyob order ID ───────────────────────────────────────
export function generateOrderId(userId, plan, cycle) {
  const ts = Date.now()
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `GF-${plan.toUpperCase()}-${cycle[0].toUpperCase()}-${ts}-${rand}`
}
