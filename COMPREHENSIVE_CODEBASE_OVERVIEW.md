# ro2ya.tn - Comprehensive Codebase Overview

**Project**: ro2ya.tn - Tunisian Marketplace/Service Discovery Platform  
**Framework**: Next.js 14 (App Router) with TypeScript  
**Database**: Supabase (PostgreSQL)  
**Deploy**: Vercel  
**Date**: May 2026

---

## 📁 1. Directory Structure Overview

### Core Application Structure
```
app/
├── api/                          # REST API endpoints
├── auth/                         # Authentication pages
├── dashboard/[id]/               # Business owner dashboard
├── merchants/                    # Business discovery pages
├── profile/                      # User/business profiles
├── search/                       # Search results pages
├── discover/                     # Discovery feed
├── reels/                        # Reel/story viewing
├── login, /register              # Auth pages
├── messages/                     # Messaging interface
└── [other-routes]/               # Additional pages

lib/
├── actions/                      # Server Actions for DB ops (35+ files)
├── supabase/                     # Client/server setup & config
├── search/                       # Search pipeline modules
├── dashboard/                    # Dashboard utilities
├── store/                        # State management
├── ai/                          # AI utilities
├── utils/                       # Helper functions
└── [data files]/                # Darija corpus, mock data

components/
├── ui/                          # Radix UI components (40+)
├── dashboard/                   # Business dashboard sections
├── discover/                    # Discovery feed components
├── messaging/                   # Chat & messaging UI
├── profile/                     # Profile-related components
├── reservation/                 # Booking UI
├── checkout/                    # Purchase flow
└── [individual components]/     # Standalone components

types/
├── supabase.ts                  # Generated database types
├── business.ts                  # Business models
├── messaging.ts                 # Chat/message types
├── ai-agent.ts                  # AI types
└── index.ts                     # Exported types

public/                          # Static assets
supabase/                        # Database migrations
styles/                          # Global CSS
```

---

## 🔐 2. API Routes & Endpoints

### Authentication System (`/api/auth/`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Email/password authentication with role-based redirect |
| `/api/auth/signup` | POST | User registration |
| `/api/auth/verify` | POST | Email verification |
| `/api/auth/logout` | POST | Session termination |
| `/api/auth/magic-link` | POST | Passwordless login |
| `/api/auth/session` | GET | Session info |

**Key Logic**: Fetches user role → Redirects ADMIN to admin dashboard, PRO to store dashboard, CLIENT to home

### Business Management (`/api/stores/`)

```typescript
GET  /api/stores             // Search stores with query & location
GET  /api/stores/[id]        // Get store details
PATCH /api/stores/[id]       // Update store (ownership verified)
GET  /api/stores/me          // Get user's stores
GET  /api/stores/follow/[id] // Follow/unfollow
```

### Product & Service Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/items` | GET/POST | Product listings & creation |
| `/api/items/[id]` | PATCH/DELETE | Update/delete products |
| `/api/items/search` | GET | Search products |
| `/api/orders` | POST | Create order |
| `/api/orders/bulk` | POST | Bulk operations |
| `/api/reservations` | POST | Create booking |

### Discovery & Content

```
/api/reels                       // Reel management
/api/stories                     // Story content
/api/semantic-search             // ML-based search
/api/image-search               // Visual search
/api/suggestions/[category]     // Recommendations
/api/comments/[entity-id]       // Comments system
```

### Dashboard API (`/api/dashboard/[storeId]/`)

| Category | Endpoints |
|----------|-----------|
| **Account** | Settings, profile, subscription |
| **Intelligence** | Analytics, AI insights |
| **Products** | CRUD, inventory |
| **Services** | CRUD, calendar |
| **Transactions** | Order history, payment tracking |
| **Reviews** | Review management, responses |
| **Support** | Tickets, messaging |
| **Promotions** | Create/edit offers |
| **Reels** | Upload, manage videos |
| **Refunds** | Process returns |
| **Messages** | Internal messaging |
| **Sales-Recommendations** | AI-powered advisor |

