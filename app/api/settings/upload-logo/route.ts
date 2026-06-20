import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File;

    if (!file || !file.name) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension and sanitize
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const allowed = ["png", "jpg", "jpeg", "svg", "webp", "gif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "File type not allowed. Use PNG, JPG, SVG or WEBP." }, { status: 400 });
    }

    const filename = `print-logo.${ext}`;
    const imagesDir = join(process.cwd(), "public", "images");

    // Ensure directory exists
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    const filePath = join(imagesDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/images/${filename}` });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
  }
}
