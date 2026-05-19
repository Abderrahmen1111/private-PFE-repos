# ro2ya.tn - Visual Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Frontend Layer (React/Next.js 14)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Home    │  │ Discover │  │   Search    │  │ Business │  │ Dashboard  │ │
│  │  Page    │  │  Feed    │  │   Results   │  │ Profile  │  │ (Merchant) │ │
│  └──────────┘  └──────────┘  └─────────────┘  └──────────┘  └────────────┘ │
│                                                                               │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐                 │
│  │ Product  │  │ Service  │  │  Messaging  │  │  Reels   │                 │
│  │ Details  │  │ Booking  │  │ (Real-time) │  │ & Stories│                 │
│  └──────────┘  └──────────┘  └─────────────┘  └──────────┘                 │
│                                                                               │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  API Layer (Next.js 14 API Routes + Server Actions)         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────────────────┐   │
│  │ Auth APIs  │ │ Business API │ │ Order APIs │ │ Search & Discovery  │   │
│  │ (signup)   │ │ (CRUD stores)│ │ (orders)   │ │ (semantic search)   │   │
│  └────────────┘ └──────────────┘ └────────────┘ └─────────────────────┘   │
│                                                                               │
│  ┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────────────┐  │
│  │ Booking    │ │ Messaging    │ │ Analytics  │ │ AI Features          │  │
│  │ APIs       │ │ (Real-time)  │ │ Dashboard  │ │ (Sales Advisor, etc) │  │
│  └────────────┘ └──────────────┘ └────────────┘ └──────────────────────┘  │
│                                                                               │
│  ┌────────────┐ ┌──────────────┐ ┌────────────┐                            │
│  │ Review APIs│ │ Notification │ │ Admin APIs │                            │
│  │ (CRUD)     │ │ Delivery     │ │ (access)   │                            │
│  └────────────┘ └──────────────┘ └────────────┘                            │
│                                                                               │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Server Actions   │  │ Supabase Client  │  │ Authentication   │
│ (lib/actions/)   │  │ (lib/supabase/)  │  │ (JWT, Session)   │
│                  │  │                  │  │                  │
│ - orders.ts      │  │ - server.ts      │  │ - Roles & RLS    │
│ - reservation.ts │  │ - client.ts      │  │                  │
│ - search.ts      │  │ - auth.ts        │  │                  │
│ - profile.ts     │  │                  │  │                  │
│ - reviews.ts     │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                      │
        └──────────────────────┼─────────────────────┐
                               │                     │
                               ▼                     ▼
                   ┌─────────────────────┐  ┌──────────────────────┐
                   │  Supabase Database  │  │ State Management     │
                   │  (PostgreSQL)       │  │ (Zustand stores)     │
                   │                     │  │                      │
                   │ - users             │  │ - use-cart-store     │
                   │ - stores            │  │ - use-messaging-store│
                   │ - items (products)  │  │ - use-saves-store    │
                   │ - orders            │  │ - use-call-store     │
                   │ - bookings          │  └──────────────────────┘
                   │ - reviews           │
                   │ - transactions      │
                   │ - notifications     │
                   │ - reels             │
                   │ - etc...            │
                   └─────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Real-time Layer  │  │ Cache & Storage  │  │ AI & Search      │
│ (Subscriptions)  │  │ (Upstash Redis)  │  │ (OpenRouter,     │
│                  │  │                  │  │ Groq, Embeddings)│
│ - Messages       │  │ - Query cache    │  │                  │
│ - Notifications  │  │ - Session data   │  │ - Semantic search│
│ - Updates        │  │ - Rate limits    │  │ - Fraud analysis │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                      │                      │
        └──────────────────────┼─────────────────────┘
                               │
                               ▼
                   ┌─────────────────────┐
                   │ External Services   │
                   │ & Integrations      │
                   │                     │
                   │ - Cloudinary (CDN)  │
                   │ - Mapbox (Maps)     │
                   │ - Resend (Email)    │
                   │ - QStash (Workers)  │
                   └─────────────────────┘
