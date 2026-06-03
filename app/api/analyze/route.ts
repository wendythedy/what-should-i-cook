import { NextRequest, NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/openai";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  checkUserAccess, incrementScanCount,
  checkIpAccess, incrementIpScan,
  verifyAuthToken, saveScanHistory,
} from "@/lib/supabase";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ?? "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;
    const cuisineFilter = (formData.get("cuisine") as string) ?? "Semua";

    if (!file || !email || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await verifyAuthToken(token);
    if (!user || user.email !== email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const ipAccess = await checkIpAccess(ip);
    if (!ipAccess.canScan) {
      return NextResponse.json(
        { error: "IP_LIMIT_EXCEEDED", message: "Terlalu banyak scan dari jaringan ini." },
        { status: 429 }
      );
    }

    const access = await checkUserAccess(email);
    if (!access.canScan) {
      return NextResponse.json({ error: "QUOTA_EXCEEDED", access }, { status: 403 });
    }

    const imageUrl = await uploadToCloudinary(file);
    const result = await analyzePhoto(imageUrl, cuisineFilter);

    await incrementScanCount(email);
    await incrementIpScan(ip);

    // Simpan ke history untuk paid users
    if (access.isPaid) {
      await saveScanHistory(email, {
        image_url: imageUrl,
        ingredients: result.ingredients,
        recipes: result.recipes,
        cuisine_filter: cuisineFilter,
      });
    }

    const updatedAccess = await checkUserAccess(email);
    return NextResponse.json({ ...result, imageUrl, access: updatedAccess });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
