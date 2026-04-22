# 📖 Index Complet du Backend - Ro2ya

**Statut:** Documentation Complète ✅  
**Date:** Avril 2026  
**Version:** 1.0

---

## 🎯 Guide d'Accès Rapide

Vous cherchez... → Consultez le document:

| Besoin | Document | Section |
|--------|----------|---------|
| **Tous les endpoints API** | `BACKEND_API_DOCUMENTATION.md` | Voir au complet |
| **Architecture globale** | `BACKEND_ARCHITECTURE.md` | Vue d'ensemble |
| **Structure BD complète** | `DATABASE_SCHEMA.md` | Toutes tables |
| **Server Actions** | `BACKEND_ARCHITECTURE.md` | Section Server Actions |
| **Darija (support tunisien)** | `BACKEND_ARCHITECTURE.md` | Section AI & NLP |
| **Rate Limiting** | `BACKEND_ARCHITECTURE.md` | Section Sécurité |
| **Webhooks** | `BACKEND_API_DOCUMENTATION.md` | Section Webhooks |
| **Workers Asynchrones** | `BACKEND_ARCHITECTURE.md` | Section Workers |
| **RLS & Sécurité BD** | `DATABASE_SCHEMA.md` | Section RLS |

---

## 📚 Documents Disponibles

### 1. **BACKEND_API_DOCUMENTATION.md** (20 API endpoints)

**Contenu:**
- ✅ 6 endpoints Authentication
- ✅ 1 endpoint Chat
- ✅ 1 endpoint AI Agent
- ✅ 1 endpoint Image Search
- ✅ 1 endpoint Semantic Search
- ✅ 1 endpoint Places
- ✅ 5 endpoints Admin
- ✅ 2 endpoints Webhooks
- ✅ 3 endpoints Background Workers

**Chaque endpoint inclut:**
- Méthode HTTP (GET, POST, PUT, DELETE)
- Paramètres d'entrée complets
- Exemples de réponses réussies
- Exemples d'erreurs
- Codes HTTP
- Logique métier
- Services externes utilisés
- Authentification requise

---

### 2. **BACKEND_ARCHITECTURE.md** (Architecture Complète)

**Sections principales:**

#### 🏗️ Vue d'ensemble
- Diagramme architecture globale
- Flux de requête typique
- Tech stack complet

#### 📂 Structure des dossiers
- `/app/api/` - Toutes les routes
- `/lib/actions/` - Server Actions (33 actions)
- `/lib/supabase/` - Clients DB
- `/lib/utils/` - Utilitaires
- Configuration complète

#### 🗄️ Base de données & Supabase
- 3 types de clients Supabase
  - Server Client (authenticated)
  - Browser Client (real-time)
  - Admin Client (bypass RLS)
- Row-Level Security (RLS) policies
- Transaction handling
- Exemples de code

#### ⚡ Server Actions
- 33 actions serveur principales
- `createOrder()` - Créer commande
- `searchStores()` - Recherche magasins
- `getOwnerProfileData()` - Profil propriétaire
- `syncOrderTransaction()` - Sync transactions
- Et 29 autres actions...

#### 🌐 API Routes
- Authentication routes
- AI & Search routes
- Admin routes
- Webhooks
- Workers

#### 🔒 Middleware & Authentification
- Rate limiting
- Admin auth
- Session management

#### 🔐 Systèmes de Sécurité
- Rate limiting configuration
- CORS & Origin validation
- Environment variables

#### 🤖 AI & NLP
- Darija Tunisian Dictionary (500+ words)
- Groq AI integration
- Chat streaming
- Intent classification
- Image search (vision)
- Semantic search (4-step process)

#### 🔄 Workers Asynchrones
- Upstash QStash integration
- 3 workers principaux
- Retry policies

#### 🛠️ Services & Utilitaires
- Storage management
- Upload handling
- QR code generation
- Search suggestions
- TypeScript types

#### 📊 Data Flows
- Login flow
- Order creation flow
- Semantic search flow
- Admin validation flow

#### 🌍 Services Externes
- Groq AI
- Google Places API
- Google Gemini
- Supabase
- Upstash QStash
- Resend Email

---

### 3. **DATABASE_SCHEMA.md** (Schéma PostgreSQL)

**17 Tables principales:**