```

---

## Data Model Relationships

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   auth.users    │ (Supabase managed)
                    │ (id, email)     │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        ┌─────────┐   ┌─────────┐   ┌──────────────┐
        │  users  │   │ stores  │   │ notifications│
        │ (profile)   └────┬────┘   └──────────────┘
        └─────────┘        │
                           ├─────────────────┬────────┐
                           │                 │        │
                           ▼                 ▼        ▼
                    ┌────────────┐    ┌──────────┐ ┌─────────┐
                    │   items    │    │ bookings │ │ orders  │
                    │(products & │    │          │ │         │
                    │ services)  │    └──────────┘ └────┬────┘
                    └────────────┘                      │
                           │                           │
                           │       ┌───────────────────┘
                           │       │
                           ▼       ▼
                    ┌─────────────────────┐
                    │   transactions      │ (Unified ledger)
                    └─────────────────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        ┌─────────┐   ┌──────────┐   ┌──────────┐
        │ reviews │   │  refunds │   │ comments │
        └─────────┘   └──────────┘   └──────────┘

┌──────────────────────────────┐
│     CONTENT & SOCIAL        │
├──────────────────────────────┤
│ reels ← reviews             │
│ stories ← saved_places      │
│ reel_stats ← user_interactions
│ user_interactions ← reel    │
│ friendships (bidirectional) │
│ store_follows              │
└──────────────────────────────┘

┌──────────────────────────────┐
│   ANALYTICS & TRACKING       │
├──────────────────────────────┤
│ page_views                  │
│ user_search_history         │
│ user_preferences            │
│ fraud_analysis              │
│ support_tickets             │
│ user_activity               │
└──────────────────────────────┘
```

---

## Key Data Flows

### Flow 1: Customer Order Journey

```
START
  │
  ├─→ Customer Searches
  │     ├─ Query normalized (darija-dictionary)
  │     ├─ Embeddings generated (OpenRouter)
  │     └─ Hybrid search: semantic + keyword
  │
  ├─→ Results Ranked & Personalized
  │     ├─ User preferences checked
  │     ├─ Distance/location considered
  │     ├─ Popular items ranked higher
  │     └─ Store rating factored in
  │
  ├─→ Customer Views Product/Store
  │     ├─ Fetch product details
  │     ├─ Fetch store profile
  │     ├─ Fetch reviews
  │     └─ Track view event
  │
  ├─→ Customer Creates Order
  │     ├─ Auth validation
  │     ├─ Store ownership check
  │     ├─ Duplicate prevention
  │     ├─ Generate order_number
  │     ├─ Insert order (PENDING)
  │     ├─ Decrement stock
  │     └─ Create transaction
  │
  ├─→ Fraud Analysis (Async)
  │     ├─ Check customer history
  │     ├─ Analyze order pattern
  │     └─ Risk score generated
  │
  ├─→ Notifications Created
  │     ├─ Store owner notified
  │     ├─ Customer receives confirmation
  │     └─ Sent via real-time subscription
  │
  └─→ ORDER CONFIRMED
      └─ Customer can track status
```

### Flow 2: Business Owner Dashboard Analytics

