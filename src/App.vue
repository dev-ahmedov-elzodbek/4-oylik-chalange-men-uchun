<template>
  <div class="app">
    <div class="noise"></div>
    
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <div class="logo">EZ</div>
        <div class="header-title">
          <h1>4 OYLIK CHALLENGE</h1>
          <span class="subtitle">Mar 19 → Jul 19, 2026</span>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-chip">
          <span class="stat-icon">🔥</span>
          <span class="stat-val">{{ store.currentStreak }}</span>
          <span class="stat-label">kun ketma-ket</span>
        </div>
        <div class="stat-chip">
          <span class="stat-icon">⚡</span>
          <span class="stat-val">{{ store.totalPointsEarned }}</span>
          <span class="stat-label">umumiy ball</span>
        </div>
        <div class="stat-chip">
          <span class="stat-icon">📅</span>
          <span class="stat-val">{{ store.daysPassed }}/{{ store.totalDays }}</span>
          <span class="stat-label">kun</span>
        </div>
      </div>
    </header>

    <!-- Progress Bar -->
    <div class="master-progress">
      <div class="mp-label">
        <span>UMUMIY PROGRESS</span>
        <span class="mp-pct">{{ store.overallProgress }}%</span>
      </div>
      <div class="mp-bar">
        <div class="mp-fill" :style="{ width: store.overallProgress + '%' }">
          <div class="mp-glow"></div>
        </div>
      </div>
    </div>

    <!-- Nav Tabs -->
    <nav class="nav-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="nav-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </nav>

    <!-- Content -->
    <main class="content">
      <!-- TODAY TAB -->
      <div v-if="activeTab === 'today'" class="tab-content">
        <TodayView />
      </div>

      <!-- CALENDAR TAB -->
      <div v-if="activeTab === 'calendar'" class="tab-content">
        <CalendarView />
      </div>

      <!-- STATS TAB -->
      <div v-if="activeTab === 'stats'" class="tab-content">
        <StatsView />
      </div>

      <!-- SCHEDULE TAB -->
      <div v-if="activeTab === 'schedule'" class="tab-content">
        <ScheduleView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChallengeStore } from './stores/challenge.js'
import TodayView from './views/TodayView.vue'
import CalendarView from './views/CalendarView.vue'
import StatsView from './views/StatsView.vue'
import ScheduleView from './views/ScheduleView.vue'

const store = useChallengeStore()
const activeTab = ref('today')

const tabs = [
  { id: 'today', icon: '⚡', label: 'Bugun' },
  { id: 'calendar', icon: '📅', label: 'Kalendar' },
  { id: 'stats', icon: '📊', label: 'Statistika' },
  { id: 'schedule', icon: '🗓️', label: 'Jadval' },
]
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #080b14;
  --surface: #0f1420;
  --surface2: #161c2d;
  --border: rgba(255,255,255,0.07);
  --text: #e8eaf0;
  --text-dim: #6b7280;
  --accent: #f0c040;
  --accent2: #40e0c0;
  --accent3: #e040b0;
  --font-display: 'Syne', sans-serif;
  --font-mono: 'Space Mono', monospace;
  --font-body: 'DM Sans', sans-serif;
}

html, body { height: 100%; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  min-height: 100vh;
  overflow-x: hidden;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px 80px;
  position: relative;
}

.noise {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

/* HEADER */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  width: 48px;
  height: 48px;
  background: var(--accent);
  color: #000;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.header-title h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 0.05em;
  color: var(--text);
}

.header-title .subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-dim);
}

.header-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-chip {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon { font-size: 14px; }
.stat-val {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 15px;
  color: var(--accent);
}
.stat-label {
  font-size: 11px;
  color: var(--text-dim);
}

/* MASTER PROGRESS */
.master-progress {
  margin-bottom: 20px;
}

.mp-label {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 6px;
  letter-spacing: 0.1em;
}

.mp-pct { color: var(--accent); font-weight: 700; }

.mp-bar {
  height: 6px;
  background: var(--surface2);
  border-radius: 3px;
  overflow: hidden;
}

.mp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  border-radius: 3px;
  position: relative;
  transition: width 0.8s ease;
}

.mp-glow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: var(--accent2);
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.8;
}

/* NAV TABS */
.nav-tabs {
  display: flex;
  gap: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 4px;
  margin-bottom: 24px;
}

.nav-tab {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-dim);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-tab:hover { color: var(--text); background: var(--surface2); }
.nav-tab.active {
  background: var(--accent);
  color: #000;
  font-weight: 700;
}

/* CONTENT */
.content { position: relative; z-index: 1; }
.tab-content { animation: fadeIn 0.3s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* SHARED COMPONENTS */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  text-transform: uppercase;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-ring-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* SCROLLBAR */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 2px; }
</style>
