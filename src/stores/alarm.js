import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase.js'

// ── Melodiyalar (nota ketma-ketligi) ──
export const MELODIES = {
  classic:  { name: 'Klassik',   pro: false, notes: [[880,0,0.3],[1100,0.35,0.3],[880,0.7,0.3],[1100,1.05,0.3],[1320,1.4,0.6]] },
  gentle:   { name: 'Yumshoq',   pro: false, notes: [[523,0,0.4],[659,0.45,0.4],[784,0.9,0.6]] },
  digital:  { name: 'Raqamli',   pro: true,  notes: [[1200,0,0.12],[1200,0.2,0.12],[1200,0.4,0.12],[1600,0.6,0.25]] },
  chime:    { name: 'Qo\'ng\'iroq', pro: true, notes: [[1047,0,0.5],[1319,0.5,0.5],[1568,1.0,0.7]] },
  energetic:{ name: 'Baquvvat',  pro: true,  notes: [[660,0,0.15],[880,0.18,0.15],[1100,0.36,0.15],[880,0.54,0.15],[1320,0.72,0.4]] },
}

export const useAlarmStore = defineStore('alarm', () => {
  const alarms = ref([])
  const activeAlarm = ref(null)
  let checkInterval = null
  let ringLoop = null
  let customAudio = null        // o'z musiqasi (Audio element)
  const firedKeys = new Set()   // takror-fire himoyasi (id + HH:MM)

  async function fetchAlarms(userId) {
    const { data } = await supabase
      .from('alarms')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('time')
    alarms.value = data || []
  }

  async function addAlarm(alarm) {
    const { data } = await supabase.from('alarms').insert(alarm).select().single()
    if (data) alarms.value.push(data)
  }

  async function updateAlarm(id, updates) {
    await supabase.from('alarms').update(updates).eq('id', id)
    const a = alarms.value.find(a => a.id === id)
    if (a) Object.assign(a, updates)
  }

  async function toggleAlarm(id, is_active) {
    await supabase.from('alarms').update({ is_active }).eq('id', id)
    const a = alarms.value.find(a => a.id === id)
    if (a) a.is_active = is_active
  }

  async function deleteAlarm(id) {
    await supabase.from('alarms').delete().eq('id', id)
    alarms.value = alarms.value.filter(a => a.id !== id)
  }

  function startChecking() {
    if (checkInterval) clearInterval(checkInterval)
    checkInterval = setInterval(checkAlarms, 15000) // har 15 soniyada
    checkAlarms()
  }

  function checkAlarms() {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${hh}:${mm}`
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1

    // Bir daqiqa o'tsa eski kalitlarni tozalaymiz
    if (mm === '00' && now.getSeconds() < 20) firedKeys.clear()

    for (const alarm of alarms.value) {
      if (!alarm.is_active) continue
      const at = (alarm.time || '').slice(0, 5)  // "HH:MM:SS" → "HH:MM"
      if (at !== currentTime) continue
      if (alarm.days && alarm.days.length > 0 && !alarm.days.includes(currentDay)) continue

      const key = `${alarm.id}_${currentTime}`
      if (firedKeys.has(key)) continue   // bu daqiqada allaqachon jiringladi
      firedKeys.add(key)

      trigger(alarm)
      break
    }
  }

  function trigger(alarm) {
    activeAlarm.value = alarm
    stopRinging()

    const isCustom = alarm.sound === 'custom' && alarm.sound_url
    if (isCustom) {
      try {
        customAudio = new Audio(alarm.sound_url)
        customAudio.loop = true
        customAudio.play().catch(() => {})
      } catch { /* ijro etib bo'lmadi */ }
    } else {
      playMelody(alarm.sound)
    }
    if (alarm.vibrate !== false) vibrate()

    // Davomli jiringlash — foydalanuvchi to'xtatguncha (max ~60s)
    let count = 0
    ringLoop = setInterval(() => {
      if (!activeAlarm.value || count++ > 20) { stopRinging(); return }
      if (!isCustom) playMelody(alarm.sound)
      if (alarm.vibrate !== false) vibrate()
    }, 3000)

    notifyDevice(alarm)
  }

  function stopRinging() {
    if (ringLoop) { clearInterval(ringLoop); ringLoop = null }
    if (customAudio) { try { customAudio.pause() } catch {} customAudio = null }
  }

  function notifyDevice(alarm) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const n = new Notification(`⏰ ${alarm.label || 'Budilnik'}`, {
          body: `${(alarm.time || '').slice(0,5)} — Vaqt keldi!`,
          icon: '/icon.svg',
          tag: `alarm-${alarm.id}`,
          requireInteraction: true,
        })
        n.onclick = () => { window.focus(); n.close() }
      }
    } catch (e) { /* qo'llab-quvvatlanmaydi */ }
  }

  function vibrate() {
    try { navigator.vibrate?.([300, 150, 300, 150, 500]) } catch {}
  }

  function playMelody(soundKey) {
    try {
      const mel = MELODIES[soundKey] || MELODIES.classic
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      for (const [freq, start, duration] of mel.notes) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + duration)
      }
    } catch (e) { console.log('Audio error:', e) }
  }
  // Namuna eshittirish (sozlamada tanlash uchun)
  let previewAudio = null
  function preview(soundKey) {
    if (previewAudio) { try { previewAudio.pause() } catch {} previewAudio = null }
    playMelody(soundKey)
  }
  function previewUrl(url) {
    if (previewAudio) { try { previewAudio.pause() } catch {} }
    try { previewAudio = new Audio(url); previewAudio.play().catch(() => {}) } catch {}
  }

  function dismissAlarm() {
    activeAlarm.value = null
    stopRinging()
    try { navigator.vibrate?.(0) } catch {}
  }

  function snoozeAlarm(minutes = 5) {
    const a = activeAlarm.value
    dismissAlarm()
    if (!a) return
    setTimeout(() => trigger({ ...a, label: (a.label || 'Budilnik') + ' (snooze)' }), minutes * 60 * 1000)
  }

  function stopChecking() {
    if (checkInterval) clearInterval(checkInterval)
    stopRinging()
  }

  return {
    alarms, activeAlarm,
    fetchAlarms, addAlarm, updateAlarm, toggleAlarm, deleteAlarm,
    startChecking, stopChecking, dismissAlarm, snoozeAlarm,
    playAlarmSound: () => playMelody('classic'), preview, previewUrl,
  }
})
