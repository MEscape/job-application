import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/features/auth/lib/auth'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { z } from 'zod'

const fileDownloadSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  fileName: z.string().min(1, 'File name is required')
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { fileId, fileName } = fileDownloadSchema.parse(body)

    // Track file download
    await SessionTracker.trackFileDownload(session.user.id, fileId, fileName)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking file download:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}