### AI & Search

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Groq-powered AI assistant (streaming) |
| `/api/ai-agent` | POST | Conversational AI |
| `/api/semantic-search` | POST | Vector-based search |

### Support & Admin

```
/api/admin/                      // Admin dashboard
/api/support/tickets             // Ticket management
/api/notifications/              // Notification delivery
/api/webhooks/                   // Event webhooks
/api/workers/                    // Background jobs (QStash)
```

---

## 🎨 3. Components & Their Purposes

### Authentication Components
- **AuthCard** - Login/signup form wrapper
- **LoginForm** - Email/password input form
- **SignUpForm** - Registration form with validation
- **session-provider** - Auth context provider

### Discovery Feed (`/components/discover/`)
- **discover-feed.tsx** - Main infinite scroll feed
- **discover-card.tsx** - Individual reel/item card
- **feed-algorithm.ts** - Ranking algorithm (multi-signal)
- **DiscoverStoriesRow** - Horizontal story carousel
- **feed-overlay.tsx** - Full-screen reel viewer
- **useInfiniteFeed.ts** - Pagination hook

### Dashboard Components (`/components/dashboard/`)
- **AIAdvisorSection** - Sales analyzer recommendations
- **AccountSection** - Account settings
- **PromotionsSection** - Offer management
- **SupportMessagesSection** - Support messaging
- **DarijaAIPanel** - Darija language assistant

### Messaging (`/components/messaging/`)
- **ChatWindow** - Main chat interface
- **ChatMessage** - Message bubble
- **ConversationSidebar** - Conversation list
- **ChatHeads** - Floating chat windows
- **SupportChatDrawer** - Support chat modal

### Product Display
- **ProductCard** - Product grid item
- **ProductOrderCard** - Product with purchase action
- **ServiceCard** - Service offering display
- **ServiceBookingCard** - Service with reservation action

### Business Pages
- **BusinessImageGallery** - Photo carousel
- **BusinessItemsList** - Product/service list
- **BusinessReservationSidebar** - Booking interface
- **BusinessStories** - Story carousel
- **BusinessCommandSidebar** - Quick action menu

### Specialized Components
- **ReviewModal** - Review submission dialog
- **FavoriteButton** - Save/unsave action
- **FollowButton** - Store follow action
- **ShareBusinessButton** - Social share
- **CameraCapture** - Photo/video capture
- **StorageUploadDiagnostic** - Upload progress
- **SnapchatReels** - TikTok-like reel player
- **Hero** - Homepage hero section
- **Navbar** - Navigation header
- **Footer** - Page footer

---

## 📊 4. Data Models & Types

### User Models

```typescript
interface User {
  id: string;              // UUID from auth
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'CLIENT' | 'PRO' | 'ADMIN';
  city?: string;
  phone?: string;
  verified_at?: timestamp;
  subscription_plan?: 'free' | 'pro' | 'business';
}

interface UserPreferences {
  user_id: string;
  category: string;
  score: number;           // Preference strength
}
```

### Business & Store Models

```typescript
interface Store {
  id: number;
  name: string;
  owner_id: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  category: string;
  description?: string;
  phone?: string;
  website?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  id_business?: number;    // Link to directory
  business_directory_id?: number;
  created_at: timestamp;
}

interface Business {
  id: string;
  store_id?: number;
  owner_id?: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  isOpen?: boolean;
  location: { address, lat, lng };
  workingHours: { [day]: { open, close, closed } };
  photos?: string[];
}
```

### Product/Service Models

```typescript
interface Item {
  id: number;
  store_id: number;
  name: string;
  description?: string;
  type: 'product' | 'service';
  price: number;
  currency: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  category?: string;
  image_url?: string;
  embedding?: number[];     // Vector for search
  stock?: number;
  created_at: timestamp;
}

interface Promotion {
  id: number;
  store_id: number;
  title: string;
  description?: string;
  discount_percent?: number;
  valid_from: timestamp;
  valid_until: timestamp;
  active: boolean;
}
```

