-- =============================================
-- GoalFlow — Supabase SQL Schema
-- Supabase dashboard > SQL Editor ga joylashtiring
-- =============================================

-- 1. Foydalanuvchi profili
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'admin', 'superadmin'
  lang TEXT DEFAULT 'uz',

  -- Onboarding
  onboarding_done BOOLEAN DEFAULT FALSE,
  direction TEXT, -- 'it', 'medicine', 'law', 'business', 'art', 'other'
  subjects TEXT[], -- ['math', 'physics', ...]
  sports TEXT[], -- ['football', 'gym', ...]
  goal TEXT,
  challenge_start DATE,
  challenge_end DATE,
  challenge_duration INTEGER DEFAULT 90, -- kunlar

  -- Sog'liq
  birth_year INTEGER,
  gender TEXT, -- 'male', 'female'
  height_cm INTEGER,
  weight_kg DECIMAL(5,1),
  activity_level TEXT DEFAULT 'moderate', -- 'low','moderate','high','very_high'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vazifalar (global namunalar + foydalanuvchi vazifalari)
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'study','sport','language','self','nutrition','custom'
  icon TEXT DEFAULT '✅',
  points INTEGER DEFAULT 10,
  is_template BOOLEAN DEFAULT FALSE, -- admin tomonidan namuna
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kunlik vazifa bajarilishi
CREATE TABLE task_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id, completed_date)
);

-- 4. Kunlik ovqatlanish yozuvi
CREATE TABLE nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  meal_name TEXT,
  calories INTEGER,
  protein_g DECIMAL(6,1),
  carbs_g DECIMAL(6,1),
  fat_g DECIMAL(6,1),
  meal_type TEXT, -- 'breakfast','lunch','dinner','snack'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Foydalanuvchi vaqt bloklari (band vaqtlari)
CREATE TABLE time_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day_of_week INTEGER[], -- [1,3,5] = Dushanba, Chorshanba, Juma
  start_time TIME,
  end_time TIME,
  color TEXT DEFAULT '#6c63ff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Kunlik eslatmalar
CREATE TABLE daily_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  note_date DATE NOT NULL,
  content TEXT,
  mood INTEGER, -- 1-5
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, note_date)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- Profiles: foydalanuvchi faqat o'zini ko'radi
CREATE POLICY "profiles_self" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_admin" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- Tasks: o'z vazifalari + namunalar
CREATE POLICY "tasks_own" ON tasks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "tasks_templates" ON tasks FOR SELECT USING (is_template = TRUE);

-- Task completions
CREATE POLICY "completions_own" ON task_completions FOR ALL USING (user_id = auth.uid());

-- Nutrition logs
CREATE POLICY "nutrition_own" ON nutrition_logs FOR ALL USING (user_id = auth.uid());

-- Time blocks
CREATE POLICY "timeblocks_own" ON time_blocks FOR ALL USING (user_id = auth.uid());

-- Daily notes
CREATE POLICY "notes_own" ON daily_notes FOR ALL USING (user_id = auth.uid());

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- NAMUNA VAZIFALAR (Template tasks)
-- =============================================
INSERT INTO tasks (user_id, title, icon, category, points, is_template) VALUES
  (NULL, 'Ertalab 06:00 da turish', '☀️', 'self', 10, TRUE),
  (NULL, 'Bomdod namozi', '🕌', 'self', 15, TRUE),
  (NULL, 'Sport: 30 daqiqa', '💪', 'sport', 15, TRUE),
  (NULL, 'Push-up 3x20', '🏋️', 'sport', 10, TRUE),
  (NULL, 'Plank 3x45 soniya', '🔥', 'sport', 10, TRUE),
  (NULL, 'Kitob oqish: 20 bet', '📚', 'study', 15, TRUE),
  (NULL, 'Ingliz tili: 20 ta soz', '🌍', 'language', 15, TRUE),
  (NULL, 'Dasturlash: 1.5 soat', '💻', 'study', 20, TRUE),
  (NULL, 'Kunlik tahlil yozish', '🪞', 'self', 10, TRUE),
  (NULL, 'Telefon 1 soatdan kam', '📵', 'self', 10, TRUE),
  (NULL, '23:00 da yotish', '🌙', 'self', 10, TRUE),
  (NULL, 'Soglom nonushta', '🥗', 'nutrition', 10, TRUE),
  (NULL, 'Suv: 2 litr ichish', '💧', 'nutrition', 10, TRUE);
