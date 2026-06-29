import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * PetFlow White Label - Middleware
 * 
 * Since this is now a premium single-tenant deployment, we no longer rewrite domains 
 * to dynamic tenant directories. All pages resolve directly at the root level.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
