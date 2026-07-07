import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => ['admin', 'superadmin'].includes(profile.value?.role))
  const isSuperAdmin = computed(() => profile.value?.role === 'superadmin')
  const needsOnboarding = computed(() => !!user.value && !profile.value?.onboarding_done)

  // ── Obuna (Pro/Premium) ──
  const isPro = computed(() => {
    const p = profile.value
    if (!p) return false
    // Admin/superadmin doim Pro
    if (['admin', 'superadmin'].includes(p.role)) return true
    if (!['pro', 'premium'].includes(p.subscription_plan)) return false
    // Muddat tekshiruvi (bo'sh bo'lsa — doimiy)
    if (p.subscription_ends_at && new Date(p.subscription_ends_at) < new Date()) return false
    return true
  })
  const isPremium = computed(() => {
    const p = profile.value
    if (!p) return false
    if (p.role === 'superadmin') return true
    if (p.subscription_plan !== 'premium') return false
    if (p.subscription_ends_at && new Date(p.subscription_ends_at) < new Date()) return false
    return true
  })
  const planName = computed(() => {
    if (!profile.value) return 'free'
    if (isPremium.value) return 'premium'
    if (isPro.value) return 'pro'
    return 'free'
  })

  async function init() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = session.user
        await fetchProfile()
      }
    } catch (e) {
      console.error('Auth init error:', e)
    } finally {
      loading.value = false
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user || null
      if (user.value) await fetchProfile()
      else profile.value = null
    })
  }

  async function fetchProfile() {
    if (!user.value?.id) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, direction, onboarding_done, birth_year, gender, height_cm, weight_kg, activity_level, subjects, sports, goal, challenge_start, challenge_end, challenge_duration, updated_at, subscription_plan, subscription_status, subscription_ends_at, trial_ends_at')
        .eq('id', user.value.id)
      if (!error && Array.isArray(data) && data.length > 0) {
        profile.value = data[0]
      }
    } catch (e) {
      console.error('fetchProfile error:', e)
    }
  }

  async function register(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: 'https://dev-ahmedov-elzodbek.github.io/4-oylik-chalange-men-uchun/'
      }
    })
    if (error) throw error
    return data
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://dev-ahmedov-elzodbek.github.io/4-oylik-chalange-men-uchun/'
      }
    })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function updateProfile(updates) {
    if (!user.value?.id) throw new Error('Not logged in')
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.value.id)
    if (error) throw error
    await fetchProfile()
    return profile.value
  }

  return {
    user, profile, loading,
    isLoggedIn, isAdmin, isSuperAdmin, needsOnboarding,
    isPro, isPremium, planName,
    init, register, login, loginWithGoogle, logout, updateProfile, fetchProfile
  }
})
