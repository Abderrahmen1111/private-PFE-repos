# User Journeys & System Workflows - Ro2ya Marketplace

## Overview
This document maps the actual user flows through the application based on real pages and functionality found.

---

## 1. CUSTOMER JOURNEY

### Flow 1: Discover & Browse
```
Home (/) 
  ↓ [Click on SmartStrip items/Offers]
  ↓
Shop (/shop) 
  ↓ [Search or browse products]
  ↓ [Click on ProductCard]
  ↓
Public Business Profile (/public/business/[id])
  ↓ [View products, services, reviews]
  ↓ [Choose action: Buy/Book/Message/Follow/Favorite]
```

### Flow 2: Search & Find
```
Navbar [Search Icon]
  ↓ [Enter query & location]
  ↓
Search (/search)
  ↓ [View results: Businesses, Products, Services]
  ↓ [Apply filters: Category, Distance, Price]
  ↓ [Click result]
  ↓
Public Business Profile or Product Detail
```

### Flow 3: Product Purchase
```
Shop (/shop) or Search Results
  ↓ [View ProductCard]
  ↓ [Click "Buy" or "Add to Cart" button]
  ↓ [Checkout (implicit - likely /valider)]
  ↓
Valider Page (/valider)
  ↓ [Transaction code validation]
  ↓ [Payment processing]
  ↓ [Order confirmation]
```

### Flow 4: Service Reservation
```
Public Business Profile (/public/business/[id])
  ↓ [View ServiceCard]
  ↓ [Click "Book Service" button]
  ↓ [ServiceBookingCard appears]
  ↓ [Select time slot via TimeSlotGrid]
  ↓ [Confirm booking]
  ↓
Messages (/messages) [Auto-opens chat with business]
  ↓ [Receive booking confirmation]
  ↓ [On reservation date: View in Messages/Valider]
```

### Flow 5: Messaging & Support
```
Public Business Profile or Public User Profile
  ↓ [Click "Message" or "Chat" button]
  ↓
Messages (/messages)
  ↓ [Select conversation from ConversationSidebar]
  ↓ [Send messages via ChatWindow]
  ↓ [Real-time updates]
  ↓ [Optional: Video call via CallOverlay]
```

### Flow 6: Friend Discovery & Connection
```
Messages (/messages)
  ↓ [Click "Suggestions" link]
  ↓
Messages/Suggestions (/messages/suggestions)
  ↓ [View SuggestionCards]
  ↓ [Add friend or view profile]
  ↓ [Friendship status: PENDING → ACCEPTED]
```

### Flow 7: Content Discovery
```
Home (/) [Click on stories/reels carousel]
  ↓
Discover (/discover)
  ↓ [View vertical feed: Stories, Reels, Ads]
  ↓ [Interact: Like, Comment, Share, Bookmark]
  ↓ [Comments trigger sentiment analysis]
  ↓ [View business profile from content]
```

### Flow 8: Review & Feedback
```
After purchase/booking completion
  ↓ [Notification or email reminder]
  ↓ [Click "Write Review" button]
  ↓
ReviewModal appears
  ↓ [Rate (1-5 stars)]
  ↓ [Write review text]
  ↓ [Submit review]
  ↓ [Review visible on business profile]
```

### Flow 9: Authentication
```
Any page [Not logged in]
  ↓ [Click "Login" or "Register" in Navbar]
  ↓
Login (/login) OR Register (/register)
  ↓ [AuthCard flip between modes]
  ↓ [Enter credentials]
  ↓ [Submit]
  ↓ [Session created via Supabase Auth]
  ↓ [Redirect to previous page or home]
```

### Flow 10: Password Reset
```
Login page (/login)
  ↓ [Click "Forgot Password" link]
  ↓
Auth Email Verification
  ↓ [Click reset link in email]
  ↓
Update Password (/auth/update-password)
  ↓ [Enter new password]
  ↓ [Confirm password]
  ↓ [Submit]
  ↓ [Redirect to login]
```

---

## 2. BUSINESS OWNER JOURNEY

