import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/features/auth/lib/auth'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { z } from 'zod'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'

const sessionSchema = z.object({
    action: z.enum(['START', 'END']),
    duration: z.number().optional()
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 1. Authentication check
  const session = await auth()
  
  if (!session?.user?.id) {
    throw ErrorResponses.UNAUTHORIZED
  }

  // 2. Parse and validate request body
  const body = await request.json()
  const { action } = sessionSchema.parse(body)

  // 3. Track user session
  await SessionTracker.trackUserSession(session.user.id, action)

  // 4. Return success response
  return NextResponse.json({ success: true })
})