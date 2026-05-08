# 🎯 RO2YA - Contexte Complet du Projet

**Date**: Mai 2026  
**Auteurs**: Khaireddine Dab & Abderrahman Abdelli  
**Type**: PFE - Marketplace SaaS Tunisienne  
**Status**: Production  

---

## 📌 Vue d'Ensemble

**Ro2ya** est une marketplace locale tunisienne qui connecte:
- 👥 **Clients** - Découvrent produits, services, réservations
- 🏪 **Marchands** - Vendeurs (boutiques, restaurants, salons, services)
- 👨‍💼 **Admins** - Modération, analytics, gestion plateforme

### Tagline
*"Plateforme de découverte et de commerce local tunisienne avec IA et support natif Darija"*

---

## 🛠️ Stack Technologique

### Frontend
```
Framework: Next.js 15 (App Router)
Language: TypeScript (strict mode)
UI: React 18 + TailwindCSS + Radix UI (40+ components)
3D/Graphics: Three.js + React Three Fiber (@react-three/fiber)
Animations: GSAP + ScrollTrigger
State Management: Zustand
HTTP: axios + fetch API
```

### Backend
```
Runtime: Next.js 15 (Server Components & Server Actions)
API: RESTful via /app/api routes
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
Storage: Supabase Storage (images, videos)
Real-time: Supabase Realtime subscriptions
```

### AI & NLP
```
LLM: Groq API (Claude, Mistral)
Vision: Google Gemini Vision
Search Semantique: Custom avec Darija dictionary
Dictionnaire Darija: 500+ mots localisés
```

### Infrastructure & Services
```
Hosting: Vercel
Queue/Jobs: Upstash QStash (async workers)
Maps: Google Places API
Email: Resend
Payments: Stripe / Flouci (paiements locaux)
CDN: Vercel Edge Network
Database Backups: Supabase automated
```

---

## 📂 Structure du Projet

