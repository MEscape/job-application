import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
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

async function createDatabaseRecord(
  validatedRequest: z.infer<typeof AdminFileUploadSchema>,
  extension: string | null,
  fileName: string,
  filePath: string,
  user: any
) {
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
      type: getFileTypeFromMime(validatedRequest.mimeType),
      path: fullFilePath,
      size: validatedRequest.fileSize,
      extension,
      filePath,
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
}

export const POST = withErrorHandler(async (request: NextRequest) => {
    // Check authentication and admin privileges
    const user = await requireAdmin()

    // Check if this is a FormData request (development) or JSON request (production)
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Development: Handle FormData uploads (original functionality)
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
        parentPath: parentPath || '/',
        fileSize: file.size,
        mimeType: file.type,
        userId: userId || undefined
      }

      const validatedRequest = AdminFileUploadSchema.parse(uploadRequest)

      // Get file extension
      const extension = getExtensionFromMime(file.type, file.name)

      // Create upload directory
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      // Generate unique filename
      const timestamp = Date.now()
      const uniqueFileName = `${timestamp}-${file.name}`
      const filePath = path.join(uploadDir, uniqueFileName)

      // Save file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Create database record
      const relativePath = `/uploads/${uniqueFileName}`
      return await createDatabaseRecord(
        validatedRequest,
        extension,
        file.name,
        relativePath,
        user
      )
    } else {
      // Production: Use handleUpload for client-side uploads with server-side token generation
      const body = (await request.json()) as HandleUploadBody

      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          // clientPayload is a string containing JSON with file metadata
          let fileMetadata: any = {}
          if (clientPayload) {
            try {
              fileMetadata = JSON.parse(clientPayload)
            } catch (e) {
              throw new Error('Invalid client payload')
            }
          }

          // Validate file type and size before generating token
          const allowedTypes = ['application/pdf', 'video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime']
          
          if (fileMetadata.type && !allowedTypes.includes(fileMetadata.type)) {
            throw new Error('Only PDF and video files are allowed')
          }

          if (fileMetadata.size && fileMetadata.size > 250 * 1024 * 1024) {
            throw new Error('File size must not exceed 250MB')
          }

          return {
            allowedContentTypes: allowedTypes,
            maximumSizeInBytes: 250 * 1024 * 1024,
            multipart: true, // Enable multipart uploads for large files
            tokenPayload: JSON.stringify({
              fileName: fileMetadata.fileName || pathname.split('/').pop() || 'unknown',
              parentPath: fileMetadata.parentPath || '/',
              userId: fileMetadata.userId || null,
              fileSize: fileMetadata.size || 0,
              mimeType: fileMetadata.type || 'application/octet-stream'
            })
          }
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          // Parse tokenPayload to get file metadata
          const metadata = JSON.parse(tokenPayload || '{}')

          // Validate the upload request
          const uploadRequest = {
            fileName: metadata.fileName,
            parentPath: metadata.parentPath,
            fileSize: metadata.fileSize,
            mimeType: metadata.mimeType,
            userId: metadata.userId || undefined
          }

          const validatedRequest = AdminFileUploadSchema.parse(uploadRequest)
          const extension = getExtensionFromMime(metadata.mimeType, metadata.fileName)

          // Create database record using blob URL as filePath
          await createDatabaseRecord(
            validatedRequest,
            extension,
            metadata.fileName,
            blob.url, // Use blob URL as filePath
            user
          )
        }
      })

      return NextResponse.json(jsonResponse)
    }
})