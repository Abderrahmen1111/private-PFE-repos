# ro2ya.tn - Comprehensive Workspace Analysis

**Project**: Phantom Marketplace / ro2ya.tn  
**Type**: Next.js 14 Marketplace Platform for Tunisia  
**Purpose**: Connect customers with local businesses, products, and services  

---

## 1. FILE STRUCTURE & PURPOSE

### App Folder (Frontend Routes)

#### Authentication Pages
- **`app/auth/`**
  - `callback/` - OAuth callback handler
  - `update-password/` - Password reset flow
  - Purpose: Session management and credential updates

#### Business Pages
- **`app/merchants/`** - Business/Merchant detail pages
  - `business/` - Merchant store display page
  - `product/` - Individual product detail pages
  - `service/` - Individual service detail pages
  - Purpose: Public-facing business profile and product/service display

#### User Features
- **`app/dashboard/[id]/`** - Business owner dashboard (parametrized by store ID)
  - `page.tsx` - Dashboard home/overview
  - `intelligence/` - AI analytics and insights
  - `leads/` - Lead management
  - `products/` - Product management
  - `profile/` - Business profile settings
  - `reels/` - Video content management
  - `stories/` - Story/narrative content
  - `support/` - Support ticket management
  - `transactions/` - Transaction history
  - `social/` - Social features
  - `search/` - Dashboard search
  - Purpose: Complete business owner control panel

- **`app/profile/`** - User profile management
  - Purpose: Customer account settings and preferences

- **`app/discover/`** - Discovery feed
  - Purpose: Personalized product/service discovery (TikTok-like algorithm)

- **`app/login/`**, **`app/register/`** - Authentication pages

- **`app/shop/`** - Shopping pages
  - Purpose: Product browsing and checkout

- **`app/search/`** - Search results display

- **`app/reels/`** - Short-form video content

- **`app/messages/`** - Messaging interface

- **`app/valider/`** - Business validation/verification

#### API Routes (`app/api/`)
**Admin Management**
- `admin/` - Admin-only operations

**Authentication Endpoints**
- `auth/` - Login, signup, logout, magic-link, session management

**Core Business APIs**
- `stores/` - Store CRUD, search, update
- `items/` - Product/service listing CRUD
- `orders/` - Order creation and tracking
- `reservations/` - Booking/reservation management
- `reels/` - Reel management and discovery
- `comments/` - Comments system
- `stories/` - Story management

**AI & Search**
- `ai-agent/` - AI chat endpoint (Groq-powered)
- `semantic-search/` - ML-based semantic search
- `image-search/` - Visual search by image
- `darija-lookup/` - Darija language support

**User Interactions**
- `chat/` - Real-time messaging
- `notifications/` - Notification delivery
- `profile/` - User profile endpoints
- `friendships/` - Social connections

**Discovery & Recommendations**
- `suggestions/` - Recommendation engine
- `places/` - Location-based discovery
- `geo/` - Geolocation services

**Business Tools**
- `dashboard/[storeId]/` - Business-specific APIs
- `promotions/` - Promotion/offer management
- `cloudinary/` - Image upload integration

**Infrastructure**
- `webhooks/` - External webhook handlers
- `workers/` - Background job endpoints (QStash)
- `events/` - Event management

---

### Lib Folder (Backend Logic & Utilities)

#### Actions Directory (`lib/actions/`)
**Business Core Operations**
- `business.ts` - Business entity management, fetch businesses by ID
- `stores.ts` - Store CRUD, verification, owner checks
- `items.ts` - Product/service creation, updates, deletions
- `profile.ts` - User/business profile data fetching
- `addbuss.ts` - Add new business

**Transaction Management**
- `orders.ts` - Order creation, status updates, fraud prevention
- `reservation.ts` - Booking creation, calendar management
- `transactions.ts` - Transaction sync and reporting
- `refunds.ts` - Refund request processing
- `account_subscription.ts` - Subscription plan management

**Search & Discovery**
- `search.ts` - Semantic search pipeline (Darija, Arabic, French support)
- `recommendations.ts` - Personalized recommendations
- `reels.ts` - Reel CRUD and analytics
- `stories.ts` - Story management
- `favorites.ts` - Save/unsave places

