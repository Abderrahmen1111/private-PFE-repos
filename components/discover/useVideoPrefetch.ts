'use client'

import { useEffect, useRef } from 'react'
import { type DiscoverFeedItem } from './feed-algorithm'

/** Maximum bytes we are willing to hold in prefetch cache. */
const MAX_CACHE_BYTES = 150 * 1024 * 1024 // 150 MB

/** How many items ahead of the current card to prefetch. */
const PREFETCH_AHEAD = 2

/** Rough size estimates used when Content-Length is not available. */
const ESTIMATE = {
  video: 10 * 1024 * 1024,     // 10 MB per video
  image: 1 * 1024 * 1024,      // 1 MB per image
  thumbnail: 50 * 1024,        // 50 KB per low-res thumbnail
} as const

/**
 * L1 – Video / Image Prefetch
 *
 * Inserts `<link rel="prefetch">` tags for the next PREFETCH_AHEAD items
 * in the feed before the user scrolls to them. Once the browser receives
 * the hint the tag is removed from <head> (the cached response remains).
 *
 * Stops issuing new prefetches once the rolling byte estimate reaches
 * MAX_CACHE_BYTES to avoid exhausting the user's data allowance.
 */
export function useVideoPrefetch(
  items: DiscoverFeedItem[],
  currentIndex: number,
) {
  /** URLs already submitted to the browser — avoid duplicate hints. */
  const prefetchedRef = useRef<Set<string>>(new Set())
  /** Running byte estimate of everything we've asked the browser to cache. */
  const totalBytesRef = useRef(0)

  useEffect(() => {
    if (totalBytesRef.current >= MAX_CACHE_BYTES) return

    for (let offset = 1; offset <= PREFETCH_AHEAD; offset++) {
      const item = items[currentIndex + offset]
      if (!item) continue

      type PrefetchEntry = { url: string; as: string; bytes: number }
      const entries: PrefetchEntry[] = []

      // ── Main media ────────────────────────────────────────────────────────
      if (item.image && !item.image.startsWith('data:')) {
        entries.push({
          url: item.image,
          as: item.mediaType === 'video' ? 'video' : 'image',
          bytes: item.mediaType === 'video' ? ESTIMATE.video : ESTIMATE.image,
        })
      }

      // ── Low-res thumbnail (L2 poster) ─────────────────────────────────────
      if (item.thumbnailUrl && !item.thumbnailUrl.startsWith('data:')) {
        entries.push({ url: item.thumbnailUrl, as: 'image', bytes: ESTIMATE.thumbnail })
      }

      for (const { url, as: linkAs, bytes } of entries) {
        if (prefetchedRef.current.has(url)) continue
        if (totalBytesRef.current + bytes > MAX_CACHE_BYTES) break

        prefetchedRef.current.add(url)
        totalBytesRef.current += bytes

        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        link.setAttribute('as', linkAs)
        if (linkAs === 'video') link.crossOrigin = 'anonymous'
        document.head.appendChild(link)

        // Browser already has the request — we can safely drop the <link> tag.
        const timer = setTimeout(
          () => link.parentNode?.removeChild(link),
          15_000,
        )
        // Keep a reference so we can cancel on unmount if needed.
        link.dataset.timer = String(timer)
      }
    }
  }, [currentIndex, items])
}
