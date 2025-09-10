import {prisma} from "@/features/shared/lib";
import {NextRequest, NextResponse} from "next/server";
import {FileSystemService} from "@/features/desktop/lib/filesystem/FileSystemService";
import {FileSystemItemsQuerySchema} from "@/features/desktop/lib/filesystem/fileSystemScheme";
import {FileSystemError} from "@/errors/FileSystemErrors";

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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const queryParams = {
            path: '/', // Root path for /api/filesystem
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