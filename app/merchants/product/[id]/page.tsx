import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProductById, getProductReviews, getRelatedProducts } from '@/lib/actions/product_detail';
import { getBusinessStories } from '@/lib/actions/stories';
import { BusinessStories } from '@/components/BusinessStories';
import ProductOrderCard from '@/components/ProductOrderCard';
import {
  Star, MapPin, Phone, CheckCircle, Package,
  Globe, BadgeCheck, ChevronRight, ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

// ── Helpers ───────────────────────────────────────────────────────────────────
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
      ))}
    </div>
  );
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const categoryColors: Record<string, string> = {
  RESTAURANT: 'bg-orange-100 text-orange-700',
  RETAIL:     'bg-blue-100 text-blue-700',
  BEAUTY:     'bg-pink-100 text-pink-700',
  REPAIR:     'bg-cyan-100 text-cyan-700',
  HEALTH:     'bg-green-100 text-green-700',
  EDUCATION:  'bg-violet-100 text-violet-700',
  OTHER:      'bg-stone-100 text-stone-600',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  AVAILABLE:    { label: 'En stock',         color: 'bg-green-100 text-green-700' },
  OUT_OF_STOCK: { label: 'Rupture de stock', color: 'bg-red-100 text-red-700' },
  ON_DEMAND:    { label: 'Sur commande',     color: 'bg-orange-100 text-orange-700' },
};

// ─────────────────────────────────────────────────────────────────────────────

