# Diagramme de Classe - Architecture Phantom Marketplace

## Vue d'ensemble de la structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     PHANTOM MARKETPLACE                          │
│              Système de Commerce Électronique                    │
└─────────────────────────────────────────────────────────────────┘

COUCHES PRINCIPALES:
├─ Gestion des Utilisateurs (users, profiles)
├─ Gestion des Commerces (stores)
├─ Gestion des Produits/Services (items, reels, stories)
├─ Gestion des Transactions (orders, bookings, transactions)
├─ Système d'Avis (reviews)
├─ Messagerie (messages, support_tickets)
└─ Notifications (notifications)
```

---

## Diagramme de Classe UML (Simplifié)

```
╔════════════════════════════════════════════════════════════════════════════════════════════╗
║                               SYSTÈME D'AUTHENTIFICATION                                   ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────┐
│      AUTH USERS      │
│   (Supabase Auth)    │
└──────────┬───────────┘
           │ 1..1
           │
           │ owns
           │
    ┌──────▼─────────────────────────────────────────┐
    │            USERS                               │
    ├─────────────────────────────────────────────────┤
    │ - id: UUID (PK)                                 │
    │ - full_name: String                             │
    │ - email: String                                 │
    │ - phone: String                                 │
    │ - role: ENUM [CLIENT, BUSINESS_OWNER, PRO]    │
    │ - latitude: Numeric                             │
    │ - longitude: Numeric                            │
    │ - city: String                                  │
    │ - address: String                               │
    │ - avatar_url: String                            │
    │ - created_at: Timestamp                         │
    │ - updated_at: Timestamp                         │
    └──────┬───────────────────────────────┬─────────┘
           │                               │
           │ 1..* (owns)                   │ 1..1 (has)
           │                               │
    ┌──────▼──────────────────┐   ┌───────▼────────────────────────┐
    │   STORES                │   │    USER_PROFILES               │
    ├─────────────────────────┤   ├────────────────────────────────┤
    │ - id: BigInt (PK)       │   │ - user_id: UUID (FK)           │
    │ - owner_id: UUID (FK)   │   │ - avatar_url: String           │
    │ - name: String          │   │ - bio: String                  │
    │ - slug: String          │   │ - preferred_categories: Array  │
    │ - description: String   │   │ - created_at: Timestamp       │
    │ - category: String      │   │ - updated_at: Timestamp       │
    │ - phone: String         │   └────────────────────────────────┘
    │ - address: String       │
    │ - latitude: Numeric     │
    │ - longitude: Numeric    │
    │ - rating_average: Dec   │
    │ - total_reviews: Int    │
    │ - status: ENUM          │
    │ - created_at: Timestamp │
    └─────┬──────────────────┘
          │
          │ 1..* (has/manage)
          │
    ┌─────▼────────────────────────────────────────┐
    │   ITEMS                                       │
    ├──────────────────────────────────────────────┤
    │ - id: BigInt (PK)                            │
    │ - store_id: BigInt (FK)                      │
    │ - name: String                               │
    │ - slug: String                               │
    │ - description: Text                          │
    │ - price: Numeric                             │
    │ - price_unit: ENUM [unit, hour, day]        │
    │ - item_type: ENUM [PRODUCT, SERVICE]        │
    │ - stock_quantity: Int                        │
    │ - is_bookable: Boolean                       │
    │ - main_image: String                         │
    │ - status: ENUM [AVAILABLE, UNAVAILABLE]     │
    │ - rating_average: Numeric                    │
    │ - total_reviews: Int                         │
    │ - created_at: Timestamp                      │
    └─────┬────────────────────────────────────────┘
          │
          │ 1..* (linked to)
          │
    ┌─────▼────────────────────────────────┐
    │   REVIEWS                             │
    ├───────────────────────────────────────┤
    │ - id: BigInt (PK)                     │
    │ - item_id: BigInt (FK)                │
    │ - store_id: BigInt (FK)               │
    │ - author_id: UUID (FK) → USERS        │
    │ - rating: Int [1-5]                   │
    │ - comment: Text                       │
    │ - sentiment_label: String             │
    │ - vendor_response: String             │
    │ - is_verified: Boolean                │
    │ - created_at: Timestamp               │
    └───────────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════════════════════════════╗
