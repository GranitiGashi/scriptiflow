import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Check if it's the app subdomain
  const isAppSubdomain = hostname.startsWith('app.');
  
  // If on app subdomain
  if (isAppSubdomain) {
    // Allow dashboard routes
    if (url.pathname.startsWith('/dashboard') || 
        url.pathname.startsWith('/login') || 
        url.pathname.startsWith('/auth') ||
        url.pathname.startsWith('/support') ||
        url.pathname.startsWith('/stripe') ||
        url.pathname.startsWith('/Admin')) {
      return NextResponse.next();
    }
    
    // Redirect marketing pages to main domain
    if (url.pathname === '/' || 
        url.pathname.startsWith('/pricing') || 
        url.pathname.startsWith('/privacy-policy') ||
        url.pathname.startsWith('/terms-and-conditions')) {
      const mainDomain = hostname.replace('app.', '');
      url.host = mainDomain;
      return NextResponse.redirect(url);
    }
    
    // If logged out and trying to access app subdomain root, go to login
    if (url.pathname === '/') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } 
  // On main domain
  else {
    // Redirect dashboard routes to app subdomain
    if (url.pathname.startsWith('/dashboard') || 
        url.pathname.startsWith('/support') ||
        url.pathname.startsWith('/Admin')) {
      url.host = `app.${hostname}`;
      return NextResponse.redirect(url);
    }
    
    // Allow marketing pages and login on main domain
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};

