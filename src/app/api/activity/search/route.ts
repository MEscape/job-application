import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/features/auth/lib/auth'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { z } from 'zod'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'

const searchSchema = z.object({
  searchTerm: z.string().min(1, 'Search term is required'),
  resultsCount: z.number().min(0, 'Results count must be non-negative')
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 1. Authentication check
  const session = await auth()
  
  if (!session?.user?.id) {
    throw ErrorResponses.UNAUTHORIZED
  }

  // 2. Parse and validate request body
  const body = await request.json()
  const { searchTerm, resultsCount } = searchSchema.parse(body)

  // 3. Track search activity
  await SessionTracker.trackSearch(session.user.id, searchTerm, resultsCount)

  // 4. Return success response
  return NextResponse.json({ success: true })
})