// ============================================================
// GoalFlow — Streak (ketma-ketlik) hisoblash
// "Streak kuni" = kamida 1 ta vazifa bajarilgan kun
// ============================================================
import { supabase } from '../supabase.js'

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Barcha bajarilgan kunlar to'plamini olib keladi
export async function fetchActiveDays(userId) {
  if (!userId) return new Set()
  const { data, error } = await supabase
    .from('task_completions')
    .select('completed_date')
    .eq('user_id', userId)
  if (error || !data) return new Set()
  return new Set(data.map(r => r.completed_date))
}

// current + longest streak hisoblaydi
export function computeStreak(activeDays) {
  if (!activeDays || activeDays.size === 0) return { current: 0, longest: 0 }

  // ── Joriy streak: bugundan (yoki kechadan) orqaga ──
  const today = new Date()
  let current = 0
  const cursor = new Date(today)

  // Bugun bajarilmagan bo'lsa ham, kechadan boshlanadigan streak uziladi deb hisoblamaymiz
  if (!activeDays.has(ymd(cursor))) {
    cursor.setDate(cursor.getDate() - 1) // kechaga o'tamiz
  }
  while (activeDays.has(ymd(cursor))) {
    current++
    cursor.setDate(cursor.getDate() - 1)
  }

  // ── Eng uzun streak ──
  const sorted = [...activeDays].sort()
  let longest = 0, run = 0
  let prev = null
  for (const ds of sorted) {
    const d = new Date(ds + 'T00:00:00')
    if (prev) {
      const diff = Math.round((d - prev) / 86400000)
      run = diff === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
    prev = d
  }

  return { current, longest }
}

// ── Streak Freeze (muzlatish) ──
// Har 7 faol kunga 1 ta muzlatish beriladi. Bitta kun o'tkazib
// yuborilsa, avtomatik muzlatish sarflanib streak saqlanadi.
function freezeKey(userId) { return `gf_freezes_${userId}` }

function loadUsed(userId) {
  try { return new Set(JSON.parse(localStorage.getItem(freezeKey(userId)) || '[]')) }
  catch { return new Set() }
}
function saveUsed(userId, set) {
  localStorage.setItem(freezeKey(userId), JSON.stringify([...set]))
}

// activeDays + muzlatishlar bilan streak hisoblash
export function computeStreakWithFreeze(activeDays, userId) {
  const raw = computeStreak(activeDays)
  if (!activeDays || activeDays.size === 0) {
    return { ...raw, freezesAvailable: 0, freezesEarned: 0 }
  }

  const earned = Math.floor(activeDays.size / 7)  // har 7 kunga 1 muzlatish
  const used = loadUsed(userId)
  let available = Math.max(0, earned - used.size)

  // Bugundan orqaga yurib, bitta bo'sh kunni muzlatish bilan yopamiz
  const covered = new Set([...activeDays, ...used])
  const cursor = new Date()
  if (!covered.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1)

  let current = 0
  while (true) {
    const key = ymd(cursor)
    if (covered.has(key)) {
      current++
      cursor.setDate(cursor.getDate() - 1)
      continue
    }
    // bo'sh kun — muzlatish bor va oldingi kun faol bo'lsa yopamiz
    const prev = new Date(cursor); prev.setDate(prev.getDate() - 1)
    if (available > 0 && activeDays.has(ymd(prev))) {
      used.add(key)
      covered.add(key)
      available--
      current++
      cursor.setDate(cursor.getDate() - 1)
      continue
    }
    break
  }

  saveUsed(userId, used)
  return {
    current,
    longest: Math.max(raw.longest, current),
    freezesAvailable: available,
    freezesEarned: earned,
  }
}

// Bitta chaqiriqda: userId → { current, longest, freezesAvailable }
export async function getStreak(userId) {
  const days = await fetchActiveDays(userId)
  return computeStreakWithFreeze(days, userId)
}

// Alanga darajasi (rang/emoji) — motivatsiya uchun
export function streakTier(n) {
  if (n >= 100) return { emoji: '💎', label: 'Olmos', color: '#00d4aa' }
  if (n >= 30)  return { emoji: '🔥', label: 'Olov', color: '#ef4444' }
  if (n >= 14)  return { emoji: '⚡', label: 'Kuchli', color: '#f59e0b' }
  if (n >= 7)   return { emoji: '🔥', label: 'Yonmoqda', color: '#f59e0b' }
  if (n >= 3)   return { emoji: '✨', label: 'Boshlandi', color: '#8b5cf6' }
  return { emoji: '🌱', label: 'Yangi', color: '#6c63ff' }
}
