import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { activityFiltersSchema, buildActivityWhereClause } from '@/features/admin/lib/activityFilters'
import { z } from 'zod'
import { withErrorHandler, AppError } from '@/features/shared/lib/errorHandler'

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  // 1. Admin authentication check
  const adminUser = await requireAdmin()
  
  // 2. Parse and validate request body
  const body = await request.json()
  const { markAsRead, filters = {} } = z.object({
    markAsRead: z.boolean(),
    filters: activityFiltersSchema.optional()
  }).parse(body)

  // 3. Build where clause and update activities
  const whereClause = buildActivityWhereClause(filters)

  const result = await prisma.activityLog.updateMany({
    where: whereClause,
    data: markAsRead ? {
      isRead: true,
      readBy: adminUser.id,
      readAt: new Date()
    } : {
      isRead: false,
      readBy: null,
      readAt: null
    }
  })

  // 4. Return success response
  return NextResponse.json({
    success: true,
    affectedCount: result.count,
    message: `${result.count} activities marked as ${markAsRead ? 'read' : 'unread'}`
  })
})

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  // 1. Admin authentication check
  await requireAdmin()
  
  // 2. Parse and validate request body
  const body = await request.json()
  const { filters } = z.object({
    filters: z.object({
      startDate: z.string(),
      endDate: z.string(),
      readStatus: z.enum(['read', 'unread', 'all']).optional().default('all')
    })
  }).parse(body)
  
  // 3. Validate required fields
  if (!filters.startDate || !filters.endDate) {
    throw new AppError('Start date and end date are required for filtered deletion', 400, 'MISSING_DATE_RANGE')
  }
  
  // 4. Parse dates and set time boundaries
  const start = new Date(filters.startDate)
  start.setHours(0, 0, 0, 0) // Start of day
  
  const end = new Date(filters.endDate)
  end.setHours(23, 59, 59, 999) // End of day
  
  // 5. Build the where clause
  const whereClause: any = {
    createdAt: {
      gte: start,
      lte: end
    }
  }
  
  // Apply read status filter
  if (filters.readStatus === 'read') {
    whereClause.isRead = true
  } else if (filters.readStatus === 'unread') {
    whereClause.isRead = false
  }
  // If 'all', don't add isRead filter
  
  // 6. Delete the activity logs
  const result = await prisma.activityLog.deleteMany({
    where: whereClause
  })
  
  // 7. Return success response
  return NextResponse.json({
    success: true,
    deletedCount: result.count,
    filters: {
      startDate: filters.startDate,
      endDate: filters.endDate,
      readStatus: filters.readStatus
    }
  })
})