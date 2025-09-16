import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { buildActivityWhereClause } from '@/features/admin/lib/activityFilters'
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

export const GET = withErrorHandler(async (request: NextRequest) => {
    // 1. Admin authentication check
    const user = await requireAdmin()
    
    // 2. Log admin access
    await SessionTracker.logActivity({
        userId: user.id,
        action: 'VIEW_ACTIVITY_LOGS',
        resource: 'api/admin/activity/logs'
    })

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all'

    const skip = (page - 1) * limit

    // 4. Build where clause using shared utility
    const whereClause = buildActivityWhereClause({
        search: search || undefined,
        filter: filter as any
    })

    // 5. Get total count for pagination
    const total = await prisma.activityLog.count({
        where: whereClause
    })

    // 6. Get logs with pagination
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

    // 7. Format the response
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

    // 8. Return paginated response
    return NextResponse.json({
        logs: formattedLogs,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    })
})