import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/features/shared/lib'
import { z } from 'zod'
import { FileType } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'

// Validation schema for admin file uploads
const AdminFileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  parentPath: z.string().min(1, 'Parent path is required'),
  fileSize: z.number().positive('File size must be positive'),
  mimeType: z.string().refine(
    (type) => type === 'application/pdf' || type.startsWith('video/'),
    'Only PDF and video files are allowed'
  )
})

function handleError(error: unknown) {
  console.error('Admin File Upload API Error:', error)

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

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.issues },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

function getFileTypeFromMime(mimeType: string): FileType {
  if (mimeType === 'application/pdf') {
    return FileType.DOCUMENT
  }
  if (mimeType.startsWith('video/')) {
    return FileType.VIDEO
  }
  return FileType.OTHER
}

function getExtensionFromMime(mimeType: string, fileName: string): string | null {
  // First try to get extension from filename
  const fileExtension = fileName.split('.').pop()?.toLowerCase()
  if (fileExtension) {
    return `.${fileExtension}`
  }

  // Fallback to mime type
  if (mimeType === 'application/pdf') return '.pdf'
  if (mimeType.startsWith('video/')) {
    const videoType = mimeType.split('/')[1]
    return `.${videoType}`
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin privileges
    const user = await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const parentPath = formData.get('parentPath') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate the upload request
    const uploadRequest = {
      fileName: fileName || file.name,
      parentPath,
      fileSize: file.size,
      mimeType: file.type
    }

    const validatedRequest = AdminFileUploadSchema.parse(uploadRequest)

    // Generate unique filename
    const timestamp = Date.now()
    const extension = getExtensionFromMime(file.type, validatedRequest.fileName)
    const uniqueFileName = `${timestamp}-${validatedRequest.fileName}`
    
    let actualBlobUrl: string | undefined
    
    // Handle file storage based on environment
    if (process.env.NODE_ENV === 'development') {
      // Save locally in development
      const uploadsDir = path.join(process.cwd(), 'uploads')
      const filePath = path.join(uploadsDir, uniqueFileName)
      
      // Ensure uploads directory exists
      await mkdir(uploadsDir, { recursive: true })
      
      // Convert file to buffer and save
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await writeFile(filePath, buffer)
    } else {
      // Upload to Vercel Blob in production
      // Ensure we have a valid content type
      const contentType = file.type || validatedRequest.mimeType || 'application/octet-stream'
      
      // Debug logging for content type
      console.log('File upload debug:', {
        fileName: validatedRequest.fileName,
        fileType: file.type,
        validatedMimeType: validatedRequest.mimeType,
        finalContentType: contentType
      })
      
      const blob = await put(uniqueFileName, file, {
        access: 'public',
        addRandomSuffix: false,
        contentType: contentType
      })
      // Store the actual blob URL for internal use, return secure proxy URL
      actualBlobUrl = blob.url
    }

    // Normalize parent path
    const normalizedParentPath = validatedRequest.parentPath.startsWith('/') 
      ? validatedRequest.parentPath 
      : `/${validatedRequest.parentPath}`
    
    // Generate full file path
    const fullFilePath = normalizedParentPath === '/' 
      ? `/${validatedRequest.fileName}`
      : `${normalizedParentPath}/${validatedRequest.fileName}`

    // Check if file already exists in database
    const existingFile = await prisma.fileSystemItem.findUnique({
      where: { path: fullFilePath }
    })

    if (existingFile) {
      return NextResponse.json(
        { error: `File already exists: ${validatedRequest.fileName}` },
        { status: 409 }
      )
    }

    // Create database record
    const newFile = await prisma.fileSystemItem.create({
      data: {
        name: validatedRequest.fileName,
        type: getFileTypeFromMime(file.type),
        path: fullFilePath,
        parentPath: normalizedParentPath === '/' ? null : normalizedParentPath,
        size: validatedRequest.fileSize,
        extension,
        filePath: process.env.NODE_ENV === 'production' ? (actualBlobUrl) : `/uploads/${uniqueFileName}`, // Store actual blob URL in prod, local path in dev
        isReal: true, // Mark as real file
        uploadedBy: user.id,
        downloadCount: 0
      }
    })

    // Log file upload
    await SessionTracker.logActivity({
      userId: user.id,
      action: 'UPLOAD_FILE',
      resource: `api/admin/files/upload/${newFile.id}`
    })

    return NextResponse.json({
      success: true,
      file: {
        id: newFile.id,
        name: newFile.name,
        type: newFile.type,
        path: newFile.path,
        parentPath: newFile.parentPath,
        size: newFile.size,
        extension: newFile.extension,
        filePath: newFile.filePath,
        isReal: newFile.isReal,
        uploadedBy: newFile.uploadedBy,
        downloadCount: newFile.downloadCount,
        dateCreated: newFile.dateCreated,
        dateModified: newFile.dateModified
      }
    })
  } catch (error) {
    return handleError(error)
  }
}