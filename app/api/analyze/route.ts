import { NextRequest, NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/openai";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { checkUserAccess, incrementScanCount } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const email = formData.get("email") as string;

    if (!file || !email) {
      return NextResponse.json({ error: "Missing image or email" }, { status: 400 });
    }

    const access = await checkUserAccess(email);
    if (!access.canScan) {
      return NextResponse.json({ error: "QUOTA_EXCEEDED", access }, { status: 403 });
    }

    const imageUrl = await uploadToCloudinary(file);
    const result = await analyzePhoto(imageUrl);
    await incrementScanCount(email);

    return NextResponse.json({ ...result, imageUrl, access });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
