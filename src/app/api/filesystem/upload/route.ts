import { prisma } from "@/features/shared/lib";
import { NextRequest, NextResponse } from "next/server";
import { FileSystemService } from "@/features/desktop/lib/filesystem/FileSystemService";
import { FileUploadSchema } from "@/features/desktop/lib/filesystem/fileSystemScheme";
import {FileSystemError} from "@/errors/FileSystemErrors";
import { auth } from "@/features/auth/lib/auth";

const fileSystemService = new FileSystemService(prisma);

function handleError(error: unknown) {
    console.error('File Upload API Error:', error);

    if (error instanceof FileSystemError) {
        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.statusCode }
        );
    }

    if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}

export async function POST(request: NextRequest) {
    try {
        // Check if user is authenticated and is an admin
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (!session.user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin privileges required for file uploads' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const uploadPath = formData.get('path') as string;
        const customName = formData.get('customName') as string | null; // optional custom name

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!uploadPath) {
            return NextResponse.json(
                { error: 'Upload path is required' },
                { status: 400 }
            );
        }

        // Use customName if provided, otherwise fallback to original file name
        const fileName = customName?.trim() || file.name;

        // Validate the upload request
        const uploadRequest = {
            path: uploadPath,
            fileName,
            fileSize: file.size,
            mimeType: file.type
        };

        const validatedRequest = FileUploadSchema.parse(uploadRequest);

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Upload the file
        const uploadedFile = await fileSystemService.uploadFile(validatedRequest, fileBuffer);

        return NextResponse.json({
            success: true,
            file: uploadedFile
        });
    } catch (error) {
        return handleError(error);
    }
}
