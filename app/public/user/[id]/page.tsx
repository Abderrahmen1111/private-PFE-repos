'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Star, Award, Shield, Share2, Loader2,
  MessageSquare, ShoppingBag, BadgeCheck, Users, ArrowLeft,
  Copy, Twitter, Facebook, Linkedin, User,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getPublicUserProfile } from '@/lib/actions/public-profile';
import { getFriendshipStatus, sendFriendRequest, acceptFriendRequest, blockUser, unblockUser } from '@/lib/actions/friendships';
import PublicStarRating from '@/components/profile/PublicStarRating';
import PublicReviewCard from '@/components/profile/PublicReviewCard';
import PublicBadge from '@/components/profile/PublicBadge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Contact Button ────────────────────────────────────────────────────────
function ContactButton({ userId }: { userId: string }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getFriendshipStatus(userId).then(res => {
      setStatus(res);
      setLoading(false);
    });
  }, [userId]);

  const handleAction = async () => {
    setLoading(true);
    if (!status.status) {
      const { error } = await sendFriendRequest(userId);
      if (!error) {
        toast.success("Invitation envoyée !");
        setStatus({ status: 'PENDING', direction: 'SENT' });
      }
    } else if (status.status === 'PENDING' && status.direction === 'RECEIVED') {
      const { error } = await acceptFriendRequest(userId);
      if (!error) {
        toast.success("Invitation acceptée !");
        setStatus({ status: 'ACCEPTED', direction: 'RECEIVED' });
      }
    } else if (status.status === 'ACCEPTED') {
      router.push(`/messages?partnerId=${userId}`);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="h-11 w-32 bg-gray-100 animate-pulse rounded-xl" />
  );

  let label = "Contacter";
  let icon = <MessageSquare className="w-4 h-4" />;
  let variantClass = "bg-indigo-600 text-white hover:bg-indigo-700";

  if (status.status === 'PENDING') {
    if (status.direction === 'SENT') {
      label = "Invité";
      icon = <Clock className="w-4 h-4" />;
      variantClass = "bg-gray-100 text-gray-500 border border-gray-200 cursor-default";
    } else {
      label = "Accepter";
      icon = <Users className="w-4 h-4" />;
      variantClass = "bg-green-600 text-white hover:bg-green-700";
    }
  } else if (status.status === 'ACCEPTED') {
    label = "Message";
    icon = <MessageSquare className="w-4 h-4" />;
    variantClass = "bg-indigo-600 text-white hover:bg-indigo-700";
  }

  return (
    <button
      onClick={handleAction}
      disabled={status.status === 'PENDING' && status.direction === 'SENT'}
      className={`flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm h-11 ${variantClass}`}
    >
      {icon}
      {label}
    </button>
  );
}

function BlockUserButton({ userId }: { userId: string }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFriendshipStatus(userId).then(res => {
      setStatus(res);
      setLoading(false);
    });
  }, [userId]);

  const handleBlock = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir bloquer cet utilisateur ?")) {
      setLoading(true);
      const { error } = await blockUser(userId);
      if (!error) {
        toast.success("Utilisateur bloqué");
        setStatus({ status: 'BLOCKED', direction: 'SENT' });
      } else {
        toast.error("Erreur lors du blocage");
      }
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    const { error } = await unblockUser(userId);
    if (!error) {
      toast.success("Utilisateur débloqué");
      setStatus({ status: null, direction: null });
    } else {
      toast.error("Erreur lors du déblocage");
    }
    setLoading(false);
  };

  if (loading) return null;

  const isBlockedByMe = status?.status === 'BLOCKED' && status?.direction === 'SENT';

  return (
    <button
      onClick={isBlockedByMe ? handleUnblock : handleBlock}
      className={cn (
        "flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm h-11 border",
        isBlockedByMe 
          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
          : "bg-white text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-200"
      )}
      title={isBlockedByMe ? "Débloquer" : "Bloquer"}
    >
      <Shield className={cn("w-3.5 h-3.5", isBlockedByMe && "fill-red-500")} />
      {isBlockedByMe ? "Débloquer" : "Bloquer"}
    </button>
  );
}

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'reviews' | 'badges';
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'reviews', label: 'Avis publiés',   icon: Star  },
  { id: 'badges',  label: 'Badges',          icon: Award },
];

