'use client';

import { motion } from 'framer-motion';
import { MapPin, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import PublicStarRating from './PublicStarRating';

interface PublicReviewCardProps {
  id: number;
  rating: number;
  title?: string | null;
  comment: string;
  created_at: string;
  vendor_response?: string | null;
  /** 'business' variant: show author info. 'user' variant: show store info */
  variant?: 'business' | 'user';
  author?: {
    id?: string;
    name: string;
    avatar_url?: string | null;
    city?: string | null;
  };
  store?: {
    id?: number;
    name: string;
    logo_url?: string | null;
    category?: string | null;
    city?: string | null;
  };
  index?: number;
}

export default function PublicReviewCard({
  rating,
  title,
  comment,
  created_at,
  vendor_response,
  variant = 'business',
  author,
  store,
  index = 0,
}: PublicReviewCardProps) {
  const isBusinessVariant = variant === 'business';

  const displayName = isBusinessVariant ? author?.name : store?.name;
  const displayCity = isBusinessVariant ? author?.city : store?.city;
  const avatarUrl = isBusinessVariant ? author?.avatar_url : store?.logo_url;
  const initials = (displayName || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const linkHref = isBusinessVariant
    ? author?.id ? `/public/user/${author.id}` : '#'
    : store?.id ? `/public/business/${store.id}` : '#';

  const accentHover = isBusinessVariant ? 'hover:border-orange-200' : 'hover:border-indigo-200';
  const accentText   = isBusinessVariant ? 'text-orange-600 hover:text-orange-700' : 'text-indigo-600 hover:text-indigo-700';
  const accentBg     = isBusinessVariant ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600';
  const responseBg   = isBusinessVariant ? 'bg-orange-50/60 border-orange-100' : 'bg-indigo-50/60 border-indigo-100';

  const dateStr = new Date(created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 ${accentHover}`}
    >
      <div className="flex gap-3.5">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-[11px] font-black ${accentBg}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName || ''} className="w-full h-full object-cover" onError={e => { (e.target as any).style.display = 'none'; }} />
          ) : initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
            <div>
              <Link href={linkHref} className={`text-sm font-bold text-gray-900 transition-colors ${accentText}`}>
                {displayName || 'Inconnu'}
              </Link>
              {displayCity && (
                <p className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                  <MapPin className="w-2.5 h-2.5" />{displayCity}
                </p>
              )}
            </div>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">{dateStr}</span>
          </div>

          {/* Stars */}
          <PublicStarRating rating={rating} size="sm" />

          {/* Title */}
          {title && <p className="text-sm font-bold text-gray-800 mt-2">{title}</p>}

          {/* Comment */}
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{comment}</p>

          {/* Vendor response */}
          {vendor_response && (
            <div className={`mt-3 p-3 rounded-xl border ${responseBg}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className={`w-3 h-3 ${isBusinessVariant ? 'text-orange-500' : 'text-indigo-500'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isBusinessVariant ? 'text-orange-600' : 'text-indigo-600'}`}>
                  Réponse du commerce
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{vendor_response}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
