'use client';

import { useEffect, useRef } from 'react';
import { logStoreAnalyticsEvent } from '@/lib/actions/user-activity';

interface StoreAnalyticsTrackerProps {
  storeId: number;
}

export default function StoreAnalyticsTracker({ storeId }: StoreAnalyticsTrackerProps) {
  // Use a ref to store the session ID so it persists across re-renders but is unique to this mount
  const sessionIdRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Generate a unique session ID for this visit
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }

    const sessionId = sessionIdRef.current;

    // 2. Log the initial view event
    const logView = async () => {
      try {
        await logStoreAnalyticsEvent(storeId, 'view', sessionId);
      } catch (err) {
        console.error('Failed to log store view:', err);
      }
    };

    logView();

    // 3. Set up heartbeat every 30 seconds
    const startHeartbeat = () => {
      heartbeatIntervalRef.current = setInterval(async () => {
        // Only send heartbeat if the page is visible to avoid bloating data
        if (document.visibilityState === 'visible') {
          try {
            await logStoreAnalyticsEvent(storeId, 'heartbeat', sessionId);
          } catch (err) {
            console.error('Failed to log heartbeat:', err);
          }
        }
      }, 30000); // 30 seconds
    };

    startHeartbeat();

    // 4. Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [storeId]);

  // This component doesn't render anything
  return null;
}