║                           SYSTÈME DE TRANSACTIONS                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝

    ┌──────────────────────────┐
    │   ORDERS                 │
    ├──────────────────────────┤
    │ - id: BigInt (PK)        │
    │ - order_number: String   │
    │ - customer_id: UUID (FK) │
    │ - store_id: BigInt (FK)  │
    │ - item_id: BigInt (FK)   │
    │ - quantity: Int          │
    │ - total_price: Numeric   │
    │ - delivery_address: Text │
    │ - status: ENUM           │
    │ - fraud_level: String    │
    │ - created_at: Timestamp  │
    └────────┬─────────────────┘
             │
             │ 1..1 (has)
             │
    ┌────────▼──────────────────────┐
    │   ORDER_FRAUD_CHECKS          │
    ├───────────────────────────────┤
    │ - id: UUID (PK)               │
    │ - order_id: BigInt (FK)       │
    │ - score: Int [0-100]          │
    │ - level: ENUM                 │
    │ - signals: JSONB              │
    │ - recommendation: String      │
    │ - checked_at: Timestamp       │
    └───────────────────────────────┘

    ┌──────────────────────────────┐
    │   BOOKINGS                   │
    ├──────────────────────────────┤
    │ - id: BigInt (PK)            │
    │ - booking_number: String     │
    │ - customer_id: UUID (FK)     │
    │ - item_id: BigInt (FK)       │
    │ - store_id: BigInt (FK)      │
    │ - booking_date: Date         │
    │ - start_time: Time           │
    │ - end_time: Time             │
    │ - price: Numeric             │
    │ - status: ENUM               │
    │ - fraud_level: String        │
    │ - created_at: Timestamp      │
    └────────┬─────────────────────┘
             │
             │ 1..1 (has)
             │
    ┌────────▼──────────────────────┐
    │   BOOKING_FRAUD_CHECKS        │
    ├───────────────────────────────┤
    │ - id: UUID (PK)               │
    │ - booking_id: BigInt (FK)     │
    │ - score: Int [0-100]          │
    │ - level: ENUM                 │
    │ - signals: JSONB              │
    │ - recommendation: String      │
    └───────────────────────────────┘

    ┌────────────────────────────┐
    │   TRANSACTIONS             │
    ├────────────────────────────┤
    │ - id: UUID (PK)            │
    │ - transaction_code: String │
    │ - customer_id: UUID (FK)   │
    │ - merchant_id: BigInt(FK)  │
    │ - booking_id: BigInt (FK)  │
    │ - amount: Numeric          │
    │ - status: ENUM             │
    │ - type: ENUM               │
    │ - qr_code_token: String    │
    │ - created_at: Timestamp    │
    └────────────────────────────┘


╔════════════════════════════════════════════════════════════════════════════════════════════╗
║                        SYSTÈME DE CONTENU (REELS & STORIES)                              ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝

    ┌──────────────────────────┐
    │   REELS                  │
    ├──────────────────────────┤
    │ - id: BigInt (PK)        │
    │ - store_id: BigInt (FK)  │
    │ - media_path: String     │
    │ - media_type: String     │
    │ - title: String          │
    │ - price: Numeric         │
    │ - is_sponsored: Boolean  │
    │ - status: String         │
    │ - created_at: Timestamp  │
    └────────┬─────────────────┘
             │
             │ 1..* (comments on)
             │
    ┌────────▼────────────────────────┐
    │   REEL_COMMENTS                 │
    ├─────────────────────────────────┤
    │ - id: BigInt (PK)               │
    │ - reel_id: BigInt (FK)          │
    │ - user_id: UUID (FK) → USERS    │
    │ - content: Text                 │
    │ - created_at: Timestamp         │
    └─────────────────────────────────┘

    ┌──────────────────────────┐
    │   REEL_STATS             │
    ├──────────────────────────┤
    │ - reel_id: BigInt (PK,FK)│
    │ - views_count: Int       │
    │ - likes_count: Int       │
    │ - clicks_count: Int      │
    │ - saves_count: Int       │
    │ - updated_at: Timestamp  │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │   STORIES                │
    ├──────────────────────────┤
    │ - id: BigInt (PK)        │
    │ - store_id: BigInt (FK)  │
    │ - author_id: UUID (FK)   │
    │ - media_url: String      │
    │ - media_type: String     │
    │ - caption: Text          │
    │ - views_count: Int       │
    │ - expires_at: Timestamp  │
    │ - created_at: Timestamp  │
    └────────┬─────────────────┘
             │
             │ 1..* (views by)
             │
    ┌────────▼──────────────────┐
    │   STORY_VIEWS             │
    ├───────────────────────────┤
    │ - id: BigInt (PK)         │
    │ - story_id: BigInt (FK)   │
    │ - viewer_id: UUID (FK)    │
    │ - viewed_at: Timestamp    │
    └───────────────────────────┘


