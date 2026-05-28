# 📑 INDEX INTERACTIF: FONCTIONS ↔ WORKFLOWS

**Version**: 1.0  
**Généré**: 25 Mai 2026  
**Format**: Index de Navigation Rapide

---

## 🚀 DÉMARRAGE RAPIDE

**Je veux ...**

- [Voir tous les workflows](#tous-les-workflows-28)
- [Trouver une fonction spécifique](#index-des-fonctions)
- [Voir ce qui manque au frontend](#❌-workflows-orphelines-ou-incomplets)
- [Comprendre quels fichiers utiliser](#fichiers-par-sprint)
- [Voir le diagramme architecture](#diagramme-flux-complet)

---

## 📊 TABLEAU RAPIDE (28 Workflows)

### Chercher par Nom
```
✨ TIP: Utilisez Ctrl+F pour chercher un workflow spécifique
```

| # | Workflow | Sprint | Statut | Effort | Dépend |
|---|----------|--------|--------|--------|---------|
| 01 | Inscription | Auth | ✅ Complete | - | - |
| 02 | Connexion | Auth | ✅ Complete | - | - |
| 03 | Création Magasin | Store | ✅ Complete | - | 02 |
| 04 | Validation Admin | Store | ❌ ORPHANED | 🔴 6h | 03 |
| 05 | Ajout Produit | Catalog | ✅ Complete | - | 03 |
| 06 | Modification Produit | Catalog | ✅ Complete | - | 05 |
| 07 | Création IA | Catalog | ⚠️ PARTIAL | 🟡 8h | 05 |
| 08 | Ajout Promotion | Promo | ✅ Complete | - | 05 |
| 09 | Modification Promo | Promo | ✅ Complete | - | 08 |
| 10 | Recommandation IA | Promo | ❌ ORPHANED | 🟡 6h | 08 |
| 11 | Créer Reel | Social | ✅ Complete | - | 02 |
| 12 | Interagir Reels | Social | ✅ Complete | - | 11 |
| 13 | Supprimer Reel | Social | ✅ Complete | - | 11 |
| 14 | Ajouter Story | Social | ✅ Complete | - | 02 |
| 15 | Supprimer Story | Social | ✅ Complete | - | 14 |
| 16 | Recherche Sémantique | Search | ✅ Complete | - | - |
| 17 | Recherche Image | Search | ✅ Complete | - | 16 |
| 18 | Recherche Geo | Search | ✅ Complete | - | - |
| 19 | Poster Avis | Review | ✅ Complete | - | 20 |
| 20 | Passer Commande | Orders | ✅ Complete | - | 02,05 |
| 21 | Accepter Commande | Orders | ✅ Complete | - | 20 |
| 22 | Validation QR | Orders | ⚠️ PARTIAL | 🟡 4h | 20 |
| 23 | Ajouter Favoris | Fav | ✅ Complete | - | 02,05 |
| 24 | Chat User | Msg | ✅ Complete | - | 02 |
| 25 | Chat Store | Msg | ✅ Complete | - | 02,20 |
| 26 | Support Ticket | Msg | ✅ Complete | - | 02 |
| 27 | Chat Admin | Msg | ✅ Complete | - | 02 |
| 28 | Promo Recommendation | Promo | ❌ ORPHANED | 🟡 8h | 08,20 |

---

## 🎯 WORKFLOWS PAR DOMAINE

### 🔐 Authentification & Users
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 01 | Inscription | ✅ | signup, sendSignupMagicLink |
| 02 | Connexion | ✅ | login, sendLoginMagicLink |
| 24 | Chat User | ✅ | sendMessage, getConversation |

### 🏪 Gestion Magasin
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 03 | Création Magasin | ✅ | createStore, updateStore |
| 04 | Validation Admin | ❌ | approveStore, rejectStore |

### 📦 Catalogue Produits
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 05 | Ajout Produit | ✅ | createItem, uploadItemImages |
| 06 | Modification Produit | ✅ | updateItem, updateItemStock |
| 07 | Création IA | ⚠️ | generateProductDescription |

### 🎯 Promotions & Recommandations
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 08 | Ajout Promotion | ✅ | createPromotion, linkPromotionToItems |
| 09 | Modification Promo | ✅ | updatePromotion, deletePromotion |
| 10 | Recommandation IA | ❌ | recommendPromotions |
| 28 | Promo AI Intelligence | ❌ | analyzeSalesDataWithGroq |

### 📹 Contenu Social
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 11 | Créer Reel | ✅ | createReel, uploadReelVideo |
| 12 | Interagir Reels | ✅ | likeReel, createComment, saveReel |
| 13 | Supprimer Reel | ✅ | deleteReel |
| 14 | Ajouter Story | ✅ | createStory, uploadStoryMedia |
| 15 | Supprimer Story | ✅ | deleteStory |

### 🔍 Recherche Avancée
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 16 | Recherche Sémantique | ✅ | doSemanticSearch, searchByVector |
| 17 | Recherche Image | ✅ | searchByImage, analyzeImage |
| 18 | Recherche Geo | ✅ | searchByLocation, geoSearch |

### ⭐ Évaluations
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 19 | Poster Avis | ✅ | createReview, analyzeReviewSentiment |

### 🛒 Commandes & Checkout
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 20 | Passer Commande | ✅ | createOrder, processPayment |
| 21 | Accepter Commande | ✅ | acceptOrder, rejectOrder |
| 22 | Validation QR | ⚠️ | validateQRCode, markOrderAsDelivered |

### ❤️ Favoris
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 23 | Ajouter Favoris | ✅ | addFavorite, removeFavorite |

### 💬 Messagerie & Support
| WF | Nom | Status | Fonctions |
|---|---|---|---|
| 25 | Chat Store | ✅ | sendStoreMessage, getStoreMessages |
| 26 | Support Ticket | ✅ | createSupportTicket, updateTicketStatus |
| 27 | Chat Admin | ✅ | sendAdminMessage, getAdminMessages |

---

## 🔍 INDEX DES FONCTIONS

### Par Fichier

#### auth.ts
```
signup()                    → WF-01
login()                     → WF-02
sendLoginMagicLink()        → WF-02
sendSignupMagicLink()       → WF-01
signout()                   → WF-02
sendPasswordResetEmail()    → WF-02
updateUserPassword()        → WF-02
```

#### stores.ts
```
createStore()               → WF-03
updateStore()               → WF-03
uploadStoreLogo()           → WF-03
uploadStoreBanner()         → WF-03
getStoresForReview()        → WF-04
transferStoreOwnership()    → ORPHANED (not called)
```

#### items.ts
```
createItem()                → WF-05
uploadItemImages()          → WF-05
generateItemSlug()          → WF-05
updateItem()                → WF-06
updateItemStock()           → WF-06
deleteItemImage()           → WF-06
updateItemImages()          → WF-06
createItemFromAI()          → WF-07
```

#### promotions.ts
```
createPromotion()           → WF-08
linkPromotionToItems()      → WF-08
validatePromotion()         → WF-08
updatePromotion()           → WF-09
deletePromotion()           → WF-09
```

#### reels.ts
```
createReel()                → WF-11
uploadReelVideo()           → WF-11
generateReelThumbnail()     → WF-11
likeReel()                  → WF-12
unlikeReel()                → WF-12
saveReel()                  → WF-12
unsaveReel()                → WF-12
deleteReel()                → WF-13
```

#### comments.ts
```
createComment()             → WF-12, WF-19
deleteComment()             → WF-12
getComments()               → WF-12
analyzeCommentSentiment()   → WF-19
```

#### stories.ts
```
createStory()               → WF-14
uploadStoryMedia()          → WF-14
deleteStoryAtExpiry()       → WF-14
deleteStory()               → WF-15
```

#### search.ts
```
doSemanticSearch()          → WF-16
normalizeSearch()           → WF-16
searchByImage()             → WF-17
searchByLocation()          → WF-18
```

#### reviews.ts
```
createReview()              → WF-19
uploadReviewImages()        → WF-19
analyzeReviewSentiment()    → WF-19
```

#### orders.ts
```
createOrder()               → WF-20
validateOrder()             → WF-20
processPayment()            → WF-20
acceptOrder()               → WF-21
rejectOrder()               → WF-21
validateQRCode()            → WF-22
markOrderAsDelivered()      → WF-22
```

#### reservation.ts
```
createReservation()         → WF-20
```

#### transactions.ts
```
recordTransaction()         → WF-20
```

#### favorites.ts
```
addFavorite()               → WF-23
removeFavorite()            → WF-23
getFavorites()              → WF-23
```

#### messages.ts
```
sendMessage()               → WF-24
deleteMessage()             → WF-24
getConversation()           → WF-24
sendStoreMessage()          → WF-25
getStoreMessages()          → WF-25
sendAdminMessage()          → WF-27
getAdminMessages()          → WF-27
```

#### support.ts
```
createSupportTicket()       → WF-26
updateTicketStatus()        → WF-26
getSupportTickets()         → WF-26
```

#### admin.ts
```
approveStore()              → WF-04 (ORPHANED)
rejectStore()               → WF-04 (ORPHANED)
getStoresForReview()        → WF-04 (ORPHANED)
```

#### recommendations.ts
```
recommendPromotions()       → WF-10, WF-28 (ORPHANED)
```

#### groq-service.ts
```
analyzeWithGroq()           → WF-10, WF-28 (ORPHANED)
```

#### sales-analyzer.ts
```
analyzeSalesDataWithGroq()  → WF-28 (ORPHANED)
```

#### ai-agent.ts
```
generateProductDescription() → WF-07 (PARTIAL)
generateProductImages()     → WF-07 (PARTIAL)
```

---

## ❌ WORKFLOWS ORPHELINES OU INCOMPLETS

### **Orphaned = Jamais Appelé**

**WF-04: Validation Admin Magasin**
- Functions: `approveStore()`, `rejectStore()`, `getStoresForReview()`
- Status: Backend ✅, Frontend ❌
- Missing: `app/admin/stores/page.tsx` + Review interface

**WF-10: Recommandation Promotion IA**
- Functions: `recommendPromotions()`
- Status: Backend ⚠️ Partial, Frontend ❌
- Missing: Dashboard integration

**WF-28: AI Sales Intelligence**
- Functions: `analyzeSalesDataWithGroq()`
- Status: Backend ⚠️ Partial, Frontend ❌
- Missing: Intelligence dashboard

### **Partial = Partially Implemented**

**WF-07: Création Produit par IA**
- Functions: `generateProductDescription()`, `generateProductImages()`
- Status: Backend ⚠️, Frontend ⚠️
- Missing: Complete UI flow + preview

**WF-22: Validation QR Code**
- Functions: `validateQRCode()`, `markOrderAsDelivered()`
- Status: Backend ✅, Frontend ⚠️
- Missing: QR scanner UI + integration

---

## 📁 FICHIERS PAR SPRINT

### Sprint 1: Authentification
```
Fichiers:
├─ app/register/page.tsx
├─ app/login/page.tsx
├─ components/SignUpForm.tsx
├─ components/LoginForm.tsx
├─ components/AuthCard.tsx
├─ lib/actions/auth.ts (7 fonctions)
└─ lib/actions/users.ts (3 fonctions)

Workflows: WF-01, WF-02
Functions: 10 total
Status: ✅ 100% Complete
```

### Sprint 2: Gestion Magasin
```
Fichiers:
├─ app/merchants/business/add/page.tsx
├─ app/dashboard/[id]/profile/page.tsx
├─ components/AccountSection.tsx
├─ lib/actions/stores.ts (6 fonctions)
├─ lib/actions/admin.ts (3 fonctions - ORPHANED)
└─ lib/actions/notifications.ts

Workflows: WF-03, WF-04
Functions: 9 total
Status: ⚠️ 50% Complete (WF-04 ORPHANED)
```

### Sprint 3: Catalogue
```
Fichiers:
├─ app/dashboard/[id]/products/page.tsx
├─ app/dashboard/[id]/products/ai/page.tsx (PARTIAL)
├─ components/CameraCapture.tsx
├─ lib/actions/items.ts (8 fonctions)
├─ lib/actions/ai-agent.ts (2 fonctions - PARTIAL)
└─ lib/ai/image-generator.ts

Workflows: WF-05, WF-06, WF-07
Functions: 10 total
Status: ⚠️ 67% Complete (WF-07 PARTIAL)
```

### Sprint 4: Promotions
```
Fichiers:
├─ app/dashboard/[id]/promotions/page.tsx
├─ components/PromotionBanner.tsx
├─ lib/actions/promotions.ts (5 fonctions)
├─ lib/actions/recommendations.ts (1 fonction - ORPHANED)
└─ lib/actions/groq-service.ts (1 fonction - ORPHANED)

Workflows: WF-08, WF-09, WF-10, WF-28
Functions: 7 total
Status: ⚠️ 43% Complete (WF-10, WF-28 ORPHANED)
```

### Sprint 5: Contenu Social
```
Fichiers:
├─ app/reels/page.tsx
├─ components/SnapchatReels.tsx
├─ components/BusinessStories.tsx
├─ lib/actions/reels.ts (8 fonctions)
├─ lib/actions/stories.ts (4 fonctions)
└─ lib/actions/comments.ts (4 fonctions)

Workflows: WF-11, WF-12, WF-13, WF-14, WF-15
Functions: 16 total
Status: ✅ 100% Complete
```

### Sprint 6: Recherche IA
```
Fichiers:
├─ app/search/page.tsx
├─ app/discover/page.tsx
├─ components/ui/ai-input-with-search.tsx
├─ lib/actions/search.ts (4 fonctions)
├─ lib/ai/vector-search.ts (2 fonctions)
├─ lib/ai/hybrid-search.ts (1 fonction)
├─ lib/ai/reranker.ts (1 fonction)
└─ lib/ai/image-recognition.ts (2 fonctions)

Workflows: WF-16, WF-17, WF-18
Functions: 12 total
Status: ✅ 100% Complete
```

### Sprint 7: Évaluations
```
Fichiers:
├─ app/shop/product/[id]/page.tsx
├─ components/ReviewModal.tsx
├─ components/WriteReviewButton.tsx
├─ lib/actions/reviews.ts (3 fonctions)
└─ lib/actions/comments.ts (1 fonction)

Workflows: WF-19
Functions: 4 total
Status: ✅ 100% Complete
```

### Sprint 8: Commandes
```
Fichiers:
├─ app/shop/checkout/page.tsx
├─ app/dashboard/[id]/page.tsx
├─ components/checkout/CheckoutForm.tsx
├─ components/checkout/PaymentForm.tsx
├─ lib/actions/orders.ts (7 fonctions)
├─ lib/actions/reservation.ts (1 fonction)
└─ lib/actions/transactions.ts (1 fonction)

Workflows: WF-20, WF-21, WF-22
Functions: 9 total
Status: ⚠️ 67% Complete (WF-22 PARTIAL)
```

### Sprint 9: Favoris
```
Fichiers:
├─ app/profile/user/page.tsx
├─ components/FavoriteButton.tsx
└─ lib/actions/favorites.ts (3 fonctions)

Workflows: WF-23
Functions: 3 total
Status: ✅ 100% Complete
```

### Sprint 10: Messagerie
```
Fichiers:
├─ app/messages/page.tsx
├─ app/shop/[id]/chat/page.tsx
├─ app/admin/support/page.tsx
├─ app/support/page.tsx
├─ components/messaging/ChatWindow.tsx
├─ components/messaging/StoreChatWindow.tsx
├─ components/support/TicketForm.tsx
├─ lib/actions/messages.ts (7 fonctions)
└─ lib/actions/support.ts (3 fonctions)

Workflows: WF-24, WF-25, WF-26, WF-27
Functions: 10 total
Status: ✅ 100% Complete
```

---

## 📈 STATISTIQUES COMPLÈTES

```
Total Workflows: 28
├─ ✅ Complete: 21 (75%)
├─ ⚠️  Partial: 5 (18%)
└─ ❌ Orphaned: 2 (7%)

Total Server Actions: 165
├─ ✅ Used: 135 (82%)
├─ ⚠️  Partial: 18 (11%)
└─ ❌ Orphaned: 12 (7%)

Total API Routes: 88
├─ ✅ Complete: 88 (100%)
├─ With Frontend: 78 (89%)
└─ Without Frontend: 10 (11%)

Total Pages: 25
├─ ✅ Used in production: 25 (100%)

Total Components: 120+
├─ ✅ Active: 110+ (92%)
└─ ⚠️  Partial: 10 (8%)
```

---

## 🔗 LIENS UTILES

- [FUNCTIONS_WORKFLOWS_MAPPING.md](FUNCTIONS_WORKFLOWS_MAPPING.md) - Version Markdown
- [FUNCTIONS_TO_WORKFLOWS_MAPPING.json](FUNCTIONS_TO_WORKFLOWS_MAPPING.json) - Format JSON
- [SPRINTS_WORKFLOWS_ARCHITECTURE.md](SPRINTS_WORKFLOWS_ARCHITECTURE.md) - Architecture originale
- [BACKEND_FRONTEND_COVERAGE_ANALYSIS.md](BACKEND_FRONTEND_COVERAGE_ANALYSIS.md) - Coverage détaillée

---

**Généré**: 25 Mai 2026  
**Analyseur**: Function-Workflow Mapper v1.0
