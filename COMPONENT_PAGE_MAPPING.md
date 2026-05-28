# Component-to-Page Usage Mapping

## Overview
This document maps which components are used on each page, helping understand the UI structure and how features are composed.

---

## PUBLIC PAGES COMPONENT USAGE

### 1. Home Page (`/`)
**Route File:** `app/page.tsx`  
**Page Type:** Client Component ('use client')  
**Purpose:** Landing/home page with trending products

**Components Used:**
- `Navbar` - Top navigation bar
- `Hero` - Hero banner section
- `TrendingArtists` - Trending businesses
- `Footer` - Footer
- `OffersCarouselDemoBusiness` - Promotional carousel
- `Sponsors` (SponsorsDemo) - Partner logos
- `Offers` - Active offers section
- `CommerceHero` - E-commerce banner
- `LogoCarouselDemo` (ui/testimonials) - Logo carousel
- `FloatingAiAssistant` - AI chat widget
- `ShortAdsSection` - Short advertisements
- `SmartStrip` - Trending items strip
- `BackgroundScene` - Animated 3D background (dynamic load)

**Features:**
- Dynamic item carousel with trending/hot badges
- Flash sales display
- Category browsing via SmartStrip
- Search entry point via Navbar
- AI assistant chat available

---

### 2. Login Page (`/login`)
**Route File:** `app/login/page.tsx`  
**Page Type:** Client Component  
**Purpose:** User authentication

**Components Used:**
- `AuthCard` - Flip card with login form
- Animated gradient backgrounds (Tailwind)

**Features:**
- Email/password login
- Optional sign-up flip
- Session creation

---

### 3. Register Page (`/register`)
**Route File:** `app/register/page.tsx`  
**Page Type:** Client Component  
**Purpose:** New user registration

**Components Used:**
- `AuthCard` - Flip card with registration form
- Animated gradient backgrounds

**Features:**
- Create new user account
- Email validation
- Password confirmation

---

### 4. Discover Page (`/discover`)
**Route File:** `app/discover/page.tsx`  
**Page Type:** Server Component  
**Purpose:** Content discovery feed

**Components Used:**
- `DiscoverFeed` - Main feed component

**Features:**
- TikTok/Snapchat-style content feed
- Vertical scrolling
- Stories and reels

---

### 5. Shop Page (`/shop`)
**Route File:** `app/shop/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Browse all marketplace items

**Components Used:**
- `Navbar` - Navigation and search
- `ProductCard` - Individual product display
- `ServiceCard` - Individual service display
- `Footer` - Footer

**Features:**
- Display latest 40+ items
- Search filtering (by name, store)
- Product and service mix
- Buy buttons on products
- Booking buttons on services
- Pagination

---

### 6. Search Page (`/search`)
**Route File:** `app/search/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Advanced search with location filtering

**Components Used:**
- `Navbar` - Search input
- `BusinessCard` - Business results
- `ResultsMap` - Interactive map (dynamic load)
- `ProductCard` - Product results
- `ServiceCard` - Service results
- `Footer` - Footer

**Features:**
- Search by query (name, location)
- Location-based filtering
- Category filtering
- Business/product/service tabs
- Distance calculation (Haversine formula)
- Comparison functionality
- Map visualization
- Tracking integration

---

### 7. Search Product Page (`/search/searchProduct`)
**Route File:** `app/search/searchProduct/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Search for products only

**Components Used:**
- `ProductCard` - Product results

---

### 8. Search Service Page (`/search/searchService`)
**Route File:** `app/search/searchService/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Search for services only

**Components Used:**
- `ServiceCard` - Service results

---

### 9. Public User Profile (`/public/user/[id]`)
**Route File:** `app/public/user/[id]/page.tsx`  
**Page Type:** Client Component  
**Purpose:** View user public profile

**Components Used:**
- `ContactButton` (inline) - Message/friend request
- `PublicStarRating` - Rating display
- `PublicReviewCard` - User reviews
- `PublicBadge` - Achievement badges
- `Navbar` - Navigation
- `Footer` - Footer
- Share button - Social sharing

