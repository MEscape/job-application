import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/features/auth/lib/auth'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { z } from 'zod'

const searchSchema = z.object({
  searchTerm: z.string().min(1, 'Search term is required'),
  resultsCount: z.number().min(0, 'Results count must be non-negative')
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
    const { searchTerm, resultsCount } = searchSchema.parse(body)

    // Track search activity
    await SessionTracker.trackSearch(session.user.id, searchTerm, resultsCount)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking search:', error)
    
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