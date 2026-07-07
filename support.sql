-- ============================================================
-- GoalFlow — Support (Yordam) real-time chat
-- Foydalanuvchi yozadi, admin/superadmin javob beradi.
-- Supabase Realtime orqali jonli yangilanadi.
-- ============================================================

CREATE TABLE IF NOT EXISTS support_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- suhbat egasi
  sender      TEXT NOT NULL CHECK (sender IN ('user', 'admin')),        -- kim yozdi
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_user_idx ON support_messages(user_id, created_at);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Foydalanuvchi o'z suhbatini ko'radi; admin/superadmin barchasini
DROP POLICY IF EXISTS "support_select" ON support_messages;
CREATE POLICY "support_select" ON support_messages FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_my_role() IN ('admin', 'superadmin')
  );

-- Foydalanuvchi o'z suhbatiga 'user' xabar qo'shadi
DROP POLICY IF EXISTS "support_insert_user" ON support_messages;
CREATE POLICY "support_insert_user" ON support_messages FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND sender = 'user')
    OR public.get_my_role() IN ('admin', 'superadmin')
  );

-- Admin xabarlarni o'qilgan deb belgilashi / yangilashi mumkin
DROP POLICY IF EXISTS "support_update" ON support_messages;
CREATE POLICY "support_update" ON support_messages FOR UPDATE
  USING (auth.uid() = user_id OR public.get_my_role() IN ('admin', 'superadmin'));

-- Realtime uchun jadvalni publication'ga qo'shish
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- Admin uchun: suhbatlar ro'yxati (oxirgi xabar bilan)
CREATE OR REPLACE FUNCTION public.get_support_threads()
RETURNS TABLE (
  user_id      UUID,
  display_name TEXT,
  email        TEXT,
  last_message TEXT,
  last_at      TIMESTAMPTZ,
  unread       BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.user_id,
    COALESCE(NULLIF(p.full_name, ''), 'Foydalanuvchi'),
    p.email,
    (SELECT message FROM support_messages x WHERE x.user_id = m.user_id ORDER BY created_at DESC LIMIT 1),
    MAX(m.created_at),
    COUNT(*) FILTER (WHERE m.sender = 'user' AND m.is_read = FALSE)
  FROM support_messages m
  JOIN profiles p ON p.id = m.user_id
  WHERE public.get_my_role() IN ('admin', 'superadmin')
  GROUP BY m.user_id, p.full_name, p.email
  ORDER BY MAX(m.created_at) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_support_threads() TO authenticated;
