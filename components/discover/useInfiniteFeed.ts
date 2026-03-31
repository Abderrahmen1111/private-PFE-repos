'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  type DiscoverFeedItem,
  type FeedCategory,
  calculateMerchantScore,
  insertSponsoredPosts,
  rankFeedItems,
} from '@/components/discover/feed-algorithm'

import { getDiscoverStories } from '@/lib/actions/stories'

const PAGE_SIZE = 12
const MAX_PAGES = 6

const userPreferences: FeedCategory[] = ['food', 'tech']

const categoryStyles: Record<FeedCategory, [string, string]> = {
  food: ['#7f1d1d', '#111827'],
  fashion: ['#312e81', '#0f172a'],
  tech: ['#115e59', '#0b1120'],
  beauty: ['#831843', '#111827'],
  home: ['#7c2d12', '#0f172a'],
  lifestyle: ['#3730a3', '#111827'],
}

const createPlaceholder = (title: string, subtitle: string, colorA: string, colorB: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stop-color='${colorA}' />
          <stop offset='100%' stop-color='${colorB}' />
        </linearGradient>
      </defs>
      <rect width='1080' height='1920' fill='url(#g)' />
      <circle cx='860' cy='420' r='240' fill='rgba(255,255,255,0.08)' />
      <circle cx='220' cy='1450' r='300' fill='rgba(255,255,255,0.06)' />
      <text x='80' y='1560' fill='white' font-family='Arial, sans-serif' font-size='86' font-weight='700'>${title}</text>
      <text x='80' y='1645' fill='rgba(255,255,255,0.82)' font-family='Arial, sans-serif' font-size='44'>${subtitle}</text>
    </svg>`,
  )}`

const merchantSeeds = [
  { merchantId: 'urban-grill', merchantName: 'Urban Grill', category: 'food' as const },
  { merchantId: 'nord-thread', merchantName: 'Nord Thread', category: 'fashion' as const },
  { merchantId: 'pulse-tech', merchantName: 'Pulse Tech', category: 'tech' as const },
  { merchantId: 'luna-beauty', merchantName: 'Luna Beauty', category: 'beauty' as const },
  { merchantId: 'maple-home', merchantName: 'Maple Home', category: 'home' as const },
  { merchantId: 'vibe-local', merchantName: 'Vibe Local', category: 'lifestyle' as const },
]

const productByCategory: Record<FeedCategory, string[]> = {
  food: ['Chef Box Combo', 'BBQ Weekend Deal', 'Street Taco Pack'],
  fashion: ['Minimal Jacket', 'Daily Knit Set', 'Soft Cargo Collection'],
  tech: ['ANC Earbuds', 'Smart Lamp Pro', 'Portable Game Hub'],
  beauty: ['Hydra Glow Kit', 'Silk Lip Set', 'Night Repair Duo'],
  home: ['Ceramic Set', 'Nordic Shelf Pack', 'Aroma Diffuser'],
  lifestyle: ['City Gym Pass', 'Yoga Starter Kit', 'Weekend Adventure Pack'],
}

const descriptionByCategory: Record<FeedCategory, string[]> = {
  food: ['Freshly made daily.', 'Limited-time deal.', 'Loved by locals.'],
  fashion: ['New drop this week.', 'Comfort and premium fit.', 'Styled for all-day wear.'],
  tech: ['Low latency and long battery.', 'Smart controls included.', 'Bundle offer live now.'],
  beauty: ['Clean ingredients.', 'Top-reviewed routine.', 'New customer promo active.'],
  home: ['Hand-finished details.', 'Designed for modern spaces.', 'Small-batch quality.'],
  lifestyle: ['Book in one tap.', 'Exclusive launch pricing.', 'Community favorite.'],
}

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const createRegularItem = (page: number, index: number): DiscoverFeedItem => {
  const merchantSeed = merchantSeeds[(page * PAGE_SIZE + index) % merchantSeeds.length]
  const category = merchantSeed.category
  const palette = categoryStyles[category]
  const productList = productByCategory[category]
  const descList = descriptionByCategory[category]
  const product = productList[(page + index) % productList.length]
  const description = descList[(page + index) % descList.length]
  const likes = randomInt(900, 50000)
  const comments = randomInt(40, 1800)

  return {
    id: `p${page}-item-${index}-${merchantSeed.merchantId}`,
    merchantId: merchantSeed.merchantId,
    merchantName: merchantSeed.merchantName,
    product,
    description,
    price: `$${randomInt(12, 220)}.00`,
    image: createPlaceholder(merchantSeed.merchantName, product, palette[0], palette[1]),
    likes,
    comments,
    category,
    popularityScore: randomInt(40, 100),
    engagementScore: randomInt(35, 100),
    timestamp: Date.now() - randomInt(0, 72) * 60 * 60 * 1000,
    merchant: {
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      totalSales: randomInt(500, 50000),
      responseRate: randomInt(70, 100),
    },
    isSponsored: false,
  }
}

const sponsoredPool: DiscoverFeedItem[] = [
  {
    id: 'sponsored-1',
    merchantId: 'boost-merchant-1',
    merchantName: 'Boosted Store',
    product: 'Featured Deal',
    description: 'Premium placement for high-converting products.',
    price: '$49.00',
    image: createPlaceholder('Sponsored', 'Featured Deal', '#7c3aed', '#111827'),
    likes: 12000,
    comments: 700,
    category: 'tech',
    popularityScore: 90,
    engagementScore: 88,
    timestamp: Date.now(),
    merchant: { rating: 4.8, totalSales: 42000, responseRate: 98 },
    isSponsored: true,
  },
  {
    id: 'sponsored-2',
    merchantId: 'boost-merchant-2',
    merchantName: 'Prime Picks',
    product: 'Sponsored Promo',
    description: 'Brand spotlight campaign with limited-time pricing.',
    price: '$39.00',
    image: createPlaceholder('Sponsored', 'Prime Picks', '#db2777', '#111827'),
    likes: 9800,
    comments: 550,
    category: 'fashion',
    popularityScore: 86,
    engagementScore: 82,
    timestamp: Date.now(),
    merchant: { rating: 4.6, totalSales: 33000, responseRate: 96 },
    isSponsored: true,
  },
]

export async function fetchFeed(page: number): Promise<DiscoverFeedItem[]> {
  const delay = randomInt(500, 1000)
  await new Promise((resolve) => window.setTimeout(resolve, delay))
  return Array.from({ length: PAGE_SIZE }, (_, index) => createRegularItem(page, index))
}

export function useInfiniteFeed() {
  const [items, setItems] = useState<DiscoverFeedItem[]>([])
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const containerRef = useRef<HTMLElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const nextPage = page + 1;
      const raw = await fetchFeed(nextPage);
      const ranked = rankFeedItems(raw, userPreferences);

      // Fetch real stories from DB on the first page
      let realStories: DiscoverFeedItem[] = [];
      if (page === 0) {
        try {
          const stories = await getDiscoverStories(10);
          realStories = stories.map((s: any) => ({
            id: `story-${s.id}`,
            merchantId: s.store_id.toString(),
            merchantName: s.stores?.name || 'Local Business',
            product: 'New Update',
            description: s.caption || '',
            price: 'Free to watch',
            image: s.media_url,
            mediaType: s.media_type,
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 50),
            category: 'lifestyle',
            popularityScore: 90,
            engagementScore: 85,
            timestamp: new Date(s.created_at).getTime(),
            merchant: {
              rating: 5.0,
              totalSales: 100,
              responseRate: 100,
            }
          } as DiscoverFeedItem));
        } catch (e) {
          console.error("Error fetching real stories for feed:", e);
        }
      }

      // Combine real stories with mock data
      const combined = page === 0 ? [...realStories, ...ranked] : ranked;
      const merged = insertSponsoredPosts(combined, sponsoredPool, 5);

      setItems((prev) => [...prev, ...merged]);
      setPage(nextPage);
      if (nextPage >= MAX_PAGES) setHasMore(false);
    } finally {
      setIsLoading(false)
    }
  }, [hasMore, isLoading, page])

  useEffect(() => {
    void loadMore()
  }, [loadMore])

  useEffect(() => {
    const root = containerRef.current
    const target = sentinelRef.current
    if (!root || !target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) void loadMore()
      },
      {
        root,
        rootMargin: '0px 0px 80% 0px',
        threshold: 0.01,
      },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  const rankedSnapshot = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        merchantScore: calculateMerchantScore(item.merchant),
      })),
    [items],
  )

  return {
    items: rankedSnapshot,
    isLoading,
    hasMore,
    containerRef,
    sentinelRef,
  }
}
