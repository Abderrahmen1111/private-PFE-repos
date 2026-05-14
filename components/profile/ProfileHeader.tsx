'use client';

import { UserProfile } from './types';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface ProfileHeaderProps {
  profile: UserProfile;
  loading: boolean;
}

export function ProfileHeader({ profile, loading }: ProfileHeaderProps) {
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse" />
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-2xl object-cover shadow-sm"
                priority
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <span className="text-2xl font-semibold text-indigo-600">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.full_name}
              </h1>
              {profile.is_verified && (
                <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
              )}
            </div>

            {profile.username && (
              <p className="text-gray-600 text-sm">@{profile.username}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-700 text-center max-w-sm line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Location & Join Date */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span>Joined {joinDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
