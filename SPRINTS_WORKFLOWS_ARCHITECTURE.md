# 🚀 SPRINTS & WORKFLOWS - ARCHITECTURE FICHIERS

**Projet**: Ro2ya.tn - E-Commerce Marketplace  
**Total Sprints**: 10  
**Total Workflows**: 28  
**Date**: 24 Mai 2026

---

## 📋 SOMMAIRE PAR SPRINT

| Sprint | Thème | Workflows | IA | État |
|--------|-------|-----------|-----|------|
| 1 | Authentification | 2 (Inscription, Connexion) | ❌ | Basique |
| 2 | Gestion magasin | 2 (Création, Validation admin) | ❌ | Basique |
| 3 | Catalogue (produits) | 3 (Ajout, Modif, Création IA) | ✅ (1/3) | Mixte |
| 4 | Promotions | 3 (Ajout, Modif, Recommandation IA) | ✅ (1/3) | Mixte |
| 5 | Contenu social | 5 (Reels, Stories) | ❌ | Basique |
| 6 | Recherche IA | 3 (Sémantique, Image, Geo) | ✅ (3/3) | Avancé |
| 7 | Évaluations | 1 (Poster avis) | ✅ | Mixte |
| 8 | Commandes | 3 (Passer, Accepter, QR) | ❌ | Basique |
| 9 | Favoris | 1 (Ajouter favoris) | ❌ | Basique |
| 10 | Messagerie & Support | 5 (Chat, Support) | ❌ | Basique |
| | **TOTAL** | **28 workflows** | **7/28 (25%)** | |

---

## 🔐 SPRINT 1: AUTHENTIFICATION

### Informations
- **Thème**: Authentification utilisateurs
- **Workflows**: 2
- **IA impliquée**: ❌ Non
- **Complexité**: Basique

### Workflows

#### **Workflow 1: Inscription Utilisateur**

**Description**: Nouvel utilisateur s'inscrit (email, password, profil)

**Fichiers Page**:
```
app/register/page.tsx
  └─ Affiche formulaire inscription
```

**Fichiers Composants**:
```
components/SignUpForm.tsx
  └─ Formulaire avec validation
components/AuthCard.tsx
  └─ Container design
components/session-provider.tsx
  └─ Session context
```

**Server Actions**:
```
lib/actions/auth.ts
  └─ signup() - Créer utilisateur
  └─ sendVerificationEmail() - Envoi email
  └─ verifyEmail() - Vérification token

lib/actions/users.ts
  └─ createUserProfile() - Init profil
  └─ setUserPreferences() - Préférences
```

**Supabase Clients**:
```
lib/supabase/auth.ts
  └─ signUp() - Auth Supabase
  
lib/supabase/database.ts
  └─ insertUser() - Créer ligne users table
```

**API Routes**:
```
app/api/auth/signup
  POST /api/auth/signup
  └─ Request: {email, password, fullName, phone}
  └─ Response: {userId, sessionToken, redirectUrl}
  └─ Calls: auth.ts signup()
```

**Data Flow**:
```
User Input (SignUpForm)
    ↓
Validation (react-hook-form)
    ↓
POST /api/auth/signup
    ↓
auth.ts signup()
    ↓
Supabase: auth.users + users table
    ↓
Email verification sent
    ↓
Redirect /auth/verify-email
```

---

#### **Workflow 2: Connexion Utilisateur**

**Description**: Utilisateur se connecte (email, password)

**Fichiers Page**:
```
app/login/page.tsx
  └─ Affiche formulaire connexion
```

**Fichiers Composants**:
```
components/LoginForm.tsx
  └─ Formulaire login
components/AuthCard.tsx
  └─ Container design
```

**Server Actions**:
```
lib/actions/auth.ts
  └─ login() - Authenticate user
  └─ createSession() - Session creation
  
lib/actions/users.ts
  └─ getUserData() - Fetch user profile
```

**Supabase Clients**:
```
lib/supabase/auth.ts
  └─ signIn() - Auth Supabase
  
lib/supabase/server.ts
  └─ getUser() - Current user
```

**API Routes**:
```
app/api/auth/login
  POST /api/auth/login
  └─ Request: {email, password}
  └─ Response: {userId, sessionToken, redirectUrl}
  
app/api/auth/session
  GET /api/auth/session
  └─ Verify current session
```

**Data Flow**:
```
User Input (LoginForm)
    ↓
POST /api/auth/login
    ↓
auth.ts login()
    ↓
Supabase: auth.signIn()
    ↓
Session token created
    ↓
Store in httpOnly cookie
    ↓
Redirect to dashboard/home
```

---

## 🏪 SPRINT 2: GESTION MAGASIN

### Informations
- **Thème**: Gestion des magasins/boutiques
- **Workflows**: 2
- **IA impliquée**: ❌ Non
- **Complexité**: Basique

### Workflows

#### **Workflow 3: Création Magasin par PRO**

**Description**: Propriétaire crée nouveau magasin (informations, localisation, images)

**Fichiers Page**:
```
app/merchants/business/add/page.tsx
  └─ Formulaire création magasin
  
app/dashboard/[id]/profile/page.tsx
  └─ Édition infos magasin
```

**Fichiers Composants**:
```
components/dashboard/AccountSection.tsx
  └─ Section infos compte

components/ui/MapPicker.tsx
  └─ Sélection localisation sur carte
```

**Server Actions**:
```
lib/actions/stores.ts
  └─ createStore() - Créer magasin
  └─ updateStore() - Modifier infos
  └─ uploadStoreLogo() - Logo upload
  └─ uploadStoreBanner() - Banner upload

lib/actions/addbuss.ts
  └─ validateBusinessInfo() - Validation
  └─ submitBusinessRegistration() - Submit
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertStore() - Insert stores table
  └─ updateStore() - Update stores

lib/supabase/storage.ts
  └─ uploadFile() - Upload logo/banner
```

**API Routes**:
```
app/api/stores
  POST /api/stores
  └─ Request: {name, description, category, address, lat, lng, logo, banner}
  └─ Response: {storeId, status: PENDING}

app/api/stores/[id]
  GET /api/stores/[id] - Get store details
  PUT /api/stores/[id] - Update store info
  
app/api/stores/me
  GET /api/stores/me - Current user's store
```

