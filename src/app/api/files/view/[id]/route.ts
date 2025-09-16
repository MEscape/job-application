import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { readFile } from 'fs/promises'
import path from 'path'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'

export const GET = withErrorHandler(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
    // Require authentication and admin privileges
    await requireAdmin()
    
    const { id } = await params

    // Get file from database
    const file = await prisma.fileSystemItem.findUnique({
      where: { id }
    })

    if (!file) {
      throw ErrorResponses.NOT_FOUND
    }

    // Only allow viewing real files
    if (!file.isReal || !file.filePath) {
      throw ErrorResponses.VALIDATION_ERROR
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
      // Read from Vercel Blob in production
      const response = await fetch(file.filePath)
      if (!response.ok) {
        throw new Error('Failed to fetch file from blob storage')
      }
      fileBuffer = Buffer.from(await response.arrayBuffer())
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
        default:
          contentType = 'application/octet-stream'
      }
    }

    // Return file for inline viewing (no download)
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString()
      }
    })
})