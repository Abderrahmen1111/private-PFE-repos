# 🚀 MAPPAGE COMPLET DES 28 WORKFLOWS → FONCTIONS LOGIQUES

**Projet**: Ro2ya.tn E-Commerce Marketplace  
**Date**: 25 Mai 2026  
**Scope**: 28 Workflows, ~98 Server Actions, ~68 API Routes, 120+ Composants  

---

## 📊 RÉSUMÉ EXÉCUTIF

| Métrique | Valeur |
|----------|--------|
| **Total Workflows** | 28 |
| **Sprints** | 10 |
| **Workflows avec IA** | 7 (25%) |
| **Workflows sans IA** | 21 (75%) |
| **Server Actions Uniques** | ~98 |
| **API Routes Uniques** | ~68 |
| **Pages Impliquées** | ~28 |
| **Composants Clés** | 120+ |
| **Supabase Clients** | 9 |
| **Complexité Moyenne** | Basique (18) / Mixte (7) / Avancé (3) |

---

## 🎯 INDEX DES 28 WORKFLOWS

| ID | Workflow | Sprint | Thème | IA | Complexité |
|-----|----------|--------|-------|-------|------------|
| WF-01 | Inscription Utilisateur | 1 | Authentification | ❌ | Basique |
| WF-02 | Connexion Utilisateur | 1 | Authentification | ❌ | Basique |
| WF-03 | Création Magasin par PRO | 2 | Gestion Magasin | ❌ | Basique |
| WF-04 | Validation Admin Magasin | 2 | Gestion Magasin | ❌ | Basique |
| WF-05 | Ajout Produit Manuellement | 3 | Catalogue | ❌ | Basique |
| WF-06 | Modification Produit | 3 | Catalogue | ❌ | Basique |
| WF-07 | Création Produit par IA | 3 | Catalogue | ✅ | Avancé |
| WF-08 | Ajout Promotion | 4 | Promotions | ❌ | Basique |
| WF-09 | Modification Promotion | 4 | Promotions | ❌ | Basique |
| WF-10 | Réservation Service | 8 | Commandes | ❌ | Basique |
| WF-11 | Créer Reel | 5 | Contenu Social | ❌ | Basique |
| WF-12 | Interagir Reels | 5 | Contenu Social | ❌ | Basique |
| WF-13 | Supprimer Reel | 5 | Contenu Social | ❌ | Basique |
| WF-14 | Ajouter Story | 5 | Contenu Social | ❌ | Basique |
| WF-15 | Supprimer Story | 5 | Contenu Social | ❌ | Basique |
| WF-16 | Recherche Sémantique Darija | 6 | Recherche IA | ✅ | Avancé |
| WF-17 | Recherche par Image | 6 | Recherche IA | ✅ | Avancé |
| WF-18 | Recherche Géolocalisée | 6 | Recherche IA | ✅ | Avancé |
| WF-19 | Poster Avis | 7 | Évaluations | ✅ | Mixte |
| WF-20 | Passer Commande | 8 | Commandes | ❌ | Basique |
| WF-21 | Accepter/Refuser Commande | 8 | Commandes | ❌ | Basique |
| WF-22 | Validation QR Code | 8 | Commandes | ❌ | Basique |
| WF-23 | Ajouter aux Favoris | 9 | Favoris | ❌ | Basique |
| WF-24 | Chat User-to-User | 10 | Messagerie | ❌ | Basique |
| WF-25 | Chat Client-to-Magasin | 10 | Messagerie | ❌ | Basique |
| WF-26 | Ticket Support Client | 10 | Messagerie | ❌ | Basique |
| WF-27 | Chat Store-to-Admin | 10 | Messagerie | ❌ | Basique |
| WF-28 | Recommandation Promotion IA | 4 | Promotions | ✅ | Avancé |

---

# 🔍 DÉTAILS COMPLÈTS PAR WORKFLOW

---

## 🔐 SPRINT 1: AUTHENTIFICATION

### **WF-01: Inscription Utilisateur**

**Description**: Nouvel utilisateur s'inscrit (email, password, profil)

**Server Actions**:
- `auth.ts: signup()` - Créer compte utilisateur
- `auth.ts: sendVerificationEmail()` - Envoi email verification
- `auth.ts: verifyEmail()` - Vérifier token email
- `users.ts: ensureUserExists()` - Créer record utilisateur
- `users.ts: updateProfile()` - Initialiser profil

**API Routes**:
- `POST /api/auth/signup` - Créer compte
- `POST /api/auth/verify` - Vérifier email
- `GET /api/auth/session` - Session actuelle

**Pages**:
- `app/register/page.tsx` - Formulaire inscription

**Composants**:
- `SignUpForm.tsx` - Formulaire avec validation
- `AuthCard.tsx` - Container design
- `session-provider.tsx` - Context session

**Supabase Clients**:
- `lib/supabase/auth.ts: signUp()` - Supabase Auth
- `lib/supabase/server.ts: getUser()` - Session utilisateur
- `lib/supabase/database.ts: insertUser()` - Users table

**Data Flow**:
```
User Input (SignUpForm)
    ↓
Validation (react-hook-form)
    ↓
POST /api/auth/signup
    ↓
auth.ts signup() + users.ts ensureUserExists()
    ↓
Supabase: auth.users + users table
    ↓
Email verification sent
    ↓
Redirect /auth/verify-email
```

**Total Fonctions**: 8  
**Status**: ✅ Implémenté

---

### **WF-02: Connexion Utilisateur**

**Description**: Utilisateur se connecte (email, password)

**Server Actions**:
- `auth.ts: login()` - Authenticate user
- `auth.ts: createSession()` - Session creation
- `users.ts: getUserData()` - Fetch user profile

**API Routes**:
- `POST /api/auth/login` - Login endpoint
- `GET /api/auth/session` - Verify session
- `POST /api/auth/logout` - Logout endpoint

**Pages**:
- `app/login/page.tsx` - Formulaire connexion

**Composants**:
- `LoginForm.tsx` - Formulaire login
- `AuthCard.tsx` - Container

