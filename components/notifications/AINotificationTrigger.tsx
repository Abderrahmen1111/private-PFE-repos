'use client'

import { useEffect } from 'react'
import { triggerPersonalizedAINotifications } from '@/lib/actions/ai-notifications'

/**
 * Silent trigger for AI personalized notifications.
 * Runs on mount to check if there are new smart recommendations 
 * for the current user.
 */
export function AINotificationTrigger() {
  useEffect(() => {
    const triggerAI = async () => {
      try {
        // We delay it slightly to not compete with initial page load resources
        setTimeout(async () => {
          await triggerPersonalizedAINotifications()
        }, 3000)
      } catch (err) {
        // Silent fail - we don't want to break the UI if AI check fails
        console.warn('AI Notification check skipped')
      }
    }

    triggerAI()
  }, [])

  return null // This component renders nothing
}
