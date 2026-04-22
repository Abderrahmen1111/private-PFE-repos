# 📊 UML DIAGRAMS - RO2YA PLATFORM

**Plateforme:** Ro2ya - Marketplace SaaS Tunisienne  
**Date:** Avril 2026  
**Version:** 1.0  
**Format:** Mermaid Diagrams

---

## 📋 Table des Diagrammes

1. [Diagramme de Classe](#1-diagramme-de-classe)
2. [Diagramme de Séquence](#2-diagramme-de-séquence)
3. [Diagramme de Cas d'Usage](#3-diagramme-de-cas-dusage)
4. [Architecture Composants](#4-architecture-composants)
5. [Diagramme de Déploiement](#5-diagramme-de-déploiement)
6. [Diagramme d'État - Cycle Vie Commande](#6-diagramme-détat---cycle-vie-commande)
7. [Recherche Sémantique Darija](#7-recherche-sémantique-darija)
8. [ER Diagram - Schéma Base de Données](#8-er-diagram---schéma-base-de-données)

---

## 1. Diagramme de Classe

Shows all entities and their relationships in the Ro2ya system.

```mermaid
classDiagram
    class User {
        -id: UUID
        -email: string
        -password_hash: string
        -role: enum[client, pro, admin]
        -status: enum[active, suspended, deleted]
        -created_at: timestamp
        +login()
        +logout()
        +updateProfile()
        +changePassword()
    }

    class Profile {
        -id: UUID
        -user_id: FK
        -avatar_url: string
        -first_name: string
        -last_name: string
        -bio: text
        -phone: string
        -city: string
        +updateAvatar()
        +updateBio()
    }

    class Store {
        -id: BIGINT
        -owner_id: FK
        -name: string
        -slug: string
        -category: string
        -address: string
        -city: string
        -latitude: decimal
        -longitude: decimal
        -logo_url: string
        -banner_url: string
        -description: text
        -phone: string
        -email: string
        -website: string
        -hours: JSON
        -rating: decimal
        -reviews_count: int
        -view_count: int
        -status: enum[pending, approved, rejected]
        -subscription_tier: enum[free, pro, business]
        +createStore()
        +updateStore()
        +getAnalytics()
        +publishStory()
        +publishReel()
    }

    class Item {
        -id: BIGINT
        -store_id: FK
        -name: string
        -description: text
        -item_type: enum[product, service]
        -price: decimal
        -price_unit: string
        -stock_quantity: int
        -category: string
        -images: array
        -rating: decimal
        -reviews_count: int
        -view_count: int
        -order_count: int
        -status: enum[active, inactive, out_of_stock]
        +createItem()
        +updateItem()
        +deleteItem()
        +getAnalytics()
    }

    class Order {
        -id: BIGINT
        -order_number: string
        -store_id: FK
        -customer_id: FK
        -items: JSONB
        -total_price: decimal
        -status: enum[pending, validated, shipped, completed, cancelled]
        -tracking_code: string
        -payment_status: enum[pending, completed, failed, refunded]
        -created_at: timestamp
        -updated_at: timestamp
        +createOrder()
        +validateOrder()
        +generateQRCode()
        +cancelOrder()
        +markAsCompleted()
    }

    class Booking {
        -id: BIGINT
        -booking_number: string
        -store_id: FK
        -item_id: FK
        -customer_id: FK
        -booking_date: date
        -start_time: time
        -duration_minutes: int
        -number_of_guests: int
        -price: decimal
        -status: enum[pending, confirmed, completed, cancelled]
        -notes: text
        -created_at: timestamp
        +createBooking()
        +confirmBooking()
        +cancelBooking()
    }

    class Transaction {
        -id: UUID
        -transaction_code: string
        -order_id: FK
        -booking_id: FK
        -customer_id: FK
        -merchant_id: FK
        -amount: decimal
        -currency: string
        -status: enum[pending, completed, failed, refunded]
        -payment_method: string
        -qr_code_token: string
        -created_at: timestamp
        +processPayment()
        +refundTransaction()
        +validateQRCode()
    }

    class Review {
        -id: BIGINT
        -store_id: FK
        -item_id: FK
        -customer_id: FK
        -order_id: FK
        -rating: int
        -title: string
        -comment: text
        -images: array
        -sentiment_label: enum[positive, neutral, negative]
        -is_verified_purchase: boolean
        -is_flagged: boolean
        -vendor_response: text
        -created_at: timestamp
        +createReview()
        +updateReview()
        +respondToReview()
        +analyzeSentiment()
    }

    class Favorite {
        -id: UUID
        -user_id: FK
        -store_id: FK
        -item_id: FK
        -created_at: timestamp
        +addToFavorite()
        +removeFromFavorite()
    }

    class Message {
        -id: UUID
        -conversation_id: FK
        -sender_id: FK
        -receiver_id: FK
        -content: text
        -files: array
        -is_read: boolean
        -created_at: timestamp
        +sendMessage()
        +markAsRead()
        +deleteMessage()
    }

    class Notification {
        -id: UUID
        -user_id: FK
        -type: string
        -title: string
        -description: text
        -data: JSON
        -is_read: boolean
        -created_at: timestamp
        +createNotification()
        +markAsRead()
        +sendToUser()
    }

    class Promotion {
        -id: BIGINT
        -store_id: FK
        -title: string
        -description: text
        -discount_type: enum[percentage, fixed]
        -discount_value: decimal
        -valid_from: date
        -valid_until: date
        -is_active: boolean
        -created_at: timestamp
        +createPromotion()
        +updatePromotion()
        +getAnalytics()
    }

    class Story {
        -id: BIGINT
        -store_id: FK
        -media_url: string
        -media_type: enum[image, video]
        -text_overlay: text
        -cta_link: string
        -view_count: int
        -created_at: timestamp
        -expires_at: timestamp
        +publishStory()
        +getViewCount()
    }

    class Reel {
        -id: BIGINT
        -store_id: FK
        -video_url: string
        -thumbnail_url: string
        -title: string
        -description: text
        -category: string
        -view_count: int
        -like_count: int
        -share_count: int
        -status: enum[draft, published, archived]
        -created_at: timestamp
        +publishReel()
        +likeReel()
        +shareReel()
    }

    User "1" --|> "1" Profile : has
    User "1" --|> "*" Store : owns
    User "1" --|> "*" Order : creates
    User "1" --|> "*" Booking : creates
    User "1" --|> "*" Review : writes
    User "1" --|> "*" Favorite : marks
    User "1" --|> "*" Message : sends
    User "1" --|> "*" Notification : receives

    Store "1" --|> "*" Item : contains
    Store "1" --|> "*" Order : receives
    Store "1" --|> "*" Booking : receives
    Store "1" --|> "*" Review : has
    Store "1" --|> "*" Promotion : creates
    Store "1" --|> "*" Story : publishes
    Store "1" --|> "*" Reel : publishes

    Item "1" --|> "*" Order : in
    Item "1" --|> "*" Booking : books
    Item "1" --|> "*" Review : has
    Item "1" --|> "*" Favorite : marked

    Order "1" --|> "1" Transaction : creates
    Order "1" --|> "*" Review : receives

    Booking "1" --|> "1" Transaction : creates

    Promotion "1" --|> "*" Item : applies_to
```

---

## 2. Diagramme de Séquence

Complete flow from client discovery to order completion.

```mermaid
sequenceDiagram
    participant Client
    participant Browser
    participant API
    participant Supabase
    participant Groq
    participant QStash
    participant Merchant

    rect rgb(200, 150, 255)
        Note over Client,Browser: 1. CLIENT DÉCOUVRE & ACHÈTE
    end

    Client->>Browser: 1. Tape "acheter chaussures"
    Browser->>API: 2. POST /api/search
    API->>Supabase: 3. searchItems (full-text)
    Supabase-->>API: 4. Résultats items
    API-->>Browser: 5. JSON results
    Browser-->>Client: 6. Affiche produits

    Client->>Browser: 7. Clique sur produit
    Browser->>API: 8. GET /items/:id
    API->>Supabase: 9. getItem + reviews
    Supabase-->>API: 10. Item data
    API-->>Browser: 11. JSON
    Browser-->>Client: 12. Product detail

    Client->>Browser: 13. Clique "Order"
    Browser->>API: 14. POST /api/orders/create
    API->>Supabase: 15. INSERT order (PENDING)
    Supabase-->>API: 16. order_id + order_number
    API->>Supabase: 17. INSERT transaction
    API->>QStash: 18. Schedule payment-retry (120s)
    QStash-->>API: 19. Job queued
    API-->>Browser: 20. Success + tracking
    Browser-->>Client: 21. Confirmation page

    rect rgb(150, 200, 150)
        Note over Merchant,API: 2. MERCHANT REÇOIT NOTIFICATION
    end

    API->>Supabase: 22. Publish realtime event
    Supabase-->>Merchant: 23. Notification "New order"
    Merchant->>Browser: 24. Click notification
    Browser->>API: 25. GET /dashboard/leads
    API->>Supabase: 26. getLeads (PENDING)
    Supabase-->>API: 27. Order data
    API-->>Browser: 28. Leads list
    Browser-->>Merchant: 29. See PENDING order

    Merchant->>Browser: 30. Clique "Accept"
    Browser->>API: 31. POST /orders/:id/validate
    API->>Supabase: 32. UPDATE order (VALIDATED)
    API->>Supabase: 33. INSERT transaction (VALIDATED)
    API->>Groq: 34. generateQRCode (async)
    Groq-->>API: 35. QR token
    API->>Supabase: 36. UPDATE order (qr_code)
    API->>QStash: 37. Send notification job
    QStash-->>API: 38. Queued
    API-->>Browser: 39. Success
    Browser-->>Merchant: 40. QR code generated

    rect rgb(255, 200, 150)
        Note over Client,Browser: 3. PAIEMENT & LIVRAISON
    end

    QStash->>API: 41. /workers/payment-retry
    API->>Supabase: 42. checkPaymentStatus
    Supabase-->>API: 43. Payment validated
    API->>Supabase: 44. UPDATE order (SHIPPED)
    API->>QStash: 45. Send notification
    QStash-->>Client: 46. Notification "Shipped"

    Merchant->>Browser: 47. Scan QR code
    Browser->>API: 48. POST /transactions/validate
    API->>Supabase: 49. validateQR + UPDATE (COMPLETED)
    Supabase-->>API: 50. Success
    API->>QStash: 51. Send review reminder
    QStash-->>Client: 52. Notification "Leave review"
    API-->>Browser: 53. Delivery confirmed
    Browser-->>Merchant: 54. ✅ Completed
```

---

## 3. Diagramme de Cas d'Usage

All use cases for the three actor types.

```mermaid
usecase diagram
    package "Ro2ya Marketplace" {
        usecase UC1 as "Rechercher produits\n(Native/Darija/Image)"
        usecase UC2 as "Naviguer magasins"
        usecase UC3 as "Consulter détails\nproduit/service"
        usecase UC4 as "Ajouter aux\nfavoris"
        usecase UC5 as "Commander\nproduit"
        usecase UC6 as "Réserver\nservice"
        usecase UC7 as "Payer\n(Stripe/Telnet)"
        usecase UC8 as "Voir historique\ncommandes"
        usecase UC9 as "Laisser avis\n& évaluations"
        usecase UC10 as "Envoyer\nmessage"
        usecase UC11 as "Gérer profil\nutilisateur"

        usecase UC20 as "Créer magasin"
        usecase UC21 as "Ajouter produits\n& services"
        usecase UC22 as "Gérer inventory"
        usecase UC23 as "Accepter/Rejeter\ncommandes"
        usecase UC24 as "Scanner QR\nlivraison"
        usecase UC25 as "Voir analytics\ndashboard"
        usecase UC26 as "Créer promotions"
        usecase UC27 as "Publier stories\n& reels"
        usecase UC28 as "Gérer avis\nclient"
        usecase UC29 as "Gérer abonnement\n(FREE/PRO/BUSINESS)"
        usecase UC30 as "Gérer profil\nmagasin"

        usecase UC40 as "Approuver/Rejeter\nmagasins"
        usecase UC41 as "Modérer avis\nsuspects"
        usecase UC42 as "Suspendre\nutilisateurs"
        usecase UC43 as "Voir analytics\nglobales"
        usecase UC44 as "Gérer catégories"
        usecase UC45 as "Gérer paramètres\nsystème"
        usecase UC46 as "Exporter données"

        actor "👤 Client" as Client
        actor "🏪 Merchant" as Merchant
        actor "👨‍💼 Admin" as Admin

        Client --|> UC1
        Client --|> UC2
        Client --|> UC3
        Client --|> UC4
        Client --|> UC5
        Client --|> UC6
        Client --|> UC7
        Client --|> UC8
        Client --|> UC9
        Client --|> UC10
        Client --|> UC11

        Merchant --|> UC20
        Merchant --|> UC21
        Merchant --|> UC22
        Merchant --|> UC23
        Merchant --|> UC24
        Merchant --|> UC25
        Merchant --|> UC26
        Merchant --|> UC27
        Merchant --|> UC28
        Merchant --|> UC29
        Merchant --|> UC30

        Admin --|> UC40
        Admin --|> UC41
        Admin --|> UC42
        Admin --|> UC43
        Admin --|> UC44
        Admin --|> UC45
        Admin --|> UC46

        UC5 ..|> UC7 : includes
        UC6 ..|> UC7 : includes
        UC9 ..|> UC8 : includes
        UC23 ..|> UC24 : includes
        UC24 ..|> UC8 : updates

        UC20 ..|> UC30 : includes
        UC21 ..|> UC22 : includes
        UC26 ..|> UC21 : applies_to
    }
```

---

## 4. Architecture Composants

Complete system architecture with all layers and services.

```mermaid
graph TB
    subgraph "🖥️ Frontend Layer"
        React["React 18<br/>App Router<br/>TypeScript"]
        TW["TailwindCSS<br/>Components"]
        ThreeJS["Three.js<br/>3D Scene"]
        GSAP["GSAP<br/>Animations"]
        Zustand["Zustand<br/>State"]
    end

    subgraph "🔄 API Layer"
        APIRoutes["REST API Routes<br/>POST, GET, PUT, DELETE"]
        ServerActions["Server Actions<br/>Next.js 13+"]
        Middleware["Middleware<br/>Rate Limiting<br/>Auth Check"]
    end

    subgraph "💼 Business Logic"
        Auth["Authentication<br/>JWT, Session"]
        Search["Search Engine<br/>Full-text, Vector, Image"]
        Orders["Order Management<br/>CRUD, Status, QR"]
        Bookings["Booking Engine<br/>Calendar, Slots"]
        Payments["Payment Processing<br/>Stripe, Telnet"]
        Notifications["Notifications<br/>Real-time, Push"]
        Reviews["Review & Sentiment<br/>AI Analysis"]
    end

    subgraph "🗄️ Data Layer"
        Supabase["Supabase<br/>PostgreSQL + Auth"]
        Database["17 Tables<br/>Users, Stores, Items<br/>Orders, Reviews, etc."]
        Storage["Storage Buckets<br/>Images, Videos"]
        RLS["Row Level Security<br/>Data Protection"]
    end

    subgraph "🤖 AI & ML"
        Groq["Groq LLaMA<br/>Chat, Intent, Vision"]
        Gemini["Google Gemini<br/>NLP Enrichment"]
        DarijaDict["Darija Dictionary<br/>500+ Words"]
        Embeddings["Vector Embeddings<br/>pgvector"]
    end

    subgraph "⚙️ Infrastructure"
        QStash["Upstash QStash<br/>Async Jobs<br/>Retry Logic"]
        GooglePlaces["Google Places<br/>Geolocation<br/>Tunisia"]
        Stripe["Stripe<br/>Card Payments"]
        Resend["Resend<br/>Email Service"]
    end

    subgraph "🚀 Deployment"
        Vercel["Vercel<br/>Next.js Hosting"]
        CDN["CDN<br/>Image Optimization"]
        Monitoring["Monitoring<br/>Sentry, GA4"]
    end

    React --> APIRoutes
    TW --> React
    ThreeJS --> React
    GSAP --> React
    Zustand --> React

    APIRoutes --> Middleware
    ServerActions --> Middleware
    Middleware --> Auth
    Middleware --> Search
    Middleware --> Orders
    Middleware --> Bookings
    Middleware --> Payments
    Middleware --> Notifications
    Middleware --> Reviews

    Auth --> Supabase
    Search --> Database
    Orders --> Database
    Bookings --> Database
    Payments --> Database
    Notifications --> Database
    Reviews --> Database

    Database --> Storage
    Database --> RLS
    Database --> Embeddings

    Search --> Groq
    Search --> Gemini
    Search --> DarijaDict
    Reviews --> Groq
    Reviews --> Gemini

    Orders --> QStash
    Bookings --> QStash
    Payments --> QStash
    Notifications --> QStash

    Search --> GooglePlaces
    Payments --> Stripe
    Notifications --> Resend

    APIRoutes --> Vercel
    ServerActions --> Vercel
    React --> CDN
    Vercel --> Monitoring

    style React fill:#61dafb
    style Supabase fill:#3ecf8e
    style Groq fill:#ff6b6b
    style Vercel fill:#000000,color:#fff
    style QStash fill:#6b7280
```

---

## 5. Diagramme de Déploiement

Complete infrastructure and deployment architecture.

```mermaid
graph LR
    subgraph "🌐 Client Layer"
        Desktop["🖥️ Desktop Browser<br/>Chrome/Firefox/Safari"]
        Mobile["📱 Mobile Browser<br/>iOS/Android"]
        App["📲 Mobile App<br/>React Native<br/>Future"]
    end

    subgraph "☁️ Edge & CDN"
        Vercel["Vercel Edge Functions<br/>Global CDN<br/>15+ regions"]
        Images["Image Optimization<br/>WebP, AVIF<br/>Responsive"]
    end

    subgraph "🎯 Application Server"
        NextJS["Next.js 15 Server<br/>App Router<br/>TypeScript<br/>Vercel Deployment"]
        API["REST API<br/>23 endpoints<br/>Server Actions"]
        Middleware["Rate Limiting<br/>Auth Middleware"]
    end

    subgraph "🔐 Authentication"
        Supabase_Auth["Supabase Auth<br/>JWT Tokens<br/>OAuth2<br/>Magic Links"]
    end

    subgraph "🗄️ Database Cluster"
        PostgreSQL["PostgreSQL 15<br/>17 Tables<br/>pgvector extension"]
        Replicas["Hot Replicas<br/>Backup Strategy<br/>Point-in-time"]
        Indexes["Indexes<br/>Full-text search<br/>Vector search"]
    end

    subgraph "💾 Storage"
        S3["Supabase Storage<br/>S3-compatible<br/>Buckets:<br/>avatars, products,<br/>stories, reels"]
        CDN_Storage["CDN Cache<br/>Global distribution"]
    end

    subgraph "🤖 AI Services"
        Groq_Cloud["Groq Cloud<br/>LLaMA 3.1 8B<br/>LLaMA 4 Scout 17B<br/>API REST"]
        Google_AI["Google AI<br/>Gemini API<br/>Places API<br/>Tunisia region"]
    end

    subgraph "⚙️ Background Jobs"
        QStash["Upstash QStash<br/>Serverless Queue<br/>Async workers<br/>Automatic retry<br/>120s timeout"]
        Jobs["Jobs:<br/>payment-retry<br/>send-emails<br/>sync-orders<br/>notifications"]
    end

    subgraph "💳 Payment Gateway"
        Stripe["Stripe API<br/>Card Processing<br/>Webhooks"]
        Telnet["Telnet Gateway<br/>Tunisia Local<br/>Bank transfers"]
    end

    subgraph "📧 Email Service"
        Resend["Resend API<br/>Transactional Emails<br/>SMTP<br/>Templates"]
    end

    subgraph "📊 Monitoring & Logs"
        Sentry["Sentry<br/>Error Tracking<br/>Performance<br/>Alerts"]
        GA4["Google Analytics 4<br/>User Behavior<br/>Conversion"]
        Logs["Vercel Logs<br/>Request/Response<br/>Runtime logs"]
    end

    subgraph "🌍 DNS & Security"
        Cloudflare["Cloudflare<br/>DNS<br/>DDoS Protection<br/>SSL/TLS"]
        WAF["Web Application<br/>Firewall<br/>CORS Policy"]
    end

    Desktop --> Cloudflare
    Mobile --> Cloudflare
    App --> Cloudflare

    Cloudflare --> Vercel
    Vercel --> Images
    Vercel --> NextJS

    NextJS --> Middleware
    Middleware --> API
    API --> Supabase_Auth

    API --> PostgreSQL
    PostgreSQL --> Replicas
    PostgreSQL --> Indexes

    API --> S3
    S3 --> CDN_Storage

    API --> Groq_Cloud
    API --> Google_AI

    API --> QStash
    QStash --> Jobs

    Jobs --> PostgreSQL
    Jobs --> Resend
    Jobs --> Stripe

    API --> Stripe
    API --> Telnet
    API --> Resend

    NextJS --> Sentry
    NextJS --> GA4
    NextJS --> Logs

    API --> Sentry

    Vercel -.->|built-in| WAF

    style Desktop fill:#f0f0f0
    style Mobile fill:#f0f0f0
    style Vercel fill:#000000,color:#fff
    style PostgreSQL fill:#336791,color:#fff
    style Groq_Cloud fill:#ff6b6b
    style Stripe fill:#0070f0,color:#fff
    style Sentry fill:#362d59,color:#fff
```

---

## 6. Diagramme d'État - Cycle Vie Commande

Order status transitions and state management.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Client clique "Order"

    PENDING --> VALIDATED: Merchant accepte\n(generateQRCode)
    PENDING --> CANCELLED: Merchant rejette\nOU Client annule

    VALIDATED --> SHIPPED: Payment confirmé\n(async job)
    VALIDATED --> FAILED: Payment échoué\n(retry x3)

    FAILED --> VALIDATED: Retry paiement\n(QStash 120s)

    SHIPPED --> COMPLETED: Merchant scanne QR\n(validateQRCode)
    SHIPPED --> CANCELLED: Annulation tardive

    COMPLETED --> [*]: ✅ Livré\n(client peut reviewer)

    CANCELLED --> [*]: ❌ Annulée\n(refund processed)

    note right of PENDING
        Client notification:
        "Commande créée"
        Merchant notification:
        "Nouvelle commande"
    end note

    note right of VALIDATED
        QR code généré
        Merchant voit token
        Client reçoit confirmation
        Transaction synced
    end note

    note right of SHIPPED
        Client notifié
        Delivery en cours
        Merchant prêt à scanner
    end note

    note right of COMPLETED
        Merchant scanne QR
        QR validé ✓
        Sync transaction
        Client peut reviewer
    end note

    note right of FAILED
        Payment failed
        Retry automatique
        Max 3 tentatives
        Si toujours échoué → refund
    end note
```

---

## 7. Recherche Sémantique Darija

Complete 4-step semantic search process with Darija support.

```mermaid
graph TD
    A["👤 Client tape requête<br/>(peut être en Darija/Arabic)<br/>Ex: 'نحب نشري ماكينة خياطة'"] -->B{Langue\ndétectée?}

    B -->|Arabic/Darija| C["📖 STEP 1: Dictionary Lookup<br/>Darija → French<br/>Using 500+ word dictionary"]
    B -->|French/English| D["✅ Requête déjà<br/>en langue cible"]
    
    C --> E["نحب → je veux<br/>نشري → acheter<br/>ماكينة → machine<br/>خياطة → couture<br/><br/>Result: 'acheter machine couture'"]
    
    E --> F["🤖 STEP 2: Groq Normalization<br/>LLaMA 3.1 8B<br/>Normalise & nettoie"]
    
    D --> F
    
    F --> G["Remove accents<br/>Fix typos<br/>Expand abbreviations<br/>Result: 'acheter machine'"]
    
    G --> H["🔧 STEP 3: Gemini Enrichment<br/>Google Gemini API<br/>Contextualize & enhance"]
    
    H --> I["Add city context user location<br/>Fix spelling issues<br/>Infer category shopping<br/>Result: 'acheter machine couture boutique'"]
    
    I --> J["🔍 STEP 4: Hybrid Search<br/>Dual search strategy"]
    
    J --> K["Vector Search<br/>Semantic"]
    J --> L["Full-text Search<br/>Keywords"]
    
    K --> M["1. Generate embedding<br/>768 dimensions<br/>using pgvector"]
    L --> N["1. Full-text search<br/>on name, description<br/>using tsvector"]
    
    M --> O["2. Cosine similarity<br/>against all items<br/>Top 50 results"]
    N --> P["2. Keyword matching<br/>Relevance ranking<br/>Top 50 results"]
    
    O --> Q["Combine scores<br/>Vector: 60%<br/>Full-text: 40%"]
    P --> Q
    
    Q --> R["Sort by combined<br/>relevance score"]
    
    R --> S["Apply filters<br/>Category<br/>City<br/>Price range"]
    
    S --> T["Display Results<br/>Top 20 items"]
    
    T --> U["✅ Client sees<br/>1. Product name<br/>2. Relevance %<br/>3. Price<br/>4. Rating<br/>5. Store info"]
    
    U --> V{Client clicks<br/>product?}
    
    V -->|Yes| W["📊 Analytics:<br/>Track click<br/>Increment view_count<br/>Log search term"]
    V -->|No| X["🔄 Refine search<br/>Suggest alternatives"]
    
    W --> Y["👍 Success!"]
    X --> A
    
    style A fill:#fff4e6
    style C fill:#e3f2fd
    style F fill:#f3e5f5
    style H fill:#f3e5f5
    style J fill:#e8f5e9
    style K fill:#fff9c4
    style L fill:#fff9c4
    style Q fill:#c8e6c9
    style U fill:#e1f5fe
    style Y fill:#c8e6c9
```

---

## 8. ER Diagram - Schéma Base de Données

Complete database schema with all tables and relationships.

```mermaid
erDiagram
    USERS ||--o{ PROFILES : has
    USERS ||--o{ STORES : owns
    USERS ||--o{ ORDERS : "creates (customer)"
    USERS ||--o{ BOOKINGS : "creates (customer)"
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ FAVORITES : marks
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ TRANSACTIONS : "as customer"

    STORES ||--o{ ITEMS : contains
    STORES ||--o{ ORDERS : "receives (merchant)"
    STORES ||--o{ BOOKINGS : "receives (merchant)"
    STORES ||--o{ REVIEWS : "has (store level)"
    STORES ||--o{ PROMOTIONS : creates
    STORES ||--o{ STORIES : publishes
    STORES ||--o{ REELS : publishes
    STORES ||--o{ TRANSACTIONS : "as merchant"

    ITEMS ||--o{ ORDERS : "ordered in"
    ITEMS ||--o{ BOOKINGS : "booked"
    ITEMS ||--o{ REVIEWS : "has (item level)"
    ITEMS ||--o{ FAVORITES : marked
    ITEMS ||--o{ COMMENTS : "has (comments)"

    ORDERS ||--|| TRANSACTIONS : "creates (order transaction)"
    ORDERS ||--o{ REVIEWS : "receives (after completed)"
    
    BOOKINGS ||--|| TRANSACTIONS : "creates (booking transaction)"
    BOOKINGS ||--o{ REVIEWS : "receives (after completed)"

    PROMOTIONS ||--o{ ITEMS : "applies to"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        enum role
        enum status
        timestamp created_at
    }

    PROFILES {
        uuid id PK
        uuid user_id FK
        string avatar_url
        string first_name
        string last_name
        text bio
        string phone
        string city
    }

    STORES {
        bigint id PK
        uuid owner_id FK
        string name UK
        string slug
        string category
        string address
        string city
        decimal latitude
        decimal longitude
        string logo_url
        string banner_url
        text description
        enum status
        enum subscription_tier
        decimal rating
        int reviews_count
        int view_count
        timestamp created_at
    }

    ITEMS {
        bigint id PK
        bigint store_id FK
        string name
        text description
        enum item_type
        decimal price
        string price_unit
        int stock_quantity
        string category
        string[] images
        enum status
        decimal rating
        int reviews_count
        int view_count
        int order_count
        timestamp created_at
    }

    ORDERS {
        bigint id PK
        string order_number UK
        bigint store_id FK
        uuid customer_id FK
        jsonb items
        decimal total_price
        enum status
        string tracking_code
        enum payment_status
        timestamp created_at
        timestamp updated_at
    }

    BOOKINGS {
        bigint id PK
        string booking_number UK
        bigint store_id FK
        bigint item_id FK
        uuid customer_id FK
        date booking_date
        time start_time
        int duration_minutes
        int number_of_guests
        decimal price
        enum status
        text notes
        timestamp created_at
    }

    TRANSACTIONS {
        uuid id PK
        string transaction_code UK
        bigint order_id FK
        bigint booking_id FK
        uuid customer_id FK
        uuid merchant_id FK
        decimal amount
        string currency
        enum status
        string payment_method
        string qr_code_token
        timestamp created_at
    }

    REVIEWS {
        bigint id PK
        bigint store_id FK
        bigint item_id FK
        uuid customer_id FK
        bigint order_id FK
        int rating
        string title
        text comment
        string[] images
        enum sentiment_label
        boolean is_verified_purchase
        boolean is_flagged
        text vendor_response
        timestamp created_at
    }

    FAVORITES {
        uuid id PK
        uuid user_id FK
        bigint store_id FK
        bigint item_id FK
        timestamp created_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        uuid receiver_id FK
        text content
        string[] files
        boolean is_read
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        string title
        text description
        jsonb data
        boolean is_read
        timestamp created_at
    }

    PROMOTIONS {
        bigint id PK
        bigint store_id FK
        string title
        text description
        enum discount_type
        decimal discount_value
        date valid_from
        date valid_until
        boolean is_active
        timestamp created_at
    }

    STORIES {
        bigint id PK
        bigint store_id FK
        string media_url
        enum media_type
        text text_overlay
        string cta_link
        int view_count
        timestamp created_at
        timestamp expires_at
    }

    REELS {
        bigint id PK
        bigint store_id FK
        string video_url
        string thumbnail_url
        string title
        text description
        string category
        int view_count
        int like_count
        int share_count
        enum status
        timestamp created_at
    }

    COMMENTS {
        bigint id PK
        bigint item_id FK
        uuid user_id FK
        text content
        int likes_count
        timestamp created_at
    }
```

---

## 📊 Résumé des Diagrammes

| # | Type | Contenu | Acteurs |
|---|------|---------|---------|
| 1 | **Classe** | 14 classes + 25+ relations | OOP & Data Models |
| 2 | **Séquence** | 54 étapes du flow | Client → API → Merchant → Delivery |
| 3 | **Cas d'Usage** | 46 use cases | Client (11), Merchant (11), Admin (7) |
| 4 | **Composant** | 7 couches | Frontend → API → DB → AI → Deploy |
| 5 | **Déploiement** | Infrastructure complète | Clients → Vercel → Services |
| 6 | **État** | Cycle commande | PENDING → VALIDATED → SHIPPED → COMPLETED |
| 7 | **Activité** | Recherche Darija | 4 steps + Hybrid Search |
| 8 | **ER Diagram** | Schéma BD | 17 tables + 50+ relations |

---

## 🎯 Comment Utiliser ces Diagrammes

### Pour les Développeurs
- Référence d'architecture
- Guide d'implémentation
- Structure de la base de données

### Pour les Architects
- Validation de l'architecture
- Identification des bottlenecks
- Planification des itérations

### Pour les Stakeholders
- Visualisation complète du système
- Compréhension des workflows
- Validation des fonctionnalités

### Pour la Documentation
- Inclusion dans la documentation technique
- Référence pour les nouveaux membres
- Base de communication avec les équipes

---

## 🔗 Intégration avec Autres Documents

Ces diagrammes complètent:
- **PLATFORM_DESIGN_COMPLETE.md** - Design et fonctionnalités
- **BACKEND_ARCHITECTURE.md** - Implémentation backend
- **DATABASE_SCHEMA.md** - Détails schéma BD
- **BACKEND_API_DOCUMENTATION.md** - API endpoints

---

**Version:** 1.0  
**Date:** Avril 2026  
**Status:** ✅ Production Ready  
**Format:** Mermaid Diagrams (Renderable en GitHub, GitLab, VS Code, etc.)
