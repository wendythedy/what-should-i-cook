-- Run this in your Supabase SQL Editor

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  scan_count INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  image_url TEXT,
  ingredients JSONB,
  recipes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Function to safely increment scan count
CREATE OR REPLACE FUNCTION increment_scan_count(user_email TEXT)
RETURNS void AS $$
  UPDATE users SET scan_count = scan_count + 1 WHERE email = user_email;
$$ LANGUAGE sql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