#### 💾 Tables Core (4)
- `users` - Gérée par Supabase Auth
- `profiles` - Rôles utilisateurs
- `stores` - Magasins/boutiques
- `items` - Produits & services

#### 💳 Tables Transactionnelles (4)
- `orders` - Commandes clients
- `bookings` - Réservations services
- `transactions` - Mouvements financiers
- `reviews` - Avis clients

#### 📝 Tables de Contenu (3)
- `comments` - Commentaires
- `reels` - Contenu vidéo
- `stories` - Stories éphémères

#### 👥 Tables Sociales (5)
- `favorites` - Favoris
- `friendships` - Connexions
- `messages` - Messagerie
- `notifications` - Notifications
- `leads` - Pistes commerciales

#### 🛡️ Tables Admin (1)
- `business_directory_tunisia` - Annuaire externe

**Pour chaque table:**
- ✅ Toutes les colonnes
- ✅ Types de données
- ✅ Contraintes
- ✅ Description en français
- ✅ Indexes critiques
- ✅ RLS policies
- ✅ Relations avec autres tables

---

## 🚀 Architecture Globale

```
Frontend (React Components)
    ↓
API Routes + Server Actions
    ↓
Middleware (Rate Limit, Auth)
    ↓
Business Logic Layer
    ├─ Supabase (PostgreSQL + Auth)
    ├─ Groq AI (LLMs, Vision)
    ├─ Google Services (Places, Gemini)
    └─ External APIs (Stripe, ERP)
    ↓
Background Workers (Upstash QStash)
```

---

## 📊 Statistiques Backend

### Endpoints API
| Type | Nombre | Status |
|------|--------|--------|
| Authentication | 6 | ✅ Complète |
| Chat & AI | 4 | ✅ Complète |
| Search | 3 | ✅ Complète |
| Admin | 5 | ✅ Complète |
| Webhooks | 2 | ✅ Complète |
| Workers | 3 | ✅ Complète |
| **Total** | **23** | ✅ |

### Server Actions
| Catégorie | Nombre | Status |
|-----------|--------|--------|
| Orders | 4 | ✅ |
| Auth | 3 | ✅ |
| Search | 3 | ✅ |
| Profile | 2 | ✅ |
| Business | 2 | ✅ |
| Items | 3 | ✅ |
| Social | 5 | ✅ |
| Transactions | 1 | ✅ |
| Autres | 7 | ✅ |
| **Total** | **33+** | ✅ |

### Database Tables
| Type | Nombre | Indexes |
|------|--------|---------|
| Core | 4 | 15+ |
| Transactional | 4 | 10+ |
| Content | 3 | 5+ |
| Social | 5 | 8+ |
| Admin | 1 | 3+ |
| **Total** | **17** | **40+** |

---

## 🔑 Clés Concepts

### 1. **Server Actions** (Next.js 13+)
```typescript
'use server'
export async function actionName(data) {
  // Exécuté côté serveur uniquement
  // Accès direct DB, env variables
  // Sécurisé par défaut
}
```

### 2. **RLS (Row-Level Security)**
- Supabase feature
- Chaque utilisateur ne voit que ses données
- Policies écrites en SQL

### 3. **Rate Limiting**
- Middleware appliquée à `/api/auth/*`
- Default: 5 attempts / 15 mins pour login
- Fallback Redis ou en-memory

### 4. **Darija Support**
- Dictionnaire 500+ mots arabes
- Conversion automatique vers français
- Utilisé dans recherche sémantique

### 5. **Async Workers**
- Upstash QStash
- Background jobs
- Automatic retry with exponential backoff

### 6. **Admin Client**
- Bypasse RLS
- Utilisé pour webhooks & workers
- Nécessite Service Role Key

---

## 💡 Cas d'Usages Typiques

### 1. ✨ Utilisateur Se Connecte
```
POST /api/auth/login
  ↓
Middleware: Rate limit check
  ↓
Server Action: loginAction()
  ↓
Supabase Auth
  ↓
Fetch user role from profiles
  ↓
Redirect par rôle
```

### 2. 🛍️ Créer une Commande
```
Client: createOrder(productId, storeId, quantity)
  ↓
Server Action: createOrder()
  ↓
1. Verify user ≠ store owner
2. Generate order_number
3. Insert order (status: PENDING)
4. Sync transaction
5. Publish QStash job (payment-retry, 120s)
  ↓
Return order object
```

