import { NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

export const GET = withErrorHandler(async () => {
    const user = await requireAdmin()
        
        await SessionTracker.logActivity({
            userId: user.id,
            action: 'VIEW_ONLINE_STATUS',
            resource: 'api/admin/activity/online-status'
        })

        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // Get the most recent activity per user (more efficient approach)
        const latestActivities = await prisma.activityLog.groupBy({
            by: ['userId'],
            _max: {
                createdAt: true
            },
            where: {
                createdAt: {
                    gte: oneDayAgo // Look at last 24 hours for any user activity
                }
            }
        })

        // Get user details for users with recent activity
        const usersWithActivity = await prisma.user.findMany({
            where: {
                id: {
                    in: latestActivities.map(a => a.userId)
                }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        })

        // Create a map for quick user lookup
        const userMap = new Map(usersWithActivity.map(u => [u.id, u]))

        // Process users and determine online status
        const processedUsers = await Promise.all(
            latestActivities.map(async (activity) => {
                const user = userMap.get(activity.userId)
                if (!user) return null

                const lastActivityTime = activity._max.createdAt
                if (!lastActivityTime) return null
                const timeSinceLastActivity = now.getTime() - lastActivityTime.getTime()
                const minutesAgo = Math.floor(timeSinceLastActivity / (1000 * 60))
                
                // Determine if user is online (within 5 minutes)
                const isOnline = timeSinceLastActivity < 5 * 60 * 1000

                // Format last activity display
                const lastActivityStr = minutesAgo < 1 
                    ? 'Just now'
                    : minutesAgo < 60 
                        ? `${minutesAgo}m ago`
                        : `${Math.floor(minutesAgo / 60)}h ago`

                // Simplified session duration calculation
                // For performance, just calculate time since their first activity today
                let sessionDuration = '0m'
                
                if (isOnline) {
                    // Only calculate session duration for online users
                    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                    
                    const firstActivityToday = await prisma.activityLog.findFirst({
                        where: {
                            userId: activity.userId,
                            createdAt: {
                                gte: startOfDay
                            }
                        },
                        orderBy: {
                            createdAt: 'asc'
                        }
                    })

                    if (firstActivityToday) {
                        const sessionDurationMs = now.getTime() - firstActivityToday.createdAt.getTime()
                        const minutes = Math.floor(sessionDurationMs / (1000 * 60))
                        const hours = Math.floor(minutes / 60)
                        
                        sessionDuration = hours > 0 
                            ? `${hours}h ${minutes % 60}m`
                            : `${minutes}m`
                    }
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    lastActivity: lastActivityStr,
                    isOnline,
                    sessionDuration
                }
            })
        )

        // Filter out null results and sort
        const validUsers = processedUsers.filter((user): user is NonNullable<typeof user> => user !== null)
        
        // Sort by online status first, then by most recent activity
        validUsers.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1
            if (!a.isOnline && b.isOnline) return 1
            // Both same online status, sort by last activity (most recent first)
            return b.lastActivity.localeCompare(a.lastActivity)
        })

        // Get total user count
        const totalUsers = await prisma.user.count()
        const onlineCount = validUsers.filter(u => u.isOnline).length

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

        const peakHours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
        
        hourlyActivity.forEach(activity => {
            const hour = activity.createdAt.getHours()
            peakHours[hour].count += 1
        })

    return NextResponse.json({
        onlineUsers: validUsers,
        totalOnline: onlineCount,
        totalOffline: totalUsers - onlineCount,
        totalUsers,
        peakHours
    })
})