**Features:**
- User profile info (name, avatar, bio)
- Star ratings
- Review history
- Achievement badges
- Follow/block functionality
- Message button (opens chat)
- Friend request management

---

### 10. Public Business Profile (`/public/business/[id]`)
**Route File:** `app/public/business/[id]/page.tsx`  
**Page Type:** Client Component  
**Purpose:** View business public storefront

**Components Used:**
- `PublicStarRating` - Business rating
- `PublicReviewCard` - Customer reviews
- `Navbar` - Navigation
- `Footer` - Footer
- Share button - Social links
- Tabs for: About, Products & Services, Reviews, Gallery

**Features:**
- Business info (name, description, category)
- Location and working hours
- Contact info (phone, website, email)
- Gallery with images/photos
- Products and services listing
- Customer reviews with ratings
- Owner response to reviews
- Share business on social media
- Message business button

---

### 11. Transaction Validation Page (`/valider`)
**Route File:** `app/valider/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Validate and complete transactions

**Components Used:**
- Transaction status display
- Success/error animations
- Loading indicators

**Features:**
- Validate transaction codes
- QR code verification
- Update order/booking status
- Success/error messages
- Redirect after validation

---

## AUTHENTICATED PAGES COMPONENT USAGE

### 1. Messages Page (`/messages`)
**Route File:** `app/messages/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Real-time chat interface

**Components Used:**
- `ConversationSidebar` - List of conversations
- `ChatWindow` - Active chat interface
- `CallOverlay` - Voice/video call UI (if active)
- `Navbar` - Top navigation
- `useMessaging` hook - State management

**Features:**
- Conversation list with unread counts
- Real-time message updates
- Text input with send button
- File/image attachment
- User typing indicators
- Friendship status checks
- Call initiation
- Conversation search

---

### 2. Friend Suggestions Page (`/messages/suggestions`)
**Route File:** `app/messages/suggestions/page.tsx`  
**Page Type:** Server Component (async)  
**Purpose:** Friend recommendations

**Components Used:**
- `SuggestionCard` - Individual suggestions
- `Navbar` - Navigation
- Back button to messages

**Features:**
- AI-generated friend suggestions
- Add friend button per suggestion
- View profile button
- Pagination

---

### 3. Business Dashboard (`/dashboard/[id]`)
**Route File:** `app/dashboard/[id]/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Main business owner dashboard

**Components Used:**
- `StatCard` - KPI display (views, revenue, etc.)
- `Tabs` - Navigation between sections
- Charts (LineChart, BarChart) - Data visualization
- `Badge` - Status indicators
- `Button` - Actions
- `AccountSection` - Account management
- Motion components - Animations

**Features:**
- Dashboard overview with key metrics
- View count, phone clicks, direction clicks
- Revenue/orders summary
- Chart visualizations
- Navigation tabs to other dashboard pages
- Account settings access

---

### 4. Products Management Page (`/dashboard/[id]/products`)
**Route File:** `app/dashboard/[id]/products/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Manage products and services

**Components Used:**
- `ProductCard` - Product display
- `Dialog` - Add/edit modal
- `Input` - Form inputs
- `Textarea` - Description input
- `Select` - Category dropdown
- `Badge` - Status indicators
- `Upload` - Image upload area
- `Button` - Actions
- `DarijaAIPanel` - AI-powered product description
- `Loader2` - Loading state

**Features:**
- List all products/services
- Add new products
- Edit existing products
- Delete products
- Upload product images (single and gallery)
- Upload videos
- Set price and stock
- Categorize items
- Enable/disable availability
- AI-generated Darija descriptions

---

### 5. Transactions Page (`/dashboard/[id]/transactions`)
**Route File:** `app/dashboard/[id]/transactions/page.tsx`  
**Page Type:** Client Component  
**Purpose:** View and validate all transactions