### Transaction Models

```typescript
interface Order {
  id: number;
  order_number: string;    // ORD-XXXXXX-XXXX
  store_id: number;
  customer_id: string;
  item_id: number;
  quantity: number;
  price: number;
  status: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  customer_name: string;
  customer_phone?: string;
  delivery_address?: string;
  created_at: timestamp;
}

interface Booking {
  id: number;
  booking_number: string;  // BK-XXXXXX-XXXX
  store_id: number;
  customer_id: string;
  item_id: number;         // Service ID
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  booking_date: date;
  booking_time: time;
  customer_name: string;
  customer_phone: string;
  notes?: string;
  price: number;
  created_at: timestamp;
}

interface Transaction {
  id: string;
  type: 'order' | 'booking';
  reference: string;       // order_number or booking_number
  customer_id: string;
  merchant_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  qr_code_token?: string;
  fraud_score?: number;
  fraud_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: timestamp;
}
```

### Social Models

```typescript
interface Review {
  id: number;
  store_id: number;
  item_id?: number;
  customer_id: string;
  rating: number;          // 1-5
  comment: string;
  owner_response?: string;
  responded_at?: timestamp;
  created_at: timestamp;
}

interface SavedPlace {
  id: number;
  user_id: string;
  store_id: number;
  created_at: timestamp;
}

interface Friendship {
  id: number;
  user_id: string;
  friend_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  created_at: timestamp;
}

interface StoreFollow {
  id: number;
  user_id: string;
  store_id: number;
  created_at: timestamp;
}
```

### Content Models

```typescript
interface Reel {
  id: number;
  store_id: number;
  media_url: string | string[];  // JSON array or single
  media_type: 'image' | 'video';
  title?: string;
  subtitle?: string;
  category?: string;
  item_id?: number;
  cta_type?: 'call' | 'whatsapp' | 'view';
  cta_value?: string;
  embedding?: number[];
  created_at: timestamp;
}

interface ReelStats {
  id: number;
  reel_id: number;
  views: number;
  likes: number;
  saves: number;
  shares: number;
}

interface Story {
  id: number;
  store_id: number;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  author_id: string;
  is_approved: boolean;
  views_count: number;
  expires_at: timestamp;     // Auto-delete after 24-48 hours
  created_at: timestamp;
}

interface Comment {
  id: number;
  entity_type: 'reel' | 'story' | 'review';
  entity_id: number;
  author_id: string;
  content: string;
  parent_id?: number;        // For nested comments
  created_at: timestamp;
}
```

### Support Model

```typescript
interface SupportTicket {
  id: string;
  ticket_number: number;
  store_id: number;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  subject: string;
  description?: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  channel: 'chat' | 'phone';
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Notification Model

```typescript
interface Notification {
  id: string;
  user_id: string;
  title: string;
  description?: string;     // Truncated to 10 words
  type: 'ORDER' | 'MESSAGE' | 'SYSTEM' | 'BOOKING' | 'SUPPORT' | 'AI_RECOMMENDATION';
  link?: string;
  is_read: boolean;
  metadata?: any;
  created_at: timestamp;
}
```

---

## 🔑 5. Authentication & Authorization Patterns

### Authentication Flow

```
1. User enters email/password
2. Supabase Auth returns JWT token + user data
3. API fetches user's role from 'users' table
4. Role-based redirect:
   - ADMIN → /admin/dashboard
   - PRO/BUSINESS_OWNER → /dashboard/[storeId]
   - CLIENT → /
```

### Authorization Checks

**Pattern**: Ownership Verification
```typescript
// Example from orders.ts
const { data: store } = await supabase
  .from('stores')
  .select('owner_id')
  .eq('id', data.store_id)
  .single();

