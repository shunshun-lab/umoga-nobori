import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- Cloudinary Upload Path ---
    if (
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      console.log("[Upload] Using Cloudinary...");
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      const result = await uploadToCloudinary(buffer, "did-event-uploads");

      console.log(`[Upload] Cloudinary Success: ${result.secure_url}`);
      return NextResponse.json({
        url: result.secure_url,
        success: true,
        provider: "cloudinary"
      });
    }

    // --- Local Fallback Path ---
    // In production (Vercel), local filesystem is read-only or ephemeral.
    // We only strictly block if we are on Vercel.
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      console.error("[Upload] Cloudinary credentials missing in production. Cannot save file.");
      return NextResponse.json({ error: "Image upload is not configured (Cloudinary missing)" }, { status: 500 });
    }

    console.warn("[Upload] Cloudinary credentials missing. Falling back to local storage.");

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Clean filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    console.log(`[Upload] Saved local file to ${filepath}`);

    // Return public URL
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      success: true,
      provider: "local"
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
