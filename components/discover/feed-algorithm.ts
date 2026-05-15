export type FeedCategory =
  | 'food'
  | 'fashion'
  | 'tech'
  | 'beauty'
  | 'home'
  | 'lifestyle'

export const PAGE_SIZE = 12
export const MAX_PAGES = 6

export const userPreferencesDefault: FeedCategory[] = ['food', 'tech']

export const categoryStyles: Record<FeedCategory, [string, string]> = {
  food: ['#7f1d1d', '#111827'],
  fashion: ['#312e81', '#0f172a'],
  tech: ['#115e59', '#0b1120'],
  beauty: ['#831843', '#111827'],
  home: ['#7c2d12', '#0f172a'],
  lifestyle: ['#3730a3', '#111827'],
}

export const createPlaceholder = (title: string, subtitle: string, colorA: string, colorB: string) =>
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

export const merchantSeeds = [
  { merchantId: 'urban-grill', merchantName: 'Urban Grill', category: 'food' as const },
  { merchantId: 'nord-thread', merchantName: 'Nord Thread', category: 'fashion' as const },
  { merchantId: 'pulse-tech', merchantName: 'Pulse Tech', category: 'tech' as const },
  { merchantId: 'luna-beauty', merchantName: 'Luna Beauty', category: 'beauty' as const },
  { merchantId: 'maple-home', merchantName: 'Maple Home', category: 'home' as const },
  { merchantId: 'vibe-local', merchantName: 'Vibe Local', category: 'lifestyle' as const },
]

export const productByCategory: Record<FeedCategory, string[]> = {
  food: ['Chef Box Combo', 'BBQ Weekend Deal', 'Street Taco Pack'],
  fashion: ['Minimal Jacket', 'Daily Knit Set', 'Soft Cargo Collection'],
  tech: ['ANC Earbuds', 'Smart Lamp Pro', 'Portable Game Hub'],
  beauty: ['Hydra Glow Kit', 'Silk Lip Set', 'Night Repair Duo'],
  home: ['Ceramic Set', 'Nordic Shelf Pack', 'Aroma Diffuser'],
  lifestyle: ['City Gym Pass', 'Yoga Starter Kit', 'Weekend Adventure Pack'],
}

export const descriptionByCategory: Record<FeedCategory, string[]> = {
  food: ['Freshly made daily.', 'Limited-time deal.', 'Loved by locals.'],
  fashion: ['New drop this week.', 'Comfort and premium fit.', 'Styled for all-day wear.'],
  tech: ['Low latency and long battery.', 'Smart controls included.', 'Bundle offer live now.'],
  beauty: ['Clean ingredients.', 'Top-reviewed routine.', 'New customer promo active.'],
  home: ['Hand-finished details.', 'Designed for modern spaces.', 'Small-batch quality.'],
  lifestyle: ['Book in one tap.', 'Exclusive launch pricing.', 'Community favorite.'],
}

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const createRegularItem = (page: number, index: number): DiscoverFeedItem => {
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

export const sponsoredPool: DiscoverFeedItem[] = [
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

export type MerchantMetrics = {
  rating: number
  totalSales: number
  responseRate: number
}

export type DiscoverFeedItem = {
  id: string
  merchantId: string
  merchantName: string
  product: string
  description: string
  price: string
  image: string

  mediaType?: 'image' | 'video'
  allMedia?: string[]

  likes: number
  comments: number
  shares?: number
  saves?: number
  category: FeedCategory
  popularityScore: number
  engagementScore: number
  timestamp: number
  merchant: MerchantMetrics
  isSponsored?: boolean
  itemId?: number
  itemType?: 'PRODUCT' | 'SERVICE'
  hasLiked?: boolean
  hasSaved?: boolean
  hasFollowed?: boolean
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

const salesToScore = (totalSales: number) => clamp(totalSales / 100)

export const calculateMerchantScore = (merchant: MerchantMetrics) => {
  const normalizedRating = (merchant.rating / 5) * 100
  const normalizedResponse = merchant.responseRate
  const normalizedSales = salesToScore(merchant.totalSales)

  return normalizedRating * 0.5 + normalizedSales * 0.3 + normalizedResponse * 0.2
}

export const calculateRecencyScore = (timestamp: number, now = Date.now()) => {
  const ageHours = Math.max(0, (now - timestamp) / (1000 * 60 * 60))
  const score = 100 - ageHours * 2.5
  return clamp(score)
}

export const calculateFeedScore = (
  item: DiscoverFeedItem,
  userPreferences: FeedCategory[],
  now = Date.now(),
) => {
  const recency = calculateRecencyScore(item.timestamp, now)
  const base =
    item.engagementScore * 0.5 + item.popularityScore * 0.3 + recency * 0.2

  const preferenceBoost = userPreferences.includes(item.category) ? 15 : 0
  return base + preferenceBoost
}

export const rankFeedItems = (
  items: DiscoverFeedItem[],
  userPreferences: FeedCategory[],
  now = Date.now(),
) =>
  [...items].sort(
    (a, b) =>
      calculateFeedScore(b, userPreferences, now) -
      calculateFeedScore(a, userPreferences, now),
  )

export const insertSponsoredPosts = (
  items: DiscoverFeedItem[],
  sponsoredPool: DiscoverFeedItem[],
  every = 5,
) => {
  if (!items.length || !sponsoredPool.length || every <= 0) return items

  const result: DiscoverFeedItem[] = []
  let sponsorIndex = 0

  items.forEach((item, index) => {
    result.push(item)

    const isInsertionPoint = (index + 1) % every === 0
    if (!isInsertionPoint) return

    const sponsored = sponsoredPool[sponsorIndex % sponsoredPool.length]
    sponsorIndex += 1
    result.push(sponsored)
  })

  return result
}

/**
 * Shared logic to fetch a combined discovery page (Real + Mock + Sponsored)
 */
export async function fetchDiscoverPageCombined(
  page: number, 
  getPersonalizedReels: () => Promise<DiscoverFeedItem[]>,
  userPreferences: FeedCategory[] = userPreferencesDefault
) {
  // 1. Fetch real personalized reels on page 0
  let personalizedReels: DiscoverFeedItem[] = [];
  if (page === 0) {
    try {
      personalizedReels = await getPersonalizedReels();
    } catch (e) {
      console.error("Error fetching personalized reels for sync:", e);
    }
  }

  // 2. Mock items
  const raw = Array.from({ length: PAGE_SIZE }, (_, index) => createRegularItem(page, index));
  
  // 3. Rank mock items
  const ranked = rankFeedItems(raw, userPreferences);

  // 4. Combine
  const combined = page === 0 ? [...personalizedReels, ...ranked] : ranked;
  
  // 5. Insert sponsored
  return insertSponsoredPosts(combined, sponsoredPool, 5);
}