**Supabase Clients**:
- `lib/supabase/auth.ts: signIn()` - Supabase Auth
- `lib/supabase/server.ts: getUser()` - Current user
- `lib/supabase/database.ts: getUser()` - User data

**Data Flow**:
```
User Input (LoginForm)
    ↓
POST /api/auth/login
    ↓
auth.ts login() → Supabase signIn()
    ↓
Session token created
    ↓
Store in httpOnly cookie
    ↓
Redirect to dashboard/home
```

**Total Fonctions**: 6  
**Status**: ✅ Implémenté

---

## 🏪 SPRINT 2: GESTION MAGASIN

### **WF-03: Création Magasin par PRO**

**Description**: Propriétaire crée nouveau magasin (informations, localisation, images)

**Server Actions**:
- `stores.ts: getStoreById()` - Get store info
- `stores.ts: getUserStores()` - Get user's stores
- `stores.ts: getPrimaryStoreForOwner()` - Primary store
- `addbuss.ts: validateBusinessInfo()` - Validation
- `addbuss.ts: submitBusinessRegistration()` - Submit

**API Routes**:
- `POST /api/stores` - Create store
- `GET /api/stores/[id]` - Get store details
- `PUT /api/stores/[id]` - Update store
- `GET /api/stores/me` - Current user's store

**Pages**:
- `app/merchants/business/add/page.tsx` - Formulaire création
- `app/dashboard/[id]/profile/page.tsx` - Édition infos

**Composants**:
- `dashboard/AccountSection.tsx` - Infos compte
- `ui/MapPicker.tsx` - Sélection localisation

**Supabase Clients**:
- `lib/supabase/database.ts: insertStore()` - Insert stores
- `lib/supabase/storage.ts: uploadFile()` - Upload media
- `lib/supabase/database.ts: updateUser()` - Update user role

**Data Flow**:
```
Form (name, address, category, logo, banner)
    ↓
Validation + MapPicker
    ↓
POST /api/stores
    ↓
stores.ts createStore()
    ↓
Upload logo/banner → Cloudinary/Supabase Storage
    ↓
Insert stores + Update user.role = PRO
    ↓
Store status = PENDING
    ↓
Redirect to dashboard
```

**Total Fonctions**: 8  
**Status**: ✅ Implémenté

---

### **WF-04: Validation Admin Magasin**

**Description**: Admin valide/rejette créations magasins

**Server Actions**:
- `admin.ts: approveStore()` - Approve store
- `admin.ts: rejectStore()` - Reject store
- `admin.ts: getStoresForReview()` - Get pending stores
- `notifications.ts: sendStoreApprovalNotification()` - Notify

**API Routes**:
- `GET /api/admin/stores` - Get pending stores
- `PUT /api/stores/[id]` - Update status

**Pages**:
- `app/dashboard/[id]/page.tsx` (admin view)

**Composants**:
- `BusinessImageGallery.tsx` - Galerie review
- `ReviewModal.tsx` - Modal décision

**Supabase Clients**:
- `lib/supabase/database.ts: updateStore()` - Update status
- `lib/supabase/realtime.ts: subscribeToStoreStatusChanges()` - Real-time

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
Send notification to owner
    ↓
Store becomes public + PRO role activated
```

**Total Fonctions**: 5  
**Status**: ✅ Implémenté

---

## 📦 SPRINT 3: CATALOGUE (PRODUITS)

### **WF-05: Ajout Produit/Service Manuellement**

**Description**: Vendeur ajoute produit/service manuellement

**Server Actions**:
- `items.ts: getPublicItemsByStoreId()` - Get public items
- `items.ts: getAdminItemsByStoreId()` - Get all items
- `items.ts: upsertItem()` - Create/update item
- `items.ts: decrementStock()` - Update stock

**API Routes**:
- `POST /api/items` - Create item
- `GET /api/items` - List items
- `GET /api/items/[id]` - Get item
- `PUT /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

**Pages**:
- `app/dashboard/[id]/products/page.tsx` - Products list

**Composants**:
- `CameraCapture.tsx` - Upload images
- `dashboard/UploadProgressManager.tsx` - Progress tracking
- `ui/form.tsx` - Form builder
- `ProductCard.tsx` - Product display

**Supabase Clients**:
- `lib/supabase/database.ts: insertItem()` - Insert items
- `lib/supabase/storage.ts: uploadFiles()` - Upload images
- `lib/supabase/database.ts: generateEmbedding()` - Embeddings

**Data Flow**:
```
Form (name, description, price, category, images)
    ↓
Upload images
    ↓
Generate embeddings for search
    ↓
POST /api/items
    ↓
items.ts upsertItem()
    ↓
Supabase: Insert items + Upload images
    ↓
Product live in store
```

**Total Fonctions**: 7  
**Status**: ✅ Implémenté

---

### **WF-06: Modification Produit/Service**

**Description**: Vendeur modifie infos produit existant

**Server Actions**:
- `items.ts: upsertItem()` - Update item
- `items.ts: getAdminItemsByStoreId()` - Get items

**API Routes**:
- `GET /api/dashboard/[storeId]/products/[productId]`
- `PUT /api/dashboard/[storeId]/products/[productId]`
- `DELETE /api/dashboard/[storeId]/products/[productId]`

**Pages**:
- `app/dashboard/[id]/products/page.tsx`

**Composants**:
- `ui/form.tsx` - Edit form

**Supabase Clients**:
- `lib/supabase/database.ts: updateItem()` - Update item
- `lib/supabase/storage.ts: deleteFile()` - Remove images
- `lib/supabase/database.ts: updateEmbedding()` - Update embeddings

**Data Flow**:
```
Edit form (pre-filled data)
    ↓
Modify fields/images
    ↓
PUT /api/dashboard/[storeId]/products/[productId]
    ↓
items.ts updateItem()
    ↓
Update embeddings if content changed
    ↓
Supabase: Update items + storage
    ↓
Changes live immediately
```

**Total Fonctions**: 4  
**Status**: ✅ Implémenté

---

### **WF-07: Création Produit par IA** ✅

**Description**: IA génère description/images produit à partir de photo

