import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/features/auth/lib/auth'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { z } from 'zod'
import { ErrorResponses, withErrorHandler } from '@/features/shared/lib/errorHandler'

const fileDownloadSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  fileName: z.string().min(1, 'File name is required')
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 1. Authentication check
  const session = await auth()
  
  if (!session?.user?.id) {
    throw ErrorResponses.UNAUTHORIZED
  }

  // 2. Parse and validate request body (Zod errors handled automatically)
  const body = await request.json()
  const { fileId, fileName } = fileDownloadSchema.parse(body)

  // 3. Track file download
  await SessionTracker.trackFileDownload(session.user.id, fileId, fileName)

  // 4. Return success response
  return NextResponse.json({ success: true })
})