**User Interactions**
- `reviews.ts` - Review submission and management
- `comments.ts` - Comments system
- `friendships.ts` - Friend requests
- `store-follows.ts` - Store followers
- `auth.ts` - Authentication flows with role-based redirects
- `users.ts` - User management

**Analytics & AI**
- `sales-analyzer.ts` - AI-powered promotion recommendations (Groq)
- `ai-agent.ts` - AI conversational responses
- `ai-notifications.ts` - AI-generated alerts
- `fraud-detection.ts` - Fraud scoring and analysis
- `analyzer-service.ts` - Analytics processing
- `alerts.engine.ts` - Alert system

**Support & Notifications**
- `support.ts` - Support ticket CRUD
- `notifications.ts` - Notification creation and delivery
- `user-activity.ts` - Activity logging

#### AI & Language (`lib/ai/`, `lib/agents/`)
- `lib/ai/comment-analyzer.ts` - Sentiment analysis for comments
- `lib/ai/darija-parser.ts` - Darija language parsing
- `lib/ai/image-generator.ts` - AI image generation
- `lib/agents/` - RAG agents for Darija support
- `lib/darija-dictionary.ts` - Darija/Arabic/French translation (4 corpus files)

#### Search Engine (`lib/search/`)
- `vector-search.ts` - Vector embedding search
- `hybrid-search.ts` - Keyword + semantic search
- `reranker.ts` - Result ranking and reordering
- `normalizer.ts` - Query normalization

#### Storage & Database (`lib/supabase/`)
- `server.ts` - Server-side Supabase client
- `client.ts` - Client-side Supabase client
- `auth.ts` - Authentication client
- `database.ts` - Database operations
- `admin.ts` - Admin operations
- `middleware.ts` - Auth middleware
- `realtime.ts` - Real-time subscriptions
- `storage.ts` - File storage operations

#### State Management (`lib/store/`)
- `use-cart-store.ts` - Shopping cart state (Zustand)
- `use-messaging-store.ts` - Messaging state
- `use-saves-store.ts` - Favorites/saves state
- `use-call-store.ts` - Call/phone interactions state

#### Utilities
- `lib/utils.ts` - General utilities
- `lib/storage.ts` - Local storage helpers
- `lib/upload.ts` - File upload helpers
- `lib/cloudinary.ts` - Cloudinary integration
- `lib/rate-limit.ts` - Request rate limiting
- `lib/session-utils.ts` - Session management
- `lib/openrouter-embeddings.ts` - OpenRouter API integration
- `lib/openrouter-service.ts` - OpenRouter LLM service
- `lib/groq-service.ts` - Groq LLM service
- `lib/suggestions.ts` - Recommendation suggestions
- `lib/dashboard/store-access.ts` - Dashboard access control

#### Data & Context
- `lib/context/UploadContext.tsx` - React context for upload state
- `lib/mock-data.ts`, `lib/mock-data-10k.ts` - Test data generators
- `lib/darija-corpus-[1-4].json` - Darija language datasets

---

## 2. KEY MODULES & COMPONENTS

### Real Actors in the System

#### 1. **Customer/Client**
- Browses products and services
- Searches using semantic search (including Darija)
- Discovers content via algorithm feed
- Creates orders for products
- Books services (make reservations)
- Writes reviews and rates
- Follows stores
- Saves favorites
- Engages with reels (short videos)
- Uses AI chat assistant
- Messages sellers

#### 2. **Business Owner/Merchant**
- Creates and manages store profile
- Adds products/services
- Manages inventory (stock)
- Creates promotional offers
- Views analytics dashboard
- Manages bookings/reservations calendar
- Responds to reviews
- Views transaction history
- Manages support tickets
- Creates video content (reels/stories)
- Accesses AI sales recommendations
- Monitors leads and inquiries
- Manages refunds
- Handles order fulfillment

#### 3. **Admin**
- Manages all businesses
- Reviews fraud cases
- Oversees transactions
- Content moderation
- System administration

---