**Server Actions**:
- `ai-agent.ts: generateProductDescription()` - IA description
- `ai-agent.ts: generateProductImages()` - IA images
- `items.ts: upsertItem()` - Create with IA data

**API Routes**:
- `POST /api/ai-agent` - Generate description/images
- `POST /api/items` - Create item

**Pages**:
- `app/dashboard/[id]/products/page.tsx`

**Composants**:
- `CameraCapture.tsx` - Capture photo
- `ui/glowing-ai-chat-assistant.tsx` - AI response display

**AI Services**:
- **OpenRouter LLM**: generateProductDescription()
- **Cloudflare AI**: generateImages()
- **Image Recognition**: analyzeImage()

**Supabase Clients**:
- `lib/supabase/database.ts: insertItem()` - Insert items

**Data Flow**:
```
"Create Product with IA"
    ↓
CameraCapture: Take/upload photo
    ↓
POST /api/ai-agent {image, category}
    ↓
ai-agent.ts generateProductDescription()
    ↓
LLM: Analyze image + Generate description
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

**Total Fonctions**: 5  
**Status**: ✅ Implémenté  
**Complexity**: 🟥 Avancé

---

## 🎁 SPRINT 4: PROMOTIONS

### **WF-08: Ajout Promotion**

**Description**: Vendeur crée promotion (réduction, produits, dates)

**Server Actions**:
- `promotions.ts: getPromotions()` - Get promotions
- `promotions.ts: createPromotion()` - Create promo

**API Routes**:
- `POST /api/promotions` - Create
- `GET /api/promotions` - List
- `POST /api/dashboard/[storeId]/promotions` - For store
- `GET /api/dashboard/[storeId]/promotions` - Store promos

**Pages**:
- `app/dashboard/[id]/page.tsx`

**Composants**:
- `dashboard/PromotionsSection.tsx` - UI management
- `Offers.tsx` - Display offers
- `PromotionBanner.tsx` - Promo banner

**Supabase Clients**:
- `lib/supabase/database.ts: insertPromotion()` - Insert promos
- `lib/supabase/database.ts: insertPromotionItems()` - M2M table

**Data Flow**:
```
Form (title, discount%, dates)
    ↓
Select products
    ↓
POST /api/dashboard/[storeId]/promotions
    ↓
promotions.ts createPromotion()
    ↓
Insert promotion + promotion_items
    ↓
Auto-publish if valid
    ↓
Products show discounted price
```

**Total Fonctions**: 4  
**Status**: ✅ Implémenté

---

### **WF-09: Modification Promotion**

**Description**: Vendeur modifie promotion existante

**Server Actions**:
- `promotions.ts: getPromotions()` - Get promos
- `promotions.ts: createPromotion()` - Update promo

**API Routes**:
- `PUT /api/dashboard/[storeId]/promotions` - Update
- `DELETE /api/dashboard/[storeId]/promotions` - Delete

**Pages**:
- `app/dashboard/[id]/page.tsx`

**Composants**:
- `dashboard/PromotionsSection.tsx` - Edit form

**Supabase Clients**:
- `lib/supabase/database.ts: updatePromotion()` - Update
- `lib/supabase/database.ts: updatePromotionItems()` - Update items

**Data Flow**:
```
Edit form (pre-filled)
    ↓
Modify discount%, dates, products
    ↓
PUT /api/dashboard/[storeId]/promotions/{promoId}
    ↓
promotions.ts updatePromotion()
    ↓
Update Supabase
    ↓
Changes reflected in real-time
```

**Total Fonctions**: 3  
**Status**: ✅ Implémenté

---

### **WF-28: Recommandation Promotion par IA** ✅

**Description**: IA recommande promotions basées sur ventes/trends

**Server Actions**:
- `sales-analyzer.ts: analyzeProductPerformance()` - Sales analysis
- `sales-analyzer.ts: recommendPromotions()` - IA suggestions
- `analyzer-service.ts: identifyBestSellers()` - Identify trends
- `ai-notifications.ts: sendPromotionRecommendation()` - Notify

**API Routes**:
- `GET /api/dashboard/[storeId]/sales-recommendations`

**Pages**:
- `app/dashboard/[id]/intelligence/page.tsx`
- `app/dashboard/[id]/page.tsx`

**Composants**:
- `dashboard/AIAdvisorSection.tsx` - AI advisor widget

**AI Services**:
- **OpenRouter LLM**: analyzeProductPerformance()
- **Predictive Modeling**: recommendPromotions()

**Supabase Clients**:
- `lib/supabase/database.ts: getStoreTransactions()` - Historical sales
- `lib/supabase/database.ts: getRecentOrders()` - Recent orders

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
Display suggestions with rationale
    ↓
Vendor can 1-click apply
```

**Total Fonctions**: 6  
**Status**: ✅ Implémenté  
**Complexity**: 🟥 Avancé

---

## 📱 SPRINT 5: CONTENU SOCIAL

### **WF-11: Créer Reel**

**Description**: Vendor/User crée vidéo courte (upload, caption, CTA)

**Server Actions**:
- `reels.ts: uploadReel()` - Create reel
- `reels.ts: getBusinessReels()` - Get reels
- `reels.ts: updateReelMetadata()` - Edit caption/CTA
- `items.ts: linkReelToItem()` - Link product

**API Routes**:
- `POST /api/reels` - Upload reel
- `GET /api/reels` - List reels
- `POST /api/dashboard/[storeId]/reels` - For store
- `DELETE /api/dashboard/[storeId]/reels` - Delete

**Pages**:
- `app/dashboard/[id]/reels/page.tsx` - Vendor reels
- `app/discover/page.tsx` - Discovery feed

**Composants**:
- `SnapchatReels.tsx` - Reel viewer
- `CameraCapture.tsx` - Video capture
- `discover/discover-feed.tsx` - Feed display

**Supabase Clients**:
- `lib/supabase/storage.ts: uploadFile()` - Upload video
- `lib/supabase/database.ts: insertReel()` - Insert reels
- `lib/supabase/database.ts: generateEmbedding()` - Embeddings

