import { NextResponse } from "next/server"
import { prisma } from "@/features/shared/lib"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import { FileType } from "@/generated/prisma"

export async function GET() {
    try {
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

        // Calculate total storage used (sum of all file sizes)
        const storageStats = await prisma.fileSystemItem.aggregate({
            _sum: {
                size: true
            },
            where: {
                type: {
                    not: FileType.FOLDER
                },
                size: {
                    not: null
                }
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

        return NextResponse.json({
            totalFiles,
            totalFolders,
            totalItems: totalFiles + totalFolders,
            recentFiles,
            totalStorageBytes: storageStats._sum.size || 0,
            fileTypeBreakdown: fileTypeStats.map(stat => ({
                type: stat.type,
                count: stat._count.type
            }))
        })
    } catch (error) {
        console.error('Error fetching file stats:', error)
        
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

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}