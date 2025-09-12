import { NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { auth } from '@/features/auth/lib/auth'
import { FileType } from '@prisma/client'

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

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
  } catch (error) {
    console.error('Error fetching paths:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}