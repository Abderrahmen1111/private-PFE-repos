# 🔄 DIAGRAMMES DE SÉQUENCE ADDITIONNELS POSSIBLES

**Analyse**: Workflows supplémentaires non couverts dans les 28 diagrammes  
**Project**: Ro2ya.tn - E-Commerce Marketplace  
**Date**: 25 Mai 2026

---

## 📊 RÉSUMÉ

**28 workflows actuels** couvrent les features principales, mais l'architecture complète supporte **50+ workflows** possibles.

| Catégorie | Workflows Actuels | Workflows Additionnels | Total | État |
|-----------|-------------------|------------------------|-------|------|
| **Authentification** | 2 | 4 | 6 | 33% |
| **Gestion Magasin** | 2 | 5 | 7 | 29% |
| **Catalogue** | 3 | 4 | 7 | 43% |
| **Promotions** | 3 | 3 | 6 | 50% |
| **Social** | 5 | 3 | 8 | 63% |
| **Recherche** | 3 | 2 | 5 | 60% |
| **Évaluations** | 1 | 3 | 4 | 25% |
| **Commandes** | 3 | 5 | 8 | 38% |
| **Favoris** | 1 | 2 | 3 | 33% |
| **Messagerie** | 5 | 4 | 9 | 56% |
| **Admin** | 0 | 8 | 8 | 0% |
| **Analytics** | 0 | 5 | 5 | 0% |
| **TOTAL** | **28** | **48** | **76** | **37%** |

---

## 🔐 AUTHENTIFICATION (2→6 workflows)

### Workflows Actuels (2)
1. ✅ Inscription utilisateur
2. ✅ Connexion utilisateur

### Workflows Additionnels (4)

#### **3. Réinitialisation Mot de Passe**

**Description**: Utilisateur oublie mot de passe, reçoit lien reset

**Fichiers impliqués**:
```
Pages:
  app/auth/update-password/page.tsx

Components:
  components/AuthCard.tsx

Actions:
  lib/actions/auth.ts
    └─ requestPasswordReset()
    └─ resetPassword()
    └─ sendPasswordResetEmail()

API:
  POST /api/auth/forgot-password
  POST /api/auth/reset-password
```

**Flux**:
```
User: "Forgot password" link
  ↓
Enter email
  ↓
auth.ts requestPasswordReset()
  ↓
Generate reset token
  ↓
Send email with link
  ↓
User clicks link
  ↓
Page: update-password
  ↓
Enter new password
  ↓
POST /api/auth/reset-password
  ↓
Verify token + Update password
  ↓
Redirect to login
```

**IA impliquée**: ❌

---

#### **4. Authentification Multi-Factor (MFA)**

**Description**: User active 2FA (SMS, Google Auth, Authenticator)

**Fichiers impliqués**:
```
Pages:
  app/dashboard/[id]/profile/page.tsx
    └─ 2FA settings

Actions:
  lib/actions/auth.ts
    └─ enableTwoFactor()
    └─ disableTwoFactor()
    └─ verifyTwoFactorCode()

API:
  POST /api/auth/2fa/enable
  POST /api/auth/2fa/verify
```

**Flux**:
```
User: Settings → Security → Enable 2FA
  ↓
Choose method (SMS, App)
  ↓
Generate secret (TOTP) or send SMS
  ↓
User enters code from authenticator/SMS
  ↓
Verify code
  ↓
2FA enabled
  ↓
On next login:
  - Email + password
  - 2FA code request
  - Verify code
  - Access granted
```

**IA impliquée**: ❌

---

#### **5. Connexion Sociale (OAuth)**

**Description**: Utilisateur se connecte via Google/Facebook/GitHub

**Fichiers impliqués**:
```
Pages:
  app/auth/callback/route.ts
    └─ OAuth callback handler

Actions:
  lib/actions/auth.ts
    └─ signInWithOAuth()
    └─ linkSocialAccount()

API:
  GET /api/auth/callback
  POST /api/auth/oauth/[provider]
```

**Flux**:
```
User: "Sign in with Google"
  ↓
Redirect to Google consent screen
  ↓
Google returns auth code
  ↓
/api/auth/callback?code=...
  ↓
Exchange code for tokens
  ↓
Get user info from Google
  ↓
Check if user exists
  ↓
If new: Create user + link social account
  ↓
If existing: Link to account
  ↓
Create session
  ↓
Redirect to app
```

