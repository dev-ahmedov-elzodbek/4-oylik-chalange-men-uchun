-- ============================================================
-- GoalFlow — Global Leaderboard (reyting)
-- SECURITY DEFINER funksiya: RLS'ni chetlab o'tib, faqat
-- ochiq ma'lumot (ism + ball) qaytaradi. Profil maxfiy qoladi.
-- ============================================================

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
  SELECT
    p.id,
    COALESCE(NULLIF(p.full_name, ''), 'Foydalanuvchi') AS display_name,
    COALESCE(SUM(t.points), 0)::BIGINT                  AS points,
    COUNT(tc.task_id)::BIGINT                           AS done_count,
    RANK() OVER (ORDER BY COALESCE(SUM(t.points), 0) DESC) AS rank
  FROM profiles p
  LEFT JOIN task_completions tc ON tc.user_id = p.id
  LEFT JOIN tasks t             ON t.id = tc.task_id
  GROUP BY p.id, p.full_name
  ORDER BY points DESC
  LIMIT lim;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT) TO anon, authenticated;

-- Joriy foydalanuvchining o'rnini olish (limit tashqarisida bo'lsa ham)
CREATE OR REPLACE FUNCTION public.get_my_rank()
RETURNS TABLE (points BIGINT, rank BIGINT, total_users BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ranked AS (
    SELECT
      p.id,
      COALESCE(SUM(t.points), 0) AS pts,
      RANK() OVER (ORDER BY COALESCE(SUM(t.points), 0) DESC) AS r
    FROM profiles p
    LEFT JOIN task_completions tc ON tc.user_id = p.id
    LEFT JOIN tasks t             ON t.id = tc.task_id
    GROUP BY p.id
  )
  SELECT pts::BIGINT, r::BIGINT, (SELECT COUNT(*) FROM ranked)::BIGINT
  FROM ranked WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_rank() TO authenticated;
