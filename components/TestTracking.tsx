'use client';

import { trackEvent } from '@/lib/tracking/trackEvent';

export function TestTracking() {
  const handleTestClick = () => {
    trackEvent({
      surface: 'search',
      event_type: 'search_submit',
      search_query: 'test from component',
    });
    console.log('Event sent!');
  };

  return (
    <button onClick={handleTestClick}>
      Test Track Event
    </button>
  );
}