**IA impliquée**: ❌

---

#### **6. Déconnexion Sécurisée**

**Description**: User logout avec invalidation session

**Fichiers impliqués**:
```
Actions:
  lib/actions/auth.ts
    └─ logout()
    └─ invalidateSession()

API:
  POST /api/auth/logout
```

**Flux**:
```
User: Click logout
  ↓
POST /api/auth/logout
  ↓
Invalidate session token
  ↓
Clear cookies
  ↓
Clear local storage
  ↓
Unsubscribe realtime subscriptions
  ↓
Redirect to login
```

**IA impliquée**: ❌

---

## 🏪 GESTION MAGASIN (2→7 workflows)

### Workflows Actuels (2)
1. ✅ Création magasin
2. ✅ Validation admin

### Workflows Additionnels (5)

#### **5. Édition Infos Magasin par Propriétaire**

**Fichiers**:
```
Pages: app/dashboard/[id]/profile/page.tsx
Actions: lib/actions/stores.ts
  └─ updateStoreInfo()
  └─ updateStoreLocation()
  └─ updateStoreImages()
```

---

#### **6. Suppression Magasin**

**Fichiers**:
```
Actions: lib/actions/admin.ts
  └─ deleteStore() [Admin]
  └─ requestStoreDeactivation() [Owner]
API: DELETE /api/stores/[id]
```

---

#### **7. Suivi Magasin (Follow Store)**

**Description**: Client suit magasin pour notifications

**Fichiers**:
```
Pages: app/public/business/[id]/page.tsx
Components: components/FollowButton.tsx
Actions: lib/actions/store-follows.ts
  └─ followStore()
  └─ unfollowStore()
API: POST /api/stores/follow
```

**Flux**:
```
User: Browse store
  ↓
Click "Follow"
  ↓
store-follows.ts followStore()
  ↓
Insert store_follows table
  ↓
Subscribe to store notifications
  ↓
Get notified on:
  - New products
  - Promotions
  - New reels
  - Restocks
```

---

#### **8. Gestion Équipe Magasin**

**Description**: Owner ajoute team members avec permissions

**Fichiers**:
```
Actions: lib/actions/stores.ts
  └─ addTeamMember()
  └─ removeTeamMember()
  └─ updateMemberRole()
```

---

#### **9. Gestion Horaires Ouverture**

**Description**: Store définit horaires pour services

**Fichiers**:
```
Components: components/reservation/time-slot-grid.tsx
Actions: lib/actions/items.ts
  └─ createServiceSchedule()
  └─ updateServiceSchedule()

Database table: service_schedules
```

---

## 📦 CATALOGUE (3→7 workflows)

### Workflows Actuels (3)
1. ✅ Ajout produit
2. ✅ Modification produit
3. ✅ Création par IA

### Workflows Additionnels (4)

#### **7. Suppression Produit**

**Fichiers**:
```
Actions: lib/actions/items.ts
  └─ deleteItem() [soft delete]
  └─ hardDeleteItem() [admin]
API: DELETE /api/items/[id]
```

---

#### **8. Gestion Variants Produits**

**Description**: Product variants (couleur, taille, etc)

**Fichiers**:
```
Actions: lib/actions/items.ts
  └─ createVariant()
  └─ updateVariant()
  └─ manageStock() [per variant]

Tables: items_variants, items_variant_values
```

---

#### **9. Import/Export Produits en Masse**

**Description**: Bulk upload produits via CSV

**Fichiers**:
```
Actions: lib/actions/items.ts
  └─ bulkImportItems()
  └─ bulkExportItems()

API: POST /api/items/bulk/import
    GET /api/items/bulk/export
```

**Flux**:
```
Vendor: Dashboard → Products → Import
  ↓
Upload CSV file
  ↓
Parse CSV
  ↓
Validate items (name, price, stock)
  ↓
Show preview
  ↓
Confirm import
  ↓
Bulk insert items
  ↓
Generate embeddings for search
  ↓
Return import report
```

---

#### **10. Historique Modifications Produit**

**Description**: Audit trail des changements produit

**Fichiers**:
```
Tables: items_audit_log
Actions: lib/actions/items.ts
  └─ getItemAuditLog()
  └─ [Auto tracked on every update]
```

