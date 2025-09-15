"use client"

import { useActivityTracker } from '@/features/auth/hooks/useActivityTracker'
import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface ActivityProviderProps {
  children: ReactNode
}

export function ActivityProvider({ children }: ActivityProviderProps) {
  const { data: session } = useSession()
  
  // Only track activities for authenticated users
  useActivityTracker({
    trackPageViews: !!session?.user,
    trackSessionTime: !!session?.user,
    sessionTimeoutMs: 30 * 60 * 1000 // 30 minutes
  })

  return <>{children}</>
}