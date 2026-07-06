import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const filePath = join(process.cwd(), "public", "images", filename);

    if (!existsSync(filePath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const file = await readFile(filePath);
    
    // Determine content type
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    let contentType = 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'svg') contentType = 'image/svg+xml';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'gif') contentType = 'image/gif';

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
