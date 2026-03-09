'use client';

import { Camera, MapPin, Calendar, BadgeCheck } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  email: string;
  city: string;
  memberSince: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export default function ProfileHeader({ name, email, city, memberSince, avatarUrl, isVerified }: ProfileHeaderProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
      </div>

      {/* Avatar + info */}
      <div className="px-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 gap-4">
          {/* Avatar */}
          <div className="relative w-fit">
            <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              {avatarUrl
                ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-white">{initials}</span>
              }
            </div>
            <button className="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 transition">
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          {/* Edit button */}
          <button className="self-start sm:self-auto px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:border-gray-300 bg-white shadow-sm">
            Edit Profile
          </button>
        </div>

        {/* Name & meta */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{name}</h1>
            {isVerified && (
              <BadgeCheck className="w-5 h-5 text-blue-600 fill-blue-100" />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{email}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400" />
              {city}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-gray-400" />
              Member since {memberSince}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}