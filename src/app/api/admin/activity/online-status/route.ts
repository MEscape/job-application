import { NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'

/**
 * Online User Status API
 * 
 * This endpoint determines user online status based on recent activity tracking.
 * 
 * ONLINE STATUS LOGIC:
 * - A user is considered "online" if they have any activity within the last 5 minutes
 * - Activity is tracked through the SessionTracker.logActivity() calls throughout the app
 * - Activities include: page views, API calls, file operations, etc.
 * 
 * SESSION DURATION:
 * - Calculated from the user's first activity of the current day until now
 * - If no activity today, uses the timestamp of their most recent activity
 * 
 * LAST ACTIVITY:
 * - Shows time since the user's most recent logged activity
 * - Displays as "Just now", "Xm ago", or "Xh ago"
 * 
 * REFRESH RATE:
 * - Frontend refreshes this data every 10 seconds for real-time updates
 * - Users automatically go offline after 5 minutes of inactivity
 */
export async function GET() {
    try {
        const user = await requireAdmin()
        
        // Log admin access
        await SessionTracker.logActivity({
            userId: user.id,
            action: 'VIEW_ONLINE_STATUS',
            resource: 'api/admin/activity/online-status'
        })

        const now = new Date()
        // 5-minute threshold for online status
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // Get users with recent activity (considered online)
        // Only users with activity in the last 5 minutes are included
        const recentActivities = await prisma.activityLog.findMany({
            where: {
                createdAt: {
                    gte: fiveMinutesAgo // 5-minute online threshold
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Group by user to get latest activity per user
        const userActivityMap = new Map()
        recentActivities.forEach(activity => {
            if (!userActivityMap.has(activity.userId)) {
                userActivityMap.set(activity.userId, activity)
            }
        })

        // Get all users for total count
        const totalUsers = await prisma.user.count()

        // Calculate session durations for online users
        const onlineUsers = await Promise.all(
            Array.from(userActivityMap.values()).map(async (activity) => {
                // Get user's first activity today to calculate session duration
                // Session starts from first activity of the current day (00:00:00)
                const firstActivityToday = await prisma.activityLog.findFirst({
                    where: {
                        userId: activity.userId,
                        createdAt: {
                            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Start of today
                        }
                    },
                    orderBy: {
                        createdAt: 'asc' // Get the earliest activity today
                    }
                })

                const sessionStart = firstActivityToday?.createdAt || activity.createdAt
                const sessionDuration = now.getTime() - sessionStart.getTime()
                const minutes = Math.floor(sessionDuration / (1000 * 60))
                const hours = Math.floor(minutes / 60)
                
                const sessionDurationStr = hours > 0 
                    ? `${hours}h ${minutes % 60}m`
                    : `${minutes}m`

                // Calculate time since last activity for display
                const timeSinceLastActivity = now.getTime() - activity.createdAt.getTime()
                const minutesAgo = Math.floor(timeSinceLastActivity / (1000 * 60))
                
                // Format last activity time for user-friendly display
                const lastActivityStr = minutesAgo < 1 
                    ? 'Just now'
                    : minutesAgo < 60 
                        ? `${minutesAgo}m ago`
                        : `${Math.floor(minutesAgo / 60)}h ago`

                return {
                    id: activity.user.id,
                    name: activity.user.name,
                    email: activity.user.email,
                    lastActivity: lastActivityStr,
                    // CRITICAL: Online status is determined by 5-minute threshold
                    // If last activity was more than 5 minutes ago, user is offline
                    isOnline: timeSinceLastActivity < 5 * 60 * 1000, // 5 minutes = 300,000ms
                    sessionDuration: sessionDurationStr
                }
            })
        )

        // Sort by most recent activity
        onlineUsers.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1
            if (!a.isOnline && b.isOnline) return 1
            return 0
        })

        // Calculate peak hours (last 24 hours)
        const hourlyActivity = await prisma.activityLog.findMany({
            where: {
                createdAt: {
                    gte: oneDayAgo
                }
            },
            select: {
                createdAt: true
            }
        })

        // Group by hour
        const peakHours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
        
        hourlyActivity.forEach(activity => {
            const hour = activity.createdAt.getHours()
            peakHours[hour].count += 1
        })

        return NextResponse.json({
            onlineUsers,
            totalOnline: onlineUsers.filter(u => u.isOnline).length,
            totalOffline: totalUsers - onlineUsers.filter(u => u.isOnline).length,
            peakHours
        })
    } catch (error) {
        console.error('Error fetching online status:', error)
        return NextResponse.json(
            { error: 'Failed to fetch online status' },
            { status: 500 }
        )
    }
}