import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase.js'

export const useAlarmStore = defineStore('alarm', () => {
  const alarms = ref([])
  const activeAlarm = ref(null) // jiringlayotgan budilnik
  let checkInterval = null

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

  async function toggleAlarm(id, is_active) {
    await supabase.from('alarms').update({ is_active }).eq('id', id)
    const a = alarms.value.find(a => a.id === id)
    if (a) a.is_active = is_active
  }

  async function deleteAlarm(id) {
    await supabase.from('alarms').delete().eq('id', id)
    alarms.value = alarms.value.filter(a => a.id !== id)
  }

  function startChecking(userId) {
    if (checkInterval) clearInterval(checkInterval)
    checkInterval = setInterval(() => {
      checkAlarms()
    }, 30000) // har 30 soniyada tekshir
    checkAlarms()
  }

  function checkAlarms() {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1

    for (const alarm of alarms.value) {
      if (!alarm.is_active) continue
      if (alarm.time !== currentTime) continue
      if (alarm.days && alarm.days.length > 0 && !alarm.days.includes(currentDay)) continue

      // Trigger alarm
      activeAlarm.value = alarm
      playAlarmSound()

      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(`⏰ ${alarm.label || 'Budilnik'}`, {
          body: alarm.time,
          icon: '/icons/icon-192.png',
          vibrate: [200, 100, 200]
        })
      }
      break
    }
  }

  function playAlarmSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      function beep(freq, start, duration) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + duration)
      }
      // Alarm melodiyasi
      beep(880, 0, 0.3)
      beep(1100, 0.35, 0.3)
      beep(880, 0.7, 0.3)
      beep(1100, 1.05, 0.3)
      beep(1320, 1.4, 0.6)
    } catch (e) {
      console.log('Audio error:', e)
    }
  }

  function dismissAlarm() {
    activeAlarm.value = null
  }

  function stopChecking() {
    if (checkInterval) clearInterval(checkInterval)
  }

  return { alarms, activeAlarm, fetchAlarms, addAlarm, toggleAlarm, deleteAlarm, startChecking, stopChecking, dismissAlarm, playAlarmSound }
})
