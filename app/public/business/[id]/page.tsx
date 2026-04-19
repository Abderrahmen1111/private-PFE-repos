'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Globe, Mail, Clock, Shield, Share2,
  ExternalLink, Tag, Loader2, Package, Star, Image as ImageIcon,
  Store, Copy, Twitter, Facebook, Linkedin, MessageCircle,
  Calendar, Eye, Wrench, ChevronRight, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getPublicBusinessProfile } from '@/lib/actions/public-profile';
import PublicStarRating from '@/components/profile/PublicStarRating';
import PublicReviewCard from '@/components/profile/PublicReviewCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Category badge colours ───────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  RESTAURANT: 'bg-red-50 text-red-600 border-red-200',
  PHARMACY:   'bg-emerald-50 text-emerald-600 border-emerald-200',
  BOUTIQUE:   'bg-purple-50 text-purple-600 border-purple-200',
  SERVICE:    'bg-blue-50 text-blue-600 border-blue-200',
  OTHER:      'bg-gray-100 text-gray-600 border-gray-200',
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'about' | 'products' | 'reviews' | 'gallery';
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'about',    label: 'À Propos',           icon: Store      },
  { id: 'products', label: 'Produits & Services', icon: Package    },
  { id: 'reviews',  label: 'Avis',                icon: Star       },
  { id: 'gallery',  label: 'Galerie',             icon: ImageIcon  },
];

