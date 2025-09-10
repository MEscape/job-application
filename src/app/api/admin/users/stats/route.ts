import { NextResponse } from "next/server"
import { prisma } from "@/features/shared/lib"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"

export async function GET() {
    try {
        // Check if user has admin privileges
        await requireAdmin()

        // Get total users count
        const totalUsers = await prisma.user.count()

        // Get active users count (users who have logged in within the last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const activeUsers = await prisma.user.count({
            where: {
                AND: [
                    { isActive: true },
                    {
                        lastLogin: {
                            gte: thirtyDaysAgo
                        }
                    }
                ]
            }
        })

        return NextResponse.json({
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers
        })
    } catch (error) {
        console.error('Error fetching user stats:', error)
        
        if (error instanceof Error) {
            if (error.message === "Authentication required") {
                return NextResponse.json(
                    { error: "Authentication required" },
                    { status: 401 }
                )
            }
            if (error.message === "Admin privileges required") {
                return NextResponse.json(
                    { error: "Admin privileges required" },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}