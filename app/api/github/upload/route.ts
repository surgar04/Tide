import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/github";

export async function POST(request: Request) {
  try {
    const { path, content, message, branch } = await request.json();

    if (!path || !content || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await uploadFile(path, content, message, branch);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
