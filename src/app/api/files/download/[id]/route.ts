import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { readFile } from 'fs/promises'
import path from 'path'
import { auth } from '@/features/auth/lib/auth'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'
import { downloadFileFromLFS } from '@/features/shared/lib/githubLFS'

export const GET = withErrorHandler(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
    // Require authentication
    const session = await auth()
    if (!session) {
        throw ErrorResponses.UNAUTHORIZED
    }
    
    const { id } = await params

    // Get file from database
    const file = await prisma.fileSystemItem.findUnique({
      where: { id }
    })

    if (!file) {
      throw ErrorResponses.NOT_FOUND
    }

    // Only allow downloading real files
    if (!file.isReal || !file.filePath) {
      throw ErrorResponses.VALIDATION_ERROR
    }

    // Allow access if user is admin or if file is attached to this user or public
    const hasAccess = file.userId === null || session.user.isAdmin || file.userId === session.user.id
    
    if (!hasAccess) {
      throw ErrorResponses.FORBIDDEN
    }

    let fileBuffer: Buffer
    let contentType = 'application/octet-stream'

    if (process.env.NODE_ENV === 'development') {
      // Read from local storage in development
      // filePath in dev is like '/uploads/filename.ext', so we need to remove the leading '/uploads/'
      const relativePath = file.filePath.startsWith('/uploads/') 
        ? file.filePath.substring('/uploads/'.length)
        : file.filePath
      const filePath = path.join(process.cwd(), 'uploads', relativePath)
      fileBuffer = await readFile(filePath)
    } else {
      // Read from GitHub LFS in production
      fileBuffer = await downloadFileFromLFS(file.filePath)
    }

    // Set proper content type based on file extension
    if (file.extension) {
      switch (file.extension.toLowerCase()) {
        case '.pdf':
          contentType = 'application/pdf'
          break
        case '.mp4':
          contentType = 'video/mp4'
          break
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg'
          break
        case '.png':
          contentType = 'image/png'
          break
        case '.txt':
          contentType = 'text/plain'
          break
        case '.zip':
          contentType = 'application/zip'
          break
        default:
          contentType = 'application/octet-stream'
      }
    }

    // Increment download count
    await prisma.fileSystemItem.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    })

    // Return file with proper headers
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })
})