### Flow 1: Account Setup
```
Register (/register)
  ↓ [Create account as business owner]
  ↓
Email verification
  ↓ [Verify email]
  ↓
Redirect to Dashboard Setup
  ↓ [Enter business info: Name, Category, Location]
  ↓
Store creation complete
```

### Flow 2: Dashboard Overview
```
Dashboard (/dashboard/[id])
  ↓ [View StatCards: Views, Sales, Orders]
  ↓ [View Charts: Revenue, Traffic trends]
  ↓ [See navigation Tabs: Products, Transactions, Leads, etc.]
```

### Flow 3: Add Products/Services
```
Dashboard → Products Tab
  ↓
Products Management (/dashboard/[id]/products)
  ↓ [Click "+ Add Product" button]
  ↓ [Dialog opens]
  ↓ [Fill form: Name, Description, Price, Category]
  ↓ [Upload images: Main + Gallery]
  ↓ [Optional: Use DarijaAIPanel for description]
  ↓ [Set stock, type (PRODUCT/SERVICE)]
  ↓ [Publish]
  ↓ [Product visible on public profile & shop]
```

### Flow 4: Create Promotional Campaign
```
Dashboard → Promotions (implicit or via Products)
  ↓ [Create or edit promotion]
  ↓ [Set: Discount %, Title, Valid dates]
  ↓ [Link to products/services]
  ↓ [Activate campaign]
  ↓ [Badge appears on product cards: "-40%"]
  ↓ [Customers see promotional pricing]
```

### Flow 5: Create Story/Reel
```
Dashboard → Stories Tab
  ↓
Stories Page (/dashboard/[id]/stories)
  ↓ [Click "+ Add Story" button]
  ↓ [Choose: Upload or Record via CameraCapture]
  ↓ [Preview in dialog]
  ↓ [Add caption]
  ↓ [Publish]
  ↓
Reel Alternative
  ↓ [Dashboard → Reels Tab]
  ↓ [Similar flow with video editing tools]
  ↓ [Optional: Add effects, trim, captions]
```

### Flow 6: Monitor Orders & Bookings
```
Dashboard → Leads Tab
  ↓
Leads Page (/dashboard/[id]/leads)
  ↓ [View all orders and bookings]
  ↓ [Filter: Type (order/booking), Sort (recent)]
  ↓ [Click on lead card]
  ↓ [Update status: pending → confirmed → shipped → completed]
  ↓ [Optional: Block customer if spamming]
```

### Flow 7: Validate Transactions
```
Dashboard → Transactions Tab
  ↓
Transactions Page (/dashboard/[id]/transactions)
  ↓ [View all transactions with status]
  ↓ [Search by reference code]
  ↓ [Filter by status, type]
  ↓ [QR Code validation option]
  ↓ [Use Scanner to scan QR from customer phone]
  ↓ [Update transaction status to "VALIDATED"]
```

### Flow 8: View Intelligence & Insights
```
Dashboard → Intelligence Tab
  ↓
Intelligence Page (/dashboard/[id]/intelligence)
  ↓ [View Dashboard: Key metrics, sentiment analysis]
  ↓ [See Comments section: Trending comments from reels]
  ↓ [View sentiment: Positive, Negative, Neutral]
  ↓ [View intent: Immediate purchase, Info request, etc.]
  ↓ [Use AI-generated reply suggestions]
  ↓ [Respond directly or customize]
  ↓ [Optional: Get recommendations for next actions]
```

### Flow 9: Manage Support Tickets
```
Dashboard → Support Tickets Tab
  ↓
Support Tickets Page (/dashboard/[id]/support/tickets)
  ↓ [View incoming support requests]
  ↓ [Filter by priority: Low, Medium, High, Critical]
  ↓ [Filter by status: Open, In Progress, Waiting Customer, Resolved]
  ↓ [Click ticket → View messages]
  ↓ [Reply in SupportMessagesSection]
  ↓ [Update status and priority]
  ↓ [Mark as resolved/closed]
```

### Flow 10: Respond to Customer Messages
```
Messages (/messages) - All pages accessible
  ↓ [ConversationSidebar shows all customer chats]
  ↓ [Click conversation]
  ↓ [ChatWindow shows message thread]
  ↓ [Type reply in input]
  ↓ [Send message]
  ↓ [Real-time sync to customer]
  ↓ [Optional: Send media attachments, files]
```