if (store.owner_id === user.id) {
  throw new Error('Cannot order from own store');
}
```

### Access Control Patterns

| Feature | Check | Method |
|---------|-------|--------|
| Store Editing | Owner ID matches user | `.eq('owner_id', user.id)` |
| Order Creation | User ≠ store owner | Ownership verification |
| Booking Creation | User ≠ store owner + Fraud analysis | Same + fraud scoring |
| Review Access | Published by reviewer | `.eq('customer_id', user.id)` |
| Support Tickets | User = ticket creator OR store owner | Dual check |
| Favorite Toggle | Owner verification | ForeignKey RLS |

### Rate Limiting

```typescript
// From auth.ts
const ipAddress = headersList.get('x-real-ip') || '127.0.0.1';
const rateLimitResult = await rateLimit(ipAddress);

if (rateLimitResult.limited) {
  return { error: `Too many attempts. ${formatRetryAfter(rateLimitResult.resetTime)}` };
}
```

### RLS (Row Level Security) Policies

- Notifications: Users see only their own
- Bookings/Orders: Users see their transactions
- Support Tickets: Users see their tickets, owners see store tickets
- Friendships: Users see their relationships

---

## 💾 6. Database Interactions & Query Patterns

### Server Actions Pattern

All database operations use **'use server'** directive with Supabase Client:

```typescript
'use server';
import { createClient } from '@/lib/supabase/server';

export async function createOrder(data) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Query & insert...
}
```

### Common Query Patterns

#### 1. **Get with Relations**
```typescript
const { data } = await supabase
  .from('items')
  .select(`
    *,
    stores:store_id(id, name, logo_url),
    reviews!items_id(rating, comment, author:customer_id(full_name))
  `)
  .eq('store_id', storeId);
```

#### 2. **Upsert (Create or Update)**
```typescript
const { data } = await supabase
  .from('items')
  .upsert({
    id: itemId || undefined,
    name, description, price,
    embedding,              // Vector
    updated_at: new Date().toISOString()
  });
```

#### 3. **Batch Operations**
```typescript
const { data } = await supabase
  .from('items')
  .insert(itemsArray)
  .select();
```

#### 4. **Order with Filtering**
```typescript
const { data } = await supabase
  .from('reels')
  .select('*')
  .eq('store_id', storeId)
  .order('created_at', { ascending: false })
  .limit(20);
```

#### 5. **Range Queries**
```typescript
const { data } = await supabase
  .from('stories')
  .select('*')
  .gt('expires_at', new Date().toISOString())  // Greater than
  .eq('is_approved', true);
```

### Caching Strategies

#### Query Cache (10-min TTL)
```typescript
// From search.ts
const CACHE_TTL_MS = 1000 * 60 * 10;
const queryCache = new Map<string, CacheEntry>();

// Check cache before query
const cached = queryCache.get(queryKey);
if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
  return cached.data;
}
```

#### Sales Recommendation Cache (5-min)
```typescript
// From sales-analyzer.ts
const CACHE_TTL = 5 * 60 * 1000;
const RECOMMENDATION_CACHE = new Map();

function getFromCache(storeId) {
  const cached = RECOMMENDATION_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
}
```

### Vector Search (Embeddings)

```typescript
// Generate embedding for semantic search
const embedding = await generateEmbedding(text);

// Store embedding
await supabase.from('items').upsert({ embedding });

// Search with vector distance
const { data } = await supabase.rpc('match_items_by_embedding', {
  query_embedding: userQueryEmbedding,
  similarity_threshold: 0.7,
  match_count: 10
});
```

---

## ⚙️ 7. Business Logic & Workflows

### Order Workflow

```
1. User clicks "Order" button
   ↓
2. Check authentication (throw if not logged in)
   ↓
3. Verify store exists & user is NOT owner
   ↓
4. Check for existing PENDING orders (prevent duplicates)
   ↓
