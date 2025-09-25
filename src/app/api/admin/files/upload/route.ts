import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/features/shared/lib'
import { z } from 'zod'
import { FileType } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'

// Validation schema for admin file uploads
const AdminFileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  parentPath: z.string().min(1, 'Parent path is required'),
  fileSize: z.number()
    .positive('File size must be positive')
    .max(250 * 1024 * 1024, 'File size must not exceed 250MB'),
  mimeType: z.string().refine(
    (type) => type === 'application/pdf' || type.startsWith('video/'),
    'Only PDF and video files are allowed'
  ),
  userId: z.string().optional()
})

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

export const POST = withErrorHandler(async (request: NextRequest) => {
    // Check authentication and admin privileges
    const user = await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const parentPath = formData.get('parentPath') as string
    const userId = formData.get('userId') as string | null

    if (!file) {
      throw ErrorResponses.VALIDATION_ERROR
    }

    // Validate the upload request
    const uploadRequest = {
      fileName: fileName || file.name,
      parentPath,
      fileSize: file.size,
      mimeType: file.type,
      userId: userId || undefined
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
      // Upload to Vercel Blob in production using multipart upload for large files
      const contentType = file.type || validatedRequest.mimeType || 'application/octet-stream'
      
      // Use multipart upload for files larger than 10MB
      if (file.size > 10 * 1024 * 1024) {
        const blob = await put(uniqueFileName, file, {
          access: 'public',
          addRandomSuffix: false,
          contentType: contentType,
          multipart: true // This enables automatic chunking by Vercel
        })
        actualBlobUrl = blob.url
      } else {
        // Regular upload for smaller files
        const blob = await put(uniqueFileName, file, {
          access: 'public',
          addRandomSuffix: false,
          contentType: contentType
        })
        actualBlobUrl = blob.url
      }
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
      throw ErrorResponses.CONFLICT
    }

    // Create database record
    const newFile = await prisma.fileSystemItem.create({
      data: {
        name: validatedRequest.fileName,
        type: getFileTypeFromMime(file.type),
        path: fullFilePath,
        size: validatedRequest.fileSize,
        extension,
        filePath: process.env.NODE_ENV === 'production' ? (actualBlobUrl) : `/uploads/${uniqueFileName}`, // Store actual blob URL in prod, local path in dev
        isReal: true, // Mark as real file
        uploadedBy: user.id,
        userId: validatedRequest.userId || null, // Store user-specific assignment
        downloadCount: 0,
        ...(normalizedParentPath !== '/' && { parentPath: normalizedParentPath })
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
})