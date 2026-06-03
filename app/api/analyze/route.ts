import { NextRequest, NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/openai";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  checkUserAccess,
  incrementScanCount,
  checkIpAccess,
  incrementIpScan,
  verifyAuthToken,
} from "@/lib/supabase";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;

    if (!file || !email || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verifikasi OTP token
    const user = await verifyAuthToken(token);
    if (!user || user.email !== email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 2. Cek IP rate limit
    const ip = getClientIp(req);
    const ipAccess = await checkIpAccess(ip);
    if (!ipAccess.canScan) {
      return NextResponse.json(
        { error: "IP_LIMIT_EXCEEDED", message: "Terlalu banyak scan dari jaringan ini." },
        { status: 429 }
      );
    }

    // 3. Cek email quota
    const access = await checkUserAccess(email);
    if (!access.canScan) {
      return NextResponse.json({ error: "QUOTA_EXCEEDED", access }, { status: 403 });
    }

    // 4. Proses scan
    const imageUrl = await uploadToCloudinary(file);
    const result = await analyzePhoto(imageUrl);

    // 5. Update counters
    await incrementScanCount(email);
    await incrementIpScan(ip);

    return NextResponse.json({ ...result, imageUrl, access });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
