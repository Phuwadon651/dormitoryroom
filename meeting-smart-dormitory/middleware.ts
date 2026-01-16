import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')
    const { pathname } = request.nextUrl

    // 1. Check if user is logged in for protected routes
    const protectedRoutes = ['/dashboard', '/portal']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Root path handling
    if (pathname === '/') {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        // If logged in on root, redirect to role-based dashboard
        // Let RBAC logic below handle it or force generic dashboard
    }

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Role-Based Access Control (RBAC)
    if (session) {
        try {
            const user = JSON.parse(session.value)
            const role = user.role

            // Redirect root to dashboard based on role
            if (pathname === '/') {
                if (role === 'Tenant') return NextResponse.redirect(new URL('/portal/tenant', request.url))
                if (role === 'Technician') return NextResponse.redirect(new URL('/dashboard/technician', request.url)) // Assuming this path
                return NextResponse.redirect(new URL('/dashboard/admin', request.url))
            }

            // Prevent Tenant from accessing Dashboard
            if (pathname.startsWith('/dashboard') && role === 'Tenant') {
                return NextResponse.redirect(new URL('/portal/tenant', request.url))
            }

            // Prevent Technician from accessing main Dashboard (redirect to their specific page)
            if (pathname === '/dashboard/admin' && role === 'Technician') {
                // Assuming we will create a dedicated page or they just see the sidebar with 'Repair' only.
                // Ideally redirect to /dashboard/technician if it existed.
                // For now, let's keep them on /dashboard/technician if possible, or just let them hit /dashboard but with restricted view.
                // But sidebar links are hidden. Let's redirect to a repair page.
                return NextResponse.redirect(new URL('/dashboard/technician/jobs', request.url)) // We will create this
            }

            // Prevent others from accessing general portal if not relevant
            if (pathname.startsWith('/portal') && role !== 'Tenant') {
                // Technician might need portal? No, prompt says Task Based Dashboard.
                return NextResponse.redirect(new URL('/dashboard/admin', request.url))
            }

        } catch (e) {
            // Invalid session, force logout/login
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/portal/:path*'],
}