```
project-root/
│
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes (REST endpoints)
│   │   ├── auth/                 # Authentication
│   │   │   ├── login
│   │   │   ├── signup
│   │   │   ├── logout
│   │   │   ├── verify
│   │   │   └── session
│   │   ├── chat/                 # Chat IA
│   │   ├── ai-agent/             # Intelligent routing agent
│   │   ├── image-search/         # Image-based search
│   │   ├── semantic-search/      # Semantic + Darija search
│   │   ├── places/               # Google Places proxy
│   │   ├── admin/                # Admin endpoints
│   │   │   ├── orders/validate
│   │   │   ├── orders/export
│   │   │   └── transactions
│   │   ├── webhooks/             # External integrations
│   │   └── workers/              # Background jobs (QStash)
│   │
│   ├── (routes)/                 # Next.js route groups
│   │   ├── page.tsx              # Home page
│   │   ├── auth/                 # /login, /register
│   │   ├── discover/             # Discovery feed (TikTok-like)
│   │   ├── search/               # Search results
│   │   ├── merchants/            # Business detail pages /merchants/[id]
│   │   ├── dashboard/            # Business owner dashboard /dashboard/[id]
│   │   ├── profile/              # User profile
│   │   ├── messages/             # Messaging system
│   │   ├── shop/                 # Shop pages
│   │   ├── valider/              # QR validation
│   │   └── reels/                # Video content
│   │
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React Components
│   ├── ui/                       # Radix UI components (buttons, cards, etc)
│   ├── ai-agent/                 # AI chat interface
│   ├── checkout/                 # Payment flow
│   ├── dashboard/                # Dashboard widgets
│   ├── discover/                 # Discovery feed
│   ├── messaging/                # Chat components
│   ├── notifications/            # Notification system
│   ├── profile/                  # Profile sections
│   ├── reservation/              # Booking components
│   ├── hooks/                    # Custom React hooks
│   │
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Footer.tsx
│   ├── BackgroundScene.tsx       # 3D WebGL background
│   ├── LoginForm.tsx
│   ├── SignUpForm.tsx
│   ├── ProductCard.tsx
│   ├── ServiceCard.tsx
│   ├── BusinessItemsList.tsx
│   └── [50+ autres components]
│
├── lib/                          # Business Logic & Utilities
│   ├── actions/                  # Server Actions (DB operations)
│   │   ├── auth.ts              # Authentication logic
│   │   ├── orders.ts            # Order management
│   │   ├── search_bus.ts        # Business search
│   │   ├── search_items.ts      # Product search
│   │   ├── search_service.ts    # Service search
│   │   ├── profile.ts           # User profiles
│   │   ├── business.ts          # Business operations
│   │   ├── items.ts             # Products/Services
│   │   ├── reviews.ts           # Reviews & ratings
│   │   ├── transactions.ts      # Transaction handling
│   │   ├── notifications.ts     # Notifications
│   │   ├── favorites.ts         # Favorites
│   │   ├── comments.ts          # Comments
│   │   ├── reels.ts             # Video content
│   │   ├── reservations.ts      # Booking reservations
│   │   ├── recommendations.ts   # AI recommendations
│   │   └── [+15 autres actions]
│   │
│   ├── supabase/                # Supabase Clients & Queries
│   │   ├── server.ts            # Server client (avec cookies)
│   │   ├── browser.ts           # Browser client
│   │   ├── admin.ts             # Admin client (service role)
│   │   ├── client.ts            # Base client
│   │   ├── auth.ts              # Auth utilities
│   │   ├── database.ts          # Raw queries
│   │   ├── storage.ts           # File storage ops
│   │   ├── realtime.ts          # Real-time subscriptions
│   │   └── middleware.ts        # Session middleware
│   │
│   ├── agents/                  # AI Agent Config
│   │   └── prompts.ts          # System prompts & context
│   │
│   ├── store/                   # Zustand state stores
│   │   ├── use-messaging-store.ts
│   │   ├── use-call-store.ts
│   │   └── use-saves-store.ts
│   │
│   ├── darija-dictionary.ts     # Darija → French translations
│   ├── admin-auth.ts            # Admin authorization
│   ├── rate-limit.ts            # Rate limiting config
│   ├── upload.ts                # File upload utilities
│   ├── storage.ts               # Media URL management
│   └── utils.ts                 # Helper functions
│
├── types/                       # TypeScript Definitions
│   ├── supabase.ts             # Auto-generated from DB
│   ├── business.ts             # Business types
│   ├── ai-agent.ts             # AI types
│   ├── orders.ts               # Order types
│   └── index.ts                # Exported types
│
├── hooks/                      # Custom React Hooks
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useOrders.ts
│   └── [autres hooks]
│
├── public/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/                     # Global styles
│   ├── globals.css
│   └── variables.css
│
├── supabase/                   # Database setup
│   ├── migrations/             # SQL migrations
│   ├── seed.sql               # Test data
│   └── config.toml            # Supabase config
│
├── scripts/                    # Utility scripts
│   ├── setup.sh
│   └── seed-db.ts
│
├── scratch/                    # Temporary/experimental code
├── tmp/                        # Temp files
├── docs/                       # Documentation
│
├── .env.local                  # Environment variables (local)
├── .env.example                # Template for env vars
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # TailwindCSS config
├── next.config.js              # Next.js config
├── postcss.config.js           # PostCSS config
└── pnpm-lock.yaml              # Lock file
```

---

## 🎯 Fonctionnalités Principales

### 👥 Pour les Clients

| Fonctionnalité | Description |
|---|---|
| **Découverte** | Feed d'articles (style TikTok) avec algorithme |
| **Recherche** | Par texte, image, localisation, Darija |
| **Exploration** | Fiche business détaillée avec images/avis |
| **Commandes** | Commander produits avec validation QR |
| **Réservations** | Réserver services (salons, médecins, etc) |
| **Avis** | Donner/lire avis étoilés avec commentaires |
| **Favoris** | Sauvegarder businesses |
| **Profil** | Gérer préférences, historique, notifications |
| **Chat IA** | Agent conversationnel pour recommendations |
| **Messagerie** | Chat direct avec merchants |
| **Paiements** | Stripe, Flouci, carte bancaire |

### 🏪 Pour les Merchants

| Fonctionnalité | Description |
|---|---|
| **Dashboard** | /dashboard/[store_id] central |
| **Produits** | Créer/éditer/supprimer produits avec images |
| **Services** | Gérer services + calendrier disponibilités |
| **Commandes** | Voir leads, valider, générer QR, confirmer livraison |
| **Réservations** | Gérer bookings, créneaux horaires |
| **Avis** | Répondre aux avis clients |
| **Transactions** | Historique ventes + analytics |
| **Refunds** | Gérer remboursements |
| **Promotions** | Créer codes promo + offres |
| **Profil** | Infos boutique, photos, horaires |
| **Support** | Chat + tickets avec clients |
| **Stories/Reels** | Poster vidéos courtes |
| **Analytics** | Vues, conversions, revenus |

