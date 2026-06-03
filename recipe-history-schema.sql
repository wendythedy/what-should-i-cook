-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS recipe_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  image_url TEXT,
  ingredients JSONB,
  recipes JSONB,
  cuisine_filter TEXT DEFAULT 'Semua',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipe_history_email ON recipe_history(user_email);

ALTER TABLE recipe_history ENABLE ROW LEVEL SECURITY;
