import { NextRequest, NextResponse } from 'next/server'

// Turns the password into a scrambled fingerprint so the real
// password is never stored in your browser cookie.
async function sha256(text: string) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Keep login page and login API publicly accessible
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  const cookie = request.cookies.get('aab_admin')?.value
  const expected = await sha256(process.env.ADMIN_PASSWORD || '')

  // No valid cookie = deny access
  if (!cookie || cookie !== expected) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}