// ─────────────────────────────────────────────────────────────────────────────
// GoalFlow — Payme Webhook (Supabase Edge Function)
// Deploy: supabase functions deploy payme-webhook
//
// Payme JSON-RPC methodlari:
//  CheckPerformTransaction  → to'lov mumkinmi?
//  CreateTransaction        → tranzaksiya yaratish
//  PerformTransaction       → to'lov amalga oshdi (pul tushdi!)
//  CancelTransaction        → bekor qilish
//  CheckTransaction         → holat so'rash
//  GetStatement             → hisobot
// ─────────────────────────────────────────────────────────────────────────────

import { serve }         from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient }  from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto }        from 'https://deno.land/std@0.168.0/crypto/mod.ts'

// Env o'zgaruvchilar (Supabase Dashboard > Edge Functions > Secrets)
const PAYME_KEY    = Deno.env.get('PAYME_SECRET_KEY')   ?? ''   // merchant secret key
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')        ?? ''
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''  // service_role key

// Payme xato kodlari
const ERRORS = {
  PARSE:        { code: -32700, message: { uz: "Parse xatosi",      ru: "Ошибка парсинга",         en: "Parse error" } },
  METHOD:       { code: -32601, message: { uz: "Metod topilmadi",   ru: "Метод не найден",          en: "Method not found" } },
  INVALID:      { code: -32600, message: { uz: "Noto'g'ri so'rov",  ru: "Неверный запрос",          en: "Invalid request" } },
  UNAUTHORIZED: { code: -32504, message: { uz: "Ruxsat yo'q",       ru: "Нет доступа",              en: "Unauthorized" } },
  ACCOUNT:      { code: -31050, message: { uz: "Buyurtma topilmadi",ru: "Заказ не найден",           en: "Order not found" } },
  AMOUNT:       { code: -31001, message: { uz: "Noto'g'ri summa",   ru: "Неверная сумма",           en: "Invalid amount" } },
  DONE:         { code: -31060, message: { uz: "To'lov qilingan",   ru: "Транзакция завершена",      en: "Already paid" } },
  CANCELED:     { code: -31062, message: { uz: "Bekor qilingan",    ru: "Транзакция отменена",       en: "Transaction cancelled" } },
  CANT_CANCEL:  { code: -31007, message: { uz: "Bekor qilib bo'lmaydi", ru: "Нельзя отменить",     en: "Cannot cancel" } },
}

function errResp(id: unknown, err: typeof ERRORS[keyof typeof ERRORS]) {
  return resp({ id, error: err })
}

function resp(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  })
}