**Data Flow**:
```
Vendor Form (business/add page)
    ↓
Validation + MapPicker
    ↓
POST /api/stores
    ↓
stores.ts createStore()
    ↓
Upload logo/banner → Cloudinary
    ↓
Supabase: Insert stores + Update user.role = PRO
    ↓
Store status: PENDING (awaiting admin validation)
    ↓
Redirect to dashboard
```

---

#### **Workflow 4: Validation Admin Magasin**

**Description**: Admin valide/rejette créations magasins

**Fichiers Page**:
```
app/dashboard/[id]/page.tsx
  └─ Dashboard admin (admin view)
  
app/public/business/[id]/page.tsx
  └─ Store public after approval
```

**Fichiers Composants**:
```
components/BusinessImageGallery.tsx
  └─ Afficher galerie magasin pour review

components/ReviewModal.tsx
  └─ Modal décision admin
```

**Server Actions**:
```
lib/actions/admin.ts
  └─ approveStore() - Approve magasin
  └─ rejectStore() - Reject magasin
  └─ getStoresForReview() - Get pending stores

lib/actions/notifications.ts
  └─ sendStoreApprovalNotification()
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ updateStore(status='APPROVED'|'REJECTED')
  
lib/supabase/realtime.ts
  └─ subscribeToStoreStatusChanges()
```

**API Routes**:
```
app/api/admin/orders
  GET /api/admin/orders
  └─ List all pending stores for admin review

app/api/stores/[id]
  PUT /api/stores/[id]
  └─ Request: {status: 'APPROVED'|'REJECTED', rejectReason?}
  └─ Admin endpoint to update status
```

**Data Flow**:
```
Admin Dashboard
    ↓
Review pending stores (status=PENDING)
    ↓
Click Approve/Reject
    ↓
PUT /api/stores/[id] {status: APPROVED}
    ↓
admin.ts approveStore()
    ↓
Update stores.status = APPROVED
    ↓
Send notification to store owner
    ↓
Store becomes public + PRO role activated
```

---

## 📦 SPRINT 3: CATALOGUE (PRODUITS)

### Informations
- **Thème**: Gestion catalogue produits/services
- **Workflows**: 3
- **IA impliquée**: ✅ 1/3 (Création produit par IA)
- **Complexité**: Mixte

### Workflows

#### **Workflow 5: Ajout Produit/Service Manuellement**

**Description**: Vendeur ajoute produit/service manuellement (détails, images, prix)

**Fichiers Page**:
```
app/dashboard/[id]/products/page.tsx
  └─ Gestion produits dashboard
```

**Fichiers Composants**:
```
components/CameraCapture.tsx
  └─ Capture photos produit
  
components/dashboard/UploadProgressManager.tsx
  └─ Suivi uploads images
  
components/ui/form.tsx
  └─ Form builder pour détails
```

**Server Actions**:
```
lib/actions/items.ts
  └─ createItem() - Créer produit/service
  └─ uploadItemImages() - Upload images
  └─ generateItemSlug() - Auto slug
  
lib/actions/promotions.ts
  └─ Can link to promotion if active
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertItem() - Insert items table
  
lib/supabase/storage.ts
  └─ uploadFiles() - Upload images
```

**API Routes**:
```
app/api/items
  POST /api/items
  └─ Request: {name, description, price, category, images, stock, duration?}
  └─ Response: {itemId, status: AVAILABLE}

app/api/items/[id]
  GET /api/items/[id] - Item details
  PUT /api/items/[id] - Update item
  DELETE /api/items/[id] - Delete item
```

**Data Flow**:
```
Vendor: Dashboard → Products → Add New
    ↓
Fill form (name, description, price, category)
    ↓
Upload images (via CameraCapture or file)
    ↓
Set stock/duration if service
    ↓
POST /api/items
    ↓
items.ts createItem()
    ↓
Generate embeddings for search
    ↓
Supabase: Insert items table + Images storage
    ↓
Product live in store
```

---

#### **Workflow 6: Modification Produit/Service**

**Description**: Vendeur modifie infos produit existant (prix, stock, images)

**Fichiers Page**:
```
app/dashboard/[id]/products/page.tsx
  └─ Liste produits avec edit action
  
app/api/dashboard/[storeId]/products/[productId]/route.ts
```

**Fichiers Composants**:
```
components/ui/form.tsx
  └─ Edit form pre-filled
```

**Server Actions**:
```
lib/actions/items.ts
  └─ updateItem() - Modifier produit
  └─ updateItemStock() - Modifier stock
  └─ deleteItemImage() - Supprimer image
  └─ updateItemImages() - Ajouter/modifier images
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ updateItem() - Update items table
  
lib/supabase/storage.ts
  └─ deleteFile() - Remove old images
```

**API Routes**:
```
app/api/dashboard/[storeId]/products/[productId]
  GET - Get product for editing
  PUT - Update product
  DELETE - Delete product
```

**Data Flow**:
```
Vendor: Dashboard → Products → Click Edit
    ↓
Load product data (pre-fill form)
    ↓
Modify fields + images
    ↓
PUT /api/dashboard/[storeId]/products/[productId]
    ↓
items.ts updateItem()
    ↓
Update embeddings if content changed
    ↓
Supabase: Update items table + storage
    ↓
Changes live immediately
```

---

#### **Workflow 7: Création Produit par IA** ✅

**Description**: IA génère description/images produit à partir de photo simple

**Fichiers Page**:
```
app/dashboard/[id]/products/page.tsx
  └─ "Create with IA" button
```

**Fichiers Composants**:
```
components/CameraCapture.tsx
  └─ Capture initial product photo
  
components/ui/glowing-ai-chat-assistant.tsx
  └─ IA response display
```

**Server Actions**:
```
lib/actions/ai-agent.ts
  └─ generateProductDescription() - IA description
  └─ generateProductImages() - IA images
  
lib/actions/items.ts
  └─ createItem() - with IA data
  
lib/ai/image-generator.ts
  └─ generateImages() - Cloudflare AI
```

**API Routes**:
```
app/api/ai-agent
  POST /api/ai-agent
  └─ Request: {imageBase64, productCategory, language}
  └─ Response: {description, suggestedTitle, keyFeatures, generatedImages[]}
  
app/api/image-search
  POST /api/image-search
  └─ Search by image to find similar
```

