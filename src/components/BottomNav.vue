<template>
  <nav class="bottom-nav">
    <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item">
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ t(item.label) }}</span>
    </router-link>
    <router-link v-if="auth.isAdmin" to="/admin" class="nav-item">
      <span class="nav-icon">👑</span>
      <span class="nav-label">Admin</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'

const { t } = useI18n()
const auth = useAuthStore()

const navItems = [
  { path: '/today', icon: '⚡', label: 'nav.today' },
  { path: '/calendar', icon: '📅', label: 'nav.calendar' },
  { path: '/nutrition', icon: '🍽️', label: 'nav.nutrition' },
  { path: '/stats', icon: '📊', label: 'nav.stats' },
  { path: '/profile', icon: '👤', label: 'nav.profile' },
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  padding: 8px 4px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  z-index: 100;
  backdrop-filter: blur(20px);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-dim);
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.router-link-active {
  color: var(--accent-light);
}

.nav-item.router-link-active .nav-icon {
  transform: scale(1.15);
}

.nav-icon { font-size: 20px; transition: transform 0.2s; }
.nav-label { font-size: 11px; font-weight: 500; text-transform: none; }
</style>