### 3. 🔍 Recherche Sémantique Darija
```
User types: "نحب نشري ماكينة خياطة"
  ↓
POST /api/semantic-search
  ↓
4-Step Process:
  1. Dict lookup: translate
  2. Groq: normalize
  3. Gemini: correct + enrich
  4. Hybrid search: vector + FTS
  ↓
Return: [items with scores] + processing metadata
```

### 4. 🤖 AI Agent Routing
```
POST /api/ai-agent
  ↓
Classify intent (Groq)
  - analytics? → fetch store context
  - marketing? → recommend actions
  - product? → list inventory
  ↓
Generate contextual response
```

### 5. 📦 Admin Validate Order
```
POST /api/admin/orders/validate
  + Header: x-api-key: ADMIN_KEY
  ↓
checkAdminAuth()
  ↓
Generate tracking QR code
  ↓
Update order status
  ↓
Sync transaction
```

---

## 🔗 Intégrations Externes

| Service | Usage | Config |
|---------|-------|--------|
| **Groq** | Chat, Intent, Vision | API Key |
| **Gemini** | NLP Correction | API Key |
| **Google Places** | Localisation | API Key |
| **Supabase** | DB, Auth, Storage | URL + Keys |
| **Upstash** | Async Jobs | Token |
| **Resend** | Email | API Key |
| **Stripe** | Payments | API Key |

---

## 📋 Checklist de Lecture

- [ ] Lire `BACKEND_API_DOCUMENTATION.md` pour endpoints
- [ ] Lire `BACKEND_ARCHITECTURE.md` pour structure complète
- [ ] Lire `DATABASE_SCHEMA.md` pour tables
- [ ] Comprendre les 3 clients Supabase
- [ ] Maîtriser les Server Actions
- [ ] Apprendre le Darija dictionary
- [ ] Tester les APIs avec Postman
- [ ] Setup env variables
- [ ] Déployer sur Vercel

---

## 🚀 Prochaines Étapes

### Pour Développement
1. [ ] Cloner repo
2. [ ] Setup `.env.local` avec toutes les clés
3. [ ] `npm install` ou `pnpm install`
4. [ ] `npm run dev`
5. [ ] Accéder http://localhost:3000

### Pour Déploiement
1. [ ] Setup variables d'env en production
2. [ ] Migrer DB mit Supabase
3. [ ] Deploy sur Vercel
4. [ ] Configurer webhooks (Upstash, Stripe)
5. [ ] Setup monitoring

### Pour Expansion
1. [ ] Ajouter nouvelles Server Actions
2. [ ] Créer nouvelles tables
3. [ ] Ajouter nouveaux endpoints API
4. [ ] Intégrer services additionnels
5. [ ] Optimiser performance

---

## 🆘 Troubleshooting

### Problem: "Unauthorized" sur Admin API
**Solution:** Vérifier header `x-api-key` ou `Authorization: Bearer`

### Problem: Rate limit exceeded
**Solution:** Attendre ou vérifier config `RATE_LIMITS`

### Problem: Darija not translating
**Solution:** Ajouter word au dictionnaire `lib/darija-dictionary.ts`

### Problem: Webhook not triggering
**Solution:** Vérifier `WEBHOOK_SECRET` et QStash config

### Problem: RLS blocking queries
**Solution:** Vérifier policies sur table, utiliser Admin Client si nécessaire

---

## 📞 Support & Resources

- **Documentation:** Voir les 3 fichiers markdown
- **Code:** `/app/api`, `/lib/actions`, `/lib/supabase`
- **Types:** `/types/`
- **Config:** `.env.local`, `next.config.js`, `tsconfig.json`

---

## ✅ Checklist Production

- [ ] Toutes les env variables configurées
- [ ] Rate limiting actif
- [ ] RLS policies appliquées
- [ ] Monitoring setup
- [ ] Backups DB
- [ ] SSL/HTTPS activé
- [ ] Logs centralisés
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Load testing effectué

---

**Backend Ro2ya - Documentation Index**  
**Créé:** Avril 2026  
**Version:** 1.0  
**Status:** ✅ Complet

---

## 📖 Ressources Externes

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Guide](https://supabase.com/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Upstash QStash](https://upstash.com/docs/qstash)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

**Pour toute question ou clarification, consultez la documentation détaillée.**
