import { z } from 'zod'

export const activityFiltersSchema = z.object({
  search: z.string().optional(),
  filter: z.enum(['all', 'login', 'admin', 'file', 'navigation', 'unread', 'read']).optional(),
  readStatus: z.enum(['read', 'unread', 'all']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export type ActivityFilters = z.infer<typeof activityFiltersSchema>

/**
 * Builds a Prisma where clause based on activity filters
 * Used by both logs and bulk operations endpoints
 */
export function buildActivityWhereClause(filters: ActivityFilters) {
  const whereClause: any = {}

  // Search filter
  if (filters.search) {
    whereClause.OR = [
      {
        user: {
          name: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      },
      {
        user: {
          email: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      },
      {
        action: {
          contains: filters.search,
          mode: 'insensitive'
        }
      },
      {
        resource: {
          contains: filters.search,
          mode: 'insensitive'
        }
      }
    ]
  }

  // Action type filter
  if (filters.filter && filters.filter !== 'all') {
    switch (filters.filter) {
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
        whereClause.action = {
          contains: 'PAGE_VIEW'
        }
        break
      case 'unread':
        whereClause.isRead = false
        break
      case 'read':
        whereClause.isRead = true
        break
    }
  }

  // Read status filter (takes precedence over filter if both are set)
  if (filters.readStatus && filters.readStatus !== 'all') {
    whereClause.isRead = filters.readStatus === 'read'
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {}
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59, 999) // End of day
      whereClause.createdAt.lte = endDate
    }
  }

  return whereClause
}