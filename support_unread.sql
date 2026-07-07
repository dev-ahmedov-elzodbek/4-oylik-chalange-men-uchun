-- ============================================================
-- GoalFlow — Admin uchun o'qilmagan support xabarlar soni
-- ============================================================
CREATE OR REPLACE FUNCTION public.support_unread_count()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::BIGINT
  FROM support_messages
  WHERE sender = 'user'
    AND is_read = false
    AND public.get_my_role() IN ('admin', 'superadmin');
$$;

GRANT EXECUTE ON FUNCTION public.support_unread_count() TO authenticated;
