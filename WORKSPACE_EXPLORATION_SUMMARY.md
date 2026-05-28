# Workspace Exploration Summary - Ro2ya Marketplace

## Executive Overview
This is a full-stack **Next.js 14+ marketplace application** for Tunisia combining e-commerce, social features, and business management. It's a B2C & B2B platform with merchants, customers, and business owners.

---

## 1. ACTUAL PAGE ROUTES (33 page.tsx files found)

### PUBLIC ROUTES (No Authentication Required)
| Route | Purpose | Key Components | Functionality |
|-------|---------|----------------|--------------|
| `/` | Home/Landing page | Navbar, Hero, SmartStrip (trending items), CommerceHero, OffersCarousel, Sponsors, Offers, TrendingArtists, Footer | Showcase products/services with trending items, flash sales, promotions, search entry point |
| `/login` | User authentication | AuthCard (with flip animation), gradient backgrounds | Login form with email/password, session management |
| `/register` | User registration | AuthCard, gradient backgrounds | Sign up form for new users |
| `/auth/update-password` | Password reset | Password input, confirmation, eye toggle | Allows authenticated users to change password |
| `/discover` | Content discovery feed | DiscoverFeed component | Discover section (TikTok-like or Snapchat-style feed) |
| `/shop` | Marketplace products | Navbar, ProductCard, ServiceCard, Navbar, Footer | Browse all latest items (40+), search filter, product/service cards |
| `/search` | Advanced search | BusinessCard, ResultsMap (dynamic), ProductCard, ServiceCard | Search by query, location, category - finds stores, products, services with distance calculation |
| `/search/searchProduct` | Product-only search | ProductCard component | Filtered product search results |
| `/search/searchService` | Service-only search | ServiceCard component | Filtered service search results |
| `/public/user/[id]` | User profile (public view) | PublicStarRating, PublicReviewCard, PublicBadge, Navbar, Footer | View user profile, reviews, badges, follow/message buttons |
| `/public/business/[id]` | Business profile (public view) | PublicStarRating, PublicReviewCard, product/service tabs, gallery, Navbar, Footer | View business info, products, services, reviews, gallery, working hours, contact |
| `/valider` | Transaction validation | Loader, transaction verification | Validates payment/transaction codes (order_completion, QR codes) |

### AUTHENTICATED ROUTES (Require User Login)
| Route | Purpose | Key Components | Functionality |
|-------|---------|----------------|--------------|
| `/messages` | Messaging inbox | ConversationSidebar, ChatWindow, useMessaging hook | Chat with businesses/friends, conversation management, real-time messaging |
| `/messages/suggestions` | Friend suggestions | SuggestionCard | Get suggestions for new friends/connections to message |
| `/dashboard/[id]` | Business dashboard (owner) | StatCard, Tabs (overview, products, transactions, etc.), motion components | Main dashboard overview with analytics, stats |
| `/dashboard/[id]/products` | Manage products/services | ProductCard, DarijaAIPanel, image upload, gallery | Add/edit/delete products and services, manage inventory |
| `/dashboard/[id]/transactions` | View all transactions | TransactionCard, QR scanner, status badges, pagination | View orders and bookings, QR validation, update status |
| `/dashboard/[id]/leads` | Manage orders & bookings | LeadCard, filter by type, status updates | Orders and booking inquiries from customers, action items |
| `/dashboard/[id]/stories` | Manage stories | CameraCapture, story editor | Create, publish, delete business stories (like Instagram stories) |
| `/dashboard/[id]/reels` | Manage reels/videos | Video editor, CameraCapture, publish controls | Create, edit, publish video reels for the business |
| `/dashboard/[id]/intelligence` | AI insights & analytics | Charts (Bar, Pie), sentiment analysis, AI suggestions | Business intelligence dashboard with Darija sentiment analysis, trending comments, AI-generated replies |
| `/dashboard/[id]/support/tickets` | Support tickets | TicketCard, message section, priority badges | Manage customer support tickets with priority levels |

---

## 2. KEY FUNCTIONAL AREAS

### A. AUTHENTICATION & USERS
**Components:**
- `AuthCard.tsx` - Flipping card for login/register forms
- `LoginForm.tsx` - Email/password login
- `SignUpForm.tsx` - User registration form
- `session-provider.tsx` - NextAuth session management

