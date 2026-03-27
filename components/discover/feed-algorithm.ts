export type FeedCategory =
  | 'food'
  | 'fashion'
  | 'tech'
  | 'beauty'
  | 'home'
  | 'lifestyle'

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
  likes: number
  comments: number
  category: FeedCategory
  popularityScore: number
  engagementScore: number
  timestamp: number
  merchant: MerchantMetrics
  isSponsored?: boolean
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
