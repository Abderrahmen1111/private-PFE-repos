'use client';

import { getSessionId } from '@/lib/session-utils';

// Queue used to batch concurrent rapid events (e.g. scroll) into a single request
let eventQueue: any[] = [];
let isFlushing = false;
let retryTimeout: NodeJS.Timeout | null = null;

export async function trackEvent(
    params: {
        surface: 'search' | 'discover' | 'reels' | 'category' | 'nearby' | 'profile' | 'home';
        event_type: string;
        platform?: 'web' | 'mobile' | 'admin';
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
    },
    // kept for backwards-compatibility but ignored — all events are now immediate
    _immediate = true,
) {
    const { surface, event_type, ...restParams } = params;
    const event = {
        id: crypto.randomUUID(),
        session_id: getSessionId(),
        user_id: typeof localStorage !== 'undefined' ? localStorage.getItem('user_id') || null : null,
        surface,
        page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
        event_type,
        created_at: new Date().toISOString(),
        ...restParams,
    };

    console.log('🎯 trackEvent:', event.event_type, '|', event.surface, '|', event.item_id ?? event.search_query ?? '');

    eventQueue.push(event);

    // Always flush immediately — no more batching delays
    flushEvents();
}

async function flushEvents() {
    if (eventQueue.length === 0) return;

    // Already in-flight: schedule a retry so queued events aren't lost
    if (isFlushing) {
        if (!retryTimeout) {
            retryTimeout = setTimeout(() => {
                retryTimeout = null;
                flushEvents();
            }, 300);
        }
        return;
    }

    isFlushing = true;
    const events = [...eventQueue];
    eventQueue = [];

    try {
        const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events }),
            keepalive: true,
        });
        const result = await res.json();
        console.log('📡 Events saved:', result);
    } catch (error) {
        console.error('❌ Failed to send events — re-queuing:', error);
        // Re-queue so events aren't silently dropped on network error
        eventQueue.unshift(...events);
    } finally {
        isFlushing = false;
    }
}

// Last-chance flush when tab/window closes
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (eventQueue.length > 0) flushEvents();
    });
}