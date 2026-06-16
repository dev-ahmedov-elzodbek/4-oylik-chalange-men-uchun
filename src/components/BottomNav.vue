<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: $route.path === item.path }"
    >
      <div class="nav-icon-wrap">
        <div v-if="$route.path === item.path" class="nav-active-bg"></div>
        <span class="nav-icon" v-html="item.icon"></span>
      </div>
      <span class="nav-label">{{ t(item.label) }}</span>
    </router-link>

    <button
      class="nav-item"
      :class="{ active: false }"
      @click="$emit('toggle-theme')"
    >
      <div class="nav-icon-wrap">
        <span class="nav-icon" v-html="theme === 'dark' ? sunIcon : moonIcon"></span>
      </div>
      <span class="nav-label">{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
    </button>

    <router-link
      v-if="auth.isAdmin"
      to="/admin"
      class="nav-item nav-admin"
      :class="{ active: $route.path === '/admin' }"
    >
      <div class="nav-icon-wrap">
        <div v-if="$route.path === '/admin'" class="nav-active-bg admin-bg"></div>
        <span class="nav-icon" v-html="shieldIcon"></span>
      </div>
      <span class="nav-label">Admin</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'

defineProps(['theme'])
defineEmits(['toggle-theme'])

const { t } = useI18n()
const auth = useAuthStore()

const boltIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" fill-opacity="0.2"/>
  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const calendarIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" fill-opacity="0.15"/>
  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/>
  <path d="M3 10H21" stroke="currentColor" stroke-width="1.8"/>
  <path d="M8 2V6M16 2V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="8" cy="15" r="1" fill="currentColor"/>
  <circle cx="12" cy="15" r="1" fill="currentColor"/>
  <circle cx="16" cy="15" r="1" fill="currentColor"/>
</svg>`

const alarmIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="13" r="8" fill="currentColor" fill-opacity="0.15"/>
  <circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="1.8"/>
  <path d="M12 9V13L14.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5 3L2 6M22 6L19 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`

const utensilsIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 2C9 2 9 7 9 9C9 10.66 7.66 12 6 12H4C4 12 4 17.5 4 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M6 2V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M3 2V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <rect x="14" y="2" width="6" height="10" rx="3" fill="currentColor" fill-opacity="0.15"/>
  <rect x="14" y="2" width="6" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/>
  <path d="M17 12V21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`

const userIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 21C5 17.134 8.134 14 12 14C15.866 14 19 17.134 19 21" fill="currentColor" fill-opacity="0.15"/>
  <path d="M5 21C5 17.134 8.134 14 12 14C15.866 14 19 17.134 19 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="12" cy="8" r="4" fill="currentColor" fill-opacity="0.15"/>
  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
</svg>`

const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="4" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8"/>
  <path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`

const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3A6 6 0 0 0 21 12A9 9 0 1 1 12 3Z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const shieldIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 22C12 22 4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" fill="currentColor" fill-opacity="0.15"/>
  <path d="M12 22C12 22 4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const navItems = [
  { path: '/today',     icon: boltIcon,     label: 'nav.today' },
  { path: '/calendar',  icon: calendarIcon, label: 'nav.calendar' },
  { path: '/alarm',     icon: alarmIcon,    label: 'nav.alarm' },
  { path: '/nutrition', icon: utensilsIcon, label: 'nav.nutrition' },
  { path: '/profile',   icon: userIcon,     label: 'nav.profile' },
]
</script>

<style scoped>
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  padding: 6px 4px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
  transition: background 0.3s, border-color 0.3s;
  height: var(--nav-h);
}
[data-theme="light"] .bottom-nav {
  box-shadow: 0 -4px 24px rgba(108,99,255,0.08);
}
@media (min-width: 768px) { .bottom-nav { display: none; } }

.nav-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  padding: 4px 2px; border-radius: var(--radius-sm);
  text-decoration: none; color: var(--text-dim);
  transition: color 0.2s; border: none; background: none;
  cursor: pointer; font-family: var(--font-body); min-width: 0;
  position: relative;
}
.nav-item:hover { color: var(--text); }
.nav-item.active { color: var(--accent-light); }
[data-theme="light"] .nav-item.active { color: var(--accent); }

.nav-icon-wrap {
  position: relative;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
}

.nav-active-bg {
  position: absolute; inset: 0;
  background: rgba(108,99,255,0.14);
  border-radius: 10px;
  animation: scaleIn 0.2s var(--ease-spring);
}
.admin-bg { background: rgba(245,158,11,0.14); }
[data-theme="light"] .nav-active-bg { background: rgba(108,99,255,0.1); }

.nav-icon {
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 1;
  transition: transform 0.2s var(--ease-spring);
}
.nav-item.active .nav-icon { transform: scale(1.12); }
.nav-item.active .nav-icon svg { filter: drop-shadow(0 0 6px rgba(108,99,255,0.5)); }
[data-theme="light"] .nav-item.active .nav-icon svg { filter: drop-shadow(0 0 6px rgba(108,99,255,0.3)); }

.nav-label {
  font-size: 10px; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  transition: color 0.2s;
}

.nav-admin { color: #f59e0b; }
.nav-admin.active { color: #f59e0b; }
.nav-admin.active .nav-icon svg { filter: drop-shadow(0 0 6px rgba(245,158,11,0.5)); }

@keyframes scaleIn {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
