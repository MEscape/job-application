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

        // Calculate average session time
        const loginActivities = await prisma.activityLog.findMany({
            where: {
                action: 'LOGIN_SUCCESS',
                createdAt: {
                    gte: weekAgo
                }
            },
            select: {
                userId: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        // Group by user and calculate session durations
        const userSessions: { [userId: string]: Date[] } = {}
        loginActivities.forEach(activity => {
            if (!userSessions[activity.userId]) {
                userSessions[activity.userId] = []
            }
            userSessions[activity.userId].push(activity.createdAt)
        })

        let totalSessionMinutes = 0
        let sessionCount = 0

        Object.values(userSessions).forEach(sessions => {
            for (let i = 1; i < sessions.length; i++) {
                const sessionDuration = sessions[i].getTime() - sessions[i - 1].getTime()
                const minutes = sessionDuration / (1000 * 60)
                if (minutes < 480) { // Ignore sessions longer than 8 hours (likely different days)
                    totalSessionMinutes += minutes
                    sessionCount++
                }
            }
        })

        const avgSessionMinutes = sessionCount > 0 ? Math.round(totalSessionMinutes / sessionCount) : 0
        const avgSessionTime = avgSessionMinutes > 60 
            ? `${Math.floor(avgSessionMinutes / 60)}h ${avgSessionMinutes % 60}m`
            : `${avgSessionMinutes}m`

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
            avgSessionTime,
            dailyGrowth
        })
    } catch (error) {
        console.error('Error fetching activity stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch activity stats' },
            { status: 500 }
        )
    }
}