---

## 🎁 PROMOTIONS (3→6 workflows)

### Workflows Actuels (3)
1. ✅ Ajout promotion
2. ✅ Modification promotion
3. ✅ Recommandation IA

### Workflows Additionnels (3)

#### **6. Code Promo (Coupon)**

**Description**: Vendeur génère codes promo à distribuer

**Fichiers**:
```
Tables: promo_codes
Actions: lib/actions/promotions.ts
  └─ generatePromoCode()
  └─ validatePromoCode()
  └─ applyPromoCode() [during checkout]
```

---

#### **7. Programme Loyauté**

**Description**: Points fidélité + rewards

**Fichiers**:
```
Tables: loyalty_points, loyalty_rewards
Actions: lib/actions/promotions.ts
  └─ awardPoints()
  └─ redeemPoints()
  └─ calculatePoints()

Components: loyalty rewards display
```

---

#### **8. Promotions Flash/Limitées**

**Description**: Limited-time, limited-quantity promos

**Fichiers**:
```
Tables: promotions (extend with limited_quantity)
Actions: lib/actions/promotions.ts
  └─ createFlashSale()
  └─ checkPromoAvailability()
```

---

## 📱 SOCIAL (5→8 workflows)

### Workflows Actuels (5)
1. ✅ Créer Reel
2. ✅ Interagir Reels
3. ✅ Supprimer Reel
4. ✅ Ajouter Story
5. ✅ Supprimer Story

### Workflows Additionnels (3)

#### **8. Système d'Amis (Friendships)**

**Description**: User + User relationship management

**Fichiers**:
```
Pages: app/profile/user/page.tsx
Components: components/FollowButton.tsx
Actions: lib/actions/friendships.ts
  └─ sendFriendRequest()
  └─ acceptFriendRequest()
  └─ rejectFriendRequest()
  └─ removeFriend()
  └─ blockUser()

Tables: friendships
```

**Flux**:
```
User A: Visit User B profile
  ↓
Click "Add Friend"
  ↓
friendships.ts sendFriendRequest()
  ↓
Insert friendships: {user_id: A, friend_id: B, status: PENDING}
  ↓
Notify User B
  ↓
User B sees request
  ↓
Accept: status = ACCEPTED
  ↓
Can now message, see private posts
```

---

#### **9. Collection/Wishlist Personnalisée**

**Description**: User crée collections de produits favoris

**Fichiers**:
```
Tables: collections, collection_items
Actions: lib/actions/favorites.ts
  └─ createCollection()
  └─ addToCollection()
  └─ removeFromCollection()
```

---

#### **10. Partage & Recommandation Produit**

**Description**: Share product via message/social

**Fichiers**:
```
Components: components/ui/share-button.tsx
Actions: lib/actions/reels.ts
  └─ shareItem() [track shares]
  
API: Track share engagement
```

---

## 🔍 RECHERCHE (3→5 workflows)

### Workflows Actuels (3)
1. ✅ Recherche sémantique Darija
2. ✅ Recherche par image
3. ✅ Recherche géolocalisée

### Workflows Additionnels (2)

#### **4. Filtres & Facettes Avancés**

**Description**: Complex filtering (prix, avis, stock, etc)

**Fichiers**:
```
API: GET /api/items?filters[price_min]=10&filters[price_max]=100&filters[category]=shoes

Components: Filter sidebar, faceted search
```

---

#### **5. Recherche Sauvegardée & Alertes**

**Description**: Save searches, get alerts on new matches

**Fichiers**:
```
Tables: saved_searches, search_alerts
Actions: lib/actions/search.ts
  └─ saveSearch()
  └─ createSearchAlert()
  └─ notifyOnMatch()
```

---

## ⭐ ÉVALUATIONS (1→4 workflows)

### Workflows Actuels (1)
1. ✅ Poster avis

### Workflows Additionnels (3)

#### **2. Réponse Vendeur à Avis**

**Description**: Vendor responds to review

**Fichiers**:
```
Components: ReviewCard with reply form
Actions: lib/actions/reviews.ts
  └─ vendorReplyToReview()
  └─ updateVendorResponse()

Tables: reviews (vendor_response field)
```

---

#### **3. Modération Admin d'Avis**

**Description**: Admin approves/rejects reviews

