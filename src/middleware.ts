import { auth } from "@/features/auth/lib/auth"
import { NextResponse } from "next/server"
import { adminMiddleware } from "@/features/auth/lib/adminMiddleware"

export default auth(async (req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    // List of public routes
    const publicRoutes = [
        "/",          // landing page
        "/login",     // login page
        "/portfolio", // portfolio page
        "/api/auth",  // auth API
    ]

    // Admin routes that require admin privileges
    const adminRoutes = [
        "/admin",
        "/api/admin"
    ]

    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route =>
        nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
    )

    // Check if current path is admin route
    const isAdminRoute = adminRoutes.some(route =>
        nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
    )

    // Allow public routes
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Block everything else if not logged in
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/", nextUrl))
    }

    // Handle admin routes
    if (isAdminRoute) {
        return await adminMiddleware(req)
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        // Protect everything except:
        // - _next (Next.js internals)
        // - public assets (anything under /public -> served from root)
        "/((?!_next|.*\\..*).*)",
    ],
}
