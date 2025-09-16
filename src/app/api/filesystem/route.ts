import {prisma} from "@/features/shared/lib";
import {NextRequest, NextResponse} from "next/server";
import {FileSystemService} from "@/features/desktop/lib/filesystem/FileSystemService";
import {FileSystemItemsQuerySchema} from "@/features/desktop/lib/filesystem/fileSystemScheme";
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

const fileSystemService = new FileSystemService(prisma)

export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url)

    const queryParams = {
        path: '/', // Root path for /api/filesystem
        sortBy: searchParams.get('sortBy') || 'name',
        sortOrder: searchParams.get('sortOrder') || 'asc',
    }

    const validatedParams = FileSystemItemsQuerySchema.parse(queryParams)

    const result = await fileSystemService.getItems(validatedParams)
    return NextResponse.json(result)
})