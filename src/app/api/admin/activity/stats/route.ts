import { NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'

export async function GET() {
    try {
        const user = await requireAdmin()
        
        // Log admin access
        await SessionTracker.logActivity({
            userId: user.id,
            action: 'VIEW_ACTIVITY_STATS',
            resource: 'api/admin/activity/stats'
        })

        // Get current date for calculations
        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Total activities count
        const totalActivities = await prisma.activityLog.count()

        // Active users (users with activity in last 24 hours)
        const activeUsers = await prisma.activityLog.groupBy({
            by: ['userId'],
            where: {
                createdAt: {
                    gte: yesterday
                }
            }
        })

        // Average session time calculation removed

        // Daily growth calculation
        const todayActivities = await prisma.activityLog.count({
            where: {
                createdAt: {
                    gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                }
            }
        })

        const yesterdayActivities = await prisma.activityLog.count({
            where: {
                createdAt: {
                    gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
                    lt: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                }
            }
        })

        const dailyGrowth = yesterdayActivities > 0 
            ? Math.round(((todayActivities - yesterdayActivities) / yesterdayActivities) * 100)
            : todayActivities > 0 ? 100 : 0

        return NextResponse.json({
            totalActivities,
            activeUsers: activeUsers.length,
            dailyGrowth
        })
    } catch (error) {
        console.error('Error fetching activity stats:', error)
        
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
            { error: 'Failed to fetch activity stats' },
            { status: 500 }
        )
    }
}