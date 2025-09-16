import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { buildActivityWhereClause } from '@/features/admin/lib/activityFilters'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAdmin()
        
        // Log admin access
        await SessionTracker.logActivity({
            userId: user.id,
            action: 'VIEW_ACTIVITY_LOGS',
            resource: 'api/admin/activity/logs'
        })

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const filter = searchParams.get('filter') || 'all'

        const skip = (page - 1) * limit

        // Build where clause using shared utility
        const whereClause = buildActivityWhereClause({
            search: search || undefined,
            filter: filter as any
        })

        // Get total count for pagination
        const total = await prisma.activityLog.count({
            where: whereClause
        })

        // Get logs with pagination
        const logs = await prisma.activityLog.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                reader: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        })

        // Format the response
        const formattedLogs = logs.map(log => ({
            id: log.id,
            userId: log.userId,
            userName: log.user.name,
            userEmail: log.user.email,
            action: log.action,
            resource: log.resource || 'N/A',
            timestamp: log.createdAt.toISOString(),
            success: log.success,
            isRead: log.isRead,
            readBy: log.reader ? {
                id: log.reader.id,
                name: log.reader.name,
                email: log.reader.email
            } : null,
            readAt: log.readAt?.toISOString() || null
        }))

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
            logs: formattedLogs,
            total,
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        })
    } catch (error) {
        console.error('Error fetching activity logs:', error)

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
            { error: 'Failed to fetch activity logs' },
            { status: 500 }
        )
    }
}