**Data Flow**:
```
Vendor: "Create Product with IA"
    ↓
CameraCapture: Take/upload photo
    ↓
POST /api/ai-agent {image, category}
    ↓
ai-agent.ts generateProductDescription()
    ↓
LLM (OpenRouter/Groq): Analyze image + Generate description
    ↓
image-generator.ts generateImages()
    ↓
Cloudflare AI: Generate product images
    ↓
Display suggestions to vendor
    ↓
Vendor approves/edits
    ↓
POST /api/items with generated data
    ↓
Product created
```

**AI Services Used**:
- 🤖 OpenRouter LLM (description)
- 🖼️ Cloudflare AI (image generation)
- 🔍 Image recognition (analyze uploaded photo)

---

## 🎁 SPRINT 4: PROMOTIONS

### Informations
- **Thème**: Gestion promotions et réductions
- **Workflows**: 3
- **IA impliquée**: ✅ 1/3 (Recommandation promotion IA)
- **Complexité**: Mixte

### Workflows

#### **Workflow 8: Ajout Promotion**

**Description**: Vendeur crée promotion (réduction, produits applicables, dates)

**Fichiers Page**:
```
app/dashboard/[id]/page.tsx
  └─ Dashboard with promotions section
  
app/api/dashboard/[storeId]/promotions
```

**Fichiers Composants**:
```
components/dashboard/PromotionsSection.tsx
  └─ Promotions management UI
  
components/Offers.tsx
  └─ Display active offers
  
components/PromotionBanner.tsx
  └─ Promo banner for hero
```

**Server Actions**:
```
lib/actions/promotions.ts
  └─ createPromotion() - Créer promo
  └─ addItemsToPromotion() - Ajouter produits
  └─ publishPromotion() - Publier
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertPromotion() - Insert promotions table
  └─ insertPromotionItems() - M2M table
```

**API Routes**:
```
app/api/promotions
  GET - List all promotions
  POST - Create promotion
  
app/api/dashboard/[storeId]/promotions
  GET - Store's promotions
  POST - Create for store
  PUT - Update promotion
  DELETE - Delete promotion
```

**Data Flow**:
```
Vendor: Dashboard → Promotions → Add New
    ↓
Form: Title, discount%, valid dates
    ↓
Select products to apply
    ↓
POST /api/dashboard/[storeId]/promotions
    ↓
promotions.ts createPromotion()
    ↓
Supabase: Insert promotions + promotion_items
    ↓
Auto-publish if valid_from <= today
    ↓
Products show discounted price in feed/shop
```

---

#### **Workflow 9: Modification Promotion**

**Description**: Vendeur modifie promotion existante (discount%, dates, produits)

**Fichiers Page**:
```
app/dashboard/[id]/page.tsx
  └─ Edit promo action
```

**Fichiers Composants**:
```
components/dashboard/PromotionsSection.tsx
  └─ Edit form
```

**Server Actions**:
```
lib/actions/promotions.ts
  └─ updatePromotion() - Modify promo
  └─ updatePromotionItems() - Change products
  └─ endPromotion() - Terminate early
```

**API Routes**:
```
app/api/dashboard/[storeId]/promotions
  PUT - Update promotion details
  DELETE - End/delete promotion
```

**Data Flow**:
```
Vendor: Dashboard → Promotions → Edit
    ↓
Pre-fill form with current promo data
    ↓
Modify discount%, dates, products
    ↓
PUT /api/dashboard/[storeId]/promotions/{promoId}
    ↓
promotions.ts updatePromotion()
    ↓
Update Supabase tables
    ↓
Changes reflected in real-time
```

---

#### **Workflow 28: Recommandation Promotion par IA** ✅

**Description**: IA recommande promotions basées sur ventes/trends

**Fichiers Page**:
```
app/dashboard/[id]/intelligence/page.tsx
  └─ Business Intelligence dashboard
  
app/dashboard/[id]/page.tsx
  └─ Dashboard home with AI suggestions
```

**Fichiers Composants**:
```
components/dashboard/AIAdvisorSection.tsx
  └─ AI advisor widget
```

**Server Actions**:
```
lib/actions/sales-analyzer.ts
  └─ analyzeProductPerformance() - Sales data
  └─ recommendPromotions() - IA suggestions
  
lib/actions/ai-notifications.ts
  └─ sendPromotionRecommendation()
  
lib/actions/analyzer-service.ts
  └─ identifyBestSellers() - Analyze trends
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ getStoreTransactions() - Historical sales
  └─ getRecentOrders() - Recent orders
```

**API Routes**:
```
app/api/dashboard/[storeId]/sales-recommendations
  GET - Get AI recommendations
  └─ Returns: [{productId, recommendedDiscount, reason}]
```

**Data Flow**:
```
Vendor: Dashboard → Intelligence
    ↓
GET /api/dashboard/[storeId]/sales-recommendations
    ↓
sales-analyzer.ts analyzeProductPerformance()
    ↓
Query: Recent transactions, views, conversions
    ↓
LLM analysis: Identify underperformers, seasonal trends
    ↓
Return: "Product X: -15% promo likely increases sales"
    ↓
Display AI suggestions with rationale
    ↓
Vendor can 1-click apply suggestions
```

**AI Services Used**:
- 📊 LLM analysis of sales patterns
- 🎯 Predictive modeling for discount impact

---

## 📱 SPRINT 5: CONTENU SOCIAL

### Informations
- **Thème**: Reels, Stories, social content
- **Workflows**: 5
- **IA impliquée**: ❌ Non
- **Complexité**: Basique

### Workflows

#### **Workflow 11: Créer Reel**

**Description**: Vendor/User crée vidéo courte (upload, caption, CTA)

**Fichiers Page**:
```
app/dashboard/[id]/reels/page.tsx
  └─ Reels management (vendor)
  
app/discover/page.tsx
  └─ Reels discovery (consumer)
```

**Fichiers Composants**:
```
components/SnapchatReels.tsx
  └─ Reel viewer
  
components/CameraCapture.tsx
  └─ Video capture
  
components/discover/discover-feed.tsx
  └─ Feed with reels
```

**Server Actions**:
```
lib/actions/reels.ts
  └─ uploadReel() - Create reel
  └─ updateReelMetadata() - Edit caption/CTA
  
lib/actions/items.ts
  └─ linkReelToItem() - Link product to reel
```

