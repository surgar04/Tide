import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/github";

export async function GET() {
  const status = await checkHealth();
  return NextResponse.json(status);
}
