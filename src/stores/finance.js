import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from './auth.js'

// Kategoriyalar
export const INCOME_CATS = [
  { key: 'salary', label: 'Maosh', icon: '💼' },
  { key: 'business', label: 'Biznes', icon: '📈' },
  { key: 'gift', label: 'Sovg\'a', icon: '🎁' },
  { key: 'other_in', label: 'Boshqa', icon: '💰' },
]
export const EXPENSE_CATS = [
  { key: 'food', label: 'Oziq-ovqat', icon: '🍔' },
  { key: 'transport', label: 'Transport', icon: '🚕' },
  { key: 'utilities', label: 'Kommunal', icon: '🏠' },
  { key: 'fun', label: 'Ko\'ngilochar', icon: '🎮' },
  { key: 'health', label: 'Sog\'liq', icon: '💊' },
  { key: 'shopping', label: 'Xarid', icon: '🛍️' },
  { key: 'other_out', label: 'Boshqa', icon: '📦' },
]

export function catInfo(type, key) {
  const list = type === 'income' ? INCOME_CATS : EXPENSE_CATS
  return list.find(c => c.key === key) || { label: 'Boshqa', icon: type === 'income' ? '💰' : '📦' }
}

export const useFinanceStore = defineStore('finance', () => {
  const entries = ref([])
  const loading = ref(false)

  async function fetchEntries() {
    const auth = useAuthStore()
    if (!auth.user?.id) return
    loading.value = true
    try {
      const { data } = await supabase
        .from('finance_entries')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })
      entries.value = data || []
    } catch (e) {
      console.error('finance fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  async function addEntry(entry) {
    const auth = useAuthStore()
    if (!auth.user?.id) return
    const { data, error } = await supabase
      .from('finance_entries')
      .insert({ ...entry, user_id: auth.user.id })
      .select()
    if (error) throw error
    if (data?.[0]) entries.value.unshift(data[0])
    return data
  }

  async function deleteEntry(id) {
    await supabase.from('finance_entries').delete().eq('id', id)
    entries.value = entries.value.filter(e => e.id !== id)
  }

  // ── Jamlanmalar ──
  function totalIncome() {
    return entries.value.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0)
  }
  function totalExpense() {
    return entries.value.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
  }
  function balance() {
    return totalIncome() - totalExpense()
  }

  // Oxirgi N oy bo'yicha kirim/chiqim (chart uchun)
  function monthly(n = 6) {
    const now = new Date()
    const buckets = []
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      buckets.push({ ym, label: ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'][d.getMonth()], income: 0, expense: 0 })
    }
    for (const e of entries.value) {
      const ym = (e.entry_date || '').slice(0, 7)
      const b = buckets.find(x => x.ym === ym)
      if (b) b[e.type] += Number(e.amount)
    }
    return buckets
  }

  // Chiqim kategoriyalari bo'yicha (chart uchun)
  function byCategory(type = 'expense') {
    const map = {}
    for (const e of entries.value.filter(e => e.type === type)) {
      map[e.category || 'other'] = (map[e.category || 'other'] || 0) + Number(e.amount)
    }
    return Object.entries(map).map(([key, val]) => ({ key, val })).sort((a, b) => b.val - a.val)
  }

  return {
    entries, loading,
    fetchEntries, addEntry, deleteEntry,
    totalIncome, totalExpense, balance, monthly, byCategory,
  }
})

// Pul formatlash: 1500000 -> "1 500 000"
export function fmtMoney(n) {
  return Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ')
}
