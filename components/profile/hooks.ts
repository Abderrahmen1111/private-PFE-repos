'use client';

import { useState, useEffect } from 'react';
import { UserProfile, UserStats, Review, ApiResponse } from './types';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useUserProfile(userId: string) {
  const [state, setState] = useState<FetchState<UserProfile>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const result: ApiResponse<UserProfile> = await response.json();
        setState({ data: result.data, loading: false, error: null });
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'An error occurred',
        });
      }
    };

    fetchProfile();
  }, [userId]);

  return state;
}

export function useUserStats(userId: string) {
  const [state, setState] = useState<FetchState<UserStats>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const response = await fetch(`/api/users/${userId}/stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user stats');
        }

        const result: ApiResponse<UserStats> = await response.json();
        setState({ data: result.data, loading: false, error: null });
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'An error occurred',
        });
      }
    };

    fetchStats();
  }, [userId]);

  return state;
}

export function useUserReviews(userId: string, page: number = 1, pageSize: number = 10) {
  const [state, setState] = useState<FetchState<Review[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await fetch(
          `/api/users/${userId}/reviews?page=${page}&limit=${pageSize}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const result: ApiResponse<Review[]> = await response.json();
        setState({
          data: page === 1 ? result.data : [...(state.data || []), ...result.data],
          loading: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'An error occurred',
        }));
      }
    };

    fetchReviews();
  }, [userId, page, pageSize]);

  return state;
}
