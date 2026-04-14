-- ============================================
-- SuperAdmin & Admin yaratish uchun SQL
-- Supabase > SQL Editor ga joylashtiring
-- ============================================

-- 1. SuperAdmin qilish
UPDATE profiles
SET role = 'superadmin'
WHERE email = 'SIZNING_EMAIL@gmail.com';

-- 2. Admin qilish
UPDATE profiles
SET role = 'admin'
WHERE email = 'ADMIN_EMAIL@gmail.com';

-- 3. Tekshirish
SELECT id, email, role, created_at FROM profiles ORDER BY role;

-- ============================================
-- RLS POLICIES (profiles jadvaliga qo'shing)
-- ============================================

-- Admin va SuperAdmin barcha profillarni ko'ra olsin
DROP POLICY IF EXISTS "profiles_admin" ON profiles;
CREATE POLICY "profiles_admin" ON profiles
FOR SELECT USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'superadmin')
  )
);

-- SuperAdmin rol o'zgartira olsin
DROP POLICY IF EXISTS "profiles_superadmin_update" ON profiles;
CREATE POLICY "profiles_superadmin_update" ON profiles
FOR UPDATE USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'superadmin'
  )
);

-- Admin o'z namunalarini boshqara olsin
DROP POLICY IF EXISTS "tasks_admin_own" ON tasks;
CREATE POLICY "tasks_admin_own" ON tasks
FOR ALL USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'superadmin'
  )
);
