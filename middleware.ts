import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // *** THE KEY FIX IS HERE: An explicit check for ANY public route ***
  // If the requested page is the public bill page, we do nothing and let it pass through immediately.
  // This check now runs before any Supabase or user logic.
  if (pathname.startsWith('/bill')) {
    return NextResponse.next()
  }

  // --- All the authentication code below will now ONLY run for non-public pages ---

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // If no user is found and they are trying to access a protected page (like the dashboard), redirect to login.
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If a user is logged in and tries to access login/signup, redirect them to the dashboard.
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// We update the matcher to be simpler and more explicit.
// The routing logic is now handled inside the function itself.
export const config = {
  matcher: [
    '/dashboard/:path*', // Protect all dashboard pages
    '/login',
    '/signup',
    '/bill/:path*', // IMPORTANT: We must include '/bill' here so the middleware runs, allowing our check at the top to explicitly ignore it.
  ],
}