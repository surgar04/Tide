import { NextResponse } from 'next/server';
import { getUserData, logUserActivity } from '@/lib/userData';

export async function GET() {
  const data = getUserData();
  return NextResponse.json({ activities: data.activities });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, target } = body;
    if (action && target) {
      logUserActivity(action, target);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Missing action or target" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