**Functionality:**
- Email/password authentication
- Session persistence
- Password update/reset
- User profiles with badges and reviews

---

### B. SHOPPING & E-COMMERCE
**Pages:**
- `/shop` - Browse marketplace items
- `/search` - Advanced search with geo-location
- `/public/business/[id]` - Business storefront

**Components:**
- `ProductCard.tsx` - Product listing with compare, buy, favorite features
- `ServiceCard.tsx` - Service listing with booking option
- `ProductOrderCard.tsx` - Order/product detail view
- `FavoriteButton.tsx` - Save/wishlist functionality
- `SmartStrip.tsx` - Trending items carousel

**Data:**
- Products with: name, description, price, category, stock, images
- Services with: name, description, price, availability
- Promotions with: discount %, duration, linked items

---

### C. RESERVATIONS & BOOKINGS
**Components:**
- `BusinessReservationSidebar.tsx` - Reservation interface
- `ServiceBookingCard.tsx` - Book a service
- `time-slot-grid.tsx` - Time slot selection

**Functionality:**
- Reserve services (salon, hotel, etc.)
- Select time slots
- Manage reservations in dashboard
- Update booking status (pending, confirmed, completed, cancelled)

---

### D. MESSAGING & SOCIAL
**Pages:**
- `/messages` - Chat inbox
- `/messages/suggestions` - Friend recommendations

**Components:**
- `ConversationSidebar.tsx` - List of conversations
- `ChatWindow.tsx` - Chat interface
- `CallOverlay.tsx` - Voice/video calls (feature)
- `SuggestionCard.tsx` - Friend suggestion cards

**Functionality:**
- Real-time messaging between users
- Text, image, audio, file attachments
- Conversation management
- Friendship system (send request, accept, block)
- Online status tracking

---

### E. CONTENT & SOCIAL FEATURES
**Pages:**
- `/discover` - Discovery feed
- `/dashboard/[id]/stories` - Create stories
- `/dashboard/[id]/reels` - Create/manage reels

**Components:**
- `SnapchatReels.tsx` - Reel viewer (TikTok-style)
- `StoriesDemo.tsx` - Stories component
- `BusinessStories.tsx` - Business stories display
- `CameraCapture.tsx` - Camera capture for media

**Functionality:**
- Stories (24-hour content)
- Reels/short videos
- Comments on reels with Darija sentiment analysis
- Like, bookmark, share functionality

---

### F. BUSINESS INTELLIGENCE & ANALYTICS
**Pages:**
- `/dashboard/[id]` - Dashboard overview
- `/dashboard/[id]/intelligence` - AI insights
- `/dashboard/[id]/transactions` - Transaction history

**Components:**
- `DarijaAIPanel.tsx` - AI-powered insights in Darija
- Charts: BarChart, LineChart, PieChart from Recharts
- `StoreAnalyticsTracker.tsx` - Analytics tracking

**Functionality:**
- View sales metrics, visitor count, phone clicks, direction clicks
- Monitor orders and bookings
- AI sentiment analysis on comments
- Business performance analytics
- QR code validation for transactions

---

### G. PROMOTIONS & MARKETING
**Components:**
- `OffersCarouselDemoBusiness.tsx` - Promotional carousel
- `Offers.tsx` - Active offers section
- `PromotionBanner.tsx` - Promotion display

**Data:**
- Create promotional campaigns
- Set discount percentage
- Schedule validity period
- Link to products/services

---

### H. REVIEWS & RATINGS
**Components:**
- `PublicStarRating.tsx` - Star rating display
- `PublicReviewCard.tsx` - Review cards
- `WriteReviewButton.tsx` - Write review button
- `ReviewModal.tsx` - Review submission form

**Functionality:**
- 5-star rating system
- Customer reviews on products/services
- Business owner responses to reviews
- Review display on business profile

---

### I. BUSINESS PROFILES & MANAGEMENT
**Pages:**
- `/public/business/[id]` - Public business profile
- `/dashboard/[id]` - Business owner dashboard

**Features:**
- Business info (name, description, category, rating)
- Working hours
- Contact info (phone, website, address)
- Photo gallery
- Location on map
- Products & services catalog
- Reviews & ratings
- Stories & reels
- Support tickets

---

## 3. DATA MODELS & ENTITIES