╔════════════════════════════════════════════════════════════════════════════════════════════╗
║                        SYSTÈME DE COMMUNICATION                                           ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝

    ┌────────────────────────────────┐
    │   MESSAGES                     │
    ├────────────────────────────────┤
    │ - id: UUID (PK)                │
    │ - sender_id: UUID (FK)         │
    │ - receiver_id: UUID (FK)       │
    │ - content: Text                │
    │ - is_read: Boolean             │
    │ - store_id: Int (FK)           │
    │ - type: ENUM [text, image...]  │
    │ - created_at: Timestamp        │
    └────────────────────────────────┘

    ┌────────────────────────────────┐
    │   SUPPORT_TICKETS              │
    ├────────────────────────────────┤
    │ - id: UUID (PK)                │
    │ - ticket_number: Int           │
    │ - store_id: BigInt (FK)        │
    │ - customer_id: UUID (FK)       │
    │ - subject: Text                │
    │ - priority: ENUM               │
    │ - status: ENUM                 │
    │ - assigned_to: UUID (FK)       │
    │ - created_at: Timestamp        │
    └────────┬─────────────────────┘
             │
             │ 1..* (contains)
             │
    ┌────────▼─────────────────────────┐
    │   SUPPORT_MESSAGES               │
    ├──────────────────────────────────┤
    │ - id: UUID (PK)                  │
    │ - ticket_id: UUID (FK)           │
    │ - sender_id: UUID (FK)           │
    │ - sender_type: ENUM [customer...]│
    │ - content: Text                  │
    │ - is_read: Boolean               │
    │ - created_at: Timestamp          │
    └──────────────────────────────────┘

    ┌────────────────────────────────┐
    │   NOTIFICATIONS                │
    ├────────────────────────────────┤
    │ - id: UUID (PK)                │
    │ - user_id: UUID (FK)           │
    │ - title: String                │
    │ - description: Text            │
    │ - type: String                 │
    │ - is_read: Boolean             │
    │ - created_at: Timestamp        │
    └────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════════════════════════════╗
║                        SYSTÈME DE SUIVI & ANALYTICS                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝

    ┌──────────────────────────────┐
    │   SESSIONS                   │
    ├──────────────────────────────┤
    │ - id: UUID (PK)              │
    │ - user_id: UUID (FK)         │
    │ - device: String             │
    │ - platform: String           │
    │ - started_at: Timestamp      │
    │ - ended_at: Timestamp        │
    └──────────────────────────────┘

    ┌──────────────────────────────┐
    │   EVENTS                     │
    ├──────────────────────────────┤
    │ - id: UUID (PK)              │
    │ - user_id: UUID (FK)         │
    │ - session_id: UUID (FK)      │
    │ - event_type: ENUM           │
    │ - item_id: UUID              │
    │ - created_at: Timestamp      │
    └──────────────────────────────┘

    ┌──────────────────────────────┐
    │   USER_BEHAVIORAL_PROFILE    │
    ├──────────────────────────────┤
    │ - id: UUID (PK)              │
    │ - user_id: UUID (FK)         │
    │ - category_scores: JSONB     │
    │ - total_interactions: Int    │
    │ - preferred_price_range: Range
    │ - created_at: Timestamp      │
    └──────────────────────────────┘

    ┌──────────────────────────────┐
    │   USER_SEARCH_HISTORY        │
    ├──────────────────────────────┤
    │ - id: BigInt (PK)            │
    │ - user_id: UUID (FK)         │
    │ - query: Text                │
    │ - created_at: Timestamp      │
    └──────────────────────────────┘

    ┌──────────────────────────────┐
    │   STORE_ANALYTICS            │
    ├──────────────────────────────┤
    │ - id: Int (PK)               │
    │ - store_id: Int (FK)         │
    │ - user_id: UUID (FK)         │
    │ - session_id: UUID (FK)      │
    │ - type: String               │
    │ - created_at: Timestamp      │
    └──────────────────────────────┘
