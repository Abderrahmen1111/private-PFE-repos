'use client';

import { useParams } from 'next/navigation';
import { useUserProfile, useUserStats } from '@/components/profile/hooks';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { TrustStats } from '@/components/profile/TrustStats';
import { ReviewsList } from '@/components/profile/ReviewsList';
import { BottomNavigation } from '@/components/profile/BottomNavigation';
import { ErrorState } from '@/components/profile/ErrorState';

export default function PublicUserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const profileState = useUserProfile(userId);
  const statsState = useUserStats(userId);

  if (!userId) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">User not found.</p>
        </div>
      </div>
    );
  }

  const handleProfileRetry = () => {
    window.location.reload();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 sm:pb-0">
      {/* Profile Header */}
      {profileState.error ? (
        <div className="bg-white">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <ErrorState
              error={profileState.error}
              onRetry={handleProfileRetry}
            />
          </div>
        </div>
      ) : (
        <ProfileHeader
          profile={profileState.data!}
          loading={profileState.loading}
        />
      )}

      {/* Trust Stats */}
      <TrustStats stats={statsState.data || null} loading={statsState.loading} />

      {/* Reviews Section */}
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
        </div>
        <ReviewsList userId={userId} />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation userId={userId} />
    </div>
  );
}
