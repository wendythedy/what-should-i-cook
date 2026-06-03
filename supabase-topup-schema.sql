-- Jalankan di Supabase SQL Editor

-- Tambah kolom paid_scans_balance ke tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS paid_scans_balance INTEGER DEFAULT 0;

-- Function: tambah paid scans setiap kali user bayar
CREATE OR REPLACE FUNCTION add_paid_scans(p_email TEXT, p_amount INTEGER DEFAULT 10)
RETURNS void AS $$
  INSERT INTO users (email, scan_count, is_paid, paid_scans_balance)
  VALUES (p_email, 0, true, p_amount)
  ON CONFLICT (email)
  DO UPDATE SET
    is_paid = true,
    paid_scans_balance = COALESCE(users.paid_scans_balance, 0) + p_amount;
$$ LANGUAGE sql;
