'use client'

import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'

type FeedActionsProps = {
  likes: number
  comments: number
  liked?: boolean
  onToggleLike?: () => void
  saved?: boolean
  onToggleSave?: () => void
}

const formatCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return `${count}`
}

export function FeedActions({
  likes,
  comments,
  liked = false,
  onToggleLike,
  saved = false,
  onToggleSave,
}: FeedActionsProps) {
  const actionBaseClass =
    'group flex flex-col items-center gap-1 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'

  return (
    <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-3 sm:right-6">
      <button
        type="button"
        aria-label="Like"
        onClick={onToggleLike}
        className={actionBaseClass}
      >
        <Heart
          className="h-5 w-5 transition-all duration-300 group-hover:scale-110"
          fill={liked ? 'currentColor' : 'none'}
          style={liked ? { color: '#fb7185' } : undefined}
        />
        <span className="text-xs font-medium">{formatCount(likes)}</span>
      </button>

      <button type="button" aria-label="Comment" className={actionBaseClass}>
        <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-xs font-medium">{formatCount(comments)}</span>
      </button>

      <button type="button" aria-label="Share" className={actionBaseClass}>
        <Share2 className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-xs font-medium">Share</span>
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
        <span className="text-xs font-medium">{saved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  )
}