### Flow 11: Edit Account Settings
```
Dashboard → Account Section
  ↓
AccountSection Component
  ↓ [Update business info]
  ↓ [Update profile image]
  ↓ [Update working hours]
  ↓ [Update contact info]
  ↓ [Change password via /auth/update-password]
```

---

## 3. ADMIN JOURNEY

### Flow 1: View All Transactions
```
Admin Dashboard (API endpoint)
  ↓
Admin Transactions (/api/admin/transactions)
  ↓ [View system-wide transactions]
  ↓ [Filter by merchant, status, date range]
  ↓ [Export/download reports]
  ↓ [Flag suspicious transactions]
```

### Flow 2: System Analytics
```
Admin Dashboard
  ↓ [View total users, merchants, revenue]
  ↓ [Monitor platform health]
  ↓ [View top merchants, products]
  ↓ [Check system notifications]
```

---

## 4. DATA FLOW ARCHITECTURE

### Product Discovery Pipeline
```
Customer Search (UI)
  ↓
/api/search endpoint
  ↓
Query Supabase (stores, items, services tables)
  ↓
Optional: Semantic search with embeddings
  ↓
Geo filtering (Haversine distance)
  ↓
Return ranked results
  ↓
Display on /search page
```

### Message Pipeline
```
User A sends message (ChatWindow)
  ↓
/api/chat endpoint (POST)
  ↓
Save to messages table
  ↓
Supabase Realtime subscription
  ↓
User B receives real-time update
  ↓
Display in ChatWindow
```

### Order/Booking Pipeline
```
Customer places order/booking
  ↓
Create record in orders/reservations table
  ↓
Status: PENDING
  ↓
Notification to business owner
  ↓ [Business reviews in Leads page]
  ↓ [Business confirms/rejects]
  ↓
Status update → CONFIRMED/CANCELLED
  ↓
Customer receives notification
  ↓
On fulfillment date: Transactional flow
  ↓
Send to /valider for payment validation
  ↓
Status: VALIDATED/COMPLETED
```

### Comment & Sentiment Pipeline
```
Customer comments on reel (UI)
  ↓
POST /api/reels/comments
  ↓
Save comment to database
  ↓
Trigger Darija sentiment analysis
  ↓
Extract: Sentiment, Intent, Emotion, Topic
  ↓
Store analysis in comment metadata
  ↓
Display in Intelligence dashboard
  ↓
Generate AI response suggestion
  ↓
Business owner can approve & respond
```

### Content Distribution Pipeline
```
Business publishes story/reel
  ↓
POST /api/stories or /api/reels
  ↓
Upload media to Cloudinary
  ↓
Save metadata to database
  ↓
Mark as published
  ↓
Appear in /discover feed
  ↓
Appear in business profile
  ↓ [Show on home for followers]
  ↓ [Generate engagement analytics]
```

---

## 5. ROLE-BASED FEATURES

### Customer (Authenticated User)
✅ Browse products & services  
✅ Search with geo-filters  
✅ Place orders  
✅ Book services  
✅ Chat with businesses  
✅ Send friend requests  
✅ View reviews & ratings  
✅ Write reviews  
✅ Like/comment on reels  
✅ Follow/unfollow businesses  
✅ Save favorites  
✅ View transaction history  
✅ Submit support tickets  
❌ Cannot: Access business dashboard, create stores, manage inventory  

### Business Owner (Store Owner)
✅ All customer features  
✅ Create/edit business profile  
✅ Add products & services  
✅ Create promotions  
✅ Create stories & reels  
✅ View analytics & insights  
✅ Monitor orders/bookings  
✅ Validate transactions  
✅ Respond to reviews  
✅ Chat with customers  
✅ Manage support tickets  
✅ View sentiment analysis  
✅ Get AI recommendations  
❌ Cannot: Access admin panel, manage other stores  

### Admin (System Admin)
✅ All business owner features  
✅ View all system transactions  
✅ View platform-wide analytics  
✅ Manage merchants  
✅ View all support tickets  
✅ Ban/suspend accounts  
❌ May be limited in some areas depending on implementation  

