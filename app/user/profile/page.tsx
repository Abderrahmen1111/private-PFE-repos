'use client';

import { useState } from 'react';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileStats from '@/components/profile/profile-stats';
import ProfileTabs, { type TabId } from '@/components/profile/profile-tabs';
import ReviewCard from '@/components/profile/review-card';
import SavedPlaceCard from '@/components/profile/saved-place-card';
import ActivityItem from '@/components/profile/activity-item';
import { Save, Lock, Bell, Trash2 } from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUser = {
  name: 'Yassine Trabelsi',
  email: 'yassine.trabelsi@gmail.com',
  city: 'Tunis, Tunisia',
  memberSince: 'January 2024',
  isVerified: true,
};

const mockReviews = [
  {
    id: '1',
    businessName: 'Le Baroque Restaurant',
    businessImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
    businessCategory: 'Restaurant · French Cuisine',
    rating: 5,
    reviewText: 'Absolutely stunning experience. The ambiance was perfect, the food was exquisite, and the service was impeccable. Will definitely be returning soon!',
    date: 'May 2026',
    helpfulCount: 8,
  },
  {
    id: '2',
    businessName: 'Café Tunis Central',
    businessImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
    businessCategory: 'Café · Coffee Shop',
    rating: 4,
    reviewText: 'Great coffee and a cozy atmosphere. Perfect spot to work or catch up with friends. The wifi is reliable and the pastries are fresh daily.',
    date: 'April 2026',
    helpfulCount: 3,
  },
  {
    id: '3',
    businessName: 'Atlas Gym',
    businessImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
    businessCategory: 'Fitness · Gym',
    rating: 4,
    reviewText: 'Modern equipment, clean facilities, and professional trainers. The membership is worth every dinar. Highly recommend the morning classes.',
    date: 'March 2026',
    helpfulCount: 5,
  },
];

const mockSavedPlaces = [
  {
    id: '1',
    name: 'Sidi Bou Said Café',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    rating: 4.8,
    category: 'Café',
    location: 'Sidi Bou Said, Tunis',
    savedDate: '2 days ago',
  },
  {
    id: '2',
    name: 'La Marsa Seafood',
    image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=400&h=300&fit=crop',
    rating: 4.6,
    category: 'Restaurant',
    location: 'La Marsa, Tunis',
    savedDate: '1 week ago',
  },
  {
    id: '3',
    name: 'Medina Hammam',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop',
    rating: 4.9,
    category: 'Wellness',
    location: 'Medina, Tunis',
    savedDate: '2 weeks ago',
  },
  {
    id: '4',
    name: 'Carthage Ruins Tour',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0d6de8b9a?w=400&h=300&fit=crop',
    rating: 4.7,
    category: 'Tourism',
    location: 'Carthage, Tunis',
    savedDate: '1 month ago',
  },
  {
    id: '5',
    name: 'Bardo Museum Shop',
    image: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=400&h=300&fit=crop',
    rating: 4.4,
    category: 'Shopping',
    location: 'Bardo, Tunis',
    savedDate: '1 month ago',
  },
  {
    id: '6',
    name: 'Hammamet Beach Resort',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    rating: 4.5,
    category: 'Hotel',
    location: 'Hammamet',
    savedDate: '2 months ago',
  },
];

const mockActivity = [
  { id: '1', type: 'review' as const, text: 'You wrote a review for', businessName: 'Le Baroque Restaurant', timestamp: 'Today at 2:34 PM' },
  { id: '2', type: 'saved' as const, text: 'You saved', businessName: 'Sidi Bou Said Café', timestamp: 'Yesterday at 10:15 AM' },
  { id: '3', type: 'visited' as const, text: 'You visited the page of', businessName: 'Atlas Gym', timestamp: '2 days ago at 6:00 PM' },
  { id: '4', type: 'review' as const, text: 'You wrote a review for', businessName: 'Café Tunis Central', timestamp: '1 week ago' },
  { id: '5', type: 'saved' as const, text: 'You saved', businessName: 'La Marsa Seafood', timestamp: '1 week ago' },
  { id: '6', type: 'joined' as const, text: 'You joined the platform — welcome to Ro2ya!', timestamp: 'January 2024' },
];

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const [form, setForm] = useState({ name: mockUser.name, email: mockUser.email, city: mockUser.city });

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'City', key: 'city', type: 'text', placeholder: 'Your city' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} className={key === 'city' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder-gray-400"
              />
            </div>
          ))}
        </div>
        <button className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Change Password</h3>
        <p className="text-sm text-gray-500 mb-5">Make sure it's at least 8 characters.</p>
        <div className="space-y-3 max-w-sm">
          {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>
          ))}
        </div>
        <button className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors">
          <Lock className="w-4 h-4" />
          Update Password
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500" />
          Notification Preferences
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Email notifications for reviews', desc: 'Get notified when someone finds your review helpful' },
            { label: 'New business recommendations', desc: 'Weekly digest of places you might like' },
            { label: 'Platform updates', desc: 'News and feature announcements' },
          ].map(({ label, desc }, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
        <h3 className="text-base font-semibold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all your data.</p>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors border border-red-200">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>('reviews');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Header */}
        <ProfileHeader
          name={mockUser.name}
          email={mockUser.email}
          city={mockUser.city}
          memberSince={mockUser.memberSince}
          isVerified={mockUser.isVerified}
        />

        {/* Stats */}
        <ProfileStats
          reviewsCount={mockReviews.length}
          savedCount={mockSavedPlaces.length}
          citiesCount={3}
          helpfulVotes={16}
        />

        {/* Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{ reviews: mockReviews.length, saved: mockSavedPlaces.length, activity: mockActivity.length }}
        />

        {/* Tab Content */}
        <div>
          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {mockReviews.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                  <p className="text-gray-400 text-sm">No reviews yet. Start exploring!</p>
                </div>
              ) : (
                mockReviews.map(review => <ReviewCard key={review.id} {...review} />)
              )}
            </div>
          )}

          {/* Saved Places */}
          {activeTab === 'saved' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSavedPlaces.map(place => <SavedPlaceCard key={place.id} {...place} />)}
            </div>
          )}

          {/* Activity */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div>
                {mockActivity.map((item, i) => (
                  <ActivityItem
                    key={item.id}
                    type={item.type}
                    text={item.text}
                    businessName={item.businessName}
                    timestamp={item.timestamp}
                    isLast={i === mockActivity.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}