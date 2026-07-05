// ============================================================
// GoalFlow — Feedback: haptic (tebranish), tovush, konfetti
// Hech qanday tashqi kutubxona ishlatmaydi.
// ============================================================

// ── Sozlamalar (localStorage'da saqlanadi) ──
export function feedbackEnabled() {
  return localStorage.getItem('gf_feedback') !== 'off'
}
export function toggleFeedback(on) {
  localStorage.setItem('gf_feedback', on ? 'on' : 'off')
}

// ── Haptic (tebranish) ──
export function vibrate(pattern = 12) {
  if (!feedbackEnabled()) return
  try {
    if (navigator.vibrate) navigator.vibrate(pattern)
  } catch { /* qo'llab-quvvatlanmaydi */ }
}

// ── Tovush (WebAudio — fayl kerak emas) ──
let audioCtx = null
function ctx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)() }
    catch { return null }
  }
  return audioCtx
}

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const c = ctx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g); g.connect(c.destination)
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + dur)
}

// Vazifa belgilanganda — yumshoq "ding"
export function playCheck() {
  if (!feedbackEnabled()) return
  tone(880, 0, 0.12, 'sine', 0.15)
  tone(1320, 0.06, 0.14, 'sine', 0.12)
  vibrate(12)
}

// Vazifa yechildi (bekor qilindi) — past tovush
export function playUncheck() {
  if (!feedbackEnabled()) return
  tone(440, 0, 0.1, 'sine', 0.1)
  vibrate(8)
}

// Daraja oshdi / 100% — g'alaba jarangi
export function playSuccess() {
  if (!feedbackEnabled()) return
  tone(523, 0, 0.15, 'triangle', 0.16)   // C
  tone(659, 0.12, 0.15, 'triangle', 0.16) // E
  tone(784, 0.24, 0.15, 'triangle', 0.16) // G
  tone(1047, 0.36, 0.3, 'triangle', 0.18) // C
  vibrate([15, 40, 15, 40, 30])
}

// ============================================================
// KONFETTI — canvas, kutubxonasiz
// ============================================================
export function confetti(opts = {}) {
  const {
    count = 90,
    duration = 2600,
    colors = ['#6c63ff', '#00d4aa', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
    origin = { x: 0.5, y: 0.35 },
  } = opts

  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  document.body.appendChild(canvas)
  const ctx2d = canvas.getContext('2d')

  let W = canvas.width = window.innerWidth
  let H = canvas.height = window.innerHeight
  const ox = origin.x * W
  const oy = origin.y * H

  const parts = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 7
    return {
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 7,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      life: 1,
    }
  })

  const start = performance.now()
  function frame(now) {
    const elapsed = now - start
    ctx2d.clearRect(0, 0, W, H)
    parts.forEach(p => {
      p.vy += 0.16          // gravitatsiya
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vrot
      p.life = Math.max(0, 1 - elapsed / duration)
      ctx2d.save()
      ctx2d.globalAlpha = p.life
      ctx2d.translate(p.x, p.y)
      ctx2d.rotate(p.rot)
      ctx2d.fillStyle = p.color
      if (p.shape === 'rect') ctx2d.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      else { ctx2d.beginPath(); ctx2d.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx2d.fill() }
      ctx2d.restore()
    })
    if (elapsed < duration) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}

// 100% kun yoki daraja oshgani — konfetti + tovush birga
export function celebrate(opts) {
  confetti(opts)
  playSuccess()
}
