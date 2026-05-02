'use client';

import { useCallback, useRef } from 'react';
import { trackEvent } from '@/lib/tracking/trackEvent';
import type { Surface } from '@/lib/tracking/eventTypes';

export function useTracking() {
    // Tracks when an item was first focused so we can calculate dwell time
    const dwellTimeRef = useRef<Map<string, number>>(new Map());

    // =========================================================================
    // 1. CORE EXPOSURE / NAVIGATION
    // =========================================================================

    /** Track a page/surface view. */
    const trackView = useCallback((surface: Surface, itemId?: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'view',
            item_id: itemId,
            merchant_id: merchantId,
        });
    }, []);

    /** Track an item becoming visible in the viewport at a given rank position. */
    const trackImpression = useCallback((
        surface: Surface,
        itemId: string,
        position: number,
        merchantId?: string,
    ) => {
        trackEvent({
            surface,
            event_type: 'impression',
            item_id: itemId,
            merchant_id: merchantId,
            rank_position: position,
            viewport_visibility_percentage: 50,
        });
    }, []);

    /** Track scroll depth on a surface (percentage 0-100, optional pixel depth). */
    const trackScroll = useCallback((surface: Surface, percentage: number, depth?: number) => {
        trackEvent({
            surface,
            event_type: 'scroll',
            scroll_depth_percentage: percentage,
            metadata: { depth },
        });
    }, []);

    /** Track a "load more" / pagination action. */
    const trackLoadMore = useCallback((surface: Surface, itemCount: number) => {
        trackEvent({
            surface,
            event_type: 'load_more',
            metadata: { itemCount },
        });
    }, []);

    /** Track a pull-to-refresh or manual refresh. */
    const trackRefresh = useCallback((surface: Surface) => {
        trackEvent({
            surface,
            event_type: 'refresh',
        });
    }, []);

    // =========================================================================
    // 2. SEARCH INTENT   (all immediate — must reach Supabase before navigation)
    // =========================================================================

    /** Track a search query submission. */
    const trackSearch = useCallback((query: string, filters?: Record<string, any>) => {
        trackEvent(
            {
                surface: 'search',
                event_type: 'search',
                search_query: query,
                search_filters: filters,
            },
            true, // immediate
        );
    }, []);

    /** Track a search refinement (tab switch, filter change while a query is active). */
    const trackRefine = useCallback((query: string, filters: Record<string, any>) => {
        trackEvent(
            {
                surface: 'search',
                event_type: 'refine',
                search_query: query,
                search_filters: filters,
            },
            true, // immediate
        );
    }, []);

    /** Track the user clearing an active search query. */
    const trackClearSearch = useCallback(() => {
        trackEvent(
            {
                surface: 'search',
                event_type: 'clear_search',
            },
            true, // immediate
        );
    }, []);

    /** Track a search that returned zero results. */
    const trackNoResults = useCallback((query: string, filters?: Record<string, any>) => {
        trackEvent(
            {
                surface: 'search',
                event_type: 'no_results',
                search_query: query,
                search_filters: filters,
            },
            true, // immediate
        );
    }, []);

    // =========================================================================
    // 3. INTERACTION
    // =========================================================================

    /**
     * Track a tap/click on an item.
     * Also starts the dwell-time clock so you can later call trackHoverDwell.
     */
    const trackClick = useCallback((
        surface: Surface,
        itemId: string,
        position: number,
        merchantId?: string,
    ) => {
        dwellTimeRef.current.set(itemId, Date.now());
        trackEvent(
            {
                surface,
                event_type: 'click',
                item_id: itemId,
                merchant_id: merchantId,
                rank_position: position,
            },
            true, // immediate
        );
    }, []);

    /** Track a long-press gesture with the measured duration. */
    const trackLongPress = useCallback((surface: Surface, itemId: string, durationMs: number) => {
        trackEvent({
            surface,
            event_type: 'long_press',
            item_id: itemId,
            dwell_time_ms: durationMs,
        });
    }, []);

    /**
     * Track how long the cursor/focus hovered over an item.
     * Automatically computes duration from the dwellTimeRef if durationMs is omitted.
     */
    const trackHoverDwell = useCallback((surface: Surface, itemId: string, durationMs?: number) => {
        const start = dwellTimeRef.current.get(itemId);
        const computed = durationMs ?? (start ? Date.now() - start : 0);
        dwellTimeRef.current.delete(itemId);

        trackEvent({
            surface,
            event_type: 'hover_dwell',
            item_id: itemId,
            dwell_time_ms: computed,
        });
    }, []);

    // =========================================================================
    // 4. FILTERS / SORTING
    // =========================================================================

    /** Track a filter being applied on a surface. */
    const trackFilter = useCallback((surface: Surface, filterType: string, filterValue: any) => {
        trackEvent({
            surface,
            event_type: 'filter',
            metadata: { filterType, filterValue },
        });
    }, []);

    /** Track a sort order change on a surface. */
    const trackSort = useCallback((surface: Surface, sortBy: string, order: 'asc' | 'desc') => {
        trackEvent({
            surface,
            event_type: 'sort',
            metadata: { sortBy, order },
        });
    }, []);

    /** Track a radius/distance filter change on the nearby surface. */
    const trackRadiusChange = useCallback((radiusKm: number) => {
        trackEvent({
            surface: 'nearby',
            event_type: 'radius_change',
            nearby_radius_km: radiusKm,
        });
    }, []);

    // =========================================================================
    // 5. MEDIA / REELS
    // =========================================================================

    /** Track a reel starting playback. Also starts the dwell-time clock. */
    const trackStart = useCallback((reelId: string, position: number, merchantId?: string) => {
        dwellTimeRef.current.set(reelId, Date.now());
        trackEvent({
            surface: 'reels',
            event_type: 'start',
            reel_id: reelId,
            reel_position: position,
            merchant_id: merchantId,
        });
    }, []);

    /** Track playback progress milestones (e.g., 25 %, 50 %, 75 %). */
    const trackProgress = useCallback((
        reelId: string,
        percentage: number,
        playbackTimeMs: number,
    ) => {
        trackEvent({
            surface: 'reels',
            event_type: 'progress',
            reel_id: reelId,
            reel_progress_percentage: percentage,
            reel_playback_time_ms: playbackTimeMs,
        });
    }, []);

    /** Track a reel being paused. */
    const trackPause = useCallback((reelId: string, percentage: number) => {
        trackEvent({
            surface: 'reels',
            event_type: 'pause',
            reel_id: reelId,
            reel_progress_percentage: percentage,
        });
    }, []);

    /** Track a reel being resumed after a pause. */
    const trackResume = useCallback((reelId: string, percentage: number) => {
        trackEvent({
            surface: 'reels',
            event_type: 'resume',
            reel_id: reelId,
            reel_progress_percentage: percentage,
        });
    }, []);

    /** Track a reel completing playback. Clears the dwell-time clock. */
    const trackComplete = useCallback((reelId: string, totalTimeMs: number) => {
        dwellTimeRef.current.delete(reelId);
        trackEvent({
            surface: 'reels',
            event_type: 'complete',
            reel_id: reelId,
            dwell_time_ms: totalTimeMs,
            reel_progress_percentage: 100,
        });
    }, []);

    /** Track the user replaying a reel from the beginning. */
    const trackReplay = useCallback((reelId: string) => {
        trackEvent({
            surface: 'reels',
            event_type: 'replay',
            reel_id: reelId,
        });
    }, []);

    /**
     * Track a reel being skipped.
     * Clears the dwell-time clock and records how far the user got.
     */
    const trackSkip = useCallback((reelId: string, percentage: number, reason?: string) => {
        dwellTimeRef.current.delete(reelId);
        trackEvent({
            surface: 'reels',
            event_type: 'skip',
            reel_id: reelId,
            reel_progress_percentage: percentage,
            skip_reason: reason ?? 'swipe',
        });
    }, []);

    // =========================================================================
    // 6. SOCIAL SIGNALS
    // =========================================================================

    /** Track a like / heart on any surface. */
    const trackLike = useCallback((surface: Surface, itemId: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'like',
            item_id: itemId,
            merchant_id: merchantId,
            like_type: 'heart',
        }, true); // immediate — user expects likes to persist instantly
    }, []);

    /** Track removing a like. */
    const trackUnlike = useCallback((surface: Surface, itemId: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'unlike',
            item_id: itemId,
            merchant_id: merchantId,
        }, true); // immediate
    }, []);

    /** Track saving an item to a list. */
    const trackSave = useCallback((
        surface: Surface,
        itemId: string,
        merchantId?: string,
        listName?: string,
    ) => {
        trackEvent({
            surface,
            event_type: 'save',
            item_id: itemId,
            merchant_id: merchantId,
            save_list_name: listName ?? 'saved',
        }, true); // immediate
    }, []);

    /** Track removing an item from a saved list. */
    const trackUnsave = useCallback((surface: Surface, itemId: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'unsave',
            item_id: itemId,
            merchant_id: merchantId,
        }, true); // immediate
    }, []);

    /** Track sharing an item to an external platform. */
    const trackShare = useCallback((
        surface: Surface,
        itemId: string,
        platform: string,
        merchantId?: string,
    ) => {
        trackEvent({
            surface,
            event_type: 'share',
            item_id: itemId,
            merchant_id: merchantId,
            share_platform: platform,
        }, true); // immediate
    }, []);

    /** Track following a merchant from any surface. */
    const trackFollow = useCallback((merchantId: string) => {
        trackEvent({
            surface: 'profile',
            event_type: 'follow',
            merchant_id: merchantId,
            profile_follow_type: 'merchant',
        });
    }, []);

    /** Track unfollowing a merchant. */
    const trackUnfollow = useCallback((merchantId: string) => {
        trackEvent({
            surface: 'profile',
            event_type: 'unfollow',
            merchant_id: merchantId,
        });
    }, []);

    // =========================================================================
    // 7. CONVERSION / HIGH INTENT   (all immediate)
    // =========================================================================

    /** Track the user initiating contact with a merchant (WhatsApp, phone, email…). */
    const trackContact = useCallback((itemId: string, merchantId: string, method: string) => {
        trackEvent(
            {
                surface: 'home',
                event_type: 'contact',
                item_id: itemId,
                merchant_id: merchantId,
                contact_method: method,
            },
            true, // immediate
        );
    }, []);

    /** Track a direction / navigation request to a merchant location. */
    const trackDirectionRequest = useCallback((
        itemId: string,
        merchantId: string,
        distanceKm: number,
    ) => {
        trackEvent(
            {
                surface: 'nearby',
                event_type: 'direction_request',
                item_id: itemId,
                merchant_id: merchantId,
                distance_to_item_km: distanceKm,
            },
            true, // immediate
        );
    }, []);

    /** Track a click on an external website link from a merchant profile. */
    const trackWebsiteClick = useCallback((itemId: string, merchantId: string, url: string) => {
        trackEvent(
            {
                surface: 'home',
                event_type: 'website_click',
                item_id: itemId,
                merchant_id: merchantId,
                metadata: { url },
            },
            true, // immediate
        );
    }, []);

    /** Track the user starting a booking flow. */
    const trackBookingStart = useCallback((itemId: string, merchantId: string) => {
        trackEvent(
            {
                surface: 'home',
                event_type: 'booking_start',
                item_id: itemId,
                merchant_id: merchantId,
            },
            true, // immediate
        );
    }, []);

    /** Track a completed booking with optional transaction amount. */
    const trackBookingComplete = useCallback((
        itemId: string,
        merchantId: string,
        bookingId: string,
        amount?: number,
    ) => {
        trackEvent(
            {
                surface: 'home',
                event_type: 'booking_complete',
                item_id: itemId,
                merchant_id: merchantId,
                booking_id: bookingId,
                transaction_amount: amount,
            },
            true, // immediate
        );
    }, []);

    /** Track a completed purchase with amount and optional currency (defaults to DZD). */
    const trackPurchase = useCallback((
        itemId: string,
        merchantId: string,
        amount: number,
        currency?: string,
    ) => {
        trackEvent(
            {
                surface: 'home',
                event_type: 'purchase',
                item_id: itemId,
                merchant_id: merchantId,
                transaction_amount: amount,
                transaction_currency: currency ?? 'DZD',
            },
            true, // immediate
        );
    }, []);

    // =========================================================================
    // 8. NEGATIVE FEEDBACK / QUALITY CONTROL
    // =========================================================================

    /** Track the user dismissing / swiping away an item. */
    const trackDismiss = useCallback((surface: Surface, itemId: string, reason?: string) => {
        trackEvent({
            surface,
            event_type: 'dismiss',
            item_id: itemId,
            dismiss_reason: reason ?? 'not_interested',
        });
    }, []);

    /** Track the user explicitly hiding an item from their feed. */
    const trackHide = useCallback((surface: Surface, itemId: string, reason?: string) => {
        trackEvent({
            surface,
            event_type: 'hide',
            item_id: itemId,
            hide_reason: reason ?? 'dont_want_to_see',
        });
    }, []);

    /** Track blocking a merchant for a given number of days. */
    const trackBlock = useCallback((merchantId: string, durationDays?: number) => {
        trackEvent({
            surface: 'home',
            event_type: 'block',
            merchant_id: merchantId,
            block_duration_days: durationDays ?? 30,
        });
    }, []);

    /** Track a content report with a reason. */
    const trackReport = useCallback((itemId: string, reason: string, merchantId?: string) => {
        trackEvent({
            surface: 'home',
            event_type: 'report',
            item_id: itemId,
            merchant_id: merchantId,
            report_reason: reason,
        });
    }, []);

    /** Track a spam report on a specific item. */
    const trackReportSpam = useCallback((itemId: string, merchantId: string) => {
        trackEvent({
            surface: 'home',
            event_type: 'report_spam',
            item_id: itemId,
            merchant_id: merchantId,
        });
    }, []);

    // =========================================================================
    // RETURN ALL FUNCTIONS
    // =========================================================================

    return {
        // 1. Core exposure / navigation
        trackView,
        trackImpression,
        trackScroll,
        trackLoadMore,
        trackRefresh,

        // 2. Search intent
        trackSearch,
        trackRefine,
        trackClearSearch,
        trackNoResults,

        // 3. Interaction
        trackClick,
        trackLongPress,
        trackHoverDwell,

        // 4. Filters / sorting
        trackFilter,
        trackSort,
        trackRadiusChange,

        // 5. Media / reels
        trackStart,
        trackProgress,
        trackPause,
        trackResume,
        trackComplete,
        trackReplay,
        trackSkip,

        // 6. Social signals
        trackLike,
        trackUnlike,
        trackSave,
        trackUnsave,
        trackShare,
        trackFollow,
        trackUnfollow,

        // 7. Conversion / high intent
        trackContact,
        trackDirectionRequest,
        trackWebsiteClick,
        trackBookingStart,
        trackBookingComplete,
        trackPurchase,

        // 8. Negative feedback
        trackDismiss,
        trackHide,
        trackBlock,
        trackReport,
        trackReportSpam,
    };
}