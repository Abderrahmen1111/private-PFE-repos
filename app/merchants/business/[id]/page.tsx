import { getBusinessById } from '@/lib/actions/business';
import { Business } from '@/types/business';
import { getReviewsByStoreId } from '@/lib/actions/reviews';
import { getPublicItemsByStoreId } from '@/lib/actions/items';
import { getBusinessStories } from '@/lib/actions/stories';
import { getPromotions } from '@/lib/actions/promotions';
import { recordStoreView } from '@/lib/actions/reels';
import { hasCompletedTransactionWithStore } from '@/lib/actions/transactions';
import { createClient } from '@/lib/supabase/server';
import { Star, MapPin, Phone, Globe, Clock, Bookmark, Camera, Package, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessImageGallery from '@/components/BusinessImageGallery';
import { BusinessStories } from '@/components/BusinessStories';
import { BusinessItemsList } from '@/components/BusinessItemsList';
import PromotionBanner from '@/components/PromotionBanner';
import { notFound } from 'next/navigation';
import { WriteReviewButton } from '@/components/WriteReviewButton';
import { ShareBusinessButton } from '@/components/ShareBusinessButton';
import { Item } from '@/lib/actions/items';
import { BusinessReservationSidebar } from '@/components/BusinessReservationSidebar';
import FavoriteButton from '@/components/FavoriteButton';
import StoreAnalyticsTracker from '@/components/StoreAnalyticsTracker';
import BusinessGallerySection from '@/components/BusinessGallerySection';

interface Promotion {
  id: number;
  store_id: number;
  title: string;
  description: string | null;
  discount_percent: number | null;
  discount_text: string | null;
  valid_from: string;
  valid_until: string;
  apply_to_all: boolean;
  active: boolean;
  created_at: string;
  promotion_items?: { item_id: number }[];
  item_ids?: number[];
}

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  const businessId = params.id;
  const business = await getBusinessById(businessId);
 
  if (!business) {
    return notFound();
  }

  const supabase = createClient();
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;
  
  // Explicit indexing on any to definitively bypass TS inference issues during build
  const isOwner = !!user && user.id === (business as any)['owner_id'];

  const storeId = business.store_id;
  if (storeId) {
    // Record visit for personalized recommendations (don't await to avoid blocking render)
    recordStoreView(storeId).catch(console.error);
  }

  const items = storeId ? await getPublicItemsByStoreId(storeId) : [];
  const reviews = storeId ? await getReviewsByStoreId(storeId) : [];
  const stories = storeId ? await getBusinessStories(storeId) : [];
  const allPromotions = storeId ? await getPromotions(storeId) : [] as Promotion[];

  // Determine if the user is allowed to add a story to this store (owner or finished transaction)
  const canAddStory = storeId ? (isOwner || await hasCompletedTransactionWithStore(storeId)) : false;

  // Only active and current promotions
  const activePromos = allPromotions.filter((p: Promotion) => {
    const now = new Date();
    return p.active && new Date(p.valid_from) <= now && new Date(p.valid_until) >= now;
  });

  const hasProducts = items.some((i: Item) => i.item_type === 'PRODUCT');

  const isVerified = business.id_business !== null || business.status === 'PUBLISHED';

  // Merge directory photos and store gallery
  const allMedia = [
    ...(business.photos || []),
    ...(business.gallery || [])
  ];

  // Pick a default hero image based on whether this is a service provider
  const defaultHero = business.category?.toLowerCase().includes('plomb')
    ? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
    : business.category?.toLowerCase().includes('electr')
    ? 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop'
    : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop';

  const images = allMedia.length > 0
    ? allMedia
    : [defaultHero];

  return (
    <div className="min-h-screen bg-gray-50">
      {storeId && <StoreAnalyticsTracker storeId={storeId} />}
      <Navbar />
      <PromotionBanner promotions={activePromos} />
      {/* Hero Section with Photos + Overlay Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          {/* Photo Strip */}
          <div className="relative">
            <BusinessImageGallery images={images} businessName={business.name} />

            {/* Business Header Overlay */}
            <div className="absolute inset-0 flex items-end pointer-events-none bg-gradient-to-t from-black/60 to-transparent">
              <div className="p-6 text-white w-full">
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0 overflow-hidden border-2 border-white/20">
                    {business.image ? (
                      <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                      business.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {business.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded flex items-center justify-center ${i <= Math.round(business.rating) ? 'bg-red-500' : 'bg-gray-400'
                              }`}
                          >
                            <Star className="w-3 h-3 fill-white text-white" />
                          </div>
                        ))}
                      </div>

                      <span className="text-sm font-medium">
                        {business.rating} ({business.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-2 text-sm mt-2 opacity-90">
                      {business.category && (
                        <>
                          <span className="font-semibold">{business.category}</span>
                          {business.priceRange && <span>•</span>}
                        </>
                      )}
                      {business.priceRange && <span>{business.priceRange}</span>}
                    </div>

                    {/* Real-time Status */}
                    {business.workingHours ? (() => {
                      const now = new Date();
                      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                      const todayHours = (business.workingHours as Record<string, any>)[dayName];

                      if (!todayHours || todayHours.closed) {
                        return <div className="text-sm mt-2 text-red-400 font-bold">Fermé aujourd'hui</div>;
                      }

                      const currentTime = now.getHours() * 60 + now.getMinutes();
                      const [openH, openM] = todayHours.open.split(':').map(Number);
                      const [closeH, closeM] = todayHours.close.split(':').map(Number);
                      const openTime = openH * 60 + openM;
                      const closeTime = closeH * 60 + closeM;

                      const isOpen = currentTime >= openTime && currentTime < closeTime;

                      return (
                        <div className="text-sm mt-2 flex items-center gap-2">
                          {isOpen ? (
                            <span className="text-green-400 font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              Ouvert maintenant
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold">Fermé actuellement</span>
                          )}
                          <span className="text-white/60">•</span>
                          <span className="text-white/80">{todayHours.open} - {todayHours.close}</span>
                        </div>
                      );
                    })() : (
                      <div className="text-sm mt-2">
                        <span className="text-green-400 font-bold">Ouvert</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-wrap gap-3 p-4 border-t">
            <WriteReviewButton businessName={business.name} storeId={business.store_id || null} businessId={businessId} isOwner={isOwner} />

            <button className="bg-white border-2 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-semibold transition-all active:scale-95">
              <Camera className="w-4 h-4" />
              Ajouter une photo
            </button>

            <ShareBusinessButton
              businessName={business.name}
              businessUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/business/${businessId}`}
            />

            {business.store_id && (
              <FavoriteButton storeId={business.store_id} />
            )}
          </div>
        </div>
      </div>

      {/* ── CUSTOMER STORIES ── */}
      {business.store_id && (
        <BusinessStories 
          businessName={business.name} 
          storeId={business.store_id} 
          initialStories={stories} 
          canAddStory={canAddStory} 
          isOwner={isOwner} 
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                À propos
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {business.description || "Aucune description détaillée n'est disponible pour cet établissement pour le moment."}
              </div>
            </div>

            {/* Products/Services Section - Only show if business is linked to a store */}
            {business.store_id && (
              <div id="items-section" className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-6 h-6 text-red-500" />
                    Produits et Services
                  </h2>
                  <span className="text-sm font-medium text-gray-500">{items.length} publiés</span>
                </div>

                <BusinessItemsList 
                  items={items} 
                  businessName={business.name} 
                  businessId={businessId}
                  activePromos={activePromos}
                  isLinkedToStore={!!business.store_id}
                  isOwner={isOwner}
                />
              </div>
            )}

            {/* Gallery Section */}
            <BusinessGallerySection images={allMedia} businessName={business.name} />

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Avis sur {business.name}
                </h2>
                <WriteReviewButton businessName={business.name} storeId={business.store_id || null} businessId={businessId} isOwner={isOwner} />
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4 mb-3">
                        {review.author?.avatar_url ? (
                          <img src={review.author.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                            {(review.author?.full_name || 'A')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{review.author?.full_name || 'Utilisateur Anonyme'}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(review.created_at))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>

                      {/* Vendor Response */}
                      {review.vendor_response && (
                        <div className="mt-4 ml-4 pl-4 border-l-2 border-red-200 bg-red-50/60 rounded-r-lg py-3 pr-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold">{(business.name || 'E')[0].toUpperCase()}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{business.name}</p>
                            {review.responded_at && (
                              <span className="text-xs text-gray-400 ml-auto">
                                {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(review.responded_at))}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{review.vendor_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium mb-4">Soyez le premier à donner votre avis sur cet établissement !</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* @ts-ignore - isOwner prop exists but TS inference might be stuck */}
            <BusinessReservationSidebar
              businessId={businessId}
              businessName={business.name}
              rating={business.rating}
              reviewCount={business.reviewCount}
              phone={business.phone}
              website={business.website}
              address={business.location.address}
              workingHours={business.workingHours as Record<string, any> | null}
              isLinkedToStore={!!business.store_id}
              hasProducts={hasProducts}
              items={items}
              isOwner={isOwner}
              ownerId={business.owner_id}
              storeId={business.store_id}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}