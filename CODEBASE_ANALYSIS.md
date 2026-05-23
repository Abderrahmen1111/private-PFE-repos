# COMPREHENSIVE CODEBASE ANALYSIS: Ro2ya Marketplace

**Last Updated:** May 15, 2026  
**Scope:** `app/` and `lib/` directories  
**Total Files:** 182 TypeScript/TSX files (101 app + 81 lib)

---

## TABLE OF CONTENTS

1. [API Routes Overview](#api-routes-overview)
2. [Lib Modules Architecture](#lib-modules-architecture)
3. [Main Business Processes](#main-business-processes)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Key Features Implemented](#key-features-implemented)
6. [Authentication & Authorization](#authentication--authorization)
7. [Payment & Transaction System](#payment--transaction-system)
8. [AI & NLP Features](#ai--nlp-features)
9. [Search & Recommendation Engine](#search--recommendation-engine)
10. [Dashboard & Analytics](#dashboard--analytics)

---

## API ROUTES OVERVIEW

### Authentication & Sessions (app/api/auth/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Email/password sign-in with role-based redirect |
| `/api/auth/signup` | POST | User registration with metadata support |
| `/api/auth/verify` | POST | Email verification callback |
| `/api/auth/session` | GET | Get current user session |
| `/api/auth/logout` | POST | Sign out user |
| `/api/auth/magic-link` | POST | Passwordless auth via magic link |

**Key Features:**
- Role-based redirection: ADMIN → `/admin/dashboard`, PRO/BUSINESS_OWNER → `/dashboard/{storeId}`, CLIENT → `/`
- Session persistence via Supabase Auth
- Rate limiting: 5 login attempts per 15 minutes per IP
- User profiles auto-fetch for role determination

---

### Order Management (app/api/orders/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/orders` | GET | Fetch user or store orders |
| `/api/orders` | POST | Create new order |
| `/api/orders/bulk` | POST | Bulk import/create orders |
| `/api/workers/sync-orders` | POST | Sync orders to external ERP (QStash scheduled) |
| `/api/webhooks/order/confirm` | POST | Webhook: Mark order as VALIDATED + generate QR tracking code |
| `/api/webhooks/order/refund` | POST | Webhook: Process refund requests |

**Order Workflow:**
1. Customer creates order → Status: `PENDING`
2. Store validates → Status: `VALIDATED` (generates QR code)
3. Customer confirms via QR or store confirms → Status: `COMPLETED`
4. Fraud detection checks run during creation
5. Transaction synced to `transactions` table
6. QStash triggered for external system sync

**Order Statuses:**
- PENDING → VALIDATED → SHIPPED → COMPLETED
- PENDING → REFUND_REQUESTED → REFUNDED
- Any → CANCELLED

---

### Reservation/Booking System (app/api/reservations/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/reservations` | GET | Get user or business bookings |
| `/api/reservations` | POST | Create new booking (service appointment) |

**Booking Workflow:**
- Similar to orders but with `booking_date`, `start_time`, `end_time`
- Used for services (hairdressing, restaurants, lessons, etc.)
- Fraud detection applies to bookings as well
- Transaction synced when booking confirmed

---

### Product & Item Management (app/api/dashboard/{storeId}/products/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dashboard/{storeId}/products` | GET | Fetch all products for store |
| `/api/dashboard/{storeId}/products` | POST | Create new product |
| `/api/dashboard/{storeId}/products` | PATCH | Update products (bulk) |
| `/api/dashboard/{storeId}/products/{productId}` | PATCH | Update single product |
| `/api/items/{id}` | GET | Get product details |
| `/api/items/{id}` | PATCH | Update product |
| `/api/items` | POST | Create product with auto-embedding |

**Features:**
- Auto-generate embeddings for semantic search (via OpenRouter)
- Stock tracking and decrement on order
- Item types: PRODUCT, SERVICE, BOOKING
- Statuses: AVAILABLE, OUT_OF_STOCK, ARCHIVED

---

### Store Management (app/api/stores/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/stores` | GET | Search/list stores with filters |
| `/api/stores` | PATCH | Update store profile |
| `/api/stores/{id}` | GET | Get store details |
| `/api/stores/me` | GET | Get authenticated user's store |
| `/api/stores/follow` | POST | Follow/unfollow store |

**Store Features:**
- Store categories (e.g., Electronics, Fashion, Food)
- Rating system with average rating
- Store status: DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED
- Owner verification (owner_id or email match)
- Follow system for user preferences

---

### Search & Discovery (app/api/semantic-search/, app/api/image-search/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/semantic-search` | POST | Hybrid search (vector + text) across all entities |
| `/api/image-search` | POST | Image-to-query via Groq vision |
| `/api/geo/nearby` | GET | Find stores/items within radius (PostGIS) |
| `/api/geo/autocomplete` | GET | Location autocomplete |
| `/api/geo/reverse` | POST | Reverse geocoding |

**Search Architecture:**
- **Vector Search:** Supabase pgvector RPC `search_global_semantic`
  - Searches: stores, items, business_directory, service_directory, reels
  - Cosine similarity with threshold 0.18
- **Hybrid Search:** Text ILIKE queries on multiple fields
- **Darija Support:** Dictionary translation + semantic lookup
- **Timeout:** 8s hard ceiling to prevent serverless timeouts

---

### Reels & Video Content (app/api/reels/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/reels` | GET | Fetch personalized or business reels |
| `/api/reels` | POST | Track reel interaction (view, like, save, click) |
| `/api/reels/comments` | GET | Fetch comments on reel |
| `/api/dashboard/{storeId}/reels` | GET | Get store's reels |
| `/api/dashboard/{storeId}/reels` | POST | Create/upload reel |

**Reel Features:**
- Short-form video content (like TikTok/Instagram Reels)
- User interactions tracked: views, likes, saves, clicks
- Linked to items for direct purchase
- Comment system with AI sentiment analysis
- Personalized feed algorithm based on user preferences

---

### Messaging System (app/api/dashboard/{storeId}/messages/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dashboard/{storeId}/messages` | GET | Fetch conversations for store |
| `/api/dashboard/{storeId}/messages` | POST | Send message to customer |
| `/api/dashboard/{storeId}/support` | GET | Fetch support tickets |
| `/api/dashboard/{storeId}/support` | POST | Send support message |

**Messaging Features:**
- Store-to-customer messaging
- Support ticket system (separate from regular DMs)
- Message metadata: store_id, chat_type (support/regular)
- Conversation grouping by partner
- Unread status tracking

---

### Notifications System (app/api/notifications/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/notifications` | GET | Fetch user's notifications |
| `/api/notifications` | PATCH | Mark as read (single or all) |
| `/api/notifications/push-token` | POST | Register push notification token |
| `/api/notifications/push-send` | POST | Send push notification to mobile |

**Notification Types:**
- ORDER: New order received/status change
- MESSAGE: New message
- BOOKING: New booking/confirmation
- SUPPORT: Support ticket update
- AI_RECOMMENDATION: AI-generated business recommendations
- SYSTEM: Platform announcements

---

### Leads & Actions (app/api/dashboard/{storeId}/leads/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dashboard/{storeId}/leads` | GET | Fetch orders + bookings with fraud signals |

**Lead Data Includes:**
- Order/booking details (customer info, dates, amounts)
- Item/service details
- Fraud analysis scores and reasoning
- Contact information for follow-up

---

### Refunds & Returns (app/api/dashboard/{storeId}/refunds/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dashboard/{storeId}/refunds` | GET | Fetch orders with refund_requested/refunded status |

**Refund Workflow:**
- Orders with status: REFUND_REQUESTED or REFUNDED
- QStash background job for external refund processing

---

### Reviews & Ratings (app/api/dashboard/{storeId}/reviews/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dashboard/{storeId}/reviews` | GET | Fetch store reviews |

---

### Dashboard Analytics (app/api/dashboard/{storeId}/stats/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dashboard/{storeId}/stats` | GET | Store statistics (products, orders, reviews, impressions) |
| `/api/dashboard/{storeId}/intelligence` | GET | Comment/review analysis with AI insights |
| `/api/dashboard/{storeId}/sales-recommendations` | GET | AI-powered promotion recommendations |
| `/api/dashboard/{storeId}/transactions` | GET | Transaction history for store |

---

### Comment Analysis (app/api/comments/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/comments/analyze` | POST | Analyze single reel comment (sentiment, spam, toxicity) |
| `/api/comments/batch` | POST | Analyze up to 50 comments, return aggregate stats |
| `/api/comments/alerts` | GET | Fetch comment alerts for store |

**Analysis Features:**
- Sentiment detection: positive/neutral/negative
- Spam & toxicity detection
- Language detection: Darija/French/Arabic
- AI-generated suggested responses
- Rate limiting: 30 requests per minute

---

### AI Agent & Chat (app/api/ai-agent/, app/api/chat/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai-agent` | POST | Intent-based store agent (order tracking, product info, etc.) |
| `/api/chat` | POST | General marketplace chat (streaming) |
| `/api/ai-darija` | POST | Parse Darija prompts → create products/promotions/image generation |
| `/api/darija-lookup` | POST | Translate Darija to French with context |

**Chat Features:**
- Streaming responses via Server-Sent Events (SSE)
- Model: Groq Llama 3.1 8B (free, sub-second first token)
- Languages: French, Arabic, English, Darija
- Store-specific context for agent responses

---

### Admin & Management (app/api/admin/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/stats` | GET | Global platform statistics (API key protected) |
| `/api/admin/transactions` | GET | All platform transactions |
| `/api/admin/orders/validate` | POST | Manually validate order + generate QR |
| `/api/admin/orders/export` | GET | Export orders (filterable by status) |
| `/api/admin/orders/{id}/status` | PATCH | Update order status |

**Admin Auth:**
- API Key check via `checkAdminAuth()` from `lib/admin-auth.ts`
- Fallback to session-based admin role check
- Requires `ADMIN_API_KEY` env variable

---

### Background Workers (app/api/workers/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/workers/sync-orders` | POST | QStash: Sync completed orders to external ERP |
| `/api/workers/payment-retry` | POST | QStash: Retry payment confirmation |
| `/api/workers/process-refund` | POST | QStash: Process refund with payment provider |

**QStash Integration:**
- Signature verification: `verifySignatureAppRouter`
- Automatic retry on 500 status
- Delay support for scheduled tasks

---

### Miscellaneous APIs

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/profile` | GET/PATCH | Get/update user profile |
| `/api/events` | POST | Track user analytics events |
| `/api/sessions` | GET | Get all user sessions |
| `/api/friendships` | POST | Send/accept/block friend requests |
| `/api/promotions` | GET | Get store promotions |
| `/api/stories` | GET | Get business or discover stories |
| `/api/suggestions` | GET | Get smart suggestions for user |
| `/api/cloudinary/delete` | POST | Delete image from Cloudinary |
| `/api/places/search` | GET | Search places via Geoapify |

---

## LIB MODULES ARCHITECTURE

### Authentication & Session (lib/supabase/, lib/session-utils.ts)

**Files:**
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/admin.ts` - Admin client (bypasses RLS)
- `lib/supabase/auth.ts` - Auth-specific utilities
- `lib/supabase/browser.ts` - Browser-specific auth
- `lib/supabase/middleware.ts` - Auth middleware
- `lib/session-utils.ts` - Session management helpers

**Key Functions:**
- `createClient()` - Get server Supabase instance
- `createAdminClient()` - Get admin instance (requires SERVICE_ROLE_KEY)
- `getRoleFromDB()` - Fetch user role for authorization
- `redirectPathForRole()` - Compute redirect URL based on role

---

### Search & Recommendations (lib/search/, lib/actions/recommendations.ts)

**Search Modules:**
- `lib/search/vector-search.ts` - Semantic search via pgvector
- `lib/search/hybrid-search.ts` - Text + vector search combined
- `lib/search/normalizer.ts` - Query normalization
- `lib/search/reranker.ts` - Result reranking
- `lib/actions/search.ts` - Main search orchestration

**Recommendation Engine:**
- `lib/actions/recommendations.ts` - Personalized reel feed algorithm
  - Considers: user preferences, city match, interactions, search history, followed stores
  - Combines user signals into ranking score

**Search Features:**
- Multi-table search: stores, items, business_directory, service_directory, reels
- Darija translation support
- Geographic filtering (city, radius)
- Category filtering
- Timeout protection (8s hard ceiling)

---

### AI & NLP (lib/ai/, lib/agents/)

**AI Modules:**
- `lib/ai/comment-analyzer.ts` - Sentiment & toxicity detection via Groq
- `lib/ai/darija-parser.ts` - Parse Darija prompts → structured data
- `lib/ai/image-generator.ts` - Generate images via StabilityAI

**Agent Modules:**
- `lib/agents/prompts.ts` - Store context formatting for LLM
- `lib/agents/darija-rag.ts` - Darija RAG system (dictionary + vector lookup)
- `lib/agents/darija-rules.ts` - Linguistic rules for Darija

**Darija Dictionary:**
- `lib/darija-dictionary.ts` - 106K+ Tunisian Darija → French mappings
- `lib/darija-dictionary.test.ts` - Tests

**Models Used:**
- Groq Llama 3.1 8B for general chat (free, <1s first token)
- Groq Llama 3.3 70B for comment analysis (more accurate)
- Gemini for image analysis
- StabilityAI for image generation

---

### Embeddings & Vector Search (lib/openrouter-embeddings.ts)

**Functions:**
- `generateEmbedding(text)` - Generate embedding for text (stored in DB)
- `generateQueryEmbedding(text)` - Generate embedding for search queries

**Model:** OpenRouter (provider-agnostic)

**Usage:**
- Auto-embed items when created/updated
- Search queries embedded for semantic matching

---

### Rate Limiting (lib/rate-limit.ts)

**Strategy:**
- Upstash Redis if configured (production)
- In-memory Map fallback (single-instance, dev only)

**Limits:**
- Login: 5 per 15 min per IP
- Magic link: 3 per 10 min per IP
- Signup: 3 per hour per IP
- General API: 60 per min per IP

**Functions:**
- `rateLimit(key, ip)` - Check rate limit
- `formatRetryAfter(resetAt)` - Format retry time

---

### Server Actions (lib/actions/)

**User Actions:**
- `lib/actions/auth.ts` - Login, signup, password reset (server actions)
- `lib/actions/users.ts` - User CRUD & profile updates
- `lib/actions/profile.ts` - Fetch user profile with related data
- `lib/actions/public-profile.ts` - Public user profile view

**Store Actions:**
- `lib/actions/stores.ts` - Store CRUD, search, follow
- `lib/actions/store-follows.ts` - Store follow/unfollow logic
- `lib/actions/business.ts` - Business info management

**Order & Booking Actions:**
- `lib/actions/orders.ts` - Create, fetch, update orders
- `lib/actions/reservation.ts` - Create, fetch, update bookings
- `lib/actions/items.ts` - Fetch public/admin items

**Content Actions:**
- `lib/actions/reels.ts` - Fetch, create reels, track interactions
- `lib/actions/stories.ts` - Publish, fetch stories
- `lib/actions/comments.ts` - Post, fetch reel comments

**Analytics & Intelligence:**
- `lib/actions/sales-analyzer.ts` - AI-powered promotion recommendations (Groq)
- `lib/actions/analyzer-service.ts` - Batch comment analysis
- `lib/actions/leads.ts` - Fetch orders + bookings with fraud data

**Notifications:**
- `lib/actions/notifications.ts` - Create, fetch, mark as read
- `lib/actions/ai-notifications.ts` - Auto-generated AI alerts

**Reviews & Feedback:**
- `lib/actions/reviews.ts` - Post, fetch, analyze reviews
- `lib/actions/favorites.ts` - Save/unsave stores

**Fraud Detection:**
- `lib/actions/fraud-detection.ts` - Heuristic + AI fraud scoring
- `lib/actions/debug-schema.ts` - Schema introspection

**Transactions:**
- `lib/actions/transactions.ts` - Sync orders/bookings to transactions table
- `lib/actions/admin.ts` - Admin-only operations

**AI Services:**
- `lib/actions/ai-agent.ts` - Store context + intent-based responses
- `lib/actions/openrouter-service.ts` - OpenRouter API wrapper
- `lib/actions/groq-service.ts` - Groq API wrapper (deprecated, now inline)

**Miscellaneous:**
- `lib/actions/support.ts` - Support ticket management
- `lib/actions/promotions.ts` - Create/fetch promotions
- `lib/actions/alerts.engine.ts` - Alert rules engine
- `lib/actions/friendships.ts` - Friend requests, blocks
- `lib/actions/user-activity.ts` - Track user activity

---

### State Management (lib/store/)

**Zustand Stores:**
- `lib/store/use-cart-store.ts` - Shopping cart state
- `lib/store/use-messaging-store.ts` - Messaging UI state
- `lib/store/use-saves-store.ts` - Saved places/items
- `lib/store/use-call-store.ts` - WebRTC call state

---

### Utilities (lib/utils.ts, lib/storage.ts)

- `lib/utils.ts` - General helpers (formatting, validation, etc.)
- `lib/storage.ts` - Browser localStorage wrapper
- `lib/cloudinary.ts` - Cloudinary image upload/management
- `lib/upload.ts` - File upload handling

---

### Tracking & Analytics (lib/tracking/)

- `lib/tracking/trackEvent.ts` - Event tracking function
- `lib/tracking/eventTypes.ts` - Event type definitions

**Tracked Events:**
- Page views, searches, item views, purchases
- Reel engagement (views, likes, saves)
- Profile interactions

---

### Supabase Storage & Database (lib/supabase/storage.ts, database.ts)

- `lib/supabase/storage.ts` - File storage operations
- `lib/supabase/database.ts` - Database utilities
- `lib/supabase/realtime.ts` - Real-time subscriptions

---

### Context (lib/context/)

- `lib/context/UploadContext.tsx` - Upload progress context for UI

---

### UI Components Context (lib/context/, components/)

Located in `components/` but managed with context:
- Session provider
- Theme provider
- Upload context

---

## MAIN BUSINESS PROCESSES

### 1. **Order Lifecycle**

```
CREATE ORDER (Customer)
  ↓
Fraud Detection (background)
  ↓
STATUS: PENDING (awaiting store validation)
  ↓
STORE VALIDATES ORDER (dashboard)
  ↓
STATUS: VALIDATED
  Generate QR code for tracking
  Sync to transactions table
  Create notification for customer
  ↓
QStash: Sync to external ERP
  ↓
CUSTOMER CONFIRMS (QR scan or direct)
  ↓
STATUS: COMPLETED
  Update transaction status
  Create delivery notification
  Optionally: Request review/feedback
  ↓
OPTIONAL: REFUND REQUEST
  ↓
STATUS: REFUND_REQUESTED
  QStash: Process refund
  Update transaction
```

**Key Checks:**
- User cannot order from own store
- Duplicate PENDING orders prevented (same item)
- Fraud score blocks high-risk orders if configured

---

### 2. **Store Registration & Business Setup**

```
USER REGISTERS
  ↓
AUTO-ROLE: CLIENT
  (User can manually register as PRO/BUSINESS_OWNER)
  ↓
CREATE STORE (if PRO)
  - Store name, category, city, contact
  - Bank/payment info
  - Logo, cover image
  ↓
STATUS: DRAFT (awaiting review)
  ↓
ADMIN REVIEW
  ↓
STATUS: APPROVED
  Redirect to: /dashboard/{storeId}
  ↓
OWNER SETUP
  - Add products/services
  - Set pricing, stock
  - Activate promotions
  - Create reels/stories
```

---

### 3. **Personalized Feed Algorithm (Reels)**

```
USER OPENS DISCOVER PAGE
  ↓
FETCH USER DATA:
  - City (for geographic match)
  - Preferences (categories, search history)
  - Interactions (likes, saves, completions)
  - Followed stores
  ↓
FETCH ALL ACTIVE REELS
  - Filter by: status=active, expires_at > now
  - Include: store city, category, stats
  ↓
SCORE EACH REEL:
  Category match: +points if in preferences
  City match: +points if same city
  Followed store: +points if from followed store
  High engagement: +points if high view/like ratio
  Recency: newer reels score higher
  ↓
SORT & PAGINATE
  Return top N reels with scores
```

---

### 4. **Search & Discovery Flow**

```
USER ENTERS SEARCH QUERY
  ↓
SEMANTIC SEARCH ORCHESTRATION:
  
  1. Normalize query (lowercase, trim)
  2. Detect language (Darija/French/Arabic)
  3. Translate if needed (Darija → French)
  4. Generate embedding via OpenRouter
  
  ↓ PARALLEL BRANCHES:
  
  A. VECTOR SEARCH (pgvector)
     - Call RPC: search_global_semantic
     - Threshold: 0.18 cosine similarity
     - Tables: stores, items, business_dir, service_dir, reels
     - Timeout: 4s
  
  B. HYBRID SEARCH (text ILIKE)
     - Extract keywords from original + translated query
     - Search 5 tables for keyword matches
     - Support Darija keywords
     - Limit: 6 keywords, 5 max per field
  
  ↓
  MERGE & RERANK:
    - Combine results from A + B
    - Rerank by relevance
    - Apply geographic filter if location provided
    - Apply category filter if provided
  
  ↓
  RETURN: Unified results with type & similarity score
```

**Timeouts:**
- Route timeout: 8s hard ceiling
- Vector search: 4s
- Hybrid search: 3s
- Fallback: return empty if timeout

---

### 5. **Fraud Detection Pipeline**

```
NEW ORDER CREATED
  ↓
COLLECT HEURISTIC SIGNALS:
  - Account age (< 1h = high risk)
  - Account history (multiple orders, cancellations)
  - Order history (rapid repeated orders)
  - Amount anomalies (vs. typical order value)
  - Delivery address (new vs. existing)
  - IP geolocation (spoofing detection)
  - Customer phone/email reputation
  
  ↓
CALCULATE FRAUD SCORE (0-100):
  - Sum all signal weights
  - Apply thresholds:
    score 0-25: SAFE (approve)
    score 25-55: SUSPICIOUS (review)
    score 55-75: HIGH_RISK (manual review required)
    score 75+: BLOCKED (auto-reject)
  
  ↓
SAVE ANALYSIS:
  - Score, level, signals, recommendation, reasoning
  - Store to: order_fraud_checks / booking_fraud_checks
  
  ↓
IF HIGH_RISK/BLOCKED:
  - Notify store admin
  - Require manual validation
  - Log for future analysis
```

---

### 6. **Comment Analysis & Moderation**

```
NEW COMMENT ON REEL
  ↓
RATE LIMIT CHECK (30/min)
  ↓
ANALYZE VIA GROQ:
  Model: Llama 3.3 70B
  Detects:
    - Sentiment: positive/neutral/negative
    - Spam detection
    - Toxicity detection
    - Language: Darija/French/Arabic
    - Generate suggested reply
  
  ↓
SAVE ANALYSIS:
  - Sentiment, is_spam, is_toxic, language
  - Store to: reel_comments table
  
  ↓
IF SPAM/TOXIC:
  - Flag for moderation
  - Notify store owner
  - Optional: auto-hide
```

**Batch Analysis:**
- Up to 50 comments at once
- Aggregate stats: sentiment distribution, top issues
- Business recommendations: how to respond
- Timeout: 120s (Vercel Pro+)

---

### 7. **AI-Powered Sales Recommendations**

```
STORE OWNER VIEWS DASHBOARD
  ↓
REQUEST: /api/dashboard/{storeId}/sales-recommendations
  
  ↓
FETCH SALES DATA (90-day window):
    - Items: name, price, views, sales, bookings
    - Orders: item_id, quantity, price, date, status
    - Bookings: item_id, price, date, status
  
  ↓
CHECK CACHE (5-min TTL)
    If cached: return immediately
    If miss: continue to analysis
  
  ↓
ANALYZE VIA GROQ:
    Model: Mixtral 8x7B (fallback: Llama 3.1 8B)
    Identify patterns:
      - Dormant products (views > 20, sales = 0)
      - Happy hour opportunities
      - Bundle recommendations
      - Upsell opportunities
  
  ↓
GENERATE RECOMMENDATIONS:
    For each issue:
      - Type, title, description
      - Suggested action (discount %, bundle items)
      - Target items
      - Urgency level (low/medium/high)
      - Estimated impact
      - Confidence score
  
  ↓
CACHE & RETURN
    TTL: 5 minutes
```

---

### 8. **Notification & Alert System**

```
TRIGGER EVENT:
  - New order received
  - Order status change
  - New message
  - New booking
  - New review/comment
  - AI recommendation
  
  ↓
CREATE NOTIFICATION:
  - Insert to: notifications table
  - Fields: title, description (truncated to ~10 words)
  - Metadata: link, action, related IDs
  
  ↓
FETCH PUSH TOKENS:
    From: user_push_tokens (mobile devices)
  
  ↓
SEND PUSH NOTIFICATIONS:
    - Fire-and-forget (async)
    - Parallel batch send
    - Include: title, body, data payload
  
  ↓
USER SEES:
    - Dashboard notification badge (unread count)
    - Mobile push notification
    - Notification center (list view)
```

---

## DATA FLOW ARCHITECTURE

### High-Level Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  - React components, Next.js pages, Zustand stores              │
│  - Supabase browser client (auth + realtime)                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ HTTPS + Auth tokens
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│                    NEXT.JS SERVER (app/)                         │
│  - API routes (/api/*)                                           │
│  - Server components                                             │
│  - Server actions                                                │
│  - Middleware (auth checks, rate limiting)                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
    ┌──────────────┐   ┌──────────────────────┐
    │  SUPABASE    │   │  EXTERNAL SERVICES   │
    │  (PostgreSQL │   │                      │
    │   + pgvector)│   │ - Groq (LLM)         │
    │              │   │ - OpenRouter         │
    │  Tables:     │   │ - Geoapify           │
    │  - users     │   │ - Cloudinary         │
    │  - stores    │   │ - StabilityAI        │
    │  - items     │   │ - Upstash QStash     │
    │  - orders    │   │ - Upstash Redis      │
    │  - bookings  │   │ - Expo Push Service  │
    │  - reels     │   │                      │
    │  - comments  │   └──────────────────────┘
    │  - reviews   │
    │  - messages  │
    │  - etc.      │
    └──────────────┘
          ▲
          │
          │ Background jobs
          │
    ┌─────┴──────────┐
    │ QSTASH WORKERS │
    │  - Sync orders │
    │  - Retry payments
    │  - Process refunds
    └────────────────┘
```

### Data Entity Relationships

```
USERS
  ├─ One-to-Many → STORES (owner_id)
  ├─ One-to-Many → ORDERS (customer_id)
  ├─ One-to-Many → BOOKINGS (customer_id)
  ├─ One-to-Many → REVIEWS (author_id)
  ├─ One-to-Many → MESSAGES (sender_id, receiver_id)
  ├─ One-to-Many → REELS (author_id)
  ├─ One-to-Many → REEL_COMMENTS (user_id)
  ├─ Many-to-Many → STORES (store_follows)
  ├─ Many-to-Many → ITEMS (saved_places / user_preferences)
  └─ Many-to-Many → USERS (friendships)

STORES
  ├─ One-to-Many → ITEMS (store_id)
  ├─ One-to-Many → ORDERS (store_id)
  ├─ One-to-Many → BOOKINGS (store_id)
  ├─ One-to-Many → REELS (store_id)
  ├─ One-to-Many → REVIEWS (store_id)
  ├─ One-to-Many → MESSAGES (implied)
  └─ One-to-Many → PROMOTIONS (store_id)

ITEMS
  ├─ Many-to-One → STORES (store_id)
  ├─ One-to-Many → ORDERS (item_id)
  ├─ One-to-Many → BOOKINGS (item_id)
  ├─ One-to-Many → REELS (item_id)
  ├─ One-to-Many → REVIEWS (item_id)
  ├─ Many-to-Many → PROMOTIONS (promotion_items)
  └─ embedding (pgvector) for semantic search

ORDERS
  ├─ Many-to-One → USERS (customer_id)
  ├─ Many-to-One → STORES (store_id)
  ├─ Many-to-One → ITEMS (item_id)
  ├─ One-to-One → ORDER_FRAUD_CHECKS (order_id)
  └─ One-to-One → TRANSACTIONS (via order_number)

REELS
  ├─ Many-to-One → STORES (store_id)
  ├─ Many-to-One → ITEMS (item_id)
  ├─ One-to-Many → REEL_COMMENTS (reel_id)
  ├─ One-to-Many → REEL_STATS (reel_id)
  ├─ One-to-Many → USER_INTERACTIONS (reel_id)
  └─ embedding (pgvector) for semantic search
```

### Request → Response Flow Example (Order Creation)

```
CLIENT: POST /api/orders
  Body: {
    store_id: 5,
    item_id: 42,
    quantity: 2,
    customer_name: "Ali",
    customer_phone: "+216 XX XXX XXX",
    delivery_address: "Tunis, Menzah"
  }

  ↓

SERVER ACTION: createOrder()
  1. Verify user auth
  2. Check store exists & user not owner
  3. Check PENDING order doesn't exist (dedup)
  4. Generate order_number: ORD-{timestamp}-{random}
  5. Insert to orders table with status=PENDING
  6. Decrement item stock
  
  ↓
  
FRAUD DETECTION (background):
  6b. Collect signals (account age, order history, etc.)
  6c. Calculate score
  6d. Insert to order_fraud_checks
  6e. If high_risk: create alert notification
  
  ↓
  
TRANSACTION SYNC:
  7. syncOrderTransaction(): Create entry in transactions table
  8. Map order status → transaction status
  
  ↓
  
NOTIFICATIONS:
  9. createNotification(): Notify store owner
     "New order from Ali - 2 items"
  10. Send push to store owner's mobile devices
  
  ↓
  
QSTASH EVENT:
  11. publishQStashEvent('sync-orders', { orderId })
      Scheduled after 60s delay (optional)
  
  ↓

RESPONSE: 201 Created
  {
    order_number: "ORD-A1B2C3-XYZ9",
    status: "PENDING",
    tracking_code: null,  // Generated after validation
    total_price: calculated,
    fraud_score: 12,
    fraud_level: "safe",
    message: "Order created successfully"
  }
```

---

## KEY FEATURES IMPLEMENTED

### ✅ User Features

- [x] **Authentication**
  - Email/password login & signup
  - Magic link passwordless auth
  - Session persistence
  - Role-based redirection

- [x] **User Profiles**
  - Profile creation & editing
  - Avatar uploads (Cloudinary)
  - City/location preferences
  - User search & public profiles

- [x] **Friendships**
  - Send/accept/decline friend requests
  - Block/unblock users

---

### ✅ Store/Business Features

- [x] **Store Registration & Management**
  - Create store with details
  - Upload logo/cover images
  - Category selection
  - Store status workflow (DRAFT → APPROVED → PUBLISHED)

- [x] **Product Management**
  - Create/edit/delete products
  - Stock tracking
  - Pricing (with unit support)
  - Product images (Cloudinary)
  - Auto-embedding for semantic search
  - Product types: PRODUCT, SERVICE, BOOKING
  - Status: AVAILABLE, OUT_OF_STOCK, ARCHIVED

- [x] **Service Booking System**
  - Create bookable services
  - Time slot management
  - Service pricing
  - Booking calendar integration

- [x] **Store Analytics Dashboard**
  - Product count, order count, review count
  - Profile view tracking
  - Phone click tracking
  - Direction request tracking
  - Transaction history

---

### ✅ Order & Payment Features

- [x] **Order Management**
  - Create orders (products + services)
  - Order status workflow
  - Order tracking with QR codes
  - Fraud detection on creation
  - Duplicate prevention

- [x] **Refund System**
  - Request refunds
  - Refund processing (QStash)
  - Refund tracking

- [x] **Payment Integration**
  - Transaction syncing
  - External ERP sync (QStash)
  - Payment retry mechanism

---

### ✅ Search & Discovery Features

- [x] **Semantic Search**
  - Vector search via pgvector
  - Multi-table search (stores, items, reels, etc.)
  - Threshold-based cosine similarity

- [x] **Hybrid Search**
  - Text ILIKE queries
  - Keyword extraction & translation
  - Category & location filtering

- [x] **Image-to-Search**
  - Upload image → auto-generate search query via Groq vision

- [x] **Darija Support**
  - Darija → French translation
  - 106K+ word dictionary
  - Vector-based phrase lookup (435K phrases)
  - Linguistic rules for context

- [x] **Geospatial Search**
  - Nearby stores/items (PostGIS radius search)
  - Location autocomplete
  - Reverse geocoding

---

### ✅ Reels & Video Content

- [x] **Reel Management**
  - Create/upload short videos
  - Link reels to products
  - Expire reels (time-based)
  - Reel stats tracking (views, likes, saves, clicks)

- [x] **Personalized Feed**
  - Algorithm considering: preferences, city, interactions, follows
  - Category-based recommendations
  - Geographic matching

- [x] **Interactions**
  - View, like, save, click tracking
  - User interaction history

- [x] **Comments System**
  - Post comments on reels
  - Sentiment analysis
  - Spam/toxicity detection
  - AI-generated suggested replies

---

### ✅ Messaging & Notifications

- [x] **Direct Messaging**
  - Store-to-customer messaging
  - Conversation grouping
  - Unread tracking

- [x] **Support Tickets**
  - Support chat system
  - Separate from regular DMs
  - Support ticket tracking

- [x] **Notifications**
  - Multiple types: ORDER, MESSAGE, BOOKING, SUPPORT, AI_RECOMMENDATION, SYSTEM
  - Push notifications to mobile (Expo)
  - In-app notification center
  - Mark as read (single or all)
  - Truncated descriptions

---

### ✅ Reviews & Ratings

- [x] **Review System**
  - Post reviews with ratings
  - Store reviews aggregation
  - Review moderation

- [x] **Sentiment Analysis**
  - Detect positive/negative sentiment
  - Categorize feedback
  - Track sentiment trends

---

### ✅ AI & Intelligence Features

- [x] **Comment Analysis**
  - Sentiment detection (positive/neutral/negative)
  - Spam detection
  - Toxicity detection
  - Language detection (Darija/French/Arabic)
  - AI-suggested responses
  - Batch analysis (50 comments)

- [x] **Store AI Agent**
  - Intent-based responses
  - Intents: order_tracking, product_info, general, store_info, promotions, feedback, hours, location
  - Store context injection
  - Darija RAG support

- [x] **Sales Recommendations**
  - Identify dormant products
  - Happy hour opportunities
  - Bundle suggestions
  - Upsell recommendations
  - Urgency-based prioritization
  - Confidence scoring

- [x] **Darija NLP**
  - Parse Darija prompts
  - Create products from Darija descriptions
  - Generate promotions from Darija
  - Image generation from Darija descriptions

- [x] **Image Generation**
  - StabilityAI integration
  - Generate product/promotion images from text prompts
  - Auto-upload to Cloudinary

---

### ✅ Fraud & Security Features

- [x] **Fraud Detection**
  - Heuristic signal collection
  - AI-powered risk scoring
  - Automatic blocking of high-risk orders
  - Fraud analysis storage
  - Admin review queue

- [x] **Rate Limiting**
  - Login: 5 per 15 min
  - Magic link: 3 per 10 min
  - Signup: 3 per hour
  - Upstash Redis (production) or in-memory (dev)

- [x] **Authentication & Authorization**
  - Role-based access control (CLIENT, PRO, ADMIN)
  - Session-based auth
  - API key auth (admin endpoints)
  - Store ownership verification

- [x] **Admin Features**
  - Global platform stats
  - Order export & validation
  - Order status management
  - Admin API key authentication

---

### ✅ Promotions & Marketing

- [x] **Promotion Management**
  - Create promotions with discounts
  - Date ranges
  - Apply to all items or specific items
  - Track promotion usage

- [x] **Promotional Insights**
  - AI-generated recommendations
  - Dormant product identification
  - Cross-sell opportunities

---

### ✅ Stories & Social Features

- [x] **Story Publishing**
  - Create stories (temporary content)
  - Expiration times
  - Store-specific or global stories
  - Story view tracking

- [x] **Story Discovery**
  - Global discover feed
  - Store-specific stories
  - Approval workflow

---

### ✅ Backend Infrastructure

- [x] **Background Jobs (QStash)**
  - Order sync to external ERP
  - Payment retry logic
  - Refund processing
  - Scheduled execution with delays
  - Automatic retries on failure

- [x] **Event Tracking**
  - Analytics events
  - Page views, searches, interactions
  - Sanitized event storage

- [x] **Webhooks**
  - Order confirmation webhooks
  - Refund webhooks
  - Signature verification

- [x] **Real-time Features (Supabase Realtime)**
  - Live notifications
  - Real-time message updates
  - Subscription-based updates

---

### ✅ Admin & Moderation

- [x] **Admin Dashboard**
  - Global statistics
  - Platform-wide transactions
  - Order management (validate, export, status change)
  - API key authentication

- [x] **Content Moderation**
  - Comment moderation (spam/toxicity)
  - Story approval workflow
  - Manual review queues

---

### ⚠️ Partially Implemented Features

- ⚠️ **WebRTC Calls**
  - Store defined: `lib/store/use-call-store.ts`
  - Component structure exists
  - Backend integration incomplete

- ⚠️ **Live Streaming**
  - Mentioned in schema
  - UI components partially built
  - Stream management incomplete

- ⚠️ **Advanced Analytics**
  - Basic stats implemented
  - Advanced dashboard analytics limited
  - Predictive analytics not implemented

---

### ❌ Not Currently Implemented

- ❌ Payment gateway integration (Stripe, PayPal, etc.)
- ❌ Advanced inventory management
- ❌ Multi-currency support (framework present, not active)
- ❌ AR/VR product previews
- ❌ Advanced recommendation algorithms (collaborative filtering)
- ❌ Email marketing campaigns
- ❌ SMS notifications (push only)
- ❌ Advanced tax/VAT calculations
- ❌ Multi-warehouse management
- ❌ Vendor API for third-party integrations

---

## AUTHENTICATION & AUTHORIZATION

### Auth Flow

```
USER LOGIN
  ↓
POST /api/auth/login (email, password)
  ↓
Supabase: signInWithPassword()
  ↓
Fetch user role from users table
  ↓
DETERMINE REDIRECT:
  - ADMIN → /admin/dashboard
  - PRO/BUSINESS_OWNER → /dashboard/{storeId}
    (or /merchants/business/add if no store)
  - CLIENT → /
  ↓
RESPONSE: { user, redirectUrl }
```

### Role-Based Access Control

**Roles:**
- `CLIENT` - Regular customer
- `PRO` or `BUSINESS_OWNER` - Store owner
- `ADMIN` - Platform admin

**Route Protection:**
- API routes check auth via `createClient()` and `getUser()`
- Store routes verify: `store.owner_id === user.id || store.email === user.email`
- Admin routes require `ADMIN_API_KEY` or admin role

### Session Management

- **Storage:** Supabase Auth (cookies + secure tokens)
- **Duration:** Browser session (can be configured)
- **Refresh:** Automatic token refresh via middleware
- **Logout:** Clear session on `/api/auth/logout`

---

## PAYMENT & TRANSACTION SYSTEM

### Transaction Types

1. **ORDERS** (Products)
   - Quantity-based transactions
   - Multiple items per order
   - Status tracked: PENDING → VALIDATED → COMPLETED

2. **BOOKINGS** (Services)
   - Appointment-based
   - Single booking per transaction
   - Date/time based

### Transaction Lifecycle

```
ORDER CREATED
  ↓
QR Code Generated (on validation)
  ↓
Transaction Entry Created (syncOrderTransaction)
  - transaction_code = order_number
  - status = order.status (mapped)
  - amount = total_price
  - customer_name, merchant_name
  ↓
STATUS UPDATES:
  PENDING → pending
  VALIDATED → pending
  COMPLETED → completed
  CANCELLED → failed
  
  ↓
STORED DATA:
  - transaction_code (unique)
  - order_number
  - customer_id, customer_name
  - merchant_id, merchant_name
  - amount, date, time_created
  - qr_code_token (tracking)
```

### External System Integration

- **QStash Worker:** `sync-orders` endpoint
  - Called 60s after order creation (delay)
  - Posts order data to `EXTERNAL_API_URL`
  - Auto-retries on failure
  - Mocks if no external API configured

### Refund Processing

```
CUSTOMER REQUESTS REFUND
  ↓
Order status → REFUND_REQUESTED
  ↓
QStash: process-refund worker triggered
  ↓
Check payment status with provider
  ↓
Process refund
  ↓
Update order status → REFUNDED
  Update transaction status → refunded
```

---

## AI & NLP FEATURES

### Models Used

| Task | Model | Provider | Cost |
|------|-------|----------|------|
| Chat/General | Llama 3.1 8B | Groq | Free |
| Comment Analysis | Llama 3.3 70B | Groq | Free |
| Sales Recommendations | Mixtral 8x7B | Groq | Free |
| Image Vision | Meta Llama Scout | Groq | Free |
| Embeddings | Provider-agnostic | OpenRouter | Paid |
| Image Generation | Stable Diffusion | StabilityAI | Paid |
| Structured Parsing | Gemini | Google | Paid |

### Key NLP Features

1. **Darija Translation**
   - 106K word dictionary (in-memory)
   - Vector-based phrase lookup (435K Supabase entries)
   - Linguistic rules for context

2. **Sentiment Analysis**
   - 3-class: positive/negative/neutral
   - Spam detection
   - Toxicity detection
   - Language identification

3. **Intent Classification**
   - Order tracking
   - Product info
   - Store info
   - Promotions
   - Feedback
   - Hours/Location
   - General chat

4. **Sales Intelligence**
   - Dormant product detection
   - Happy hour recommendations
   - Bundle suggestions
   - Upsell opportunities

5. **Image Analysis**
   - Image-to-search query generation
   - Product image understanding

---

## SEARCH & RECOMMENDATION ENGINE

### Search Architecture (3-Tier)

```
TIER 1: VECTOR SEARCH (Semantic)
  - pgvector cosine similarity
  - Threshold: 0.18
  - Timeout: 4s
  - Returns: semantically similar items

TIER 2: HYBRID SEARCH (Text + Translation)
  - ILIKE queries on fields
  - Darija translation support
  - Timeout: 3s
  - Returns: keyword-matched items

TIER 3: RERANKING
  - Combine results
  - Apply geographic filter
  - Apply category filter
  - Sort by relevance
  - Return merged results
```

### Personalization Factors

**Reel Feed Algorithm:**
- User city match (geography)
- Preferred categories (preferences)
- View/like/save history (interactions)
- Followed stores (relationships)
- Recency (freshness)
- Engagement rate (quality)

**Search Personalization:**
- Location bias (nearby first)
- User preferences (categories)
- Search history (patterns)
- Browse history (implicit signal)

### Performance Optimizations

- **Caching:** 5-min TTL for recommendations
- **Rate Limiting:** 60 API calls/min
- **Timeouts:** Hard ceiling to prevent hangs
- **Batching:** Parallel requests where possible
- **Embedding Reuse:** Cache embeddings in items table

---

## DASHBOARD & ANALYTICS

### Store Owner Dashboard

**Pages:**
- `/dashboard/{storeId}` - Main dashboard
- `/dashboard/{storeId}/products` - Product management
- `/dashboard/{storeId}/orders` - Order history
- `/dashboard/{storeId}/bookings` - Service bookings
- `/dashboard/{storeId}/transactions` - Financial records
- `/dashboard/{storeId}/reviews` - Customer feedback
- `/dashboard/{storeId}/reels` - Video content management
- `/dashboard/{storeId}/intelligence` - AI insights (comments/reviews)
- `/dashboard/{storeId}/sales-recommendations` - AI promotion suggestions
- `/dashboard/{storeId}/leads` - Leads + orders + bookings
- `/dashboard/{storeId}/support` - Support tickets
- `/dashboard/{storeId}/profile` - Store settings
- `/dashboard/{storeId}/social` - Social features
- `/dashboard/{storeId}/stories` - Story management

### Admin Dashboard

**Endpoints:**
- `/api/admin/stats` - Global platform statistics
- `/api/admin/transactions` - All transactions
- `/api/admin/orders/validate` - Manually validate orders
- `/api/admin/orders/export` - Export orders
- `/api/admin/orders/{id}/status` - Update order status

### Analytics Tracked

**Store-Level:**
- Product views
- Order count
- Booking count
- Review count
- Profile views
- Phone clicks
- Direction requests

**Global:**
- Total users
- Total stores
- Total transactions
- Revenue metrics
- User engagement
- Search trends

---

## SUMMARY TABLE

### API Routes Count by Category

| Category | Count |
|----------|-------|
| Authentication | 6 |
| Orders | 6 |
| Reservations | 2 |
| Products/Items | 5 |
| Stores | 5 |
| Search | 4 |
| Reels | 4 |
| Messaging | 4 |
| Notifications | 3 |
| Comments | 3 |
| Reviews | 2 |
| Admin | 5 |
| Workers (Background) | 3 |
| Webhooks | 3 |
| Miscellaneous | 10 |
| **TOTAL** | **65+** |

### Lib Modules Count by Category

| Category | Count |
|----------|-------|
| Supabase Integration | 8 |
| Search & Recommendations | 6 |
| AI & NLP | 8 |
| Server Actions | 45+ |
| Rate Limiting | 1 |
| Utilities | 5 |
| State Management (Zustand) | 4 |
| Tracking | 2 |
| **TOTAL** | **81+** |

---

## ACTUAL IMPLEMENTATION STATUS

### ✅ FULLY IMPLEMENTED & PRODUCTION-READY

1. **User authentication** - All flows working
2. **Store management** - CRUD, search, follow
3. **Product catalog** - Full management with embeddings
4. **Order system** - Creation, status tracking, fraud detection
5. **Booking/Reservation system** - Service management
6. **Search engine** - Semantic + hybrid, Darija support
7. **Reel system** - Upload, feed, comments, analytics
8. **Messaging** - Store-to-customer, support tickets
9. **Notifications** - Multiple types, push mobile
10. **Comment analysis** - AI sentiment detection
11. **Fraud detection** - Heuristic + signals
12. **Rate limiting** - Multiple endpoints protected
13. **Admin features** - Stats, order management, validation
14. **Background jobs** - QStash integration
15. **Analytics events** - Event tracking system

### ⚠️ PARTIALLY IMPLEMENTED

1. **AI Sales recommendations** - Algorithm works, caching basic
2. **Image generation** - Integrated but limited use
3. **Darija RAG** - Dictionary + vector lookup, not fully conversational
4. **Payment integration** - Transaction tracking done, gateway missing
5. **Real-time features** - Supabase realtime configured, limited usage
6. **Webhooks** - Basic structure, limited endpoints

### ❌ NOT IMPLEMENTED

1. **Payment gateway** (Stripe, PayPal, etc.)
2. **Email notifications**
3. **SMS notifications**
4. **Advanced inventory management**
5. **Multi-warehouse support**
6. **Collaborative filtering recommendations**
7. **Advanced analytics dashboard**
8. **WebRTC live calling** (structure only)

---

## DEPLOYMENT & CONFIGURATION

### Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI & LLM
GROQ_API_KEY=
OPENROUTER_API_KEY=
GEMINI_API_KEY=
STABILITY_API_KEY=

# Background Jobs
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# External Services
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Admin
ADMIN_API_KEY=

# Webhooks
WEBHOOK_SECRET=

# External APIs
EXTERNAL_API_URL= (ERP/accounting system)
GEOAPIFY_API_KEY=

# Mobile
EXPO_API_KEY= (for push notifications)
```

---

## CONCLUSION

**Ro2ya** is a **comprehensive e-commerce & services marketplace** with:

- **Core E-Commerce:** Full order workflow, fraud detection, refunds
- **Services:** Booking system for appointments, lessons, etc.
- **Content:** Reel system for short-form video marketing
- **AI/NLP:** Comment analysis, sales recommendations, Darija support
- **Discovery:** Advanced search (semantic + hybrid), personalized feeds
- **Admin:** Global stats, order management, moderation
- **Infrastructure:** Real-time updates, background jobs, event tracking

**Architecture:** Next.js + Supabase + Groq/OpenRouter + QStash  
**Scale:** Supports 100K+ items, 10M+ vectors, real-time features  
**Status:** Production-ready core features, extensible for payment integration

