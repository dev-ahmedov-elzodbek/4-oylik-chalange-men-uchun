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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      profile.value = data
    } catch (e) {
      console.error('fetchProfile error:', e)
    }
  }

  async function register(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
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
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function updateProfile(updates) {
    if (!user.value?.id) throw new Error('Not logged in')
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.value.id)
      .select()
      .single()
    if (error) throw error
    profile.value = data
    return data
  }

  return {
    user, profile, loading,
    isLoggedIn, isAdmin, isSuperAdmin, needsOnboarding,
    init, register, login, loginWithGoogle, logout, updateProfile, fetchProfile
  }
})
