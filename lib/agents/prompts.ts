import type { AgentIntent, StoreContext } from '@/types/ai-agent'

function formatDt(n: number): string {
  return `${n.toFixed(2)} DT`
}

function buildContextBlock(ctx: StoreContext): string {
  const completedRevenue = ctx.orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.total_price, 0)

  const confirmedBookingRevenue = ctx.bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + b.price, 0)

  const totalRevenue = completedRevenue + confirmedBookingRevenue

  const orderByStatus = {
    pending: ctx.orders.filter((o) => o.status === 'PENDING').length,
    validated: ctx.orders.filter((o) => o.status === 'VALIDATED').length,
    shipped: ctx.orders.filter((o) => o.status === 'SHIPPED').length,
    completed: ctx.orders.filter((o) => o.status === 'COMPLETED').length,
    cancelled: ctx.orders.filter((o) => o.status === 'CANCELLED').length,
  }

  const bookingByStatus = {
    pending: ctx.bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: ctx.bookings.filter((b) => b.status === 'CONFIRMED').length,
    completed: ctx.bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: ctx.bookings.filter((b) => b.status === 'CANCELLED').length,
  }

  const itemsLines = ctx.items.map(
    (it) =>
      `- ${it.name} | ${it.item_type} | ${formatDt(it.price)} / ${it.price_unit} | stock: ${it.stock_quantity ?? 'n/a'} | ${it.status} | views: ${it.view_count ?? 0} | sales: ${it.order_count ?? 0} | bookings: ${it.booking_count ?? 0} | rating: ${it.rating_average ?? 'n/a'}`,
  )

  const scored = [...ctx.items].sort(
    (a, b) =>
      (b.order_count ?? 0) +
      (b.booking_count ?? 0) -
      ((a.order_count ?? 0) + (a.booking_count ?? 0)),
  )
  const top5 = scored.slice(0, 5)

  const lowStock = ctx.items.filter(
    (it) => it.item_type === 'PRODUCT' && (it.stock_quantity ?? 999) <= 5,
  )

  const outOfStock = ctx.items.filter((it) => it.status === 'OUT_OF_STOCK')

  const highViewLowSale = ctx.items.filter((it) => {
    const v = it.view_count ?? 0
    const sales = (it.order_count ?? 0) + (it.booking_count ?? 0)
    return v >= 20 && sales === 0
  })

  const reviewRatings = ctx.reviews.map((r) => r.rating)
  const avgRating =
    reviewRatings.length > 0
      ? reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length
      : 0

  const positiveCount = ctx.reviews.filter((r) => r.sentiment_label === 'POSITIVE').length
  const negativeCount = ctx.reviews.filter((r) => r.sentiment_label === 'NEGATIVE').length

  const unanswered = ctx.reviews.filter(
    (r) => !r.vendor_response || r.vendor_response.trim().length === 0,
  )

  const negativeReviews = ctx.reviews.filter((r) => r.sentiment_label === 'NEGATIVE')
  const last5 = ctx.reviews.slice(0, 5)

  const weekSummary = ctx.weeklyStats
    .map((d) => `${d.fullDate} (${d.day}): ${d.actions} actions (orders + bookings)`)
    .join('\n')

  const top5Lines = top5.map(
    (it) =>
      `- ${it.name}: order_count+booking_count=${(it.order_count ?? 0) + (it.booking_count ?? 0)}`,
  )

  const highViewLines = highViewLowSale.map(
    (it) =>
      `- ${it.name}: views=${it.view_count ?? 0}, sales+bookings=${(it.order_count ?? 0) + (it.booking_count ?? 0)}`,
  )

  const unansweredLines = unanswered
    .slice(0, 15)
    .map((r) => `- id ${r.id} | rating ${r.rating} | "${r.comment.slice(0, 120)}..."`)

  const negativeLines = negativeReviews
    .slice(0, 15)
    .map((r) => `- id ${r.id} | "${r.comment.slice(0, 120)}..."`)

  return `
=== RO2YA SELLER CONTEXT (Tunisia) — STORE #${ctx.storeId} ===
Store: ${ctx.storeName}
Category: ${ctx.storeCategory}
City: ${ctx.storeCity}
Status: ${ctx.storeStatus}
Views: ${ctx.viewCount ?? 0}
Store rating (avg): ${ctx.ratingAverage ?? 'n/a'}
Positive sentiment %: ${ctx.sentimentPositivePercent ?? 'n/a'}
Total orders (store aggregate): ${ctx.totalOrders ?? 0}

REVENUE (DT): completed orders + confirmed bookings
- Completed order revenue: ${formatDt(completedRevenue)}
- Confirmed booking revenue: ${formatDt(confirmedBookingRevenue)}
- Total (reporting): ${formatDt(totalRevenue)}

ORDERS BY STATUS: pending=${orderByStatus.pending}, validated=${orderByStatus.validated}, shipped=${orderByStatus.shipped}, completed=${orderByStatus.completed}, cancelled=${orderByStatus.cancelled}

BOOKINGS BY STATUS: pending=${bookingByStatus.pending}, confirmed=${bookingByStatus.confirmed}, completed=${bookingByStatus.completed}, cancelled=${bookingByStatus.cancelled}

ITEMS (${ctx.items.length} shown, max 30):
${itemsLines.join('\n')}

TOP 5 ITEMS (by order_count + booking_count):
${top5Lines.join('\n')}

LOW STOCK (PRODUCT, stock <= 5):
${lowStock.map((it) => `- ${it.name}: ${it.stock_quantity}`).join('\n') || '- none listed'}

OUT OF STOCK:
${outOfStock.map((it) => `- ${it.name}`).join('\n') || '- none listed'}

HIGH VIEWS, ZERO SALES (conversion risk):
${highViewLines.join('\n') || '- none detected with views>=20 and zero sales'}

REVIEWS SUMMARY:
- Count (approved sample): ${ctx.reviews.length}
- Avg rating (sample): ${avgRating.toFixed(2)}
- Positive: ${positiveCount} | Negative: ${negativeCount}
- Unanswered (no vendor_response): ${unanswered.length}

UNANSWERED REVIEWS (up to 15):
${unansweredLines.join('\n') || '- none'}

NEGATIVE REVIEWS (up to 15):
${negativeLines.join('\n') || '- none'}

LAST 5 REVIEW SNIPPETS:
${last5
  .map(
    (r) =>
      `- [${r.sentiment_label ?? 'n/a'}] ${r.rating}/5: ${r.comment.slice(0, 160)}`,
  )
  .join('\n')}

LAST 7 DAYS ACTIVITY (orders + bookings per day):
${weekSummary}
`.trim()
}