```
START
  │
  ├─→ Store Owner Logs In
  │     ├─ Auth check
  │     ├─ Fetch store profile
  │     └─ Load dashboard data
  │
  ├─→ Overview Dashboard
  │     ├─ Calculate KPIs
  │     │   ├─ Total orders (count)
  │     │   ├─ Total revenue (sum)
  │     │   ├─ Store views (count page_views)
  │     │   ├─ Average rating (avg from reviews)
  │     │   └─ Total reviews (count)
  │     │
  │     └─ Fetch Recent Data
  │         ├─ Last 5 orders
  │         ├─ Last 3 bookings
  │         ├─ Last 5 reviews
  │         └─ Recent messages
  │
  ├─→ AI Sales Advisor (Optional)
  │     ├─ Fetch all orders/bookings
  │     ├─ Analyze sales patterns (5-min cached)
  │     ├─ Identify opportunities
  │     │   ├─ Dormant products (no sales)
  │     │   ├─ Popular times (happy hours)
  │     │   ├─ Bundle opportunities
  │     │   └─ Upsell candidates
  │     │
  │     └─ Return recommendations
  │         ├─ "Create Bundle Deal"
  │         ├─ "Promote at Happy Hour"
  │         └─ Confidence scores
  │
  ├─→ Store Owner Takes Action
  │     ├─ Creates promotion
  │     ├─ Updates prices
  │     ├─ Adds products
  │     └─ Modifies availability
  │
  └─→ DASHBOARD UPDATES
      └─ Real-time metrics refresh
```

### Flow 3: Service Booking with Calendar

```
START
  │
  ├─→ Customer Searches Services
  │     ├─ Category filter
  │     ├─ Rating filter
  │     └─ Distance filter
  │
  ├─→ Customer Views Service
  │     ├─ Service details
  │     ├─ Price per slot
  │     ├─ Availability calendar
  │     ├─ Business hours
  │     └─ Reviews
  │
  ├─→ Customer Selects Date/Time
  │     ├─ Check business hours
  │     ├─ Check existing bookings
  │     ├─ Check stock/capacity
  │     └─ Calculate duration
  │
  ├─→ Customer Confirms Booking
  │     ├─ Auth validation
  │     ├─ Store ownership check
  │     ├─ Generate booking_number
  │     ├─ Insert booking (PENDING)
  │     ├─ Update availability
  │     └─ Create transaction
  │
  ├─→ Notifications Sent
  │     ├─ Store owner gets notification
  │     ├─ Customer gets confirmation
  │     └─ Calendar updated
  │
  ├─→ Business Owner Review
  │     ├─ See booking in dashboard
  │     ├─ Option to confirm/reject
  │     └─ Send message to customer
  │
  ├─→ Customer Arrives
  │     ├─ Service delivered
  │     └─ Transaction marked COMPLETED
  │
  ├─→ Post-Service
  │     ├─ Customer can review
  │     ├─ Review triggers sentiment analysis
  │     ├─ Store rating updated
  │     └─ Review visible on profile
  │
  └─→ CYCLE COMPLETE
```

### Flow 4: Review & Sentiment Analysis

```
START
  │
  ├─→ Customer Submits Review
  │     ├─ Rating (1-5 stars)
  │     ├─ Text review
  │     ├─ Photos (optional)
  │     └─ Timestamp
  │
  ├─→ AI Sentiment Analysis
  │     ├─ Text analyzed (comment-analyzer.ts)
  │     ├─ Sentiment: Positive/Neutral/Negative
  │     ├─ Keywords extracted
  │     └─ Score calculated
  │
  ├─→ Store Rating Updated
  │     ├─ Fetch all reviews for store
  │     ├─ Calculate average rating
  │     ├─ Update store.rating_average
  │     ├─ Update store.total_reviews
  │     └─ Re-rank store in search
  │
  ├─→ Shadow Store Created? (if needed)
  │     ├─ Check if store exists
  │     ├─ If not: create shadow store
  │     ├─ Link review to shadow store
  │     └─ Shadow stores visible with lower priority
  │
  ├─→ Notifications
  │     ├─ Store owner notified
  │     ├─ Review visible on profile
  │     └─ Customers see review in listings
  │
  ├─→ Store Owner Can Respond
  │     ├─ Add owner response
  │     ├─ Response timestamp
  │     └─ Notification sent to reviewer
  │
  └─→ CYCLE COMPLETE
```

### Flow 5: Real-time Messaging

