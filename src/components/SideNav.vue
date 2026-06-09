<template>
  <aside class="side-nav" :class="{ collapsed }">
    <div class="sn-logo" @click="$router.push('/today')">
      <div class="sn-logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" fill-opacity="0.3"/>
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <transition name="fade"><span v-if="!collapsed" class="sn-logo-text">GoalFlow</span></transition>
    </div>

    <nav class="sn-links">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="sn-item">
        <span class="sn-icon" v-html="item.icon"></span>
        <transition name="fade"><span v-if="!collapsed" class="sn-label">{{ t(item.label) }}</span></transition>
      </router-link>
    </nav>

    <div class="sn-bottom">
      <router-link v-if="auth.isAdmin" to="/admin" class="sn-item sn-admin">
        <span class="sn-icon" v-html="shieldIcon"></span>
        <transition name="fade"><span v-if="!collapsed" class="sn-label">Admin</span></transition>
      </router-link>

      <button class="sn-item" @click="$emit('toggle-theme')">
        <span class="sn-icon" v-html="theme === 'dark' ? sunIcon : moonIcon"></span>
        <transition name="fade"><span v-if="!collapsed" class="sn-label">{{ theme === 'dark' ? 'Light' : 'Dark' }}</span></transition>
      </button>

      <button class="sn-item sn-collapse" @click="$emit('toggle-collapse')">
        <span class="sn-icon" v-html="collapsed ? chevronRightIcon : chevronLeftIcon"></span>
        <transition name="fade"><span v-if="!collapsed" class="sn-label">Yig'ish</span></transition>
      </button>

      <div class="sn-user" v-if="auth.profile">
        <div class="sn-avatar">{{ auth.profile.full_name?.[0]?.toUpperCase() || 'U' }}</div>
        <transition name="fade">
          <div v-if="!collapsed" class="sn-user-info">
            <div class="sn-user-name">{{ auth.profile.full_name || 'Foydalanuvchi' }}</div>
            <div class="sn-user-role">{{ roleLabel }}</div>
          </div>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps(['theme', 'collapsed'])
defineEmits(['toggle-theme', 'toggle-collapse'])

const { t } = useI18n()
const auth = useAuthStore()

const roleLabel = computed(() => {
  const r = auth.profile?.role
  return r === 'superadmin' ? 'SuperAdmin' : r === 'admin' ? 'Admin' : 'User'
})

const boltIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" fill-opacity="0.2"/><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const calendarIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" fill-opacity="0.2"/><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 10H21" stroke="currentColor" stroke-width="1.8"/><path d="M8 2V6M16 2V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></svg>`

const alarmIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="13" r="8" fill="currentColor" fill-opacity="0.2"/><circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 9V13L14.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 3L2 6M22 6L19 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`

const utensilsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2C9 2 9 7 9 9C9 10.66 7.66 12 6 12H4C4 12 4 17.5 4 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 2V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 2V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="14" y="2" width="6" height="10" rx="3" fill="currentColor" fill-opacity="0.2"/><rect x="14" y="2" width="6" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M17 12V21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`

const barChartIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/><rect x="10" y="6" width="4" height="15" rx="1" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8"/><rect x="17" y="9" width="4" height="12" rx="1" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/></svg>`

const userIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="8" r="4" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/></svg>`

const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8"/><path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`

const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3A6 6 0 0 0 21 12A9 9 0 1 1 12 3Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const shieldIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C12 22 4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const chevronLeftIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const chevronRightIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const navItems = [
  { path: '/today',     icon: boltIcon,     label: 'nav.today' },
  { path: '/calendar',  icon: calendarIcon, label: 'nav.calendar' },
  { path: '/alarm',     icon: alarmIcon,    label: 'nav.alarm' },
  { path: '/nutrition', icon: utensilsIcon, label: 'nav.nutrition' },
  { path: '/stats',     icon: barChartIcon, label: 'nav.stats' },
  { path: '/profile',   icon: userIcon,     label: 'nav.profile' },
]
</script>

<style scoped>
.side-nav { display: none; }
@media (min-width: 768px) {
  .side-nav {
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; bottom: 0;
    width: var(--sidebar-w, 220px);
    background: var(--surface);
    border-right: 1px solid var(--border);
    z-index: 100;
    transition: width 0.3s;
    overflow: hidden;
  }
  .side-nav.collapsed { width: 64px; }
}
.sn-logo { display: flex; align-items: center; gap: 10px; padding: 20px 16px 16px; cursor: pointer; overflow: hidden; }
.sn-logo-icon { width: 36px; height: 36px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sn-logo-text { font-family: var(--font-display); font-weight: 800; font-size: 18px; white-space: nowrap; }
.sn-links { flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.sn-bottom { padding: 8px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 2px; }
.sn-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm); text-decoration: none; color: var(--text-dim); transition: all 0.2s; border: none; background: none; cursor: pointer; font-family: var(--font-body); font-size: 14px; white-space: nowrap; width: 100%; }
.sn-item:hover { background: var(--surface2); color: var(--text); }
.sn-item.router-link-active { background: rgba(108,99,255,0.12); color: var(--accent-light); }
.sn-item.router-link-active .sn-icon { filter: drop-shadow(0 0 4px rgba(108,99,255,0.4)); }
[data-theme="light"] .sn-item.router-link-active { background: rgba(108,99,255,0.08); color: var(--accent); }
.sn-icon { width: 18px; height: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.sn-label { flex: 1; text-align: left; }
.sn-admin { color: #f59e0b; }
.sn-admin:hover { background: rgba(245,158,11,0.08); }
.sn-user { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-top: 4px; overflow: hidden; }
.sn-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
.sn-user-info { overflow: hidden; }
.sn-user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sn-user-role { font-size: 11px; color: var(--text-dim); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
