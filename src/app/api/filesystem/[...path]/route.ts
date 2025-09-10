import {prisma} from "@/features/shared/lib";
import {NextRequest, NextResponse} from "next/server";
import {FileSystemService} from "@/features/desktop/lib/filesystem/FileSystemService";
import { FileSystemError } from "@/errors/FileSystemErrors";
import {FileSystemItemsQuerySchema} from "@/features/desktop/lib/filesystem/fileSystemScheme";

const fileSystemService = new FileSystemService(prisma)

function handleError(error: unknown) {
    console.error('Filesystem API Error:', error)

    if (error instanceof FileSystemError) {
        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.statusCode }
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

function extractPath(params: { path?: string[] }): string {
    if (!params.path || params.path.length === 0) {
        return '/'
    }
    return '/' + params.path.join('/')
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> }
) {
    try {
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
    } catch (error) {
        return handleError(error)
    }
}