**Supabase Clients**:
```
lib/supabase/storage.ts
  └─ uploadFile() - Upload video file
  
lib/supabase/database.ts
  └─ insertReel() - Insert reels table
```

**API Routes**:
```
app/api/reels
  POST - Upload new reel
  GET - Get reels list
  
app/api/dashboard/[storeId]/reels
  GET - Store's reels
  POST - Create for store
  DELETE - Delete reel
```

**Data Flow**:
```
Vendor/User: "Create Reel"
    ↓
CameraCapture: Record/upload video
    ↓
Add caption, CTA (call/whatsapp/view)
    ↓
Link to product (optional)
    ↓
POST /api/reels or /api/dashboard/[id]/reels
    ↓
reels.ts uploadReel()
    ↓
Generate embeddings for recommendation
    ↓
Supabase: Upload video + Insert reels table
    ↓
Reel published + appears in discovery feed
```

---

#### **Workflow 12: Interagir Reels (Like, Comment, Save)**

**Description**: User interagit avec reels (like, comment, save, share)

**Fichiers Page**:
```
app/discover/page.tsx
  └─ Reels feed
```

**Fichiers Composants**:
```
components/discover/discover-card.tsx
  └─ Single reel card
  
components/discover/feed-actions.tsx
  └─ Like, comment, save buttons
  
components/discover/comment-drawer.tsx
  └─ Comments display + form
  
components/ui/share-button.tsx
  └─ Share functionality
```

**Server Actions**:
```
lib/actions/reels.ts
  └─ likeReel() - Like reel
  └─ unlikeReel() - Unlike
  
lib/actions/comments.ts
  └─ postComment() - Add comment
  └─ deleteComment() - Remove comment
  
lib/actions/favorites.ts
  └─ saveReel() - Save/bookmark
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertReelLike() - user_interactions table
  └─ insertReelComment() - reels_comments table
  └─ updateReelStats() - Update reels_stats
```

**API Routes**:
```
app/api/reels/comments
  GET - Get comments for reel
  POST - Add comment
  DELETE - Remove comment
  
app/api/reels (implicit like/save)
```

**Data Flow**:
```
User viewing reel in feed
    ↓
Click Like button
    ↓
POST /api/reels/[id]/like
    ↓
reels.ts likeReel()
    ↓
Insert user_interactions: {user_id, reel_id, type: 'like'}
    ↓
Update reels_stats.likes_count++
    ↓
Like indicator highlighted
    ↓
Similar for comment, save, share
```

---

#### **Workflow 13: Supprimer Reel**

**Description**: Vendor/Admin supprime reel (content moderation)

**Fichiers Page**:
```
app/dashboard/[id]/reels/page.tsx
  └─ Vendor's reels with delete
```

**Server Actions**:
```
lib/actions/reels.ts
  └─ deleteReel() - Soft delete
  └─ hardDeleteReel() - Admin hard delete
  
lib/actions/admin.ts
  └─ removeInappropriateReel()
```

**API Routes**:
```
app/api/dashboard/[storeId]/reels
  DELETE - Soft delete by owner
  
app/api/admin/reels
  DELETE - Hard delete by admin
```

**Data Flow**:
```
Vendor: Dashboard → Reels → Click Delete
    ↓
DELETE /api/dashboard/[storeId]/reels/[reelId]
    ↓
reels.ts deleteReel()
    ↓
Mark as deleted (soft delete) or remove
    ↓
Remove from feed + recommendations
```

---

#### **Workflow 14: Ajouter Story**

**Description**: Vendor crée story temporaire (24h expiry)

**Fichiers Page**:
```
app/dashboard/[id]/stories/page.tsx
  └─ Stories management
  
app/discover/page.tsx
  └─ Stories row at top
```

**Fichiers Composants**:
```
components/BusinessStories.tsx
  └─ Stories display
  
components/discover/DiscoverStoriesRow.tsx
  └─ Stories carousel top of feed
  
components/ui/stories-carousel.tsx
  └─ Stories carousel
```

**Server Actions**:
```
lib/actions/stories.ts
  └─ uploadStory() - Create story
  └─ getStoryViews() - View tracking
```

**API Routes**:
```
app/api/stories
  POST - Upload story
  GET - Get stories list
  
app/api/dashboard/[storeId]/stories (implicit)
```

**Data Flow**:
```
Vendor: Dashboard → Stories → Add
    ↓
Upload image/video
    ↓
Add caption (optional)
    ↓
POST /api/stories
    ↓
stories.ts uploadStory()
    ↓
Set expires_at = now() + 24 hours
    ↓
Supabase: Upload + Insert stories table
    ↓
Story appears in "Stories" row on discover page
```

---

#### **Workflow 15: Supprimer Story**

**Description**: Vendor supprime story manuellement (avant 24h)

**Fichiers Page**:
```
app/dashboard/[id]/stories/page.tsx
  └─ Story with delete action
```

**Server Actions**:
```
lib/actions/stories.ts
  └─ deleteStory() - Remove story
```

**API Routes**:
```
app/api/dashboard/[storeId]/stories
  DELETE - Delete story
```

**Data Flow**:
```
Vendor: Dashboard → Stories → Click Delete
    ↓
DELETE /api/dashboard/[id]/stories/[storyId]
    ↓
stories.ts deleteStory()
    ↓
Remove from storage + database
    ↓
Stop displaying
```

---

## 🔍 SPRINT 6: RECHERCHE IA

### Informations
- **Thème**: Recherche intelligente (sémantique, image, géo)
- **Workflows**: 3
- **IA impliquée**: ✅ 3/3 (Tous)
- **Complexité**: Avancé

### Workflows

#### **Workflow 16: Recherche Sémantique Darija** ✅

**Description**: User recherche en Darija, trouve produits sémantiquement similaires

**Fichiers Page**:
```
app/search/page.tsx
  └─ Search results page
  
app/discover/page.tsx
  └─ Discovery with search
```

**Fichiers Composants**:
```
components/ui/ai-input-with-search.tsx
  └─ Smart search input
  
components/discover/discover-feed.tsx
  └─ Results feed
```

**Server Actions**:
```
lib/actions/search.ts
  └─ performSemanticSearch() - Main search
  
lib/ai/darija-parser.ts
  └─ parseDarijaQuery() - Parse user input
  
lib/actions/ai-agent.ts
  └─ expandQuery() - Generate related terms
```

