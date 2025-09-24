import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import { NextRequest, NextResponse } from "next/server"
import { FileType } from "@prisma/client"
import { prisma } from "@/features/shared/lib"
import { unlink } from "fs/promises"
import { join } from "path"
import { del } from "@vercel/blob"
import { SessionTracker } from "@/features/auth/lib/sessionTracking"
import { z } from "zod"
import { withErrorHandler, ErrorResponses } from "@/features/shared/lib/errorHandler"

const updateFileSchema = z.object({
  id: z.string().min(1, "File ID is required"),
  name: z.string().min(1, "File name is required").optional(),
  parentPath: z.string().optional(),
  userId: z.string().nullable().optional()
})

const deleteFileSchema = z.object({
  id: z.string().min(1, "File ID is required")
})

export const GET = withErrorHandler(async (request: NextRequest) => {
        // Check if user has admin privileges
        const adminUser = await requireAdmin()

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        
        // If id is provided, return single file
        if (id) {
            const file = await prisma.fileSystemItem.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    extension: true,
                    size: true,
                    isReal: true,
                    userId: true,
                    dateCreated: true,
                    dateModified: true
                }
            })
            
            if (!file) {
                throw ErrorResponses.NOT_FOUND
            }
            
            // Log file access
            await SessionTracker.logActivity({
                userId: adminUser.id,
                action: 'VIEW_FILE',
                resource: `api/admin/files/${id}`
            })

            return NextResponse.json({
                id: file.id,
                name: file.name,
                type: file.type,
                extension: file.extension,
                size: file.size,
                isReal: file.isReal,
                dateCreated: file.dateCreated.toISOString(),
                dateModified: file.dateModified.toISOString()
            })
        }
        
        const search = searchParams.get('search')
        const type = searchParams.get('type')
        const isReal = searchParams.get('isReal')
        const parentPath = searchParams.get('parentPath')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        // Build where clause for filtering
        const whereClause: any = {}
        
        if (search) {
            whereClause.name = {
                contains: search,
                mode: 'insensitive'
            }
        }
        
        if (type && Object.values(FileType).includes(type as FileType)) {
            whereClause.type = type as FileType
        }
        
        if (isReal !== null && isReal !== undefined) {
            whereClause.isReal = isReal === 'true'
        }
        
        if (parentPath !== null && parentPath !== undefined) {
            whereClause.parentPath = parentPath === '' ? null : parentPath
        }

        // Get files with pagination
        const [files, totalCount] = await Promise.all([
            prisma.fileSystemItem.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    type: true,
                    path: true,
                    parentPath: true,
                    size: true,
                    extension: true,
                    filePath: true,
                    isReal: true,
                    downloadCount: true,
                    dateCreated: true,
                    dateModified: true,
                    uploadedBy: true,
                    userId: true,
                    uploader: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    dateCreated: 'desc'
                },
                skip: offset,
                take: limit
            }),
            prisma.fileSystemItem.count({ where: whereClause })
        ])

        return NextResponse.json({
            files,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        })
})

async function deleteFileRecursively(fileId: string): Promise<void> {
    // Get the file from database
    const file = await prisma.fileSystemItem.findUnique({
        where: { id: fileId }
    })

    if (!file) {
        throw new Error(`File with id ${fileId} not found`)
    }

    console.log(`Deleting file: ${file.name} (${file.type}) at path: ${file.path}`)

    // If it's a folder, recursively delete all children first
    if (file.type === 'FOLDER') {
        // Find all direct children
        const children = await prisma.fileSystemItem.findMany({
            where: {
                parentPath: file.path
            }
        })

        console.log(`Found ${children.length} children for folder: ${file.name}`)

        // Recursively delete all children
        for (const child of children) {
            await deleteFileRecursively(child.id)
        }

        // Double-check that all children are deleted
        const remainingChildren = await prisma.fileSystemItem.findMany({
            where: {
                parentPath: file.path
            }
        })

        if (remainingChildren.length > 0) {
            console.error(`Warning: ${remainingChildren.length} children still exist after deletion for folder: ${file.name}`)
            // Force delete remaining children
            for (const child of remainingChildren) {
                await prisma.fileSystemItem.delete({
                    where: { id: child.id }
                })
            }
        }
    }

    // Delete physical file for real files
    if (file.isReal && file.filePath) {
        try {
            if (process.env.NODE_ENV === 'development') {
                const relativePath = file.filePath.startsWith('/uploads/') 
                    ? file.filePath.substring('/uploads/'.length)
                    : file.filePath
                const localPath = join(process.cwd(), 'uploads', relativePath)
                console.log(`Deleting local file: ${localPath}`)
                await unlink(localPath)
            } else {
                // Delete from Vercel Blob in production
                console.log(`Deleting blob file: ${file.filePath}`)
                await del(file.filePath)
            }
            console.log(`Successfully deleted physical file: ${file.filePath}`)
        } catch (error) {
            console.error('Error deleting physical file:', error)
            // Continue with database deletion even if physical file deletion fails
        }
    }

    // Delete from database
    console.log(`Deleting from database: ${file.name}`)
    await prisma.fileSystemItem.delete({
        where: { id: fileId }
    })
    console.log(`Successfully deleted: ${file.name}`)
}

export const PUT = withErrorHandler(async (request: NextRequest) => {
        // Check if user has admin privileges
        await requireAdmin()

        const body = await request.json()
        const { id, name, parentPath, userId } = updateFileSchema.parse(body)

        // Get the current file
        const currentFile = await prisma.fileSystemItem.findUnique({
            where: { id }
        })

        if (!currentFile) {
            throw ErrorResponses.NOT_FOUND
        }

        // Prevent changing parent path for folders to avoid complexity
        if (currentFile.type === 'FOLDER' && parentPath !== undefined && parentPath !== currentFile.parentPath) {
            throw ErrorResponses.VALIDATION_ERROR
        }

        // Build update data
        const updateData: any = {
            dateModified: new Date()
        }

        if (userId !== undefined) {
            updateData.userId = userId
        }
        
        if (name && name !== currentFile.name) {
            updateData.name = name
            // Update path if name changes
            const newPath = currentFile.parentPath 
                ? `${currentFile.parentPath}/${name}`
                : `/${name}`
            updateData.path = newPath
        }

        if (parentPath !== undefined && parentPath !== currentFile.parentPath) {
            updateData.parentPath = parentPath === '/' ? null : parentPath
            // Update path if parent changes
            const fileName = name || currentFile.name
            const newPath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`
            updateData.path = newPath
        }

        // Check if new path would conflict with existing file
        if (updateData.path) {
            const existingFile = await prisma.fileSystemItem.findUnique({
                where: { 
                    path: updateData.path,
                    NOT: { id: currentFile.id }
                }
            })

            if (existingFile) {
                throw ErrorResponses.CONFLICT
            }
        }

        // Update the file
        const updatedFile = await prisma.fileSystemItem.update({
            where: { id },
            data: updateData,
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json({ 
            success: true,
            file: updatedFile
        })
})

export const DELETE = withErrorHandler(async (request: NextRequest) => {
        // Check if user has admin privileges
        await requireAdmin()

        const { searchParams } = new URL(request.url)
        const rawId = searchParams.get('id')
        
        const { id } = deleteFileSchema.parse({ id: rawId })

        // Recursively delete the file/folder and all its children
        await deleteFileRecursively(id)

        return NextResponse.json({ success: true })
})