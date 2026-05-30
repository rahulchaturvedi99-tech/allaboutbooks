import { NextRequest, NextResponse } from 'next/server'

async function sha256(text: string) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD is not configured' },
      { status: 500 }
    )
  }

  const token = await sha256(adminPassword)

  const res = NextResponse.json({ ok: true })

  res.cookies.set('aab_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return res
}