## 3. DATA FLOW

### Main Data Sources
```
┌─────────────────────────────────────────┐
│     Supabase PostgreSQL Database        │
│  - Users, Businesses, Products/Items    │
│  - Orders, Bookings, Reviews            │
│  - Transactions, Support Tickets        │
│  - Analytics Events                     │
└──────────────────┬──────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐  ┌────▼───┐  ┌──────▼──────┐
│ Real-  │  │ Search │  │ Analytics   │
│ time   │  │Engine  │  │ Tracking    │
└────────┘  └────────┘  └─────────────┘
```

### Key Data Flows

#### Product Discovery Flow
1. Customer enters search query (Darija/Arabic/French supported)
2. Query normalized and translated via `darija-dictionary.ts`
3. Vector embeddings generated (OpenRouter API)
4. Hybrid search: semantic (vector) + keyword matching
5. Results ranked by `reranker.ts` (popularity, distance, ratings)
6. Personalized ordering based on user preferences and history
7. Store availability and status checked

#### Order Flow
```
Customer Views Product
    ↓
Customer Clicks "Order"
    ↓
Auth Check (must be logged in)
    ↓
Ownership Verification (can't order from own store)
    ↓
Duplicate Detection (prevent duplicate pending orders)
    ↓
Generate Order Number (ORD-XXXXXX-XXXX)
    ↓
Create Order with status: PENDING
    ↓
Fraud Analysis (async, async worker)
    ↓
Sync to Transactions Table
    ↓
Create Notification for Store Owner
    ↓
Decrement Product Stock
    ↓
Track Event in Analytics
```

#### Booking/Reservation Flow
```
Customer Selects Service & Date
    ↓
Customer Reviews Calendar Availability
    ↓
Auth Check & Store Ownership Verification
    ↓
Generate Booking Number (BK-XXXXXX-XXXX)
    ↓
Create Booking with status: PENDING
    ↓
Fraud Analysis (async)
    ↓
Sync to Transactions Table
    ↓
Send Notification to Store Owner
    ↓
Add to Business Booking Calendar
```

#### Business Dashboard Data Flow
```
Store Owner Logs In
    ↓
Fetch Store Profile & Metrics
    ↓
Calculate KPIs:
  - Total Orders
  - Total Revenue
  - Reviews & Ratings
  - Views & Clicks
    ↓
Fetch Related Data:
  - Pending Orders
  - Recent Bookings
  - Customer Reviews
  - Support Tickets
    ↓
AI Sales Advisor (optional):
  - Analyze Sales Patterns
  - Identify Dormant Products
  - Suggest Promotions
  - Recommend Bundles & Upsells
```

#### Review & Reputation Flow
```
Customer Completes Order/Booking
    ↓
Customer Submits Review + Rating
    ↓
Review Stored with Timestamp
    ↓
Sentiment Analysis (AI comment analyzer)
    ↓
Store Rating Recalculated
    ↓
Shadow Store May Be Created (if unverified)
    ↓
Notification Sent to Store Owner
    ↓
Review Visible on Store Profile
```

#### Real-time Messaging Flow
```
Customer Initiates Chat with Store
    ↓
Message Created in Database
    ↓
Supabase Realtime Subscription Triggered
    ↓
Store Owner Receives Live Notification
    ↓
Store Owner Responds
    ↓
Customer Receives Response (real-time)
```

---

## 4. USER WORKFLOWS & JOURNEYS

### Customer Journey: "Browse → Find → Book/Order"

#### Path 1: Product Purchase
1. **Arrive at Home** → See trending products, featured collections
2. **Search** → Use semantic search (natural language, images, Darija)
3. **Browse Results** → See products with pricing, ratings, images
4. **View Product** → See details, reviews, seller profile
5. **Add to Cart** → Select quantity
6. **Checkout** → Enter delivery address, payment info
7. **Confirm Order** → Get order confirmation, tracking
8. **Delivery & Review** → Receive product, write review