export default async function ProductProfilePage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [product, reviews] = await Promise.all([
    getProductById(id),
    getProductReviews(id),
  ]);

  if (!product) notFound();

  const stories = await getBusinessStories(product.store.id);

  const related    = await getRelatedProducts(product.store.id, id);
  const images     = [product.main_image, product.image_2, product.image_3].filter(Boolean) as string[];
  const heroImage  = images[0] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=500&fit=crop';
  const catColor   = categoryColors[product.store.category] ?? categoryColors.OTHER;
  const isVerified = !!product.store.kyc_verified_at;
  const statusInfo = statusConfig[product.status] ?? statusConfig.AVAILABLE;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating_average;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-72 md:h-96 bg-stone-200 overflow-hidden mt-16">
        <img src={heroImage} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <Link
          href="/search"
          className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium hover:bg-black/60 transition-all"
        >
          ← Retour
        </Link>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${catColor}`}>
              {product.store.category}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{product.name}</h1>
          <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {product.store.name} — {product.store.city}
          </p>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left ──────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Quick stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Stars rating={avgRating} />
                <span className="font-bold text-stone-900">{avgRating.toFixed(1)}</span>
                <span className="text-stone-400 text-sm">({product.total_reviews} avis)</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-stone-600">
                <ShoppingBag className="w-4 h-4 text-stone-400" />
                {product.order_count} commandes
              </div>
              {product.status === 'AVAILABLE' && product.stock_quantity > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {product.stock_quantity} en stock
                </div>
              )}
              {isVerified && (
                <div className="flex items-center gap-1.5 text-sm text-blue-600">
                  <BadgeCheck className="w-4 h-4" /> Boutique vérifiée
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                <h2 className="font-bold text-stone-900 mb-3">Description</h2>
                <p className="text-stone-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Gallery */}
            {images.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                <h2 className="font-bold text-stone-900 mb-3">Photos</h2>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt={`${product.name} ${i + 1}`} className="w-full h-28 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity" />
                  ))}
                </div>
              </div>
            )}

            {/* Stories Section */}
            <BusinessStories 
              businessName={product.store.name} 
              storeId={product.store.id} 
              initialStories={stories} 
            />

            {/* Store card */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
              <h2 className="font-bold text-stone-900 mb-4">À propos de {product.store.name}</h2>

              <div className="flex items-center gap-3 mb-4">
                {product.store.logo_url ? (
                  <img src={product.store.logo_url} alt={product.store.name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">{getInitials(product.store.name)}</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-stone-900">{product.store.name}</p>
                    {isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars rating={product.store.rating_average} />
                    <span className="text-xs text-stone-400">{product.store.total_reviews} avis</span>
                  </div>
                </div>
                <Link
                  href={`/merchants/business/${product.store.slug}`}
                  className="ml-auto text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 whitespace-nowrap"
                >
                  Voir boutique <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {product.store.description && (
                <p className="text-sm text-stone-500 mb-4 leading-relaxed">{product.store.description}</p>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <a href={`tel:${product.store.phone}`} className="hover:text-red-600 transition-colors font-medium">
                    {product.store.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  {product.store.address}, {product.store.city}
                </div>
                {product.store.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <a href={product.store.website} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline truncate">
                      {product.store.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
              <h2 className="font-bold text-stone-900 mb-4">
                Avis clients
                {reviews.length > 0 && <span className="ml-2 text-sm font-normal text-stone-400">({reviews.length})</span>}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-6">Aucun avis pour ce produit.</p>
              ) : (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-8 mb-5 pb-5 border-b border-stone-100">
                    <div className="text-center">
                      <div className="text-4xl font-black text-stone-900">{avgRating.toFixed(1)}</div>
                      <Stars rating={avgRating} size="md" />
                      <p className="text-xs text-stone-400 mt-1">{reviews.length} avis</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const pct   = (count / reviews.length) * 100;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs text-stone-500">
                            <span className="w-3 text-right">{star}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-1.5 bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-4 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* List */}
                  <div className="space-y-4">
                    {reviews.map(rev => (
                      <div key={rev.id} className="border-b border-stone-50 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            {rev.author?.avatar_url ? (
                              <img src={rev.author.avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-black">{getInitials(rev.author?.full_name)}</span>
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-bold text-stone-900">{rev.author?.full_name ?? 'Client'}</p>
                                {rev.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                              </div>
                              <p className="text-xs text-stone-400">{formatDate(rev.created_at)}</p>
                            </div>
                          </div>
                          <Stars rating={rev.rating} />
                        </div>

                        {rev.title && <p className="text-sm font-semibold text-stone-800 mb-1">{rev.title}</p>}
                        <p className="text-sm text-stone-600 leading-relaxed">{rev.comment}</p>

                        {rev.vendor_response && (
                          <div className="mt-3 ml-4 pl-3 border-l-2 border-red-200 bg-red-50 rounded-r-xl p-3">
                            <p className="text-xs font-bold text-red-600 mb-1">
                              Réponse de {product.store.name}
                              {rev.responded_at && <span className="font-normal text-stone-400 ml-1">· {formatDate(rev.responded_at)}</span>}
                            </p>
                            <p className="text-xs text-stone-600">{rev.vendor_response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Related products */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-stone-900">Autres produits de cette boutique</h2>
                  <Link href={`/merchants/business/${product.store.slug}`} className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                    Voir tout <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map(p => (
                    <Link key={p.id} href={`/merchants/product/${p.id}`} className="flex gap-3 p-3 rounded-xl border border-stone-100 hover:border-stone-300 hover:bg-stone-50 transition-all">
                      {p.main_image ? (
                        <img src={p.main_image} alt={p.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-stone-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-stone-900 truncate">{p.name}</p>
                        {p.stock_quantity !== undefined && p.stock_quantity > 0 && (
                          <p className="text-xs text-green-600 mt-0.5">{p.stock_quantity} en stock</p>
                        )}
                        <p className="text-sm font-bold text-red-600 mt-1">
                          {Number(p.price) === 0 ? 'Gratuit' : `${p.price} TND`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: order card (client component) ──────────────────────── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <ProductOrderCard
              productId={product.id}
              productName={product.name}
              price={Number(product.price)}
              priceUnit={product.price_unit}
              stockQuantity={product.stock_quantity}
              status={product.status}
              storePhone={product.store.phone}
              storeSlug={product.store.slug}
              isVerified={isVerified}
            />
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}