**Search Libraries**:
```
lib/search/vector-search.ts
  └─ Query embeddings, pgvector search
  
lib/search/hybrid-search.ts
  └─ Combine full-text + semantic
  
lib/search/reranker.ts
  └─ Re-rank results by relevance
  
lib/search/normalizer.ts
  └─ Normalize Darija input
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ Query items with embedding similarity
  └─ rpc('match_items', {query_embedding, threshold})
```

**API Routes**:
```
app/api/semantic-search
  POST - Semantic search
  └─ Request: {query, language, filters}
  └─ Response: [{itemId, score, title, image}]
  
app/api/suggestions
  GET - Search suggestions/autocomplete
```

**Data Flow**:
```
User: Search bar "تاجيين أحمر" (tajine rouge)
    ↓
POST /api/semantic-search {query, language: 'darija'}
    ↓
darija-parser.ts parseDarijaQuery()
    ↓
Normalize + translate to modern standard
    ↓
LLM expand: ["tajine", "red tajine", "moroccan tajine", "pottery"]
    ↓
vector-search.ts vectorSearch()
    ↓
Generate embedding from query
    ↓
Supabase: pgvector similarity search
    ↓
hybrid-search.ts combine(vectorResults, fullText)
    ↓
reranker.ts rerank() - LLM re-ranking
    ↓
Return top 20 results with scores
    ↓
Display in feed
```

**AI Services Used**:
- 🤖 LLM (OpenRouter/Groq) - Parse Darija, expand query
- 🔢 Embeddings (OpenRouter) - Vector conversion
- 📊 Ranking algorithm - Re-rank results

---

#### **Workflow 17: Recherche par Image** ✅

**Description**: User upload image, trouve produits visuellement similaires

**Fichiers Page**:
```
app/search/page.tsx
  └─ Image search tab
```

**Fichiers Composants**:
```
components/CameraCapture.tsx
  └─ Upload/capture image
  
components/ui/ResultsMap.tsx
  └─ Display similar results
```

**Server Actions**:
```
lib/actions/search.ts
  └─ performImageSearch() - Main flow
  
lib/ai/image-generator.ts
  └─ analyzeImage() - Vision analysis
```

**API Routes**:
```
app/api/image-search
  POST - Image search
  └─ Request: {imageBase64 or imageUrl}
  └─ Response: [{itemId, similarity, title, image}]
```

**Data Flow**:
```
User: Upload product photo or take screenshot
    ↓
POST /api/image-search {image}
    ↓
search.ts performImageSearch()
    ↓
image-generator.ts analyzeImage()
    ↓
Cloudflare Vision: Identify objects, colors, style
    ↓
Generate description "Red ceramic tajine with blue pattern"
    ↓
Create embedding from description
    ↓
vector-search.ts vectorSearch()
    ↓
Find visually similar items in DB
    ↓
Return results ranked by similarity
    ↓
Display "Similar products" list
```

**AI Services Used**:
- 👁️ Cloudflare AI Vision - Image analysis
- 🔢 Embeddings - Vector conversion
- 📊 Vector DB - Similarity search

---

#### **Workflow 18: Recherche Géolocalisée** ✅

**Description**: User permet localisation, trouve magasins/produits proches

**Fichiers Page**:
```
app/discover/page.tsx
  └─ "Near me" tab
  
app/search/page.tsx
  └─ Geo-filtered results
```

**Fichiers Composants**:
```
components/ui/MapPicker.tsx
  └─ Map display
  
components/ui/ResultsMap.tsx
  └─ Results on map
```

**Server Actions**:
```
lib/actions/search.ts
  └─ searchByLocation()
  
lib/actions/locations.ts
  └─ getCurrentLocation()
```

**Geolocation APIs**:
```
app/api/geo/nearby
  GET - Nearby stores
  └─ Query: {lat, lng, radius_km, category}
  └─ Response: [{storeId, distance, name, image}]
  
app/api/geo/autocomplete
  GET - Location autocomplete
  
app/api/geo/reverse
  GET - Reverse geocoding (lat/lng → address)
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ Query with spatial indexes (PostGIS)
  └─ rpc('nearby_stores', {lat, lng, radius})
```

**Data Flow**:
```
User: App requests location permission
    ↓
Browser: Get lat/lng
    ↓
GET /api/geo/nearby?lat=33.5&lng=-7.6&radius=5&category=shop
    ↓
search.ts searchByLocation()
    ↓
Supabase PostGIS: Find stores within 5km
    ↓
Calculate distance for each
    ↓
Sort by distance + rating
    ↓
Return top 20 stores
    ↓
Display on map with distance info
```

**Technologies Used**:
- 📍 PostGIS (Supabase spatial queries)
- 🗺️ Leaflet/Mapbox (map display)
- 📡 Geolocation API (browser)

---

## ⭐ SPRINT 7: ÉVALUATIONS

### Informations
- **Thème**: Système d'avis et évaluations
- **Workflows**: 1
- **IA impliquée**: ✅ Analyse sentiment
- **Complexité**: Mixte

### Workflows

#### **Workflow 19: Poster Avis** ✅

**Description**: Client poster avis avec rating, texte, images (sentiment analysis auto)

**Fichiers Page**:
```
app/profile/user/page.tsx
  └─ User reviews section
  
app/public/user/[id]/page.tsx
  └─ Public reviews display
  
app/public/business/[id]/page.tsx
  └─ Store reviews display
```

**Fichiers Composants**:
```
components/ReviewModal.tsx
  └─ Review form with rating/images
  
components/WriteReviewButton.tsx
  └─ Button to write review
  
components/profile/ReviewCard.tsx
  └─ Display single review
  
components/profile/ReviewsList.tsx
  └─ Reviews list
  
components/profile/PublicReviewCard.tsx
  └─ Public review display
```

**Server Actions**:
```
lib/actions/reviews.ts
  └─ postReview() - Create review
  └─ updateReview() - Edit review
  └─ deleteReview() - Remove review
  
lib/ai/comment-analyzer.ts
  └─ analyzeSentiment() - Sentiment analysis
  
lib/actions/admin.ts
  └─ approveReview() - Admin moderation
  └─ rejectReview() - Reject inappropriate
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertReview() - Insert reviews table
  
lib/supabase/storage.ts
  └─ uploadReviewImages() - Upload images
  
lib/supabase/realtime.ts
  └─ subscribeToReviews() - Real-time updates
```

