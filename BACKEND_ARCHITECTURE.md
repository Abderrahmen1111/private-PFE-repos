# 🔧 Architecture Complète du Backend - Ro2ya

**Plateforme:** Ro2ya - Marketplace SaaS Tunisienne  
**Date:** Avril 2026  
**Version:** 1.0  
**Tech Stack:** Next.js 15 + TypeScript + Supabase + Groq AI + Upstash

---

## 📑 Table des Matières

1. [Vue d'ensemble de l'architecture](#vue-densemble)
2. [Structure des dossiers](#structure-des-dossiers)
3. [Base de données & Supabase](#base-de-données)
4. [Server Actions](#server-actions)
5. [API Routes](#api-routes)
6. [Middleware & Authentification](#middleware--authentification)
7. [Systèmes de Sécurité](#systèmes-de-sécurité)
8. [AI & NLP](#ai--nlp)
9. [Workers Asynchrones](#workers-asynchrones)
10. [Services & Utilitaires](#services--utilitaires)

---

## 🏗️ Vue d'ensemble de l'architecture

### Architecture Générale

```
┌─────────────────────────────────────────────────┐
│           Frontend (React/Next.js)              │
│  Components, Pages, Hooks, UI Components        │
└────────────────┬────────────────────────────────┘
                 │
                 ├─→ API Routes (/app/api)
                 ├─→ Server Actions (/lib/actions)
                 └─→ Middleware
                 
┌─────────────────────────────────────────────────┐
│          Backend Layer (Next.js Server)         │
├─────────────────────────────────────────────────┤
│  • Supabase (DB, Auth, Storage)                 │
│  • Groq AI (LLMs, Vision)                       │
│  • Upstash QStash (Async Workers)              │
│  • Google Places API                           │
│  • Resend Email Service                        │
└─────────────────────────────────────────────────┘
```

### Flux de Requête Typique

```
Client Request
    ↓
Middleware (Rate Limit, Auth)
    ↓
API Route / Server Action
    ↓
Supabase (Query Data)
    ↓
Process Business Logic
    ↓
Response / State Update
    ↓
QStash Worker (si async)
```

---

## 📂 Structure des Dossiers

### Structure Complète

```
project-root/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Endpoints d'authentification
│   │   │   ├── login
│   │   │   ├── signup
│   │   │   ├── logout
│   │   │   ├── verify
│   │   │   ├── session
│   │   │   └── magic-link
│   │   ├── chat/              # Chat IA
│   │   ├── ai-agent/          # Agent intelligent routeur
│   │   ├── image-search/      # Recherche par image
│   │   ├── semantic-search/   # Recherche sémantique Darija
│   │   ├── places/            # Google Places proxy
│   │   │   └── search
│   │   ├── admin/             # Admin endpoints
│   │   │   ├── orders
│   │   │   │   ├── validate
│   │   │   │   ├── export
│   │   │   │   └── [id]/status
│   │   │   └── transactions
│   │   ├── webhooks/          # Webhooks externes
│   │   │   └── order
│   │   │       ├── confirm
│   │   │       └── refund
│   │   └── workers/           # Background jobs (QStash)
│   │       ├── sync-orders
│   │       ├── process-refund
│   │       └── payment-retry
│   ├── (routes)/              # Pages publiques/privées
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── actions/               # Server Actions (Next.js)
│   │   ├── orders.ts         # Gestion commandes
│   │   ├── auth.ts           # Authentification
│   │   ├── search_bus.ts     # Recherche magasins
│   │   ├── search_items.ts   # Recherche produits
│   │   ├── search_service.ts # Recherche services
│   │   ├── profile.ts        # Gestion profil
│   │   ├── business.ts       # Gestion magasins
│   │   ├── items.ts          # Gestion produits/services
│   │   ├── reviews.ts        # Avis & commentaires
│   │   ├── transactions.ts   # Transactions
│   │   ├── notifications.ts  # Notifications
│   │   ├── favorites.ts      # Favoris
│   │   ├── comments.ts       # Commentaires
│   │   ├── reels.ts          # Reels/Stories
│   │   ├── reservations.ts   # Réservations
│   │   ├── recommendations.ts # Recommandations
│   │   └── ... (autres actions)
│   ├── agents/               # AI Agent Configuration
│   │   └── prompts.ts       # Prompts & contexte pour LLM
│   ├── supabase/             # Clients Supabase
│   │   ├── server.ts        # Client serveur (avec cookies)
│   │   ├── browser.ts       # Client navigateur
│   │   ├── admin.ts         # Client admin (Service Role)
│   │   ├── client.ts        # Base client
│   │   ├── auth.ts          # Auth utilities
│   │   ├── database.ts      # Database queries
│   │   ├── storage.ts       # Storage operations
│   │   ├── realtime.ts      # Real-time subscriptions
│   │   └── middleware.ts    # Session middleware
│   ├── utils/               # Utilitaires
│   │   └── qr-code.ts      # Génération QR codes
│   ├── store/               # Zustand Stores
│   │   ├── use-messaging-store.ts
│   │   ├── use-call-store.ts
│   │   └── use-saves-store.ts
│   ├── darija-dictionary.ts # Dict. Darija Tunisien
│   ├── admin-auth.ts        # Admin auth checker
│   ├── rate-limit.ts        # Rate limiting rules
│   ├── rate-limit.ts        # Upload management
│   ├── storage.ts           # Media URL getter
│   ├── suggestions.ts       # Search suggestions
│   ├── mock-data.ts         # Données mock
│   └── utils.ts             # Utility functions
├── components/              # React Components
├── types/                   # TypeScript types
├── middleware.ts            # Express-like middleware
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 🗄️ Base de Données & Supabase

### Architecture Supabase

```
Ro2ya Supabase Project
├── Authentication (Auth via email/password)
├── PostgreSQL Database
│   ├── Tables Core
│   │   ├── users (profils utilisateurs)
│   │   ├── profiles (rôles: client, pro, admin)
│   │   ├── stores (magasins/boutiques)
│   │   ├── items (produits & services)
│   │   ├── orders (commandes)
│   │   ├── bookings (réservations)
│   │   ├── transactions (mouvements financiers)
│   │   ├── reviews (avis clients)
│   │   ├── comments (commentaires)
│   │   ├── favorites (favoris)
│   │   ├── notifications (notifications)
│   │   ├── messages (messagerie)
│   │   ├── reels (contenu vidéo)
│   │   ├── stories (stories éphémères)
│   │   ├── leads (pistes commerciales)
│   │   ├── friendships (connexions entre users)
│   │   └── business_directory_tunisia (annuaire externe)
│   ├── Row Level Security (RLS)
│   │   ├── Policy: Users ne voient que leurs données
│   │   ├── Policy: Admins ont accès total
│   │   └── Policy: Public data visible à tous
│   └── Full Text Search & Vectors
│       ├── Search indexes sur stores & items
│       └── Vector embeddings pour semantic search
├── Storage (Buckets)
│   ├── reels/ (Vidéos)
│   ├── uploads/ (Images utilisateurs)
│   └── documents/ (PDFs, fichiers)
└── Real-time Subscriptions
    ├── Orders updates
    ├── Messages
    └── Notifications
```

### Clients Supabase

#### 1. **Server Client** (`lib/supabase/server.ts`)
```typescript
// Pour les Server Components & Server Actions
// Accès aux cookies = utilise session utilisateur
// RLS appliquée automatiquement
const supabase = createClient()
```

**Cas d'usage:**
- Lire des données utilisateur authentifié
- Créer/modifier des données (respecte RLS)
- Dans `/app/api` ou Server Actions

#### 2. **Browser Client** (`lib/supabase/browser.ts`)
```typescript
// Pour les Client Components
// Real-time subscriptions
// Accès limité par RLS
const supabase = supabaseBrowser()
```

**Cas d'usage:**
- Client-side data fetching
- Real-time updates
- Chat & messages

#### 3. **Admin Client** (`lib/supabase/admin.ts`)
```typescript
// Utilise Service Role Key
// BYPASSE RLS complètement
// ATTENTION: Accès non sécurisé
const supabaseAdmin = createAdminClient()
```

**Cas d'usage:**
- Webhooks (pas de session utilisateur)
- Background workers (Upstash QStash)
- Opérations admin privilegiées

### Intégrité des Données

#### Row-Level Security (RLS)

**Policy: Users voient leurs propres données**
```sql
-- Example: orders table
CREATE POLICY "Users can see their own orders"
ON orders
FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Store owners can see their orders"
ON orders
FOR SELECT
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);
```

**Policy: Public data visible à tous**
```sql
-- Stores approved = public
CREATE POLICY "Public stores are viewable"
ON stores
FOR SELECT
USING (status = 'APPROVED');
```

#### Transactions

```typescript
// Atomicité garantie par PostgreSQL
const { data, error } = await supabase
  .from('orders')
  .insert(order)
  .select();

if (!error) {
  // Transaction réussie ou rollback
  await syncOrderTransaction(order, supabase);
}
```

---

## ⚡ Server Actions

### Qu'est-ce qu'une Server Action?

```typescript
'use server'

export async function createOrder(data: OrderData) {
  // S'exécute côté serveur UNIQUEMENT
  // Accès direct à la DB, variables d'env, etc.
  // Appelée depuis un formulaire ou composant client
}
```

### Actions Principales

#### 1. **Orders** (`lib/actions/orders.ts`)

**`createOrder()`**
```typescript
export async function createOrder(
  data: Omit<OrderInsert, 'order_number' | 'status' | 'customer_id'>
): Promise<OrderRow>
```
- Crée une new commande
- Génère numéro unique: `ORD-XXXXXX-XXXX`
- Vérifie que l'utilisateur ne commande pas dans son propre magasin
- Synchronise transaction
- Publie job QStash pour payment-retry (2 mins delay)

**`updateOrderStatus()`**
- Mise à jour du statut (PENDING → VALIDATED → SHIPPED → COMPLETED)
- Timestamps automatiques
- Sync transaction

**`cancelOrder()`**
- Annule une commande
- Processe remboursement (async)
- Raison optionnelle

#### 2. **Authentication** (`lib/actions/auth.ts`)

**`loginAction(formData)`**
- Email + Password validation
- Rate limit check (5 essais / 15 mins)
- Redirection par rôle

**`signupAction(formData)`**
- Création utilisateur
- Envoi vérifie email
- Rate limit check (3 / heure)

**`logoutAction()`**
- Session clear
- Cookie cleanup

#### 3. **Search** (`lib/actions/search_bus.ts`, `search_items.ts`)

**`searchStores(queryStr, locationStr)`**
```typescript
export async function searchStores(
  queryStr: string = '',
  locationStr: string = ''
): Promise<Business[]>
```
- Recherche native stores + business_directory
- Support Darija
- Log la recherche pour recommendations
- Filtre stores APPROVED/PUBLISHED
- Full-text search avec ilike
- Limite: 50 résultats

**Traduction Darija:**
```typescript
const translatedQuery = translateDarijaForSearch(queryStr);
// "نحب نشري ماكينة" → "acheter machine"
```

**Noise words removal:**
```typescript
const noiseWords = ['le', 'la', 'les', 'de', 'pour', 'et', ...];
let keywords = query.split(/\s+/)
  .filter(w => w.length > 2 && !noiseWords.has(w));
```

#### 4. **Profile** (`lib/actions/profile.ts`)

**`getOwnerProfileData(businessId?)`**
- Récupère profil user + magasin(s)
- Metrics: reviews, rating, bookings
- Derniers avis
- Statistiques hebdo
- Vérification owner

**`updateProfile(profileData)`**
- Mise à jour profil user
- Avatar upload
- Informations personnelles

#### 5. **Transactions** (`lib/actions/transactions.ts`)

**`syncOrderTransaction(order, supabaseClient?)`**
```typescript
// Sync une commande vers la table transactions
// Mapping automatique des statuts:
// PENDING/VALIDATED/SHIPPED → pending
// COMPLETED → completed
// CANCELLED → failed
```

**Données synced:**
- `transaction_code` (order_number)
- `merchant_id`, `merchant_name`, `merchant_number`
- `customer_id`, `customer_name`
- `amount` (total_price)
- `status` (mapped)
- `qr_code_token` (tracking_code)

#### 6. **Other Key Actions**

| Action | Description |
|--------|-------------|
| `addbuss()` | Ajouter un nouveau magasin |
| `updateBusiness()` | Admin: mettre à jour magasin |
| `createItem()` | Créer produit/service |
| `updateItem()` | Update produit/service |
| `deleteItem()` | Supprimer produit/service |
| `createReview()` | Soumettre avis |
| `replyReview()` | Répondre à avis |
| `addFavorite()` | Ajouter aux favoris |
| `sendMessage()` | Envoyer message |
| `createNotification()` | Créer notification |
| `createReservation()` | Réserver service |
| `confirmReservation()` | Confirmer réservation |
| `createBooking()` | Réserver produit/service |

---

## 🌐 API Routes

### Structure des Routes

Tous les routes se trouvent dans `/app/api/` avec pattern `[route]/route.ts`

#### Authentication Routes

**`POST /api/auth/login`**
```typescript
// Request
{ email: string, password: string }

// Response
{ user: User, redirectUrl: string }
```

**`POST /api/auth/signup`**
**`POST /api/auth/logout`**
**`GET /api/auth/verify`** - Callback email verification
**`GET /api/auth/session`** - Get current session
**`POST /api/auth/magic-link`** - Send magic link

#### AI & Search Routes

**`POST /api/chat`**
- Chat streaming avec Groq
- Messages history
- Multilingual

**`POST /api/ai-agent`**
- Intent classification
- Store context fetching
- Routing vers modules

**`POST /api/image-search`**
- Analyse image avec Groq Vision
- Génère requête recherche

**`POST /api/semantic-search`**
- Recherche sémantique Darija
- 4 étapes normalisation
- Vector embeddings

**`GET /api/places/search`**
- Query: `?q=query&country=TN`
- Google Places API proxy
- Vérif. doublons DB
- Max 5 résultats

#### Admin Routes

**`POST /api/admin/orders/validate`**
- Valider commande
- Générer tracking QR code
- Sync transaction

**`GET /api/admin/orders/export`**
- Query: `?status=VALIDATED&limit=500`
- Export commandes filtrées

**`PUT /api/admin/orders/[id]/status`**
- Update statut commande
- Timestamps auto

**`GET /api/admin/transactions`**
- Query: `?storeId=uuid&limit=100`
- Récupère transactions

#### Webhooks

**`POST /api/webhooks/order/confirm`**
- Validation commande via webhook
- Auth via Bearer token

**`POST /api/webhooks/order/refund`**
- Traitement remboursement webhook

#### Workers (Upstash QStash)

**`POST /api/workers/sync-orders`**
- Sync commande vers ERP/logistics
- Retry auto

**`POST /api/workers/process-refund`**
- Traitement async remboursement
- Appel Stripe/Payment Provider

**`POST /api/workers/payment-retry`**
- Vérif. paiement avec retry logic
- Polling Payment Provider

---

## 🔒 Middleware & Authentification

### Middleware Principal (`middleware.ts`)

```typescript
export async function middleware(request: NextRequest)
```

**Responsabilités:**

1. **Rate Limiting**
   - POST /api/auth/login: 5 essais / 15 mins
   - POST /api/auth/signup: 3 essais / heure
   - POST /api/auth/magic-link: 3 essais / 10 mins
   - POST /api/** (general): 60 / mins

2. **Session Management**
   - Récupère session Supabase
   - Ajoute à headers réponse
   - Refresh token si expiré

3. **Security Headers**
   - X-RateLimit-Limit
   - X-RateLimit-Remaining
   - X-RateLimit-Reset
   - Retry-After

### Admin Authentication

```typescript
// lib/admin-auth.ts
export function checkAdminAuth(request: Request): NextResponse | null {
  const apiKey = request.headers.get('x-api-key') 
    || request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API Key' },
      { status: 401 }
    );
  }
  return null; // Authorized
}
```

**Utilisation:**
```typescript
const authError = checkAdminAuth(request);
if (authError) return authError;
// Continue...
```

---

## 🔐 Systèmes de Sécurité

### Rate Limiting (`lib/rate-limit.ts`)

**Strategy:**
- Upstash Redis en production (recommandé)
- Fallback Map en mémoire (dev/single-instance)

**Configuration:**
```typescript
export const RATE_LIMITS = {
  login: { requests: 5, windowMs: 15 * 60 * 1000 },
  magicLink: { requests: 3, windowMs: 10 * 60 * 1000 },
  signup: { requests: 3, windowMs: 60 * 60 * 1000 },
  api: { requests: 60, windowMs: 60 * 1000 },
}
```

**Result Object:**
```typescript
interface RateLimitResult {
  success: boolean  // true = allowed
  limit: number     // max requests
  remaining: number // requests left
  resetAt: number   // ms timestamp
}
```

### CORS & Origin Validation

```typescript
function validateOrigin(): boolean {
  const origin = headers().get('origin');
  const host = headers().get('host');
  return new URL(origin).host === host;
}
```

### Environment Variables Security

**Sensibles (côté serveur uniquement):**
```
SUPABASE_SERVICE_ROLE_KEY
ADMIN_API_KEY
GROQ_API_KEY
GEMINI_API_KEY
GOOGLE_PLACES_API_KEY
QSTASH_TOKEN
WEBHOOK_SECRET
RESEND_API_KEY
```

**Publiques (côté client):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

---

## 🤖 AI & NLP

### 1. Darija Dictionary System

**`lib/darija-dictionary.ts`**

Dictionnaire complet Darija Tunisien:
- 500+ entrées
- Support Arabic, Phonétique Française, Chiffres

**Catégories:**
- Verbes: نحب (je veux), نلقى (trouver)
- Adjectifs: مفتوح (ouvert), مسكر (fermé)
- Villes Tunisiennes: تونس, تطاوين, دقة
- Quantités: برشا (beaucoup), شوية (un peu)
- Produits: ماكلة (nourriture), كرهبة (voiture)
- Qualités: بهي (bon), رخيص (pas cher)

**Fonction Pricipale:**
```typescript
export function translateDarijaForSearch(input: string): string
// "نحب نشري ماكينة خياطة" → "acheter machine couture"
```

### 2. Groq AI Integration

**Service:** Groq API (OpenAI-compatible)
**Models:**
- `llama-3.1-8b-instant` - Chat, intent classification
- `meta-llama/llama-4-scout-17b-16e-instruct` - Vision

**Avantages:**
- Gratuit pour dev
- ~200 tokens/sec ultra-rapide
- Sub-second first token
- Pas setup compliqué

**Configuration:**
```typescript
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  timeout: 25_000,
});
```

### 3. Chat Endpoint (`/api/chat`)

**Système Prompt:**
```
You are Ro2ya's helpful AI assistant — an intelligent marketplace 
assistant for the Ro2ya platform, a premium SaaS marketplace based 
in Tunisia.

You help users:
- Find products and businesses that match their needs
- Compare options and make informed purchase decisions
- Navigate the Ro2ya marketplace
- Answer questions about sellers, products, and services
- Provide personalized recommendations

Multilingual: Réponds en Français, Arabe, ou Anglais
```

**Streaming:**
```typescript
const stream = await client.chat.completions.create({
  model: 'llama-3.1-8b-instant',
  max_tokens: 512,
  stream: true,
  temperature: 0.7,
  messages: [...],
});
```

### 4. AI Agent Routing (`/api/ai-agent`)

**Intent Classification:**
- `analytics` - Statistiques vendeur
- `marketing` - Stratégies promotionnelles
- `product` - Gestion produits
- `moderation` - Contenu approprié
- `general` - Requêtes générales

**Context Building:**
```typescript
// Récupère store context
const ctx = await getStoreContext(storeId);

// Construit prompt enrichi
const prompt = buildContextBlock(ctx);

// Format: Commandes par statut, revenue, items, reviews, etc.
```

### 5. Image Search (`/api/image-search`)

**Vision Model:** Llama 4 Scout 17B
**Input:** Base64 image data
**Output:** Mots-clés de recherche (5-10 words max)

```typescript
const response = await client.chat.completions.create({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  max_tokens: 100,
  messages: [{
    role: "user",
    content: [
      { type: "image_url", image_url: { url: image } },
      {
        type: "text",
        text: "Generate a short search query (5-10 words max). Respond in French."
      }
    ]
  }]
});
```

### 6. Semantic Search (`/api/semantic-search`)

**4-Step Normalization Process:**

**Étape 1: Pré-normalisation (Dictionary)**
```
Input: "نقول نحوز مكاين تايجة"
↓
Dictionary lookup: "تايجة" → "خياطة"
↓
Output: "قول نحوز ماكينة خياطة"
```

**Étape 2: Normalisation IA (Groq)**
```
Input: "قول نحوز ماكينة خياطة"
↓
Groq prompt: Normalise diacritiques, consonnes variables
↓
Output: "قل نحوز ماكينة خياطة"
```

**Étape 3: Correction + Enrichissement (Gemini)**
```
Input: "قل نحوز ماكينة خياطة"
↓
Correction orthographique + contexte ville
↓
Output: "قل أحوز ماكينة خياطة تونس"
```

**Étape 4: Recherche Hybride**
```
1. Génère embedding (vector)
2. Recherche vectorielle (semantic similarity)
3. Full-text search (keyword matching)
4. Score combiné (highest = best result)
```

**Response:**
```typescript
{
  results: [{ id, name, score }, ...],
  processing: {
    original, preNormalized, normalized, 
    corrected, enriched, darijaWordsFound
  }
}
```

---

## 🔄 Workers Asynchrones

### Upstash QStash Integration

**Config:**
```typescript
const qstash = process.env.QSTASH_TOKEN 
  ? new QStashClient({ token: process.env.QSTASH_TOKEN })
  : null;
```

**Publishing Event:**
```typescript
const publishQStashEvent = async (
  endpoint: string,
  payload: any,
  delay: number = 0
) => {
  if (!qstash) return;
  
  await qstash.publishJSON({
    url: `${siteUrl}/api/workers/${endpoint}`,
    body: payload,
    delay // seconds
  });
};
```

### Worker 1: Sync Orders (`/api/workers/sync-orders`)

**Trigger:** Manual ou après créer order (120s delay)

**Responsabilité:**
- Fetch commande from DB
- Appel `EXTERNAL_API_URL`
- POST avec:
  ```json
  {
    "order_reference": "ORD-...",
    "customer_id": "uuid",
    "items": [...],
    "status": "PENDING"
  }
  ```
- Retry auto si erreur

**Error Handling:**
```typescript
if (!response.ok) {
  throw new Error(`External sync failed with status ${response.status}`);
  // QStash automatiquement retry
}
```

### Worker 2: Process Refund (`/api/workers/process-refund`)

**Trigger:** Manual ou via webhook

**Responsabilité:**
- Appel Payment Provider (ex: Stripe)
- Traitement remboursement
- Update local order status → CANCELLED
- Server action: `cancelOrder(orderId, reason)`

**Signature Verification:**
```typescript
export const POST = verifySignatureAppRouter(handler);
// QStash vérifie toutes les requêtes
```

### Worker 3: Payment Retry (`/api/workers/payment-retry`)

**Trigger:** Auto après créer order (120s delay)

**Responsabilité:**
- Vérifier statut paiement
- Si VALIDATED ou COMPLETED → success
- Sinon → retry (throw error force QStash retry)
- Polling Payment Provider

**Logique:**
```typescript
if (order.status !== 'VALIDATED' && order.status !== 'COMPLETED') {
  throw new Error('Payment not yet confirmed. Retrying...');
  // QStash retry selon schedule
}
```

### Retry Policy

**By Default (QStash):**
- 3 retries total
- Exponential backoff
- 5s initial delay
- Max 24h window

**Custom Config Possible:**
- Headers `Upstash-Retries: 5`
- Headers `Upstash-Delay: 60`

---

## 🛠️ Services & Utilitaires

### Storage Management

**`lib/storage.ts`**
```typescript
export function getMediaUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;
  // Example: reels/store_1/1234567890-video.mp4
}
```

### Upload Handling

**`lib/upload.ts`**
```typescript
export const uploadToSupabase = async (file: File, storeId: number) => {
  const fileName = `store_${storeId}/${Date.now()}-${file.name}`;
  
  const { error } = await supabase.storage
    .from("reels")
    .upload(fileName, file);
  
  if (error) throw error;
  
  return `reels/${fileName}`;
};
```

### QR Code Generation

**`lib/utils/qr-code.ts`**
```typescript
// Génère QR code pour tracking_code de commande
// Utilisé sur labels, emails, etc.
export function generateQRCode(trackingCode: string): DataURL
```

### Search Suggestions

**`lib/suggestions.ts`**
```typescript
// Auto-complete suggestions
// Basé sur recherches populaires
// Requêtes récentes utilisateur
export async function getSuggestions(query: string): Promise<string[]>
```

### TypeScript Types

**`types/index.ts`**
```typescript
export * from './supabase'    // Generated types
export * from './business'    // Business types
export * from './messaging'   // Messaging types
export * from './ai-agent'    // AI types
export * from './index'       // Root types
```

**Exemple Business Type:**
```typescript
export interface Business {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  priceRange: string;
  isOpen: boolean;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
}
```

### Utility Functions

**`lib/utils.ts`**
```typescript
// TailwindCSS class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Mock Data

**`lib/mock-data.ts`**
```typescript
// Données de test pour développement
export const mockBusinesses: Business[] = [...]
export const mockProducts: Product[] = [...]
export const mockOrders: Order[] = [...]
```

---

## 📊 Data Flow Examples

### Flow 1: Login

```
User fills login form
  ↓
Client POST /login (Server Action)
  ↓
Middleware: Rate limit check
  ↓
auth.ts: Form validation
  ↓
Supabase.auth.signInWithPassword(email, password)
  ↓
If Success:
  - Fetch user role from profiles table
  - If role === 'admin' → redirect /admin/dashboard
  - Else if role === 'pro' → redirect /merchants/dashboard
  - Else → redirect /
  ↓
Session cookie set automatiquement
```

### Flow 2: Create Order

```
User clicks "Order" surun produit
  ↓
Client call createOrder(productId, storeId, quantity, ...)
  ↓
Server Action createOrder()
  ↓
1. Auth check - get current user
2. Verify user ≠ store owner (can't order from self)
3. Generate order_number (ORD-XXXXXX-XXXX)
4. Insert into orders table with status PENDING
5. syncOrderTransaction() → populate transactions table
6. publishQStashEvent('payment-retry', {orderId}, 120s)
  ↓
Return Order object
  ↓
Client: show success message
  ↓
After 2 minutes:
  - QStash calls /api/workers/payment-retry
  - Check if payment confirmed
  - If not → throw error → QStash retry
```

### Flow 3: Semantic Search

```
User types Arabic: "نحب نشري ماكينة خياطة وحالي"
  ↓
Client POST /api/semantic-search
  ↓
Step 1: Dictionary lookup
  "نحب" → "je veux"
  "ماكينة" → "machine"
  "خياطة" → "couture"
  Pre-normalized: "قول نشري ماكينة خياطة"
  ↓
Step 2: Groq Normalization
  Remove diacritics, normalize consonants
  Normalized: "قل نشري ماكينة خياطة"
  ↓
Step 3: Gemini Correction + Enrichment
  Correct spelling
  Add location context
  Enriched: "قل أشتري ماكينة خياطة تونس"
  ↓
Step 4: Hybrid Search
  Generate vector embedding
  Vector search + full-text search
  Combine scores
  ↓
Return: [{id, name, score}, ...]
    + processing metadata (normalization steps)
```

### Flow 4: Admin Validate Order

```
Admin user in dashboard
  ↓
Click "Validate Order #12345"
  ↓
Client POST /api/admin/orders/validate
  + Header: Authorization: Bearer ADMIN_API_KEY
  + Body: { orderId: 12345 }
  ↓
checkAdminAuth() verify API key
  ↓
If not valid → return 401 Unauthorized
  ↓
If valid:
  1. Generate tracking_code (QR-ABCD1234-EFGH5678)
  2. Update order:
     - status: PENDING → VALIDATED
     - tracking_code: generated
     - validated_at: now
     - updated_at: now
  3. syncOrderTransaction() with new status
  ↓
Return: { success: true, order: {...} }
  ↓
Admin dashboard updates in real-time
  ↓
Optional: Generate QR label for shipping
```

---

## 🌍 External Services Integration

### 1. **Groq AI**
- Free tier for dev
- Chat models
- Vision models
- No auth token needed beyond API key

### 2. **Google Places API**
- Location search in Tunisia
- Duplicate prevention
- Returns: address, phone, rating, photo

### 3. **Google Gemini**
- Advanced NLP for correction
- Semantic enrichment
- Cost: Pay-as-you-go

### 4. **Supabase**
- PostgreSQL DB
- Auth system
- Vector DB (pgvector)
- Real-time subscriptions
- Storage buckets

### 5. **Upstash QStash**
- Serverless task queue
- Async background jobs
- Automatic retries
- Built for Vercel

### 6. **Resend**
- Email delivery service
- Transactional emails
- Magic link delivery

---

## 📈 Performance Optimization

### Caching Strategies

1. **Server-Side Caching**
   - Next.js `revalidatePath()` après mutations
   - ISR (Incremental Static Regeneration)

2. **Client-Side Caching**
   - Zustand for state management
   - React Query patterns

3. **DB Query Optimization**
   - Indexes sur frequently queried fields
   - Select specific columns (avoid SELECT *)

### Database Indexes

```sql
-- Created in Supabase migrations
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_items_store_id ON items(store_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### Streaming & Edge Functions

- Chat API returns streaming responses (SSE)
- Image processing done at edge via Groq
- Webhooks processed in edge runtime

---

## 🐛 Error Handling & Logging

### Try-Catch Pattern

```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) {
    console.error('[context/operation]', error.message);
    throw new Error('User-friendly message');
  }
  
  return data;
} catch (err: any) {
  return NextResponse.json(
    { error: err.message },
    { status: 500 }
  );
}
```

### Logging Conventions

```typescript
// Format: [context/operation] message
console.log('[auth/login] User ID:', user.id, '| Role:', role);
console.error('[orders/create] Error:', error.message);
console.warn('[qstash] Sync failed for order', orderId);
```

---

## 🚀 Deployment Considerations

### Environment Variables Required

**Production:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY
GEMINI_API_KEY
GOOGLE_PLACES_API_KEY
QSTASH_TOKEN
QSTASH_CURRENT_SIGNING_KEY
QSTASH_NEXT_SIGNING_KEY
WEBHOOK_SECRET
ADMIN_API_KEY
RESEND_API_KEY
EXTERNAL_API_URL (for ERP sync)
NEXT_PUBLIC_SITE_URL
```

### Database Migrations

- Managed via Supabase Migrations
- Version control: `/supabase/migrations/`
- Rollback capability

### Monitoring

- Error tracking: Sentry (optional)
- Performance: Vercel Analytics
- Database: Supabase Dashboard

---

## 📚 Architecture Patterns Used

1. **Server Actions** - Next.js 13+ pattern
2. **RLS (Row-Level Security)** - Data protection
3. **Admin Client Pattern** - Privilege escalation when needed
4. **Async Task Queue** - QStash for background work
5. **Semantic Search** - Multi-stage NLP processing
6. **Rate Limiting Middleware** - DDoS/abuse prevention
7. **Webhook Pattern** - External integrations
8. **Streaming API** - Real-time chat

---

**Documentation complète du Backend Ro2ya**  
**Dernière mise à jour:** Avril 2026  
**Version:** 1.0