```
CUSTOMER                          BACKEND                       STORE_OWNER
    │                                 │                              │
    ├─ Initiates Chat ──────────────→ │                              │
    │                                 ├─ Create message record        │
    │                                 ├─ Store in DB                  │
    │                                 ├─ Trigger real-time event      │
    │                                 ├─ Supabase Subscription ───────→ │
    │                                 │                              │
    │                                 │ ◄─ Store Owner Responds ──────┤
    │                                 │                              │
    │                                 ├─ Create message record        │
    │                                 ├─ Supabase Subscription ───────→ │
    │                                 │                              │
    └─ Receives Response ◄───────────┤                              │
    │                                 │                              │
    
ALL IN REAL-TIME (milliseconds) via Supabase Realtime Subscriptions
```

---

## Business Process Workflows in Plain Language

### Workflow 1: "New Customer Registration & First Order"

```
1. Customer arrives at home page
2. Sees trending products and featured collections
3. Clicks "Sign Up"
4. Enters email and password
5. Verifies email via magic link
6. Completes profile (name, photo, address)
7. Account created with role: CLIENT
8. Homepage now shows personalized recommendations
9. Customer searches "pizza" in Darija
10. Gets results ranked by rating and distance
11. Clicks on restaurant "Chez Ali"
12. Views menu, ratings, reviews
13. Adds 2 pizzas to cart
14. Proceeds to checkout
15. Enters delivery address and payment info
16. Confirms order
17. Gets order number and tracking
18. Store owner receives notification
19. Store owner marks order as "in preparation"
20. Order is delivered
21. Customer receives notification
22. Customer leaves 5-star review
23. Store rating improves (from 4.3 to 4.4)
```

### Workflow 2: "Business Owner Sets Up & Grows Store"

```
1. Business owner visits homepage
2. Clicks "Become a Merchant"
3. Registers with business email
4. Creates store profile:
   - Name: "Chez Ali"
   - Category: "Restaurant"
   - Description: "Traditional Tunisian food"
   - Phone & email
   - Operating hours
   - Address
5. Uploads store logo and banner
6. QR code generated for verification
7. Store created but status: "PENDING"
8. Owner adds first 5 products:
   - Maklouba
   - Pizza Margherita
   - Harira
   - Muffuletta
   - Sahlab
9. Each product has: name, price, photo, description
10. Verification approved (store status: ACTIVE)
11. Store now visible to customers
12. First day: 12 views, 0 orders
13. Week 1: 150 views, 8 orders, 2 bookings, 1 review (4 stars)
14. Owner logs into dashboard
15. Sees metrics:
    - 150 total views
    - 8 orders (revenue: 250 DT)
    - 2 bookings
    - Average rating: 4.0 stars
16. Owner consults AI Sales Advisor
17. AI says:
    - "Maklouba not selling - try a bundle with salad"
    - "Lunch peak is 12-1:30 PM - create happy hour 11-11:30"
18. Owner creates "Lunch Bundle" (Maklouba + Harira + drink) at 15 DT
19. Owner creates "Early Bird" promotion: 15% off 11-11:30 AM
20. Week 2: 280 views, 22 orders, 5 bookings, 8 reviews (4.3 stars)
21. Revenue doubled! Store trending
```

### Workflow 3: "Customer Discovers & Books Service"

```
1. Customer on homepage wants to book salon
2. Clicks "Discover" or searches "haircut near me"
3. System returns salons ranked by:
   - Rating (4.8 stars first)
   - Distance (closest first)
   - Popularity (most booked)
4. Customer clicks "Salon Fadwa"
5. Sees:
   - Photos, reviews, ratings
   - Available services (haircut, dyeing, treatment)
   - Prices per service
   - Availability calendar
6. Selects "Women's Haircut" - 80 DT
7. Picks date: Tomorrow, Friday
8. Picks time: 3:00 PM
9. System checks:
   - Salon open? Yes (9 AM - 8 PM)
   - Time slot available? Yes
   - Capacity? Yes (only 1 booking at 3 PM)
10. Customer confirms booking
11. Gets booking number: BK-234567-XYZQ
12. SMS & app notification sent
13. Salon owner sees new booking notification
14. Owner updates status: "CONFIRMED"
15. Salon owner sends message: "Welcome! We'll prepare your spot"
16. Customer receives message (real-time)
17. Customer clicks "Add to Calendar"
18. Booking synced to phone calendar
19. Day of booking: Customer gets reminder notification
20. Customer arrives at salon
21. Service completed
22. Customer submits review: "Excellent haircut! Very friendly staff"
23. Salon average rating changes: 4.7 → 4.8
24. Review visible on salon profile
25. Other customers see it and get confidence to book
```