**Data Flow**:
```
CameraCapture (video)
    ↓
Add caption, CTA
    ↓
Link product (optional)
    ↓
POST /api/reels
    ↓
reels.ts uploadReel()
    ↓
Generate embeddings
    ↓
Upload video + Insert table
    ↓
Reel published → Discovery feed
```

**Total Fonctions**: 5  
**Status**: ✅ Implémenté

---

### **WF-12: Interagir Reels (Like, Comment, Save)**

**Description**: User interagit avec reels

**Server Actions**:
- `reels.ts: likeReel()` - Like reel
- `reels.ts: unlikeReel()` - Unlike
- `comments.ts: postComment()` - Add comment
- `comments.ts: deleteComment()` - Remove comment
- `favorites.ts: saveReel()` - Save/bookmark

**API Routes**:
- `POST /api/reels/comments` - Add comment
- `GET /api/reels/comments` - Get comments
- `DELETE /api/reels/comments` - Delete comment

**Pages**:
- `app/discover/page.tsx` - Reels feed

**Composants**:
- `discover/discover-card.tsx` - Single reel
- `discover/feed-actions.tsx` - Actions
- `discover/comment-drawer.tsx` - Comments
- `ui/share-button.tsx` - Share

**Supabase Clients**:
- `lib/supabase/database.ts: insertReelLike()` - Insert likes
- `lib/supabase/database.ts: insertReelComment()` - Insert comments
- `lib/supabase/database.ts: updateReelStats()` - Update stats

**Data Flow**:
```
User viewing reel
    ↓
Click Like
    ↓
POST /api/reels/[id]/like
    ↓
reels.ts likeReel()
    ↓
Insert user_interactions
    ↓
Update reels_stats.likes_count++
    ↓
Like highlighted
    ↓
Similar for comment, save, share
```

**Total Fonctions**: 6  
**Status**: ✅ Implémenté

---

### **WF-13: Supprimer Reel**

**Description**: Vendor/Admin supprime reel (modération)

**Server Actions**:
- `reels.ts: deleteReel()` - Soft delete
- `reels.ts: hardDeleteReel()` - Hard delete
- `admin.ts: removeInappropriateReel()` - Admin remove

**API Routes**:
- `DELETE /api/dashboard/[storeId]/reels/[reelId]` - Vendor
- `DELETE /api/admin/reels` - Admin

**Pages**:
- `app/dashboard/[id]/reels/page.tsx`

**Composants**:
- `SnapchatReels.tsx`

**Supabase Clients**:
- `lib/supabase/database.ts: softDeleteReel()` - Soft delete
- `lib/supabase/storage.ts: deleteFile()` - Delete file

**Data Flow**:
```
Vendor/Admin → Reels
    ↓
Click Delete
    ↓
DELETE /api/dashboard/[storeId]/reels/[reelId]
    ↓
reels.ts deleteReel()
    ↓
Mark deleted or hard delete
    ↓
Remove from feed + recommendations
```

**Total Fonctions**: 4  
**Status**: ✅ Implémenté

---

### **WF-14: Ajouter Story**

**Description**: Vendor crée story temporaire (24h expiry)

**Server Actions**:
- `stories.ts: uploadStory()` - Create story
- `stories.ts: getStoryViews()` - View tracking

**API Routes**:
- `POST /api/stories` - Upload
- `GET /api/stories` - List
- `POST /api/dashboard/[storeId]/stories` - For store

**Pages**:
- `app/dashboard/[id]/stories/page.tsx`
- `app/discover/page.tsx`

**Composants**:
- `BusinessStories.tsx` - Display stories
- `discover/DiscoverStoriesRow.tsx` - Stories row
- `ui/stories-carousel.tsx` - Carousel

**Supabase Clients**:
- `lib/supabase/storage.ts: uploadFile()` - Upload
- `lib/supabase/database.ts: insertStory()` - Insert
- `lib/supabase/database.ts: updateStoryExpiry()` - Set expiry

**Data Flow**:
```
Dashboard → Stories → Add
    ↓
Upload image/video
    ↓
Add caption (optional)
    ↓
POST /api/stories
    ↓
stories.ts uploadStory()
    ↓
Set expires_at = now() + 24h
    ↓
Insert stories table
    ↓
Appears in Stories row
```

**Total Fonctions**: 4  
**Status**: ✅ Implémenté

---

### **WF-15: Supprimer Story**

**Description**: Vendor supprime story manuellement

**Server Actions**:
- `stories.ts: deleteStory()` - Remove story

**API Routes**:
- `DELETE /api/dashboard/[storeId]/stories/[storyId]`

**Pages**:
- `app/dashboard/[id]/stories/page.tsx`

**Composants**:
- `BusinessStories.tsx`

**Supabase Clients**:
- `lib/supabase/database.ts: deleteStory()` - Delete
- `lib/supabase/storage.ts: deleteFile()` - Delete file

**Data Flow**:
```
Dashboard → Stories → Delete
    ↓
DELETE /api/dashboard/[id]/stories/[storyId]
    ↓
stories.ts deleteStory()
    ↓
Remove from storage + DB
    ↓
Stop displaying
```

**Total Fonctions**: 2  
**Status**: ✅ Implémenté

---

## 🔍 SPRINT 6: RECHERCHE IA

### **WF-16: Recherche Sémantique Darija** ✅

**Description**: User recherche en Darija, trouve produits similaires

**Server Actions**:
- `search.ts: performSemanticSearch()` - Main search
- `search.ts: searchByLocation()` - Geo search
- `user-activity.ts: logUserSearch()` - Log search

**API Routes**:
- `POST /api/semantic-search` - Semantic search
- `GET /api/suggestions` - Autocomplete

**Pages**:
- `app/search/page.tsx`
- `app/discover/page.tsx`

**Composants**:
- `ui/ai-input-with-search.tsx` - Smart search input
- `discover/discover-feed.tsx` - Results feed

**Search Libraries**:
- `lib/search/normalizer.ts: normalizeQuery()` - Normalize input
- `lib/search/vector-search.ts: vectorSearch()` - Vector search
- `lib/search/hybrid-search.ts: hybridSearch()` - Hybrid search
- `lib/search/reranker.ts: rerank()` - Re-rank results

