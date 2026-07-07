-- ============================================================
-- GoalFlow — "Database error saving new user" tuzatish
-- Sabab: handle_new_user'da SET search_path yo'q edi, shuning uchun
-- supabase_auth_admin roli 'profiles' jadvalini topolmasdi.
-- Yechim: search_path o'rnatish + jadvalni to'liq nom bilan yozish.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Profil yaratishda xato bo'lsa ham, ro'yxatdan o'tish to'xtamasin
  RAISE WARNING 'handle_new_user profil xatosi: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Referral trigger'iga ham search_path (kafolat uchun)
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTR(MD5(NEW.id::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

-- supabase_auth_admin funksiyani bajara olishiga ishonch
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
