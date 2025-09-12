import {z} from "zod";

export const FileSystemItemsQuerySchema = z.object({
    path: z.string().default('/'),
    sortBy: z
        .enum(['name', 'dateModified', 'size', 'type'])
        .default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type FileSystemItemsQueryRequest = z.infer<typeof FileSystemItemsQuerySchema>

export const FileUploadSchema = z.object({
    path: z.string().min(1, 'Upload path is required'),
    fileName: z.string().min(1, 'File name is required'),
    fileSize: z.number().positive('File size must be positive'),
    uploadedBy: z.string().min(1, 'Uploaded by is required'),
    mimeType: z.string().refine(
        (type) => type === 'application/pdf',
        'Only PDF files are allowed'
    )
})

export type FileUploadRequest = z.infer<typeof FileUploadSchema>