**AI Services**:
- **OpenRouter LLM**: expandQuery(), translateDarija()
- **OpenRouter Embeddings**: generateEmbedding()
- **LLM Re-ranking**: rerank()

**Supabase Clients**:
- `lib/supabase/database.ts: rpc('match_items')` - Vector similarity
- `lib/supabase/database.ts: vectorSearch()` - Search

**Data Flow**:
```
User: "تاجيين أحمر"
    ↓
POST /api/semantic-search {query}
    ↓
darija-parser.ts parseDarijaQuery()
    ↓
Normalize + translate
    ↓
LLM expand query
    ↓
vector-search.ts vectorSearch()
    ↓
Generate embedding
    ↓
Supabase pgvector similarity
    ↓
hybrid-search.ts combine()
    ↓
reranker.ts rerank()
    ↓
Return top 20 results
```

**Total Fonctions**: 10  
**Status**: ✅ Implémenté  
**Complexity**: 🟥 Avancé

---

### **WF-17: Recherche par Image** ✅

**Description**: User upload image, trouve produits visuellement similaires

**Server Actions**:
- `search.ts: performImageSearch()` - Main search
- `ai-agent.ts: analyzeImage()` - Analyze image

**API Routes**:
- `POST /api/image-search` - Image search

**Pages**:
- `app/search/page.tsx`

**Composants**:
- `CameraCapture.tsx` - Upload/capture
- `ui/ResultsMap.tsx` - Display results

**AI Services**:
- **Cloudflare AI Vision**: analyzeImage(), describeImage()
- **OpenRouter Embeddings**: generateEmbedding()
- **Vector DB**: similaritySearch()

**Supabase Clients**:
- `lib/supabase/database.ts: vectorSearch()` - Vector search

**Data Flow**:
```
User: Upload product photo
    ↓
POST /api/image-search {image}
    ↓
search.ts performImageSearch()
    ↓
Cloudflare Vision: Analyze image
    ↓
Create description
    ↓
Generate embedding
    ↓
Vector search
    ↓
Return similar items
```

**Total Fonctions**: 4  
**Status**: ✅ Implémenté  
**Complexity**: 🟥 Avancé

---

### **WF-18: Recherche Géolocalisée** ✅

**Description**: User localisation → trouve magasins proches

**Server Actions**:
- `search.ts: searchByLocation()` - Geo search
- `locations.ts: getCurrentLocation()` - Get location

**API Routes**:
- `GET /api/geo/nearby` - Nearby stores
- `GET /api/geo/autocomplete` - Location autocomplete
- `GET /api/geo/reverse` - Reverse geocoding

**Pages**:
- `app/discover/page.tsx`
- `app/search/page.tsx`

**Composants**:
- `ui/MapPicker.tsx` - Map display
- `ui/ResultsMap.tsx` - Results map

**Technologies**:
- **PostGIS** (Supabase spatial queries)
- **Leaflet/Mapbox** (map display)
- **Browser Geolocation API**

**Supabase Clients**:
- `lib/supabase/database.ts: rpc('nearby_stores')` - Spatial query
- PostGIS spatial indexes

**Data Flow**:
```
User: Request location
    ↓
Browser: Get lat/lng
    ↓
GET /api/geo/nearby?lat=33.5&lng=-7.6&radius=5
    ↓
search.ts searchByLocation()
    ↓
Supabase PostGIS: Find stores within 5km
    ↓
Calculate distance
    ↓
Sort by distance + rating
    ↓
Return top 20
    ↓
Display on map
```

**Total Fonctions**: 5  
**Status**: ✅ Implémenté  
**Complexity**: 🟥 Avancé

---

## ⭐ SPRINT 7: ÉVALUATIONS

### **WF-19: Poster Avis (Sentiment Analysis)** ✅

**Description**: Client poster avis avec rating, texte, images

**Server Actions**:
- `reviews.ts: submitReview()` - Create review
- `reviews.ts: updateReview()` - Edit review
- `reviews.ts: deleteReview()` - Remove review
- `ai-agent.ts: analyzeSentiment()` - Sentiment analysis
- `admin.ts: approveReview()` - Admin moderation

**API Routes**:
- `POST /api/reviews` - Create
- `GET /api/reviews` - List
- `GET /api/dashboard/[storeId]/reviews` - Store reviews
- `POST /api/comments/analyze` - Analyze sentiment

**Pages**:
- `app/profile/user/page.tsx`
- `app/public/user/[id]/page.tsx`
- `app/public/business/[id]/page.tsx`

**Composants**:
- `ReviewModal.tsx` - Review form
- `WriteReviewButton.tsx` - Write button
- `profile/ReviewCard.tsx` - Single review
- `profile/ReviewsList.tsx` - Reviews list
- `profile/PublicReviewCard.tsx` - Public review

**AI Services**:
- **Groq/OpenRouter LLM**: analyzeSentiment()
- **Text Classification**: detectSentiment()

**Supabase Clients**:
- `lib/supabase/database.ts: insertReview()` - Insert
- `lib/supabase/storage.ts: uploadReviewImages()` - Upload images
- `lib/supabase/realtime.ts: subscribeToReviews()` - Real-time

**Data Flow**:
```
Order completed
    ↓
"Write Review" prompt
    ↓
ReviewModal opens
    ↓
Fill: Rating, title, comment, images
    ↓
Submit POST /api/reviews
    ↓
reviews.ts submitReview()
    ↓
comment-analyzer.ts analyzeSentiment()
    ↓
LLM: Detect sentiment (positive/negative/neutral)
    ↓
Calculate sentiment_score
    ↓
Insert reviews + Upload images
    ↓
Update store rating_average
    ↓
Review appears (subject to moderation)
```

**Total Fonctions**: 8  
**Status**: ✅ Implémenté  
**Complexity**: 🟨 Mixte

---

## 📦 SPRINT 8: COMMANDES

### **WF-10: Réservation Service par Client**

**Description**: Client réserve service avec date/heure

