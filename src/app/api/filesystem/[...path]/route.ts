import {prisma} from "@/features/shared/lib";
import {NextRequest, NextResponse} from "next/server";
import {FileSystemService} from "@/features/desktop/lib/filesystem/FileSystemService";
import {FileSystemItemsQuerySchema} from "@/features/desktop/lib/filesystem/fileSystemScheme";
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

const fileSystemService = new FileSystemService(prisma)

function extractPath(params: { path?: string[] }): string {
    if (!params.path || params.path.length === 0) {
        return '/'
    }
    return '/' + params.path.join('/')
}

export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> }
) => {
    const resolvedParams = await params
    const path = extractPath(resolvedParams)
    const { searchParams } = new URL(request.url)

    const queryParams = {
        path,
        sortBy: searchParams.get('sortBy') || 'name',
        sortOrder: searchParams.get('sortOrder') || 'asc',
    }

    const validatedParams = FileSystemItemsQuerySchema.parse(queryParams)

    const result = await fileSystemService.getItems(validatedParams)
    return NextResponse.json(result)
})