import { NextResponse } from "next/server"
import { prisma } from "@/features/shared/lib"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

export const GET = withErrorHandler(async () => {
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
})