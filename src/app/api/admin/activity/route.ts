import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { prisma } from '@/features/shared/lib'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'

export const DELETE = withErrorHandler(async (request: NextRequest) => {
        await requireAdmin()
        
        const body = await request.json()
        const { searchParams } = new URL(request.url)
        const deleteType = searchParams.get('type') || 'ids'
        
        let result
        
        if (deleteType === 'filtered') {
            // Time-based filtered deletion
            const { startDate, endDate, onlyRead } = body
            
            if (!startDate || !endDate) {
                throw ErrorResponses.VALIDATION_ERROR
            }
            
            // Parse dates and set time boundaries
            const start = new Date(startDate)
            start.setHours(0, 0, 0, 0) // Start of day
            
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999) // End of day
            
            // Build the where clause
            const whereClause: any = {
                createdAt: {
                    gte: start,
                    lte: end
                }
            }
            
            // If onlyRead is true, only delete read activities
            if (onlyRead) {
                whereClause.isRead = true
            }
            
            // Delete the activity logs
            result = await prisma.activityLog.deleteMany({
                where: whereClause
            })
            
            return NextResponse.json({
                success: true,
                deletedCount: result.count,
                filters: {
                    startDate,
                    endDate,
                    onlyRead
                }
            })
            
        } else {
            // ID-based deletion (default)
            const { logIds } = body
            
            if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
                throw ErrorResponses.VALIDATION_ERROR
            }
            
            // Delete the activity logs
            result = await prisma.activityLog.deleteMany({
                where: {
                    id: {
                        in: logIds
                    }
                }
            })
            
            return NextResponse.json({
                success: true,
                deletedCount: result.count
            })
        }
        
})