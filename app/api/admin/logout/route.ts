import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('aab_admin', '', { path: '/', maxAge: 0 }); // delete cookie
  return res;
}