```

---

## Relations Principales (Synthèse)

### Hiérarchie d'héritage

```
USERS (Entité de base)
├─ BUSINESS_OWNER (role)
│  └─ owns STORES
│     └─ manages ITEMS/REELS/STORIES
└─ CLIENT (role)
   ├─ places ORDERS
   ├─ creates BOOKINGS
   ├─ writes REVIEWS
   └─ sends MESSAGES
```

### Flux de Transaction

```
USERS (Customer) ─→ ORDERS ─→ ORDER_FRAUD_CHECKS
                            ↓
                        TRANSACTIONS ← BOOKINGS ─→ BOOKING_FRAUD_CHECKS
                                          ↓
                                    REVIEWS (Rating)
```

### Flux de Communication

```
USERS ─→ MESSAGES ←─ USERS
         SUPPORT_TICKETS ─→ SUPPORT_MESSAGES
```

### Flux de Contenu

```
STORES ─→ REELS ─→ REEL_COMMENTS ← USERS
       ─→ STORIES ─→ STORY_VIEWS ← USERS
       ─→ ITEMS ─→ REVIEWS ← USERS
```

---

## Tableau des Énumérations (ENUMs)

### USER_ROLE
```
- CLIENT
- BUSINESS_OWNER
- PRO
- ADMIN
```

### ITEM_TYPE
```
- PRODUCT
- SERVICE
```

### ITEM_STATUS
```
- AVAILABLE
- UNAVAILABLE
- OUT_OF_STOCK
```

### ORDER_STATUS
```
- PENDING
- CONFIRMED
- SHIPPED
- DELIVERED
- CANCELLED
- REFUNDED
```

### BOOKING_STATUS
```
- PENDING
- CONFIRMED
- COMPLETED
- CANCELLED
```

### TRANSACTION_STATUS
```
- PENDING
- COMPLETED
- FAILED
- CANCELLED
```

### STORE_STATUS
```
- PENDING (En attente de vérification)
- VERIFIED (Approuvé)
- SUSPENDED (Suspendu)
- CLOSED (Fermé)
```

### SUPPORT_TICKET_STATUS
```
- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED
```

### SUPPORT_TICKET_PRIORITY
```
- LOW
- MEDIUM
- HIGH
- URGENT
```

### FRAUD_LEVEL
```
- SAFE
- SUSPICIOUS
- HIGH_RISK
- BLOCKED
```

---

## Indices de Clés Étrangères

| Relation | Table Source | Table Cible | Cardinalité |
|----------|--------------|-------------|------------|
| User owns Store | users.id | stores.owner_id | 1..* |
| Store has Items | stores.id | items.store_id | 1..* |
| User places Order | users.id | orders.customer_id | 1..* |
| User creates Booking | users.id | bookings.customer_id | 1..* |
| User writes Review | users.id | reviews.author_id | 1..* |
| Item has Reviews | items.id | reviews.item_id | 1..* |
| Store has Reviews | stores.id | reviews.store_id | 1..* |
| User sends Message | users.id | messages.sender_id | 1..* |
| Store has Reels | stores.id | reels.store_id | 1..* |
| Reel has Comments | reels.id | reel_comments.reel_id | 1..* |
| Store has Stories | stores.id | stories.store_id | 1..* |
| Story has Views | stories.id | story_views.story_id | 1..* |
| Store has Tickets | stores.id | support_tickets.store_id | 1..* |
| Order has Fraud Check | orders.id | order_fraud_checks.order_id | 1..1 |
| Booking has Fraud Check | bookings.id | booking_fraud_checks.booking_id | 1..1 |

---

## Points Clés de l'Architecture

### Séparation des Responsabilités

1. **Couche Utilisateurs** - Gestion identité et profils
2. **Couche Commerces** - Gestion des boutiques
3. **Couche Produits** - Articles et services
4. **Couche Transactions** - Commandes, réservations, paiements
5. **Couche Contenu** - Reels, Stories, Avis
6. **Couche Communication** - Messages, Support, Notifications
7. **Couche Analytics** - Suivi et comportement utilisateur

### Sécurité Implémentée

- ✅ Fraud detection pour Orders et Bookings
- ✅ User roles et permissions
- ✅ QR code validation pour transactions
- ✅ Verified reviews avec QR tokens

### Scalabilité

- ✅ Analytics pour recommandations personnalisées
- ✅ Behavioral profiles pour ML
- ✅ Event tracking détaillé
- ✅ Search history optimization

---

**Créé:** Mai 2026  
**Version:** 1.0 - Architecture Principale  
**Statut:** Production

