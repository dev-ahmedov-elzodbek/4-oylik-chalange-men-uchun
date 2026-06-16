-- =====================================================================
-- GoalFlow — Subscription SQL (Supabase SQL Editor ga joylashtiring)
-- Xavfsiz: agar jadval/ustun allaqachon bo'lsa xato bermaydi
-- =====================================================================

-- ── 1. profiles jadvaliga subscription ustunlari ───────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_plan    TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status  TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at        TIMESTAMPTZ;

-- Constraint (avval o'chirib keyin qo'shish)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_plan_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_subscription_plan_check
    CHECK (subscription_plan IN ('free', 'pro', 'premium'));

-- ── 2. Subscription rejalari jadvali ──────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  price_monthly INTEGER     DEFAULT 0,
  price_yearly  INTEGER     DEFAULT 0,
  features      JSONB       DEFAULT '[]',
  limits        JSONB       DEFAULT '{}',
  is_active     BOOLEAN     DEFAULT TRUE,
  sort_order    INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Boshlang'ich rejalar (mavjud bo'lsa o'tkazib yuboradi)
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features, limits, sort_order)
VALUES
  (
    'Free', 'free', 0, 0,
    '["Kunlik vazifalar (20 ta)", "Oddiy statistika", "Ovqatlanish kuzatuvi"]',
    '{"max_tasks": 20, "max_personal_tasks": 5, "export": false, "ai": false}',
    1
  ),
  (
    'Pro', 'pro', 69000, 588000,
    '["Cheksiz vazifalar", "Kengaytirilgan statistika", "Export (CSV/PDF)", "AI tavsiyalar"]',
    '{"max_tasks": null, "max_personal_tasks": null, "export": true, "ai": true}',
    2
  ),
  (
    'Premium', 'premium', 169000, 1428000,
    '["Pro imkoniyatlari", "Jamoa boshqaruvi (10 nafar)", "Murabbiy paneli", "API integratsiya"]',
    '{"max_tasks": null, "max_personal_tasks": null, "export": true, "ai": true, "team": true}',
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Subscriptions jadvali ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id         UUID        REFERENCES subscription_plans(id) NOT NULL,
  plan_slug       TEXT        NOT NULL,
  billing_cycle   TEXT        DEFAULT 'monthly',
  status          TEXT        DEFAULT 'active',
  payment_method  TEXT,
  payment_ref     TEXT,
  amount_paid     INTEGER     DEFAULT 0,
  starts_at       TIMESTAMPTZ DEFAULT NOW(),
  ends_at         TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. To'lov qaydlari ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_logs (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID        REFERENCES subscriptions(id) ON DELETE SET NULL,
  payment_method  TEXT        NOT NULL,
  transaction_id  TEXT,
  amount          INTEGER     NOT NULL,
  currency        TEXT        DEFAULT 'UZS',
  status          TEXT        DEFAULT 'pending',
  payload         JSONB       DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Promo-kodlar ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  code            TEXT        NOT NULL UNIQUE,
  discount_pct    INTEGER     DEFAULT 0,
  discount_amount INTEGER     DEFAULT 0,
  plan_slug       TEXT,
  max_uses        INTEGER,
  uses_count      INTEGER     DEFAULT 0,
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN     DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_code_uses (
  id        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_id  UUID        REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id   UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  used_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(promo_id, user_id)
);

-- ── 6. Indexlar ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_ends_at ON subscriptions(ends_at);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id  ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status   ON payment_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_txn      ON payment_logs(transaction_id);

-- ── 7. Row Level Security ──────────────────────────────────────────
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses     ENABLE ROW LEVEL SECURITY;

-- Eski policy'larni o'chirish (qayta ishga tushirishda xato bermasin)
DROP POLICY IF EXISTS "plans_public_read"       ON subscription_plans;
DROP POLICY IF EXISTS "subscriptions_own_read"  ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_own_insert" ON subscriptions;
DROP POLICY IF EXISTS "payment_logs_own_read"   ON payment_logs;
DROP POLICY IF EXISTS "payment_logs_own_insert" ON payment_logs;
DROP POLICY IF EXISTS "promo_codes_public_read" ON promo_codes;
DROP POLICY IF EXISTS "promo_uses_own"          ON promo_code_uses;

-- Yangi policy'lar
CREATE POLICY "plans_public_read"
  ON subscription_plans FOR SELECT USING (true);

CREATE POLICY "subscriptions_own_read"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_own_insert"
  ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_logs_own_read"
  ON payment_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_logs_own_insert"
  ON payment_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "promo_codes_public_read"
  ON promo_codes FOR SELECT USING (is_active = true);

CREATE POLICY "promo_uses_own"
  ON promo_code_uses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 8. Trigger: updated_at avtomatik ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 9. Aktiv obunani olish funksiyasi ─────────────────────────────
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS SETOF subscriptions
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT * FROM subscriptions
  WHERE user_id = p_user_id
    AND status IN ('active', 'trialing')
    AND (ends_at IS NULL OR ends_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- ── 10. Obuna muddati tugagan bo'lsa free ga tushirish ────────────
CREATE OR REPLACE FUNCTION expire_old_subscriptions()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE subscriptions
    SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND ends_at < NOW();

  UPDATE profiles
    SET subscription_plan = 'free', subscription_status = 'expired'
  WHERE id IN (
    SELECT DISTINCT user_id FROM subscriptions
    WHERE status = 'expired'
      AND updated_at > NOW() - INTERVAL '5 minutes'
  );
END;
$$;

-- ── 11. To'lovdan so'ng subscription faollashtirish ───────────────
CREATE OR REPLACE FUNCTION activate_subscription(
  p_user_id        UUID,
  p_plan_slug      TEXT,
  p_billing_cycle  TEXT,
  p_payment_method TEXT,
  p_payment_ref    TEXT,
  p_amount         INTEGER
)
RETURNS subscriptions
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_plan    subscription_plans%ROWTYPE;
  v_ends_at TIMESTAMPTZ;
  v_sub     subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO v_plan FROM subscription_plans WHERE slug = p_plan_slug;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found: %', p_plan_slug;
  END IF;

  v_ends_at := CASE
    WHEN p_billing_cycle = 'yearly' THEN NOW() + INTERVAL '1 year'
    ELSE NOW() + INTERVAL '1 month'
  END;

  -- Joriy aktiv obunani bekor qilish
  UPDATE subscriptions
    SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id AND status IN ('active', 'trialing');

  -- Yangi subscription
  INSERT INTO subscriptions (
    user_id, plan_id, plan_slug, billing_cycle, status,
    payment_method, payment_ref, amount_paid, starts_at, ends_at
  ) VALUES (
    p_user_id, v_plan.id, p_plan_slug, p_billing_cycle, 'active',
    p_payment_method, p_payment_ref, p_amount, NOW(), v_ends_at
  ) RETURNING * INTO v_sub;

  -- profiles ni yangilash
  UPDATE profiles SET
    subscription_plan    = p_plan_slug,
    subscription_status  = 'active',
    subscription_ends_at = v_ends_at,
    updated_at           = NOW()
  WHERE id = p_user_id;

  -- To'lov logini yangilash
  UPDATE payment_logs SET
    subscription_id = v_sub.id,
    status          = 'success'
  WHERE transaction_id = p_payment_ref AND user_id = p_user_id;

  RETURN v_sub;
END;
$$;

-- ── 12. Admin uchun barcha subscription'larni ko'rish ─────────────
DROP POLICY IF EXISTS "admin_all_subscriptions" ON subscriptions;
CREATE POLICY "admin_all_subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin','superadmin')
    )
  );

DROP POLICY IF EXISTS "admin_all_payment_logs" ON payment_logs;
CREATE POLICY "admin_all_payment_logs"
  ON payment_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin','superadmin')
    )
  );

-- ── Natija ────────────────────────────────────────────────────────
SELECT 'GoalFlow subscription schema muvaffaqiyatli yaratildi!' AS natija;
SELECT name, slug, price_monthly, price_yearly FROM subscription_plans ORDER BY sort_order;