**Components Used:**
- `Input` - Search filter
- `Select` - Status/type filters
- `Badge` - Status display
- `QRCode` - Display QR codes
- `Scanner` - Scan QR codes
- `Dialog` - QR display modal
- `Button` - Actions
- `Card` - Transaction cards
- Pagination controls

**Features:**
- List all orders and bookings
- Search by reference
- Filter by status (pending, completed, validated, etc.)
- Filter by type (order, booking)
- Pagination (10 items per page)
- Status update with QR validation
- Download transaction list
- QR code scanning
- Transaction details view

---

### 6. Leads/Orders Page (`/dashboard/[id]/leads`)
**Route File:** `app/dashboard/[id]/leads/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Manage customer orders and bookings

**Components Used:**
- `Select` - Type and sort filters
- `Button` - Action buttons
- `Card` - Lead/order cards
- `Badge` - Status display
- Icons - Status indicators

**Features:**
- View all orders and bookings
- Filter by type (all, order, booking)
- Sort by date (recent/oldest)
- Update order status
- Update booking status
- Block spamming users
- See customer details
- Confirm/reject actions

---

### 7. Stories Page (`/dashboard/[id]/stories`)
**Route File:** `app/dashboard/[id]/stories/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Manage business stories

**Components Used:**
- `CameraCapture` - Record video/photo
- `Dialog` - Story preview modal
- `Input` - Title input
- `Button` - Publish/delete
- `Badge` - Status (published, draft)
- `Avatar` - Business avatar
- `Loader2` - Loading state

**Features:**
- Create stories (photo or video)
- Camera capture interface
- Preview before publishing
- Publish stories
- Delete stories
- View story statistics
- Add story titles/captions

---

### 8. Reels Page (`/dashboard/[id]/reels`)
**Route File:** `app/dashboard/[id]/reels/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Create and manage video reels

**Components Used:**
- `Tabs` - Reels/Stories tabs
- `Dialog` - Video preview modal
- `Input` - Video title
- `Button` - Upload/publish/delete
- `Video` element - Video player
- `CameraCapture` - Record videos
- `Upload` - File upload
- Icons - Edit, trim, effects
- `Badge` - Status

**Features:**
- Upload reels/short videos
- Record videos with camera
- Edit and trim videos
- Add effects and filters
- Add captions
- Publish reels
- View reel statistics
- Delete reels
- Manage comments on reels

---

### 9. Intelligence Page (`/dashboard/[id]/intelligence`)
**Route File:** `app/dashboard/[id]/intelligence/page.tsx`  
**Page Type:** Client Component  
**Purpose:** AI-powered business insights

**Components Used:**
- `Brain`, `Sparkles`, `Target` icons - Visual indicators
- Charts (BarChart, PieChart) - Data visualization
- `Card` - Insight cards
- `Button` - Action buttons
- `Badge` - Sentiment/priority labels
- `Tabs` - Section navigation
- `Dialog` - Detailed insights modal
- `Textarea` - AI-generated reply suggestions
- Progress bars - Performance metrics

**Features:**
- Comment sentiment analysis (Darija)
- Trending comments detection
- AI-generated responses to comments
- Customer intent classification
- Emotion analysis
- Performance metrics
- Recommendations (next actions)
- Engagement statistics
- Video/reel performance

---

### 10. Support Tickets Page (`/dashboard/[id]/support/tickets`)
**Route File:** `app/dashboard/[id]/support/tickets/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Manage customer support

**Components Used:**
- `Input` - Search tickets
- `Plus` - Create ticket button
- `Dialog` - Create/edit ticket modal
- `Badge` - Priority and status
- `Card` - Ticket cards
- `SupportMessagesSection` - Message thread
- `Button` - Actions
- `Textarea` - Reply input
- Date formatting

**Features:**
- Create support tickets
- View all tickets
- Filter by priority (low, medium, high, critical)
- Filter by status (open, in_progress, waiting_customer, resolved, closed)
- Add messages to tickets
- Update ticket status
- Assign priority
- Delete tickets
- View customer details
- Response history

---

