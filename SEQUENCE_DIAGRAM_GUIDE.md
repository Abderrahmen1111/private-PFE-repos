# Sequence Diagram Creation Guide for ro2ya.tn

## Quick Reference: Real Actors & Business Language

### Primary Actors
1. **Customer** - Person buying products or booking services
2. **Store Owner** (or Merchant) - Business owner managing store
3. **Admin** - Platform administrator
4. **System/Backend** - All backend services combined
5. **AI Agent** - AI recommendation and fraud detection
6. **Notification Service** - Sends alerts to users
7. **External Service** - Groq, OpenRouter, Cloudinary, etc.

### Activities in Business Language

| Technical | Business Language |
|-----------|------------------|
| POST /api/orders | Customer places order |
| Decrement stock | Product inventory updated |
| Fraud analysis | Order security check |
| Send notification | Store owner alerted |
| upsertItem | Store owner adds/updates product |
| createBooking | Customer reserves service |
| submitReview | Customer shares experience |
| Sentiment analysis | AI evaluates customer feedback |

---

## Sequence Diagram Templates

### Template 1: Simple Product Purchase

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend
    participant Backend as Backend/Server
    participant DB as Database
    participant Notifications

    Customer->>Frontend: Searches for "pizza"
    Frontend->>Backend: Execute semantic search
    Backend->>DB: Query products & stores
    DB-->>Backend: Return results (ranked)
    Backend-->>Frontend: Display products
    Frontend-->>Customer: Show pizzerias near you

    Customer->>Frontend: Click "Order Now"
    Frontend->>Backend: Create order
    
    Backend->>DB: Validate store ownership
    alt Store Owner Check
        Backend->>Backend: ❌ Error: Can't order from own store
        Backend-->>Frontend: Show error
        Frontend-->>Customer: "Cannot order from your store"
    else Valid Customer
        Backend->>DB: Check duplicate orders
        Backend->>DB: Insert new order (PENDING)
        Backend->>DB: Decrement stock
        Backend->>DB: Create transaction record
        
        Backend->>Notifications: Send notification
        Notifications-->>Backend: Queued
        
        Backend-->>Frontend: Order created
        Frontend-->>Customer: Show confirmation (Order #ORD-123456-ABCD)
    end
```

### Template 2: Service Booking with Calendar

```mermaid
sequenceDiagram
    participant Customer
    participant App as Mobile/Web
    participant API as REST API
    participant Logic as Business Logic
    participant DB as Database
    participant Owner as Store Owner

    Customer->>App: Search "salon"
    App->>API: GET /api/places?category=salon
    API->>Logic: Search & rank salons
    Logic->>DB: Query salons, ratings
    DB-->>Logic: Results sorted
    Logic-->>API: Ranked results
    API-->>App: Display salons
    App-->>Customer: Show nearby salons

    Customer->>App: Click "Salon Fadwa"
    App->>API: GET /api/merchants/salon-fadwa
    API->>DB: Fetch salon profile, services
    DB-->>API: Profile, photos, calendar
    API-->>App: Display profile & calendar

    Customer->>App: Select "Women's Cut" on Friday 3 PM
    App->>API: POST /api/reservations
    
    API->>Logic: Validate booking
    Logic->>DB: Check auth user
    Logic->>DB: Check store ownership
    Logic->>DB: Check time slot availability
    Logic->>DB: Check business hours
    
    alt Validation Success
        Logic->>DB: Insert booking (PENDING)
        Logic->>DB: Create transaction
        Logic->>DB: Send notification to owner
        Logic-->>API: Booking confirmed
        API-->>App: Show confirmation
        App-->>Customer: Booking #BK-234567-XYZQ
        
        DB->>Owner: Notification received (real-time)
        Owner->>App: Opens dashboard
        Owner->>App: Confirms booking
    else Validation Failed
        Logic-->>API: Slot unavailable
        API-->>App: Show error
        App-->>Customer: "This time slot is booked"
    end
```

### Template 3: AI-Powered Sales Recommendations

```mermaid
sequenceDiagram
    participant Owner as Store Owner
    participant Dashboard
    participant API as Backend API
    participant Analyzer as Sales Analyzer
    participant Cache as Cache (5 min)
    participant GroqAPI as Groq API
    participant DB as Database

    Owner->>Dashboard: Opens "Intelligence" tab
    Dashboard->>API: GET /api/dashboard/[storeId]/sales-recommendations

    API->>Cache: Check if data cached
    
    alt Cache Hit (Fresh)
        Cache-->>API: Return cached recommendations
    else Cache Miss (or Expired)
        API->>Analyzer: Analyze sales patterns
        
        Analyzer->>DB: Fetch all orders (last 30 days)
        Analyzer->>DB: Fetch all bookings (last 30 days)
        DB-->>Analyzer: Return transactions
        
        Analyzer->>Analyzer: Process data:
        Analyzer->>Analyzer: - Find products with 0 sales
        Analyzer->>Analyzer: - Find peak traffic times
        Analyzer->>Analyzer: - Identify cross-sell opportunities
        Analyzer->>Analyzer: - Calculate price elasticity
        
        Analyzer->>GroqAPI: Send analysis request with data
        GroqAPI-->>Analyzer: Return AI recommendations
        
        Analyzer->>Cache: Store recommendations (5 min TTL)
        Analyzer-->>API: Return formatted response
    end

    API-->>Dashboard: Display recommendations
    
    Dashboard-->>Owner: Show:
    Dashboard-->>Owner: 💡 "Maklouba not selling - create a bundle"
    Dashboard-->>Owner: ⏰ "Peak hours: 12-1:30 PM - add happy hour"
    Dashboard-->>Owner: 📈 "Bundle with salad increases average order by 30%"

    Owner->>Dashboard: Clicks "Create Bundle"
    Dashboard->>API: POST /api/dashboard/[storeId]/products
    API->>DB: Insert new bundle product
    DB-->>API: Product created
    API-->>Dashboard: Success

    Dashboard-->>Owner: Bundle created! Monitor its performance
```

### Template 4: Review & Reputation System

```mermaid
sequenceDiagram
    participant Customer
    participant App
    participant API as Backend
    participant Analysis as AI Analysis
    participant DB as Database
    participant Owner as Store Owner

    Note over Customer: Order completed

    Customer->>App: Open completed order
    App->>App: Show "Leave Review" button
    Customer->>App: Click review button

    App->>App: Show review form:
    App->>App: - Star rating (1-5)
    App->>App: - Text review
    App->>App: - Photos (optional)

    Customer->>App: Submit review:
    Customer->>App: 5 stars, "Excellent!"

    App->>API: POST /api/reviews
    API->>DB: Insert review record
    API->>Analysis: Send review text for analysis

    Analysis->>Analysis: Sentiment analysis:
    Analysis->>Analysis: - Detect positive/negative
    Analysis->>Analysis: - Extract keywords
    Analysis->>Analysis: - Calculate confidence score

    Analysis-->>API: Return sentiment data
    API->>DB: Update review with sentiment score

    API->>DB: Fetch all reviews for store
    DB-->>API: Return all reviews (ratings)

    API->>API: Calculate:
    API->>API: - Average rating: 4.8 stars
    API->>API: - Total reviews: 156
    API->>API: - Sentiment ratio: 85% positive

    API->>DB: Update store profile:
    API->>DB: - rating_average: 4.8
    API->>DB: - total_reviews: 156

    API->>DB: Send notification to owner
    
    DB-->>Owner: Notification: "New 5-star review!"
    Owner->>App: Views dashboard
    Owner->>App: Reads review: "Excellent!"
    Owner->>App: Clicks reply button

    Owner->>App: Types response:
    Owner->>App: "Thank you so much! See you soon!"

    App->>API: POST /api/reviews/[reviewId]/response
    API->>DB: Store owner response
    API->>DB: Send notification to customer

    DB-->>Customer: Notification: "Owner replied to your review"
    Customer->>App: Reads owner response
    Customer->>App: Happy! Builds trust for next order
```

### Template 5: Real-time Messaging

```mermaid
sequenceDiagram
    participant Customer
    participant App1 as Customer App
    participant Backend
    participant Realtime as Supabase Realtime
    participant App2 as Owner Dashboard
    participant Owner

    Customer->>App1: Opens chat with "Chez Ali"
    App1->>App1: Initializes chat interface

    Customer->>App1: Types "Hi, do you have vegan options?"
    Customer->>App1: Clicks send

    App1->>Backend: POST /api/chat/messages
    Backend->>Backend: Create message object
    Backend->>Backend: {from: customer_id, to: store_id, text: "..."}
    
    Backend->>Realtime: Publish to channel: store_123
    Realtime->>App2: Real-time subscription triggered
    App2->>App2: New message notification sound 🔔
    
    App2-->>Owner: Message appears instantly
    
    Owner->>App2: Reads message
    Owner->>App2: Types response: "Yes! We have hummus, baba ganoush..."
    Owner->>App2: Sends message

    App2->>Backend: POST /api/chat/messages
    Backend->>Realtime: Publish to channel: customer_456
    
    Realtime->>App1: Real-time subscription triggered
    App1->>App1: Message notification 🔔
    App1-->>Customer: Message appears instantly
    
    Customer->>App1: Reads response
    Customer->>App1: Satisfied! Ready to order
```

### Template 6: Fraud Detection

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend
    participant OrderAPI as Orders API
    participant FraudEngine as Fraud Detection
    participant ML as ML Model
    participant DB as Database
    participant Admin

    Customer->>Frontend: Creates order for 500 DT
    Frontend->>OrderAPI: POST /api/orders

    OrderAPI->>OrderAPI: Basic validation (auth, store check)
    
    OrderAPI->>FraudEngine: Analyze for fraud risk
    
    alt Async Fraud Analysis
        FraudEngine->>DB: Fetch customer history
        DB-->>FraudEngine: Previous orders, returns, disputes
        
        FraudEngine->>ML: Score based on:
        FraudEngine->>ML: - Customer reputation (past orders)
        FraudEngine->>ML: - Order amount (500 DT = high)
        FraudEngine->>ML: - Order frequency (3rd order today?)
        FraudEngine->>ML: - Item category (electronics = high risk)
        FraudEngine->>ML: - Geographic anomaly (new address?)
        
        alt Low Risk (< 30%)
            ML-->>FraudEngine: Risk: 15%
            FraudEngine->>DB: Store fraud_score = 0.15
            FraudEngine->>DB: Update order status: ACCEPTED
        else Medium Risk (30-70%)
            ML-->>FraudEngine: Risk: 45%
            FraudEngine->>DB: Store fraud_score = 0.45
            FraudEngine->>DB: Update order status: PENDING_REVIEW
            FraudEngine->>Admin: Alert! "Manual review needed"
        else High Risk (> 70%)
            ML-->>FraudEngine: Risk: 88%
            FraudEngine->>DB: Store fraud_score = 0.88
            FraudEngine->>DB: Update order status: FLAGGED
            FraudEngine->>Admin: Alert! "Suspicious order detected"
            
            Admin->>Admin: Reviews order details
            Admin->>DB: Manually approve or reject
        end
    end

    OrderAPI-->>Frontend: Order created
    Frontend-->>Customer: Order confirmation
```

---

## Common Data Flow Patterns

### Pattern 1: CRUD Operation (Create)

```
Customer Input
    → Form Validation (Frontend)
    → API Endpoint Handler
    → Authentication Check
    → Authorization Check
    → Business Logic Validation
    → Database Insert
    → Cache Invalidation
    → Notification Trigger
    → Response to Client
    → Success Message
```

**Example**: Create product
```
Owner fills product form
    → Frontend validates price > 0
    → POST /api/dashboard/[storeId]/products
    → Verify owner auth
    → Verify store ownership
    → Check product name not duplicate
    → Insert into items table
    → Clear search cache
    → Trigger store update notification
    → Return product ID
    → Show "Product created" toast
```

### Pattern 2: Search & Ranking

```
User Query
    → Query Normalization (remove special chars, trim)
    → Language Detection (Darija, Arabic, French)
    → Translation/Lemmatization
    → Embedding Generation (OpenRouter API)
    → Vector Search (Supabase pgvector)
    → Keyword Search (Postgres FTS)
    → Merge Results
    → Ranking/Reranking
    → Personalization (user preferences)
    → Cache Result (10 min TTL)
    → Return Top N Results
```

### Pattern 3: Notification Dispatch

```
Event Triggered (order created)
    → Identify Recipients (store owner)
    → Build Notification Object
    → Insert into notifications table
    → Publish to Supabase Realtime
    → Real-time subscribers receive
    → Optional: Queue for email/SMS
    → Mark as delivered
```

### Pattern 4: Analytics Event

```
User Action (view product)
    → Capture event data
    → Enrich with context (user_id, timestamp, source)
    → Asynchronously insert to tracking table
    → Update aggregated metrics
    → Optional: Trigger recommendation update
```

---

## Writing Effective Sequence Descriptions

### Good Description ✅
```
Customer clicks "Order Now" button
Backend validates user is authenticated
Backend checks customer is not store owner
Backend checks for duplicate pending orders
Backend generates unique order number (ORD-XXXXXX-XXXX)
Backend creates order in database with status PENDING
Backend decrements product stock
Backend creates transaction record
Backend queues fraud analysis (async)
Backend queues notification to store owner
Backend returns order confirmation to customer
Customer sees order confirmation with tracking number
```

### Bad Description ❌
```
Order created
Database updated
Notification sent
Done
```

---

## Key Business Rules for Diagrams

1. **Can't order from own store**
   ```
   IF customer_id == store_owner_id
   THEN reject order with message "Cannot order from your own store"
   ```

2. **Prevent duplicate pending orders**
   ```
   IF (SELECT COUNT(*) FROM orders 
       WHERE customer_id=? AND store_id=? AND status='PENDING') > 0
   THEN reject order with message "You already have a pending order"
   ```

3. **Generate unique order/booking numbers**
   ```
   order_number = "ORD-" + last_6_digits(timestamp) + "-" + random_4_chars
   booking_number = "BK-" + last_6_digits(timestamp) + "-" + random_4_chars
   ```

4. **Stock must be positive**
   ```
   IF item_stock <= 0 THEN item_status = "UNAVAILABLE"
   ```

5. **Store must be ACTIVE to be visible**
   ```
   SELECT * FROM stores WHERE status = 'ACTIVE' ORDER BY rating DESC
   ```

6. **Booking must respect business hours**
   ```
   IF booking_time NOT IN business_hours THEN reject booking
   ```

7. **Only store owner can modify store**
   ```
   IF user_id != store.owner_id THEN reject with 403 Forbidden
   ```

---

## Actor Communication Methods

### Synchronous (Direct Response)
- REST API calls
- Database queries
- Validation checks
- Page rendering

### Asynchronous (No immediate response)
- Email notifications (via Resend)
- Fraud analysis (via QStash delay)
- SMS notifications
- Background jobs

### Real-time (Live updates)
- Supabase Realtime subscriptions
- WebSocket messages
- Live notifications in app
- Chat message delivery

---

## Metrics to Include in Diagrams

```
For Orders:
- Order Number (e.g., ORD-123456-ABCD)
- Total Amount (e.g., 49.99 DT)
- Status (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- Fraud Score (0-100, where >70 = flagged)
- Timestamps (created_at, confirmed_at, delivered_at)

For Bookings:
- Booking Number (e.g., BK-234567-XYZQ)
- Service Duration (e.g., 1 hour)
- Slot Time (e.g., 2024-01-20 15:00)
- Capacity (e.g., 1/3 spots filled)
- Status (PENDING → CONFIRMED → COMPLETED)

For Reviews:
- Rating (1-5 stars)
- Sentiment Score (0-100, confidence)
- Keywords (e.g., "excellent", "fast", "friendly")
- Visibility (public on profile)

For Fraud:
- Risk Score (0-100)
- Flags (high amount, new address, etc.)
- Action (ACCEPT, PENDING_REVIEW, FLAGGED)
- Manual Review Needed (yes/no)
```

---

## Example: Complete Order Flow Diagram

```
PARTICIPANTS:
- Customer: Person buying
- Marketplace App: Frontend
- API Server: Backend
- Database: Supabase
- Store Owner: Seller
- Fraud Detector: AI System
- Notification System: Alert service

FLOW:
1. Customer searches "pizza"
   (Semantic search, multilingual, ranked by rating & distance)

2. Customer views "Chez Ali" pizzeria
   (Profile, photos, menu, reviews, ratings)

3. Customer adds 2 pizzas to cart
   (Using Zustand cart store)

4. Customer clicks "Order"
   (Submits: store_id, items[], quantities[], total_price)

5. API validates:
   - Is customer logged in? YES
   - Is customer the store owner? NO
   - Does a pending order already exist? NO
   - Is product in stock? YES (2 available)
   - Is store status ACTIVE? YES

6. API creates order:
   - Generates order_number: ORD-234567-ABCD
   - Inserts order with status: PENDING
   - Updates item stock: 2 → 0
   - Creates transaction record
   - Calls fraud analysis (async)

7. Fraud Detector analyzes:
   - Customer history: Good (10 orders, no disputes)
   - Amount: 49.99 DT (normal)
   - Frequency: 2nd order this week (normal)
   - Location: Saved address (low risk)
   - Risk Score: 12% (ACCEPT)

8. Notification Service sends:
   - To Store Owner: "New order #ORD-234567-ABCD"
   - To Customer: "Order confirmed"

9. Customer receives:
   - Order confirmation in app
   - Tracking number
   - Delivery time estimate (45-60 min)
   - Option to message seller

10. Store Owner receives:
    - Real-time notification (Supabase subscription)
    - Order details dashboard update
    - Can confirm/reject order
    - Can send message to customer

11. Real-time update:
    - Both parties see order status changes
    - "In Preparation" → "Ready for Pickup" → "In Transit" → "Delivered"

12. Delivery completed:
    - Customer receives notification
    - Customer can rate & review
    - Store rating updated
    - Future customers see review
```

This comprehensive guide provides everything needed to create effective, accurate sequence diagrams with proper business terminology and real actor roles for the ro2ya.tn marketplace platform.

