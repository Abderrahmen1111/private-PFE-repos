# 🗄️ Schéma Complet de la Base de Données - Ro2ya

**Plateforme:** Ro2ya  
**Type:** PostgreSQL (hébergé sur Supabase)  
**Date:** Avril 2026

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Tables Core](#tables-core)
3. [Tables Transactionnelles](#tables-transactionnelles)
4. [Tables de Contenu](#tables-de-contenu)
5. [Tables Sociales](#tables-sociales)
6. [Tables Admin/Système](#tables-adminsystème)
7. [Relations & Contraintes](#relations--contraintes)

---

## 🏗️ Vue d'ensemble

### Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Authentication                         │
│ (Supabase Auth - handles JWT, sessions, password reset)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
          ┌─────▼────┐         ┌──────▼──────┐
          │   Users  │         │  Profiles   │
          └─────┬────┘         └──────┬──────┘
                │ (1:N)              │ (1:1)
                │ user_id            │
                │                    │
    ┌───────────┼────────────────────┼─────────────┐
    │           │                    │             │
┌───▼──┐  ┌────▼────┐  ┌───────┐ ┌──▼────┐  ┌────▼──┐
│Store │  │ Orders  │  │ Items │ │Booking│  │Message│
│      │  │         │  │       │ │       │  │       │
└──┬───┘  └────┬────┘  └───┬───┘ └──┬────┘  └───────┘
   │           │           │        │
   │      ┌────▼────┐      │    Transaction
   │      │Transaction  │      │
   │      └───────────┘      │
   │                          │
   ├──────────────┬───────────┤
   │              │           │
┌──▼───┐  ┌───────▼──┐  ┌────▼────┐
│Review│  │Favorite  │  │Comment  │
└──────┘  └──────────┘  └─────────┘
```

---

## 💾 Tables Core

### 1. **users** (de Supabase Auth)

**Table:** `users` (gérée par Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID utilisateur unique |
| `email` | TEXT | Email unique |
| `encrypted_password` | TEXT | Mot de passe hashé |
| `email_confirmed_at` | TIMESTAMP | Confirmation email |
| `last_sign_in_at` | TIMESTAMP | Dernier login |
| `created_at` | TIMESTAMP | Date création |

**Note:** Gérée entièrement par Supabase Auth.

---

### 2. **profiles**

**Table:** `profiles`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | UUID (PK) | Foreign Key → users(id) | ID utilisateur |
| `role` | TEXT | Enum: 'client', 'pro', 'admin', 'business_owner' | Rôle utilisateur |
| `first_name` | TEXT | - | Prénom |
| `last_name` | TEXT | - | Nom |
| `avatar_url` | TEXT | - | URL avatar/profil pic |
| `bio` | TEXT | - | Biographie/description |
| `phone_number` | TEXT | - | Numéro téléphone |
| `country` | TEXT | Défault: 'Tunisia' | Pays |
| `city` | TEXT | - | Ville |
| `address` | TEXT | - | Adresse |
| `date_of_birth` | DATE | - | Date naissance |
| `gender` | TEXT | Enum: 'M', 'F', 'Other' | Genre |
| `preferred_language` | TEXT | Enum: 'fr', 'ar', 'en' | Langue préférée |
| `is_verified` | BOOLEAN | Default: false | Email vérifié |
| `is_active` | BOOLEAN | Default: true | Compte actif |
| `two_factor_enabled` | BOOLEAN | Default: false | 2FA activé |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |

**RLS Policies:**
```sql
-- Users voient leur propre profil
SELECT: auth.uid() = id
UPDATE: auth.uid() = id

-- Admins voient tous les profils
SELECT: role = 'admin'
```

---

### 3. **stores**

**Table:** `stores`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID store unique |
| `id_business` | BIGINT | FK → business_directory | ID business (si import Google) |
| `owner_id` | UUID | FK → users(id) | Propriétaire du magasin |
| `name` | TEXT | NOT NULL | Nom du magasin |
| `slug` | TEXT | UNIQUE | URL-friendly slug |
| `description` | TEXT | - | Description complète |
| `category` | TEXT | NOT NULL | Catégorie principe |
| `subcategory` | TEXT | - | Sous-catégorie |
| `logo_url` | TEXT | - | Logo du magasin |
| `banner_url` | TEXT | - | Image de bannière |
| `phone` | TEXT | - | Numéro téléphone |
| `email` | TEXT | - | Email contact |
| `website` | TEXT | - | Site web |
| `address` | TEXT | - | Adresse physique |
| `city` | TEXT | NOT NULL | Ville |
| `postal_code` | TEXT | - | Code postal |
| `latitude` | NUMERIC(10,8) | - | Latitude (géolocalisation) |
| `longitude` | NUMERIC(11,8) | - | Longitude |
| `status` | TEXT | Enum: 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED', 'PAUSED' | Statut approbation |
| `rating_average` | NUMERIC(3,2) | Default: 0 | Note moyenne |
| `total_reviews` | INTEGER | Default: 0 | Nombre avis |
| `view_count` | INTEGER | Default: 0 | Nombre vues |
| `follower_count` | INTEGER | Default: 0 | Nombre followers |
| `service_id` | INTEGER | FK → services(id) | Si service (booking) |
| `opens_at` | TIME | - | Heure ouverture |
| `closes_at` | TIME | - | Heure fermeture |
| `is_24_hours` | BOOLEAN | Default: false | Ouvert 24/24 |
| `days_open` | TEXT[] | Array | Jours ouverture (JSON) |
| `social_links` | JSONB | - | Liens sociaux (Facebook, Instagram) |
| `metadata` | JSONB | - | Données additionnelles |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |

**Indexes:**
```sql
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_category ON stores(category);
```

---

### 4. **items** (Produits & Services)

**Table:** `items`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID item unique |
| `store_id` | BIGINT | FK → stores(id) | Magasin propriétaire |
| `name` | TEXT | NOT NULL | Nom du produit/service |
| `slug` | TEXT | - | URL slug |
| `description` | TEXT | - | Description complète |
| `item_type` | TEXT | Enum: 'PRODUCT', 'SERVICE', 'BOOKING' | Type item |
| `category` | TEXT | - | Catégorie |
| `subcategory` | TEXT | - | Sous-catégorie |
| `price` | NUMERIC(10,2) | NOT NULL | Prix |
| `price_unit` | TEXT | Enum: 'TND', 'unit', 'hour', 'piece' | Unité prix |
| `original_price` | NUMERIC(10,2) | - | Prix avant réduction |
| `discount_percent` | INTEGER | Default: 0 | % réduction |
| `image_url` | TEXT | - | Image principale |
| `images` | TEXT[] | - | Images additionnelles (Array) |
| `stock_quantity` | INTEGER | - | Quantité en stock (PRODUCT) |
| `status` | TEXT | Enum: 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED' | Statut |
| `rating_average` | NUMERIC(3,2) | Default: 0 | Note moyenne |
| `rating_count` | INTEGER | Default: 0 | Nombre évaluations |
| `view_count` | INTEGER | Default: 0 | Nombre vues |
| `order_count` | INTEGER | Default: 0 | Nombre commandes |
| `booking_count` | INTEGER | Default: 0 | Nombre bookings |
| `duration_minutes` | INTEGER | - | Durée service (mins) |
| `capacity` | INTEGER | - | Capacité (personnes) |
| `sku` | TEXT | - | Stock Keeping Unit |
| `barcode` | TEXT | - | Code-barres |
| `weight_kg` | NUMERIC(8,2) | - | Poids (kg) |
| `dimensions` | TEXT | - | Dimensions (LxHxP) |
| `color` | TEXT | - | Couleur |
| `size` | TEXT | - | Taille |
| `material` | TEXT | - | Matériau |
| `brand` | TEXT | - | Marque |
| `tags` | TEXT[] | - | Tags/labels |
| `attributes` | JSONB | - | Attributs dynamiques (JSON) |
| `metadata` | JSONB | - | Métadonnées |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |

**Indexes:**
```sql
CREATE INDEX idx_items_store_id ON items(store_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
```

---

## 💳 Tables Transactionnelles

### 5. **orders**

**Table:** `orders`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID commande unique |
| `order_number` | TEXT | UNIQUE | Numéro commande (ORD-XXXXXX-XXXX) |
| `store_id` | BIGINT | FK → stores(id) | Magasin vendeur |
| `customer_id` | UUID | FK → users(id) | Client acheteur |
| `customer_name` | TEXT | - | Nom client (snapshot) |
| `customer_email` | TEXT | - | Email client (snapshot) |
| `customer_phone` | TEXT | - | Téléphone client |
| `status` | TEXT | Enum: 'PENDING', 'VALIDATED', 'SHIPPED', 'COMPLETED', 'CANCELLED' | Statut |
| `items` | JSONB | - | Panier (snapshot) |
| `cart` | JSONB | - | Détails articles (Array of items) |
| `total_price` | NUMERIC(10,2) | - | Montant total TND |
| `tax_amount` | NUMERIC(10,2) | Default: 0 | Montant TVA |
| `shipping_cost` | NUMERIC(10,2) | Default: 0 | Frais livraison |
| `discount_amount` | NUMERIC(10,2) | Default: 0 | Montant remise |
| `discount_code` | TEXT | - | Code promo utilisé |
| `payment_method` | TEXT | Enum: 'CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY' | Méthode paiement |
| `payment_status` | TEXT | Enum: 'PENDING', 'PAID', 'FAILED', 'REFUNDED' | Statut paiement |
| `payment_reference` | TEXT | - | Reference paiement (Stripe, etc.) |
| `shipping_address` | JSONB | - | Adresse livraison (JSON) |
| `shipping_method` | TEXT | Enum: 'PICKUP', 'DELIVERY', 'COLISSIMO' | Méthode livraison |
| `tracking_code` | TEXT | - | Code suivi (QR-XXXXX-XXXXX) |
| `notes` | TEXT | - | Notes client |
| `vendor_notes` | TEXT | - | Notes vendeur |
| `validated_at` | TIMESTAMP | - | Date validation |
| `shipped_at` | TIMESTAMP | - | Date expédition |
| `completed_at` | TIMESTAMP | - | Date livraison |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |

**RLS Policies:**
```sql
-- Clients voient leurs commandes
SELECT: customer_id = auth.uid()

-- Vendeurs voient commandes de leur magasin
SELECT: store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())

-- Admins voient tout
SELECT: (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
```

---

### 6. **bookings** (Réservations Services)

**Table:** `bookings`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID réservation |
| `booking_number` | TEXT | UNIQUE | Numéro booking (BK-XXXXXX) |
| `store_id` | BIGINT | FK → stores(id) | Magasin service |
| `item_id` | BIGINT | FK → items(id) | Item/service réservé |
| `customer_id` | UUID | FK → users(id) | Client |
| `customer_name` | TEXT | - | Nom client (snapshot) |
| `customer_email` | TEXT | - | Email client |
| `customer_phone` | TEXT | - | Téléphone |
| `status` | TEXT | Enum: 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED' | Statut |
| `booking_date` | DATE | NOT NULL | Date réservation |
| `booking_time` | TIME | NOT NULL | Heure réservation |
| `duration_minutes` | INTEGER | - | Durée service (mins) |
| `number_of_guests` | INTEGER | - | Nombre personnes |
| `price` | NUMERIC(10,2) | - | Montant total TND |
| `notes` | TEXT | - | Notes réservation |
| `vendor_notes` | TEXT | - | Notes vendeur |
| `payment_method` | TEXT | Enum: 'CARD', 'CASH' | Méthode paiement |
| `payment_status` | TEXT | Enum: 'PENDING', 'PAID', 'REFUNDED' | Statut paiement |
| `confirmation_code` | TEXT | - | Code confirmation |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |
| `confirmed_at` | TIMESTAMP | - | Date confirmation |
| `cancelled_at` | TIMESTAMP | - | Date annulation |

---

### 7. **transactions**

**Table:** `transactions`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | UUID (PK) | - | ID transaction |
| `transaction_code` | TEXT | UNIQUE | Code unique (order_number ou booking_number) |
| `order_number` | TEXT | FK → orders(order_number) | Numéro commande |
| `order_id` | BIGINT | FK → orders(id) | ID commande (optionnel) |
| `booking_id` | BIGINT | FK → bookings(id) | ID booking (optionnel) |
| `customer_id` | UUID | FK → users(id) | Client |
| `customer_name` | TEXT | - | Nom client |
| `merchant_id` | BIGINT | FK → stores(id) | Vendeur/magasin |
| `merchant_name` | TEXT | - | Nom magasin |
| `merchant_number` | TEXT | - | Tél magasin |
| `amount` | NUMERIC(10,2) | - | Montant TND |
| `currency` | TEXT | Default: 'TND' | Devise |
| `status` | TEXT | Enum: 'pending', 'completed', 'failed', 'refunded' | Statut |
| `type` | TEXT | Enum: 'payment', 'refund' | Type transaction |
| `date` | TIMESTAMP | - | Date transaction |
| `time_created` | TIMESTAMP | - | Heure création |
| `qr_code_token` | TEXT | - | Token QR code |
| `metadata` | JSONB | - | Métadonnées additionnelles |

**Indexes:**
```sql
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

---

## 📝 Tables de Contenu

### 8. **reviews**

**Table:** `reviews`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID avis |
| `store_id` | BIGINT | FK → stores(id) | Magasin évalué |
| `item_id` | BIGINT | FK → items(id) | Item évalué (optionnel) |
| `customer_id` | UUID | FK → users(id) | Client avis |
| `order_id` | BIGINT | FK → orders(id) | Commande liée (optionnel) |
| `rating` | INTEGER | 1-5 | Note (1-5 étoiles) |
| `title` | TEXT | - | Titre avis |
| `comment` | TEXT | - | Contenu avis |
| `comment_length` | INTEGER | - | Longueur texte |
| `sentiment_label` | TEXT | Enum: 'POSITIVE', 'NEUTRAL', 'NEGATIVE' | Sentiment IA |
| `is_verified_purchase` | BOOLEAN | Default: false | Achat vérifié |
| `helpful_count` | INTEGER | Default: 0 | Votes "utile" |
| `unhelpful_count` | INTEGER | Default: 0 | Votes "pas utile" |
| `vendor_response` | TEXT | - | Réponse vendeur |
| `vendor_response_at` | TIMESTAMP | - | Date réponse |
| `is_flagged` | BOOLEAN | Default: false | Marqué abusif |
| `flag_reason` | TEXT | - | Raison flag |
| `status` | TEXT | Enum: 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN' | Statut modération |
| `images` | TEXT[] | - | Photos avis |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |

**Indexes:**
```sql
CREATE INDEX idx_reviews_store_id ON reviews(store_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment_label);
```

---

### 9. **comments**

**Table:** `comments`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID commentaire |
| `store_id` | BIGINT | FK → stores(id) | Magasin commenté |
| `item_id` | BIGINT | FK → items(id) | Item commenté |
| `user_id` | UUID | FK → users(id) | Auteur |
| `parent_comment_id` | BIGINT | FK → comments(id) | Commentaire parent (si réponse) |
| `content` | TEXT | NOT NULL | Contenu |
| `image_url` | TEXT | - | Image jointe |
| `likes_count` | INTEGER | Default: 0 | Nombre likes |
| `is_flagged` | BOOLEAN | Default: false | Marqué abusif |
| `status` | TEXT | Enum: 'PENDING', 'APPROVED', 'REJECTED' | Statut modération |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |

---

### 10. **reels** (Contenu Vidéo)

**Table:** `reels`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID reel |
| `store_id` | BIGINT | FK → stores(id) | Magasin |
| `title` | TEXT | - | Titre reel |
| `description` | TEXT | - | Description |
| `video_url` | TEXT | NOT NULL | URL vidéo |
| `thumbnail_url` | TEXT | - | Image preview |
| `duration_seconds` | INTEGER | - | Durée (secs) |
| `category` | TEXT | - | Catégorie |
| `tags` | TEXT[] | - | Tags |
| `view_count` | INTEGER | Default: 0 | Nombre vues |
| `like_count` | INTEGER | Default: 0 | Nombre likes |
| `share_count` | INTEGER | Default: 0 | Nombre partages |
| `status` | TEXT | Enum: 'DRAFT', 'PUBLISHED', 'ARCHIVED' | Statut |
| `published_at` | TIMESTAMP | - | Date publication |
| `created_at` | TIMESTAMP | - | Date création |

---

### 11. **stories** (Stories Éphémères)

**Table:** `stories`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID story |
| `store_id` | BIGINT | FK → stores(id) | Magasin |
| `content_type` | TEXT | Enum: 'IMAGE', 'VIDEO' | Type contenu |
| `content_url` | TEXT | NOT NULL | URL contenu |
| `text_overlay` | TEXT | - | Texte superposé |
| `link_url` | TEXT | - | Lien CTA |
| `view_count` | INTEGER | Default: 0 | Vues |
| `expires_at` | TIMESTAMP | - | Expiration (24h) |
| `created_at` | TIMESTAMP | - | Date création |

---

## 👥 Tables Sociales

### 12. **favorites**

**Table:** `favorites`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID |
| `user_id` | UUID | FK → users(id) | Utilisateur |
| `store_id` | BIGINT | FK → stores(id) | Magasin favorisé |
| `item_id` | BIGINT | FK → items(id) | Item favori (optionnel) |
| `created_at` | TIMESTAMP | - | Date création |

**Unique Constraint:** `(user_id, store_id)` ou `(user_id, item_id)`

---

### 13. **friendships**

**Table:** `friendships`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID |
| `user_a_id` | UUID | FK → users(id) | Utilisateur A |
| `user_b_id` | UUID | FK → users(id) | Utilisateur B |
| `status` | TEXT | Enum: 'requested', 'accepted', 'blocked' | Statut |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |

---

### 14. **messages**

**Table:** `messages`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID message |
| `sender_id` | UUID | FK → users(id) | Expéditeur |
| `receiver_id` | UUID | FK → users(id) | Destinataire |
| `store_id` | BIGINT | FK → stores(id) | Magasin concerné |
| `order_id` | BIGINT | FK → orders(id) | Commande liée |
| `content` | TEXT | NOT NULL | Contenu |
| `message_type` | TEXT | Enum: 'TEXT', 'IMAGE', 'FILE' | Type message |
| `file_url` | TEXT | - | URL fichier joint |
| `is_read` | BOOLEAN | Default: false | Lu |
| `read_at` | TIMESTAMP | - | Date lecture |
| `created_at` | TIMESTAMP | - | Date création |
| `updated_at` | TIMESTAMP | - | Dernière mise à jour |

---

### 15. **notifications**

**Table:** `notifications`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID notif |
| `user_id` | UUID | FK → users(id) | Destinataire |
| `type` | TEXT | Enum: 'ORDER', 'BOOKING', 'REVIEW', 'MESSAGE', 'PROMOTION' | Type |
| `title` | TEXT | NOT NULL | Titre |
| `body` | TEXT | - | Corps message |
| `action_url` | TEXT | - | Lien action |
| `related_entity_id` | TEXT | - | ID entité liée |
| `is_read` | BOOLEAN | Default: false | Lu |
| `read_at` | TIMESTAMP | - | Date lecture |
| `created_at` | TIMESTAMP | - | Date création |

---

## 🛡️ Tables Admin/Système

### 16. **leads**

**Table:** `leads`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID lead |
| `store_id` | BIGINT | FK → stores(id) | Magasin intéressé |
| `name` | TEXT | - | Nom contact |
| `email` | TEXT | - | Email |
| `phone` | TEXT | - | Téléphone |
| `message` | TEXT | - | Message |
| `status` | TEXT | Enum: 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED' | Statut |
| `source` | TEXT | Enum: 'FORM', 'CHAT', 'CALL' | Source |
| `created_at` | TIMESTAMP | - | Date création |

---

### 17. **business_directory_tunisia** (Externe)

**Table:** `business_directory_tunisia`

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| `id` | BIGINT (PK) | - | ID |
| `place_id` | TEXT | FK Google Places | Place ID Google |
| `title` | TEXT | - | Nom business |
| `city` | TEXT | - | Ville |
| `full_address` | TEXT | - | Adresse complète |
| `vitrine_category` | TEXT | - | Catégorie vitrine |
| `categoryName` | TEXT | - | Nom catégorie |
| `latitude` | NUMERIC(10,8) | - | Latitude |
| `longitude` | NUMERIC(11,8) | - | Longitude |
| `phone` | TEXT | - | Téléphone |
| `totalScore` | NUMERIC(3,2) | - | Score Google |
| `reviewsCount` | INTEGER | - | Nombre avis Google |
| `photos` | TEXT[] | - | Photos (URLs) |
| `is_synced_to_stores` | BOOLEAN | Default: false | Synced à Stores |
| `created_at` | TIMESTAMP | - | Date création |

---

## 🔗 Relations & Contraintes

### Relations Core

```
users (1) ──────→ (N) profiles          [1:1 logiquement]
       ├──────→ (N) stores              [1:N propriétaire]
       ├──────→ (N) orders              [1:N client]
       ├──────→ (N) bookings            [1:N client]
       ├──────→ (N) reviews             [1:N auteur]
       ├──────→ (N) messages            [1:N expéditeur/destinataire]
       ├──────→ (N) favorites           [1:N]
       └──────→ (N) notifications       [1:N]

stores (1) ──────→ (N) items            [1:N]
       ├──────→ (N) orders              [1:N]
       ├──────→ (N) bookings            [1:N]
       ├──────→ (N) reviews             [1:N]
       ├──────→ (N) reels               [1:N]
       ├──────→ (N) stories             [1:N]
       ├──────→ (N) comments            [1:N]
       └──────→ (1) business_directory  [0:1 import Google]

items (1) ──────→ (N) orders            [1:N]
      ├──────→ (N) bookings             [1:N]
      ├──────→ (N) reviews              [1:N]
      └──────→ (N) favorites            [1:N]

orders (1) ──────→ (N) transactions     [1:1 typically]
       └──────→ (N) messages            [1:N]

bookings (1) ───→ (N) transactions      [1:1 typically]
        └──────→ (N) messages           [1:N]
```

### Contraintes d'Intégrité

```sql
-- Foreign Keys
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_users
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stores ADD CONSTRAINT fk_stores_owner
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE orders ADD CONSTRAINT fk_orders_store
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT;

ALTER TABLE orders ADD CONSTRAINT fk_orders_customer
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE orders ADD CONSTRAINT fk_orders_items
  FOREIGN KEY (items->'[0]'->>'id') REFERENCES items(id);

ALTER TABLE items ADD CONSTRAINT fk_items_store
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

-- Unique Constraints
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE stores ADD CONSTRAINT unique_slug UNIQUE (slug);
ALTER TABLE orders ADD CONSTRAINT unique_order_number UNIQUE (order_number);

-- Check Constraints
ALTER TABLE reviews ADD CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE items ADD CONSTRAINT check_price CHECK (price > 0);
```

---

## 📊 Indexing Strategy

### Indexes Critiques

```sql
-- Authentication & Lookup
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Store Navigation
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_category ON stores(category);

-- Item Search
CREATE INDEX idx_items_store_id ON items(store_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);

-- Orders & Transactions
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Reviews & Sentiment
CREATE INDEX idx_reviews_store_id ON reviews(store_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment_label);
```

### Full-Text Search Indexes

```sql
-- Pour recherche produits/magasins
CREATE INDEX idx_items_fts ON items USING gin(
  to_tsvector('simple', name || ' ' || description)
);

CREATE INDEX idx_stores_fts ON stores USING gin(
  to_tsvector('simple', name || ' ' || description || ' ' || city)
);
```

### Vector Indexes (pour semantic search)

```sql
-- Pour embeddings GEMINI/Groq
CREATE TABLE item_embeddings (
  item_id BIGINT FK,
  embedding vector(768),
  created_at TIMESTAMP
);

CREATE INDEX ON item_embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

## 🔐 Row-Level Security (RLS) Summary

| Table | Policy | Condition |
|-------|--------|-----------|
| profiles | SELECT | `auth.uid() = id` (self + public) |
| profiles | UPDATE | `auth.uid() = id` |
| stores | SELECT | `status = 'APPROVED'` (public) |
| stores | INSERT | `auth.role() = 'pro'` |
| stores | UPDATE | `owner_id = auth.uid()` |
| items | SELECT | `store_id.status = 'APPROVED'` |
| items | INSERT | `store_id.owner_id = auth.uid()` |
| orders | SELECT | `customer_id = auth.uid() OR store_id.owner_id = auth.uid()` |
| reviews | SELECT | Always visible (public) |
| reviews | INSERT | `is_verified_purchase OR store_id.owner_id = auth.uid()` |

---

## 📈 Data Volume Estimates

| Table | Est. Rows | Notes |
|-------|-----------|-------|
| users | 50,000 | Croissance: +1000/mois |
| profiles | 50,000 | 1:1 avec users |
| stores | 2,000 | Boutiques actives |
| items | 100,000 | Produits/services |
| orders | 200,000 | Cumul historique |
| bookings | 50,000 | Services réservés |
| transactions | 250,000 | Mouvements financiers |
| reviews | 150,000 | Avis clients |
| messages | 500,000 | Historique chat |

---

**Schéma Complet Ro2ya**  
**Dernière mise à jour:** Avril 2026  
**Version:** 1.0
