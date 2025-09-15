import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'

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

        // Build where clause based on filters
        const whereClause: any = {}

        // Search filter
        if (search) {
            whereClause.OR = [
                {
                    user: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    user: {
                        email: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    action: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    resource: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
        }

        // Action type filter
        if (filter !== 'all') {
            switch (filter) {
                case 'login':
                    whereClause.action = {
                        contains: 'LOGIN'
                    }
                    break
                case 'admin':
                    whereClause.action = {
                        contains: 'ADMIN'
                    }
                    break
                case 'file':
                    whereClause.action = {
                        in: ['UPLOAD_FILE', 'DELETE_FILE', 'VIEW_FILE', 'UPDATE_FILE']
                    }
                    break
                case 'navigation':
                    whereClause.action = 'NAVIGATE'
                    break
            }
        }

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
            success: log.success
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
        return NextResponse.json(
            { error: 'Failed to fetch activity logs' },
            { status: 500 }
        )
    }
}