import { NextRequest, NextResponse } from 'next/server'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { auth } from '@/features/auth/lib/auth'
import { z } from 'zod'

const pageViewSchema = z.object({
  path: z.string()
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
    const { path } = pageViewSchema.parse(body)

    // Track page view
    await SessionTracker.trackPageView(session.user.id, path)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking page view:', error)
    
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