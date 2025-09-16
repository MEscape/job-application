import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { z } from 'zod'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'

const markReadSchema = z.object({
  activityIds: z.array(z.string()).min(1, 'At least one activity ID is required'),
  markAsRead: z.boolean().default(true)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const adminUser = await requireAdmin()
  
  const body = await request.json()
  const parseResult = markReadSchema.safeParse(body)
  
  if (!parseResult.success) {
    return ErrorResponses.VALIDATION_ERROR
  }
  
  const { activityIds, markAsRead } = parseResult.data

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
})