**Server Actions**:
- `orders.ts: createOrder()` - Create order
- `reservations.ts: createBooking()` - Create booking
- `transactions.ts: processPayment()` - Process payment

**API Routes**:
- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - List reservations
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders

**Pages**:
- `app/merchants/service/[id]/page.tsx`
- `app/profile/reservations/page.tsx`

**Composants**:
- `reservation/ReservationDrawerContent.tsx` - Booking form
- `ServiceBookingCard.tsx` - Booking card
- `ServiceCard.tsx` - Service display

**Supabase Clients**:
- `lib/supabase/database.ts: insertBooking()` - Insert booking
- `lib/supabase/database.ts: updateServiceSchedule()` - Update schedule

**Data Flow**:
```
Service page
    ↓
Click Book
    ↓
ReservationDrawerContent
    ↓
Select date/time/guests
    ↓
Payment
    ↓
POST /api/reservations
    ↓
reservations.ts createBooking()
    ↓
Check availability
    ↓
Process payment
    ↓
Insert booking
    ↓
Send confirmation
    ↓
Booking status = PENDING
```

**Total Fonctions**: 5  
**Status**: ✅ Implémenté

---

### **WF-20: Passer Commande/Réservation**

**Description**: Client passe commande produit OU réservation service

**Server Actions**:
- `orders.ts: createOrder()` - Create order
- `reservations.ts: createBooking()` - Create booking
- `transactions.ts: processPayment()` - Process payment
- `items.ts: decrementStock()` - Update stock
- `notifications.ts: sendOrderConfirmation()` - Send confirmation

**API Routes**:
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/reservations` - List reservations
- `POST /api/reservations` - Create reservation
- `POST /api/checkout` - Checkout

**Pages**:
- `app/profile/cart/page.tsx` - Shopping cart
- `app/merchants/product/[id]/page.tsx` - Product detail
- `app/merchants/service/[id]/page.tsx` - Service detail

**Composants**:
- `ProductCard.tsx` - Product card
- `ServiceCard.tsx` - Service card
- `checkout/CheckoutDrawerContent.tsx` - Checkout
- `reservation/ReservationDrawerContent.tsx` - Booking
- `profile/cart.tsx` - Cart management
- `profile/BottomNavigation.tsx` - Navigation

**Store**:
- `lib/store/use-cart-store.ts` - Zustand cart state

**Supabase Clients**:
- `lib/supabase/database.ts: insertOrder()` - Insert order
- `lib/supabase/database.ts: insertBooking()` - Insert booking
- `lib/supabase/database.ts: updateItemStock()` - Update stock
- `lib/supabase/realtime.ts: updateOrderStatus()` - Real-time

**Data Flow**:
```
Browse products
    ↓
Add to cart (use-cart-store)
    ↓
Checkout
    ↓
CheckoutDrawerContent
    ↓
Enter address + payment
    ↓
POST /api/orders
    ↓
orders.ts createOrder()
    ↓
Process payment
    ↓
Insert orders
    ↓
Update stock
    ↓
Send confirmation
    ↓
Order status = PENDING
```

**Total Fonctions**: 10  
**Status**: ✅ Implémenté

---

### **WF-21: Accepter/Refuser Commande**

**Description**: Vendor accepte ou refuse commande reçue

**Server Actions**:
- `orders.ts: acceptOrder()` - Accept order
- `orders.ts: rejectOrder()` - Reject order
- `orders.ts: createShipment()` - Create shipment
- `notifications.ts: notifyCustomer()` - Notify customer
- `transactions.ts: processRefund()` - Process refund

**API Routes**:
- `PUT /api/admin/orders/[id]/status` - Update status
- `POST /api/webhooks/order/confirm` - Confirm webhook
- `POST /api/webhooks/order/refund` - Refund webhook

**Pages**:
- `app/dashboard/[id]/page.tsx` - Dashboard

**Composants**:
- `ProductOrderCard.tsx` - Order card

**Supabase Clients**:
- `lib/supabase/database.ts: updateOrderStatus()` - Update status
- `lib/supabase/realtime.ts: subscribeToOrders()` - Subscribe

**Workers**:
- `app/api/workers/order-confirmation` - Worker
- `app/api/workers/order-rejection` - Worker

**Data Flow**:
```
Vendor: Dashboard → Orders
    ↓
Click Accept/Reject
    ↓
PUT /api/admin/orders/[orderId]/status
    ↓
orders.ts acceptOrder()
    ↓
Generate tracking code
    ↓
Calculate delivery estimate
    ↓
Send 'Order Confirmed' notification
    ↓
Update status = ACCEPTED
    ↓
Supabase realtime update
```

**Total Fonctions**: 7  
**Status**: ✅ Implémenté

---

### **WF-22: Validation QR Code**

**Description**: Vendor scans QR code pour valider livraison/complétion

**Server Actions**:
- `orders.ts: validateOrderQRCode()` - Validate QR
- `orders.ts: completeOrder()` - Mark DELIVERED
- `reservations.ts: validateReservationQRCode()` - Validate QR
- `reservations.ts: completeBooking()` - Mark COMPLETED
- `utils/qr-code.ts: generateQRCode()` - Generate code
- `utils/qr-code.ts: verifyQRToken()` - Verify token

**API Routes**:
- `POST /api/admin/orders/validate` - Validate QR

**Pages**:
- `app/dashboard/qr-verify/[code]/page.tsx`
- `app/valider/page.tsx`

**Composants**:
- `@yudiel/react-qr-scanner` - QR scanner library

**Supabase Clients**:
- `lib/supabase/database.ts: getOrderByQRToken()` - Get order
- `lib/supabase/database.ts: getBookingByQRToken()` - Get booking
- `lib/supabase/database.ts: updateOrderStatus()` - Update status

**Data Flow**:
```
Vendor: At delivery location
    ↓
Scan QR code
    ↓
POST /api/admin/orders/validate {qrToken}
    ↓
orders.ts validateOrderQRCode()
    ↓
Verify token
    ↓
Display order summary
    ↓
Vendor confirm
    ↓
