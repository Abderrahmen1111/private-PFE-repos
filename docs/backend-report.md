# Rapport Backend Détaillé — ro2ya.tn

> Dernière mise à jour : 11 avril 2026  
> Framework : **Next.js 14 App Router** — `'use server'` actions via **Supabase**

---

## Table des matières

1. [lib/actions/auth.ts](#1-libactionsauthts)
2. [lib/actions/users.ts](#2-libactionsauthts)
3. [lib/actions/profile.ts](#3-libactionsprofilets)
4. [lib/actions/user-activity.ts](#4-libactionsuser-activityts)
5. [components/StoreAnalyticsTracker.tsx](#5-componentsstoreanalyticstrackertsx)
6. [Base de Données — SQL](#6-base-de-données--sql)
7. [Pages Frontend (résumé)](#7-pages-frontend-résumé)

---

## 1. `lib/actions/auth.ts`

Gestion de l'authentification.  
**Type commun** :
```ts
type ActionResult =
  | { success: true; message?: string }
  | { error: string }
```

### Helpers internes (non exportés)

| Fonction | Description |
|---|---|
| `validateOrigin()` | Vérifie que l'origine de la requête correspond au domaine courant (anti-CSRF) |
| `getIpFromHeaders()` | Extrait l'IP réelle du client depuis `x-real-ip`, `x-forwarded-for`, ou `cf-connecting-ip` |
| `getRoleFromDB(userId)` | Récupère le rôle de l'utilisateur depuis `public.profiles` |
| `redirectPathForRole(role)` | Retourne le chemin de redirection selon le rôle (`admin` → `/admin/dashboard`, autres → `/`) |

---

### `login(formData: FormData): Promise<ActionResult>`

- **Table** : `auth.users` (Supabase Auth)
- **Protection** : Rate limiting par IP + validation d'origine CSRF
- **Flux** :
  1. Validation des champs (`email`, `password`)
  2. `supabase.auth.signInWithPassword({ email, password })`
  3. `getRoleFromDB()` pour récupérer le rôle
  4. `revalidatePath('/', 'layout')` + `redirect(path)`

---

### `signup(formData: FormData): Promise<ActionResult>`

- **Table** : `auth.users`
- **Protection** : Rate limiting par IP + validation d'origine
- **Validation** :
  - Champs obligatoires : `fullName`, `email`, `password`
  - Mots de passe identiques
  - Longueur minimale : 8 caractères
- **Anti-doublon** : Vérifie `authData.user.identities.length === 0` → email déjà existant

---

### `sendLoginMagicLink(formData: FormData): Promise<ActionResult>`

- **Table** : `auth.users` (via `signInWithOtp`)
- **Config** : `shouldCreateUser: false` — réservé aux comptes existants
- **Sécurité** : Retourne toujours `{ success: true }` (anti-énumération d'emails)

---

### `sendSignupMagicLink(formData: FormData): Promise<ActionResult>`

- **Table** : `auth.users` (via `signInWithOtp`)
- **Différence** : `shouldCreateUser: true`, transmet `full_name` dans les `data` metadata

---

### `signout(): Promise<void>`

- **Flux** : `supabase.auth.signOut()` → `revalidatePath('/', 'layout')` → `redirect('/')`

---

### `sendPasswordResetEmail(email: string): Promise<ActionResult>` *(ajouté dans cette session)*

- **Table** : `auth.users` (via `resetPasswordForEmail`)
- **Redirection** : `${NEXT_PUBLIC_SITE_URL}/auth/update-password`
- **Usage** : Appelée depuis les pages profil utilisateur et propriétaire

---

### `updateUserPassword(password: string): Promise<ActionResult>` *(ajouté dans cette session)*

- **Table** : `auth.users` (via `supabase.auth.updateUser({ password })`)
- **Usage** : Appelée depuis la page `/auth/update-password` après confirmation du lien

---

## 2. `lib/actions/users.ts`

Gestion des données du profil dans `public.users`.

---

### `getUserProfile(userId: string)`

- **Table** : `public.users`
- **Requête** : `SELECT * WHERE id = userId`
- **Retourne** : `{ data, error }`

---

### `updateProfile(userId: string, updates: {...})` *(étendu dans cette session)*

- **Table** : `public.users` (UPDATE)
- **Champs supportés** :

| Champ | Type | Notes |
|---|---|---|
| `full_name` | `string` | Nom complet |
| `phone` | `string` | Téléphone |
| `city` | `string` | Ville |
| `avatar_url` | `string` | URL de l'avatar |
| `date_of_birth` | `string` | Date de naissance |
| `gender` | `string` | Genre |
| `two_factor_enabled` | `boolean` | **Nouveau** — authentification à deux facteurs |
| `email_notifications_enabled` | `boolean` | **Nouveau** — alertes email (défaut: `true`) |
| `login_alerts_enabled` | `boolean` | **Nouveau** — alertes de connexion (défaut: `true`) |

- **Post-action** : `revalidatePath('/')` pour invalider le cache Next.js

---

### `updateAvatar(userId: string, file: File)`

- **Tables** : `storage.objects` (bucket `avatars`) + `public.users` (UPDATE)
- **Flux** :
  1. Upload vers Supabase Storage : `avatars/{userId}/{timestamp}_{filename}`
  2. Récupération de l'URL publique via `getPublicUrl()`
  3. Mise à jour de `users.avatar_url`

---

### `deleteAccount(userId: string)`

- **Méthode** : `supabase.rpc('delete_user_account', { user_id: userId })`
- **Sécurité** : La suppression en cascade est gérée côté procédure SQL (server-side)
- **Retourne** : `{ success: true }` ou `{ error: string }`

---

## 3. `lib/actions/profile.ts`

Récupération de profils complets avec agrégation de métriques.

---

### `getOwnerProfileData(businessId?: number | string)` *(entièrement refondue dans cette session)*

Récupère et agrège toutes les données pour le tableau de bord du propriétaire.

#### Étape 1 — Authentification
```ts
supabase.auth.getUser() → redirect('/login') si non authentifié
```

#### Étape 2 — Profil utilisateur
```sql
SELECT * FROM public.users WHERE id = user.id
```
Inclut désormais : `two_factor_enabled`, `email_notifications_enabled`, `login_alerts_enabled`

#### Étape 3 — Boutique (Store)
- Si `businessId` fourni : essai via `id_business` (FK `business_directory_tunisia`), puis fallback sur `id`
- Sinon : première boutique de l'utilisateur (`ORDER BY created_at ASC LIMIT 1`)

#### Étape 4 — Métriques de base
```sql
-- Avis
SELECT id, rating, comment, created_at, vendor_response,
       users!author_id(full_name, avatar_url)
FROM reviews WHERE store_id = storeData.id ORDER BY created_at DESC

-- Réservations
SELECT COUNT(*) FROM bookings WHERE store_id = storeData.id

-- Commandes
SELECT COUNT(*) FROM orders WHERE store_id = storeData.id
```

#### Étape 5 — Analytics avancées *(nouvelle dans cette session)*
```sql
SELECT user_id, session_id, type, created_at
FROM store_analytics WHERE store_id = storeData.id
```

**Traitement en mémoire :**
- **Reconstruction des sessions** : Group par `session_id` → calcul `start` (premier événement) et `end` (dernier événement)
- **Durée moyenne** : `Σ(end - start) / n` en secondes → `Math.round()`
- **Visiteurs récurrents** : Utilisateurs avec ≥ 2 `session_id` distincts
- **Vues de contenu** : Comptage des événements `type === 'view'`

#### Étape 6 — Calcul CTR
```ts
ctr = uniqueSessionsCount > 0
  ? ((bookingsCount + ordersCount) / uniqueSessionsCount) * 100
  : 0
```

#### Métriques retournées

| Clé | Source | Description |
|---|---|---|
| `reviewsCount` | `reviews` | Nombre total d'avis |
| `avgRating` | `reviews.rating` | Note moyenne (1 décimale) |
| `totalViews` | `stores.view_count` | Vues du profil boutique |
| `totalPhotoViews` | `view_count` + `store_analytics` | Vues profil + contenus |
| `bookingsCount` | `bookings` | Nombre de réservations |
| `ordersCount` | `orders` | Nombre de commandes |
| `ctr` | Calculé | Taux de conversion (%) |
| `avgSessionTime` | `store_analytics` | Durée moyenne de session (s) |
| `returnVisitorsCount` | `store_analytics` | Visiteurs multi-sessions |
| `uniqueSessionsCount` | `store_analytics` | Sessions uniques totales |

---

### `getUserProfileData()`

Profil complet du client standard.

#### Données récupérées

| Donnée | Table | Détail |
|---|---|---|
| Profil | `public.users` | Toutes les colonnes |
| Stats | `reviews`, `bookings`, `orders`, `saved_places` | Comptages via `{ head: true }` |
| Commandes | `orders` ⋈ `stores` | Avec nom, logo, catégorie boutique |
| Avis | `reviews` ⋈ `stores` | Avec nom, logo, catégorie boutique |
| Réservations | `bookings` ⋈ `stores` ⋈ `items` | Avec nom du service |
| Lieux sauvegardés | `saved_places` ⋈ `stores` | Avec rating moyen |

#### Feed d'activité unifié
Combine reviews + orders + bookings, extrait les 3 derniers de chaque, trie par date décroissante, et formate les timestamps en locale `en-US`.

---

## 4. `lib/actions/user-activity.ts`

Journalisation d'activité pour la personnalisation et l'analytique.

---

### `logUserSearch(query: string)`

- **Table** : `public.user_search_history`
- **Comportement** : Ne journal que si l'utilisateur est authentifié (silencieux sinon)
- **Normalisation** : `query.trim().toLowerCase()`
- **Usage** : Nourrit l'algorithme de recommandations personnalisées

---

### `logStoreAnalyticsEvent(storeId, type, sessionId)` *(ajouté dans cette session)*

- **Table** : `public.store_analytics`
- **Types d'événements** :
  - `'view'` — Envoyé à l'entrée sur la page boutique
  - `'heartbeat'` — Envoyé toutes les 30 secondes si l'onglet est visible
- **Authentification** : `user_id` si connecté, `null` sinon (tracking anonyme supporté)
- **Retourne** : `{ success: true }` ou `{ error: string }`

---

## 5. `components/StoreAnalyticsTracker.tsx` *(nouveau fichier de cette session)*

Composant client invisible qui alimente `store_analytics`.

```
Props: { storeId: number }
Render: null (aucun DOM)
```

### Flux d'exécution

```
Montage du composant
  ├── Génère sessionId (double Math.random().toString(36))
  ├── Envoie événement 'view' immédiatement
  └── Lance setInterval(30s)
        └── Si document.visibilityState === 'visible'
              └── Envoie événement 'heartbeat'

Démontage du composant
  └── clearInterval() — arrêt propre du tracking
```

### Points clés

- `useRef` pour le `sessionId` → persistant entre re-renders, unique par montage
- Respect de la visibilité de l'onglet (pas de heartbeat si l'utilisateur est ailleurs)
- Nettoyage garanti via le retour de `useEffect`

---

## 6. Base de Données — SQL

### Nouvelle table : `store_analytics`

```sql
CREATE TABLE IF NOT EXISTS store_analytics (
    id          SERIAL PRIMARY KEY,
    store_id    INTEGER REFERENCES stores(id),
    user_id     UUID,                          -- NULL si anonyme
    session_id  VARCHAR(30) NOT NULL,          -- ID de session côté client
    type        VARCHAR(50) NOT NULL,          -- 'view' | 'heartbeat'
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Colonnes ajoutées à `public.users`

```sql
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS two_factor_enabled         BOOLEAN DEFAULT false;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS login_alerts_enabled        BOOLEAN DEFAULT true;

-- Valeurs par défaut pour les utilisateurs existants
UPDATE public.users SET email_notifications_enabled = true  WHERE email_notifications_enabled IS NULL;
UPDATE public.users SET login_alerts_enabled        = true  WHERE login_alerts_enabled        IS NULL;
UPDATE public.users SET two_factor_enabled          = false WHERE two_factor_enabled          IS NULL;
```

---

## 7. Pages Frontend (résumé)

| Page | Actions backend utilisées |
|---|---|
| `app/auth/update-password/page.tsx` | `updateUserPassword()` |
| `app/profile/user/page.tsx` | `getUserProfileData()`, `sendPasswordResetEmail()`, `deleteAccount()` |
| `app/profile/businessOwner/page.tsx` | `getOwnerProfileData()`, `sendPasswordResetEmail()`, `updateProfile()` (toggles sécurité) |
| `app/merchants/business/[id]/page.tsx` | `StoreAnalyticsTracker` intégré (déclenche `logStoreAnalyticsEvent`) |

---

## 8. `lib/actions/recommendations.ts`

Algorithme de recommandation personnalisée pour le feed de Reels.

---

### `getPersonalizedReels(): Promise<DiscoverFeedItem[]>`

Algorithme multi-signaux qui trie et personnalise les Reels affichés dans le feed Discover.

#### Signaux collectés (si utilisateur authentifié)

Récupérés en **parallèle** via `Promise.all` :

| Signal | Table | Usage |
|---|---|---|
| Ville de l'utilisateur | `users.city` | Boost si boutique dans la même ville |
| Catégories préférées | `user_preferences` | Score pondéré par catégorie |
| Interactions récentes | `user_interactions` | Boost si boutique déjà visitée |
| Historique de recherche | `user_search_history` | Boost si contenu correspond aux mots-clés |

#### Requête Reels principale

```sql
SELECT reels.*, stores(id, name, city, category), reel_stats(views_count, likes_count, saves_count, completions_count)
FROM reels
WHERE status = 'active'
```

#### Système de scoring (par Reel)

| Signal | Points max | Condition |
|---|---|---|
| **A. Préférence catégorie** | 50 pts | `pref.score * 50` (normalisé) |
| **B. Correspondance ville** | 40 pts | `userCity === store.city` (insensible à la casse) |
| **C. Historique boutique** | 30 pts | Utilisateur a déjà interagi avec ce marchand |
| **D. Mots-clés recherche** | 20 pts | `title+subtitle+category` contient un terme cherché |
| **E. Popularité globale** | ~100 pts | `log10(likes + saves + completions + 1) * 20` |

> **Score total = engagementScore** (personnalisation) + **popularityScore** (popularité globale)  
> Retourné trié par `engagementScore DESC`.

#### Helper interne : `parseFirstMediaUrl(url: string): string`

Gère deux formats de `media_url` :
- Chaîne simple → retournée telle quelle
- JSON array `["url1","url2"]` → retourne `arr[0]`

---

## 9. `lib/actions/reels.ts`

Gestion complète du cycle de vie des Reels (CRUD + interactions).

---

### `getBusinessReels(storeId: number)`

Récupère tous les Reels d'une boutique avec leurs statistiques détaillées.

**Flux :**
1. Fetch `reels` + `reel_stats` pour le store (tri par `created_at DESC`)
2. Fetch parallèle des `user_interactions` et `reel_comments` via `IN (reelIds)`
3. Auto-initialise les stats manquantes (`INSERT INTO reel_stats` pour les Reels sans entrée)
4. Fusionne et retourne avec `media_urls` (tableau parsé) et `is_gallery` (> 1 média)

**Stats retournées par Reel :**
```ts
{
  views_count,
  likes_count,     // depuis user_interactions (type='like')
  saves_count,     // depuis user_interactions (type='save')
  completions_count, // depuis user_interactions (type='completion')
  comments_count   // depuis reel_comments
}
```

---

### `trackReelInteraction(reelId, type: 'like' | 'save' | 'completion')`

Enregistre ou supprime une interaction utilisateur (toggle).

- **Table** : `public.user_interactions`
- **Authentification requise** : Retourne `{ success: false }` si non connecté
- **Logique toggle** : Pour `like` et `save` — vérifie si une interaction existe déjà :
  - Si oui → **supprime** (unlike/unsave) → `{ action: 'removed' }`
  - Si non → **insère** → `{ action: 'added' }`
- **Completion** : Toujours insérée (pas de toggle, mesure la progression vidéo)

---

### `recordStoreView(storeId: number)`

Enregistre une visite de page boutique pour les recommandations.

- **Table** : `public.user_interactions` (type `'store_visit'`)
- **Debounce intégré** : Vérifie si une visite a déjà été enregistrée dans la **dernière heure** (`created_at > now - 3600s`) → ignore si oui
- **Anonyme** : Silencieux si l'utilisateur n'est pas connecté

---

### `publishReel(input: ReelInput)`

Publie un nouveau Reel et initialise ses statistiques.

```ts
interface ReelInput {
  storeId, mediaUrl, mediaType, title,
  subtitle?, price?, currency?, ctaType?, ctaValue?, category?
}
```

**Flux :**
1. Convertit `mediaUrl[]` en JSON string si tableau
2. `INSERT INTO reels` avec statut `'active'`
3. `INSERT INTO reel_stats { reel_id }` (stats initialisées à 0)
4. Retourne `{ success: true, reelId }`

---

### `uploadReelMedia(formData: FormData): Promise<string | null>`

Upload d'un fichier média vers Supabase Storage.

- **Bucket principal** : `reels`
- **Fallback** : Si `reels` n'existe pas → tente `stories`
- **Nommage** : `{timestamp}-{random36}.{ext}` (unicité garantie)
- **Retourne** : URL publique ou `null` si échec total

---

### `deleteReel(reelId: number)`

- **Table** : `public.reels` (DELETE)
- **Cascade** : `reel_stats` supprimé automatiquement via FK
- **Retourne** : `{ success: true }` ou `{ success: false }`

#### Helper interne : `parseMediaUrls(url: string): string[]`

Inverse de `parseFirstMediaUrl` — retourne **tous** les URLs sous forme de tableau.

---

## 10. `lib/actions/overviews.ts`

Agrégation de données pour le tableau de bord business (`/dashboard`).

---

### `getDashboardOverview(storeId: number)`

Vue d'ensemble complète pour un propriétaire de boutique.

**Données récupérées :**

| Donnée | Source | Détail |
|---|---|---|
| Vues profil | `stores.view_count` | Compteur brut |
| Réservations | `bookings` COUNT | Toutes |
| Commandes | `orders` COUNT | Toutes |
| Revenus réels | `orders` + `bookings` | Filtrés sur `status = 'COMPLETED'` uniquement |
| Distribution des notes | `reviews.rating` | Répartition 1→5 étoiles |
| Activité récente | `reviews` + `orders` + `bookings` | 5 derniers de chaque, fusionnés et triés |
| Tendance 7 jours | `orders`, `bookings`, `reviews` | Comptés par jour sur 7 jours glissants |

**Retourne :**
```ts
{
  profileViews, reservations, purchases, totalRevenue,
  ratingData: [{ rating: '5 stars', count }, ...],
  recentActions: [{ id, type, details, timestamp }, ...],
  weeklyStats: [{ day, fullDate, views, clicks, actions }, ...],
  status
}
```

---

### `getStoreReviews(storeId: number)`

- **Table** : `public.reviews` ⋈ `users!author_id(full_name, avatar_url)`
- **Filtres** : `is_approved = true`, triés par `created_at DESC`
- **Retourne** : Liste avec `vendor_response` et `responded_at`

---

### `saveVendorResponse(reviewId: number, response: string)`

- **Table** : `public.reviews` (UPDATE)
- **Champs mis à jour** : `vendor_response`, `responded_at = NOW()`
- **Retourne** : `{ success: true }` ou `{ success: false }`

---

### `getAccountDetails(storeId: number)`

- **Tables** : `public.stores`, `public.subscriptions`
- **Retourne** : `{ store, user, subscription }` — utilisé pour la page de paramètres du compte

---

### `getLeadActions(storeId: number)`

- **Délègue** à `getLeadActionsFromLeads` importé depuis `./leads`
- **Usage** : Re-export pratique depuis `overviews`

---

### `getSidebarStats(storeId: number)`

Statistiques légères pour la sidebar du dashboard, chargées en **parallèle** :

```ts
Promise.all([
  items COUNT,
  reviews COUNT,
  orders COUNT,
  bookings COUNT
])
```

**Retourne :**
```ts
{
  products: number,
  reviews: number,
  leads: ordersCount + bookingsCount
}
```
