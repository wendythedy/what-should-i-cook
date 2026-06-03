import { NextRequest, NextResponse } from "next/server";
import { addPaidScans } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const raw = formData.get("data") as string;
  if (!raw) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  const payload = JSON.parse(raw);

  // Verify Ko-fi token
  const token = process.env.KOFI_VERIFICATION_TOKEN!;
  if (payload.verification_token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const email = payload.email;
  if (email) {
    // Setiap payment menambah 10 scan ke saldo user
    await addPaidScans(email);
  }

  return NextResponse.json({ ok: true });
}
