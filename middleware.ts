import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // If no user is found, redirect them to the login page.
  // This logic is now safe because this middleware ONLY runs on protected routes.
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// *** THE DEFINITIVE FIX IS HERE ***
// This matcher ONLY runs the middleware on routes that start with '/dashboard'.
// It will completely ignore '/login', '/signup', '/bill', and the homepage.
// This is the most reliable way to ensure public routes remain public.
export const config = {
  matcher: ['/dashboard/:path*'],
}