### 👨‍💼 Pour les Admins

| Fonctionnalité | Description |
|---|---|
| **Modération** | Valider businesses, signalements |
| **Analytics** | Dashboard global KPIs |
| **Commandes** | Export/suivi globales |
| **Transactions** | Monitoring paiements |
| **Utilisateurs** | Gestion users, bans |
| **Support** | Gérer tickets support |
| **Promotions** | Créer promos globales |

---

## 🔄 Flux Principaux

### Flux Commande (Order Flow)

```
1. Client clique "Commander" sur un produit
   ↓
2. Form: Quantité + Adresse de livraison
   ↓
3. Appel createOrder() → Status: PENDING
   ↓
4. Owner reçoit notification dans /dashboard/[id]/leads
   ↓
5. Owner accepte (validateOrder) → Status: ACCEPTED
   ↓
6. Système génère QR code unique
   ↓
7. Client reçoit notification + QR code
   ↓
8. Livraison: Owner scanne QR → Status: DELIVERED
   ↓
9. Client peut laisser avis
```

### Flux Réservation (Booking Flow)

```
1. Client choisit service + créneau
   ↓
2. Réservation créée → Status: PENDING
   ↓
3. Owner accepte/refuse
   ↓
4. Notification + reminder 24h avant
   ↓
5. Jour du service: confirmation
   ↓
6. Après: client peut laisser avis
```

### Flux Recherche

```
1. Client tape query (texte, image ou Darija)
   ↓
2. /api/semantic-search traite requête
   ↓
3. Dictionnaire Darija: traduction si nécessaire
   ↓
4. IA: comprend contexte (localisation, catégorie)
   ↓
5. Retourne results rangés par pertinence
   ↓
6. Client voit cards avec images + prix + avis
```

---

## 🗄️ Modèle de Données Clé

### Tables Principales

```sql
-- Users & Auth
auth.users                    -- Supabase built-in
user_profiles (id, name, phone, email, role, avatar)

-- Businesses
businesses (id, name, description, location, phone, category)
business_images (id, business_id, url, position)
business_hours (id, business_id, day, open_time, close_time)

-- Products & Services
items (id, business_id, name, description, price, image, category)
services (id, business_id, name, duration, price, description)

-- Transactions
orders (id, business_id, item_id, customer_id, quantity, total, status, qr_code)
bookings (id, business_id, service_id, customer_id, date_time, status)
payments (id, order_id, amount, method, status, reference)
refunds (id, order_id, reason, amount, status)

-- Reviews & Ratings
reviews (id, business_id, customer_id, rating, text, date)

-- User Data
favorites (id, user_id, business_id)
notifications (id, user_id, type, message, read)

-- Content
reels (id, business_id, video_url, likes, comments)
comments (id, reel_id, user_id, text, date)
```

---

## 🔐 Authentification & Sécurité

### Authentification
- **Supabase Auth** avec email/password
- **Magic links** pour connexion sans mot de passe
- **Session cookies** via middleware
- **JWT tokens** pour API protection

### Autorisation (RLS - Row Level Security)
- Clients ne voient que leurs données
- Merchants ne voient que leurs stores
- Admins ont accès complet
- Policies PostgreSQL au niveau DB

### Sécurité Supplémentaire
- Rate limiting (lib/rate-limit.ts)
- CORS configured
- Environment variables séparation
- Admin auth middleware
- File upload validation

---

## 💾 Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Groq AI
GROQ_API_KEY=xxxxx

# Google APIs
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=xxxxx
GOOGLE_GENERATIVE_AI_API_KEY=xxxxx

# Upstash
QSTASH_CURRENT_SIGNING_KEY=xxxxx
QSTASH_TOKEN=xxxxx

# Payments
STRIPE_SECRET_KEY=xxxxx
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=xxxxx
FLOUCI_API_KEY=xxxxx

# Email
RESEND_API_KEY=xxxxx

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🚀 Commandes Principales

