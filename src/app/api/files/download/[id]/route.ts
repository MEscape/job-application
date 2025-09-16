import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { readFile } from 'fs/promises'
import path from 'path'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and admin privileges
    await requireAdmin()
    
    const { id } = await params

    // Get file from database
    const file = await prisma.fileSystemItem.findUnique({
      where: { id }
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Only allow downloading real files
    if (!file.isReal || !file.filePath) {
      return NextResponse.json(
        { error: 'File cannot be downloaded' },
        { status: 400 }
      )
    }

    let fileBuffer: Buffer
    let contentType = 'application/octet-stream'

    try {
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
    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json(
        { error: 'Failed to read file' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Download error:', error)

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