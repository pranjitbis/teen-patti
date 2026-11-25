import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'teen-patti-super-secret-casino-key-2025'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('tp_session')?.value;
  let payload: any = null;

  if (token) {
    try {
      const { payload: verified } = await jwtVerify(token, SECRET_KEY);
      payload = verified;
    } catch (e) {
      // Invalid or expired token
    }
  }

  // Strictly protected routes: /game/*, /profile, /admin/*
  // NO ONE can play Teen Patti without logging in!
  const isStrictlyProtected =
    pathname.startsWith('/game') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin');

  if (isStrictlyProtected && !payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection: ONLY role === 'ADMIN'
  if (pathname.startsWith('/admin') && payload?.role !== 'ADMIN') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // If already logged in and visiting /login -> redirect to /
  if (pathname === '/login' && payload) {
    const target = payload.role === 'ADMIN' ? '/admin' : '/';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
