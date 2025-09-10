import { PrismaClient } from "@/generated/prisma";

export class FileSystemService {
    constructor(private prisma: PrismaClient) {}

    /**
     * Gets items in a directory
     */
    async getItems(request: GetFileSystemItemsRequest): Promise<GetFileSystemItemsResponse> {
        const {
            path: requestPath,
            includeHidden = false,
            sortBy = 'name',
            sortOrder = 'asc',
            limit = 100,
            offset = 0
        } = request

        // Validate and normalize path
        if (!FileSystemUtils.isValidPath(requestPath)) {
            throw new InvalidPathError(requestPath)
        }

        const normalizedPath = FileSystemUtils.normalizePath(requestPath)

        // Build where clause
        const where: Prisma.FileSystemItemWhereInput = {
            parentPath: normalizedPath === '/' ? null : normalizedPath,
            ...(includeHidden ? {} : { isHidden: false })
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
                take: limit,
                skip: offset
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
}