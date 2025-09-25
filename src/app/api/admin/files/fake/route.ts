import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { z } from 'zod'
import { FileType } from '@prisma/client'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'

// Validation schema for fake file creation
const FakeFileSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  parentPath: z.string().min(1, 'Parent path is required'),
  fileType: z.nativeEnum(FileType),
  userId: z.string().nullable().optional()
})

function getExtensionFromType(fileType: FileType): string | null {
  switch (fileType) {
    case FileType.DOCUMENT:
      return '.pdf'
    case FileType.VIDEO:
      return '.mp4'
    case FileType.IMAGE:
      return '.jpg'
    case FileType.AUDIO:
      return '.mp3'
    case FileType.ARCHIVE:
      return '.zip'
    case FileType.CODE:
      return '.js'
    case FileType.TEXT:
      return '.txt'
    default:
      return null
  }
}

export const POST = withErrorHandler(async (request: NextRequest) => {
    // Check authentication and admin privileges
    const user = await requireAdmin()

    const body = await request.json()
    const validatedRequest = FakeFileSchema.parse(body)

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

    // Create fake file database record
    const newFile = await prisma.fileSystemItem.create({
      data: {
        name: validatedRequest.fileName,
        type: validatedRequest.fileType,
        path: fullFilePath,
        size: null, // No size for fake files
        extension: getExtensionFromType(validatedRequest.fileType),
        filePath: null, // No physical file path
        isReal: false, // Mark as fake file
        uploadedBy: user.id,
        userId: validatedRequest.userId || null, // Store user-specific assignment
        downloadCount: 0,
        ...(normalizedParentPath !== '/' && { parentPath: normalizedParentPath })
      }
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