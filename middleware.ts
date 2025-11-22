import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const isAuthenticated = session?.value === 'authenticated';

    const { pathname } = request.nextUrl;

    // Protect dashboard and add routes
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/add')) && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to dashboard if already logged in and trying to access login
    if (pathname === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/add/:path*', '/login'],
};
