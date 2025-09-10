import { PrismaClient, FileType, Prisma } from "@/generated/prisma";
import { FileSystemUtils } from "../../utils/FileSystemUtils";
import {FileSystemItemsQueryRequest, FileUploadRequest} from "@/features/desktop/lib/filesystem/fileSystemScheme";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import {
    DirectoryNotFoundError, FileNotFoundError,
    FileSystemError,
    InvalidPathError
} from "@/errors/FileSystemErrors";

export type SortBy = 'name' | 'dateModified' | 'size' | 'type'
export type SortOrder = 'asc' | 'desc'

export interface FileSystemItemBase {
    id: string
    name: string
    type: FileType
    path: string
    parentPath: string | null
    size: number | null
    extension: string | null
    dateCreated: Date
    dateModified: Date
}

interface GetFileSystemItemsResponse {
    items: FileSystemItemBase[]
    totalCount: number
    path: string
    parent: FileSystemItemBase | null
}

export class FileSystemService {
    constructor(private prisma: PrismaClient) {}

    /**
     * Gets items in a directory
     */
    async getItems(request: FileSystemItemsQueryRequest): Promise<GetFileSystemItemsResponse> {
        const {
            path: requestPath,
            sortBy = 'name',
            sortOrder = 'asc',
        } = request

        // Validate and normalize path
        if (!FileSystemUtils.isValidPath(requestPath)) {
            throw new InvalidPathError(requestPath)
        }

        const normalizedPath = FileSystemUtils.normalizePath(requestPath)

        // Build where clause
        const where: Prisma.FileSystemItemWhereInput = {
            parentPath: normalizedPath === '/' ? null : normalizedPath
        }

        // Build orderBy clause
        const orderBy: Prisma.FileSystemItemOrderByWithRelationInput = {
            [sortBy]: sortOrder
        }

        // Execute queries in parallel
        const [items, totalCount, parent] = await Promise.all([
            this.prisma.fileSystemItem.findMany({
                where,
                orderBy,
            }),
            this.prisma.fileSystemItem.count({ where }),
            normalizedPath === '/'
                ? Promise.resolve(null)
                : this.prisma.fileSystemItem.findUnique({
                    where: { path: normalizedPath }
                })
        ])

        // Check if directory exists (only if not root and no items found)
        if (normalizedPath !== '/' && totalCount === 0 && !parent) {
            throw new FileNotFoundError(normalizedPath)
        }

        return {
            items: items.map(this.mapPrismaItemToBase),
            totalCount,
            path: normalizedPath,
            parent: parent ? this.mapPrismaItemToBase(parent) : null
        }
    }

    /**
     * Uploads a file to the specified directory
     */
    async uploadFile(request: FileUploadRequest, fileBuffer: Buffer): Promise<FileSystemItemBase> {
        const { path: uploadPath, fileName, fileSize } = request

        // Validate and normalize the upload path
        if (!FileSystemUtils.isValidPath(uploadPath)) {
            throw new InvalidPathError(uploadPath)
        }

        const normalizedPath = FileSystemUtils.normalizePath(uploadPath)

        // Check if the target directory exists
        const targetDirectory = await this.prisma.fileSystemItem.findUnique({
            where: { path: normalizedPath }
        })

        if (!targetDirectory || targetDirectory.type !== FileType.FOLDER) {
            throw new DirectoryNotFoundError(normalizedPath)
        }

        // Generate the full file path
        const extension = FileSystemUtils.getExtension(fileName)
        const fullFilePath = FileSystemUtils.joinPath(normalizedPath, fileName)

        // Check if file already exists
        const existingFile = await this.prisma.fileSystemItem.findUnique({
            where: { path: fullFilePath }
        })

        if (existingFile) {
            throw new FileSystemError(
                `File already exists: ${fileName}`,
                'FILE_ALREADY_EXISTS',
                409
            )
        }

        // Create the physical file directory if it doesn't exist
        const physicalDirPath = path.join(process.cwd(), 'uploads', normalizedPath.slice(1))
        await mkdir(physicalDirPath, { recursive: true })

        // Write the file to disk
        const physicalFilePath = path.join(physicalDirPath, fileName)
        await writeFile(physicalFilePath, fileBuffer)

        // Create database record
        const newFile = await this.prisma.fileSystemItem.create({
            data: {
                name: fileName,
                type: FileType.DOCUMENT,
                path: fullFilePath,
                parentPath: normalizedPath,
                size: fileSize,
                extension,
            }
        })

        return this.mapPrismaItemToBase(newFile)
    }

    /**
     * Maps Prisma model to base interface
     */
    private mapPrismaItemToBase(item: any): FileSystemItemBase {
        return {
            id: item.id,
            name: item.name,
            type: item.type,
            path: item.path,
            parentPath: item.parentPath,
            size: item.size,
            extension: item.extension,
            dateCreated: item.dateCreated,
            dateModified: item.dateModified
        }
    }
}