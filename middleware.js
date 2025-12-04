import { NextResponse } from 'next/server'

const CSP = "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'"

export function middleware(req) {
  const { pathname } = req.nextUrl

  // Add security headers to every response
  const res = NextResponse.next()
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'no-referrer')
  res.headers.set('Content-Security-Policy', CSP)

  // CSRF protection for API state-changing methods (skip auth endpoints that issue tokens)
  const csrfExempt = ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/logout-all']
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !csrfExempt.includes(pathname)) {
    const tokenHeader = req.headers.get('x-csrf-token') || ''
    const cookieHeader = req.headers.get('cookie') || ''
    const match = cookieHeader.split(';').map(s=>s.trim()).find(c=>c.startsWith('csrfToken='))
    const cookieToken = match ? match.split('=')[1] : ''
    if (!tokenHeader || !cookieToken || tokenHeader !== cookieToken) {
      return new NextResponse(JSON.stringify({ message: 'CSRF token missing or invalid' }), { status: 403, headers: { 'content-type': 'application/json' } })
    }
  }

  return res
}

export const config = {
  matcher: '/api/:path*'
}
