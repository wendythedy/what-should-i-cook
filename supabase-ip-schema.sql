-- Jalankan ini di Supabase SQL Editor (tambahan dari supabase-schema.sql)

-- Tabel untuk track scan per IP
CREATE TABLE IF NOT EXISTS ip_scans (
  ip_address TEXT PRIMARY KEY,
  scan_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Function untuk increment IP scan count
CREATE OR REPLACE FUNCTION increment_ip_scan(p_ip TEXT)
RETURNS void AS $$
  INSERT INTO ip_scans (ip_address, scan_count, updated_at)
  VALUES (p_ip, 1, NOW())
  ON CONFLICT (ip_address)
  DO UPDATE SET
    scan_count = ip_scans.scan_count + 1,
    updated_at = NOW();
$$ LANGUAGE sql;

-- Enable RLS
ALTER TABLE ip_scans ENABLE ROW LEVEL SECURITY;