// ─── Tiny ProCard wrapper ─────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SH({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
      <span className="w-7 h-7 rounded-xl bg-orange-50 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-orange-500" />
      </span>
      {children}
    </h3>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function PublicBusinessProfilePage() {
  const params   = useParams();
  const router   = useRouter();
  const storeId  = Number(params.id);

  const [data,       setData]       = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState<Tab>('about');
  const [shareOpen,  setShareOpen]  = useState(false);

  useEffect(() => {
    if (!storeId) return;
    getPublicBusinessProfile(storeId).then(res => {
      setData(res);
    }).catch(console.error).finally(() => setLoading(false));
  }, [storeId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Chargement…</p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center">
          <Store className="w-9 h-9 text-orange-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Commerce introuvable</h2>
        <p className="text-sm text-gray-500 max-w-xs">Ce commerce n'existe pas ou n'est plus disponible.</p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>
      </div>
      <Footer />
    </div>
  );

  const { store, owner, items, reviews, stats, gallery, openingHours } = data;
  const catClass    = CAT_COLORS[store.category] ?? CAT_COLORS.OTHER;
  const profileUrl  = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform: string) => {
    const text = `Découvrez ${store.name} sur Ro2ya !`;
    if (platform === 'copy') {
      navigator.clipboard.writeText(profileUrl);
      toast.success('Lien copié !');
    } else {
      const urls: Record<string, string> = {
        twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      };
      window.open(urls[platform], '_blank');
    }
    setShareOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">

        {/* ══════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm"
        >
          {/* Cover */}
          <div className="relative h-40 sm:h-56 overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#fff7ed 0%,#ffedd5 45%,#fed7aa 100%)' }}
          >
            {store.banner_url && (
              <img src={store.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            {/* mesh overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 20% 60%,rgba(249,115,22,.18) 0%,transparent 50%),
                                radial-gradient(circle at 82% 25%,rgba(251,191,36,.12) 0%,transparent 50%)`,
            }} />
            {/* dot grid */}
            <div className="absolute inset-0 opacity-[0.035]"
              style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize:'36px 36px' }}
            />
          </div>

          {/* Store identity */}
          <div className="px-5 sm:px-8 pb-7">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-14 sm:-mt-16">

              {/* Logo + name */}
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden flex items-center justify-center bg-white flex-shrink-0">
                  {store.logo_url
                    ? <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    : <span className="text-3xl font-black text-orange-500">{store.name.substring(0,2).toUpperCase()}</span>
                  }
                </div>
                <div className="mb-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{store.name}</h1>
                    {store.verified_at && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-700 uppercase tracking-widest">
                        <Shield className="w-3 h-3" /> Vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${catClass}`}>
                      <Tag className="w-3 h-3" /> {store.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPin className="w-3 h-3" /> {store.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PublicStarRating rating={stats.avgRating} size="sm" showValue />
                    <span className="text-xs text-gray-400">({stats.reviewsCount} avis)</span>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2 flex-wrap">
                {store.phone && (
                  <a href={`tel:${store.phone}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Phone className="w-3.5 h-3.5" /> Appeler
                  </a>
                )}
                {store.website && (
                  <a
                    href={store.website.startsWith('http') ? store.website : `https://${store.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-gray-900 hover:bg-black text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Globe className="w-3.5 h-3.5" /> Site Web
                  </a>
                )}
                {store.latitude && store.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Itinéraire
                  </a>
                )}
                {/* Share */}
                <div className="relative">
                  <button
                    onClick={() => setShareOpen(v => !v)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Partager
                  </button>
                  <AnimatePresence>
                    {shareOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 min-w-[180px]"
                      >
                        {[
                          { id:'twitter',  Icon: Twitter,  label:'Twitter'     },
                          { id:'facebook', Icon: Facebook, label:'Facebook'    },
                          { id:'linkedin', Icon: Linkedin, label:'LinkedIn'    },
                          { id:'copy',     Icon: Copy,     label:'Copier le lien' },
                        ].map(s => (
                          <button
                            key={s.id}
                            onClick={() => handleShare(s.id)}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-gray-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <s.Icon className="w-3.5 h-3.5" />{s.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            TABS
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none bg-white rounded-2xl p-1 border border-gray-200 shadow-sm">
          {TABS.map(tab => {
            const count =
              tab.id === 'products' ? items.length
            : tab.id === 'reviews'  ? reviews.length
            : tab.id === 'gallery'  ? gallery.length
            : null;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-xl transition-all duration-200
                  ${active ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {count !== null && count > 0 && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB CONTENT
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >

            {/* ─── ABOUT ────────────────────────────────────────────────── */}
            {activeTab === 'about' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  {/* Description */}
                  <Card>
                    <SH icon={Store}>À Propos</SH>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {store.description || 'Aucune description disponible pour ce commerce.'}
                    </p>
                  </Card>

                  {/* Contact */}
                  <Card>
                    <SH icon={Phone}>Contact & Informations</SH>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {([
                        { icon: MapPin, label: 'Adresse',   value: store.address || store.city,     href: undefined },
                        { icon: Phone,  label: 'Téléphone', value: store.phone,                     href: store.phone   ? `tel:${store.phone}`           : undefined },
                        { icon: Mail,   label: 'Email',     value: store.email,                     href: store.email   ? `mailto:${store.email}`         : undefined },
                        { icon: Globe,  label: 'Site Web',  value: store.website,                   href: store.website ? (store.website.startsWith('http') ? store.website : `https://${store.website}`) : undefined },
                      ] as const).filter(c => c.value).map(({ icon: Icon, label, value, href }) => (
                        <div key={label} className="flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                            <Icon className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                            {href ? (
                              <a href={href} target={label==='Site Web'?'_blank':undefined} rel="noopener noreferrer"
                                className="text-xs font-medium text-gray-900 hover:text-orange-600 transition-colors break-all"
                              >{value}</a>
                            ) : (
                              <p className="text-xs font-medium text-gray-900">{value}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Owner */}
                  {owner && (
                    <Card>
                      <SH icon={Shield}>Propriétaire</SH>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center flex-shrink-0">
                          {owner.avatar_url
                            ? <img src={owner.avatar_url} alt={owner.name||''} className="w-full h-full object-cover" />
                            : <span className="text-lg font-black text-orange-600">{(owner.name||'P').substring(0,2).toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{owner.name || 'Propriétaire'}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{owner.city||'Tunisie'}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Membre depuis {new Date(owner.memberSince).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* -- Sidebar -- */}
                <div className="space-y-5">
                  {/* Opening hours */}
                  {openingHours.length > 0 && (
                    <Card>
                      <SH icon={Clock}>Horaires d'ouverture</SH>
                      <div className="space-y-2.5">
                        {openingHours.map((h: any) => (
                          <div key={h.day} className="flex justify-between text-xs">
                            <span className="font-semibold text-gray-700 capitalize">{h.day}</span>
                            <span className={h.hours==='Fermé'?'text-red-500 font-medium':'text-gray-500'}>{h.hours}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Quick stats */}
                  <Card>
                    <SH icon={Eye}>En chiffres</SH>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label:'Avis',       value: stats.reviewsCount,                              Icon: Star,    color:'text-amber-500'  },
                        { label:'Note moy.',  value: (stats.avgRating||0).toFixed(1),                 Icon: Star,    color:'text-orange-500' },
                        { label:'Produits',   value: items.filter((i:any)=>i.item_type==='PRODUCT').length, Icon: Package, color:'text-blue-500'   },
                        { label:'Services',   value: items.filter((i:any)=>i.item_type==='SERVICE').length, Icon: Wrench, color:'text-emerald-500'},
                      ].map(s=>(
                        <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <s.Icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`}/>
                          <p className="text-lg font-black text-gray-900">{s.value}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Location */}
                  <Card>
                    <SH icon={MapPin}>Localisation</SH>
                    <p className="text-xs text-gray-600 mb-3">{store.address||store.city}</p>
                    {store.latitude && store.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5"/> Voir sur Google Maps
                      </a>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* ─── PRODUCTS & SERVICES ─────────────────────────────────── */}
            {activeTab === 'products' && (
              items.length === 0 ? (
                <Card className="py-16 text-center">
                  <Package className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
                  <p className="text-sm font-bold text-gray-500">Aucun produit ou service disponible</p>
                  <p className="text-xs text-gray-400 mt-1">Ce commerce n'a pas encore publié de catalogue.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item: any, idx: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300"
                    >
                      {/* image */}
                      <div className="relative h-44 bg-gray-100 overflow-hidden">
                        {item.main_image
                          ? <img src={item.main_image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                          : <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-gray-300"/></div>
                        }
                        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2 py-1 rounded-lg border backdrop-blur-sm
                          ${item.item_type==='PRODUCT'
                            ? 'bg-blue-50/90 text-blue-600 border-blue-200'
                            : 'bg-emerald-50/90 text-emerald-600 border-emerald-200'}`}>
                          {item.item_type==='PRODUCT'?'Produit':'Service'}
                        </span>
                        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                          <span className="text-sm font-black text-gray-900">{Number(item.price).toFixed(2)}</span>
                          <span className="text-[10px] text-gray-500 ml-0.5">{item.price_unit}</span>
                        </div>
                      </div>
                      {/* info */}
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{item.name}</h3>
                        {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
                        <div className="flex items-center justify-between mt-3">
                          {item.rating_average
                            ? <PublicStarRating rating={item.rating_average} size="sm" showValue/>
                            : <span className="text-[10px] text-gray-400">Pas encore noté</span>
                          }
                          {item.is_bookable && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3"/> Réservable
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {/* ─── REVIEWS ──────────────────────────────────────────────── */}
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* summary */}
                <Card>
                  <SH icon={Star}>Résumé des notes</SH>
                  <div className="text-center mb-5">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter">{stats.avgRating||'—'}</span>
                    <span className="text-xl text-gray-400"> / 5</span>
                    <div className="flex justify-center mt-2">
                      <PublicStarRating rating={stats.avgRating||0} size="md"/>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{stats.reviewsCount} avis au total</p>
                  </div>
                  <div className="space-y-2.5">
                    {stats.ratingDistribution.map((d: any)=>(
                      <div key={d.stars} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 w-6">{d.stars}★</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width:`${d.percentage}%`,
                              background: d.stars>=4?'#22C55E':d.stars===3?'#F59E0B':'#EF4444',
                            }}/>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 w-7 text-right">{d.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* list */}
                <div className="lg:col-span-2 space-y-3">
                  {reviews.length===0 ? (
                    <Card className="py-14 text-center">
                      <MessageCircle className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
                      <p className="text-sm font-bold text-gray-500">Aucun avis pour le moment</p>
                      <p className="text-xs text-gray-400 mt-1">Soyez le premier à noter ce commerce !</p>
                    </Card>
                  ) : (
                    reviews.map((r: any, i: number)=>(
                      <PublicReviewCard key={r.id} {...r} variant="business" index={i}/>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ─── GALLERY ──────────────────────────────────────────────── */}
            {activeTab === 'gallery' && (
              gallery.length===0 ? (
                <Card className="py-16 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
                  <p className="text-sm font-bold text-gray-500">Aucune photo disponible</p>
                  <p className="text-xs text-gray-400 mt-1">Ce commerce n'a pas encore ajouté de photos.</p>
                </Card>
              ) : (
                <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                  {gallery.map((url: string, idx: number)=>(
                    <motion.div
                      key={idx}
                      initial={{ opacity:0, scale:0.96 }}
                      animate={{ opacity:1, scale:1 }}
                      transition={{ duration:0.3, delay:idx*0.04 }}
                      className="break-inside-avoid rounded-2xl overflow-hidden border border-gray-200 group cursor-zoom-in"
                    >
                      <img
                        src={url}
                        alt={`${store.name} photo ${idx+1}`}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={e=>{(e.target as any).parentElement.style.display='none';}}
                      />
                    </motion.div>
                  ))}
                </div>
              )
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
