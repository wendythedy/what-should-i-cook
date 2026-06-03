import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

const FREE_SCAN_LIMIT = 2;

export async function checkUserAccess(email: string) {
  const { data } = await supabase
    .from("users")
    .select("scan_count, is_paid")
    .eq("email", email)
    .single();

  if (!data) {
    // New user — create record
    await supabase.from("users").insert({ email, scan_count: 0, is_paid: false });
    return { canScan: true, isPaid: false, scanCount: 0, freeLimit: FREE_SCAN_LIMIT };
  }

  return {
    canScan: data.is_paid || data.scan_count < FREE_SCAN_LIMIT,
    isPaid: data.is_paid,
    scanCount: data.scan_count,
    freeLimit: FREE_SCAN_LIMIT,
  };
}

export async function incrementScanCount(email: string) {
  await supabase.rpc("increment_scan_count", { user_email: email });
}

export async function markUserAsPaid(email: string) {
  await supabase
    .from("users")
    .upsert({ email, is_paid: true, paid_at: new Date().toISOString() });
}
