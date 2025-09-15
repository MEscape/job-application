import { NextResponse } from 'next/server'
import { auth } from '@/features/auth/lib/auth'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { z } from 'zod'

const sessionSchema = z.object({
    action: z.enum(['START', 'END']),
    duration: z.number().optional()
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = sessionSchema.parse(body)

    // Track user session
    await SessionTracker.trackUserSession(session.user.id, action)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking session:', error)
    
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