#### Path 2: Service Booking
1. **Discover Services** → Browse or search for services
2. **View Service Details** → Check prices, availability, reviews
3. **Select Date/Time** → Check business calendar
4. **Confirm Booking** → Review details, confirm
5. **Receive Confirmation** → Get booking number, details
6. **Attend Service** → Go to business location
7. **Rate Experience** → Leave review and rating

#### Path 3: Social Engagement
1. **Browse Reels** → Swipe through short-form video content (TikTok-like)
2. **Engage** → Like, comment, share
3. **Discover Businesses** → Click business to view profile
4. **Follow Store** → Track store for future updates

### Business Owner Journey: "Setup Store → Manage → Grow"

#### Path 1: Store Setup
1. **Sign Up** → Register as business owner
2. **Create Store Profile** → Name, description, category, images
3. **Add Contact Info** → Phone, email, website
4. **Set Operating Hours** → Define business hours
5. **Verify Business** → QR code verification or manual approval
6. **Store Goes Live** → Becomes visible to customers

#### Path 2: Daily Management
1. **Login to Dashboard** → See overview of metrics
2. **Manage Products** → Add/edit/delete products, prices, stock
3. **Manage Services** → Set availability calendar
4. **Review Bookings** → Approve/reject reservations
5. **Respond to Reviews** → Reply to customer feedback
6. **Answer Support Tickets** → Help customers
7. **Check Messages** → Respond to customer inquiries

#### Path 3: Growth & Optimization
1. **View Analytics Dashboard** → See traffic, conversions, popular items
2. **Create Promotions** → Set discounts, special offers
3. **Consult AI Sales Advisor** → Get recommendations:
   - Identify dormant (unsold) products
   - Suggest happy hour time slots
   - Recommend product bundles
   - Identify upsell opportunities
4. **Create Reels** → Upload short video content
5. **Monitor Reputation** → Track ratings and reviews
6. **Scale Business** → Based on data insights

---

## 5. REAL ACTORS & ROLES

### 1. **Customer (CLIENT role)**
- **Primary Goal**: Find and purchase products, book services
- **Permissions**: Browse, search, order, review, favorite
- **Dashboard Access**: Personal profile, order history, bookings
- **Features**:
  - Semantic search (Darija/Arabic/French)
  - Service booking with calendar
  - Product ordering with delivery
  - Review and rating system
  - Favorite/save functionality
  - Real-time messaging with sellers
  - AI chat recommendations

### 2. **Business Owner (PRO/BUSINESS_OWNER role)**
- **Primary Goal**: Manage store, sell products/services, grow business
- **Permissions**: Manage own store, view analytics, respond to reviews
- **Dashboard Access**: Full business dashboard
- **Features**:
  - Product/service management
  - Order and booking management
  - Analytics and KPIs
  - AI sales recommendations
  - Promotion creation
  - Review management
  - Support ticket handling
  - Customer messaging
  - Video content (reels/stories)
  - Transaction history

### 3. **Admin (ADMIN role)**
- **Primary Goal**: Oversee platform, ensure quality
- **Permissions**: Access all data, manage businesses, handle disputes
- **Dashboard Access**: Admin dashboard
- **Features**:
  - Business moderation
  - Fraud case review
  - Transaction oversight
  - Content moderation
  - User management

### 4. **System/AI Agent**
- **Role**: Provide recommendations and insights
- **Functions**:
  - AI Chat recommendations
  - Sales Advisor (Groq-powered)
  - Fraud detection
  - Sentiment analysis
  - Notification generation

---

## 6. MAIN FEATURES & FUNCTIONALITIES

### Core Features (MVP)

#### 1. **User Authentication & Management**
- Email/password signup
- Magic link authentication
- OAuth callbacks
- Role-based access (CLIENT, PRO, ADMIN)
- Profile management
- Session management

#### 2. **Business Management**
- Store creation and verification
- Product/service management
- Inventory tracking
- Business hours management
- Category classification
- Logo and gallery images
- Business directory integration

#### 3. **Product/Service Catalog**
- Create, read, update, delete (CRUD) products
- Price management
- Stock tracking
- Image gallery per product
- Product descriptions (multilingual support)
- Category tagging
- Status management (AVAILABLE, UNAVAILABLE, DISCONTINUED)