```bash
# Installation
pnpm install

# Développement
pnpm dev              # Démarre sur http://localhost:3000

# Build production
pnpm build
pnpm start

# Linting & Type check
pnpm lint
pnpm type-check

# Database
pnpm supabase start   # Démarre Supabase local
pnpm supabase:seed   # Remplit DB test data

# Format code
pnpm format
```

---

## 📊 Workflows Asynchrones (QStash)

```javascript
// Exemples de background jobs

// 1. Sync orders après paiement
/api/workers/sync-orders

// 2. Traiter refunds
/api/workers/process-refund

// 3. Retry paiements échoués
/api/workers/payment-retry

// 4. Envoyer notifications
/api/workers/send-notifications

// 5. Générer analytics
/api/workers/generate-analytics
```

---

## 🤖 AI & Intelligence

### Chat Agent
- **Endpoint**: /api/chat
- **LLM**: Groq API (Claude/Mistral)
- **Capabilities**:
  - Recommendations basées sur préférences
  - Réponses questions sur produits/services
  - Suggestions localisation-aware
  - Support multi-langue

### Semantic Search
- **Endpoint**: /api/semantic-search
- **Features**:
  - Compréhension Darija natif
  - Context-aware recommendations
  - Synonymes & suggestions
  - Filter par catégorie/localisation

### Image Search
- **Endpoint**: /api/image-search
- **Tech**: Google Gemini Vision
- **Use case**: Trouver similaires à partir image client

---

## 📱 Responsive Design

- **Desktop** (1920px+): Full features, 3D animations
- **Tablet** (768px-1024px): Optimized layout
- **Mobile** (<768px): Touch-friendly, simplified UI

---

## 🧪 Testing & QA

- Unit tests: Jest (optionnel)
- E2E tests: Playwright (optionnel)
- Type checking: TypeScript strict
- Linting: ESLint + Prettier

---

## 🎨 UI Components Library

Utilise **Radix UI** (40+ composants) + TailwindCSS:
- Buttons, Cards, Modals, Dropdowns
- Form inputs, Selects, Checkboxes
- Tabs, Accordion, Popover
- Dialogs, Alerts, Toasts
- Custom styling via CSS variables

---

## 🔗 Intégrations Externes

| Service | Utilisation |
|---|---|
| **Supabase** | DB, Auth, Storage, Real-time |
| **Groq** | LLMs pour IA |
| **Google Places** | Maps & géolocalisation |
| **Google Gemini** | Vision & NLP avancé |
| **Stripe** | Paiements (cartes) |
| **Flouci** | Paiements locaux Tunisie |
| **Resend** | Email transactionnels |
| **Upstash QStash** | Background jobs async |
| **Vercel** | Hosting + Edge functions |

---

## 📈 Modèle Économique

### Monétisation
- **Merchants Premium**: 99-499 TND/mois
- **Commission**: 5-10% sur transactions
- **API externe**: Vente APIs à partenaires
- **Publicités**: Boost visibility (optionnel)
- **Transactions**: Frais paiement (2-3%)

---

## 🎓 Notes pour l'Apprentissage

### Concepts Clés à Comprendre
1. **Next.js 15 App Router** - Structure moderne avec Server Components
2. **Server Actions** - Alternative REST pour DB operations
3. **Supabase RLS** - Sécurité au niveau DB
4. **Zustand** - Simple state management (alternative Redux)
5. **TypeScript** - Type safety stricte
6. **TailwindCSS** - Utility-first CSS
7. **Three.js** - 3D WebGL background

### Fichiers À Étudier en Priorité
1. `lib/actions/orders.ts` - Core business logic
2. `lib/supabase/server.ts` - DB interactions
3. `app/api/auth/` - Authentification flow
4. `components/BackgroundScene.tsx` - 3D system
5. `middleware.ts` - Session & rate limit

---

## 🆘 Support & Documentation

Fichiers documentation:
- `BACKEND_ARCHITECTURE.md` - Architecture backend
- `PLATFORM_DESIGN_COMPLETE.md` - Design complet
- `ORDERS_SYSTEM_GUIDE.md` - Système commandes
- `DATABASE_SCHEMA.md` - Schéma DB
- `QUICKSTART.md` - Guide démarrage

---

**Dernière mise à jour**: Mai 2026  
**Prêt pour Claude Code** ✅
