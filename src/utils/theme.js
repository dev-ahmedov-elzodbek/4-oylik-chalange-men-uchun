// ============================================================
// GoalFlow — Accent rang tanlash (Pro imkoniyat)
// --accent CSS o'zgaruvchisini almashtiradi.
// ============================================================

export const ACCENTS = {
  purple: { name: 'Binafsha', accent: '#6c63ff', light: '#8b83ff', free: true },
  blue:   { name: 'Ko\'k',    accent: '#3b82f6', light: '#60a5fa', free: false },
  teal:   { name: 'Feruza',  accent: '#00d4aa', light: '#2de0bd', free: false },
  pink:   { name: 'Pushti',  accent: '#ec4899', light: '#f472b6', free: false },
  orange: { name: 'To\'q sariq', accent: '#f59e0b', light: '#fbbf24', free: false },
  red:    { name: 'Qizil',   accent: '#ef4444', light: '#f87171', free: false },
}

export function currentAccent() {
  return localStorage.getItem('gf_accent') || 'purple'
}

export function applyAccent(key) {
  const a = ACCENTS[key] || ACCENTS.purple
  const root = document.documentElement
  root.style.setProperty('--accent', a.accent)
  root.style.setProperty('--accent-light', a.light)
  root.style.setProperty('--accent-dim', a.accent + '26')
  root.style.setProperty('--shadow-accent', `0 0 24px ${a.accent}40`)
}

export function setAccent(key) {
  localStorage.setItem('gf_accent', key)
  applyAccent(key)
}

// Ilova yuklanganda saqlangan rangni qo'llash
export function initAccent() {
  applyAccent(currentAccent())
}