5. Generate unique order number (ORD-XXXXXX-XXXX)
   ↓
6. Insert into 'orders' table with status=PENDING
   ↓
7. Sync to 'transactions' table
   ↓
8. Run FRAUD ANALYSIS (async)
   ↓
9. Create NOTIFICATION for store owner
   ↓
10. Publish QStash event (background job)
    ↓
11. Return confirmation
```

**Error Prevention**:
- Duplicate order detection
- Ownership checks
- Authentication validation
- Fraud scoring

### Booking/Reservation Workflow

```
1. User selects service + date/time
   ↓
2. Similar to order: Auth → Ownership → Duplicates
   ↓
3. Generate booking number (BK-XXXXXX-XXXX)
   ↓
4. Insert with status=PENDING
   ↓
5. Sync to transactions
   ↓
6. Run FRAUD ANALYSIS
   ↓
7. Check store availability (optional calendar logic)
   ↓
8. Notify store owner
   ↓
9. Confirm to customer
```

### Review Submission Workflow

```
1. User submits review (rating 1-5, comment 3+ chars)
   ↓
2. Validate input
   ↓
3. Check store_id provided OR create SHADOW STORE
   └─ If businessId from directory:
      └─ Fetch from 'business_directory_tunisia'
      └─ Auto-create store entry with status=PENDING
   ↓
4. Verify customer completed transaction (if required)
   ↓
5. Insert review record
   ↓
6. Update store rating average
   ↓
7. Notify store owner
```

### Discovery Feed Algorithm

```typescript
// Multi-signal ranking system
Algorithm:
  1. Fetch user signals:
     - Preferred categories (scored)
     - Recent interactions (likes, saves, views)
     - City location
     - Search history keywords
     - Followed stores

  2. Fetch candidate reels (all recent)
  
  3. Score each reel:
     - Category match: +1-50 points
     - Store follow: +30 points
     - City match: +20 points
     - Keyword search history match: +15 points
     - Engagement metrics: views/likes ratio
  
  4. Rank by score (descending)
  
  5. Paginate (infinite scroll)
```

### Search Pipeline

```
User Query (Darija/Arabic/French)
  ↓
1. NORMALIZE: lowercase, remove diacritics, expand abbreviations
  ↓
2. DICTIONARY: Translate Darija terms to French/English
  ↓
3. CACHE: Check LRU query cache (10-min TTL)
  ↓
4. VECTOR: Generate embedding via OpenRouter
  ↓
5. HYBRID: Run both:
   a) Vector similarity search (semantic)
   b) Keyword search (lexical)
  ↓
6. RERANK: Combine results with BM25-style scoring
  ↓
7. FILTER: Category, city, status
  ↓
8. RETURN: Top 20 results with metadata
```

### Fraud Detection Workflow

```typescript
For each transaction (order/booking):
  1. Analyze customer history:
     - Previous orders/bookings (count, value)
     - Average transaction value
     - Geographic patterns
     - Time patterns (rapid successive orders)
  
  2. Analyze transaction:
     - Amount vs average (+50% flag)
     - New customer flag
     - High-value items flag
  
  3. Score result:
     - LOW (< 30)
     - MEDIUM (30-70)
     - HIGH (> 70)
  
  4. Store fraud_analysis record
     - score, level, reasoning
     - Associated with order/booking
  
  5. Alert if HIGH:
     - Store owner notification
     - Order flagged for review
```

### Sales Analyzer (AI Advisor)

```
Store Owner requests recommendations:
  ↓
1. Fetch sales data (5-min cache):
   - Items with views/sales/bookings
   - Recent orders (quantity, price)
   - Recent bookings
  
  2. Analyze patterns:
     - Dormant products (high views, low sales)
     - Happy hours (peak times)
     - Bundle opportunities (frequently bought together)
     - Upsell recommendations
  
  3. Generate via Groq LLM:
     - Type: dormant_product | happy_hour | bundle | upsell
     - Title & description
     - Suggested action
     - Target items & discount %
     - Urgency level
     - Estimated impact
  
  4. Cache result (5 min)
  
  5. Display in Dashboard Intelligence tab
