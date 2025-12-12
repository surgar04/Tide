import { NextResponse } from 'next/server';
import { getUserData, saveUserData, logUserActivity } from '@/lib/userData';

export async function GET() {
  const data = getUserData();
  // Ensure join date is set on first fetch
  if (!data.joinDate) {
      data.joinDate = new Date().toISOString();
      saveUserData(data);
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = getUserData();
    
    if (body.type === 'update_avatar') {
      data.avatar = body.avatar;
      logUserActivity("更新头像 | Updated Avatar", "个人设置");
    } else if (body.type === 'add_time') {
      const seconds = typeof body.seconds === 'number' ? body.seconds : 0;
      data.totalTime += seconds;
    }
    
    saveUserData(data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
