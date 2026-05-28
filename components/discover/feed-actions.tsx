'use client'

import { useState, useRef, useEffect } from 'react'
import { Bookmark, Heart, MessageCircle, Share2, Phone, MoreVertical, Flag, UserX, Copy } from 'lucide-react'

type FeedActionsProps = {
  likes: number
  comments: number
  shares?: number
  saves?: number
  liked?: boolean
  onToggleLike?: () => void
  saved?: boolean
  onToggleSave?: () => void
  onOpenComments?: () => void
  onShare?: () => void
  onReport?: () => void
  onBlock?: () => void
  onShareProfile?: () => void
  onCopyLink?: () => void
}

const formatCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return `${count}`
}

export function FeedActions({
  likes,
  comments,
  shares = 0,
  saves = 0,
  liked = false,
  onToggleLike,
  saved = false,
  onToggleSave,
  onOpenComments,
  onShare,
  onReport,
  onBlock,
  onShareProfile,
  onCopyLink,
}: FeedActionsProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false)
      }
    }
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenu])
  const actionBaseClass =
    'group flex flex-col items-center gap-1 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'

  return (
    <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-3 sm:right-6">
      <style>{`
        @keyframes heart-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
      `}</style>
      <button
        type="button"
        aria-label="Like"
        onClick={onToggleLike}
        className={actionBaseClass}
      >
        <Heart
          className="h-5 w-5 transition-all duration-300 group-hover:scale-110"
          fill={liked ? 'currentColor' : 'none'}
          style={liked ? { color: '#fb7185', animation: 'heart-bounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' } : undefined}
        />
        <span className="text-xs font-medium">{formatCount(likes)}</span>
      </button>

      <button 
        type="button" 
        aria-label="Comment" 
        className={actionBaseClass}
        onClick={onOpenComments}
      >
        <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-xs font-medium">{formatCount(comments)}</span>
      </button>

      <button 
        type="button" 
        aria-label="Share" 
        className={actionBaseClass}
        onClick={onShare}
      >
        <Share2 className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-xs font-medium">{formatCount(shares)}</span>
      </button>

      <button type="button" aria-label="Contact" className={actionBaseClass}>
        <Phone className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-xs font-medium">Contact</span>
      </button>

      <button
        type="button"
        aria-label={saved ? 'Saved' : 'Save'}
        onClick={onToggleSave}
        className={actionBaseClass}
      >
        <Bookmark
          className="h-5 w-5 transition-all duration-300 group-hover:scale-110"
          fill={saved ? 'currentColor' : 'none'}
          style={saved ? { color: '#eab308' } : undefined}
        />
        <span className="text-xs font-medium">{formatCount(saves)}</span>
      </button>

      {/* Three-dot menu button */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label="More options"
          onClick={(e) => {
            e.stopPropagation()
            setOpenMenu(!openMenu)
          }}
          className="group flex flex-col items-center gap-1 rounded-full bg-red-500 p-2.5 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <MoreVertical className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        </button>

        {/* Dropdown menu */}
        {openMenu && (
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReport?.()
                setOpenMenu(false)
              }}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-red-500/20 transition-colors flex items-center gap-3 border-b border-white/10"
            >
              <Flag className="w-4 h-4 text-red-400" />
              <span>Signaler</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onBlock?.()
                setOpenMenu(false)
              }}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-red-500/20 transition-colors flex items-center gap-3 border-b border-white/10"
            >
              <UserX className="w-4 h-4 text-red-400" />
              <span>Bloquer</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShareProfile?.()
                setOpenMenu(false)
              }}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-blue-500/20 transition-colors flex items-center gap-3 border-b border-white/10"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Partager le profil</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCopyLink?.()
                setOpenMenu(false)
              }}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-green-500/20 transition-colors flex items-center gap-3"
            >
              <Copy className="w-4 h-4 text-green-400" />
              <span>Copier le lien</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
