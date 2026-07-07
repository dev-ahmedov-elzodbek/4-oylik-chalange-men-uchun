-- ============================================================
-- GoalFlow — SuperAdmin qo'lda Pro berish (to'lovdan mustaqil)
-- Faqat superadmin chaqira oladi. Reja: free / pro / premium.
-- days = NULL bo'lsa — muddatsiz (doimiy).
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_set_plan(
  target   UUID,
  new_plan TEXT,
  days     INT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'superadmin' THEN RETURN 'error:forbidden'; END IF;
  IF new_plan NOT IN ('free', 'pro', 'premium') THEN RETURN 'error:plan'; END IF;

  IF new_plan = 'free' THEN
    UPDATE profiles
      SET subscription_plan = 'free',
          subscription_status = 'inactive',
          subscription_ends_at = NULL,
          updated_at = now()
      WHERE id = target;
  ELSE
    UPDATE profiles
      SET subscription_plan = new_plan,
          subscription_status = 'active',
          subscription_ends_at = CASE WHEN days IS NULL THEN NULL
                                      ELSE now() + (days || ' days')::interval END,
          updated_at = now()
      WHERE id = target;
  END IF;

  RETURN 'ok';
END $$;

GRANT EXECUTE ON FUNCTION public.admin_set_plan(UUID, TEXT, INT) TO authenticated;
