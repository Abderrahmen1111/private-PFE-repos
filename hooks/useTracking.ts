'use client';

import { useCallback, useRef, useEffect } from 'react';
import { trackEvent } from '@/lib/tracking/trackEvent';
import type { Surface, EventType } from '@/lib/tracking/eventTypes';

export function useTracking() {
    // Track dwell time for items
    const dwellTimeRef = useRef<Map<string, number>>(new Map());
    const scrollDepthRef = useRef<number>(0);

    // ========================================
    // CORE EXPOSURE / NAVIGATION
    // ========================================

    const trackView = useCallback((surface: Surface, itemId?: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'view',
            item_id: itemId,
            merchant_id: merchantId,
        });
    }, []);

    const trackImpression = useCallback((surface: Surface, itemId: string, position: number, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'impression',
            item_id: itemId,
            merchant_id: merchantId,
            rank_position: position,
            viewport_visibility_percentage: 50,
        });
    }, []);

    const trackScroll = useCallback((surface: Surface, percentage: number, depth?: number) => {
        trackEvent({
            surface,
            event_type: 'scroll',
            scroll_depth_percentage: percentage,
            metadata: { depth },
        });
        scrollDepthRef.current = percentage;
    }, []);

    const trackLoadMore = useCallback((surface: Surface, itemCount: number) => {
        trackEvent({
            surface,
            event_type: 'load_more',
            metadata: { itemCount },
        });
    }, []);

    const trackRefresh = useCallback((surface: Surface) => {
        trackEvent({
            surface,
            event_type: 'refresh',
        });
    }, []);

    // ========================================
    // SEARCH INTENT
    // ========================================

    const trackSearch = useCallback((query: string, filters?: Record<string, any>) => {
        trackEvent({
            surface: 'search',
            event_type: 'search',
            search_query: query,
            search_filters: filters,
        });
    }, []);

    const trackRefine = useCallback((query: string, filters: Record<string, any>) => {
        trackEvent({
            surface: 'search',
            event_type: 'refine',
            search_query: query,
            search_filters: filters,
        });
    }, []);

    const trackClearSearch = useCallback(() => {
        trackEvent({
            surface: 'search',
            event_type: 'clear_search',
        });
    }, []);

    const trackNoResults = useCallback((query: string, filters?: Record<string, any>) => {
        trackEvent({
            surface: 'search',
            event_type: 'no_results',
            search_query: query,
            search_filters: filters,
        });
    }, []);

    // ========================================
    // INTERACTION
    // ========================================

    const trackClick = useCallback((surface: Surface, itemId: string, position: number, merchantId?: string) => {
        // Start tracking dwell time
        dwellTimeRef.current.set(itemId, Date.now());
        
        trackEvent({
            surface,
            event_type: 'click',
            item_id: itemId,
            merchant_id: merchantId,
            rank_position: position,
        });
    }, []);

    const trackLongPress = useCallback((surface: Surface, itemId: string, durationMs: number) => {
        trackEvent({
            surface,
            event_type: 'long_press',
            item_id: itemId,
            dwell_time_ms: durationMs,
        });
    }, []);

    const trackHoverDwell = useCallback((surface: Surface, itemId: string, durationMs: number) => {
        trackEvent({
            surface,
            event_type: 'hover_dwell',
            item_id: itemId,
            dwell_time_ms: durationMs,
        });
    }, []);

    // ========================================
    // FILTERS / SORTING
    // ========================================

    const trackFilter = useCallback((surface: Surface, filterType: string, filterValue: any) => {
        trackEvent({
            surface,
            event_type: 'filter',
            metadata: { filterType, filterValue },
        });
    }, []);

    const trackSort = useCallback((surface: Surface, sortBy: string, order: 'asc' | 'desc') => {
        trackEvent({
            surface,
            event_type: 'sort',
            metadata: { sortBy, order },
        });
    }, []);

    const trackRadiusChange = useCallback((radiusKm: number) => {
        trackEvent({
            surface: 'nearby',
            event_type: 'radius_change',
            nearby_radius_km: radiusKm,
        });
    }, []);

    // ========================================
    // MEDIA / REELS
    // ========================================

    const trackStart = useCallback((reelId: string, position: number, merchantId?: string) => {
        trackEvent({
            surface: 'reels',
            event_type: 'start',
            reel_id: reelId,
            reel_position: position,
            merchant_id: merchantId,
        });
        dwellTimeRef.current.set(reelId, Date.now());
    }, []);

    const trackProgress = useCallback((reelId: string, percentage: number, playbackTimeMs: number) => {
        trackEvent({
            surface: 'reels',
            event_type: 'progress',
            reel_id: reelId,
            reel_progress_percentage: percentage,
            reel_playback_time_ms: playbackTimeMs,
        });
    }, []);

    const trackPause = useCallback((reelId: string, percentage: number) => {
        trackEvent({
            surface: 'reels',
            event_type: 'pause',
            reel_id: reelId,
            reel_progress_percentage: percentage,
        });
    }, []);

    const trackResume = useCallback((reelId: string, percentage: number) => {
        trackEvent({
            surface: 'reels',
            event_type: 'resume',
            reel_id: reelId,
            reel_progress_percentage: percentage,
        });
    }, []);

    const trackComplete = useCallback((reelId: string, totalTimeMs: number) => {
        trackEvent({
            surface: 'reels',
            event_type: 'complete',
            reel_id: reelId,
            dwell_time_ms: totalTimeMs,
            reel_progress_percentage: 100,
        });
        dwellTimeRef.current.delete(reelId);
    }, []);

    const trackReplay = useCallback((reelId: string) => {
        trackEvent({
            surface: 'reels',
            event_type: 'replay',
            reel_id: reelId,
        });
    }, []);

    const trackSkip = useCallback((reelId: string, percentage: number, reason?: string) => {
        trackEvent({
            surface: 'reels',
            event_type: 'skip',
            reel_id: reelId,
            reel_progress_percentage: percentage,
            skip_reason: reason || 'swipe',
        });
        dwellTimeRef.current.delete(reelId);
    }, []);

    // ========================================
    // SOCIAL
    // ========================================

    const trackLike = useCallback((surface: Surface, itemId: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'like',
            item_id: itemId,
            merchant_id: merchantId,
            like_type: 'heart',
        });
    }, []);

    const trackUnlike = useCallback((surface: Surface, itemId: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'unlike',
            item_id: itemId,
            merchant_id: merchantId,
        });
    }, []);

    const trackSave = useCallback((surface: Surface, itemId: string, merchantId?: string, listName?: string) => {
        trackEvent({
            surface,
            event_type: 'save',
            item_id: itemId,
            merchant_id: merchantId,
            save_list_name: listName || 'saved',
        });
    }, []);

    const trackUnsave = useCallback((surface: Surface, itemId: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'unsave',
            item_id: itemId,
            merchant_id: merchantId,
        });
    }, []);

    const trackShare = useCallback((surface: Surface, itemId: string, platform: string, merchantId?: string) => {
        trackEvent({
            surface,
            event_type: 'share',
            item_id: itemId,
            merchant_id: merchantId,
            share_platform: platform,
        });
    }, []);

    const trackFollow = useCallback((merchantId: string) => {
        trackEvent({
            surface: 'profile',
            event_type: 'follow',
            merchant_id: merchantId,
            profile_follow_type: 'merchant',
        });
    }, []);

    const trackUnfollow = useCallback((merchantId: string) => {
        trackEvent({
            surface: 'profile',
            event_type: 'unfollow',
            merchant_id: merchantId,
        });
    }, []);

    // ========================================
    // CONVERSION / HIGH INTENT
    // ========================================

    const trackContact = useCallback((itemId: string, merchantId: string, method: string) => {
        trackEvent({
            surface: 'home',
            event_type: 'contact',
            item_id: itemId,
            merchant_id: merchantId,
            contact_method: method,
        });
    }, []);

    const trackDirectionRequest = useCallback((itemId: string, merchantId: string, distanceKm: number) => {
        trackEvent({
            surface: 'nearby',
            event_type: 'direction_request',
            item_id: itemId,
            merchant_id: merchantId,
            distance_to_item_km: distanceKm,
        });
    }, []);

    const trackWebsiteClick = useCallback((itemId: string, merchantId: string, url: string) => {
        trackEvent({
            surface: 'home',
            event_type: 'website_click',
            item_id: itemId,
            merchant_id: merchantId,
            metadata: { url },
        });
    }, []);

    const trackBookingStart = useCallback((itemId: string, merchantId: string) => {
        trackEvent({
            surface: 'home',
            event_type: 'booking_start',
            item_id: itemId,
            merchant_id: merchantId,
        });
    }, []);

    const trackBookingComplete = useCallback((itemId: string, merchantId: string, bookingId: string, amount?: number) => {
        trackEvent({
            surface: 'home',
            event_type: 'booking_complete',
            item_id: itemId,
            merchant_id: merchantId,
            booking_id: bookingId,
            transaction_amount: amount,
        });
    }, []);

    const trackPurchase = useCallback((itemId: string, merchantId: string, amount: number, currency?: string) => {
        trackEvent({
            surface: 'home',
            event_type: 'purchase',
            item_id: itemId,
            merchant_id: merchantId,
            transaction_amount: amount,
            transaction_currency: currency || 'USD',
        });
    }, []);

    // ========================================
    // NEGATIVE FEEDBACK
    // ========================================

    const trackDismiss = useCallback((surface: Surface, itemId: string, reason?: string) => {
        trackEvent({
            surface,
            event_type: 'dismiss',
            item_id: itemId,
            dismiss_reason: reason || 'not_interested',
        });
    }, []);

    const trackHide = useCallback((surface: Surface, itemId: string, reason?: string) => {
        trackEvent({
            surface,
            event_type: 'hide',
            item_id: itemId,
            hide_reason: reason || 'dont_want_to_see',
        });
    }, []);

    const trackBlock = useCallback((merchantId: string, durationDays?: number) => {
        trackEvent({
            surface: 'home',
            event_type: 'block',
            merchant_id: merchantId,
            block_duration_days: durationDays || 30,
        });
    }, []);

    const trackReport = useCallback((itemId: string, reason: string, merchantId?: string) => {
        trackEvent({
            surface: 'home',
            event_type: 'report',
            item_id: itemId,
            merchant_id: merchantId,
            report_reason: reason,
        });
    }, []);

    const trackReportSpam = useCallback((itemId: string, merchantId: string) => {
        trackEvent({
            surface: 'home',
            event_type: 'report_spam',
            item_id: itemId,
            merchant_id: merchantId,
        });
    }, []);

    // Return all tracking functions
    return {
        // Core exposure
        trackView,
        trackImpression,
        trackScroll,
        trackLoadMore,
        trackRefresh,
        
        // Search
        trackSearch,
        trackRefine,
        trackClearSearch,
        trackNoResults,
        
        // Interaction
        trackClick,
        trackLongPress,
        trackHoverDwell,
        
        // Filters
        trackFilter,
        trackSort,
        trackRadiusChange,
        
        // Media
        trackStart,
        trackProgress,
        trackPause,
        trackResume,
        trackComplete,
        trackReplay,
        trackSkip,
        
        // Social
        trackLike,
        trackUnlike,
        trackSave,
        trackUnsave,
        trackShare,
        trackFollow,
        trackUnfollow,
        
        // Conversion
        trackContact,
        trackDirectionRequest,
        trackWebsiteClick,
        trackBookingStart,
        trackBookingComplete,
        trackPurchase,
        
        // Negative
        trackDismiss,
        trackHide,
        trackBlock,
        trackReport,
        trackReportSpam,
    };
}