**API Routes**:
```
app/api/reviews (implicit through actions)

app/api/dashboard/[storeId]/reviews
  GET - Store's reviews
  
app/api/comments/analyze
  POST - Analyze sentiment
  └─ Request: {text}
  └─ Response: {sentiment: 'positive'|'negative'|'neutral', score: -1 to 1}
```

**Data Flow**:
```
Customer: Order completed
    ↓
Get "Write Review" prompt/button
    ↓
Click → ReviewModal opens
    ↓
Fill: Rating (1-5 stars), title, comment, images
    ↓
Submit POST /api/reviews
    ↓
reviews.ts postReview()
    ↓
comment-analyzer.ts analyzeSentiment()
    ↓
LLM analysis: Detect sentiment (positive/negative/neutral)
    ↓
Calculate sentiment_score (-1 to 1)
    ↓
Supabase: Insert reviews + Upload images
    ↓
Update store rating_average automatically
    ↓
Review appears in store page (subject to moderation)
    ↓
Vendor can respond to review
    ↓
Admin can approve/reject if needed
```

**AI Services Used**:
- 🤖 LLM (Groq/OpenRouter) - Sentiment analysis
- 🔍 Text classification - Positive/negative detection

---

## 📦 SPRINT 8: COMMANDES

### Informations
- **Thème**: Système de commandes et réservations
- **Workflows**: 3
- **IA impliquée**: ❌ Non
- **Complexité**: Basique

### Workflows

#### **Workflow 20: Passer Commande/Réservation**

**Description**: Client passe commande produit OU réservation service

**Fichiers Page**:
```
app/profile/cart/page.tsx
  └─ Shopping cart view
  
app/merchants/product/[id]/page.tsx
  └─ Product detail + Add to cart
  
app/merchants/service/[id]/page.tsx
  └─ Service detail + Book button
```

**Fichiers Composants**:
```
components/ProductCard.tsx
  └─ Product with "Add to cart" button
  
components/ServiceCard.tsx
  └─ Service with "Book" button
  
components/checkout/CheckoutDrawerContent.tsx
  └─ Complete checkout flow
  
components/reservation/ReservationDrawerContent.tsx
  └─ Service booking flow
  
components/profile/cart.tsx
  └─ Cart items management
  
components/profile/BottomNavigation.tsx
  └─ Cart icon with count
```

**Server Actions**:
```
lib/actions/orders.ts
  └─ createOrder() - Create order from cart
  └─ processOrder() - Process payment
  
lib/actions/reservations.ts
  └─ createBooking() - Create reservation
  
lib/actions/transactions.ts
  └─ processPayment() - Payment processing
  
lib/store/use-cart-store.ts
  └─ Zustand store for cart state
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertOrder() / insertBooking()
  └─ updateItemStock() - Decrease stock
  
lib/supabase/realtime.ts
  └─ updateOrderStatus() - Real-time updates
```

**API Routes**:
```
app/api/orders
  GET - List user orders
  POST - Create order
  
app/api/reservations
  GET - List user reservations
  POST - Create reservation
  
app/api/checkout (implicit)
```

**Data Flow - Product Order**:
```
Customer: Browse products
    ↓
Click "Add to cart"
    ↓
lib/store/use-cart-store.ts addItem()
    ↓
Cart state updated (Zustand)
    ↓
Click "Checkout"
    ↓
CheckoutDrawerContent opens
    ↓
Enter delivery address + payment method
    ↓
POST /api/orders
    ↓
orders.ts createOrder()
    ↓
transactions.ts processPayment()
    ↓
Payment gateway integration
    ↓
If successful:
  - Insert orders table
  - Update items stock
  - Create transaction record
  - Send confirmation to customer + vendor
    ↓
Order status: PENDING (awaiting vendor acceptance)
    ↓
Supabase realtime: Update order status in UI
```

**Data Flow - Service Reservation**:
```
Customer: Browse services
    ↓
Click "Book"
    ↓
ReservationDrawerContent opens
    ↓
Select date + time (from available slots)
    ↓
Enter number of guests
    ↓
POST /api/reservations
    ↓
reservations.ts createBooking()
    ↓
Check availability in service_schedules
    ↓
transactions.ts processPayment()
    ↓
If successful:
  - Insert bookings table
  - Update booking_count
  - Reserve slot (capacity check)
  - Send confirmation
    ↓
Booking status: PENDING (awaiting vendor confirmation)
```

---

#### **Workflow 21: Accepter/Refuser Commande**

**Description**: Vendor accepte ou refuse commande reçue

**Fichiers Page**:
```
app/dashboard/[id]/page.tsx
  └─ Dashboard with pending orders
```

**Fichiers Composants**:
```
components/ProductOrderCard.tsx
  └─ Order display with actions
```

**Server Actions**:
```
lib/actions/orders.ts
  └─ acceptOrder() - Vendor accepts
  └─ rejectOrder() - Vendor rejects
  └─ createShipment() - After accept
  
lib/actions/notifications.ts
  └─ notifyCustomer() - Send notification
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ updateOrderStatus()
  
lib/supabase/realtime.ts
  └─ subscribeToOrders() - Listen to vendor's orders
```

**API Routes**:
```
app/api/admin/orders/[id]/status
  PUT - Update order status
  └─ Request: {status: 'ACCEPTED'|'REJECTED', trackingCode?}
  
app/api/webhooks/order/confirm
  POST - Webhook order confirmed
  
app/api/webhooks/order/refund
  POST - Webhook refund processed
```

**Data Flow**:
```
Vendor: Dashboard → Orders
    ↓
See pending orders (status=PENDING)
    ↓
Click "Accept" or "Reject"
    ↓
If Accept:
  PUT /api/admin/orders/[orderId]/status {status: ACCEPTED}
    ↓
  orders.ts acceptOrder()
    ↓
  Update orders.status = ACCEPTED
  Generate tracking code
  Calculate delivery estimate
    ↓
  Send "Order Confirmed" notification to customer
    ↓
  Update UI in real-time via Supabase realtime
    ↓
If Reject:
  PUT /api/admin/orders/[orderId]/status {status: REJECTED}
    ↓
  Process refund automatically
  Send "Order Rejected" with reason
```

