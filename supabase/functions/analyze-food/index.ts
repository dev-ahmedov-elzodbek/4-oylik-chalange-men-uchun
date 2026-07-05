// ─────────────────────────────────────────────────────────────────────────────
// GoalFlow — Ovqat rasmini AI bilan tahlil qilish (Supabase Edge Function)
// Deploy: supabase functions deploy analyze-food
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Nega Edge Function? — Anthropic API kalitini brauzerga qo'yib bo'lmaydi
// (o'g'irlanadi). Kalit shu yerda, serverda saqlanadi.
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const MODEL = 'claude-opus-4-8'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { image_base64, media_type = 'image/jpeg' } = await req.json()
    if (!image_base64) {
      return json({ error: 'Rasm yuborilmadi' }, 400)
    }
    if (!ANTHROPIC_API_KEY) {
      return json({ error: 'AI sozlanmagan (ANTHROPIC_API_KEY yo\'q)' }, 500)
    }

    const prompt = `Bu rasmda qanday ovqat bor? Taxminiy kaloriya, oqsil, uglevod va yog' miqdorini aniqlang. FAQAT JSON qaytaring, boshqa matn yozmang: {"meal_name": "ovqat nomi o'zbekcha", "calories": 000, "protein_g": 00, "carbs_g": 00, "fat_g": 00}`

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type, data: image_base64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      return json({ error: 'AI xatosi', detail: errText.slice(0, 200) }, 502)
    }

    const data = await aiRes.json()
    const text = data?.content?.[0]?.text || ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return json({ error: 'Tahlil qilib bo\'lmadi' }, 422)

    const parsed = JSON.parse(match[0])
    return json({
      meal_name: parsed.meal_name || 'Ovqat',
      calories: Number(parsed.calories) || 0,
      protein_g: Number(parsed.protein_g) || 0,
      carbs_g: Number(parsed.carbs_g) || 0,
      fat_g: Number(parsed.fat_g) || 0,
    })
  } catch (e) {
    return json({ error: 'Server xatosi', detail: String(e).slice(0, 200) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
