import { NextResponse } from "next/server"
import { prisma } from "@/features/shared/lib"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import { FileType } from "@prisma/client"
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

export const GET = withErrorHandler(async () => {
    // Check if user has admin privileges
    await requireAdmin()

    // Calculate system activity based on recent activity
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get recent user logins (last 24 hours)
    const recentLogins = await prisma.user.count({
        where: {
            lastLogin: {
                gte: twentyFourHoursAgo
            }
        }
    })

    // Get recent file uploads (last 24 hours)
    const recentFileUploads = await prisma.fileSystemItem.count({
        where: {
            AND: [
                {
                    type: {
                        not: FileType.FOLDER
                    }
                },
                {
                    dateCreated: {
                        gte: twentyFourHoursAgo
                    }
                }
            ]
        }
    })

    // Get total active users (last 7 days for baseline)
    const weeklyActiveUsers = await prisma.user.count({
        where: {
            AND: [
                { isActive: true },
                {
                    lastLogin: {
                        gte: sevenDaysAgo
                    }
                }
            ]
        }
    })

    // Calculate activity score (0-100)
    // Formula: (recent_logins * 3 + recent_uploads * 2) / max(weekly_active_users, 1) * 10
    // Capped at 100 to represent percentage
    const baseActivity = (recentLogins * 3 + recentFileUploads * 2)
    const normalizedActivity = Math.min(
        Math.round((baseActivity / Math.max(weeklyActiveUsers, 1)) * 10),
        100
    )

    return NextResponse.json({
        activityScore: normalizedActivity,
        metrics: {
            recentLogins,
            recentFileUploads,
            weeklyActiveUsers,
            calculatedAt: now.toISOString()
        }
    })
})