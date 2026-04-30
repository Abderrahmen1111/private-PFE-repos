'use client';

import { getSessionId } from '@/lib/session-utils';

// Event queue for batching
let eventQueue: any[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
let isFlushing = false;

export async function trackEvent(params: {
    surface: 'search' | 'discover' | 'reels' | 'category' | 'nearby' | 'profile' | 'home';
    event_type: string;
    item_id?: string;
    merchant_id?: string;
    category_id?: string;
    search_query?: string;
    search_result_position?: number;
    discover_feed_position?: number;
    reel_id?: string;
    reel_progress_percentage?: number;
    dwell_time_ms?: number;
    scroll_depth_percentage?: number;
    [key: string]: any;
}) {
    const event = {
        id: crypto.randomUUID(),
        session_id: getSessionId(),
        user_id: localStorage.getItem('user_id') || null,
        surface: params.surface,
        page_path: window.location.pathname,
        event_type: params.event_type,
        created_at: new Date().toISOString(),
        ...params
    };

    eventQueue.push(event);

    if (eventQueue.length >= 10) {
        flushEvents();
    } else if (!flushTimeout) {
        flushTimeout = setTimeout(flushEvents, 5000);
    }
}

async function flushEvents() {
    if (flushTimeout) {
        clearTimeout(flushTimeout);
        flushTimeout = null;
    }

    if (isFlushing || eventQueue.length === 0) return;

    isFlushing = true;
    const events = [...eventQueue];
    eventQueue = [];

    try {
        await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events }),
            keepalive: true,
        });
    } catch (error) {
        console.error('Failed to send events:', error);
        // Re-queue on failure
        if (events.length > 0) {
            eventQueue.unshift(...events);
        }
    } finally {
        isFlushing = false;
    }
}

// Flush on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (eventQueue.length > 0) {
            flushEvents();
        }
    });
}