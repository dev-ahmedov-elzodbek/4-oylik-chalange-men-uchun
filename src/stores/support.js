import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from './auth.js'

// Foydalanuvchi uchun: admin xabarlari + bildirishnoma
export const useSupportStore = defineStore('support', () => {
  const userUnread = ref(0)
  let timer = null
  let lastCount = null

  async function refresh() {
    const auth = useAuthStore()
    if (!auth.user?.id) { userUnread.value = 0; lastCount = null; return }
    const { count } = await supabase
      .from('support_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .eq('sender', 'admin')
      .eq('is_read', false)
    const c = count || 0
    // Yangi (ko'proq) xabar kelsa — bildirishnoma yuboramiz
    if (lastCount !== null && c > lastCount) notify()
    lastCount = c
    userUnread.value = c
  }

  // "Sizda xabar bor" — mazmun ko'rsatmaymiz
  function notify() {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const n = new Notification('GoalFlow 💬', {
          body: 'Sizda yangi xabar bor. Ochib ko\'ring.',
          icon: '/icon.svg',
          tag: 'gf-support',
        })
        n.onclick = () => { window.focus(); n.close() }
      }
    } catch { /* qo'llab-quvvatlanmaydi */ }
    try { navigator.vibrate?.([200, 100, 200]) } catch {}
  }

  function start() {
    if (timer) return
    refresh()
    timer = setInterval(refresh, 12000) // har 12 soniyada
  }
  function stop() { if (timer) { clearInterval(timer); timer = null } }

  return { userUnread, refresh, start, stop }
})
