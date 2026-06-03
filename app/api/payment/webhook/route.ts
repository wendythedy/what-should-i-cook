import { NextRequest, NextResponse } from "next/server";
import { markUserAsPaid } from "@/lib/supabase";

// Ko-fi sends application/x-www-form-urlencoded with a "data" field containing JSON
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const raw = formData.get("data") as string;

  if (!raw) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const payload = JSON.parse(raw);

  // Verify Ko-fi token
  const token = process.env.KOFI_VERIFICATION_TOKEN!;
  if (payload.verification_token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Mark user as paid based on their email
  const email = payload.email;
  if (email) {
    await markUserAsPaid(email);
  }

  return NextResponse.json({ ok: true });
}
