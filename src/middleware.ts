import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Auth routes
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Dashboard routes
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');
  const isMahasiswaRoute = nextUrl.pathname.startsWith('/dashboard/mahasiswa');
  const isDosenRoute = nextUrl.pathname.startsWith('/dashboard/dosen');
  const isAdminRoute = nextUrl.pathname.startsWith('/dashboard/admin');

  // API routes
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  // Allow API routes
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users from auth routes to dashboard
  if (isAuthRoute && isLoggedIn) {
    const redirectUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Role-based access control
  if (isLoggedIn && isDashboardRoute) {
    // Mahasiswa can only access mahasiswa routes
    if (
      userRole === 'MAHASISWA' &&
      !isMahasiswaRoute &&
      !nextUrl.pathname.startsWith('/dashboard/profile')
    ) {
      return NextResponse.redirect(new URL('/dashboard/mahasiswa', nextUrl));
    }

    // Dosen can only access dosen routes
    if (
      userRole === 'DOSEN_PENGUJI' &&
      !isDosenRoute &&
      !nextUrl.pathname.startsWith('/dashboard/profile')
    ) {
      return NextResponse.redirect(new URL('/dashboard/dosen', nextUrl));
    }

    // Admin can access all routes
    if (userRole === 'ADMIN') {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
});

function getDashboardUrl(role?: string): string {
  switch (role) {
    case 'MAHASISWA':
      return '/dashboard/mahasiswa';
    case 'DOSEN_PENGUJI':
      return '/dashboard/dosen';
    case 'ADMIN':
      return '/dashboard/admin';
    default:
      return '/dashboard';
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
