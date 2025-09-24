import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { FileType } from '@prisma/client'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

export const GET = withErrorHandler(async (request: NextRequest) => {
    // Check authentication
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Build where clause for folders
    const where = {
      type: FileType.FOLDER,
      // Filter by userId: 
      // - If userId provided: show public folders (null) + user's folders
      // - If no userId: show only public folders (null)
      ...(userId ? {
        OR: [
          { userId: null },
          { userId: userId }
        ]
      } : {
        userId: null
      })
    }

    // Get all folders from the database
    const folders = await prisma.fileSystemItem.findMany({
      where,
      select: {
        path: true,
        name: true,
        parentPath: true
      },
      orderBy: {
        path: 'asc'
      }
    })

    // Add root path option
    const paths = [
      {
        path: '/',
        name: 'Root',
        parentPath: null
      },
      ...folders
    ]

    return NextResponse.json({ paths })
})