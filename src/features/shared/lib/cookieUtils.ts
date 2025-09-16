/**
 * Session cookie consent utilities
 */

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp?: string
}

const COOKIE_CONSENT_KEY = 'cookie-consent'
const COOKIE_CONSENT_VERSION = '1.0'

/**
 * Get current cookie consent preferences
 */
export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    
    // Check if consent is still valid (1 year)
    if (parsed.timestamp) {
      const consentDate = new Date(parsed.timestamp)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (consentDate < oneYearAgo) {
        // Consent expired, remove it
        localStorage.removeItem(COOKIE_CONSENT_KEY)
        return null
      }
    }
    
    return parsed
  } catch {
    return null
  }
}

/**
 * Set cookie consent preferences
 */
export function setCookieConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return
  
  const consentData = {
    ...preferences,
    timestamp: new Date().toISOString(),
    version: COOKIE_CONSENT_VERSION
  }
  
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData))
  
  // Dispatch custom event for other parts of the app to listen to
  window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
    detail: consentData
  }))
}