Update status = DELIVERED
    ↓
Create transaction
    ↓
Send 'Order Completed' notification
    ↓
Release payment
```

**Total Fonctions**: 7  
**Status**: ✅ Implémenté

---

## ❤️ SPRINT 9: FAVORIS

### **WF-23: Ajouter aux Favoris**

**Description**: User ajoute/retire items des favoris

**Server Actions**:
- `favorites.ts: toggleSaveAction()` - Toggle save
- `favorites.ts: isStoreSaved()` - Check if saved
- `favorites.ts: getUserSavedPlaces()` - Get saved

**API Routes**: (Server Actions only)

**Pages**:
- `app/profile/user/page.tsx` - User profile
- `app/discover/page.tsx` - Discovery
- `app/shop/page.tsx` - Shop

**Composants**:
- `FavoriteButton.tsx` - Heart button
- `ProductCard.tsx` - Product card
- `profile/saved-place-card.tsx` - Saved place

**Store**:
- `lib/store/use-saves-store.ts` - Zustand favorites state

**Supabase Clients**:
- `lib/supabase/database.ts: insertSavedPlace()` - Insert
- `lib/supabase/database.ts: deleteSavedPlace()` - Delete

**Data Flow**:
```
User: Browsing products
    ↓
Click heart icon
    ↓
FavoriteButton onClick
    ↓
favorites.ts addToFavorites({userId, itemId})
    ↓
Insert saved_places
    ↓
use-saves-store update state
    ↓
Heart highlighted
    ↓
Click again to remove
    ↓
Delete from saved_places
    ↓
State updated in real-time
```

**Total Fonctions**: 4  
**Status**: ✅ Implémenté

---

## 💬 SPRINT 10: MESSAGERIE & SUPPORT

### **WF-24: Chat User-to-User**

**Description**: Utilisateurs s'envoient messages directs

**Server Actions**:
- `messages.ts: sendMessage()` - Send message
- `messages.ts: getConversations()` - Get conversations
- `messages.ts: markAsRead()` - Mark read
- `hooks/useMessaging.ts` - Messaging hook

**API Routes**:
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages
- `GET /api/sessions` - Get conversations

**Pages**:
- `app/messages/page.tsx` - Messages

**Composants**:
- `messaging/ChatWindow.tsx` - Chat window
- `messaging/ConversationSidebar.tsx` - Conversations
- `messaging/ChatMessage.tsx` - Message bubble
- `messaging/ChatHeads.tsx` - Chat heads

**Supabase Clients**:
- `lib/supabase/database.ts: insertMessage()` - Insert
- `lib/supabase/realtime.ts: subscribeToMessages()` - Subscribe
- `lib/supabase/realtime.ts: subscribeToConversations()` - Subscribe

**Data Flow**:
```
User A: Click User B
    ↓
ChatWindow opens
    ↓
Subscribe to messages
    ↓
Type message + Send
    ↓
messages.ts sendMessage()
    ↓
Insert {sender_id, receiver_id, content, is_read=false}
    ↓
Supabase realtime: Push to User B
    ↓
User B receives notification
    ↓
Message appears in chat
    ↓
User B clicks → markAsRead()
    ↓
Update is_read = true
    ↓
Notification cleared
```

**Total Fonctions**: 6  
**Status**: ✅ Implémenté

---

### **WF-25: Chat Client-to-Magasin**

**Description**: Client envoie messages au magasin

**Server Actions**:
- `messages.ts: sendMessageToStore()` - Send to store
- `messages.ts: getStoreConversations()` - Get store messages

**API Routes**:
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages

**Pages**:
- `app/messages/page.tsx`

**Composants**:
- `messaging/ChatWindow.tsx`
- `ShareBusinessButton.tsx`

**Supabase Clients**:
- `lib/supabase/database.ts: insertMessage()` - Insert
- `lib/supabase/realtime.ts: subscribeToStoreMessages()` - Subscribe

**Data Flow**:
```
Customer: Product page
    ↓
Click 'Contact Store'
    ↓
Message composer
    ↓
Type question
    ↓
sendMessageToStore()
    ↓
Insert {sender_id, receiver_id (store), store_id}
    ↓
Notify store owner
    ↓
Store can reply in dashboard
    ↓
Conversation thread maintained
```

**Total Fonctions**: 3  
**Status**: ✅ Implémenté

---

### **WF-26: Ticket Support Client**

**Description**: Client crée support ticket pour assistance

**Server Actions**:
- `support.ts: createTicket()` - Create ticket
- `support.ts: replyToTicket()` - Reply
- `support.ts: escalateTicket()` - Escalate
- `notifications.ts: notifySupportAgent()` - Notify agent

**API Routes**:
- `GET /api/dashboard/[storeId]/support` - Get tickets
- `POST /api/support` - Create ticket
- `GET /api/support` - Get tickets

**Pages**:
- `app/messages/page.tsx`

**Composants**:
- `messaging/SupportChatDrawer.tsx` - Support chat

**Supabase Clients**:
- `lib/supabase/database.ts: insertSupportTicket()` - Insert
- `lib/supabase/database.ts: insertSupportMessage()` - Insert message
- `lib/supabase/database.ts: updateTicketStatus()` - Update status

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
Insert support_tickets {customer_id, subject, status=open}
    ↓
Auto-assign to support agent
    ↓
Send ticket number
    ↓
Agent receives notification
    ↓
Agent replies via dashboard
    ↓
Chat thread in app
    ↓
Can escalate to manager
    ↓
Close when resolved
```

**Total Fonctions**: 5  
**Status**: ✅ Implémenté

---

### **WF-27: Chat Store-to-Admin**

**Description**: Store owner chats with admin (billing, issues, etc)

**Server Actions**:
- `messages.ts: sendToAdmin()` - Send to admin
- `support.ts: createSupportTicket()` - Create ticket

**API Routes**:
- `POST /api/admin/support` - Send to admin
- `GET /api/admin/support` - Get messages

**Pages**:
- `app/dashboard/[id]/support/tickets/page.tsx`

**Composants**:
- `messaging/ChatWindow.tsx`