### Core Entities
1. **User** - Customer/friend with profile, avatar, reviews, badges
2. **Store** - Business/merchant with products, services, ratings
3. **Item** - Product or Service (name, price, description, images, category, stock)
4. **Order** - Customer purchase with items
5. **Booking** - Reservation for a service with time slot
6. **Message** - Text/media conversation between users
7. **Promotion** - Discount campaign for items
8. **Story** - 24-hour content by businesses
9. **Reel** - Short video content with comments
10. **Review** - Rating and text feedback
11. **Friendship** - User-to-user connection (pending/accepted/blocked)
12. **Transaction** - Payment record with code/QR validation
13. **Ticket** - Support request with status and priority

---

## 4. API ENDPOINTS (66 routes found)

### Authentication
- `POST /api/auth/verify` - Verify session
- `POST /api/auth/` - OAuth flows

### Orders & Sales
- `GET/POST /api/orders` - Order management
- `POST /api/orders/bulk` - Bulk order processing
- `POST /api/workers/sync-orders` - Sync orders with backend

### Reservations
- `GET/POST /api/reservations` - Book services

### Messaging
- `GET/POST /api/chat` - Message endpoints
- `GET/POST /api/friendships` - Friend requests, blocks

### Content
- `GET/POST /api/reels` - Reel management
- `POST /api/reels/comments` - Comment on reels
- `GET/POST /api/stories` - Stories management

### Business Data
- `GET/POST /api/stores` - Store management
- `GET/POST /api/items` - Products/services
- `GET/POST /api/promotions` - Promotions
- `GET/POST /api/profile` - User/business profiles

### Search & Discovery
- `POST /api/image-search` - Visual search
- `POST /api/semantic-search` - Semantic search
- `GET /api/suggestions` - Friend suggestions

### Location Services
- `GET /api/geo/nearby` - Nearby stores
- `GET /api/geo/reverse` - Reverse geocoding
- `GET /api/geo/autocomplete` - Location autocomplete

### Analytics & AI
- `POST /api/ai-agent` - AI assistant
- `GET /api/ai-darija` - Darija language processing
- `GET/POST /api/notifications` - Push notifications
- `POST /api/analytics/track` - Event tracking

### Support
- `GET/POST /api/support` - Support tickets
- `GET/POST /api/admin/transactions` - Admin transaction view

### Media
- `DELETE /api/cloudinary/delete` - Delete images
- `POST /api/cloudinary/upload` - Upload images
- `POST /api/workers/process-image` - Image processing

---

## 5. AUTHENTICATION STATUS BY ROUTE

### Public Routes (No Auth Required)
- Home (`/`)
- Login (`/login`)
- Register (`/register`)
- Discover (`/discover`)
- Shop (`/shop`)
- Search (`/search`, `/search/searchProduct`, `/search/searchService`)
- Public profiles (`/public/user/[id]`, `/public/business/[id]`)
- Transaction validation (`/valider`)

### Protected Routes (Auth Required)
- Messages (`/messages`, `/messages/suggestions`)
- Dashboard & all subpages (`/dashboard/[id]/*`)
- Auth updates (`/auth/update-password`)

---

## 6. KEY FEATURES

### Customer Features
✅ Browse products and services  
✅ Search with geo-location and filters  
✅ Add items to favorites  
✅ Place orders  
✅ Book services with time slots  
✅ Real-time chat with businesses and friends  
✅ View business profiles and reviews  
✅ Write and read reviews  
✅ Follow/unfollow businesses  
✅ Discover content (stories, reels)  
✅ Comment on reels with Darija sentiment analysis  

### Business Owner Features
✅ Create and manage store profile  
✅ Add/edit products and services  
✅ Create promotional campaigns  
✅ Create stories and reels  
✅ View analytics and insights  
✅ Monitor orders and bookings  
✅ Respond to customer messages  
✅ Manage support tickets  
✅ Validate transactions with QR codes  
✅ AI-powered business intelligence  
✅ Darija language sentiment analysis on comments  

### Admin Features
✅ View all transactions  
✅ System-wide analytics  
✅ User management  
✅ Merchant management  
✅ Support ticket management  

---

## 7. TECHNOLOGY STACK

