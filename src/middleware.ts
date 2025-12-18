import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow these paths without authentication
    const publicPaths = ['/login', '/api/auth/login']
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

    if (isPublicPath) {
        return NextResponse.next()
    }

    // Check for auth cookie
    const authToken = request.cookies.get('auth-token')

    if (!authToken || authToken.value !== 'authenticated') {
        // Redirect to login if not authenticated
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
}