// Basic Auth tekshirish (Payme login:password base64)
function checkAuth(req: Request): boolean {
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Basic ')) return false
  const decoded = atob(authHeader.replace('Basic ', ''))
  // Payme: login "Paycom", password = PAYME_SECRET_KEY
  return decoded === `Paycom:${PAYME_KEY}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  if (!checkAuth(req)) return errResp(null, ERRORS.UNAUTHORIZED)

  let body: { id: unknown; method: string; params: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return errResp(null, ERRORS.PARSE)
  }

  const { id, method, params } = body
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // ── CheckPerformTransaction ──────────────────────────────────────────────
  if (method === 'CheckPerformTransaction') {
    const orderId = (params?.account as Record<string, string>)?.order_id
    if (!orderId) return errResp(id, ERRORS.ACCOUNT)

    // payment_logs da pending yozuv bormi?
    const { data: log } = await supabase
      .from('payment_logs')
      .select('id, amount, status')
      .eq('transaction_id', orderId)
      .single()

    if (!log) return errResp(id, ERRORS.ACCOUNT)
    if (log.status === 'success') return errResp(id, ERRORS.DONE)

    // Summa to'g'rimi? (tiyin da keladi, so'm ga o'tkazamiz)
    const amountSom = Math.round((params.amount as number) / 100)
    if (Math.abs(amountSom - log.amount) > 100) return errResp(id, ERRORS.AMOUNT)

    return resp({ id, result: { allow: true } })
  }

  // ── CreateTransaction ────────────────────────────────────────────────────
  if (method === 'CreateTransaction') {
    const orderId  = (params?.account as Record<string, string>)?.order_id
    const paymeId  = params?.id as string
    const time     = params?.time as number

    if (!orderId || !paymeId) return errResp(id, ERRORS.ACCOUNT)

    // Mavjud tranzaksiyani tekshirish
    const { data: existing } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('transaction_id', orderId)
      .single()

    if (!existing) return errResp(id, ERRORS.ACCOUNT)
    if (existing.status === 'success') return errResp(id, ERRORS.DONE)

    // Payme ID ni saqlash
    await supabase
      .from('payment_logs')
      .update({ payload: { payme_id: paymeId, payme_time: time, state: 1 } })
      .eq('transaction_id', orderId)

    return resp({
      id,
      result: {
        create_time: time,
        transaction:  paymeId,
        state:        1,
      },
    })
  }

  // ── PerformTransaction ───────────────────────────────────────────────────
  // 🎉 Pul haqiqatda tushdi! Subscription faollashtirish
  if (method === 'PerformTransaction') {
    const paymeId = params?.id as string
    if (!paymeId) return errResp(id, ERRORS.INVALID)

    // payment_log ni topish (payload.payme_id orqali)
    const { data: logs } = await supabase
      .from('payment_logs')
      .select('*')
      .contains('payload', { payme_id: paymeId })

    const log = logs?.[0]
    if (!log) return errResp(id, ERRORS.ACCOUNT)
    if (log.status === 'success') return errResp(id, ERRORS.DONE)
    if (log.status === 'failed')  return errResp(id, ERRORS.CANCELED)

    // order_id dan plan va billing_cycle ni chiqarish
    // Format: GF-PRO-M-1234567890-0001
    const parts = log.transaction_id?.split('-') ?? []
    const planSlug    = (parts[1] ?? 'pro').toLowerCase()
    const billingCycle = parts[2] === 'Y' ? 'yearly' : 'monthly'

    // activate_subscription funksiyasini chaqirish
    const { error } = await supabase.rpc('activate_subscription', {
      p_user_id:        log.user_id,
      p_plan_slug:      planSlug,
      p_billing_cycle:  billingCycle,
      p_payment_method: 'payme',
      p_payment_ref:    paymeId,
      p_amount:         log.amount,
    })

    if (error) {
      console.error('[PerformTransaction] activate error:', error)
      return errResp(id, ERRORS.ACCOUNT)
    }

    const performTime = Date.now()
    return resp({
      id,
      result: {
        transaction:  paymeId,
        perform_time: performTime,
        state:        2,
      },
    })
  }

  // ── CancelTransaction ────────────────────────────────────────────────────
  if (method === 'CancelTransaction') {
    const paymeId = params?.id as string
    const reason  = params?.reason as number

    const { data: logs } = await supabase
      .from('payment_logs')
      .select('*')
      .contains('payload', { payme_id: paymeId })

    const log = logs?.[0]
    if (!log) return errResp(id, ERRORS.ACCOUNT)

    // Muvaffaqiyatli to'lovni bekor qilib bo'lmaydi (refund alohida)
    if (log.status === 'success') return errResp(id, ERRORS.CANT_CANCEL)

    await supabase
      .from('payment_logs')
      .update({ status: 'failed', payload: { ...log.payload, cancel_reason: reason, state: -1 } })
      .eq('id', log.id)

    return resp({
      id,
      result: {
        transaction:  paymeId,
        cancel_time:  Date.now(),
        state:        -1,
      },
    })
  }

  // ── CheckTransaction ─────────────────────────────────────────────────────
  if (method === 'CheckTransaction') {
    const paymeId = params?.id as string
    const { data: logs } = await supabase
      .from('payment_logs')
      .select('*')
      .contains('payload', { payme_id: paymeId })

    const log = logs?.[0]
    if (!log) return errResp(id, ERRORS.ACCOUNT)

    const state = log.status === 'success' ? 2 : log.status === 'failed' ? -1 : 1
    return resp({
      id,
      result: {
        create_time:  log.payload?.payme_time ?? 0,
        perform_time: log.status === 'success' ? Date.now() : 0,
        cancel_time:  log.status === 'failed'  ? Date.now() : 0,
        transaction:  paymeId,
        state,
        reason:       log.payload?.cancel_reason ?? null,
      },
    })
  }

  // ── GetStatement ─────────────────────────────────────────────────────────
  if (method === 'GetStatement') {
    const from = new Date(params?.from as number).toISOString()
    const to   = new Date(params?.to   as number).toISOString()

    const { data: logs } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('payment_method', 'payme')
      .gte('created_at', from)
      .lte('created_at', to)

    const transactions = (logs ?? []).map(l => ({
      id:            l.payload?.payme_id,
      time:          new Date(l.created_at).getTime(),
      amount:        l.amount * 100,
      account:       { order_id: l.transaction_id },
      create_time:   l.payload?.payme_time ?? new Date(l.created_at).getTime(),
      perform_time:  l.status === 'success' ? new Date(l.created_at).getTime() : 0,
      cancel_time:   l.status === 'failed'  ? new Date(l.created_at).getTime() : 0,
      transaction:   l.payload?.payme_id,
      state:         l.status === 'success' ? 2 : l.status === 'failed' ? -1 : 1,
    }))

    return resp({ id, result: { transactions } })
  }

  return errResp(id, ERRORS.METHOD)
})