#### 4. **Search & Discovery**
- **Semantic Search**: Natural language search with AI understanding
- **Language Support**: Darija (Tunisian Arabic), Modern Arabic, French
- **Image Search**: Find products by uploading images
- **Filters**: By category, price, rating, distance
- **Vector Embeddings**: ML-powered search using OpenRouter
- **Query Caching**: 10-minute TTL for performance
- **Autocomplete Suggestions**: Real-time suggestions

#### 5. **Ordering System**
- Product browsing and selection
- Shopping cart management (Zustand store)
- Order creation with unique order numbers
- Inventory decrement on order
- Duplicate order prevention
- Order status tracking (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- Order number generation: `ORD-XXXXXX-XXXX`

#### 6. **Reservation/Booking System**
- Service browsing
- Calendar-based availability
- Booking creation with validation
- Booking number generation: `BK-XXXXXX-XXXX`
- Booking status tracking (PENDING → CONFIRMED → COMPLETED)
- No-show tracking
- Rescheduling capability

#### 7. **Review & Rating System**
- 5-star rating system
- Written reviews with moderation
- Sentiment analysis of reviews
- Owner responses to reviews
- Star rating aggregation (average calculation)
- Shadow store creation for unverified businesses
- Review pagination

#### 8. **Payment & Transaction Management**
- Order and booking transaction creation
- Transaction syncing to unified ledger
- Fraud analysis and scoring
- Refund request processing
- Transaction history viewing
- Revenue tracking

#### 9. **Analytics & Business Intelligence**
- Page view tracking
- User interaction tracking
- Conversion metrics (orders, bookings)
- Store KPIs (views, clicks, orders, revenue)
- Personalized recommendation engine
- User preference tracking by category

#### 10. **AI Features**
- **Groq-Powered Chat**: Fast LLM for product recommendations
- **Sales Advisor**: Analyzes sales data to suggest:
  - Promotions for dormant products
  - Happy hour time slots
  - Product bundles
  - Upsell opportunities
  - Price recommendations
- **Fraud Detection**: ML-based scoring for suspicious orders/bookings
- **Sentiment Analysis**: Analyze review sentiment
- **Embeddings**: OpenRouter for semantic search
- **Response caching**: 5-minute cache for sales recommendations

#### 11. **Notifications System**
- Event-based notifications
- Store owner notifications for:
  - New orders
  - New bookings
  - Customer reviews
  - Support messages
- AI-generated alerts
- Real-time delivery (Supabase Realtime)
- 10-word truncation for preview text

#### 12. **Real-time Messaging**
- Customer ↔ Store Owner messaging
- Chat heads (floating chat bubbles)
- Message bubbles in sidebar
- Real-time subscription updates
- Chat history persistence

#### 13. **Social Features**
- Follow/unfollow stores
- Friend requests and acceptance
- Store followers tracking
- User followers tracking

#### 14. **Content Management**
- **Reels**: Short-form video/image content (TikTok-like)
  - Media upload (single or multiple)
  - Price tagging
  - CTA buttons (call, WhatsApp, view)
  - Engagement metrics (views, likes, comments)
  - Comment system
- **Stories**: Ephemeral content with expiration
- **Comments**: On reels and reviews

#### 15. **Media & File Management**
- **Cloudinary Integration**: Image uploads, CDN delivery
- **QR Code Generation**: Business verification
- **Image Gallery**: Product and business images
- **Avatar Management**: User profile pictures

#### 16. **Business Analytics Dashboard**
- **Overview Tab**: KPIs and metrics
- **Products Tab**: Product performance
- **Services Tab**: Service bookings and cancellations
- **Transactions Tab**: Order and booking history
- **Leads Tab**: Inquiries and contact attempts
- **Reviews Tab**: Customer reviews and responses
- **Support Tab**: Help tickets and resolutions
- **Reels Tab**: Video content management
- **Intelligence Tab**: AI-powered insights and recommendations
- **Settings Tab**: Store and account configuration

#### 17. **Support System**
- Support ticket creation and tracking
- Ticket status management
- Priority levels
- Customer and business support

#### 18. **Promotional System**
- Create discount codes/promotions
- Set validity dates
- Apply discounts to orders
- Track promotion usage
- Seasonal promotions

#### 19. **Admin Features**
- User management
- Business moderation
- Fraud case review
- Transaction oversight
- Analytics reporting

#### 20. **Background Jobs & Async Processing**
- QStash integration for delayed jobs
- Webhook handlers
- Event processing
- Async fraud analysis
- Email notifications

---

## 7. TECHNICAL DATA FLOW ARCHITECTURE

### Request → Response Cycle (Typical Customer Order)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Frontend (React Component)                           │
│    - User clicks "Order Now" button                     │
│    - Collects: store_id, item_id, quantity, price     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Client-side Validation & State                       │
│    - Zustand store (use-cart-store)                    │
│    - Form validation via Zod                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 3. API Route Handler (app/api/orders/route.ts)         │
│    - Extract user from Supabase auth                   │
│    - Parse request body                                │
│    - Route to appropriate handler                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Server Action (lib/actions/orders.ts)              │
│    ├─ Auth check (user exists)                         │
│    ├─ Store ownership validation (not own store)       │
│    ├─ Duplicate order prevention (check PENDING)       │
│    ├─ Generate order number (ORD-XXXXXX-XXXX)         │
│    ├─ Insert order record                              │
│    └─ Trigger async operations                         │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴────────────┐
        │                      │
        ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│ Sync Operations  │   │ Async Operations │
├──────────────────┤   ├──────────────────┤
│ Decrement Stock  │   │ Fraud Analysis   │
│ Create Notif.    │   │ QStash Event     │
│ Sync Ledger      │   │ Email Send       │
└──────────────────┘   └──────────────────┘
        │                      │
        └─────────┬────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Supabase Operations                                  │
│    ├─ INSERT orders (with unique order_number)        │
│    ├─ INSERT transactions (ledger)                     │
│    ├─ UPDATE items (decrement stock)                   │
│    ├─ INSERT notifications                             │
│    └─ SELECT for response                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Response to Client                                  │
│    {                                                   │
│      "order_id": 12345,                                │
│      "order_number": "ORD-123456-ABCD",               │
│      "status": "PENDING",                              │
│      "total": 49.99,                                   │
│      "created_at": "2024-01-15T10:30:00"              │
│    }                                                   │
└─────────────────────────────────────────────────────────┘
```

### Multi-User Concurrent Scenario

```
Multiple Customers Ordering Same Product Simultaneously:

Customer A          Customer B          Customer C
    │                  │                   │
    └──────┬───────────┴─────┬────────────┘
           │                 │
           ▼                 ▼
      Supabase Auth    Supabase Auth
           │                 │
           └──────┬──────────┘
                  │
                  ▼
          Concurrent Orders
          (3x INSERT orders)
                  │
                  ├─→ Unique order_number check
                  │   (BK-XXXXXX-XXXX pattern)
                  │
                  ├─→ Stock Decrement
                  │   (atomic operation)
                  │
                  └─→ Each gets unique result
                      with different order_number
```

---

## 8. INTEGRATION POINTS & EXTERNAL SERVICES

### External APIs Used
1. **Supabase** - Database, Auth, Storage, Real-time
2. **Google Generative AI (Gemini)** - Image generation, content analysis
3. **OpenRouter** - Embeddings, LLM access (semantic search)
4. **Groq** - Fast LLM (chat, sales recommendations)
5. **Cloudinary** - Image upload, CDN, transformations
6. **Upstash QStash** - Job queue, delayed tasks
7. **Upstash Redis** - Caching, rate limiting
8. **Resend** - Email delivery
9. **Mapbox/Leaflet** - Maps and geolocation

### Webhooks & Events
- Supabase webhooks for database events
- QStash worker endpoints for async jobs
- Order completion webhooks
- Booking confirmation webhooks

---

## 9. BUSINESS LANGUAGE & TERMINOLOGY

### Key Business Concepts

| Concept | Definition | Real-World Meaning |
|---------|-----------|------------------|
| **Store/Business** | A merchant's profile | Restaurant, Shop, Salon, etc. |
| **Product/Item** | Physical goods for sale | Burger, Dress, Phone, etc. |
| **Service** | Time-based offering | Haircut, Oil Change, Consultation |
| **Order** | Customer purchase of product | "I ordered a burger for delivery" |
| **Booking/Reservation** | Customer reservation for service | "I booked a haircut at 3 PM" |
| **Reel** | Short-form video/image content | Instagram/TikTok post |
| **Story** | Ephemeral content (expires) | Snapchat/Instagram Stories |
| **Lead** | Customer inquiry or contact attempt | "Customer called about availability" |
| **Promotion** | Discount or special offer | "20% off on all items" |
| **Fraud Analysis** | Risk scoring of transaction | Detect suspicious orders |
| **Shadow Store** | Auto-created store from reviews | Store with no verified profile yet |
| **Sentiment Analysis** | Review tone classification | Positive, Negative, Neutral |

### Business Workflows in Plain Language

**Customer Discovers and Orders:**
1. "I search for pizza restaurants near me"
2. "I see Chez Ali with 4.8 stars and 156 reviews"
3. "I browse their menu and add items to cart"
4. "I confirm my order and pay"
5. "I track delivery in real-time"
6. "I receive my order and leave a review"

**Business Owner Grows Their Store:**
1. "I see that my marinated olives haven't sold in 2 weeks"
2. "The AI suggests I create a 'Bundle Deal' with cheese"
3. "I also see my peak hours are 12-1 PM and 7-8 PM"
4. "I create a 'Happy Hour' promotion for 4-5 PM"
5. "Within a week, I sell 15 more units of olives"

---

## 10. SEQUENCE DIAGRAM ACTOR MAPPING

### Primary Actors (for sequence diagrams)
1. **Customer** - Initiates searches, orders, bookings, reviews
2. **Business Owner** - Manages store, fulfills orders/bookings
3. **AI Agent** - Makes recommendations, detects fraud
4. **System/Backend** - Coordinates operations
5. **External Services** - Payments, embeddings, notifications
6. **Admin** - Oversees disputes and moderation

### Typical Sequence Patterns

```
Pattern 1: Simple Purchase Flow
Customer → Search System → Product Display → Order Creation → Notification

Pattern 2: Booking with Availability Check
Customer → Service Search → Calendar Check → Booking Validation → Confirmation

Pattern 3: AI Recommendations
Customer → AI Chat → Embedding Generation → Semantic Search → Ranking

Pattern 4: Business Growth with AI
Business Owner → Dashboard → Sales Analyzer → Recommendations → Action

Pattern 5: Fraud Prevention
Order Creation → Fraud Analysis Engine → Risk Scoring → Accept/Reject

Pattern 6: Review & Reputation
Customer → Submit Review → Sentiment Analysis → Store Rating Update
```

---

## Summary: Key Insights for Sequence Diagrams

### 1. **Two Main User Flows**
- **Consumer Flow**: Browse → Search → Order/Book → Review
- **Business Flow**: Setup → Manage → Grow → Analyze

### 2. **Critical Operations**
- Order/Booking creation (with validation, fraud check, notification)
- Search processing (semantic + keyword, multi-language)
- Dashboard analytics (fetch metrics, AI insights)
- Review submission (sentiment analysis, rating recalculation)

### 3. **Real Actors for Diagrams**
- **Customer** (with specific role/journey)
- **Merchant/Business Owner** (with operational goals)
- **AI System** (making autonomous decisions)
- **Backend/Database** (coordinating all operations)
- **Notification System** (keeping users informed)
- **External Services** (third-party integrations)

### 4. **Business Context**
- This is a marketplace connecting multiple sellers with many buyers
- Each business owner manages independent store
- Customers interact with multiple businesses
- AI enhances both customer discovery and business growth
- Real-time notifications keep everyone informed

### 5. **Language & Terminology**
- Use "Order" for product purchases
- Use "Booking" for service reservations
- Use "Store Owner/Merchant" instead of "Vendor"
- Use "Customer/Buyer" instead of "User"
- Use "Reel/Video Content" for short-form media
