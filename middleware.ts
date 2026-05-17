import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Run intl middleware first to get locale-aware response
  const intlResponse = intlMiddleware(request)

  // Skip auth check for public paths
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.some((p) =>
    pathname.match(new RegExp(`^/(nl|en)${p}`))
  )
  const isApiPath = pathname.startsWith('/api')
  const isAuthCallback = pathname.includes('/auth/callback')

  if (isPublicPath || isApiPath || isAuthCallback) {
    return intlResponse
  }

  // Check Supabase auth session
  const response = intlResponse || NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const locale = pathname.split('/')[1] || 'nl'
    const loginUrl = new URL(`/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
