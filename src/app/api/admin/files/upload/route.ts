import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'
import { prisma } from '@/features/shared/lib'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { FileType } from '@prisma/client'

// Validation schema
const FileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  parentPath: z.string().min(1, 'Parent path is required'),
  fileSize: z.number().positive('File size must be positive').max(250 * 1024 * 1024, 'File size must not exceed 250MB'),
  mimeType: z.string().refine(
    (type) => type === 'application/pdf' || type.startsWith('video/'),
    'Only PDF and video files are allowed'
  ),
  userId: z.string().nullable().optional()
})

function getExtensionFromMime(mimeType: string, fileName: string): string {
  // First try to get extension from filename
  const fileExtension = fileName.split('.').pop()?.toLowerCase()
  if (fileExtension) {
    return fileExtension
  }

  // Fallback to MIME type mapping
  const mimeToExtension: Record<string, string> = {
    // PDF
    'application/pdf': 'pdf',
    
    // Video formats
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/x-ms-wmv': 'wmv',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'video/3gpp': '3gp',
    'video/x-flv': 'flv',
    'video/x-matroska': 'mkv',
  }

  return mimeToExtension[mimeType] || 'unknown'
}

function getFileTypeFromMime(mimeType: string): FileType {
  if (mimeType === 'application/pdf') {
    return FileType.DOCUMENT
  }
  
  if (mimeType.startsWith('video/')) {
    return FileType.VIDEO
  }
  
  // Fallback
  return FileType.OTHER
}

async function registerFileInDatabase(
  fileName: string,
  parentPath: string,
  fileSize: number,
  mimeType: string,
  filePath: string,
  userId: string | null | undefined,
  uploadedBy: string
) {
  // Normalize parent path
  const normalizedParentPath = parentPath.startsWith('/') 
    ? parentPath 
    : `/${parentPath}`
  
  // Generate full file path
  const fullFilePath = normalizedParentPath === '/' 
    ? `/${fileName}`
    : `${normalizedParentPath}/${fileName}`

  // Check if file already exists in database
  const existingFile = await prisma.fileSystemItem.findUnique({
    where: { path: fullFilePath }
  })

  if (existingFile) {
    throw ErrorResponses.CONFLICT
  }

  // Get file extension
  const extension = getExtensionFromMime(mimeType, fileName)

  // Create database record
  const newFile = await prisma.fileSystemItem.create({
    data: {
      name: fileName,
      type: getFileTypeFromMime(mimeType),
      path: fullFilePath,
      size: fileSize,
      extension,
      filePath, // Store the blob URL or local path
      isReal: true,
      uploadedBy,
      userId: userId || null,
      downloadCount: 0,
      ...(normalizedParentPath !== '/' && { parentPath: normalizedParentPath })
    }
  })

  return {
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
}

// Helper function to process file upload for both environments
async function processFileUpload(
  metadata: z.infer<typeof FileUploadSchema>,
  filePath: string,
  adminUserId: string
) {
  console.log('Processing file upload:', {
    fileName: metadata.fileName,
    parentPath: metadata.parentPath,
    fileSize: metadata.fileSize,
    mimeType: metadata.mimeType,
    filePath,
    userId: metadata.userId,
    adminUserId
  })
  
  try {
    const result = await registerFileInDatabase(
      metadata.fileName,
      metadata.parentPath,
      metadata.fileSize,
      metadata.mimeType,
      filePath,
      metadata.userId,
      adminUserId
    )
    
    console.log('Database registration completed:', result)
    return result
  } catch (error) {
    console.error('Database registration error:', error)
    throw error
  }
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const adminUser = await requireAdmin()
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    // DEVELOPMENT: Direct upload to local filesystem
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const parentPath = formData.get('parentPath') as string
    const userId = formData.get('userId') as string | null

    if (!file) {
      throw ErrorResponses.VALIDATION_ERROR
    }

    // Validate metadata
    const metadata = FileUploadSchema.parse({
      fileName: fileName || file.name,
      parentPath,
      fileSize: file.size,
      mimeType: file.type,
      userId: userId || undefined
    })

    // Generate unique filename and save locally
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}-${metadata.fileName}`
    const uploadsDir = path.join(process.cwd(), 'uploads')
    const localFilePath = path.join(uploadsDir, uniqueFileName)
    
    // Ensure uploads directory exists
    await mkdir(uploadsDir, { recursive: true })
    
    // Write file to disk
    const arrayBuffer = await file.arrayBuffer()
    await writeFile(localFilePath, Buffer.from(arrayBuffer))
    
    // Process upload and register in database
    const filePath = `/uploads/${uniqueFileName}`
    const registerData = await processFileUpload(metadata, filePath, adminUser.id)
    
    return NextResponse.json(registerData)
  } else {
    // PRODUCTION: Client-side upload with presigned URLs
    const body = (await request.json()) as HandleUploadBody

    try {
      console.log('Starting Vercel Blob upload process')
      
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
          console.log('onBeforeGenerateToken - pathname:', pathname, 'clientPayload:', clientPayload)
          
          if (!clientPayload) {
            console.error('No client payload provided')
            throw ErrorResponses.VALIDATION_ERROR
          }
          
          const payload = JSON.parse(clientPayload)
          const validatedRequest = FileUploadSchema.parse(payload)
          
          console.log('Validated request in onBeforeGenerateToken:', validatedRequest)
          
          return {
            allowedContentTypes: [validatedRequest.mimeType],
            maximumSizeInBytes: validatedRequest.fileSize,
          }
        }
      })

      console.log('Vercel Blob upload completed successfully:', jsonResponse)
      
      // Return the blob response - database registration will be handled separately
      return jsonResponse
    } catch (error) {
      console.error('Vercel Blob upload error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Upload failed' },
        { status: 500 }
      )
    }
  }
})