"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface ActivityTrackerOptions {
  trackPageViews?: boolean
  trackSessionTime?: boolean
  sessionTimeoutMs?: number
}

export function useActivityTracker(options: ActivityTrackerOptions = {}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const sessionStartRef = useRef<Date | null>(null)
  const lastActivityRef = useRef<Date>(new Date())
  const {
    trackPageViews = true,
    trackSessionTime = true,
    sessionTimeoutMs = 30 * 60 * 1000 // 30 minutes
  } = options

  // Track page views
  useEffect(() => {
    if (!session?.user?.id || !trackPageViews) return

    const trackPageView = async () => {
      try {
        await fetch('/api/activity/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pathname
          })
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    trackPageView()
  }, [pathname, session?.user?.id, trackPageViews])

  // Track session start/end
  useEffect(() => {
    if (!session?.user?.id || !trackSessionTime) return

    // Track session start
    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date()
      trackSessionEvent('START')
    }

    // Track user activity
    const updateActivity = () => {
      lastActivityRef.current = new Date()
    }

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    // Check for session timeout
    const timeoutInterval = setInterval(() => {
      const now = new Date()
      const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime()
      
      if (timeSinceLastActivity > sessionTimeoutMs) {
        trackSessionEvent('END')
        sessionStartRef.current = null
      }
    }, 60000) // Check every minute

    // Track session end on page unload
    const handleBeforeUnload = () => {
      if (sessionStartRef.current) {
        trackSessionEvent('END')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(timeoutInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [session?.user?.id, trackSessionTime, sessionTimeoutMs])

  const trackSessionEvent = async (action: 'START' | 'END') => {
    if (!session?.user?.id) return

    try {
      await fetch('/api/activity/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action
        })
      })
    } catch (error) {
      console.error('Failed to track session event:', error)
    }
  }

  const trackFileDownload = async (fileId: string, fileName: string) => {
    if (!session?.user?.id) return

    try {
      await fetch('/api/activity/file-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          fileName
        })
      })
    } catch (error) {
      console.error('Failed to track file download:', error)
    }
  }

  const trackSearch = async (searchTerm: string, resultsCount: number) => {
    if (!session?.user?.id) return

    try {
      await fetch('/api/activity/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm,
          resultsCount
        })
      })
    } catch (error) {
      console.error('Failed to track search:', error)
    }
  }

  return {
    trackFileDownload,
    trackSearch
  }
}