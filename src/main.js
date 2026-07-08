import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router/index.js'
import { i18n } from './i18n/index.js'
import App from './App.vue'
import './styles/global.css'

// Eski service worker va cache larni tozalash
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister())
  })
}
if ('caches' in window) {
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)))
}

const app = createApp(App)
const pinia = createPinia()

// Global xato boshqaruvi — mobil qurilmada xatoni ekranda ko'rsatadi
function showError(msg) {
  try {
    let el = document.getElementById('gf-err')
    if (!el) {
      el = document.createElement('div')
      el.id = 'gf-err'
      el.style.cssText = 'position:fixed;bottom:76px;left:8px;right:8px;z-index:99999;background:#ef4444;color:#fff;padding:12px 14px;border-radius:12px;font:12px/1.4 -apple-system,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.4);word-break:break-word'
      el.onclick = () => el.remove()
      document.body.appendChild(el)
    }
    el.textContent = '⚠️ ' + msg + '  (yopish uchun bosing)'
  } catch {}
}
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
  showError((err?.message || String(err)) + ' @ ' + info)
}
window.addEventListener('error', e => showError(e.message))
window.addEventListener('unhandledrejection', e => showError('Promise: ' + (e.reason?.message || e.reason)))

app.use(pinia)
app.use(router)
app.use(i18n)
app.mount('#app')

import { useAuthStore } from './stores/auth.js'
const auth = useAuthStore()
auth.init()
