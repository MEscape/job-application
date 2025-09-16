import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/features/shared/lib'
import { z } from 'zod'
import { FileType } from '@prisma/client'
import { requireAdmin } from '@/features/auth/lib/adminMiddleware'

// Validation schema for fake file creation
const FakeFileSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  parentPath: z.string().min(1, 'Parent path is required'),
  fileType: z.nativeEnum(FileType)
})

function handleError(error: unknown) {
  console.error('Fake File Creation API Error:', error)

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

function getExtensionFromType(fileType: FileType): string {
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
      return '.txt'
  }
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: `File already exists: ${validatedRequest.fileName}` },
        { status: 409 }
      )
    }

    // Create fake file database record
    const newFile = await prisma.fileSystemItem.create({
      data: {
        name: validatedRequest.fileName,
        type: validatedRequest.fileType,
        path: fullFilePath,
        parentPath: normalizedParentPath === '/' ? null : normalizedParentPath,
        size: null, // No size for fake files
        extension: getExtensionFromType(validatedRequest.fileType),
        filePath: null, // No physical file path
        isReal: false, // Mark as fake file
        uploadedBy: user.id,
        downloadCount: 0
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
  } catch (error) {
    return handleError(error)
  }
}