---

## Critical Operations for Sequence Diagrams

### Operation 1: Order Creation
**Actors**: Customer, Backend, Database, AI Fraud Detector, Notification System

```
Sequence:
1. Customer submits order
2. Backend validates authentication
3. Backend checks store ownership (reject if customer owns store)
4. Backend checks for duplicate pending orders
5. Backend generates unique order number
6. Backend inserts order into database
7. Backend decrements product stock
8. Backend creates transaction record
9. [Async] AI runs fraud analysis
10. [Async] Notification queued to store owner
11. Response sent to customer with order_number
```

### Operation 2: Semantic Search
**Actors**: Customer, Search Engine, Embedding Generator, Vector DB, Ranker

```
Sequence:
1. Customer enters search query in Darija "برة كوسكوس"
2. Query normalized and translated to French
3. Embeddings generated via OpenRouter API
4. Vector search in Supabase against stored embeddings
5. Keyword search as fallback
6. Results combined from both methods
7. Reranker scores results (popularity, rating, distance)
8. Top 20 results returned
9. Frontend displays with store names, images, prices
```

### Operation 3: AI Sales Recommendations
**Actors**: Store Owner, Dashboard, Sales Analyzer, Database, Groq API

```
Sequence:
1. Store owner opens Dashboard Intelligence tab
2. Dashboard fetches all orders & bookings for store
3. Sales Analyzer processes data (5-min cached)
4. Groq API called with prompt:
   "Analyze these sales... What products need promotion?"
5. Groq returns recommendations in JSON
6. Dashboard displays:
   - "Dormant product alert: Maklouba"
   - "Suggest bundle with salad"
   - "Happy hour: 12-1 PM peak traffic"
7. Store owner clicks "Create Bundle"
8. New product created with linked items
```

---

## Key Metrics & Data Points to Track

### For Sequence Diagrams - What Changes State?

| Event | Before | After | Who Gets Notified |
|-------|--------|-------|------------------|
| **Order Created** | Item stock: 50 | Item stock: 49 | Store owner |
| **Booking Confirmed** | Slot: available | Slot: booked | Customer + Store |
| **Review Submitted** | Rating: 4.3 avg | Rating: 4.4 avg | Store owner |
| **Promotion Applied** | No discount | 20% discount | Store owner (tracking) |
| **Message Sent** | No messages | 1 new message | Recipient (real-time) |
| **Fraud Score High** | Order: PENDING | Order: FLAGGED | Admin |

---

## Diagram Creation Tips

1. **Use real actor names**: "Customer", "Restaurant Owner", "Pizza Shop", not "User", "Vendor"
2. **Include AI actors**: "Sales Advisor", "Fraud Detector", "Search Ranker"
3. **Show async operations**: Fraud analysis, notifications happen in background
4. **Use business terminology**: "Place Order", "Confirm Booking", "Submit Review"
5. **Include notifications**: Many flows end with someone getting notified
6. **Show decision points**: "Is customer the store owner?" → reject/accept
7. **Real time flows**: Show subscription/notification delivery
8. **Multi-language support**: Mention Darija search explicitly
9. **Show external services**: OpenRouter, Groq, Cloudinary calls
10. **Include error scenarios**: Duplicate orders, fraud flags, stock out

