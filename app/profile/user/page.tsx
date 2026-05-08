'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileStats from '@/components/profile/profile-stats';
import ProfileTabs, { type TabId } from '@/components/profile/profile-tabs';
import ReviewCard from '@/components/profile/review-card';
import OrderCard from '@/components/profile/order-card';
import EmptyState from '@/components/profile/empty-state';
import ActivityItem from '@/components/profile/activity-item';
import UserReservationsList from '@/components/profile/UserReservationsList';
import { Save, Lock, Trash2, Loader2, ShoppingBag, Star, Heart, Activity as ActivityIcon, CalendarDays, AlertTriangle } from 'lucide-react';
import { getUserProfileData } from '@/lib/actions/profile';
import { updateProfile, updateAvatar, deleteAccount } from '@/lib/actions/users';
import { sendPasswordResetEmail } from '@/lib/actions/auth';
import { toggleSaveAction } from '@/lib/actions/favorites';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ user, onUpdate, router }: { user: any, onUpdate: () => void, router: any }) {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.profile?.full_name || '', 
    email: user?.email || '', 
    city: user?.profile?.city || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(user.id, {
        full_name: form.name,
        city: form.city,
        phone: form.phone,
        bio: form.bio
      });
      if (error) throw error;
      toast.success('Profil mis à jour avec succès');
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.email) return;
    setResetLoading(true);
    try {
      const result = await sendPasswordResetEmail(form.email);
      if ('error' in result) throw new Error(result.error);
      toast.success('E-mail de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi de l\'e-mail');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      setDeleteLoading(true);
      try {
        const { error } = await deleteAccount(user.id);
        if (error) throw new Error(error);
        toast.success('Compte supprimé avec succès');
        router.push('/');
      } catch (err: any) {
        toast.error(err.message || 'Erreur lors de la suppression du compte');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
        <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Informations personnelles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Nom complet', key: 'name', type: 'text', placeholder: 'Votre nom complet' },
            { label: 'Adresse e-mail', key: 'email', type: 'email', placeholder: 'votre@email.com', disabled: true },
            { label: 'Téléphone', key: 'phone', type: 'tel', placeholder: '+216 -- --- ---' },
            { label: 'Ville', key: 'city', type: 'text', placeholder: 'Votre ville' },
          ].map(({ label, key, type, placeholder, disabled }) => (
            <div key={key}>
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
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3 ml-1">Biographie</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Parlez-nous de vous..."
              rows={3}
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder-gray-400 resize-none"
            />
          </div>

        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="mt-10 flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-indigo-200 outline-none hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer les modifications
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
          <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Sécurité</h3>
          <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-wider leading-relaxed">Gérez vos paramètres d'authentification</p>
          <button 
            onClick={handleResetPassword}
            disabled={resetLoading}
            className="flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-gray-900/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Réinitialiser le mot de passe
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-rose-100 p-8 sm:p-10">
          <h3 className="text-xl font-black text-rose-600 mb-2 tracking-tight uppercase tracking-tighter">Zone de danger</h3>
          <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-wider leading-relaxed">Supprimer définitivement votre compte</p>
          <button 
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="flex items-center gap-3 px-8 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-2xl transition-all border border-rose-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Supprimer le compte
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'reservations';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getUserProfileData();
      setData(res);
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Session expirée ou erreur lors du chargement');
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
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Chargement du profil</span>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { user, stats, reviews, activity, orders, bookings, savedPlaces } = data;

  const handleRemoveFavorite = async (storeId: number) => {
    try {
      await toggleSaveAction(storeId);
      toast.success('Retiré de vos favoris');
      fetchData(); // Refresh list to sync counts
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    }
  };

  const handleAvatarUpdate = async (file: File) => {
    if (!user?.id) return;
    setIsUpdatingAvatar(true);
    try {
      const { error } = await updateAvatar(user.id, file);
      if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);
      toast.success('Photo de profil mise à jour');
      fetchData(); // Refresh to show new avatar
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour de l'image");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-10 py-10 space-y-8">
        {/* Rejection Alert */}
        {user.ownedStoreStatus === 'REJECTED' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-rose-500/5"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Demande refusée</h3>
              <p className="text-sm font-bold text-gray-500 mt-1">Désolé, votre demande de création de boutique a été refusée par l'administrateur. Votre compte a été repassé en mode Client.</p>
            </div>
            <button 
              onClick={() => router.push('/support')}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-gray-200"
            >
              Contacter le support
            </button>
          </motion.div>
        )}

        {/* Header */}
        <ProfileHeader
          name={user.profile?.full_name || 'Utilisateur Anonyme'}
          email={user.email}
          city={user.profile?.city || 'Non spécifiée'}
          memberSince={user.profile?.created_at ? new Date(user.profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Inconnu'}
          isVerified={true}
          avatarUrl={user.profile?.avatar_url}
          phone={user.profile?.phone}
          bio={user.profile?.bio}
          onEditProfile={() => setActiveTab('settings')}
          userUrl={typeof window !== 'undefined' ? `${window.location.origin}/profile/user` : ''}
          onAvatarUpdate={handleAvatarUpdate}
          isUpdatingAvatar={isUpdatingAvatar}
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
            orders: orders.length,
            reservations: bookings.length
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
              {/* Reservations */}
              {activeTab === 'reservations' && (
                <UserReservationsList bookings={bookings} />
              )}

              {/* Orders */}
              {activeTab === 'orders' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orders.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyState 
                        icon={ShoppingBag}
                        title="Aucune commande"
                        description="Commencez à explorer les commerces locaux et passez votre première commande !"
                        actionLabel="Découvrir les boutiques"
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
                      title="Aucun avis rédigé"
                      description="Partagez votre expérience avec la communauté en écrivant votre premier avis !"
                      actionLabel="Explorer des lieux à noter"
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
                  {savedPlaces.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyState 
                        icon={Heart}
                        title="Vos favoris sont vides"
                        description="Enregistrez les lieux que vous aimez pour les retrouver facilement plus tard !"
                        actionLabel="Parcourir les lieux populaires"
                        onAction={() => router.push('/')}
                      />
                    </div>
                  ) : (
                    savedPlaces.map((place: any) => (
                      <motion.div
                        key={place.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all p-6 overflow-hidden"
                      >
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                             <img 
                               src={place.businessImage} 
                               alt={place.businessName} 
                               className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                               onError={(e) => { (e.target as any).src = '/placeholder-business.svg' }}
                             />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-gray-900 truncate tracking-tight">{place.businessName}</h4>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{place.businessCategory}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-black text-gray-700">{place.rating}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-gray-50">
                          <button 
                            onClick={() => router.push(`/merchants/business/${place.storeId}`)}
                            className="flex-1 py-3.5 px-4 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-gray-200"
                          >
                            Visiter
                          </button>
                          <button 
                            onClick={() => handleRemoveFavorite(place.storeId)}
                            className="p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl transition-all block border border-rose-100"
                            title="Retirer des favoris"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Top corner date */}
                        <div className="absolute top-6 right-6">
                           <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white/80 px-2 py-1 rounded-full border border-gray-50">
                             Sauvegardé en {place.date}
                           </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Activity */}
              {activeTab === 'activity' && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
                    <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Fil d'activité récent</h3>
                    <div className="space-y-0.5">
                      {activity.length === 0 ? (
                        <div className="py-12 flex flex-col items-center">
                          <ActivityIcon className="w-12 h-12 text-gray-100 mb-4" />
                          <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Aucune activité enregistrée</p>
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
              {activeTab === 'settings' && <SettingsTab user={user} onUpdate={fetchData} router={router} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Chargement du profil</span>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