```

### Support Ticket Lifecycle

```
1. Customer submits support request:
   - Select store
   - Subject + description
   - Priority (low/medium/high/critical)
   - Channel (chat/phone)

2. Generate ticket_number (auto-increment)

3. Create notification for store owner

4. Store owner can:
   - Change status (open → in_progress → waiting_customer → resolved → closed)
   - Add notes
   - Assign to staff
   - Close with resolution

5. Customer notified of updates

6. Analytics: Track response time, resolution rate
```

### Favorites (Saved Places) Workflow

```
Toggle Save:
  1. User clicks heart icon on business
  2. Check if already saved:
     - Yes: DELETE from saved_places
     - No: INSERT into saved_places
  3. Return { saved: boolean }
  4. Update UI optimistically

Get Favorites:
  1. Fetch all saved_places for user
  2. Hydrate with store details
  3. Include ratings, reviews, distance
  4. Display as grid/list
```

### Messaging System

```
Friendships → Conversations → Messages

1. Friend Request:
   - sendFriendRequest(receiverId)
   - Creates friendship with status=PENDING

2. Accept Request:
   - acceptFriendRequest(senderId)
   - Updates friendship to status=ACCEPTED

3. Send Message:
   - Store in messages table
   - Create notification
   - Broadcast via Realtime subscription

4. Chat UI:
   - Load conversation history
   - Subscribe to new messages
   - Support audio calls (via CallOverlay)
```

### Story/Reel Expiration

```
Stories:
  - Set expires_at to now + 24-48 hours
  - Query only: .gt('expires_at', now)
  - Auto-delete via database policy or cron job

Reels:
  - No expiration
  - Stored indefinitely
  - Can be archived/deleted by owner
```

---

## 🔄 Integration Summary

### Data Flow Example: Product Purchase

```
Frontend (ProductCard)
  ↓ User clicks "Order"
  ↓
Server Action (createOrder)
  ├→ Auth validation
  ├→ Duplicate prevention
  ├→ Generate ORD-XXXXXX-XXXX
  ├→ Insert into orders table
  ├→ Sync to transactions
  ├→ Fraud analysis (Groq/ML)
  ├→ Create notification
  └→ QStash event (background job)
  ↓
API Route (for analytics)
  ├→ Log user activity
  ├→ Update store stats
  └→ Trigger alerts if needed
  ↓
Dashboard (for store owner)
  ├→ New order notification
  ├→ Order appears in transactions list
  ├→ Stats updated (revenue, orders, conversion)
  └→ Can mark as SHIPPED, COMPLETED, or CANCELLED
```

### Data Flow Example: Search

```
User enters search query
  ↓
normalizationPipeline (Darija)
  ↓
dictionaryTranslation (Darija → French)
  ↓
cacheCheck (10-min LRU)
  ↓ (Miss)
embeddingGeneration (OpenRouter)
  ↓
vectorSearch (Supabase pg_vector)
  + keywordSearch (Full-text search)
  ↓
rerankingAlgorithm
  ↓
filterByCategory/City/Status
  ↓
cacheStore (5-min TTL)
  ↓
Return top 20 results with metadata
  ↓