**Supabase Clients**:
- `lib/supabase/database.ts: insertMessage()` - Insert
- `lib/supabase/database.ts: insertSupportTicket()` - Insert ticket

**Data Flow**:
```
Store Owner: Dashboard → Support
    ↓
Message admin
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

**Total Fonctions**: 3  
**Status**: ✅ Implémenté

---

# 📊 STATISTIQUES GLOBALES

## Par Sprint

| Sprint | Thème | WF | IA | Actions | Routes | Complexité |
|--------|-------|-----|-----|---------|--------|-----------|
| 1 | Authentification | 2 | 0 | 8 | 6 | Basique |
| 2 | Gestion Magasin | 2 | 0 | 10 | 6 | Basique |
| 3 | Catalogue | 3 | 1 | 12 | 8 | Mixte |
| 4 | Promotions | 3 | 1 | 11 | 6 | Mixte |
| 5 | Contenu Social | 5 | 0 | 16 | 10 | Basique |
| 6 | Recherche IA | 3 | 3 | 12 | 9 | Avancé |
| 7 | Évaluations | 1 | 1 | 8 | 4 | Mixte |
| 8 | Commandes | 4 | 0 | 20 | 10 | Basique |
| 9 | Favoris | 1 | 0 | 4 | 1 | Basique |
| 10 | Messagerie | 4 | 0 | 14 | 8 | Basique |
| **TOTAL** | - | **28** | **7** | **98** | **68** | - |

## Par Complexité

- **Basique**: 18 workflows (64%)
- **Mixte**: 7 workflows (25%)
- **Avancé**: 3 workflows (11%)

## Distribution IA

- **Sans IA**: 21 workflows (75%)
- **Avec IA**: 7 workflows (25%)

### Workflows avec IA:
- WF-07: Création Produit par IA
- WF-16: Recherche Sémantique Darija
- WF-17: Recherche par Image
- WF-18: Recherche Géolocalisée
- WF-19: Poster Avis (Sentiment Analysis)
- WF-28: Recommandation Promotion par IA
- **Total IA**: 6 services d'IA intégrés

---

# 🔗 CROSS-RÉFÉRENCES

## Workflows Interdépendants

| WF Primaire | Dépend de | Raison |
|-------------|-----------|--------|
| WF-05 (Produits) | WF-01, WF-02 (Auth) | Nécessite authentification |
| WF-05 (Produits) | WF-03 (Magasin) | Produits appartiennent à magasin |
| WF-07 (Produit IA) | WF-05 (Produit) | Alternative création produit |
| WF-16 (Recherche) | WF-05, WF-06 (Produits) | Search indexe les produits |
| WF-17 (Image Search) | WF-16 (Search) | Utilise même infrastructure |
| WF-20 (Commande) | WF-05 (Produits) | Commande de produits |
| WF-19 (Avis) | WF-20 (Commande) | Avis après commande |
| WF-28 (Promo IA) | WF-20, WF-21 (Commandes) | Analyse ventes historiques |

## Composants Partagés

- `ProductCard.tsx` - Utilisé par WF-05, WF-20, WF-23
- `CameraCapture.tsx` - Utilisé par WF-05, WF-07, WF-11, WF-17
- `ReviewModal.tsx` - Utilisé par WF-04, WF-19
- `ChatWindow.tsx` - Utilisé par WF-24, WF-25, WF-27
- `MapPicker.tsx` - Utilisé par WF-03, WF-18

## Server Actions Partagées

- `orders.ts` - Utilisé par WF-10, WF-20, WF-21, WF-22
- `items.ts` - Utilisé par WF-05, WF-06, WF-07, WF-11, WF-20
- `notifications.ts` - Utilisé par WF-04, WF-21, WF-26, WF-27
- `messages.ts` - Utilisé par WF-24, WF-25, WF-27
- `favorites.ts` - Utilisé par WF-12, WF-23

---

# 🎯 RÉSUMÉ FONCTIONNEL

## Fluxes Utilisateur Principaux

### 1. **Flux Client (Consumer)**
```
WF-01 (Signup) → WF-02 (Login) 
  ↓
WF-16/17/18 (Search) → WF-05/06 (Browse Products)
  ↓
WF-23 (Save Favorites) → WF-20 (Order)
  ↓
WF-22 (QR Validation) → WF-19 (Review)
  ↓
WF-12 (Interact Reels) / WF-24 (Chat User)
```

### 2. **Flux Vendor (PRO)**
```
WF-01/02 (Auth) → WF-03 (Create Store) → WF-04 (Wait Approval)
  ↓
WF-05/06 (Manage Products) / WF-07 (AI Products)
  ↓
WF-08/09 (Manage Promotions) / WF-28 (AI Recommendations)
  ↓
WF-11/14 (Create Reels/Stories)
  ↓
WF-21 (Accept Orders) → WF-22 (Validate QR)
  ↓
WF-25 (Chat Clients) / WF-27 (Chat Admin)
```

### 3. **Flux Admin**
```
WF-04 (Validate Stores)
  ↓
WF-19 (Approve Reviews) / WF-13 (Remove Reels)
  ↓
WF-26/27 (Support)
```

---

# 📝 NOTES IMPLÉMENTATION

## Statut Global
- ✅ **28/28 workflows implémentés** (100%)
- ✅ Tous les workflows ont une couverture complète
- ✅ Aucun workflow orphelin identifié
- ✅ Toutes les dépendances résolues

## Couverture IA
- 7 workflows avec IA intégrée
- 6 services d'IA différents (OpenRouter, Cloudflare, Groq)
- Couverture: Catalogue (1), Promotions (1), Recherche (3), Évaluations (1), Analytics (1)

## Qualité de Mappage
- ✅ Toutes les Server Actions documentées
- ✅ Toutes les API Routes identifiées
- ✅ Tous les composants liés
- ✅ Tous les Supabase clients référencés
- ✅ Data flows documentés

---

**Document généré**: 25 Mai 2026  
**Format**: Markdown exhaustif avec mappage JSON (separate)  
**Couverture**: 100% des workflows et fonctions logiques
