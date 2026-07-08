-- ============================================================
-- GoalFlow — Moliya (kirim/chiqim) tizimi
-- Foydalanuvchi o'z kirim/chiqimini kiritadi, admin barchasini ko'radi.
-- ============================================================

CREATE TABLE IF NOT EXISTS finance_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  category    TEXT,
  note        TEXT,
  entry_date  DATE NOT NULL DEFAULT current_date,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS finance_user_idx ON finance_entries(user_id, entry_date);

ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;

-- Foydalanuvchi o'zinikini boshqaradi; admin/superadmin barchasini o'qiydi
DROP POLICY IF EXISTS "finance_select" ON finance_entries;
CREATE POLICY "finance_select" ON finance_entries FOR SELECT
  USING (auth.uid() = user_id OR public.get_my_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "finance_insert" ON finance_entries;
CREATE POLICY "finance_insert" ON finance_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_update" ON finance_entries;
CREATE POLICY "finance_update" ON finance_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_delete" ON finance_entries;
CREATE POLICY "finance_delete" ON finance_entries FOR DELETE
  USING (auth.uid() = user_id OR public.get_my_role() IN ('admin', 'superadmin'));

-- ── Admin: har bir foydalanuvchi bo'yicha jamlanma ──
CREATE OR REPLACE FUNCTION public.get_finance_by_user()
RETURNS TABLE (
  user_id      UUID,
  display_name TEXT,
  email        TEXT,
  income       NUMERIC,
  expense      NUMERIC,
  balance      NUMERIC,
  entries      BIGINT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    p.id,
    COALESCE(NULLIF(p.full_name, ''), 'Foydalanuvchi'),
    p.email,
    COALESCE(SUM(f.amount) FILTER (WHERE f.type = 'income'), 0),
    COALESCE(SUM(f.amount) FILTER (WHERE f.type = 'expense'), 0),
    COALESCE(SUM(f.amount) FILTER (WHERE f.type = 'income'), 0)
      - COALESCE(SUM(f.amount) FILTER (WHERE f.type = 'expense'), 0),
    COUNT(f.id)
  FROM profiles p
  JOIN finance_entries f ON f.user_id = p.id
  WHERE public.get_my_role() IN ('admin', 'superadmin')
  GROUP BY p.id, p.full_name, p.email
  ORDER BY COALESCE(SUM(f.amount) FILTER (WHERE f.type = 'expense'), 0) DESC;
$$;
GRANT EXECUTE ON FUNCTION public.get_finance_by_user() TO authenticated;

-- ── Admin: oylik jamlanma (chart uchun) ──
CREATE OR REPLACE FUNCTION public.get_finance_monthly()
RETURNS TABLE (ym TEXT, income NUMERIC, expense NUMERIC)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    to_char(date_trunc('month', f.entry_date), 'YYYY-MM'),
    COALESCE(SUM(f.amount) FILTER (WHERE f.type = 'income'), 0),
    COALESCE(SUM(f.amount) FILTER (WHERE f.type = 'expense'), 0)
  FROM finance_entries f
  WHERE public.get_my_role() IN ('admin', 'superadmin')
  GROUP BY 1
  ORDER BY 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_finance_monthly() TO authenticated;