---

#### **Workflow 22: Validation QR Code**

**Description**: Vendor scans QR code pour valider livraison/complétion réservation

**Fichiers Page**:
```
app/dashboard/qr-verify/[code]/page.tsx
  └─ QR verification page
  
app/valider/page.tsx
  └─ Validation interface
```

**Fichiers Composants**:
```
components/@yudiel/react-qr-scanner
  └─ QR code scanner (library)
```

**Server Actions**:
```
lib/actions/orders.ts
  └─ validateOrderQRCode()
  └─ completeOrder() - Mark DELIVERED
  
lib/actions/reservations.ts
  └─ validateReservationQRCode()
  └─ completeBooking() - Mark COMPLETED
  
lib/utils/qr-code.ts
  └─ generateQRCode() - Generate codes
  └─ verifyQRToken() - Validate token
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ getOrderByQRToken()
  └─ getBookingByQRToken()
  └─ updateOrderStatus()
```

**API Routes**:
```
app/api/admin/orders/validate
  POST - Validate QR code
  └─ Request: {qrToken}
  └─ Response: {orderId, status, items, total}
```

**Data Flow**:
```
Vendor: At delivery location
    ↓
Customer shows QR code (from order confirmation email/SMS)
    ↓
Vendor: Open app → "Validate QR"
    ↓
Scan QR code with phone camera
    ↓
POST /api/admin/orders/validate {qrToken}
    ↓
orders.ts validateOrderQRCode()
    ↓
Verify QR token matches order in DB
    ↓
Display order summary (items, total)
    ↓
Vendor confirms delivery
    ↓
Update orders.status = DELIVERED
    ↓
Create transaction record if needed
    ↓
Send "Order Completed" notification
    ↓
Release payment to vendor (if escrow)
    ↓
Request for customer review
```

---

## ❤️ SPRINT 9: FAVORIS

### Informations
- **Thème**: Système de favoris/bookmarks
- **Workflows**: 1
- **IA impliquée**: ❌ Non
- **Complexité**: Basique

### Workflows

#### **Workflow 23: Ajouter aux Favoris**

**Description**: User ajoute/retire items des favoris

**Fichiers Page**:
```
app/profile/user/page.tsx
  └─ User profile with favorites tab
  
app/discover/page.tsx
  └─ Items with heart icon
  
app/shop/page.tsx
  └─ Products with favorite button
```

**Fichiers Composants**:
```
components/FavoriteButton.tsx
  └─ Heart button component
  
components/ProductCard.tsx
  └─ Product with favorite button
  
components/profile/saved-place-card.tsx
  └─ Saved place display
```

**Server Actions**:
```
lib/actions/favorites.ts
  └─ addToFavorites() - Save item
  └─ removeFromFavorites() - Unsave
  └─ getFavorites() - Get user favorites
  
lib/store/use-saves-store.ts
  └─ Zustand store for favorites state
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertSavedPlace() - Insert to saved_places
  └─ deleteSavedPlace() - Remove from saved
```

**API Routes**:
```
app/api/favorites (implicit through actions)
```

**Data Flow**:
```
User: Browsing products/reels
    ↓
Click heart icon on item
    ↓
FavoriteButton onClick handler
    ↓
favorites.ts addToFavorites({userId, itemId})
    ↓
Insert to saved_places table
    ↓
lib/store/use-saves-store.ts update state
    ↓
Heart icon highlighted
    ↓
Click again to remove from favorites
    ↓
favorites.ts removeFromFavorites()
    ↓
Delete from saved_places
    ↓
State updated in real-time
    ↓
User can view all favorites in profile
```

---

## 💬 SPRINT 10: MESSAGERIE & SUPPORT

### Informations
- **Thème**: Messaging et support client
- **Workflows**: 5
- **IA impliquée**: ❌ Non (sauf support technique)
- **Complexité**: Basique

### Workflows

#### **Workflow 24: Chat User-to-User**

**Description**: Utilisateurs s'envoient messages directs

**Fichiers Page**:
```
app/messages/page.tsx
  └─ Messages conversation list
```

**Fichiers Composants**:
```
components/messaging/ChatWindow.tsx
  └─ Main chat interface
  
components/messaging/ConversationSidebar.tsx
  └─ List of conversations
  
components/messaging/ChatMessage.tsx
  └─ Message bubble
  
components/messaging/ChatHeads.tsx
  └─ Active conversations avatars
```

**Server Actions**:
```
lib/actions/messages.ts
  └─ sendMessage() - Send message
  └─ getConversations() - List conversations
  └─ markAsRead() - Mark read
  
lib/hooks/useMessaging.ts
  └─ Messaging hook
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertMessage() - Store message
  
lib/supabase/realtime.ts
  └─ subscribeToMessages() - Real-time new messages
  └─ subscribeToConversations() - Conversation updates
```

**API Routes**:
```
app/api/messages (implicit)
  
app/api/sessions
  GET - Get active sessions/conversations
```

**Data Flow**:
```
User A: Click on User B in contacts
    ↓
ChatWindow opens with conversation
    ↓
Subscribe to messages via Supabase realtime
    ↓
Type message + Send
    ↓
messages.ts sendMessage()
    ↓
Insert messages table: {sender_id, receiver_id, content, is_read: false}
    ↓
Supabase realtime: Push to User B's client
    ↓
User B receives notification
    ↓
Message appears in User B's chat window
    ↓
User B clicks message/window
    ↓
markAsRead()
    ↓
Update messages.is_read = true
    ↓
Notification cleared
```

---

#### **Workflow 25: Chat Client-to-Magasin**

**Description**: Client envoie messages au magasin

**Fichiers Page**:
```
app/messages/page.tsx
  └─ Client can message store
```

**Fichiers Composants**:
```
components/messaging/ChatWindow.tsx
  └─ Store chat interface
  
components/ShareBusinessButton.tsx
  └─ Share store (can lead to messaging)
```

**Server Actions**:
```
lib/actions/messages.ts
  └─ sendMessageToStore() - Send to store
  └─ getStoreConversations() - Store's messages
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertMessage() - {sender_id, receiver_id (store), store_id}
  
lib/supabase/realtime.ts
  └─ subscribeToStoreMessages()
```

