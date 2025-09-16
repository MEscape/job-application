import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { activityFiltersSchema, buildActivityWhereClause } from '@/features/admin/lib/activityFilters'
import { z } from 'zod'

export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await requireAdmin()
    
    const body = await request.json()
    const { markAsRead, filters = {} } = z.object({
      markAsRead: z.boolean(),
      filters: activityFiltersSchema.optional()
    }).parse(body)

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

    return NextResponse.json({
      success: true,
      affectedCount: result.count,
      message: `${result.count} activities marked as ${markAsRead ? 'read' : 'unread'}`
    })

  } catch (error) {
    console.error('Error updating activities:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        },
        { status: 400 }
      )
    }
    
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const { filters } = z.object({
      filters: z.object({
        startDate: z.string(),
        endDate: z.string(),
        readStatus: z.enum(['read', 'unread', 'all']).optional().default('all')
      })
    }).parse(body)
    
    if (!filters.startDate || !filters.endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required for filtered deletion' },
        { status: 400 }
      )
    }
    
    // Parse dates and set time boundaries
    const start = new Date(filters.startDate)
    start.setHours(0, 0, 0, 0) // Start of day
    
    const end = new Date(filters.endDate)
    end.setHours(23, 59, 59, 999) // End of day
    
    // Build the where clause
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
    
    // Delete the activity logs
    const result = await prisma.activityLog.deleteMany({
      where: whereClause
    })
    
    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      filters: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        readStatus: filters.readStatus
      }
    })
    
  } catch (error) {
    console.error('Error deleting activities:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        },
        { status: 400 }
      )
    }
    
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