logSearchActivity (for recommendations)
```

---

## 📝 Features by Module

### Users & Authentication
- ✅ Email/password signup
- ✅ Email verification
- ✅ Magic link login (passwordless)
- ✅ Role management (CLIENT/PRO/ADMIN)
- ✅ Subscription plans
- ✅ Profile management
- ✅ Password reset

### Stores & Businesses
- ✅ Business registration
- ✅ Profile creation & editing
- ✅ Operating hours setup
- ✅ Gallery management
- ✅ Store followers
- ✅ Store verification (QR code)
- ✅ Status tracking (PENDING/ACTIVE/SUSPENDED)

### Products & Services
- ✅ Inventory management
- ✅ Pricing & discounts
- ✅ Stock tracking
- ✅ Image gallery
- ✅ Vector embeddings for search
- ✅ Category tagging
- ✅ Availability status

### Orders & Bookings
- ✅ Product orders with status tracking
- ✅ Service booking with date/time
- ✅ Duplicate prevention
- ✅ Unique order/booking numbers
- ✅ QR code generation
- ✅ Fraud detection & scoring
- ✅ Transaction syncing

### Reviews & Ratings
- ✅ 1-5 star ratings
- ✅ Text reviews (3+ chars)
- ✅ Owner responses
- ✅ Shadow store creation (for directory items)
- ✅ Review moderation
- ✅ Rating aggregation

### Favorites & Social
- ✅ Save favorite businesses
- ✅ Store following
- ✅ Friend requests
- ✅ Messaging between users
- ✅ Share business links
- ✅ Social recommendations

### Discovery & Search
- ✅ Semantic search (vector embeddings)
- ✅ Keyword search
- ✅ Image search
- ✅ Darija/Arabic support (dictionary)
- ✅ Location-based filtering
- ✅ Category filtering
- ✅ Search history tracking
- ✅ Personalized recommendations

### Content (Reels & Stories)
- ✅ Reel upload (image/video)
- ✅ Story creation (24-48h expiration)
- ✅ View tracking
- ✅ Like/save/share metrics
- ✅ CTA buttons (call, WhatsApp, view)
- ✅ Auto-expiration policy
- ✅ Comments system

### Dashboard (Business Owner)
- ✅ Overview/home with KPIs
- ✅ Product management
- ✅ Service management
- ✅ Transaction history
- ✅ Lead management
- ✅ Review responses
- ✅ Support ticket system
- ✅ Refund management
- ✅ Promotion creation
- ✅ Reel/story upload
- ✅ AI Sales Advisor (Groq-powered)
- ✅ Analytics & insights

### Support & Notifications
- ✅ Support ticket creation
- ✅ Priority levels (low/medium/high/critical)
- ✅ Status tracking (open/in_progress/resolved/closed)
- ✅ In-app notifications
- ✅ Email notifications
- ✅ Push notifications (mobile-ready)
- ✅ Notification preferences

### AI Features
- ✅ Groq LLM chat (sub-second)
- ✅ Sales advisor (promotion recommendations)
- ✅ Semantic embeddings
- ✅ Fraud detection
- ✅ Darija language support
- ✅ Personalized recommendations

### Admin Dashboard
- ✅ Platform statistics
- ✅ User management
- ✅ Store verification
- ✅ Transaction monitoring
- ✅ Fraud alerts
- ✅ Content moderation
- ✅ Revenue tracking

---

## 🚀 Key Technical Implementations

### Real-time Features
- Supabase Realtime subscriptions
- Live notification streaming
- Chat message updates
- Order status updates

### Performance Optimizations
- 10-min query cache (LRU eviction)
- 5-min sales recommendation cache
- Vector embeddings for fast search
- Lazy loading in infinite scroll
- ISR (Incremental Static Regeneration)
- Image optimization

### Security
- Supabase JWT authentication
- Row-level security (RLS)
- CSRF protection (origin validation)
- Rate limiting (IP-based)
- Ownership verification on mutations
- Input validation
- SQL injection prevention

### Error Handling
- French error messages (localized)
- Graceful fallbacks
- Retry logic with exponential backoff
- Fraud analysis error handling
- API error responses (400, 401, 403, 500)

### Monitoring & Analytics
- User activity logging
- Search history tracking
- View tracking (reels, stories)
- Transaction logging
- Fraud analysis storage
- Performance metrics

---

## 🛠️ Development Utilities

### Mock Data
- `mock-data.ts` - Small test dataset
- `mock-data-10k.ts` - Large dataset for load testing

### Darija Language Support
- `darija-dictionary.ts` - Main dictionary
- `darija-corpus-1.json` to `darija-corpus-4.json` - Extended corpus
- `darija-dictionary.test.ts` - Unit tests

### Testing
- TypeScript strict mode
- Validation schemas
- Error boundary components
- Debug logging utilities

### Rate Limiting
- `lib/rate-limit.ts` - IP-based rate limiting
- Configurable limits per endpoint
- Retry-After header support

---

## 📚 Key Files Reference

| Category | Key Files |
|----------|-----------|
| **Auth** | `lib/actions/auth.ts`, `app/api/auth/*` |
| **Stores** | `lib/actions/stores.ts`, `app/api/stores/*` |
| **Products** | `lib/actions/items.ts`, `app/api/items/*` |
| **Orders** | `lib/actions/orders.ts`, `app/api/orders/*` |
| **Bookings** | `lib/actions/reservation.ts`, `app/api/reservations/*` |
| **Reviews** | `lib/actions/reviews.ts` |
| **Search** | `lib/actions/search.ts`, `lib/search/*` |
| **Recommendations** | `lib/actions/recommendations.ts` |
| **Reels** | `lib/actions/reels.ts`, `app/api/reels/*` |
| **Stories** | `lib/actions/stories.ts`, `app/api/stories/*` |
| **Chat** | `app/api/chat/`, `lib/actions/ai-agent.ts` |
| **Support** | `lib/actions/support.ts`, `app/api/dashboard/[storeId]/support/` |
| **Notifications** | `lib/actions/notifications.ts` |
| **Transactions** | `lib/actions/transactions.ts` |
| **Admin** | `lib/actions/admin.ts`, `app/api/admin/*` |
| **Types** | `types/*` |
| **Supabase** | `lib/supabase/*` |
| **UI** | `components/*` |

---

## 🔗 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Pages      │  Components  │  Hooks       │   Stores     │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │ (fetch, server actions)
┌────────────────────────▼────────────────────────────────────────┐
│                  SERVER LAYER (Next.js)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Server Actions (lib/actions/*.ts)                          │ │
│  │ - Authentication, Orders, Reviews, etc.                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ API Routes (app/api/*)                                    │ │
│  │ - REST endpoints, auth, dashboard, workers                │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │ (SQL, realtime)
┌────────────────────────▼────────────────────────────────────────┐
│         SUPABASE (PostgreSQL + Auth + Realtime)                │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐ │
│  │  Users   │  Stores  │  Items   │ Orders   │  Reviews     │ │
│  │  Auth    │  Stories │ Bookings │ Reels    │  Support     │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘ │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐ │
│  │  Vectors │ Messages │ Reels    │ Fraud    │ Notifications│ │
│  │ (pg_vec) │          │ Stats    │ Analysis │              │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘ │
└────────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌─────────────┐ ┌──────────┐   ┌──────────┐
   │ OpenRouter  │ │ Groq LLM │   │ QStash   │
   │ (Embeddings)│ │ (Chat)   │   │ (Workers)│
   └─────────────┘ └──────────┘   └──────────┘
```

---

## 🎯 Summary

**ro2ya.tn** is a comprehensive full-stack marketplace platform for Tunisia with:

1. **Multi-role system**: Customers, Business Owners, Admins
2. **Rich content**: Products, services, reels, stories, reviews
3. **Smart discovery**: Semantic search, recommendations, personalization
4. **Transactions**: Orders, bookings, payments with fraud detection
5. **Communication**: Messaging, support tickets, notifications
6. **AI integration**: Groq-powered chat, recommendations, analysis
7. **Analytics**: Sales advisor, business intelligence, fraud monitoring
8. **Modern tech**: Next.js 14, Supabase, TypeScript, Tailwind

The codebase demonstrates professional patterns: server actions, real-time subscriptions, caching strategies, security controls, error handling, and scalable architecture.
