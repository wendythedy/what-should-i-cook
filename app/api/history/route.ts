import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getUserHistory, checkUserAccess } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = req.nextUrl.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ error: "Missing auth" }, { status: 401 });
  }

  const user = await verifyAuthToken(token);
  if (!user || user.email !== email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const access = await checkUserAccess(email);
  if (!access.isPaid) {
    return NextResponse.json({ error: "PAID_ONLY" }, { status: 403 });
  }

  const history = await getUserHistory(email);
  return NextResponse.json({ history });
}
