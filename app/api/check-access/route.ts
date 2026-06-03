import { NextRequest, NextResponse } from "next/server";
import { checkUserAccess } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  const access = await checkUserAccess(email);
  return NextResponse.json(access);
}
