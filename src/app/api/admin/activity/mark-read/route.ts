import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { z } from 'zod'

const markReadSchema = z.object({
  activityIds: z.array(z.string()).min(1, 'At least one activity ID is required'),
  markAsRead: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin()
    
    const body = await request.json()
    const { activityIds, markAsRead } = markReadSchema.parse(body)

    // Update the activities
    const updateData = markAsRead 
      ? {
          isRead: true,
          readBy: adminUser.id,
          readAt: new Date()
        }
      : {
          isRead: false,
          readBy: null,
          readAt: null
        }

    const updatedActivities = await prisma.activityLog.updateMany({
      where: {
        id: {
          in: activityIds
        }
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      updatedCount: updatedActivities.count,
      message: `${updatedActivities.count} activities marked as ${markAsRead ? 'read' : 'unread'}`
    })

  } catch (error) {
    console.error('Error marking activities as read:', error)
    
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