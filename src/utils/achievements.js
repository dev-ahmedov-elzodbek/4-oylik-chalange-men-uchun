// ============================================================
// GoalFlow — Yutuqlar (Achievements / Badges)
// Foydalanuvchi statistikasidan qaysi nishonlar ochilganini hisoblaydi.
// ============================================================

// Har bir yutuq: { id, icon, title, desc, check(stats) }
// stats = { points, currentStreak, longestStreak, completions, invited, weekPct }
export const ACHIEVEMENTS = [
  // ── Streak ──
  { id: 'streak3',  icon: '🌱', title: 'Boshlanish',   desc: '3 kun ketma-ket',   tier: 'bronze', check: s => s.longestStreak >= 3 },
  { id: 'streak7',  icon: '🔥', title: 'Olov',         desc: '7 kun ketma-ket',   tier: 'silver', check: s => s.longestStreak >= 7 },
  { id: 'streak30', icon: '⚡', title: 'Chaqmoq',       desc: '30 kun ketma-ket',  tier: 'gold',   check: s => s.longestStreak >= 30 },
  { id: 'streak100',icon: '💎', title: 'Olmos iroda',  desc: '100 kun ketma-ket', tier: 'diamond',check: s => s.longestStreak >= 100 },

  // ── Ball ──
  { id: 'pts100',   icon: '⭐', title: 'Birinchi 100', desc: '100 ball to\'plang', tier: 'bronze', check: s => s.points >= 100 },
  { id: 'pts500',   icon: '🌟', title: 'Yulduzcha',    desc: '500 ball to\'plang', tier: 'silver', check: s => s.points >= 500 },
  { id: 'pts1000',  icon: '🏆', title: 'Ming klubi',   desc: '1000 ball to\'plang',tier: 'gold',   check: s => s.points >= 1000 },
  { id: 'pts5000',  icon: '👑', title: 'Afsona',       desc: '5000 ball to\'plang',tier: 'diamond',check: s => s.points >= 5000 },

  // ── Vazifa ──
  { id: 'done10',   icon: '✅', title: 'Faol',          desc: '10 vazifa bajaring', tier: 'bronze', check: s => s.completions >= 10 },
  { id: 'done50',   icon: '💪', title: 'Mehnatkash',    desc: '50 vazifa bajaring', tier: 'silver', check: s => s.completions >= 50 },
  { id: 'done200',  icon: '🚀', title: 'Mashina',       desc: '200 vazifa bajaring',tier: 'gold',   check: s => s.completions >= 200 },

  // ── Ijtimoiy ──
  { id: 'invite1',  icon: '🤝', title: 'Do\'st',        desc: '1 do\'st taklif qiling', tier: 'silver', check: s => s.invited >= 1 },
  { id: 'invite5',  icon: '👥', title: 'Jamoa',         desc: '5 do\'st taklif qiling', tier: 'gold',   check: s => s.invited >= 5 },

  // ── Mukammallik ──
  { id: 'perfect',  icon: '🎯', title: 'Mukammal hafta',desc: 'Haftada 100%',       tier: 'gold',   check: s => s.weekPct >= 100 },
]

export function computeAchievements(stats) {
  const s = {
    points: 0, currentStreak: 0, longestStreak: 0,
    completions: 0, invited: 0, weekPct: 0, ...stats,
  }
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(s) }))
}

export function tierColor(tier) {
  return {
    bronze:  '#b45309',
    silver:  '#9ca3af',
    gold:    '#f59e0b',
    diamond: '#00d4aa',
  }[tier] || '#6c63ff'
}