**Fichiers**:
```
Actions: lib/actions/admin.ts
  └─ approveReview()
  └─ rejectReview()
  └─ flagReviewInappropriate()

Tables: reviews (is_approved field)
```

---

#### **4. Utile/Non Utile (Review Voting)**

**Description**: Other users vote on review helpfulness

**Fichiers**:
```
Tables: review_votes
Actions: lib/actions/reviews.ts
  └─ voteReviewHelpful()
  └─ voteReviewUnhelpful()
```

---

## 📦 COMMANDES (3→8 workflows)

### Workflows Actuels (3)
1. ✅ Passer commande
2. ✅ Accepter/refuser
3. ✅ Validation QR

### Workflows Additionnels (5)

#### **4. Suivi Commande en Temps Réel**

**Description**: Track shipment status + location

**Fichiers**:
```
Tables: order_tracking, shipments
Actions: lib/actions/orders.ts
  └─ updateTrackingStatus()
  └─ getTrackingInfo()

Components: OrderStatusTimeline
API: Real-time tracking updates via Supabase realtime
```

---

#### **5. Annulation Commande par Client**

**Description**: Customer cancels order before delivery

**Fichiers**:
```
Actions: lib/actions/orders.ts
  └─ cancelOrder() [customer]
  └─ processRefund()
  
API: POST /api/orders/[id]/cancel
```

---

#### **6. Remboursement (Refund)**

**Description**: Vendor/Customer initiates refund

**Fichiers**:
```
Actions: lib/actions/transactions.ts
  └─ processRefund()
  └─ initiateRefund() [customer request]

API: POST /api/dashboard/[storeId]/refunds
    POST /api/orders/[id]/refund
    
Tables: refunds, transactions (with type: 'refund')
```

**Flux**:
```
Customer: Order issues → Request refund
  ↓
Fill return reason
  ↓
POST /api/orders/[id]/refund
  ↓
orders.ts initiateRefund()
  ↓
Update order status = RETURN_REQUESTED
  ↓
Notify vendor
  ↓
Vendor reviews request
  ↓
Accept/Reject
  ↓
If Accept:
  - Update status = REFUNDED
  - Process payment reversal
  - Update transaction record
```

---

#### **7. Historique Commandes Détaillé**

**Description**: View full order history with details

**Fichiers**:
```
Pages: app/profile/user/page.tsx
Components: components/profile/order-card.tsx
API: GET /api/orders?pagination=true
```

---

#### **8. Commande Récurrente (Subscription)**

**Description**: Auto-replenish orders (monthly, etc)

**Fichiers**:
```
Tables: subscriptions, subscription_orders
Actions: lib/actions/account_subscription.ts
  └─ createSubscription()
  └─ updateSubscription()
  └─ cancelSubscription()
  └─ processRecurringOrder() [automated]
```

---

## ❤️ FAVORIS (1→3 workflows)

### Workflows Actuels (1)
1. ✅ Ajouter aux favoris

### Workflows Additionnels (2)

#### **2. Collections Favoris Personnalisées**

(Voir section Social - Collection Wishlist)

---

#### **3. Partage Collection**

**Description**: Share favorite collection with friend

**Fichiers**:
```
Actions: lib/actions/favorites.ts
  └─ shareCollection()
  
API: POST /api/collections/[id]/share
```

---

## 💬 MESSAGERIE (5→9 workflows)

### Workflows Actuels (5)
1. ✅ Chat user-to-user
2. ✅ Chat client-magasin
3. ✅ Ticket support
4. ✅ Chat store-admin
5. ⚪ (implicite)

### Workflows Additionnels (4)

#### **6. Appel Vidéo/Audio**

**Description**: Real-time video/audio calls in chat

**Fichiers**:
```
Components: components/messaging/CallOverlay.tsx
Hooks: hooks/useWebRTCCall.ts

Actions: lib/actions/messages.ts
  └─ initiateCall()
  └─ endCall()
  └─ recordCall() [optional]

API: WebRTC signaling via WebSocket/Supabase realtime
```

**Flux**:
```
User A: In chat with User B
  ↓
Click "Call"
  ↓
initiateCall()
  ↓
Send call signal to User B
  ↓
User B gets notification
  ↓
Accept/Reject
  ↓
If Accept:
  - Exchange WebRTC offer/answer
  - Establish P2P connection
  - Start audio/video stream
  - CallOverlay shows video
  ↓
Click "End call"
  ↓
Close connection
  ↓
Log call to history
```

