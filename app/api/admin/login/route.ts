import { NextRequest, NextResponse } from 'next/server';

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const token = await sha256(process.env.ADMIN_PASSWORD);
  const res = NextResponse.json({ ok: true });

  // Set the "logged in" cookie. httpOnly means JavaScript/hackers
  // in the browser can't read it.
  res.cookies.set('aab_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // stays logged in for 7 days
  });

  return res;
}