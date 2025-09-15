import { auth } from "@/features/auth/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SessionTracker } from "./sessionTracking"

/**
 * Admin middleware to protect admin routes
 * Checks if user is authenticated and has admin privileges
 */
export async function adminMiddleware(request: NextRequest) {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
        return NextResponse.redirect(new URL("/login", request.url))
    }
    
    // Check if user has admin privileges
    if (!session.user.isAdmin) {
        return NextResponse.json(
            { error: "Access denied. Admin privileges required." },
            { status: 403 }
        )
    }
    
    return NextResponse.next()
}

/**
 * Helper function to check if user is admin in API routes
 */
export async function requireAdmin() {
    const session = await auth()
    
    if (!session?.user) {
        throw new Error("Authentication required")
    }
    
    if (!session.user.isAdmin) {
        // Log failed admin API access attempt
        await SessionTracker.logActivity({
            userId: session.user.id,
            action: 'ADMIN_API_ACCESS_DENIED',
            resource: 'api/admin'
        })
        
        throw new Error("Admin privileges required")
    }
    
    // Log successful admin API access
    await SessionTracker.logActivity({
        userId: session.user.id,
        action: 'ADMIN_API_ACCESS',
        resource: 'api/admin'
    })
    
    return session.user
}

/**
 * Helper function to check if current user is admin (client-side)
 */
export function isAdmin(session: any): boolean {
    return session?.user?.isAdmin === true
}