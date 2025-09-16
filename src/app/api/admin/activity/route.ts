import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { prisma } from '@/features/shared/lib'

export async function DELETE(request: NextRequest) {
    try {
        await requireAdmin()
        
        const body = await request.json()
        const { searchParams } = new URL(request.url)
        const deleteType = searchParams.get('type') || 'ids'
        
        let result
        
        if (deleteType === 'filtered') {
            // Time-based filtered deletion
            const { startDate, endDate, onlyRead } = body
            
            if (!startDate || !endDate) {
                return NextResponse.json(
                    { error: 'Start date and end date are required for filtered deletion' },
                    { status: 400 }
                )
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
                return NextResponse.json(
                    { error: 'Invalid log IDs provided' },
                    { status: 400 }
                )
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
        
    } catch (error) {
        console.error('Error deleting activity logs:', error)
        return NextResponse.json(
            { error: 'Failed to delete activity logs' },
            { status: 500 }
        )
    }
}