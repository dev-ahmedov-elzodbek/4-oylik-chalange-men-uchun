// ============================================================
// GoalFlow — Haftalik progress kartasini rasm qilib ulashish
// Canvas'da chiroyli branding karta chizadi, keyin ulashadi/yuklaydi.
// ============================================================

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// data = { name, streak, weekPct, points, level, days:[{label, pct}] }
export function renderReportCard(data) {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Fon (gradient) ──
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0b0f1c')
  bg.addColorStop(1, '#12162a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Aksent doiralar
  const orb = ctx.createRadialGradient(880, 200, 0, 880, 200, 400)
  orb.addColorStop(0, 'rgba(108,99,255,0.35)')
  orb.addColorStop(1, 'rgba(108,99,255,0)')
  ctx.fillStyle = orb
  ctx.fillRect(0, 0, W, H)

  // ── Logo ──
  ctx.fillStyle = '#6c63ff'
  roundRect(ctx, 80, 80, 92, 92, 24); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 44px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('GF', 126, 128)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#e4e8f4'
  ctx.font = 'bold 46px sans-serif'
  ctx.fillText('GoalFlow', 195, 112)
  ctx.fillStyle = '#636880'
  ctx.font = '26px sans-serif'
  ctx.fillText('Haftalik hisobot', 195, 150)

  // ── Ism ──
  ctx.fillStyle = '#e4e8f4'
  ctx.font = 'bold 60px sans-serif'
  ctx.fillText(data.name || 'Men', 80, 290)

  // ── Katta streak ──
  ctx.font = 'bold 200px sans-serif'
  const grad = ctx.createLinearGradient(80, 340, 600, 560)
  grad.addColorStop(0, '#f59e0b'); grad.addColorStop(1, '#ef4444')
  ctx.fillStyle = grad
  ctx.fillText(`${data.streak}`, 80, 470)
  ctx.fillStyle = '#636880'
  ctx.font = '38px sans-serif'
  ctx.fillText('kun ketma-ket 🔥', 80, 610)

  // ── Statistika qutilari ──
  const stats = [
    { label: 'Hafta', val: `${data.weekPct}%`, color: '#00d4aa' },
    { label: 'Ball', val: `${data.points}`, color: '#8b83ff' },
    { label: 'Daraja', val: data.level || '—', color: '#f59e0b' },
  ]
  let bx = 80
  const bw = 300, bh = 180, gap = 20
  stats.forEach(s => {
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, bx, 680, bw, bh, 24); ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2
    roundRect(ctx, bx, 680, bw, bh, 24); ctx.stroke()
    ctx.fillStyle = s.color
    ctx.font = 'bold 64px sans-serif'
    ctx.fillText(s.val, bx + 30, 770)
    ctx.fillStyle = '#636880'
    ctx.font = '28px sans-serif'
    ctx.fillText(s.label, bx + 30, 820)
    bx += bw + gap
  })

  // ── Haftalik bar chart ──
  if (data.days?.length) {
    const chartY = 920, chartH = 90, colW = 120
    let cx = 80
    data.days.forEach(d => {
      const h = Math.max(6, (d.pct / 100) * chartH)
      ctx.fillStyle = d.pct >= 80 ? '#00d4aa' : d.pct >= 50 ? '#f59e0b' : '#6c63ff'
      roundRect(ctx, cx, chartY + (chartH - h), 70, h, 10); ctx.fill()
      ctx.fillStyle = '#636880'
      ctx.font = '24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(d.label, cx + 35, chartY + chartH + 40)
      ctx.textAlign = 'left'
      cx += colW
    })
  }

  return canvas
}

// Rasmni ulashish (Web Share) yoki yuklab olish
export async function shareReport(data) {
  const canvas = renderReportCard(data)
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
  if (!blob) return

  const file = new File([blob], 'goalflow-hisobot.png', { type: 'image/png' })

  // Web Share API (mobil) — fayl bilan
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'GoalFlow hisobotim',
        text: `Men ${data.streak} kun ketma-ket maqsadlarim ustida ishlayapman! 🔥 #GoalFlow`,
      })
      return
    } catch { /* bekor qilindi */ }
  }

  // Fallback — yuklab olish
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'goalflow-hisobot.png'
  a.click()
  URL.revokeObjectURL(url)
}