**IA impliquée**: ❌ (mais possible: transcription, traduction)

---

#### **7. Message Vocal/Audio**

**Description**: Send voice messages

**Fichiers**:
```
Components: components/messaging/AudioPlayer.tsx
Actions: lib/actions/messages.ts
  └─ sendAudioMessage()

Tables: messages (type: 'audio')
```

---

#### **8. Notification de Lecture (Typing Indicator)**

**Description**: Show "User is typing..."

**Fichiers**:
```
Realtime: lib/supabase/realtime.ts
  └─ broadcastTypingStatus()
  
Components: ChatWindow shows "User is typing..."
```

---

#### **9. Archivage Conversations**

**Description**: Archive old conversations

**Fichiers**:
```
Actions: lib/actions/messages.ts
  └─ archiveConversation()
  └─ unarchiveConversation()

Tables: messages (archived field)
```

---

## 👥 ADMIN (0→8 workflows) - NOUVEAU DOMAINE

### **1. Gestion Utilisateurs (Ban, Suspension)**

**Description**: Admin bans/suspends malicious users

**Fichiers**:
```
Pages: Admin dashboard (not in current app)
Actions: lib/actions/admin.ts
  └─ banUser()
  └─ suspendUser()
  └─ unbanUser()

Tables: user_bans, user_suspensions
```

---

### **2. Modération Contenu**

**Description**: Remove inappropriate reels, reviews, comments

**Fichiers**:
```
Actions: lib/actions/admin.ts
  └─ removeContent()
  └─ flagContent()
  └─ banContentCreator()

Components: Admin moderation interface
```

---

### **3. Gestion Rapports Utilisateurs**

**Description**: Users report inappropriate content/users

**Fichiers**:
```
Tables: reports
Actions: lib/actions/admin.ts
  └─ submitReport()
  └─ reviewReport()
  └─ takeAction()

Pages: Report form (integrated in context menus)
```

---

### **4. Gestion Paiements (Reconciliation)**

**Description**: Admin reconciles payments, handles disputes

**Fichiers**:
```
Actions: lib/actions/admin.ts
  └─ reconcilePayment()
  └─ disputeTransaction()
  └─ manualRefund()
```

---

### **5. Système de Catégories**

**Description**: Admin creates/edits product categories

**Fichiers**:
```
Tables: categories
Actions: lib/actions/admin.ts
  └─ createCategory()
  └─ updateCategory()
  └─ deleteCategory()
```

---

### **6. Gestion Commission Marketplace**

**Description**: Set commission rates, track payouts

**Fichiers**:
```
Tables: commissions, payouts
Actions: lib/actions/admin.ts
  └─ setCommissionRate()
  └─ processPayouts()
  └─ reconcilePayouts()

Components: Payout history dashboard
```

---

### **7. Notification de Maintenance/Downtime**

**Description**: Announce maintenance, scheduled downtime

**Fichiers**:
```
Actions: lib/actions/notifications.ts
  └─ sendMaintenanceNotification()
  
Tables: announcements
```

---

### **8. Audit Logs Système**

**Description**: Log all admin actions for compliance

**Fichiers**:
```
Tables: audit_logs
Actions: lib/actions/admin.ts
  └─ logAdminAction() [auto on every admin operation]
```

---

## 📊 ANALYTICS (0→5 workflows) - NOUVEAU DOMAINE

### **1. Dashboard Analytics Vendeur**

**Description**: Vendeur sees sales, traffic, conversion metrics

**Fichiers**:
```
Pages: app/dashboard/[id]/intelligence/page.tsx

Actions: lib/actions/sales-analyzer.ts
  └─ getDashboardMetrics()
  └─ generateSalesReport()
  
API: GET /api/dashboard/[storeId]/intelligence
```

---

### **2. Rapport Ventes Détaillé**

**Description**: Download sales report (PDF/CSV)

**Fichiers**:
```
Actions: lib/actions/sales-analyzer.ts
  └─ generateSalesReport()
  └─ exportToCSV()
  └─ exportToPDF()

API: GET /api/dashboard/[storeId]/sales-export
```

---

### **3. Analytics Client (Behavior, Preferences)**

**Description**: User sees own activity, preferences, recommendations

