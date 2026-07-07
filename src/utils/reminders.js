// ============================================================
// GoalFlow — Motivatsion kunlik bildirishnomalar
// Brauzer ochiq (yoki fonda) bo'lganda Notification API orqali ishlaydi.
// Har kuni: ertalabki turtki (08:00) va kechki eslatma (20:00).
// ============================================================
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

const MORNING = [
  "Yangi kun — yangi imkoniyat! Bugun 1% yaxshilan 🌅",
  "Bugun o'zingni engish uchun ajoyib kun 💪",
  "Kichik qadamlar katta natijalarga olib keladi. Boshla! 🚀",
  "Intizom — bu erkinlik. Bugun rejangga sodiq qol ✨",
]
const EVENING = [
  "Kun tugamoqda — vazifalaringni yakunladingmi? 🌙",
  "Streak'ingni saqla! Bugungi vazifalarni unutma 🔥",
  "Bir necha vazifa qoldi. Hozir bajarib, kunni g'alaba bilan yop 🎯",
  "Bugungi harakating ertangi o'zingni yaratadi. Davom et! ⭐",
]

function pick(arr) {
  // Kunga bog'liq — bir kun ichida o'zgarmas
  const idx = new Date().getDate() % arr.length
  return arr[idx]
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function alreadySent(slot) {
  return localStorage.getItem(`gf_notif_${slot}`) === todayKey()
}
function markSent(slot) {
  localStorage.setItem(`gf_notif_${slot}`, todayKey())
}

function notify(title, body) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon.svg', badge: '/icon.svg' })
    }
  } catch { /* qo'llab-quvvatlanmaydi */ }
}

// Bugun bajarilmagan vazifalar sonini taxminlash
async function remainingCount() {
  try {
    const auth = useAuthStore()
    const uid = auth.user?.id
    if (!uid) return null
    const todayStr = new Date().toISOString().split('T')[0]

    const [{ count: total }, { count: done }] = await Promise.all([
      supabase.from('tasks').select('id', { count: 'exact', head: true })
        .eq('is_active', true).or(`user_id.eq.${uid},is_template.eq.true`),
      supabase.from('task_completions').select('task_id', { count: 'exact', head: true })
        .eq('user_id', uid).eq('completed_date', todayStr),
    ])
    return Math.max(0, (total || 0) - (done || 0))
  } catch { return null }
}

export function remindersEnabled() {
  return localStorage.getItem('gf_reminders') !== 'off'
}
export function toggleReminders(on) {
  localStorage.setItem('gf_reminders', on ? 'on' : 'off')
}

async function checkSlots() {
  if (!remindersEnabled()) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const h = new Date().getHours()

  // Ertalab 08:00–09:00
  if (h === 8 && !alreadySent('morning')) {
    notify('☀️ GoalFlow', pick(MORNING))
    markSent('morning')
  }

  // Kechqurun 20:00–21:00
  if (h === 20 && !alreadySent('evening')) {
    const rem = await remainingCount()
    const base = pick(EVENING)
    const body = rem && rem > 0 ? `${base}\n📋 ${rem} ta vazifa qoldi` : base
    notify('🌙 GoalFlow', body)
    markSent('evening')
  }
}

let interval = null
export function startReminders() {
  checkSlots()
  if (interval) clearInterval(interval)
  interval = setInterval(checkSlots, 60 * 1000) // har daqiqada
}
export function stopReminders() {
  if (interval) clearInterval(interval)
  interval = null
}
