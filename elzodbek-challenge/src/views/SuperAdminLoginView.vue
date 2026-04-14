<template>
  <div class="superadmin-login-page">
    <div class="bg-orb orb1"></div>
    <div class="bg-orb orb2"></div>

    <div class="login-container">
      <div class="logo">
        <div class="logo-box">👑</div>
        <div>
          <h1>SuperAdmin Panel</h1>
          <p>Bosh administrator kirishi</p>
        </div>
      </div>

      <div class="login-form">
        <!-- Step 1: SuperAdmin maxfiy kalit -->
        <div v-if="step === 1">
          <div class="role-info">
            <span class="role-badge">👑 SuperAdmin</span>
            <p class="role-desc">Barcha foydalanuvchilar va adminlarni boshqaradi</p>
          </div>
          <div class="form-group">
            <label class="label">SuperAdmin maxfiy kalit</label>
            <div class="password-wrap">
              <input
                v-model="superKey"
                class="input"
                :type="showKey ? 'text' : 'password'"
                placeholder="••••••••••••"
                @keyup.enter="checkSuperKey"
              />
              <button class="pass-toggle" @click="showKey = !showKey">
                {{ showKey ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div v-if="keyError" class="error-msg">⚠️ {{ keyError }}</div>
          <button class="btn-super btn-full" @click="checkSuperKey">Davom etish →</button>
        </div>

        <!-- Step 2: Email + parol -->
        <div v-if="step === 2">
          <div class="step-badge">👑 SuperAdmin kalit tasdiqlandi</div>
          <div class="form-group">
            <label class="label">Email</label>
            <input v-model="email" class="input" type="email" placeholder="superadmin@example.com" @keyup.enter="doLogin" />
          </div>
          <div class="form-group">
            <label class="label">Parol</label>
            <div class="password-wrap">
              <input v-model="password" class="input" :type="showPass ? 'text' : 'password'" placeholder="••••••••" @keyup.enter="doLogin" />
              <button class="pass-toggle" @click="showPass = !showPass">{{ showPass ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          <div v-if="loginError" class="error-msg">⚠️ {{ loginError }}</div>
          <button class="btn-super btn-full" :disabled="loading" @click="doLogin">
            <span v-if="loading" class="spinner"></span>
            Kirish
          </button>
          <button class="btn btn-outline btn-full" style="margin-top:8px" @click="step=1">← Orqaga</button>
        </div>
      </div>

      <div class="back-link">
        <router-link to="/">← Asosiyga</router-link>
        &nbsp;·&nbsp;
        <router-link to="/admin-login">🛡️ Admin kirish</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const SUPERADMIN_SECRET_KEY = import.meta.env.VITE_SUPERADMIN_SECRET_KEY || 'goalflow-superadmin-ultra-2026'

const step = ref(1)
const superKey = ref('')
const email = ref('')
const password = ref('')
const showKey = ref(false)
const showPass = ref(false)
const keyError = ref('')
const loginError = ref('')
const loading = ref(false)

function checkSuperKey() {
  if (!superKey.value) { keyError.value = 'Kalit kiriting'; return }
  if (superKey.value !== SUPERADMIN_SECRET_KEY) { keyError.value = "Noto'g'ri kalit!"; return }
  keyError.value = ''
  step.value = 2
}

async function doLogin() {
  if (!email.value || !password.value) { loginError.value = 'Email va parol kiriting'; return }
  loading.value = true
  loginError.value = ''
  try {
    await auth.login(email.value, password.value)
    await auth.fetchProfile()

    if (auth.profile?.role === 'admin') {
      await auth.logout()
      loginError.value = 'Admin hisobi! /admin-login dan kiring.'
      return
    }
    if (auth.profile?.role !== 'superadmin') {
      await auth.logout()
      loginError.value = 'Bu akkaunt superadmin huquqiga ega emas!'
      return
    }
    router.push('/superadmin')
  } catch (e) {
    loginError.value = "Email yoki parol noto'g'ri"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.superadmin-login-page {
  min-height: 100vh; display: flex; align-items: center;
  justify-content: center; padding: 24px 16px;
  position: relative; overflow: hidden; background: var(--bg);
}
.bg-orb { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.2; pointer-events: none; }
.orb1 { width: 400px; height: 400px; background: #f59e0b; top: -100px; right: -100px; }
.orb2 { width: 300px; height: 300px; background: #ef4444; bottom: -50px; left: -50px; }
.login-container { width: 100%; max-width: 400px; position: relative; z-index: 1; }
.logo { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
.logo-box {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  border-radius: 16px; display: flex; align-items: center; justify-content: center;
  font-size: 28px; box-shadow: 0 0 30px rgba(245,158,11,0.5); flex-shrink: 0;
}
.logo h1 { font-family: var(--font-display); font-weight: 800; font-size: 22px; }
.logo p { font-size: 13px; color: var(--text-dim); }
.login-form {
  background: var(--surface);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: var(--radius); padding: 24px;
  box-shadow: 0 0 40px rgba(245,158,11,0.08);
}
.role-info { margin-bottom: 20px; }
.role-badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2));
  border: 1px solid rgba(245,158,11,0.4);
  color: #f59e0b; padding: 6px 14px; border-radius: 20px;
  font-size: 13px; font-weight: 700;
}
.role-desc { font-size: 12px; color: var(--text-dim); margin-top: 6px; }
.step-badge {
  background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4);
  color: #f59e0b; padding: 8px 12px; border-radius: var(--radius-sm);
  font-size: 13px; margin-bottom: 16px; text-align: center;
}
.btn-super {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: white; border: none; padding: 14px; border-radius: var(--radius-sm);
  font-weight: 700; font-size: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity 0.2s;
}
.btn-full { width: 100%; }
.btn-super:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-super:hover:not(:disabled) { opacity: 0.9; }
.password-wrap { position: relative; }
.password-wrap .input { padding-right: 44px; }
.pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; }
.error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 12px; }
.back-link { text-align: center; margin-top: 20px; }
.back-link a { font-size: 13px; color: var(--text-dim); text-decoration: none; }
.back-link a:hover { color: var(--accent-light); }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
