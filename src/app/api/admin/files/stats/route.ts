import { NextResponse } from "next/server"
import { prisma } from "@/features/shared/lib"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import { FileType } from "@prisma/client"
import { withErrorHandler } from "@/features/shared/lib/errorHandler"

export const GET = withErrorHandler(async () => {
        // Check if user has admin privileges
        await requireAdmin()

        // Get total files count (excluding folders)
        const totalFiles = await prisma.fileSystemItem.count({
            where: {
                type: {
                    not: FileType.FOLDER
                }
            }
        })

        // Get total folders count
        const totalFolders = await prisma.fileSystemItem.count({
            where: {
                type: FileType.FOLDER
            }
        })

        // Get real vs fake files breakdown
        const realFiles = await prisma.fileSystemItem.count({
            where: {
                AND: [
                    { isReal: true },
                    { type: { not: FileType.FOLDER } }
                ]
            }
        })

        const fakeFiles = await prisma.fileSystemItem.count({
            where: {
                AND: [
                    { isReal: false },
                    { type: { not: FileType.FOLDER } }
                ]
            }
        })

        // Get file type breakdown
        const fileTypeStats = await prisma.fileSystemItem.groupBy({
            by: ['type'],
            _count: {
                type: true
            },
            where: {
                type: {
                    not: FileType.FOLDER
                }
            }
        })

        // Get real/fake breakdown by type
        const realFakeByType = await prisma.fileSystemItem.groupBy({
            by: ['type', 'isReal'],
            _count: {
                type: true
            },
            where: {
                type: {
                    not: FileType.FOLDER
                }
            }
        })

        // Calculate total storage used (sum of all real file sizes)
        const storageStats = await prisma.fileSystemItem.aggregate({
            _sum: {
                size: true
            },
            where: {
                AND: [
                    { type: { not: FileType.FOLDER } },
                    { isReal: true },
                    { size: { not: null } }
                ]
            }
        })

        // Get recent files (created in the last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentFiles = await prisma.fileSystemItem.count({
            where: {
                AND: [
                    {
                        type: {
                            not: FileType.FOLDER
                        }
                    },
                    {
                        dateCreated: {
                            gte: sevenDaysAgo
                        }
                    }
                ]
            }
        })

        const topDownloaded = await prisma.fileSystemItem.findMany({
            where: {
                type: {
                    not: FileType.FOLDER
                },
                downloadCount: {
                    gt: 0
                }
            },
            select: {
                id: true,
                name: true,
                downloadCount: true,
                isReal: true
            },
            orderBy: {
                downloadCount: 'desc'
            },
            take: 5
        })

        return NextResponse.json({
            total: totalFiles,
            real: realFiles,
            fake: fakeFiles,
            folders: totalFolders,
            totalItems: totalFiles + totalFolders,
            recent: recentFiles,
            totalStorageBytes: storageStats._sum.size || 0,
            fileTypeBreakdown: fileTypeStats.map(stat => ({
                type: stat.type,
                count: stat._count.type
            })),
            realFakeBreakdown: realFakeByType.map(stat => ({
                type: stat.type,
                isReal: stat.isReal,
                count: stat._count.type
            })),
            topDownloaded
        })
})