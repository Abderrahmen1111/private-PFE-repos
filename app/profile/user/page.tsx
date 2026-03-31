'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileStats from '@/components/profile/profile-stats';
import ProfileTabs, { type TabId } from '@/components/profile/profile-tabs';
import ReviewCard from '@/components/profile/review-card';
import OrderCard from '@/components/profile/order-card';
import EmptyState from '@/components/profile/empty-state';
import ActivityItem from '@/components/profile/activity-item';
import { Save, Lock, Bell, Trash2, Loader2, ShoppingBag, Star, Heart, Activity as ActivityIcon } from 'lucide-react';
import { getUserProfileData } from '@/lib/actions/profile';
import { updateProfile, deleteAccount } from '@/lib/actions/users';
import { toast } from 'sonner';

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ user, onUpdate }: { user: any, onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.profile?.full_name || '', 
    email: user?.email || '', 
    city: user?.profile?.city || '' 
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(user.id, {
        full_name: form.name,
        city: form.city
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
        <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'your@email.com', disabled: true },
            { label: 'City', key: 'city', type: 'text', placeholder: 'Your city' },
          ].map(({ label, key, type, placeholder, disabled }) => (
            <div key={key} className={key === 'city' ? 'sm:col-span-2' : ''}>
              <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3 ml-1">{label}</label>
              <input
                type={type}
                disabled={disabled}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          ))}
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="mt-10 flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-indigo-200 outline-none hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
          <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Security</h3>
          <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-wider leading-relaxed">Manage your authentication settings</p>
          <button className="flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-gray-900/10 hover:-translate-y-0.5 active:translate-y-0">
            <Lock className="w-4 h-4" />
            Request Password Reset
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-rose-100 p-8 sm:p-10">
          <h3 className="text-xl font-black text-rose-600 mb-2 tracking-tight uppercase tracking-tighter">Danger Area</h3>
          <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-wider leading-relaxed">Permanently delete your account</p>
          <button 
            onClick={async () => {
              if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
                const { error } = await deleteAccount(user.id);
                if (error) toast.error(error);
                else window.location.href = '/';
              }
            }}
            className="flex items-center gap-3 px-8 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-2xl transition-all border border-rose-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('orders');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await getUserProfileData();
      setData(res);
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Session expired or error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Loading Profile</span>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { user, stats, reviews, activity, orders } = data;

  return (
    <div className="min-h-screen bg-gray-50/30 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-10 py-10 space-y-8">

        {/* Header */}
        <ProfileHeader
          name={user.profile?.full_name || 'Anonymous User'}
          email={user.email}
          city={user.profile?.city || 'Not specified'}
          memberSince={user.profile?.created_at ? new Date(user.profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
          isVerified={true}
          avatarUrl={user.profile?.avatar_url}
        />

        {/* Stats */}
        <ProfileStats
          reviewsCount={stats.reviewsCount}
          savedCount={stats.savedCount}
          citiesCount={stats.citiesCount}
          helpfulVotes={stats.helpfulVotes}
        />

        {/* Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{ 
            reviews: reviews.length, 
            saved: stats.savedCount, 
            activity: activity.length,
            orders: orders.length 
          }}
        />

        {/* Tab Content with Animation */}
        <main className="pb-16 min-h-[400px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Orders */}
              {activeTab === 'orders' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orders.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyState 
                        icon={ShoppingBag}
                        title="No Orders Yet"
                        description="Start exploring local businesses and place your first order today!"
                        actionLabel="Discover Local Stores"
                        onAction={() => router.push('/')}
                      />
                    </div>
                  ) : (
                    orders.map((order: any) => <OrderCard key={order.id} {...order} />)
                  )}
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {reviews.length === 0 ? (
                    <EmptyState 
                      icon={Star}
                      title="No Reviews Written"
                      description="Share your experience with the community by writing your first review!"
                      actionLabel="Explore Places to Review"
                      onAction={() => router.push('/')}
                    />
                  ) : (
                    reviews.map((review: any) => <ReviewCard key={review.id} {...review} />)
                  )}
                </div>
              )}

              {/* Saved Places */}
              {activeTab === 'saved' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.savedCount === 0 ? (
                    <div className="col-span-full">
                      <EmptyState 
                        icon={Heart}
                        title="Your Favorites are Empty"
                        description="Save places you love to find them easily later and build your personal collection!"
                        actionLabel="Browse Popular Places"
                        onAction={() => router.push('/')}
                      />
                    </div>
                  ) : (
                    // Logic for saved places will go here
                    null
                  )}
                </div>
              )}

              {/* Activity */}
              {activeTab === 'activity' && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
                    <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Recent Activity Feed</h3>
                    <div className="space-y-0.5">
                      {activity.length === 0 ? (
                        <div className="py-12 flex flex-col items-center">
                          <ActivityIcon className="w-12 h-12 text-gray-100 mb-4" />
                          <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">No activity recorded yet</p>
                        </div>
                      ) : (
                        activity.map((item: any, i: number) => (
                          <ActivityItem
                            key={item.id}
                            type={item.type}
                            text={item.text}
                            businessName={item.businessName}
                            timestamp={item.timestamp}
                            isLast={i === activity.length - 1}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              {activeTab === 'settings' && <SettingsTab user={user} onUpdate={fetchData} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}