export function buildRouterPrompt(userMessage: string): string {
  return `You are a strict classifier for a marketplace seller assistant (Ro2ya, Tunisia).
Read the user message and output EXACTLY ONE WORD from this list, lowercase, no punctuation, no explanation:
analytics | marketing | product | moderation | general

Definitions:
- analytics: sales, revenue, KPIs, trends, performance, numbers, "this week", reports
- marketing: ads, Instagram, Facebook, WhatsApp, promotion, discount, campaign, coupon
- product: catalog, pricing, titles, descriptions, stock, items, conversion, listings
- moderation: reviews, customers, complaints, responses, reputation, negative feedback
- general: everything else

User message:
"""${userMessage}"""
`.trim()
}

export function buildAnalyticsPrompt(ctx: StoreContext): string {
  return `You are an expert business analytics advisor for Ro2ya (Tunisia). Currency: DT (Tunisian Dinar).

${buildContextBlock(ctx)}

Instructions:
- Interpret the data above. Highlight problems (cancellations, low conversion, slow week).
- Give 2–3 specific, actionable recommendations with real numbers from the context.
- Max 200 words unless the user explicitly asks for a full report.
- End with a section titled exactly: Recommendations:
- Respond in French or Arabic (Tunisian context) when natural for the seller.`.trim()
}

