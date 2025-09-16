import { NextRequest, NextResponse } from 'next/server'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { auth } from '@/features/auth/lib/auth'
import { z } from 'zod'
import { withErrorHandler, ErrorResponses } from '@/features/shared/lib/errorHandler'

const pageViewSchema = z.object({
  path: z.string()
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 1. Authentication check
  const session = await auth()
  
  if (!session?.user?.id) {
    throw ErrorResponses.UNAUTHORIZED
  }

  // 2. Parse and validate request body
  const body = await request.json()
  const { path } = pageViewSchema.parse(body)

  // 3. Track page view
  await SessionTracker.trackPageView(session.user.id, path)

  // 4. Return success response
  return NextResponse.json({ success: true })
})