**Data Flow**:
```
Customer: Product page
    ↓
Click "Contact Store" or "Ask Question"
    ↓
Message composer opens
    ↓
Type question/request
    ↓
sendMessageToStore()
    ↓
Insert messages: {sender_id: customer, receiver_id: store_owner, store_id}
    ↓
Notify store owner
    ↓
Store can reply in dashboard or mobile app
    ↓
Conversation thread maintained
```

---

#### **Workflow 26: Ticket Support Client**

**Description**: Client crée support ticket pour assistance

**Fichiers Page**:
```
app/messages/page.tsx
  └─ Support option
```

**Fichiers Composants**:
```
components/messaging/SupportChatDrawer.tsx
  └─ Support chat interface
```

**Server Actions**:
```
lib/actions/support.ts
  └─ createTicket() - Create support ticket
  └─ replyToTicket() - Add reply
  └─ escalateTicket() - Escalate to manager
  
lib/actions/notifications.ts
  └─ notifySupportAgent()
```

**Supabase Clients**:
```
lib/supabase/database.ts
  └─ insertSupportTicket() - Create ticket
  └─ insertSupportMessage() - Add message
  └─ updateTicketStatus()
```

**API Routes**:
```
app/api/dashboard/[storeId]/support
  GET - Get store's support tickets
  
app/api/support (implicit)
```

**Data Flow**:
```
Customer: Help/Support option
    ↓
SupportChatDrawer opens
    ↓
Fill: Subject, category, description, attachments
    ↓
support.ts createTicket()
    ↓
Insert support_tickets: {customer_id, subject, status: 'open', priority}
    ↓
Auto-assign to available support agent
    ↓
Send ticket number to customer
    ↓
Support agent receives notification
    ↓
Agent replies via dashboard
    ↓
Chat thread in app for customer
    ↓
Can escalate to manager if needed
    ↓
Close when resolved
```

---

#### **Workflow 27: Chat Store-to-Admin**

**Description**: Store owner chats with admin (billing, issues, etc)

**Fichiers Page**:
```
app/dashboard/[id]/support/tickets/page.tsx
  └─ Store's support view
```

**Fichiers Composants**:
```
components/messaging/ChatWindow.tsx
  └─ Store-admin chat
```

**Server Actions**:
```
lib/actions/messages.ts
  └─ sendToAdmin() - Send message to admin
  
lib/actions/support.ts
  └─ createSupportTicket() - Support ticket
```

**API Routes**:
```
app/api/admin/support (implicit)
```

**Data Flow**:
```
Store Owner: Dashboard → Support
    ↓
Message admin about account issue
    ↓
sendToAdmin()
    ↓
Create support ticket or direct message
    ↓
Route to admin support team
    ↓
Admin responds
    ↓
Store sees response in dashboard
```

---

## 🔄 MAPPAGE FICHIERS PAR SPRINT

### Sprint 1: Auth
```
Pages: app/register/page.tsx, app/login/page.tsx
Components: SignUpForm, LoginForm, AuthCard
Actions: auth.ts, users.ts
API: /auth/signup, /auth/login, /auth/session
```

### Sprint 2: Store Management
```
Pages: app/merchants/business/add/page.tsx
Components: MapPicker, AccountSection
Actions: stores.ts, addbuss.ts
API: /stores, /stores/[id], /stores/me
```

### Sprint 3: Catalogue
```
Pages: app/dashboard/[id]/products/page.tsx
Components: ProductCard, CameraCapture, UploadProgressManager
Actions: items.ts, ai-agent.ts (workflow 7), image-generator.ts (workflow 7)
API: /items, /ai-agent, /image-search
```

### Sprint 4: Promotions
```
Pages: app/dashboard/[id]/page.tsx
Components: PromotionsSection, Offers, PromotionBanner
Actions: promotions.ts, sales-analyzer.ts (workflow 28)
API: /promotions, /dashboard/[storeId]/promotions
```

### Sprint 5: Social
```
Pages: app/discover/page.tsx, app/dashboard/[id]/reels/page.tsx, app/dashboard/[id]/stories/page.tsx
Components: SnapchatReels, DiscoverStoriesRow, CameraCapture
Actions: reels.ts, stories.ts, comments.ts
API: /reels, /reels/comments, /stories
```

### Sprint 6: Search
```
Pages: app/search/page.tsx
Components: ai-input-with-search, ResultsMap
Actions: search.ts, darija-parser.ts (workflow 16), ai-agent.ts
Libraries: vector-search.ts, hybrid-search.ts, reranker.ts
API: /semantic-search, /image-search, /geo/nearby, /geo/autocomplete
```

### Sprint 7: Reviews
```
Pages: app/profile/user/page.tsx, app/public/business/[id]/page.tsx
Components: ReviewModal, ReviewCard, ReviewsList
Actions: reviews.ts, comment-analyzer.ts (sentiment)
API: /comments/analyze
```

### Sprint 8: Orders
```
Pages: app/profile/cart/page.tsx, app/dashboard/qr-verify/[code]/page.tsx
Components: CheckoutDrawerContent, ProductOrderCard, cart
Actions: orders.ts, reservations.ts, transactions.ts
API: /orders, /reservations, /admin/orders/validate
```

### Sprint 9: Favorites
```
Components: FavoriteButton, saved-place-card
Actions: favorites.ts
```

### Sprint 10: Messaging
```
Pages: app/messages/page.tsx
Components: ChatWindow, ConversationSidebar, SupportChatDrawer
Actions: messages.ts, support.ts
```

---

## 📊 RÉSUMÉ GLOBAL

| Élément | Count | Détail |
|---------|-------|--------|
| **Total Sprints** | 10 | Authentification → Messagerie |
| **Total Workflows** | 28 | 2-5 workflows par sprint |
| **Avec IA** | 7 | Sprints 3, 4, 6, 7 |
| **Pages principales** | 25+ | Routes principales |
| **Composants critiques** | 120+ | Core UI |
| **Server Actions** | 38+ | Logic serveur |
| **API Endpoints** | 35+ | Backend routes |
| **Supabase Clients** | 9 | DB, Auth, Storage, Realtime |

---

**Généré**: 24 Mai 2026  
**Analyseur**: Copilot AI - Sprint & Workflow Architecture Tool