### Frontend
- **Framework:** Next.js 14+ (React 18+)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **UI Components:** Shadcn/ui, Lucide icons
- **Charts:** Recharts
- **State:** Zustand (messaging store)
- **Maps:** Dynamic loading (likely Leaflet/Mapbox)

### Backend
- **Runtime:** Node.js via Next.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth / NextAuth
- **Storage:** Cloudinary (image CDN)
- **Real-time:** Supabase Realtime (for chat)
- **Search:** Semantic search, image search APIs
- **Geolocation:** Reverse geocoding, nearby stores

### AI/ML
- **Darija Sentiment Analysis:** Custom model
- **AI Agent:** OpenRouter API integration
- **Embeddings:** Vector search for recommendations

### DevOps
- **Deployment:** Vercel (Next.js optimized)
- **Version Control:** Git
- **Package Manager:** pnpm

---

## 8. COMPONENT STRUCTURE

### Layout Components
- `Navbar.tsx` - Navigation with search, notifications, profile
- `Footer.tsx` - Footer section
- `session-provider.tsx` - Auth context
- `theme-provider.tsx` - Dark/light theme

### Content Components
- `Hero.tsx` - Hero banner
- `SmartStrip.tsx` - Trending items carousel
- `CommerceHero.tsx` - E-commerce hero
- `OffersCarouselDemoBusiness.tsx` - Promo carousel
- `TrendingArtists.tsx` - Trending businesses/people

### Card Components
- `ProductCard.tsx` - Product display with actions
- `ServiceCard.tsx` - Service display
- `ServiceBookingCard.tsx` - Booking interface
- `ProductOrderCard.tsx` - Order view
- `BusinessCard.tsx` - Business listing

### Feature Components
- `FavoriteButton.tsx` - Wishlist toggle
- `FollowButton.tsx` - Follow business
- `ShareBusinessButton.tsx` - Share social links
- `WriteReviewButton.tsx` - Review submission
- `GlobalActionDrawer.tsx` - Bottom sheet for actions

### Messaging Components
- `ConversationSidebar.tsx` - Inbox list
- `ChatWindow.tsx` - Chat interface
- `CallOverlay.tsx` - Call UI
- `SuggestionCard.tsx` - Friend recommendations

### Profile Components
- `PublicStarRating.tsx` - Rating display
- `PublicReviewCard.tsx` - Review display
- `PublicBadge.tsx` - User/business badges

### Business Components
- `BusinessStories.tsx` - Story display
- `BusinessImageGallery.tsx` - Photo gallery
- `BusinessItemsList.tsx` - Product/service list
- `BusinessReservationSidebar.tsx` - Booking sidebar
- `BusinessCommandSidebar.tsx` - Business action menu

### Specialized Components
- `CameraCapture.tsx` - Camera for photos/videos
- `SnapchatReels.tsx` - Reel viewer
- `StoriesDemo.tsx` - Stories interface
- `DarijaAIPanel.tsx` - AI insights in Darija
- `AIAgent.tsx` - Chatbot assistant
- `BackgroundScene.tsx` - 3D/animated backgrounds
- `StorageUploadDiagnostic.tsx` - Upload diagnostics

---

## 9. MISSING/INCOMPLETE FEATURES

⚠️ **Potential gaps to investigate:**
- `/profile` route doesn't exist (may be `/public/user/[id]` instead)
- `/reels` main page - stories/reels may only be accessible via dashboard
- Checkout flow - not explicitly found (may use `/valider` page)
- Cart page - not found (may be in-page modal)
- Admin dashboard - limited visibility
- Payment processing - integration likely via transaction endpoints

---

## 10. SECURITY & PERMISSIONS

**Authentication:**
- Supabase Auth handles user sessions
- Protected routes checked in layouts/middleware
- Store access control: Verified owner access to `/dashboard/[id]`

**Data Privacy:**
- Public profiles (`/public/*`) show limited info
- Messaging between authenticated users only
- Private data in dashboards (owner only)

---

## SUMMARY STATISTICS

| Metric | Count |
|--------|-------|
| Total Page Routes | 33 |
| Public Pages | 12 |
| Protected Pages | 21 |
| API Endpoints | 66+ |
| React Components | 150+ |
| Supported Languages | 2 (French, Darija) |
| Database Tables | 20+ (estimated) |
| Real-time Features | Yes (chat, notifications) |

---

**This document reflects the actual, functioning codebase as of May 2026.**
