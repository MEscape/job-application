import { NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { FileType } from '@prisma/client'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

export const GET = withErrorHandler(async () => {
    // Check authentication
    await requireAdmin()

    // Get all folders from the database
    const folders = await prisma.fileSystemItem.findMany({
      where: {
        type: FileType.FOLDER
      },
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