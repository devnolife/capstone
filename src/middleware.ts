import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Get token from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;

  // Public routes (registration disabled)
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Auth routes (only login, registration disabled)
  const authRoutes = ['/login'];
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Redirect /register to /login (registration disabled)
  if (nextUrl.pathname === '/register') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Legacy dashboard route - redirect to role-based dashboard
  if (nextUrl.pathname === '/dashboard' || nextUrl.pathname.startsWith('/dashboard/')) {
    if (isLoggedIn) {
      const redirectUrl = getDashboardUrl(userRole);
      return NextResponse.redirect(new URL(redirectUrl, nextUrl));
    } else {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
  }

  // Role-based routes (NEW STRUCTURE)
  const isMahasiswaRoute = nextUrl.pathname.startsWith('/mahasiswa');
  const isDosenRoute = nextUrl.pathname.startsWith('/dosen');
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  
  // Check if it's a protected route (any role-based route)
  const isProtectedRoute = isMahasiswaRoute || isDosenRoute || isAdminRoute;

  // API routes
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  // Allow API routes
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users from auth routes to their dashboard
  if (isAuthRoute && isLoggedIn) {
    const redirectUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Role-based access control - each role can only access their own routes
  if (isLoggedIn && isProtectedRoute) {
    // Mahasiswa can only access mahasiswa routes
    if (userRole === 'MAHASISWA' && !isMahasiswaRoute) {
      return NextResponse.redirect(new URL('/mahasiswa/dashboard', nextUrl));
    }

    // Dosen can only access dosen routes
    if (userRole === 'DOSEN_PENGUJI' && !isDosenRoute) {
      return NextResponse.redirect(new URL('/dosen/dashboard', nextUrl));
    }

    // Admin can only access admin routes
    if (userRole === 'ADMIN' && !isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role?: string): string {
  switch (role) {
    case 'MAHASISWA':
      return '/mahasiswa/dashboard';
    case 'DOSEN_PENGUJI':
      return '/dosen/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