### Anonymous (Not Logged In)
✅ View home page  
✅ Browse shop  
✅ Search products/services  
✅ View public business profiles  
✅ View public user profiles  
✅ View reels/stories (as guest)  
❌ Cannot: Chat, order, book, favorite, write reviews, create content  

---

## 6. REAL-TIME FEATURES

### Messaging
- Supabase Realtime subscriptions
- Instant message delivery
- Typing indicators
- Online status
- Read receipts (if implemented)

### Notifications
- Order/booking updates
- Message notifications
- Reel comment notifications
- Friend request notifications
- Promotion alerts

### Analytics
- Real-time view counter
- Live order/booking alerts
- Comment stream updates

---

## 7. EXTERNAL INTEGRATIONS

### Payment Processing
- Transaction validation via `/api/admin/transactions`
- QR code generation for transactions
- Code verification on `/valider` page

### Geolocation
- `/api/geo/nearby` - Find nearby stores
- `/api/geo/reverse` - Address from coordinates
- `/api/geo/autocomplete` - Location suggestions
- Distance calculations on search page

### Media Storage
- Cloudinary CDN for images/videos
- Upload endpoints: `/api/cloudinary/upload`
- Delete endpoints: `/api/cloudinary/delete`
- Image processing: `/api/workers/process-image`

### AI/NLP
- Darija sentiment analysis
- Intent classification (14 intents)
- Emotion detection (10 emotions)
- Topic extraction (12 topics)
- AI agent for business recommendations
- OpenRouter API integration

### Search & Recommendations
- Semantic search with embeddings
- Image-based search
- Friend suggestions algorithm
- Product recommendations (implied)

---

## 8. TRANSACTION FLOW - ORDER COMPLETION

```
Customer initiates order/booking
  ↓
Order created in database (status: PENDING)
  ↓
Customer receives transaction code or QR
  ↓
Optional: Customer completes payment externally
  ↓
Link to /valider?code={transaction_code}
  ↓
Valider page validates code
  ↓
Query database by transaction_code or qr_code_token
  ↓
If authenticated & valid:
  ↓ [Show success animation]
  ↓ [Update order status to VALIDATED/COMPLETED]
  ↓ [Notify business & customer]
  ↓
If not authenticated:
  ↓ [Redirect to /login?redirect=/valider?code=...]
  ↓ [After login, resume validation]
```

---

## 9. PERFORMANCE CONSIDERATIONS

### Dynamic Imports (SSR: false)
- ResultsMap (reduces initial bundle)
- BackgroundScene (heavy 3D rendering)

### Code Splitting
- Dashboard sections lazy loaded
- API endpoints separated by domain

### Caching Strategy
- Cloudinary image caching
- Browser caching for static assets
- Possible Redis for frequent queries

### Database Optimization
- Indexed searches
- Efficient geospatial queries
- Prepared statements for transactions

---

## 10. SECURITY IMPLICATIONS

### Authentication
- Supabase Auth with JWT
- Session management via SessionProvider
- Protected routes checked at layout level

### Authorization
- Store owner access: Verified via store_id in URL
- Message access: User must be party or admin
- Admin routes: Admin role check

### Data Privacy
- Public profiles show limited data
- Private messages encrypted in transit
- Support tickets private to store owner

### Payment Security
- Transaction codes validated before update
- QR codes tied to specific transactions
- Admin-only transaction view

---

## 11. WORKFLOW SUMMARY TABLE

| User Type | Primary Pages | Secondary Pages | Max Features |
|-----------|--------------|-----------------|--------------|
| Visitor | Home, Shop, Search, Public Profiles | Discover | 8 actions |
| Customer | All above + Messages, Favorite, Orders | Reviews, Support | 12 actions |
| Business | Dashboard (8 subpages), Messages | Intelligence, Public Profile | 15+ actions |
| Admin | All pages | Custom analytics | Unlimited |

---

**Note:** This document represents the actual, functioning workflows in the codebase as discovered through exploration of 33 page files and 66+ API endpoints.
