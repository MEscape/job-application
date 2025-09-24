import {prisma} from "@/features/shared/lib";
import {NextRequest, NextResponse} from "next/server";
import {FileSystemService} from "@/features/desktop/lib/filesystem/FileSystemService";
import {FileSystemItemsQuerySchema} from "@/features/desktop/lib/filesystem/fileSystemScheme";
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'
import { auth } from '@/features/auth/lib/auth'

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
    // Require authentication
    const session = await auth()
    if (!session?.user?.id) {
        throw ErrorResponses.UNAUTHORIZED
    }

    const resolvedParams = await params
    const path = extractPath(resolvedParams)
    const { searchParams } = new URL(request.url)

    const queryParams = {
        path,
        sortBy: searchParams.get('sortBy') || 'name',
        sortOrder: searchParams.get('sortOrder') || 'asc',
        userId: session.user.id,
    }

    const validatedParams = FileSystemItemsQuerySchema.parse(queryParams)

    const result = await fileSystemService.getItems(validatedParams)
    return NextResponse.json(result)
})