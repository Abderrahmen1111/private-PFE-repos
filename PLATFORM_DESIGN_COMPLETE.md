# 🎯 CONCEPTION TOTALE DE LA PLATEFORME RO2YA

**Plateforme:** Ro2ya - Marketplace SaaS Tunisienne Premium  
**Date:** Avril 2026  
**Version:** 1.0  
**Tech Stack:** Next.js 15 + React 18 + Supabase + Groq AI + Upstash + TailwindCSS

---

## 📋 Table des Matières

1. [Vision & Objectifs](#vision--objectifs)
2. [Architecture Globale](#architecture-globale)
3. [Types d'Utilisateurs](#types-dutilisateurs)
4. [Fonctionnalités Clients](#fonctionnalités-clients)
5. [Fonctionnalités Merchants](#fonctionnalités-merchants)
6. [Fonctionnalités Admin](#fonctionnalités-admin)
7. [Fonctionnalités Système](#fonctionnalités-système)
8. [Modèles d'Abonnement](#modèles-dabonnement)
9. [Workflows Principaux](#workflows-principaux)
10. [Intégrations](#intégrations)

---

## 🎨 Vision & Objectifs

### Mission
Créer une marketplace décentralisée de premier ordre en Tunisie connectant clients et petits/moyens commerces avec une expérience utilisateur immersive.

### Objectifs Stratégiques
- ✅ Numériser le commerce tunisien (B2C)
- ✅ Offrir plateforme 100% locale (support Darija)
- ✅ Technologie moderne & scalable
- ✅ Monétisation via abonnements merchants
- ✅ Support multilingue (FR, AR, EN)

### Public Cible
- **Clients:** E-commerce, discovery, réservations, produits locaux
- **Merchants:** Petits/moyens commerces cherchant présence digitale
- **Admin:** Modération & analytics

---

## 🏗️ Architecture Globale

### Stack Technologique

```
Frontend Layer
├─ React 18 + Next.js 15 (App Router)
├─ TypeScript (type-safe)
├─ TailwindCSS + Custom CSS
├─ Three.js (3D background)
├─ GSAP (animations)
└─ Zustand (state management)

Backend Layer
├─ API Routes (RESTful)
├─ Server Actions (Next.js 13+)
├─ Supabase (DB + Auth)
└─ Middleware (Rate Limiting, Auth)

AI & NLP
├─ Groq API (LLMs)
├─ Google Gemini (NLP avancé)
├─ Darija Dictionary (500+ mots)
└─ Semantic Search

Infrastructure
├─ Upstash QStash (async jobs)
├─ Google Places API (géolocalisation)
├─ Resend (email)
├─ Stripe/Payment Providers (paiements)
└─ Vercel (hosting)
```

### Diagramme d'Interaction

```
┌──────────────────────────────────────────────────────────┐
│              Browser (Client)                            │
│  - React Components                                      │
│  - TailwindCSS UI                                        │
│  - Three.js 3D Scene                                     │
└──────────────────┬───────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   API Routes          Server Actions
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼───────────┐
        │   Middleware         │
        │ - Rate Limiting      │
        │ - Auth Check         │
        │ - Session           │
        └──────────┬───────────┘
                   │
        ┌──────────▼────────────────────────┐
        │   Business Logic Layer            │
        │ - Orders                          │
        │ - Bookings                        │
        │ - Search (Darija)                 │
        │ - AI Chat                         │
        │ - Transactions                    │
        └──────────┬──────────┬─────────────┘
                   │          │
        ┌──────────▼─┐    ┌──▼──────────┐
        │  Supabase  │    │  External   │
        │  - DB      │    │  Services   │
        │  - Auth    │    │  - Groq     │
        │  - Storage │    │  - Gemini   │
        └────────────┘    │  - Google   │
                          │  - Upstash  │
                          └─────────────┘
```

---

## 👥 Types d'Utilisateurs

### 1. **Client (Buyer)**
- Consommateur final
- Peut chercher, acheter, réserver, évaluer
- Reçoit notifications
- Gère favoris, historique

### 2. **Merchant/Business Owner (PRO)**
- Petit/moyen commerce
- Gère magasin, produits, services
- Reçoit et traite commandes
- Voir analytics
- Plan d'abonnement

### 3. **Admin**
- Modération contenu
- Approbation magasins
- Analytics globales
- Gestion utilisateurs

---

## 🛍️ Fonctionnalités Clients

### A. **Discovery & Recherche**

#### 1. Recherche Native (Full-Text)
```
Client tape: "chaussures sport"
  ↓
- Recherche dans stores + items (name, description)
- Filtre par catégorie, ville
- Tri par rating, pertinence
- Affiche: magasins + produits + services
```

**Implémentation:**
- `searchStores()` - Recherche magasins
- `searchItems()` - Recherche produits/services
- Indexes PostgreSQL sur name, description, city
- Full-text search avec ilike

#### 2. Recherche Sémantique Darija
```
Client tape (Arabe): "نحب نشري ماكينة خياطة"
  ↓
Step 1: Darija → Français
  "نحب نشري ماكينة خياطة" → "acheter machine couture"
  ↓
Step 2: Normalisation AI (Groq)
  - Corrige diacritiques
  - Normalise variantes
  ↓
Step 3: Enrichissement (Gemini)
  - Correction orthographique
  - Ajout contexte (ville, catégorie)
  ↓
Step 4: Recherche Hybride
  - Vector search (embeddings)
  - Full-text search (keywords)
  - Score combiné
  ↓
Résultats: [{item, score}, ...]
```

**Dictionnaire Darija:**
- 500+ mots mappés
- Catégories: verbes, noms, adjectifs, lieux
- Variations: Arabic + Phonétique
- Villes tunisiennes
- Expressions courantes

#### 3. Image Search
```
Client upload image
  ↓
Vision AI (Groq Llama 4 Scout)
  ↓
Génère requête (5-10 words)
  ↓
Recherche automatique
  ↓
Affiche résultats pertinents
```

#### 4. Places Search
- Google Places API proxy
- Restriction géographique: Tunisie
- Vérif. doublons en DB
- Affiche: nom, adresse, tel, note, photos

### B. **Browse & Explore**

#### 1. Accueil (Homepage)
```
┌─────────────────────────────────────┐
│  Navigation Bar + Search            │
├─────────────────────────────────────┤
│  3D Animated Background             │
│  (Particles, Spheres, Distortion)   │
├─────────────────────────────────────┤
│  Hero Section + CTA                 │
├─────────────────────────────────────┤
│  Featured Collections Grid          │
│  (4x3 grid, scroll-triggered)       │
├─────────────────────────────────────┤
│  Trending Artists/Businesses        │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

**Composants:**
- `Navbar` - Navigation responsive
- `BackgroundScene` - WebGL 3D
- `Hero` - Hero section GSAP
- `FeaturedCollections` - Collections grid
- `TrendingArtists` - Businesses populaires
- `Footer` - Footer avec liens

#### 2. Magasin (Business Profile)
```
┌─────────────────────────────┐
│ Banner + Logo               │
├─────────────────────────────┤
│ Nom | Rating | Ville        │
│ Tél | Site | Description    │
├─────────────────────────────┤
│ Stories Éphémères           │
│ (24h, swipeable)            │
├─────────────────────────────┤
│ Produits & Services List    │
│ - Product Cards             │
│ - Service Cards             │
│ - Booking possible          │
├─────────────────────────────┤
│ Réviews & Ratings           │
├─────────────────────────────┤
│ Related Businesses          │
└─────────────────────────────┘
```

**Données Affichées:**
- Infos magasin complet
- Stories vidéo
- Produits avec images
- Services réservables
- Avis clients + rating
- Analytics: vues, clics

#### 3. Détail Produit
```
┌──────────────────────────────┐
│ Gallery Images (swipe)       │
├──────────────────────────────┤
│ Name | Price | Stock         │
│ Description                  │
│ Category | Brand | Rating    │
├──────────────────────────────┤
│ "Add to Cart" Button         │
│ "Order" Button               │
│ "Add to Wishlist" Button     │
├──────────────────────────────┤
│ Reviews Section              │
├──────────────────────────────┤
│ Related Products             │
└──────────────────────────────┘
```

**Actions Possibles:**
- ⭐ Ajouter aux favoris
- 🛒 Ajouter au panier
- 📦 Commander directement
- ❤️ Marquer comme favori
- 📸 Partager
- 💬 Voir commentaires

#### 4. Détail Service
```
┌──────────────────────────────┐
│ Gallery Images               │
├──────────────────────────────┤
│ Name | Price | Duration      │
│ Description                  │
│ Availability (Days)          │
├──────────────────────────────┤
│ "Book Service" Button        │
│ "Call Business" Link         │
│ "Add to Wishlist"            │
├──────────────────────────────┤
│ Booking Card (Right Sidebar) │
│ - Date Picker                │
│ - Time Picker                │
│ - Guest Count                │
│ - Price                      │
│ - Confirm Button             │
├──────────────────────────────┤
│ Reviews                      │
├──────────────────────────────┤
│ Related Services             │
└──────────────────────────────┘
```

### C. **Shopping & Ordering**

#### 1. Panier
- Ajouter produits
- Modifier quantité
- Supprimer items
- Calcul prix total
- Coupons/promo codes

#### 2. Création Commande
```
Flow:
1. Client clique "Order"
  ↓
2. Verify logged in
  ↓
3. Verify ≠ store owner
  ↓
4. Generate order_number (ORD-XXXXXX-XXXX)
  ↓
5. Insert order (status: PENDING)
  ↓
6. Sync à transactions table
  ↓
7. Publish async job (payment-retry, 120s)
  ↓
8. Show success + tracking link
  ↓
Client reçoit notification
```

**Données Commande:**
- Order number
- Items (snapshot)
- Total price + taxes
- Shipping address
- Payment method
- Tracking code (si validated)

**Statuts Possibles:**
1. `PENDING` - Attente validation vendeur
2. `VALIDATED` - Validée, QR code généré
3. `SHIPPED` - Expédiée
4. `COMPLETED` - Livrée
5. `CANCELLED` - Annulée/Remboursée

#### 3. Réservation Service
```
Flow:
1. Client sélectionne service
  ↓
2. Choisit date + heure
  ↓
3. Spécifie nombre de personnes
  ↓
4. Ajoute notes (optionnel)
  ↓
5. Clique "Confirm Booking"
  ↓
6. Verify not store owner
  ↓
7. Generate booking_number (BK-XXXXXX)
  ↓
8. Insert booking (status: PENDING)
  ↓
9. Sync transaction
  ↓
10. Notification reçue
```

**Statuts Booking:**
1. `PENDING` - En attente confirmation
2. `CONFIRMED` - Confirmée
3. `COMPLETED` - Complétée
4. `CANCELLED` - Annulée

### D. **Payments & Transactions**

#### 1. Méthodes Paiement
- Carte bancaire (Stripe, Telnet)
- Virement bancaire
- Paiement à la livraison (COD)

#### 2. Historique Transactions
- Toutes les transactions (orders + bookings)
- Montants détaillés
- Status: pending, completed, failed, refunded
- QR code (si VALIDATED)

### E. **Social & Reviews**

#### 1. Avis (Reviews)
```
Laisse avis:
├─ Rating (1-5 étoiles)
├─ Titre
├─ Commentaire
├─ Photos optionnelles
├─ Sentiment IA (POSITIVE/NEUTRAL/NEGATIVE)
└─ Verified purchase badge

Lit avis:
├─ Trie par helpful, recent, rating
├─ Vote "helpful" / "unhelpful"
├─ Voit réponse vendeur
└─ Filtre par rating
```

**Capacités IA:**
- Sentiment analysis automatique
- Detection spam/abusif
- Suggestion réponse vendeur

#### 2. Favoris
- ⭐ Ajouter magasins aux favoris
- ⭐ Ajouter produits aux favoris
- 📂 Organiser en collections
- 🔔 Notification nouvelles promo

#### 3. Messages
```
Client ↔ Merchant:
├─ Messagerie in-app
├─ Notifications real-time
├─ Historique conservé
├─ Support photos/fichiers
└─ Lié à ordre/réservation
```

#### 4. Réseaux Sociaux
- Partage produit sur Facebook/WhatsApp
- Share stories
- Follow businesses

### F. **Profil Client**

#### 1. Information Personnelle
- Avatar
- Nom complet
- Email
- Téléphone
- Adresses (multiple)
- Préférences langue

#### 2. Mon Historique
```
Onglets:
├─ Commandes
│  └─ Voir statut, QR code, résilient
├─ Réservations
│  └─ Calendrier, confirmation
├─ Avis Laissés
│  └─ Liste complet avec réponses
├─ Favoris
│  └─ Magasins + Produits
├─ Historique Activité
│  └─ Timeline actions
└─ Transactions
   └─ Paiements effectués
```

#### 3. Paramètres
- Langue préférée
- Notifications (push, email)
- Confidentialité
- 2FA optionnel

#### 4. Abonnement
- Voir plan actuel (gratuit par défaut)
- Upgrade vers plan premium (futur)
- Historique paiements

---

## 🏪 Fonctionnalités Merchants

### A. **Setup & Onboarding**

#### 1. Créer Magasin
```
Form:
├─ Nom magasin
├─ Slug (URL-friendly)
├─ Catégorie (Boutique, Restaurant, Pharma, etc.)
├─ Adresse complète
├─ Latitude/Longitude
├─ Téléphone
├─ Email
├─ Site web (optionnel)
├─ Heures d'ouverture
├─ Logo
├─ Banner image
└─ Description

Processus:
1. Submit form
  ↓
2. Upgrade user role → 'PRO'
  ↓
3. Insert store (status: PENDING)
  ↓
4. Email confirmation
  ↓
5. Admin review
  ↓
6. Approve → status: APPROVED
  ↓
7. Merchant peut publier
```

#### 2. Onboarding Tour
- Features guide
- Dashboard overview
- First product creation
- Profile completion checklist

### B. **Product & Service Management**

#### 1. Ajouter Produit
```
Form:
├─ Nom
├─ Description
├─ Prix
├─ Stock quantity
├─ Catégorie
├─ Sous-catégorie
├─ Images (multiple)
├─ SKU / Code-barres
├─ Brand
├─ Couleur / Taille
├─ Poids
├─ Dimensions
├─ Attributs custom (JSON)
└─ Status (ACTIVE/INACTIVE/OUT_OF_STOCK)

Validations:
- Nom: 3-200 chars
- Prix: > 0
- Images: min 1, max 5MB
- Categories: predefined list
```

#### 2. Ajouter Service
```
Form:
├─ Nom
├─ Description
├─ Prix
├─ Prix unit (TND/hour/piece)
├─ Durée (minutes)
├─ Capacity (max personnes)
├─ Image principale
├─ Jours disponibles
├─ Heures disponibles
├─ Status
└─ Réservable? (yes/no)

Support:
- Online booking
- In-app payment
- Reminder notifications
```

#### 3. Inventory Management
```
Dashboard:
├─ Stock level alert (≤5 items)
├─ Out of stock items
├─ High views, zero sales alert
├─ Restock history
└─ Low turnover products

Actions:
- Update stock manually
- Set low stock alert threshold
- Archive old items
- Bulk import/export
```

#### 4. Product Analytics
```
Pour chaque produit:
├─ Vue count
├─ Order count
├─ Booking count
├─ Rating average
├─ Total reviews
├─ Revenue (si orders)
└─ Last 7 days chart
```

### C. **Dashboard & Analytics**

#### 1. Aperçu (Overview)
```
┌─────────────────────────────────────┐
│  KPIs Summary Cards                 │
│  - Total Orders                     │
│  - Total Bookings                   │
│  - Revenue (TND)                    │
│  - Avg Rating                       │
│  - Visitor Count                    │
│  - Notification Count               │
├─────────────────────────────────────┤
│  7-Day Activity Chart               │
│  (Orders + Bookings)                │
├─────────────────────────────────────┤
│  Recent Orders/Bookings List        │
├─────────────────────────────────────┤
│  Top Performing Products            │
├─────────────────────────────────────┤
│  Promotion Offers                   │
└─────────────────────────────────────┘
```

#### 2. Statistiques Avancées
```
Analytics Tab:
├─ Visitor count (daily/weekly/monthly)
├─ Phone clicks
├─ Direction clicks
├─ Orders/bookings over time
├─ Revenue trends
├─ Customer demographics
├─ Device breakdown (mobile/desktop)
├─ Traffic sources
└─ Conversion rate
```

**Granularité:**
- Today / This week / This month / All time
- Comparaison période précédente
- Export CSV/PDF

#### 3. Avis & Sentiment
```
Reviews Tab:
├─ Total reviews count
├─ Avg rating (1-5)
├─ Sentiment breakdown
│  - Positive %
│  - Neutral %
│  - Negative %
├─ Unanswered reviews
├─ Recent 5-star reviews
├─ Negative reviews alert
└─ Top keywords (word cloud)

Actions:
- Reply to reviews
- Flag as helpful/unhelpful
- Archive old reviews
```

### D. **Leads & Orders Management**

#### 1. Leads Tab
```
Vue unique pour toutes actions clients:
├─ All actions (Orders + Bookings)
├─ Filtre par type (Orders/Bookings)
├─ Filtre par statut
├─ Search par client name/phone

Pour chaque lead:
├─ Customer name + phone
├─ Item ordered/booked
├─ Montant total
├─ Date
├─ Statut
└─ Actions buttons
   ├─ Accept / Reject (PENDING)
   ├─ Mark as Completed
   └─ Cancel

Workflows:
PENDING Order:
├─ Accept → VALIDATED
├─ Generate tracking QR code
├─ Send notification
└─ Sync to transactions

PENDING Booking:
├─ Accept → CONFIRMED
├─ Send reminder
└─ Sync to transactions
```

#### 2. Transactions Tab
```
Vue finalisée pour livraison:
├─ All VALIDATED orders/bookings
├─ Filtre par date
├─ Search

Pour chaque transaction:
├─ Tracking code + QR
├─ Customer details
├─ Items/services
├─ Amount
├─ Actions
   ├─ Print label (QR)
   ├─ Scan QR (confirm delivery)
   └─ Mark as COMPLETED
```

### E. **Promotions & Offers**

#### 1. Créer Promotion
```
Form:
├─ Title
├─ Description
├─ Discount type
│  ├─ Percentage (0-100%)
│  └─ Fixed amount (TND)
├─ Valid from (date)
├─ Valid until (date)
├─ Active? (yes/no)
└─ Apply to (all/specific products)

Display:
- Banner on product card
- Badge on storefront
- Dedicated promo section
```

#### 2. Promo Analytics
```
Pour chaque promo:
├─ Views
├─ Click-through rate
├─ Conversions
├─ Revenue attributed
└─ ROI
```

### F. **Stories & Reels**

#### 1. Publier Story
```
Type: Image ou Vidéo
Duration: 24h auto-expire
Max size: 50MB

Upload flow:
1. Select file
  ↓
2. Add text overlay (optional)
  ↓
3. Add CTA link (optional)
  ↓
4. Publish

Viewing:
- Swipeable vertical
- View count
- Link click count
```

#### 2. Publier Reel
```
Type: Vidéo
Duration: 15-60 sec
Max size: 100MB

Fields:
├─ Title
├─ Description
├─ Category
├─ Tags
├─ Thumbnail
└─ Status (DRAFT/PUBLISHED/ARCHIVED)

Analytics:
├─ View count
├─ Like count
├─ Share count
├─ Watch time
└─ Traffic to shop
```

### G. **Business Profile Management**

#### 1. Editer Profile
```
Editable fields:
├─ Logo
├─ Banner
├─ Name
├─ Description
├─ Category
├─ Address + coordinates
├─ Hours
├─ Contact info
├─ Social links
└─ Metadata (JSON)
```

#### 2. Photographie
```
Gallery:
├─ Upload images
├─ Reorder (drag-drop)
├─ Delete
├─ Mark as cover

Used in:
- Business profile
- Product listings
- Search results
```

### H. **Subscription Plans**

#### 1. Plans Available
```
FREE:
├─ Up to 5 products/services
├─ Basic analytics
├─ No promotions
└─ Community support

PRO ($29/month or $290/year):
├─ Up to 50 products/services
├─ Advanced analytics
├─ Promotions management
├─ Review management
└─ Email support

BUSINESS ($99/month or $990/year):
├─ Unlimited products/services
├─ Full analytics
├─ Custom branding
├─ API access
├─ Priority support
└─ Advanced features
```

#### 2. Plan Management
```
Current plan display
├─ Active plan
├─ Renewal date
├─ Usage (items count)

Actions:
├─ Upgrade plan
├─ Downgrade plan
├─ Cancel renewal
└─ Billing history
```

---

## 👨‍💼 Fonctionnalités Admin

### A. **Dashboard Admin**

#### 1. Overview Metrics
```
├─ Total users
├─ Total merchants
├─ Total orders (this month)
├─ Total revenue (this month)
├─ Active stores count
├─ Pending approvals
└─ System health
```

#### 2. Modération
```
Queue:
├─ Pending store approvals
├─ Flagged reviews
├─ Flagged comments
├─ Suspicious users
└─ Abuse reports

Actions:
├─ Approve/Reject store
├─ Approve/Hide review
├─ Ban user
├─ Investigate report
└─ Send message
```

#### 3. Users Management
```
Search & filter:
├─ By email
├─ By role (client/pro/admin)
├─ By registration date
├─ By status (active/suspended)

Actions:
├─ View profile
├─ Change role
├─ Suspend/Ban
├─ Send email
└─ Delete account
```

#### 4. Stores Management
```
View all stores:
├─ Search by name
├─ Filter by status (PENDING/APPROVED/REJECTED)
├─ Filter by category
├─ Sort by date/rating

Actions:
├─ Approve/Reject
├─ Edit details
├─ Suspend
├─ View analytics
└─ Contact owner
```

### B. **Reports & Exports**

#### 1. Data Exports
- Users list (CSV)
- Orders list (CSV)
- Bookings list (CSV)
- Reviews list (CSV)
- Transactions list (CSV)

#### 2. Reports
- Monthly revenue report
- User growth chart
- Top merchants
- Failed transactions
- Abuse incidents

### C. **Settings Admin**

#### 1. Configuration
```
├─ Commission rates
├─ Tax settings
├─ Currency
├─ Categories (manage list)
├─ Email templates
├─ Support contact
└─ Maintenance mode
```

#### 2. System
```
├─ Backup database
├─ Log viewer
├─ Error tracking (Sentry)
├─ Performance monitoring
└─ API status
```

---

## ⚙️ Fonctionnalités Système

### A. **Authentification & Sécurité**

#### 1. Auth Methods
```
├─ Email + Password
├─ Magic Link (email)
├─ 2FA optional
├─ Session management
└─ JWT tokens
```

#### 2. Rate Limiting
```
├─ Login: 5 essais/15 mins
├─ Signup: 3 essais/heure
├─ Magic link: 3 essais/10 mins
├─ API general: 60 req/min
└─ Custom limits per endpoint
```

### B. **Notifications**

#### 1. Types
```
├─ Order status updates
├─ Booking confirmations
├─ Payment notifications
├─ Review replies
├─ Messages received
├─ Promo updates
└─ System alerts
```

#### 2. Delivery Methods
```
├─ In-app notifications
├─ Email
├─ Push notifications (future)
└─ SMS (future)
```

### C. **Search & Discovery**

#### 1. Algorithme Recommandation
```
Basé sur:
├─ User history
├─ Similar products
├─ Popular items
├─ Seasonal trends
├─ Social signals
└─ AI suggestions
```

#### 2. Autocomplete
```
Suggestions basées sur:
├─ Popular searches
├─ Recent searches (user)
├─ Typed keywords
└─ Trending categories
```

### D. **Messaging & Support**

#### 1. In-App Chat
```
Features:
├─ Client ↔ Merchant messaging
├─ Linked to orders/bookings
├─ File/image support
├─ Read receipts
└─ Message history
```

#### 2. Support System (Future)
```
├─ Help center
├─ FAQ
├─ Contact form
└─ Ticket system
```

### E. **Real-Time Features**

#### 1. WebSocket Subscriptions
```
├─ Order status updates
├─ Message notifications
├─ New reviews
├─ Booking confirmations
└─ Stock alerts
```

#### 2. Push Notifications
```
Triggers:
├─ Order validated (customer)
├─ New order received (merchant)
├─ Booking confirmed
├─ Review posted
├─ Message received
└─ Promo started
```

---

## 💳 Modèles d'Abonnement

### FREE Tier
- ✅ Créer magasin
- ✅ Ajouter 5 produits/services
- ✅ Recevoir commandes
- ✅ Basic analytics
- ✅ Laisser avis
- ❌ Promotions
- ❌ Advanced features

### PRO Tier ($29/month)
- ✅ Tout FREE +
- ✅ Up to 50 produits/services
- ✅ Advanced analytics
- ✅ Gestion promotions
- ✅ Review management
- ✅ Email support
- ❌ API access

### BUSINESS Tier ($99/month)
- ✅ Tout PRO +
- ✅ Produits illimités
- ✅ Custom branding
- ✅ API access
- ✅ Priority 24/7 support
- ✅ Advanced reports
- ✅ Team management (future)

### Annual Discount
- -10% for annual payment
- AUTO renew option
- Cancel anytime

---

## 🔄 Workflows Principaux

### 1. **Client Découvre & Achète**

```
┌─────────────────────────────────────────┐
│ Client Landing sur Homepage             │
├─────────────────────────────────────────┤
│ 1. Voit 3D background + hero            │
│ 2. Clique "Search" ou browse            │
│ 3. Entre recherche ou navigue           │
│                                          │
├─────────────────────────────────────────┤
│ Search Results:                         │
│ 1. Affiche magasins + produits          │
│ 2. Client clique sur produit            │
│ 3. Voit détails complets                │
│                                          │
├─────────────────────────────────────────┤
│ Product Page:                           │
│ 1. Gallery images                       │
│ 2. Avis clients                         │
│ 3. Prix & disponibilité                 │
│ 4. Clique "Order"                       │
│                                          │
├─────────────────────────────────────────┤
│ Order Creation:                         │
│ 1. Verify logged in                     │
│ 2. Verify not store owner               │
│ 3. Generate order #                     │
│ 4. Insert order (PENDING)               │
│ 5. Show confirmation page               │
│ 6. Send notification                    │
│                                          │
├─────────────────────────────────────────┤
│ Merchant Receives:                      │
│ 1. Notification                         │
│ 2. Goes to dashboard → Leads            │
│ 3. Voit ordre PENDING                   │
│ 4. Clique "Accept"                      │
│ 5. System generates QR code             │
│ 6. Syncs to transactions (VALIDATED)    │
│ 7. Envoie confirmation client           │
│                                          │
├─────────────────────────────────────────┤
│ Client Receives:                        │
│ 1. Notification "Order Validated"       │
│ 2. Voit QR code + tracking #            │
│ 3. Peut partager avec merchant          │
│ 4. Envoie message si questions          │
│                                          │
├─────────────────────────────────────────┤
│ Payment Processing:                     │
│ 1. Async job check payment status       │
│ 2. If not confirmed → retry (QStash)    │
│ 3. If confirmed → mark SHIPPED          │
│ 4. If failed → refund                   │
│                                          │
├─────────────────────────────────────────┤
│ Delivery:                               │
│ 1. Merchant scans QR code               │
│ 2. System marks COMPLETED               │
│ 3. Client notified                      │
│ 4. Can now review                       │
│                                          │
├─────────────────────────────────────────┤
│ Review:                                 │
│ 1. Client laisse avis                   │
│ 2. AI sentiment analysis                │
│ 3. Merchant voit notification           │
│ 4. Peut répondre                        │
│ 5. Stats updated                        │
└─────────────────────────────────────────┘
```

### 2. **Merchant Ajoute Produit**

```
┌─────────────────────────────────────────┐
│ Merchant Login → Dashboard              │
├─────────────────────────────────────────┤
│ 1. Clique "Products" tab                │
│ 2. Clique "Add New"                     │
│ 3. Voir form                            │
│                                          │
├─────────────────────────────────────────┤
│ Form Remplissage:                       │
│ 1. Basic info (nom, desc, prix)         │
│ 2. Images upload (1-5)                  │
│ 3. Catégorie & tags                     │
│ 4. Attributs (couleur, taille, etc)     │
│ 5. Status (ACTIVE/INACTIVE)             │
│ 6. Stock quantity                       │
│                                          │
├─────────────────────────────────────────┤
│ Validation:                             │
│ 1. Check required fields                │
│ 2. Validate file sizes                  │
│ 3. Compress images                      │
│ 4. Upload to Supabase storage           │
│                                          │
├─────────────────────────────────────────┤
│ Database:                               │
│ 1. Insert into items table              │
│ 2. Set view_count = 0                   │
│ 3. Set order_count = 0                  │
│ 4. Set created_at = now                 │
│                                          │
├─────────────────────────────────────────┤
│ Indexing (Future):                      │
│ 1. Generate embeddings                  │
│ 2. Index for search                     │
│                                          │
├─────────────────────────────────────────┤
│ Analytics:                              │
│ 1. Increment product count              │
│ 2. Update store stats                   │
│                                          │
├─────────────────────────────────────────┤
│ Notification:                           │
│ 1. Show success toast                   │
│ 2. Redirect to product page             │
│ 3. Merchant peut voir live              │
└─────────────────────────────────────────┘
```

### 3. **Recherche Sémantique Darija**

```
┌──────────────────────────────────────────┐
│ Client Type (Arabic):                    │
│ "نحب نشري ماكينة خياطة"                  │
├──────────────────────────────────────────┤
│                                           │
│ STEP 1: Dictionary Lookup                │
│ ├─ "نحب" → "je veux"                     │
│ ├─ "نشري" → "acheter"                    │
│ ├─ "ماكينة" → "machine"                  │
│ ├─ "خياطة" → "couture"                   │
│ └─ Result: "je veux acheter machine"     │
│                                           │
├──────────────────────────────────────────┤
│                                           │
│ STEP 2: Groq Normalization               │
│ ├─ Input: "je veux acheter machine"      │
│ ├─ Prompt: "Normalize & clean this..."   │
│ ├─ Remove diacritics                     │
│ └─ Result: "acheter machine"             │
│                                           │
├──────────────────────────────────────────┤
│                                           │
│ STEP 3: Gemini Enrichment                │
│ ├─ Input: "acheter machine"              │
│ ├─ Add context (city=Tunis)              │
│ ├─ Fix spelling                          │
│ └─ Result: "acheter machine couture"     │
│                                           │
├──────────────────────────────────────────┤
│                                           │
│ STEP 4: Hybrid Search                    │
│ ├─ Generate embedding (768 dims)         │
│ ├─ Vector search (cosine similarity)     │
│ ├─ Full-text search (keyword match)      │
│ ├─ Combine scores                        │
│ └─ Sort by relevance                     │
│                                           │
├──────────────────────────────────────────┤
│                                           │
│ Results:                                  │
│ ├─ [{item, score, rank}, ...]            │
│ ├─ Show top 20                           │
│ └─ Display with relevance scores         │
│                                           │
└──────────────────────────────────────────┘
```

---

## 🔗 Intégrations

### A. **Services Externes Requis**

#### 1. Supabase
- PostgreSQL database
- Authentication (JWT)
- Real-time subscriptions
- Storage buckets
- Vector embeddings (pgvector)

**Configuration:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
```

#### 2. Groq AI
- LLaMA 3.1 8B (chat, intent)
- LLaMA 4 Scout 17B (vision)
- Free tier available

**Configuration:**
```
GROQ_API_KEY=gsk_xxx
```

#### 3. Google Services
- Gemini API (NLP)
- Places API (géolocalisation)

**Configuration:**
```
GEMINI_API_KEY=AIzaSyxxx
GOOGLE_PLACES_API_KEY=AIzaSyxxx
```

#### 4. Upstash QStash
- Async task queue
- Background jobs
- Automatic retries

**Configuration:**
```
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx
```

#### 5. Payment Providers
- Stripe (cards)
- Telnet (Tunisia)
- Bank transfer

**Configuration:**
```
STRIPE_SECRET_KEY=sk_xxx
TELNET_API_KEY=xxx
```

#### 6. Email Service
- Resend pour transactional emails

**Configuration:**
```
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@ro2ya.tn
```

### B. **Webhooks Entrants**

#### 1. Stripe Webhooks
```
Events:
├─ payment_intent.succeeded
├─ payment_intent.payment_failed
├─ charge.refunded
└─ dispute.created
```

#### 2. Upstash Webhooks
```
Events:
├─ task.completed
├─ task.failed
├─ task.retrying
└─ task.deadline_exceeded
```

### C. **API Sortants**

#### 1. External ERP
```
Sync orders to external accounting/logistics system
Method: POST /api/workers/sync-orders
Payload: {order_ref, customer, items, status}
Retry: Automatic via QStash
```

#### 2. Analytics Services
- Google Analytics 4 (page views)
- Sentry (error tracking)

---

## 📊 Data Models Summary

### Users Model
```typescript
├─ id (UUID, PK)
├─ email (unique)
├─ password (hashed)
├─ role (client|pro|admin)
├─ profile (avatar, name, bio)
└─ timestamps
```

### Stores Model
```typescript
├─ id (BIGINT, PK)
├─ owner_id (FK → users)
├─ name, slug, category
├─ address, city, coords
├─ logo, banner
├─ rating, reviews_count
├─ view_count, status
└─ timestamps
```

### Items Model (Products & Services)
```typescript
├─ id (BIGINT, PK)
├─ store_id (FK → stores)
├─ name, description
├─ price, price_unit
├─ category, item_type
├─ images (array)
├─ stock_quantity
├─ rating, reviews_count
├─ view_count, order_count
└─ timestamps
```

### Orders Model
```typescript
├─ id (BIGINT, PK)
├─ order_number (unique)
├─ store_id, customer_id (FKs)
├─ items (JSONB snapshot)
├─ total_price
├─ status (PENDING|VALIDATED|SHIPPED|COMPLETED|CANCELLED)
├─ tracking_code
├─ payment_status
└─ timestamps
```

### Bookings Model
```typescript
├─ id (BIGINT, PK)
├─ booking_number (unique)
├─ store_id, item_id, customer_id (FKs)
├─ booking_date, start_time
├─ duration_minutes, number_of_guests
├─ price, status
├─ notes
└─ timestamps
```

### Transactions Model
```typescript
├─ id (UUID, PK)
├─ transaction_code (unique)
├─ order_id, booking_id (FKs)
├─ customer_id, merchant_id (FKs)
├─ amount, currency
├─ status, type
├─ qr_code_token
└─ timestamps
```

### Reviews Model
```typescript
├─ id (BIGINT, PK)
├─ store_id, item_id (FKs)
├─ customer_id (author)
├─ order_id (FK, verification)
├─ rating (1-5)
├─ title, comment
├─ sentiment_label (IA)
├─ is_verified_purchase
├─ vendor_response
├─ is_flagged
└─ timestamps
```

---

## 🚀 Deployment & DevOps

### Hosting
- **Frontend:** Vercel (Next.js optimized)
- **Database:** Supabase (PostgreSQL)
- **Files:** Supabase Storage (S3-compatible)
- **Queue:** Upstash (serverless)

### CI/CD
```
Git push
  ↓
GitHub Actions
  ↓
Run tests
  ↓
Build & lint
  ↓
Deploy to Vercel
  ↓
Run E2E tests
  ↓
Production live
```

### Monitoring
- **Errors:** Sentry
- **Analytics:** Google Analytics 4
- **Performance:** Vercel Analytics
- **Database:** Supabase Dashboard
- **Logs:** Vercel Logs + Supabase Logs

### Backup & Recovery
- Nightly DB backups (Supabase)
- File storage backups
- Point-in-time recovery
- Disaster recovery plan

---

## 📱 Platform Specifics

### Responsive Design
```
Desktop (1920px+):
├─ Full 3D background
├─ Sidebar navigation
└─ Multi-column layouts

Tablet (768px-1024px):
├─ Simplified 3D (5K particles)
├─ Hamburger menu
└─ 2-column layouts

Mobile (<768px):
├─ Minimal 3D (2K particles)
├─ Full-screen navigation
└─ Single-column layouts
```

### Performance
- **FCP:** < 1.5s
- **LCP:** < 2.5s
- **CLS:** < 0.1
- **TTI:** < 3.5s

### SEO
- Meta tags per page
- Open Graph
- Schema.org markup
- Sitemap.xml
- robots.txt

---

## 🎯 Roadmap Futur

### Phase 2 (Q3 2026)
- [ ] Mobile app (React Native)
- [ ] Team management (merchants)
- [ ] Advanced analytics dashboard
- [ ] Live chat support
- [ ] Email marketing integration

### Phase 3 (Q4 2026)
- [ ] Push notifications
- [ ] SMS support
- [ ] Seller academy
- [ ] Marketplace fees
- [ ] Affiliate program

### Phase 4 (2027)
- [ ] Multi-vendor shipping
- [ ] International expansion
- [ ] B2B marketplace
- [ ] Subscription boxes
- [ ] Marketplace apps/plugins

---

## 📄 Summary

**Ro2ya** est une marketplace complète et moderne qui transforme le commerce tunisien en ligne. Avec:

✅ **23 API Endpoints** pour tous les besoins  
✅ **33+ Server Actions** pour la logique métier  
✅ **17 Tables** de base de données structurées  
✅ **3 Niveaux Utilisateurs** (Client, Merchant, Admin)  
✅ **AI & NLP** natives (Darija, Chat, Search)  
✅ **Scalable Architecture** (Supabase, Upstash, Vercel)  
✅ **Security First** (RLS, Rate Limiting, 2FA)  
✅ **Production Ready** depuis le premier déploiement  

La plateforme est prête pour lancer et croître exponentiellement! 🚀

---

**Conception Totale Ro2ya**  
**Document:** Version Complète  
**Date:** Avril 2026  
**Status:** ✅ Production Ready
