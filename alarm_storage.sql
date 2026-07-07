-- ============================================================
-- GoalFlow — Budilnik uchun o'z musiqasini yuklash
-- Supabase Storage bucket + alarms.sound_url ustuni
-- ============================================================

-- 1. Budilnikка audio URL ustuni
ALTER TABLE alarms ADD COLUMN IF NOT EXISTS sound_url TEXT;

-- 2. Storage bucket (ochiq — URL orqali o'qiladi)
INSERT INTO storage.buckets (id, name, public)
VALUES ('alarm-sounds', 'alarm-sounds', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS: foydalanuvchi faqat o'z papkasiga yuklaydi
DROP POLICY IF EXISTS "alarm_sounds_insert" ON storage.objects;
CREATE POLICY "alarm_sounds_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'alarm-sounds' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "alarm_sounds_read" ON storage.objects;
CREATE POLICY "alarm_sounds_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'alarm-sounds');

DROP POLICY IF EXISTS "alarm_sounds_delete" ON storage.objects;
CREATE POLICY "alarm_sounds_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'alarm-sounds' AND (storage.foldername(name))[1] = auth.uid()::text);
