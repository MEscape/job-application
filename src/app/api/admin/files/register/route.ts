import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { withErrorHandler } from '@/features/shared/lib/errorHandler'
import { prisma } from '@/features/shared/lib'
import { FileType } from '@prisma/client'

const FileRegistrationSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  parentPath: z.string().min(1, 'Parent path is required'),
  fileSize: z.number().positive('File size must be positive').max(250 * 1024 * 1024, 'File size must not exceed 250MB'),
  mimeType: z.string().refine(
    (type) => type === 'application/pdf' || type.startsWith('video/'),
    'Only PDF and video files are allowed'
  ),
  filePath: z.string().url('File path must be a valid URL'),
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
    'application/pdf': 'pdf',
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'video/x-ms-wmv': 'wmv',
    'video/3gpp': '3gp',
    'video/x-flv': 'flv'
  }

  return mimeToExtension[mimeType] || 'unknown'
}

function getFileTypeFromMime(mimeType: string): FileType {
  if (mimeType === 'application/pdf') {
    return FileType.DOCUMENT
  } else if (mimeType.startsWith('video/')) {
    return FileType.VIDEO
  } else {
    return FileType.OTHER
  }
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
  console.log('Registering file in database:', {
    fileName,
    parentPath,
    fileSize,
    mimeType,
    filePath,
    userId,
    uploadedBy
  })

  // Normalize parent path
  const normalizedParentPath = parentPath.startsWith('/') 
    ? parentPath 
    : `/${parentPath}`
  
  // Generate full file path (this is what goes in the 'path' field)
  const fullFilePath = normalizedParentPath === '/' 
    ? `/${fileName}`
    : `${normalizedParentPath}/${fileName}`

  // Check if file already exists using the full file path
  const existingFile = await prisma.fileSystemItem.findUnique({
    where: { path: fullFilePath }
  })

  if (existingFile) {
    throw new Error(`File "${fileName}" already exists at path "${fullFilePath}"`)
  }

  const extension = getExtensionFromMime(mimeType, fileName)
  const fileType = getFileTypeFromMime(mimeType)

  const fileRecord = await prisma.fileSystemItem.create({
    data: {
      name: fileName,
      type: fileType,
      path: fullFilePath, // Full path to the file
      parentPath: normalizedParentPath === '/' ? null : normalizedParentPath, // Directory path
      size: fileSize,
      extension,
      filePath, // Blob URL or local file path
      isReal: true,
      userId: userId || null,
      uploadedBy,
      downloadCount: 0,
      dateCreated: new Date(),
      dateModified: new Date()
    }
  })

  console.log('File registered successfully:', fileRecord)
  return fileRecord
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const adminUser = await requireAdmin()

  try {
    const body = await request.json()
    console.log('File registration request body:', body)

    const validatedData = FileRegistrationSchema.parse(body)
    console.log('Validated registration data:', validatedData)

    const fileRecord = await registerFileInDatabase(
      validatedData.fileName,
      validatedData.parentPath,
      validatedData.fileSize,
      validatedData.mimeType,
      validatedData.filePath,
      validatedData.userId,
      adminUser.id
    )

    return NextResponse.json({
      success: true,
      file: fileRecord,
      message: 'File registered successfully in database'
    })
  } catch (error) {
    console.error('File registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    )
  }
})