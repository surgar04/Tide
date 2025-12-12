import { NextRequest, NextResponse } from "next/server";
import { OWNER, REPO } from "@/lib/github";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) return new NextResponse("Missing path", { status: 400 });

  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.raw",
        "User-Agent": "TideOA"
      }
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch from GitHub", { status: response.status });
    }

    const blob = await response.blob();
    const headers = new Headers();
    
    // Set content type based on file extension
    const ext = path.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml'
    };
    headers.set("Content-Type", mimeTypes[ext || ''] || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=86400"); // Cache for 1 day

    return new NextResponse(blob, { headers });
  } catch (error) {
    console.error("File proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
