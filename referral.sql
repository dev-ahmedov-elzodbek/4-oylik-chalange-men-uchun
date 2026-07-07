-- ============================================================
-- GoalFlow — Do'st taklif (Referral) tizimi
-- Har bir foydalanuvchida referral_code; do'st kodni kiritsa,
-- ikkalasi ham +50 bonus ball oladi (leaderboard'da ko'rinadi).
-- ============================================================

-- 1. profiles'ga referral_code ustuni
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Mavjud foydalanuvchilarga kod berish (id md5 dan)
UPDATE profiles
SET referral_code = UPPER(SUBSTR(MD5(id::text), 1, 6))
WHERE referral_code IS NULL;

-- Unikal indeks
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_idx ON profiles(referral_code);

-- Yangi foydalanuvchiga avtomatik kod (trigger handle_new_user ichida ham bo'lardi,
-- lekin kafolat uchun default trigger)
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTR(MD5(NEW.id::text), 1, 6));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_referral_code ON profiles;
CREATE TRIGGER trg_set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- 2. referrals jadvali
CREATE TABLE IF NOT EXISTS referrals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE, -- har kim faqat bir marta taklif qilinadi
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_view" ON referrals;
CREATE POLICY "referrals_view" ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- 3. Kodni ishlatish (redeem) — SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.redeem_referral(code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me     UUID := auth.uid();
  ref_id UUID;
BEGIN
  IF me IS NULL THEN RETURN 'error:auth'; END IF;

  SELECT id INTO ref_id FROM profiles WHERE referral_code = UPPER(TRIM(code)) LIMIT 1;
  IF ref_id IS NULL THEN RETURN 'error:notfound'; END IF;
  IF ref_id = me   THEN RETURN 'error:self'; END IF;

  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = me) THEN
    RETURN 'error:already';
  END IF;

  INSERT INTO referrals (referrer_id, referred_id) VALUES (ref_id, me);
  RETURN 'ok';
END $$;

GRANT EXECUTE ON FUNCTION public.redeem_referral(TEXT) TO authenticated;

-- 4. Mening referral ma'lumotim
CREATE OR REPLACE FUNCTION public.get_my_referral()
RETURNS TABLE (code TEXT, invited_count BIGINT, was_referred BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.referral_code,
    (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = p.id)::BIGINT,
    EXISTS (SELECT 1 FROM referrals r WHERE r.referred_id = p.id)
  FROM profiles p WHERE p.id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_referral() TO authenticated;

-- 5. Leaderboard'ni bonus ball bilan yangilash (50 ball / taklif + 50 taklif qilingani uchun)
CREATE OR REPLACE FUNCTION public.get_leaderboard(lim INT DEFAULT 50)
RETURNS TABLE (
  user_id      UUID,
  display_name TEXT,
  points       BIGINT,
  done_count   BIGINT,
  rank         BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      p.id,
      COALESCE(NULLIF(p.full_name, ''), 'Foydalanuvchi') AS display_name,
      COALESCE(SUM(t.points), 0)                         AS task_pts,
      COUNT(tc.task_id)                                  AS done_count
    FROM profiles p
    LEFT JOIN task_completions tc ON tc.user_id = p.id
    LEFT JOIN tasks t             ON t.id = tc.task_id
    GROUP BY p.id, p.full_name
  ),
  scored AS (
    SELECT
      b.id, b.display_name, b.done_count,
      b.task_pts
        + 50 * (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = b.id)
        + (CASE WHEN EXISTS (SELECT 1 FROM referrals r WHERE r.referred_id = b.id) THEN 50 ELSE 0 END)
        AS points
    FROM base b
  )
  SELECT
    id, display_name, points::BIGINT, done_count::BIGINT,
    RANK() OVER (ORDER BY points DESC)::BIGINT
  FROM scored
  ORDER BY points DESC
  LIMIT lim;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT) TO anon, authenticated;