**Fichiers**:
```
Tables: user_features, user_interactions
Actions: lib/actions/user-activity.ts
  └─ getUserAnalytics()
```

---

### **4. Performance Produits**

**Description**: Vendor sees product performance (views, clicks, sales)

**Fichiers**:
```
Tables: item_features (CTR, conversion_rate, etc)
Actions: lib/actions/sales-analyzer.ts
  └─ getProductPerformance()
```

---

### **5. Cohort Analysis & Segmentation**

**Description**: Admin analyzes user segments, cohorts

**Fichiers**:
```
Actions: lib/actions/analyzer-service.ts
  └─ analyzeCohort()
  └─ identifySegments()
```

---

## 🔗 WEBHOOKS & ÉVÉNEMENTS ASYNCHRONES (Implicit)

Ces workflows tournent en arrière-plan, declenchés par événements:

```
app/api/webhooks/order/*
  └─ Payment gateway webhooks
  └─ Auto-processes refunds, confirmations

lib/supabase/realtime.ts
  └─ Real-time subscriptions
  └─ Auto-sync data across clients

Upstash QStash (dans package.json)
  └─ @upstash/qstash
  └─ Async task processing
  └─ Scheduled jobs (daily reports, cleanup)
```

---

## 🤖 WORKFLOWS AVEC IA (7→12)

### Actuels (7/28)
1. ✅ Création produit par IA (Sprint 3)
2. ✅ Recommandation promo IA (Sprint 4)
3. ✅ Recherche sémantique Darija (Sprint 6)
4. ✅ Recherche par image (Sprint 6)
5. ✅ Recherche géolocalisée (Sprint 6)
6. ✅ Analyse sentiment avis (Sprint 7)
7. ✅ Recommandations produits (implicite)

### Possibles Additionnels (5)

#### **8. Chatbot Support IA**

**Description**: IA répond questions communes

**Fichiers**:
```
Components: components/ui/chatbot-modal.tsx
Actions: lib/actions/ai-agent.ts
  └─ processChat() [route to IA]
  
API: POST /api/chat [ChatGPT-like]
```

---

#### **9. Génération Description Produit Auto**

**Description**: IA génère descriptions optimisées SEO

**Fichiers**:
```
Actions: lib/actions/ai-agent.ts
  └─ generateProductDescription()
```

---

#### **10. Tarification Dynamique Recommandée**

**Description**: IA recommande prix optimal basé sur demand/competition

**Fichiers**:
```
Actions: lib/actions/sales-analyzer.ts
  └─ recommendPricing()
```

---

#### **11. Anomaly Detection (Fraud)**

**Description**: IA détecte patterns frauduleux

**Fichiers**:
```
Tables: fraud_checks, order_fraud_checks
Actions: lib/actions/fraud-detection.ts
  └─ checkFraud()
  └─ detectAnomalies()
```

---

#### **12. Traduction Auto Multi-Langue**

**Description**: Traduit contenu en plusieurs langues

**Fichiers**:
```
Actions: lib/actions/ai-agent.ts
  └─ translateContent()
```

---

## 📈 RÉSUMÉ WORKFLOWS MANQUANTS

### Par Priorité

#### **HAUTE (Recommandé pour v2)**
- Refund/Return process (commerce)
- Video calls in messaging
- User ban/suspension (moderation)
- Payment reconciliation (admin)
- Sales analytics (vendeur)
- 2FA authentication (security)

#### **MOYENNE**
- Collections/Wishlist
- Product variants
- Bulk import/export
- Loyalty program
- Advanced search filters
- Chatbot IA
- Coupon codes

#### **BASSE (Nice to have)**
- Subscription orders
- Audit logs
- Voice messages
- Typing indicators
- Content sharing metrics
- Cohort analysis

---

## 🎯 IMPLÉMENTATION

Pour ajouter ces workflows:

1. **Créer diagrammes séquence** (draw.io, Mermaid)
2. **Documenter flows** (comme 28 actuels)
3. **Créer tables DB** (Supabase migrations)
4. **Implémenter pages/composants**
5. **Écrire server actions**
6. **Créer API endpoints**
7. **Intégrer tests**

---

**Total workflows estimés**: 76  
**Couverture actuelle**: 37%  
**Workflows additionnels possibles**: 48

---

Généré: 25 Mai 2026
