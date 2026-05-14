'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Review } from './types';
import { ReviewCard } from './ReviewCard';
import { ReviewsLoadingSkeleton } from './LoadingSkeletons';
import { ErrorState, EmptyState } from './ErrorState';
import { ChevronDown } from 'lucide-react';

interface ReviewsListProps {
  userId: string;
}

const PAGE_SIZE = 10;

export function ReviewsList({ userId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchReviews = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `/api/users/${userId}/reviews?page=${pageNum}&limit=${PAGE_SIZE}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data: Review[] = await response.json();

      if (pageNum === 1) {
        setReviews(data);
      } else {
        setReviews((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === PAGE_SIZE);
      setLoading(false);
      setLoadingMore(false);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReviews(1);
  }, [userId, fetchReviews]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  useEffect(() => {
    if (page > 1) {
      fetchReviews(page);
    }
  }, [page, fetchReviews]);

  const handleRetry = () => {
    setPage(1);
    fetchReviews(1);
  };

  if (loading) {
    return (
      <div className="bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <ReviewsLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <ErrorState error={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <EmptyState
            title="No reviews yet"
            description="This user hasn't posted any reviews. Check back later!"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Infinite scroll trigger */}
        <div ref={observerTarget} className="h-4 mt-8" />

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Loading more reviews...</span>
            </div>
          </div>
        )}

        {/* No more reviews indicator */}
        {!hasMore && reviews.length > 0 && (
          <div className="flex justify-center py-8">
            <span className="text-sm text-gray-500">No more reviews</span>
          </div>
        )}
      </div>
    </div>
  );
}
