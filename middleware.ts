import { createServerClient } from '@supabase/ssr'
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
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    let user = null
    try {
        const {
            data: { user: authUser },
        } = await supabase.auth.getUser()
        user = authUser
    } catch (e) {
        // console.error('Middleware Auth Error:', e)
        // Treat as unauthenticated if token is invalid
        user = null
    }

    if (!user) {
        // Redirect to login if accessing protected routes without user
        if (request.nextUrl.pathname.startsWith('/admin') ||
            request.nextUrl.pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    } else {
        // Fetch user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        // Protect Admin Routes
        if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
            // Redirect based on actual role
            if (role === 'investor') return NextResponse.redirect(new URL('/dashboard/investor', request.url))
            if (role === 'entrepreneur') return NextResponse.redirect(new URL('/dashboard/entrepreneur', request.url))
            if (['staff', 'field_agent', 'verifier', 'moderator'].includes(role)) return NextResponse.redirect(new URL('/dashboard/staff', request.url))
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Protect Investor Routes
        if (request.nextUrl.pathname.startsWith('/dashboard/investor') && role !== 'investor') {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Protect Entrepreneur Routes
        if (request.nextUrl.pathname.startsWith('/dashboard/entrepreneur') && role !== 'entrepreneur') {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Protect Staff Routes
        if (request.nextUrl.pathname.startsWith('/dashboard/staff') && !['staff', 'field_agent', 'verifier', 'moderator'].includes(role)) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect authenticated users away from auth pages
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
        if (role === 'investor') return NextResponse.redirect(new URL('/dashboard/investor', request.url))
        if (role === 'entrepreneur') return NextResponse.redirect(new URL('/dashboard/entrepreneur', request.url))
        if (['staff', 'field_agent', 'verifier', 'moderator'].includes(role)) return NextResponse.redirect(new URL('/dashboard/staff', request.url))

        return NextResponse.redirect(new URL('/dashboard', request.url)) // Fallback
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
