# 📚 Documentation Complète des API Backend - Ro2ya

**Plateforme:** Ro2ya - Marketplace Tunisienne  
**Date:** 2026  
**Version:** 1.0

---

## 📋 Table des Matières

1. [Authentication APIs](#authentication-apis)
2. [Chat & Messaging APIs](#chat--messaging-apis)
3. [AI Agent APIs](#ai-agent-apis)
4. [Search APIs](#search-apis)
5. [Places APIs](#places-apis)
6. [Admin APIs](#admin-apis)
7. [Webhooks](#webhooks)
8. [Background Workers](#background-workers)

---

## 🔐 Authentication APIs

### 1. **POST /api/auth/login**
Authentifie un utilisateur avec email et mot de passe.

**Méthode:** `POST`

**Requête:**
```json
{
  "email": "user@example.com",
  "password": "secret_password"
}
```

**Réponse (200):**
```json
{
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "role": "client|pro|admin",
    "...": "other_user_data"
  },
  "redirectUrl": "/"
}
```

**Réponse d'erreur (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Logique de redirection:**
- `admin` → `/admin/dashboard`
- `pro` ou `business_owner` → `/merchants/dashboard` (avec store)
- Autres → `/`

---

### 2. **POST /api/auth/signup**
Crée un nouveau compte utilisateur.

**Méthode:** `POST`

**Requête:**
```json
{
  "email": "newuser@example.com",
  "password": "strong_password",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+216 XX XXX XXX"
}
```

**Réponse (200):**
```json
{
  "user": {
    "id": "user_uuid",
    "email": "newuser@example.com"
  },
  "message": "Successfully signed up. Check your email for verification if required."
}
```

**Réponse d'erreur (400):**
```json
{
  "error": "Email already in use"
}
```

**Notes:**
- Email de vérification envoyé automatiquement
- Redirection vers `/api/auth/verify`

---

### 3. **POST /api/auth/logout**
Déconnecte l'utilisateur actuel.

**Méthode:** `POST`

**Requête:**
```
Empty body
```

**Réponse (200):**
```json
{
  "message": "Successfully logged out"
}
```

---

### 4. **GET /api/auth/verify**
Callback de vérification d'email après inscription.

**Méthode:** `GET`

**Paramètres:**
- `code` (query) - Code de vérification Supabase
- `next` (query) - URL de redirection (défaut: `/`)

**Réponse:**
- Redirection vers l'URL `next` ou `/login?error=Could+not+authenticate+user`

**Processus:**
1. Utilisateur clique sur le lien email
2. Code échangé pour une session utilisateur
3. Redirection vers la page appropriée

---

### 5. **GET /api/auth/session**
Récupère la session utilisateur actuelle.

**Méthode:** `GET`

**Réponse (200):**
```json
{
  "session": {
    "user": {
      "id": "user_uuid",
      "email": "user@example.com",
      "role": "client"
    },
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

**Réponse (200 - Pas de session):**
```json
{
  "session": null,
  "message": "No active session"
}
```

---

### 6. **POST /api/auth/magic-link**
Envoie un lien de connexion magique par email.

**Méthode:** `POST`

**Requête:**
```json
{
  "email": "user@example.com"
}
```

**Réponse (200):**
```json
{
  "message": "Magic link sent to your email"
}
```

**Processus:**
1. Génération d'un lien magique avec Admin API (Supabase)
2. Envoi du lien via Resend Email Service
3. Utilisateur clique sur le lien pour se connecter
4. Redirection vers `/api/auth/verify`

**Email Template:**
- Approuvé par Resend
- Lien valide pendant 24h

---

## 💬 Chat & Messaging APIs

### 7. **POST /api/chat**
Endpoint de chat en temps réel avec streaming.

**Méthode:** `POST`

**Requête:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Bonjour, comment puis-je trouver un produit?"
    },
    {
      "role": "assistant",
      "content": "Bienvenue sur Ro2ya! Comment puis-je vous aider?"
    }
  ]
}
```

**Réponse:** Stream SSE (Server-Sent Events)

**Configuration:**
- **Modèle:** Llama 3.1 8B (via Groq API)
- **Timeout:** 25 secondes
- **Max tokens:** 512
- **Température:** 0.7
- **Personnalité:** Assistant marketplace intelligent

**Prompt Système:**
```
You are Ro2ya's helpful AI assistant — an intelligent marketplace assistant 
for the Ro2ya platform, a premium SaaS marketplace based in Tunisia.

You help users:
- Find products and businesses that match their needs
- Compare options and make informed purchase decisions
- Navigate the Ro2ya marketplace
- Answer questions about sellers, products, and services
- Provide personalized recommendations

Personality: Warm, intelligent, concise, and trustworthy.
Respond in the same language the user writes in (French, Arabic, or English).
```

**Support multilingue:** Français, Arabe, Anglais

---

## 🤖 AI Agent APIs

### 8. **POST /api/ai-agent**
Endpoint intelligent pour le tri des demandes utilisateur.

**Méthode:** `POST`

**Requête:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Je veux voir mes analytics de ventes"
    }
  ]
}
```

**Réponse (200):**
```json
{
  "response": "Assistant response with context...",
  "intent": "analytics",
  "routing": "Directed to analytics module"
}
```

**Intents Disponibles:**
- `analytics` - Analytics et rapports de ventes
- `marketing` - Stratégies marketing et promotions
- `product` - Gestion des produits
- `moderation` - Modération de contenu
- `general` - Requêtes générales

**Processus:**
1. Classification d'intent avec Groq (Llama 3.1 8B)
2. Récupération du contexte du magasin
3. Construction du prompt approprié
4. Génération de réponse

**Modèle:** `llama-3.1-8b-instant` (Groq)

---

## 🔍 Search APIs

### 9. **POST /api/image-search**
Analyse d'images pour générer des requêtes de recherche.

**Méthode:** `POST`

**Requête:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZ..."
}
```

**Réponse (200):**
```json
{
  "query": "chaussures de sport noires pour femme"
}
```

**Réponse d'erreur (400):**
```json
{
  "error": "Invalid image data"
}
```

**Configuration:**
- **Modèle:** Llama 4 Scout 17B (Vision - Groq)
- **Max tokens:** 100
- **Langue de réponse:** Français (TN)
- **Paramètres acceptés:** `data:image/jpeg`, `data:image/png`, etc.

**Processus:**
1. Validation du format image (base64)
2. Envoi à Groq Vision API
3. Génération de requête de recherche

---

### 10. **POST /api/semantic-search**
Recherche sémantique avancée avec support du Darija (dialecte tunisien).

**Méthode:** `POST`

**Requête:**
```json
{
  "query": "نقول نحوز مكاين تايجة"
}
```

**Réponse (200):**
```json
{
  "results": [
    {
      "id": "product_1",
      "name": "Chaussures de sport",
      "score": 0.95
    }
  ],
  "processing": {
    "original": "نقول نحوز مكاين تايجة",
    "preNormalized": "قول نحوز ماكينة تايجة",
    "normalized": "قل نحوز ماكينة تايجة",
    "corrected": "قل أحوز ماكينة خياطة",
    "enriched": "قل أحوز ماكينة خياطة تونس",
    "darijaWordsFound": ["قول", "نحوز", "ماكينة", "تايجة"]
  }
}
```

**Processus de Normalisation (4 étapes):**

1. **Pré-normalisation:** Dictionnaire Darija-Français
   - Conversion: "تايجة" → "خياطة"
   
2. **Normalisation IA:** Groq Llama 3.1 8B
   - Correction de diacritiques
   - Normalisation de consonnes variales
   
3. **Correction & Enrichissement:** GEMINI API
   - Correction orthographique
   - Enrichissement contextuel
   
4. **Recherche Hybride:**
   - Génération d'embedding
   - Recherche vectorielle + full-text search
   - Score de pertinence combiné

**Dictionnaire Darija Intégré:**
- ~500 mots courants tunisiens
- Expressions régionales
- Prononciation variante

---

## 📍 Places APIs

### 11. **GET /api/places/search**
Recherche sécurisée de lieux avec Google Places API.

**Méthode:** `GET`

**Paramètres:**
- `q` (query) - Requête de recherche (min 3 caractères)
- `country` (query) - Code pays (défaut: `TN` pour Tunisie)

**Exemple:**
```
GET /api/places/search?q=café&country=TN
```

**Réponse (200):**
```json
[
  {
    "place_id": "ChIJX_adK8tpxxQRRf_j-v8ZQ3E",
    "name": "Café Central",
    "formatted_address": "123 Avenue Habib Bourguiba, Tunis",
    "lat": 36.8065,
    "lng": 10.1960,
    "phone": "+216 71 123 456",
    "rating": 4.5,
    "photo_url": "https://...",
    "types": ["cafe", "restaurant"],
    "business_status": "OPERATIONAL",
    "already_in_db": false,
    "db_id": null
  }
]
```

**Réponse vide (200):**
```json
[]
```

**Erreur d'absence de clé (200):**
```json
[]
```

**Logique:**
- Clé API serveur (sécurisée)
- Max 5 résultats
- Restriction géographique à la Tunisie
- Vérification des doublons dans la BD
- Champs: place_id, nom, adresse, géolocalisation, téléphone, note, photo

---

## 👨‍💼 Admin APIs

### 12. **POST /api/admin/orders/validate**
Valide une commande et génère un code de suivi.

**Méthode:** `POST`

**Autentification:** Header `Authorization: Bearer ADMIN_API_KEY`

**Requête:**
```json
{
  "orderId": 12345
}
```

**Réponse (200):**
```json
{
  "success": true,
  "order": {
    "id": 12345,
    "status": "VALIDATED",
    "tracking_code": "QR-ABCD1234-EFGH5678",
    "validated_at": "2026-04-22T10:30:00Z"
  }
}
```

**Processus:**
1. Vérification authentification admin
2. Génération code suivi unique (QR-XXXXX-XXXXX)
3. Update statut → `VALIDATED`
4. Synchronisation transaction
5. Mise à jour timestamp

---

### 13. **GET /api/admin/orders/export**
Exporte la liste des commandes avec filtres.

**Méthode:** `GET`

**Autentification:** Header `Authorization: Bearer ADMIN_API_KEY`

**Paramètres:**
- `limit` (query) - Nombre max de résultats (défaut: 1000)
- `status` (query) - Filtre par statut (`PENDING`, `VALIDATED`, `SHIPPED`, `COMPLETED`, `CANCELLED`)

**Exemple:**
```
GET /api/admin/orders/export?status=VALIDATED&limit=500
```

**Réponse (200):**
```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "id": 12345,
      "order_number": "ORD-2026-001234",
      "customer_id": "cust_uuid",
      "status": "VALIDATED",
      "total_amount": 89.99,
      "tracking_code": "QR-ABCD1234-EFGH5678",
      "created_at": "2026-04-20T09:15:00Z",
      "updated_at": "2026-04-22T10:30:00Z"
    }
  ]
}
```

---

### 14. **PUT /api/admin/orders/[id]/status**
Met à jour le statut d'une commande.

**Méthode:** `PUT`

**Autentification:** Header `Authorization: Bearer ADMIN_API_KEY`

**URL Params:**
- `id` - ID de la commande

**Requête:**
```json
{
  "status": "SHIPPED"
}
```

**Statuts Acceptés:**
- `PENDING`
- `VALIDATED`
- `SHIPPED`
- `COMPLETED`
- `CANCELLED`

**Réponse (200):**
```json
{
  "success": true,
  "order": {
    "id": 12345,
    "status": "SHIPPED",
    "updated_at": "2026-04-22T11:00:00Z"
  }
}
```

**Timestamps Automatiques:**
- Si statut = `VALIDATED` → `validated_at` = maintenant
- Si statut = `COMPLETED` → `completed_at` = maintenant

---

### 15. **GET /api/admin/transactions**
Récupère la liste des transactions.

**Méthode:** `GET`

**Autentification:** Header `Authorization: Bearer ADMIN_API_KEY`

**Paramètres:**
- `limit` (query) - Nombre max de résultats (défaut: 500)
- `storeId` (query) - Filtre par magasin

**Exemple:**
```
GET /api/admin/transactions?storeId=store_uuid&limit=100
```

**Réponse (200):**
```json
{
  "success": true,
  "count": 87,
  "data": [
    {
      "id": "txn_uuid",
      "store_id": "store_uuid",
      "order_id": 12345,
      "amount": 89.99,
      "currency": "TND",
      "status": "completed",
      "payment_method": "card",
      "created_at": "2026-04-22T10:30:00Z"
    }
  ]
}
```

---

## 🔗 Webhooks

### 16. **POST /api/webhooks/order/confirm**
Webhook pour confirmer une commande (webhook externe).

**Méthode:** `POST`

**Authentification:** Header `Authorization: Bearer WEBHOOK_SECRET`

**Requête:**
```json
{
  "orderId": 12345
}
```

**Réponse (200):**
```json
{
  "success": true,
  "order": {
    "id": 12345,
    "status": "VALIDATED",
    "tracking_code": "QR-ABCD1234-EFGH5678"
  }
}
```

**Processus:**
1. Vérification du secret webhook
2. Génération code suivi QR
3. Update statut → `VALIDATED`
4. Synchronisation transaction

---

### 17. **POST /api/webhooks/order/refund**
Webhook pour traiter un remboursement.

**Méthode:** `POST`

**Authentification:** Header `Authorization: Bearer WEBHOOK_SECRET`

**Requête:**
```json
{
  "orderId": 12345,
  "reason": "Customer requested cancellation"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "order": {
    "id": 12345,
    "status": "CANCELLED",
    "vendor_notes": "[REFUND_WEBHOOK] Customer requested cancellation"
  }
}
```

**Processus:**
1. Vérification du secret webhook
2. Update statut → `CANCELLED`
3. Ajout raison au `vendor_notes`
4. Synchronisation transaction inverse

---

## 🔄 Background Workers

Les workers utilisent **Upstash QStash** pour l'exécution asynchrone avec retry automatique.

### 18. **POST /api/workers/sync-orders**
Synchronise une commande avec les systèmes externes (ERP, logistique, etc).

**Méthode:** `POST` (Upstash QStash)

**Payload:**
```json
{
  "orderId": 12345
}
```

**Réponse (200):**
```json
{
  "success": true,
  "mocked": false,
  "externalResponse": { "...": "..." }
}
```

**Processus:**
1. Récupération de la commande
2. Appel au `EXTERNAL_API_URL`
3. Envoi des données:
   - `order_reference` - Numéro de commande
   - `customer_id` - ID client
   - `items` - Panier
   - `status` - Statut actuel
4. Retry automatique en cas d'erreur

**Retry Policy:** QStash détermine

---

### 19. **POST /api/workers/process-refund**
Traite un remboursement de façon asynchrone.

**Méthode:** `POST` (Upstash QStash)

**Payload:**
```json
{
  "orderId": 12345,
  "reason": "Out of stock"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Async Refund processed securely"
}
```

**Processus:**
1. Appel au fournisseur de paiement (ex: Stripe)
2. Traitement du remboursement
3. Mise à jour du statut local
4. Signature vérifiée via QStash

---

### 20. **POST /api/workers/payment-retry**
Réessai du paiement avec logique de retry intelligente.

**Méthode:** `POST` (Upstash QStash)

**Payload:**
```json
{
  "orderId": 12345
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Payment confirmed"
}
```

**Logique de Retry:**
- Vérifie le statut de la commande
- Si statut ≠ `VALIDATED` et ≠ `COMPLETED` → throw error (forces QStash retry)
- Appel fournisseur de paiement pour confirmation
- Retry automatique selon le calendrier QStash

---

## 🔒 Authentification & Sécurité

### Bearer Token Format
```
Authorization: Bearer ADMIN_API_KEY
```

### WEBHOOK_SECRET
```
Authorization: Bearer WEBHOOK_SECRET
```

### Validation Admin
```typescript
const authError = checkAdminAuth(request);
if (authError) return authError;
```

### Key Management
- Clés stockées en variables d'environnement
- Supabase Admin Client pour bypass RLS
- JWT tokens signés

---

## 🗂️ Résumé des Endpoints

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/auth/login` | Connexion | ─ |
| POST | `/api/auth/signup` | Inscription | ─ |
| POST | `/api/auth/logout` | Déconnexion | Session |
| GET | `/api/auth/verify` | Vérif. email | Code |
| GET | `/api/auth/session` | Session actuelle | Session |
| POST | `/api/auth/magic-link` | Lien magique | ─ |
| POST | `/api/chat` | Chat IA | Session |
| POST | `/api/ai-agent` | Agent routeur | Session |
| POST | `/api/image-search` | Recherche image | Session |
| POST | `/api/semantic-search` | Recherche sémantique | Session |
| GET | `/api/places/search` | Recherche lieux | API Key (serveur) |
| POST | `/api/admin/orders/validate` | Valider commande | Admin |
| GET | `/api/admin/orders/export` | Exporter commandes | Admin |
| PUT | `/api/admin/orders/[id]/status` | Update statut | Admin |
| GET | `/api/admin/transactions` | Transactions | Admin |
| POST | `/api/webhooks/order/confirm` | Webhook confirmation | Secret |
| POST | `/api/webhooks/order/refund` | Webhook remboursement | Secret |
| POST | `/api/workers/sync-orders` | Sync externe | QStash |
| POST | `/api/workers/process-refund` | Remb. async | QStash |
| POST | `/api/workers/payment-retry` | Retry paiement | QStash |

---

## 🌐 Services Externes Intégrés

### AI & NLP
- **Groq:** Llama 3.1 8B (Chat, Intent), Llama 4 Scout 17B (Vision)
- **Google Gemini:** Enrichissement sémantique et correction orthographique
- **Supabase Vector:** Embeddings et recherche vectorielle

### Infrastructure
- **Supabase:** Base de données PostgreSQL, Auth, Vector DB
- **Upstash QStash:** Queues asynchrones avec retry
- **Google Places API:** Géolocalisation et lieux

### Communication
- **Resend:** Service email
- **OpenAI/Groq:** API OpenAI-compatible

### Paiement & Webhooks
- **Stripe:** Traitement des paiements (potentiel)
- **Payment Providers:** Intégration flexible

---

## 📝 Notes Importantes

1. **Rate Limiting:** Implémenté via `rate-limit.ts`
2. **RLS:** Row-Level Security Supabase appliqué
3. **Admin Client:** Utilisé pour bypass RLS (webhooks, workers)
4. **Retry Logic:** QStash handle les workers automatiquement
5. **Error Handling:** Toutes les erreurs loggées avec contexte
6. **CORS:** Configuré pour requests frontend

---

## 🚀 Prochaines Étapes

- [ ] Documentation Swagger/OpenAPI
- [ ] Postman Collection
- [ ] SDK TypeScript Client
- [ ] Rate Limiting avancé
- [ ] Analytics Dashboard
- [ ] Monitoring & Alerting

---

**Document généré automatiquement**  
**Dernière mise à jour:** 2026-04-22
