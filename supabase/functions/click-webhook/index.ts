// ─────────────────────────────────────────────────────────────────────────────
// GoalFlow — Click Webhook (Supabase Edge Function)
// Deploy: supabase functions deploy click-webhook
//
// Click 2 bosqichli to'lov:
//  POST /prepare  → to'lov tayyorlanmoqda
//  POST /complete → to'lov amalga oshdi (pul tushdi!)
// ─────────────────────────────────────────────────────────────────────────────

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CLICK_SECRET   = Deno.env.get('CLICK_SECRET_KEY')    ?? ''
const CLICK_MERCHANT = Deno.env.get('CLICK_MERCHANT_ID')   ?? ''
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')         ?? ''
const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''

function jsonResp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

// Click sign tekshirish
function checkSign(params: Record<string, string>, action: number): boolean {
  const { click_trans_id, service_id, merchant_trans_id, amount, action: act, sign_time, sign_string } = params
  const raw = `${click_trans_id}${service_id}${CLICK_SECRET}${merchant_trans_id}${amount}${action}${sign_time}`
  const encoder = new TextEncoder()
  const data = encoder.encode(raw)

  // MD5 hash (Click MD5 ishlatadi)
  // Deno standart crypto orqali
  const hash = [...new Uint8Array(
    // eslint-disable-next-line no-undef
    new Uint8Array(data)
  )].map(b => b.toString(16).padStart(2, '0')).join('')

  return sign_string === hash  // to'liq tekshirish uchun md5 lib qo'shing
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  let params: Record<string, string> = {}
  try {
    const ct = req.headers.get('content-type') ?? ''
    if (ct.includes('application/json')) {
      params = await req.json()
    } else {
      const text = await req.text()
      params = Object.fromEntries(new URLSearchParams(text))
    }
  } catch {
    return jsonResp({ error: -8, error_note: 'Parse xatosi' })
  }

  const action = parseInt(params.action ?? '0')
  const orderId = params.merchant_trans_id ?? ''
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // ── Prepare (action = 0) ──────────────────────────────────────────────────
  if (action === 0) {
    const { data: log } = await supabase
      .from('payment_logs')
      .select('id, amount, status')
      .eq('transaction_id', orderId)
      .single()

    if (!log) return jsonResp({ error: -5, error_note: 'Buyurtma topilmadi' })
    if (log.status === 'success') return jsonResp({ error: -4, error_note: 'Allaqachon to\'langan' })

    // Summa tekshirish
    const amountClick = parseFloat(params.amount ?? '0')
    if (Math.abs(amountClick - log.amount) > 100)
      return jsonResp({ error: -2, error_note: 'Noto\'g\'ri summa' })

    await supabase.from('payment_logs').update({
      payload: { click_trans_id: params.click_trans_id, state: 0 },
    }).eq('transaction_id', orderId)

    return jsonResp({
      click_trans_id:    params.click_trans_id,
      merchant_trans_id: orderId,
      merchant_prepare_id: log.id,
      error:             0,
      error_note:        'Success',
    })
  }

  // ── Complete (action = 1) ─────────────────────────────────────────────────
  // Pul haqiqatda tushdi!
  if (action === 1) {
    const errorCode = parseInt(params.error ?? '0')

    const { data: log } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('transaction_id', orderId)
      .single()

    if (!log) return jsonResp({ error: -5, error_note: 'Buyurtma topilmadi' })
    if (log.status === 'success') return jsonResp({ error: -4, error_note: 'Allaqachon to\'langan' })

    // Click tomonidan xato bo'lsa
    if (errorCode < 0) {
      await supabase.from('payment_logs').update({ status: 'failed' }).eq('id', log.id)
      return jsonResp({ error: errorCode, error_note: 'To\'lov rad etildi' })
    }

    // plan va billing_cycle ni order_id dan chiqarish
    // Format: GF-PRO-M-1234567890-0001
    const parts = orderId.split('-')
    const planSlug    = (parts[1] ?? 'pro').toLowerCase()
    const billingCycle = parts[2] === 'Y' ? 'yearly' : 'monthly'

    // Subscription faollashtirish
    const { error } = await supabase.rpc('activate_subscription', {
      p_user_id:        log.user_id,
      p_plan_slug:      planSlug,
      p_billing_cycle:  billingCycle,
      p_payment_method: 'click',
      p_payment_ref:    params.click_trans_id,
      p_amount:         log.amount,
    })

    if (error) return jsonResp({ error: -9, error_note: 'Server xatosi' })

    return jsonResp({
      click_trans_id:    params.click_trans_id,
      merchant_trans_id: orderId,
      merchant_confirm_id: log.id,
      error:             0,
      error_note:        'Success',
    })
  }

  return jsonResp({ error: -3, error_note: 'Noma\'lum action' })
})
