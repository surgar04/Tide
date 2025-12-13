import { NextResponse } from 'next/server';
import { checkUpdate } from '@/lib/version';

export async function GET() {
  try {
    const info = await checkUpdate();
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json({ error: "Failed to check updates" }, { status: 500 });
  }
}
