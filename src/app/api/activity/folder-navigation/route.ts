import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/features/auth/lib/auth'
import { SessionTracker } from '@/features/auth/lib/sessionTracking'
import { withErrorHandler } from '@/features/shared/lib/errorHandler'

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Check authentication
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { path } = body

  // Validate required fields
  if (!path || typeof path !== 'string') {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 })
  }

  // Track folder navigation
  await SessionTracker.trackFolderNavigation(session.user.id, path)

  return NextResponse.json({ success: true })
})