### 11. Update Password Page (`/auth/update-password`)
**Route File:** `app/auth/update-password/page.tsx`  
**Page Type:** Client Component  
**Purpose:** Change user password

**Components Used:**
- `Input` - Password input fields
- `Eye`/`EyeOff` icons - Show/hide toggle
- `Button` - Submit
- Success animation
- Loading state

**Features:**
- Current password verification
- New password input with confirmation
- Password strength validation
- Success message and redirect

---

## COMPONENT ARCHITECTURE SUMMARY

### Component Categories

#### Layout/Navigation (5)
- `Navbar` - Used on all pages
- `Footer` - Used on public pages
- `session-provider` - Wraps entire app
- `theme-provider` - Dark/light mode
- `BackgroundScene` - Animated backgrounds

#### Cards (6)
- `ProductCard` - Shop, search, dashboard
- `ServiceCard` - Shop, search
- `ServiceBookingCard` - Booking flow
- `ProductOrderCard` - Order view
- `BusinessCard` - Search results
- Custom cards per dashboard section

#### Actions (3)
- `FavoriteButton` - On product cards
- `FollowButton` - On business profiles
- `WriteReviewButton` - On product/business pages

#### Messaging (4)
- `ConversationSidebar` - Messages page
- `ChatWindow` - Messages page
- `CallOverlay` - Messages page
- `SuggestionCard` - Suggestions page

#### Profile (3)
- `PublicStarRating` - Business/user profiles
- `PublicReviewCard` - Profiles
- `PublicBadge` - Profiles

#### Business (5)
- `BusinessStories` - Profile pages
- `BusinessImageGallery` - Profiles
- `BusinessItemsList` - Profiles
- `BusinessReservationSidebar` - Profiles
- `BusinessCommandSidebar` - Profiles

#### Forms & Media (4)
- `LoginForm` - Login page
- `SignUpForm` - Register page
- `CameraCapture` - Stories, reels
- File upload components - Products, stories

#### Analytics & AI (3)
- `DarijaAIPanel` - Products, intelligence
- `AIAgent` - All pages (floating)
- `StoreAnalyticsTracker` - Dashboard

#### Specialized (5)
- `SnapchatReels` - Discover
- `StoriesDemo` - Home
- `SmartStrip` - Home, browse
- `GlobalActionDrawer` - Bottom actions
- `StorageUploadDiagnostic` - Diagnostics

---

## PAGE COMPONENT DENSITY

| Page | Component Count | Complexity |
|------|-----------------|-----------|
| Home | 10+ | High |
| Shop | 3-4 | Medium |
| Search | 4-5 | Medium |
| Messages | 3-4 | Medium |
| Dashboard Overview | 5-6 | High |
| Products Management | 8+ | High |
| Transactions | 6+ | High |
| Intelligence | 8+ | Very High |
| Public Profiles | 4-5 | Medium |
| Login/Register | 1 | Low |

---

## REUSABLE PATTERNS

### Modal Pattern
Used in: Products, Tickets, Stories, Reels, Transactions
```
Dialog → DialogContent → DialogHeader/Title/Description → Form → DialogFooter
```

### List with Filters Pattern
Used in: Shop, Search, Transactions, Leads, Tickets
```
Search Input + Select Filters → Item Cards/Table → Pagination
```

### Tab Navigation Pattern
Used in: Dashboard, Business Profile, Reels/Stories
```
Tabs → TabsList (triggers) → TabsContent (pages)
```

### Card Display Pattern
Used throughout
```
Card → CardHeader (title) → CardContent (data)
```

---

## RENDER OPTIMIZATION NOTES

**Dynamic Imports (ssr: false):**
- `ResultsMap` - On search pages
- `BackgroundScene` - On home page

**Suspense Boundaries:**
- Login/Register pages
- Messages page

**Client Components:**
- Most pages marked with 'use client'
- Except public routes (some server)

---

This mapping should help reformulate the INTERFACES_PUBLIQUES_PAR_ACTEUR.md to accurately reflect the actual component composition and feature hierarchy.
