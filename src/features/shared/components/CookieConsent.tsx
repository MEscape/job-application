"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Cookie, Shield } from "lucide-react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import { 
  getCookieConsent, 
  setCookieConsent, 
  type CookiePreferences 
} from "../lib/cookieUtils"

interface CookieConsentProps {
  onAccept?: () => void
  onReject?: () => void
}

export function CookieConsent({ 
  onAccept, 
  onReject 
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)
  const pathname = usePathname()

  // Check if current route is a home route
  const isHomeRoute = pathname === '/';

  useEffect(() => {
    setMounted(true)
    
    // Check if user has already made a choice
    const consent = getCookieConsent()
    if (consent) {
      setHasConsent(true)
      return
    }
    
    setHasConsent(false)
    
    // Wait for playground to load before showing consent
    const checkPlaygroundLoaded = () => {
      // Check if loading overlay is gone (playground is loaded)
      const loadingOverlay = document.querySelector('[class*="fixed inset-0 z-50"][class*="bg-black"]')
      if (!loadingOverlay) {
        // Show consent after a short delay
        setTimeout(() => setIsVisible(true), 500)
      }
    }
    
    // Initial check
    checkPlaygroundLoaded()
    
    // Set up observer to watch for loading overlay removal
    const observer = new MutationObserver(checkPlaygroundLoaded)
    observer.observe(document.body, { childList: true, subtree: true })
    
    // Fallback timeout in case observer doesn't work
    const fallbackTimeout = setTimeout(() => {
      setIsVisible(true)
    }, 5000)
    
    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimeout)
    }
  }, [])

  const handleAccept = () => {
    setCookieConsent({
      necessary: true,
      analytics: false,
      marketing: false
    })
    setIsVisible(false)
    setHasConsent(true)
    onAccept?.()
  }

  const handleReject = () => {
    // For session-only usage, we still set necessary to true
    // but mark that user has made a choice
    setCookieConsent({
      necessary: true,
      analytics: false,
      marketing: false
    })
    setIsVisible(false)
    setHasConsent(true)
    onReject?.()
  }

  // Don't render if not mounted, if user has already consented, or if not on home routes
  if (!mounted || hasConsent === true || !isHomeRoute) return null

  // Check if we're in an iframe (monitor overlay)
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top
  if (isInIframe) return null

  return createPortal(
    <>
      {/* Full screen overlay to block interaction */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          {/* Cookie Consent Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-auto"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl">
                  <Cookie className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Session Cookies
              </h2>
              
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                This website only uses necessary session cookies to manage your login 
                and session. These are required for the website functionality.
              </p>
              
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-white text-sm">Session Cookies</span>
                </div>
                <p className="text-slate-400 text-xs text-left">
                  Store your login credentials and session information. 
                  Automatically deleted when you close the browser.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAccept}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/25"
                >
                  Accept and Continue
                </button>
                
                <button
                  onClick={handleReject}
                  className="w-full px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 font-medium border border-slate-600/30 hover:border-slate-500/50"
                >
                  Decline (Limited Functionality)
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>,
    document.body
  )
}

// Hook to check cookie consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null)
  
  useEffect(() => {
    setConsent(getCookieConsent())
    
    // Listen for consent changes
    const handleConsentChange = (event: CustomEvent) => {
      setConsent(event.detail)
    }
    
    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    }
  }, [])
  
  return consent
}