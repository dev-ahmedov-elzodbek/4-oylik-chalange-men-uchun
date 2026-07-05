-- ============================================================
-- RLS REKURSIYA XATOSINI TUZATISH
-- Error: 42P17 infinite recursion detected in policy for relation "profiles"
-- Supabase > SQL Editor ga joylashtiring
-- ============================================================

-- 1. Rekursiv policy'larni o'chirish
DROP POLICY IF EXISTS "profiles_admin"              ON profiles;
DROP POLICY IF EXISTS "profiles_superadmin_update"  ON profiles;
DROP POLICY IF EXISTS "profiles_self"               ON profiles;

-- 2. RLS'ni yoqish (agar o'chiq bo'lsa)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Rekursiyasiz helper funksiya (SECURITY DEFINER = RLS'ni chetlab o'tadi)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql

SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 4. Yangi, to'g'ri policy'lar
-- Foydalanuvchi o'z profilini ko'radi va yangilaydi
CREATE POLICY "profiles_self"
  ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin/superadmin barcha profillarni ko'radi (rekursiyasiz)
CREATE POLICY "profiles_admin_select"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR get_my_role() IN ('admin', 'superadmin')
  );

-- SuperAdmin barcha profillarni yangilaydi (rekursiyasiz)
CREATE POLICY "profiles_superadmin_update"
  ON profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR get_my_role() = 'superadmin'
  )
  WITH CHECK (
    auth.uid() = id
    OR get_my_role() = 'superadmin'
  );

-- 5. Tekshirish
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
