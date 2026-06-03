import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

const FREE_SCAN_LIMIT = 2;
const SCANS_PER_PURCHASE = 10;
const IP_SCAN_LIMIT = 5;

// ── Email quota ───────────────────────────────────────────────────────────────
export async function checkUserAccess(email: string) {
  const { data } = await supabase
    .from("users")
    .select("scan_count, is_paid, paid_scans_balance")
    .eq("email", email)
    .single();

  if (!data) {
    await supabase.from("users").insert({ email, scan_count: 0, is_paid: false, paid_scans_balance: 0 });
    return {
      canScan: true, isPaid: false, scanCount: 0,
      paidBalance: 0, scansRemaining: FREE_SCAN_LIMIT,
      freeLimit: FREE_SCAN_LIMIT, scansPerPurchase: SCANS_PER_PURCHASE,
    };
  }

  const paidBalance = data.paid_scans_balance ?? 0;
  const totalAllowed = FREE_SCAN_LIMIT + paidBalance;
  const scansRemaining = Math.max(0, totalAllowed - data.scan_count);

  return {
    canScan: data.scan_count < totalAllowed,
    isPaid: data.is_paid,
    scanCount: data.scan_count,
    paidBalance,
    scansRemaining,
    freeLimit: FREE_SCAN_LIMIT,
    scansPerPurchase: SCANS_PER_PURCHASE,
  };
}

export async function incrementScanCount(email: string) {
  await supabase.rpc("increment_scan_count", { user_email: email });
}

// Setiap payment menambah SCANS_PER_PURCHASE scan ke saldo
export async function addPaidScans(email: string) {
  await supabase.rpc("add_paid_scans", { p_email: email, p_amount: SCANS_PER_PURCHASE });
}

// ── IP rate limiting ──────────────────────────────────────────────────────────
export async function checkIpAccess(ip: string) {
  const { data } = await supabase
    .from("ip_scans").select("scan_count").eq("ip_address", ip).single();
  if (!data) return { canScan: true, scanCount: 0, ipLimit: IP_SCAN_LIMIT };
  return { canScan: data.scan_count < IP_SCAN_LIMIT, scanCount: data.scan_count, ipLimit: IP_SCAN_LIMIT };
}

export async function incrementIpScan(ip: string) {
  await supabase.rpc("increment_ip_scan", { p_ip: ip });
}

// ── Auth token ────────────────────────────────────────────────────────────────
export async function verifyAuthToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ── Recipe history ────────────────────────────────────────────────────────────
export async function saveScanHistory(email: string, payload: {
  image_url: string; ingredients: unknown; recipes: unknown; cuisine_filter: string;
}) {
  await supabase.from("recipe_history").insert({ user_email: email, ...payload });
}

export async function getUserHistory(email: string) {
  const { data } = await supabase
    .from("recipe_history").select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}
