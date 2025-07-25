import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;
  // Wajib login di semua route kecuali /login dan /register
  if (url.pathname !== '/login' && url.pathname !== '/register') {
    const userCookie = req.cookies.get('user');
    if (!userCookie) {
      return NextResponse.redirect(new URL('/login', url));
    }
    try {
      req.user = JSON.parse(userCookie.value);
    } catch {
      return NextResponse.redirect(new URL('/login', url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/user/:path*', '/pegawai/:path*', '/naikgaji/:path*', '/naikpangkat/:path*', '/arsip/:path*'],
};