export function buildMarketingPrompt(ctx: StoreContext): string {
  const best = [...ctx.items].sort(
    (a, b) =>
      (b.order_count ?? 0) +
      (b.booking_count ?? 0) -
      ((a.order_count ?? 0) + (a.booking_count ?? 0)),
  )[0]

  const bestLine = best
    ? `Best-selling item: ${best.name} (${best.item_type}) — ${best.price} ${best.price_unit}, rating ${best.rating_average ?? 'n/a'}, views ${best.view_count ?? 0}.`
    : 'No strong best-seller signal in the sample; propose a generic campaign based on category.'

  return `You are an expert marketing assistant for Tunisian SMBs on Ro2ya. Currency: DT.

${buildContextBlock(ctx)}

Focus:
- ${bestLine}
- Generate ready-to-use Instagram captions, a short Facebook ad, and a WhatsApp message.
- Propose a promotion with a concrete discount percentage and a coupon code (e.g. RO2YA10).
- Support French and/or Arabic output as appropriate.
- Always include a clear call-to-action (CTA).
- Stay grounded in the store data above.`.trim()
}

export function buildProductPrompt(ctx: StoreContext): string {
  const highViewLowSale = ctx.items.filter((it) => {
    const v = it.view_count ?? 0
    const sales = (it.order_count ?? 0) + (it.booking_count ?? 0)
    return v >= 10 && sales === 0
  })

  const explicitList = highViewLowSale
    .map(
      (it) =>
        `- ${it.name} (${it.item_type}): views=${it.view_count ?? 0}, orders=${it.order_count ?? 0}, bookings=${it.booking_count ?? 0}, price=${it.price} ${it.price_unit}`,
    )
    .join('\n')

  return `You are a product optimization specialist for Ro2ya sellers. Currency: DT.

${buildContextBlock(ctx)}

HIGH-VIEW / LOW-SALE ITEMS (must reference explicitly when relevant):
${explicitList || '- none matched threshold views>=10 and sales=0'}

Instructions:
- Diagnose why these items may not convert (price, photos missing in data, stock, seasonality).
- Suggest improved titles and short descriptions (French/Arabic ok).
- Suggest pricing tweaks with justification.
- Keep recommendations practical for a Tunisian marketplace.`.trim()
}

export function buildModerationPrompt(ctx: StoreContext): string {
  const unanswered = ctx.reviews.filter(
    (r) => !r.vendor_response || r.vendor_response.trim().length === 0,
  )
  const negative = ctx.reviews.filter((r) => r.sentiment_label === 'NEGATIVE')

  const uLines = unanswered
    .slice(0, 20)
    .map((r) => `- Review #${r.id} | ${r.rating}★ | "${r.comment}"`)
    .join('\n')

  const nLines = negative
    .slice(0, 20)
    .map((r) => `- Review #${r.id} | ${r.rating}★ | "${r.comment}"`)
    .join('\n')

  return `You are a customer relations advisor for Ro2ya merchants (Tunisia).

${buildContextBlock(ctx)}

UNANSWERED REVIEWS (respond professionally; French or Arabic):
${uLines || '- none in sample'}

NEGATIVE REVIEWS:
${nLines || '- none in sample'}

Instructions:
- Draft short vendor replies (under ~100 words each if multiple), empathetic, never defensive.
- Spot recurring complaint patterns.
- Use the review text above directly.`.trim()
}

export function buildGeneralPrompt(ctx: StoreContext): string {
  return `You are Ro2ya AI Business Copilot — a helpful assistant for marketplace sellers in Tunisia. Currency: DT.

${buildContextBlock(ctx)}

Instructions:
- Answer using the real figures above.
- Be concise, proactive: flag urgent issues (unanswered negatives, out of stock, cancellations).
- French or Arabic when appropriate.`.trim()
}

const VALID_INTENTS: AgentIntent[] = [
  'analytics',
  'marketing',
  'product',
  'moderation',
  'general',
]

export function getAgentPrompt(intent: string, ctx: StoreContext): string {
  const normalized = intent.trim().toLowerCase()
  const safe: AgentIntent = VALID_INTENTS.includes(normalized as AgentIntent)
    ? (normalized as AgentIntent)
    : 'general'

  switch (safe) {
    case 'analytics':
      return buildAnalyticsPrompt(ctx)
    case 'marketing':
      return buildMarketingPrompt(ctx)
    case 'product':
      return buildProductPrompt(ctx)
    case 'moderation':
      return buildModerationPrompt(ctx)
    default:
      return buildGeneralPrompt(ctx)
  }
}