// ─── Tiny card wrapper ────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon: Icon, value, label, color,
}: { icon: React.ElementType; value: string | number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-2xl font-black text-gray-900 tracking-tight">{value}</span>
      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center">{label}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function PublicUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data,      setData]      = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('reviews');
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getPublicUserProfile(userId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
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
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center">
          <User className="w-9 h-9 text-indigo-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Utilisateur introuvable</h2>
        <p className="text-sm text-gray-500 max-w-xs">Ce profil n'existe pas ou n'est plus disponible.</p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>
      </div>
      <Footer />
    </div>
  );

  const { user, stats, reviews, badges } = data;
  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';
  const initials   = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const earnedCount = badges.filter((b: any) => b.earned).length;

  const handleShare = (platform: string) => {
    const text = `Découvrez le profil de ${user.name} sur Ro2ya !`;
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">

        {/* ══════════════════════════════════════════════════════════════════
            HERO BANNER
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm"
        >
          {/* Cover with indigo mesh */}
          <div className="h-36 sm:h-48 relative overflow-hidden bg-[#4F46E5]">
            {/* animated blobs */}
            <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-[#818CF8] blur-[80px] opacity-60 animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-[#C084FC] blur-[80px] opacity-40 animate-pulse" style={{ animationDelay: '0.7s' }} />
            <div className="absolute top-[15%] right-[15%] w-40 h-40 rounded-full bg-[#EC4899] blur-[90px] opacity-20" />
            {/* glass */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
            {/* grid texture */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize:'32px 32px' }}/>
          </div>

          {/* Avatar + info */}
          <div className="px-5 sm:px-8 pb-7">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-14 sm:-mt-16">

              {/* Avatar */}
              <div className="flex items-end gap-4">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.75rem] border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0"
                >
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover"/>
                    : <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{initials}</span>
                  }
                </motion.div>

                <div className="mb-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-700 uppercase tracking-widest">
                      <BadgeCheck className="w-3 h-3"/> Vérifié
                    </span>
                    {user.role === 'PRO' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                        <Shield className="w-3 h-3"/> Pro
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{user.city}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3"/>
                      Membre depuis {new Date(user.memberSince).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
                    </span>
                  </div>
                  {/* avg rating given */}
                  {stats.avgRatingGiven > 0 && (
                    <div className="flex items-center gap-1.5">
                      <PublicStarRating rating={stats.avgRatingGiven} size="sm" showValue/>
                      <span className="text-[10px] text-gray-400">note moyenne donnée</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Share & Block & Contact */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <ContactButton userId={userId} />
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShareOpen(v => !v)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm h-11"
                    >
                      <Share2 className="w-3.5 h-3.5"/> Partager
                    </button>
                    <AnimatePresence>
                      {shareOpen && (
                        <motion.div
                          initial={{ opacity:0, scale:0.94, y:-4 }}
                          animate={{ opacity:1, scale:1, y:0 }}
                          exit={{ opacity:0, scale:0.94, y:-4 }}
                          transition={{ duration:0.15 }}
                          className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 min-w-[180px]"
                        >
                          {[
                            { id:'twitter',  Icon:Twitter,  label:'Twitter'      },
                            { id:'facebook', Icon:Facebook, label:'Facebook'     },
                            { id:'linkedin', Icon:Linkedin, label:'LinkedIn'     },
                            { id:'copy',     Icon:Copy,     label:'Copier le lien'},
                          ].map(s=>(
                            <button
                              key={s.id}
                              onClick={()=>handleShare(s.id)}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-gray-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                              <s.Icon className="w-3.5 h-3.5"/>{s.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Block Button */}
                  <BlockUserButton userId={userId} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            STATS ROW
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity:0, y:15 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4, delay:0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatPill icon={MessageSquare} value={stats.reviewsCount}  label="Avis publiés"  color="text-indigo-500"/>
          <StatPill icon={ShoppingBag}  value={stats.ordersCount}    label="Commandes"     color="text-orange-500"/>
          <StatPill icon={Calendar}     value={stats.bookingsCount}   label="Réservations"  color="text-emerald-500"/>
          <StatPill icon={Award}        value={earnedCount}           label="Badges gagnés" color="text-purple-500"/>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            TABS
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex gap-0.5 bg-white rounded-2xl p-1 border border-gray-200 shadow-sm w-fit">
          {TABS.map(tab => {
            const count = tab.id==='reviews' ? reviews.length : earnedCount;
            const active = activeTab===tab.id;
            return (
              <button
                key={tab.id}
                onClick={()=>setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200
                  ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <tab.icon className="w-3.5 h-3.5"/>
                {tab.label}
                {count>0 && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${active?'bg-white/25 text-white':'bg-gray-100 text-gray-500'}`}>
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
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-10 }}
            transition={{ duration:0.25 }}
          >
            {/* ─── REVIEWS ─────────────────────────────────────────────── */}
            {activeTab==='reviews' && (
              reviews.length===0 ? (
                <Card className="py-16 text-center">
                  <Star className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
                  <p className="text-sm font-bold text-gray-500">Aucun avis publié</p>
                  <p className="text-xs text-gray-400 mt-1">Cet utilisateur n'a pas encore partagé d'avis.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r: any, i: number) => (
                    <PublicReviewCard
                      key={r.id}
                      id={r.id}
                      rating={r.rating}
                      title={r.title}
                      comment={r.comment}
                      created_at={r.created_at}
                      vendor_response={null}
                      variant="user"
                      store={r.store}
                      index={i}
                    />
                  ))}
                </div>
              )
            )}

            {/* ─── BADGES ──────────────────────────────────────────────── */}
            {activeTab==='badges' && (
              <div className="space-y-4">
                {/* Earned */}
                {earnedCount > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-indigo-500"/> Badges obtenus ({earnedCount})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {badges.filter((b: any) => b.earned).map((b: any, i: number) => (
                        <PublicBadge key={b.id+i} {...b} index={i}/>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked */}
                {badges.filter((b: any) => !b.earned).length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 mt-6 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-gray-400"/> À débloquer
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {badges.filter((b: any) => !b.earned).map((b: any, i: number) => (
                        <PublicBadge key={b.id+'-locked-'+i} {...b} index={i}/>
                      ))}
                    </div>
                  </div>
                )}

                {badges.length===0 && (
                  <Card className="py-14 text-center">
                    <Award className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
                    <p className="text-sm font-bold text-gray-500">Aucun badge encore</p>
                    <p className="text-xs text-gray-400 mt-1">Les badges sont attribués en fonction de l'activité.</p>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
      <Footer />
    </div>
  );
}
