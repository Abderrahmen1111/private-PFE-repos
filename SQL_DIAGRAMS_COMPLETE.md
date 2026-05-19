# 📊 Diagrammes SQL - Architecture Complète de la Base de Données

Documentation complète des diagrammes relationnels, normalisations et structures SQL pour la plateforme **ro2ya.tn**.

---

## 1. 🗄️ DIAGRAMME ER (ENTITÉ-RELATION) - VUE GÉNÉRALE

```mermaid
erDiagram
    USERS ||--o{ STORES : owns
    USERS ||--o{ ITEMS : creates
    USERS ||--o{ ORDERS : places
    USERS ||--o{ BOOKINGS : makes
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ REELS : creates
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ FRIENDSHIPS : initiates
    USERS ||--o{ FAVORITES : marks
    USERS ||--o{ SUPPORT_TICKETS : creates
    
    STORES ||--o{ ITEMS : contains
    STORES ||--o{ ORDERS : receives
    STORES ||--o{ BOOKINGS : receives
    STORES ||--o{ REVIEWS : receives
    STORES ||--o{ BANNERS : displays
    
    ITEMS ||--o{ ORDERS : "ordered in"
    ITEMS ||--o{ BOOKINGS : "booked via"
    ITEMS ||--o{ REVIEWS : "reviewed as"
    ITEMS ||--o{ FAVORITES : "marked as"
    
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_STATUS_HISTORY : tracks
    ORDERS ||--o{ QR_CODES : validates
    
    BOOKINGS ||--o{ BOOKING_SCHEDULE : tracks
    
    MESSAGES ||--o{ MESSAGE_THREADS : organizes
    
    REELS ||--o{ REEL_LIKES : receives
    REELS ||--o{ REEL_COMMENTS : receives
    REELS ||--o{ REEL_SAVES : receives
    REELS ||--o{ REEL_STATS : records
    
    USERS ||--o{ STORE_FOLLOWERS : tracks
    STORES ||--o{ STORE_FOLLOWS : gains
```

---

## 2. 👥 DIAGRAMME UTILISATEURS ET AUTHENTIFICATION

```mermaid
graph TD
    A["USERS<br/>(Utilisateurs)"] -->|role| B["ROLES:<br/>USER<br/>PRO<br/>ADMIN"]
    A -->|has many| C["PROFILES"]
    A -->|has many| D["AUTH_SESSIONS"]
    A -->|has many| E["USER_PREFERENCES"]
    A -->|has many| F["PUSH_TOKENS"]
    
    C -->|contains| G["full_name<br/>phone<br/>city<br/>avatar"]
    
    D -->|tracks| H["JWT Token<br/>Login Time<br/>IP Address"]
    
    E -->|stores| I["Language<br/>Notifications<br/>Privacy"]
    
    F -->|for| J["Device Push<br/>Notifications"]
    
    A -->|blocks| K["BLOCKED_USERS"]
    K -->|prevents| L["Messages<br/>Comments<br/>Interactions"]
```

---

## 3. 🏪 DIAGRAMME MAGASINS (STORES)

```mermaid
graph TD
    A["STORES<br/>(Magasins)"] -->|owner| B["USERS"]
    A -->|status| C["STORE_STATUS:<br/>PENDING<br/>APPROVED<br/>REJECTED<br/>INACTIVE"]
    
    A -->|contains| D["STORE_INFO"]
    D -->|has| E["name<br/>description<br/>phone<br/>email<br/>address"]
    
    A -->|location| F["COORDINATES:<br/>latitude<br/>longitude"]
    
    A -->|has many| G["STORE_IMAGES"]
    G -->|includes| H["logo<br/>banner<br/>gallery"]
    
    A -->|has many| I["STORE_HOURS"]
    I -->|defines| J["Monday-Sunday<br/>Opening Time<br/>Closing Time"]
    
    A -->|linked to| K["BUSINESS_DIRECTORY"]
    K -->|from| L["External Data:<br/>Google Maps<br/>Phone Directory"]
    
    A -->|has many| M["STORE_FOLLOWERS"]
    A -->|receives| N["STORE_REVIEWS"]
    
    A -->|has many| O["BANNERS<br/>PROMOTIONS"]
```

---

## 4. 📦 DIAGRAMME PRODUITS ET SERVICES (ITEMS)

```mermaid
graph TD
    A["ITEMS<br/>(Produits/Services)"] -->|type| B["ITEM_TYPE:<br/>PRODUCT<br/>SERVICE"]
    A -->|belongs to| C["STORES"]
    
    A -->|has| D["BASIC_INFO"]
    D -->|contains| E["name<br/>description<br/>price<br/>price_unit"]
    
    A -->|status| F["ITEM_STATUS:<br/>ACTIVE<br/>INACTIVE<br/>DISCONTINUED"]
    
    A -->|has| G["INVENTORY<br/>(for PRODUCT)"]
    G -->|tracks| H["stock_quantity<br/>reserved_quantity<br/>available_quantity"]
    
    A -->|has| I["SERVICE_CONFIG<br/>(for SERVICE)"]
    I -->|defines| J["duration_minutes<br/>is_bookable<br/>available_days"]
    
    A -->|has many| K["IMAGES"]
    K -->|includes| L["main_image<br/>image_2<br/>image_3"]
    
    A -->|has many| M["REVIEWS"]
    A -->|has| N["METRICS"]
    N -->|tracks| O["view_count<br/>order_count<br/>booking_count<br/>rating_average"]
    
    A -->|stores| P["EMBEDDING<br/>(vector)"]
    P -->|for| Q["Semantic Search<br/>AI Recommendations"]
```

---

## 5. 🛒 DIAGRAMME COMMANDES (ORDERS) - DÉTAILLÉ

```mermaid
graph TD
    A["ORDERS<br/>(Commandes)"] -->|customer| B["USERS"]
    A -->|store| C["STORES"]
    
    A -->|status| D["ORDER_STATUS:<br/>PENDING<br/>ACCEPTED<br/>REJECTED<br/>IN_TRANSIT<br/>DELIVERED<br/>CANCELLED"]
    
    A -->|has| E["ORDER_INFO"]
    E -->|contains| F["order_number<br/>total_price<br/>status<br/>timestamps"]
    
    A -->|has many| G["ORDER_ITEMS"]
    G -->|references| H["ITEMS"]
    G -->|tracks| I["quantity<br/>unit_price<br/>subtotal"]
    
    A -->|has many| J["ORDER_STATUS_HISTORY"]
    J -->|records| K["Previous Status<br/>Changed At<br/>Changed By<br/>Reason"]
    
    A -->|delivery| L["DELIVERY_INFO"]
    L -->|has| M["address<br/>city<br/>phone<br/>delivery_date<br/>tracking_number"]
    
    A -->|payment| N["PAYMENT_INFO"]
    N -->|has| O["method<br/>status<br/>amount<br/>transaction_id"]
    
    A -->|has| P["QR_CODE"]
    P -->|for| Q["Validation<br/>At Pickup<br/>At Delivery"]
    
    A -->|tracked by| R["FRAUD_ANALYSIS"]
    R -->|checks| S["Risk Score<br/>Verification Status"]
```

---

## 6. 📅 DIAGRAMME RÉSERVATIONS (BOOKINGS) - DÉTAILLÉ

```mermaid
graph TD
    A["BOOKINGS<br/>(Réservations)"] -->|customer| B["USERS"]
    A -->|service| C["ITEMS<br/>(SERVICE TYPE)"]
    A -->|store| D["STORES"]
    
    A -->|status| E["BOOKING_STATUS:<br/>PENDING<br/>CONFIRMED<br/>IN_PROGRESS<br/>COMPLETED<br/>CANCELLED"]
    
    A -->|has| F["BOOKING_INFO"]
    F -->|contains| G["booking_date<br/>booking_time<br/>duration<br/>status<br/>price"]
    
    A -->|customer info| H["booking_name<br/>booking_phone<br/>booking_email"]
    
    A -->|timestamps| I["created_at<br/>confirmed_at<br/>completed_at"]
    
    A -->|has many| J["BOOKING_SCHEDULE"]
    J -->|tracks| K["start_time<br/>end_time<br/>date<br/>status"]
    
    A -->|validation| L["QR_CODE"]
    L -->|scanned at| M["Store Location<br/>by Staff"]
    
    A -->|tracked by| N["FRAUD_ANALYSIS"]
    
    A -->|notes| O["customer_notes<br/>staff_notes"]
```

---

## 7. ⭐ DIAGRAMME AVIS ET ÉVALUATIONS (REVIEWS)

```mermaid
graph TD
    A["REVIEWS<br/>(Avis)"] -->|author| B["USERS"]
    A -->|subject type| C["TYPE:<br/>STORE<br/>ITEM"]
    
    A -->|on store| D["STORES"]
    A -->|on item| E["ITEMS"]
    
    A -->|has| F["REVIEW_DATA"]
    F -->|contains| G["rating<br/>1-5 stars<br/>text<br/>helpful_count"]
    
    A -->|has| H["REVIEW_IMAGES"]
    H -->|includes| I["photo_1<br/>photo_2<br/>photo_3"]
    
    A -->|timestamps| J["created_at<br/>updated_at"]
    
    A -->|aggregated by| K["ITEM_METRICS"]
    K -->|calculates| L["rating_average<br/>total_reviews<br/>rating_distribution"]
    
    A -->|affects| M["STORE_REPUTATION"]
    M -->|impacts| N["Search Ranking<br/>Visibility<br/>Trust Score"]
    
    A -->|can be| O["ACTION:<br/>HELPFUL<br/>UNHELPFUL<br/>REPORTED"]
    
    A -->|moderation| P["REVIEW_MODERATION"]
    P -->|status| Q["APPROVED<br/>PENDING<br/>REJECTED"]
```

---

## 8. 📹 DIAGRAMME REELS (REELS ET STORIES) - DÉTAILLÉ

```mermaid
graph TD
    A["REELS<br/>(Videos)"] -->|creator| B["USERS"]
    A -->|store| C["STORES<br/>(optional)"]
    
    A -->|has| D["REEL_CONTENT"]
    D -->|stores| E["video_url<br/>thumbnail<br/>duration<br/>description"]
    
    A -->|has| F["REEL_METADATA"]
    F -->|contains| G["hashtags<br/>location<br/>tagged_users<br/>is_product_reel"]
    
    A -->|has many| H["REEL_LIKES"]
    H -->|by| I["USERS"]
    
    A -->|has many| J["REEL_COMMENTS"]
    J -->|from| K["USERS"]
    J -->|contain| L["text<br/>mentions<br/>timestamp"]
    
    A -->|has many| M["REEL_SAVES"]
    M -->|by| N["USERS"]
    
    A -->|has| O["REEL_STATS"]
    O -->|tracks| P["view_count<br/>like_count<br/>comment_count<br/>save_count<br/>share_count"]
    
    A -->|has| Q["VISIBILITY"]
    Q -->|status| R["PUBLIC<br/>PRIVATE<br/>ARCHIVED"]
    
    A -->|embedded as| S["VECTOR<br/>(for recommendations)"]
```

---

## 9. 💬 DIAGRAMME MESSAGERIE (MESSAGES ET CONVERSATIONS)

```mermaid
graph TD
    A["MESSAGES<br/>(Messages)"] -->|sender| B["USERS"]
    A -->|receiver| C["USERS"]
    
    A -->|in| D["MESSAGE_THREADS"]
    D -->|between| E["Two Users<br/>or<br/>User & Store Support"]
    
    A -->|has| F["MESSAGE_CONTENT"]
    F -->|contains| G["text<br/>attachment_url<br/>type<br/>metadata"]
    
    A -->|type| H["MESSAGE_TYPE:<br/>TEXT<br/>IMAGE<br/>FILE<br/>PRODUCT_LINK"]
    
    A -->|status| I["MESSAGE_STATUS:<br/>SENT<br/>DELIVERED<br/>READ"]
    
    A -->|timestamps| J["created_at<br/>read_at"]
    
    D -->|has many| K["MESSAGE_METADATA"]
    K -->|tracks| L["last_message<br/>last_read_by_user<br/>unread_count"]
    
    A -->|affected by| M["BLOCKED_USERS"]
    M -->|prevents| N["Message Delivery<br/>Visibility"]
    
    A -->|for support| O["SUPPORT_MESSAGES"]
    O -->|linked to| P["SUPPORT_TICKETS"]
```

---

## 10. 💛 DIAGRAMME FAVORIS (FAVORITES)

```mermaid
graph TD
    A["FAVORITES<br/>(Favoris)"] -->|user| B["USERS"]
    A -->|target type| C["TYPE:<br/>STORE<br/>ITEM"]
    
    A -->|references| D["STORES<br/>OR<br/>ITEMS"]
    
    A -->|has| E["FAVORITE_INFO"]
    E -->|contains| F["added_at<br/>category<br/>note"]
    
    A -->|organized by| G["FAVORITE_COLLECTIONS"]
    G -->|user can create| H["My Favorites<br/>Wishlist<br/>For Later<br/>Custom Collection"]
    
    A -->|affects| I["USER_RECOMMENDATIONS"]
    I -->|improves| J["Personalization<br/>Discovery Feed"]
    
    A -->|displayed in| K["USER_PROFILE"]
    K -->|shows| L["Public Favorites<br/>Private Favorites"]
```

---

## 11. 👥 DIAGRAMME AMITIÉ ET INTERACTIONS SOCIALES (FRIENDSHIPS)

```mermaid
graph TD
    A["FRIENDSHIPS<br/>(Amités)"] -->|user| B["USERS"]
    A -->|friend| C["USERS"]
    
    A -->|status| D["FRIENDSHIP_STATUS:<br/>PENDING<br/>ACCEPTED<br/>BLOCKED"]
    
    A -->|when status| E["PENDING:<br/>Awaiting confirmation"]
    E -->|leads to| F["Notifications:<br/>Friend request"]
    
    A -->|when status| G["ACCEPTED:<br/>Can message<br/>Can see posts"]
    
    A -->|when status| H["BLOCKED:<br/>Cannot message<br/>Cannot see content"]
    
    A -->|timestamps| I["created_at<br/>updated_at<br/>accepted_at"]
    
    A -->|affects| J["VISIBILITY_RULES"]
    J -->|controls| K["Story visibility<br/>Reel access<br/>Profile viewing"]
    
    A -->|linked to| L["STORE_FOLLOWERS"]
    L -->|similar model| M["for stores"]
```

---

## 12. 🎫 DIAGRAMME SUPPORT TECHNIQUE (SUPPORT TICKETS)

```mermaid
graph TD
    A["SUPPORT_TICKETS<br/>(Tickets Support)"] -->|creator| B["USERS"]
    A -->|assigned to| C["SUPPORT_STAFF<br/>(Users with ADMIN/SUPPORT role)"]
    
    A -->|category| D["TICKET_CATEGORY:<br/>PAYMENT<br/>ORDER<br/>TECHNICAL<br/>ACCOUNT<br/>OTHER"]
    
    A -->|priority| E["PRIORITY:<br/>LOW<br/>NORMAL<br/>HIGH<br/>URGENT"]
    
    A -->|status| F["TICKET_STATUS:<br/>OPEN<br/>IN_PROGRESS<br/>WAITING_CUSTOMER<br/>RESOLVED<br/>CLOSED"]
    
    A -->|has| G["TICKET_INFO"]
    G -->|contains| H["title<br/>description<br/>attachments<br/>reference_id"]
    
    A -->|has many| I["TICKET_RESPONSES"]
    I -->|from| J["Support Staff<br/>OR<br/>Customer"]
    I -->|contains| K["response_text<br/>attachments<br/>timestamp"]
    
    A -->|timestamps| L["created_at<br/>assigned_at<br/>resolved_at<br/>closed_at"]
    
    A -->|SLA| M["SERVICE_LEVEL"]
    M -->|tracks| N["response_time<br/>resolution_time<br/>satisfaction_score"]
```

---

## 13. 📍 DIAGRAMME GÉOLOCALISATION (POSTGIS)

```mermaid
graph TD
    A["STORES<br/>+ GEO_COORDINATES"] -->|has| B["LOCATION:<br/>latitude<br/>longitude"]
    
    B -->|stored as| C["PostGIS POINT<br/>GEOMETRY"]
    
    A -->|enables| D["GEO_QUERIES"]
    D -->|can find| E["Nearby stores<br/>Within radius<br/>Sorted by distance"]
    
    F["BUSINESS_DIRECTORY"] -->|has| G["city<br/>state<br/>coordinates"]
    G -->|used for| H["Location indexing<br/>Search optimization"]
    
    A -->|linked to| I["DELIVERY_ZONES"]
    I -->|defines| J["Service areas<br/>Delivery radius<br/>Delivery time estimate"]
    
    K["ITEMS<br/>location metadata"] -->|for| L["Geo-based<br/>recommendations"]
    M["BOOKINGS<br/>service_location"] -->|enables| N["Find nearby<br/>services"]
```

---

## 14. 🔍 DIAGRAMME RECHERCHE SÉMANTIQUE (EMBEDDINGS + VECTORS)

```mermaid
graph TD
    A["ITEMS<br/>REELS<br/>STORES"] -->|have| B["EMBEDDINGS<br/>(Vector 1024-dim)"]
    
    B -->|stored in| C["PostgreSQL<br/>pgvector extension"]
    
    B -->|generated by| D["JINA AI<br/>OR<br/>GROQ LLM"]
    
    D -->|on| E["Text content:<br/>name<br/>description<br/>tags"]
    
    B -->|enables| F["SEMANTIC_SEARCH"]
    F -->|by| G["Darija voice query<br/>Image query<br/>Text query"]
    
    F -->|returns| H["Similar items<br/>Ranked by<br/>cosine similarity"]
    
    I["SEARCH_QUERIES"] -->|translated| J["Darija → French<br/>or<br/>Arabic"]
    J -->|embedded| K["Vector"]
    K -->|compared with| L["Item vectors"]
    L -->|returns| M["Relevant results"]
    
    N["REELS<br/>recommendations"] -->|based on| O["User preference<br/>vectors"]
```

---

## 15. 💳 DIAGRAMME PAIEMENTS (PAYMENTS)

```mermaid
graph TD
    A["ORDERS<br/>BOOKINGS"] -->|require| B["PAYMENT"]
    
    B -->|has| C["PAYMENT_INFO"]
    C -->|contains| D["amount<br/>currency<br/>method<br/>status"]
    
    B -->|method| E["PAYMENT_METHOD:<br/>CARD<br/>BANK_TRANSFER<br/>CASH_ON_DELIVERY<br/>E_WALLET"]
    
    B -->|status| F["PAYMENT_STATUS:<br/>PENDING<br/>PROCESSING<br/>COMPLETED<br/>FAILED<br/>REFUNDED"]
    
    B -->|provider| G["PAYMENT_GATEWAY"]
    G -->|like| H["Stripe<br/>PayPal<br/>Local Gateway"]
    
    B -->|creates| I["TRANSACTION_RECORD"]
    I -->|tracks| J["transaction_id<br/>timestamp<br/>amount<br/>status"]
    
    B -->|can be| K["REFUND"]
    K -->|creates| L["REFUND_TRANSACTION"]
    L -->|references| M["Original<br/>transaction"]
    
    N["FRAUD_DETECTION"] -->|analyzes| O["Payment patterns<br/>Risk scoring"]
```

---

## 16. 🛡️ DIAGRAMME DÉTECTION DE FRAUDE (FRAUD ANALYSIS)

```mermaid
graph TD
    A["ORDERS<br/>BOOKINGS"] -->|analyzed for| B["FRAUD_ANALYSIS"]
    
    B -->|checks| C["RISK_FACTORS"]
    C -->|includes| D["Order amount<br/>Frequency<br/>Location<br/>Device<br/>Payment method"]
    
    B -->|calculates| E["FRAUD_SCORE<br/>0-100"]
    
    B -->|thresholds| F["DECISION"]
    F -->|score 0-30| G["✅ APPROVED"]
    F -->|score 30-70| H["⚠️ REVIEW"]
    F -->|score 70-100| I["❌ REJECTED"]
    
    B -->|prevention| J["VERIFICATION_RULES"]
    J -->|like| K["Phone verification<br/>Email confirmation<br/>Additional info"]
    
    B -->|tracked by| L["FRAUD_HISTORY"]
    L -->|maintains| M["User risk profile<br/>Device risk profile<br/>IP risk profile"]
    
    B -->|ML analysis| N["PATTERN_DETECTION"]
    N -->|identifies| O["Unusual behavior<br/>Suspected accounts<br/>Coordinated fraud"]
```

---

## 17. 🔐 DIAGRAMME SÉCURITÉ ET PERMISSIONS (RLS - Row Level Security)

```mermaid
graph TD
    A["ROW_LEVEL_SECURITY<br/>(Supabase RLS)"] -->|policies| B["SELECT<br/>INSERT<br/>UPDATE<br/>DELETE"]
    
    B -->|on tables| C["ORDERS:<br/>Users can see own<br/>Stores can see received"]
    
    B -->|on tables| D["ITEMS:<br/>Public read<br/>Owner can update"]
    
    B -->|on tables| E["MESSAGES:<br/>Only participants<br/>can read"]
    
    B -->|on tables| F["BOOKINGS:<br/>Customer or store<br/>can view"]
    
    A -->|with| G["AUTHENTICATION"]
    G -->|checks| H["User ID<br/>User role<br/>JWT token"]
    
    A -->|prevents| I["UNAUTHORIZED_ACCESS"]
    I -->|scenarios| J["User reading<br/>others' orders<br/>Modifying items<br/>Accessing private data"]
    
    K["POLICIES_SQL"] -->|enforced at| L["Database level<br/>Not in application"]
    L -->|meaning| M["Cannot bypass<br/>by API tricks"]
```

---

## 18. 📊 DIAGRAMME ANALYTICS ET STATISTIQUES

```mermaid
graph TD
    A["ANALYTICS"] -->|tracks| B["STORE_METRICS"]
    B -->|includes| C["total_views<br/>total_orders<br/>total_revenue<br/>avg_rating<br/>follower_count"]
    
    A -->|tracks| D["ITEM_METRICS"]
    D -->|includes| E["view_count<br/>order_count<br/>booking_count<br/>rating_average"]
    
    A -->|tracks| F["REEL_STATS"]
    F -->|includes| G["view_count<br/>like_count<br/>comment_count<br/>save_count<br/>share_count"]
    
    A -->|tracks| H["USER_ANALYTICS"]
    H -->|includes| I["login_count<br/>purchase_count<br/>review_count<br/>favorites_count"]
    
    A -->|aggregated from| J["TRANSACTIONAL_LOGS"]
    J -->|every| K["Order placed<br/>Item viewed<br/>Reel liked<br/>Review written"]
    
    A -->|enables| L["DASHBOARDS"]
    L -->|for| M["Store owners:<br/>Revenue, Orders, Traffic<br/>Admin:<br/>Platform health"]
    
    A -->|for| N["RECOMMENDATIONS"]
    N -->|improve| O["Search ranking<br/>Discovery feed<br/>Personalization"]
```

---

## 19. 📝 DIAGRAMME NORMALISATION - FORMES NORMALES

```mermaid
graph TD
    A["DATABASE DESIGN"] -->|follows| B["NORMALIZATION FORMS"]
    
    B -->|1NF<br/>First Normal Form| C["Atomic values<br/>No repeating groups<br/>Each column has<br/>single value"]
    
    B -->|2NF<br/>Second Normal Form| D["Satisfies 1NF<br/>No partial dependencies<br/>Non-key attributes<br/>depend on whole key"]
    
    B -->|3NF<br/>Third Normal Form| E["Satisfies 2NF<br/>No transitive dependencies<br/>Non-key attributes<br/>don't depend on<br/>other non-key attrs"]
    
    C -->|example| F["ITEMS table:<br/>Each row has<br/>unique ID<br/>Single name value"]
    
    D -->|example| G["BOOKINGS table:<br/>Depends on<br/>composite key<br/>customer + service"]
    
    E -->|example| H["STORES table:<br/>Store info separate<br/>from owner info<br/>from location info"]
    
    I["BENEFITS"] -->|of normalization| J["Reduce redundancy<br/>Prevent anomalies<br/>Maintain consistency<br/>Easier updates"]
```

---

## 20. 🔄 DIAGRAMME FLUX DE DONNÉES TRANSACTIONNEL

```mermaid
graph TD
    A["CLIENT<br/>ACTION"] -->|CREATE| B["ORDER"]
    
    B -->|triggers| C["1. Insert ORDER"]
    C -->|generates| D["order_number"]
    
    B -->|creates| E["2. INSERT ORDER_ITEMS"]
    E -->|for each item| F["Quantity x Price"]
    
    B -->|initiates| G["3. PAYMENT_PROCESS"]
    G -->|calls| H["Payment Gateway"]
    H -->|returns| I["payment_status"]
    
    B -->|if payment OK| J["4. UPDATE STOCK"]
    J -->|decrement| K["available_quantity"]
    
    B -->|if payment OK| L["5. CREATE QR_CODE"]
    L -->|generates| M["unique validation code"]
    
    B -->|all steps| N["6. AUDIT_LOG"]
    N -->|records| O["who, what, when, why"]
    
    B -->|success| P["7. NOTIFY STORE"]
    P -->|sends| Q["Order notification"]
    
    B -->|all complete| R["8. NOTIFY CUSTOMER"]
    R -->|sends| S["Order confirmation<br/>+ QR code"]
    
    T["ROLLBACK<br/>ON ERROR"] -->|if any step fails| U["Transaction<br/>cancelled<br/>Stock restored<br/>Payment refunded"]
```

---

## 21. 🏗️ DIAGRAMME ARCHITECTURE DONNÉES - COUCHES

```mermaid
graph TD
    subgraph "Couche Application"
        A["Next.js Frontend<br/>Server Actions<br/>API Routes"]
    end
    
    subgraph "Couche Métier"
        B["Business Logic<br/>Validation<br/>Authorization<br/>Calculations"]
    end
    
    subgraph "Couche Données"
        C["PostgreSQL<br/>Supabase"]
        D["PostGIS<br/>pgvector<br/>RLS"]
    end
    
    subgraph "Couche Cache"
        E["Redis<br/>In-memory cache<br/>10-minute TTL"]
    end
    
    subgraph "Couche Stockage"
        F["Object Storage<br/>Images<br/>Videos<br/>Documents"]
    end
    
    subgraph "Services Externes"
        G["Payment Gateway<br/>AI/LLM<br/>Search Engine<br/>Email Service"]
    end
    
    A -->|queries| B
    B -->|CRUD| C
    C -->|enhanced by| D
    A -->|cache check| E
    E -->|miss| C
    A -->|upload| F
    A -->|integration| G
    
    H["Real-time Updates"] -->|via| I["Supabase Realtime<br/>Subscriptions"]
```

---

## 22. 🔗 DIAGRAMME INDEXATION ET PERFORMANCE

```mermaid
graph TD
    A["DATABASE INDEXES"] -->|on| B["FREQUENTLY QUERIED COLUMNS"]
    
    B -->|ITEM SEARCH| C["items.store_id<br/>items.name<br/>items.slug<br/>items.status"]
    
    B -->|ORDER LOOKUPS| D["orders.customer_id<br/>orders.store_id<br/>orders.status<br/>orders.created_at"]
    
    B -->|BOOKING QUERIES| E["bookings.service_id<br/>bookings.customer_id<br/>bookings.booking_date"]
    
    B -->|MESSAGE SEARCHES| F["messages.sender_id<br/>messages.receiver_id<br/>messages.created_at"]
    
    B -->|TIMESTAMP QUERIES| G["users.created_at<br/>orders.created_at<br/>reels.created_at"]
    
    H["SPECIAL INDEXES"] -->|geo location| I["PostGIS Index<br/>on coordinates<br/>for nearby queries"]
    
    H -->|semantic search| J["pgvector Index<br/>on embeddings<br/>HNSW algorithm"]
    
    H -->|full text search| K["Full-Text Index<br/>on descriptions<br/>for keyword search"]
    
    L["PERFORMANCE"] -->|benefits| M["Faster queries<br/>Reduced scan time<br/>Better user experience"]
```

---

## 23. 🧮 DIAGRAMME AGRÉGATIONS ET DENORMALISATION

```mermaid
graph TD
    A["DENORMALIZATION<br/>STRATEGY"] -->|for performance| B["CACHED AGGREGATES"]
    
    B -->|on ITEMS| C["Cached values:<br/>rating_average<br/>total_reviews<br/>view_count<br/>order_count"]
    
    C -->|updated by| D["TRIGGERS:<br/>After INSERT<br/>After UPDATE<br/>After DELETE<br/>on REVIEWS"]
    
    B -->|on STORES| E["Cached values:<br/>total_views<br/>total_orders<br/>total_revenue<br/>avg_rating"]
    
    E -->|updated by| F["TRIGGERS:<br/>After INSERT<br/>After UPDATE<br/>on ORDERS"]
    
    B -->|on REELS| G["Cached values:<br/>like_count<br/>comment_count<br/>save_count<br/>view_count"]
    
    G -->|updated by| H["TRIGGERS:<br/>After INSERT<br/>After DELETE<br/>on REEL_LIKES/COMMENTS"]
    
    I["RATIONALE"] -->|denormalization| J["Avoid expensive<br/>aggregate queries<br/>Constant read time<br/>Paid with writes"]
```

---

## 24. 📋 DIAGRAMME SCHÉMA COMPLET SIMPLIFIÉ

```mermaid
graph TD
    U["👤 USERS<br/>Tous les utilisateurs"]
    
    S["🏪 STORES<br/>Magasins créés par users"]
    I["📦 ITEMS<br/>Produits/Services<br/>dans les stores"]
    O["🛒 ORDERS<br/>Commandes de produits"]
    B["📅 BOOKINGS<br/>Réservations de services"]
    
    R["⭐ REVIEWS<br/>Avis sur stores/items"]
    F["❤️ FAVORITES<br/>Favoris des users"]
    
    RE["📹 REELS<br/>Videos publiées"]
    M["💬 MESSAGES<br/>Communications"]
    FR["👥 FRIENDSHIPS<br/>Amités entre users"]
    
    T["🎫 TICKETS<br/>Support technique"]
    
    U -->|owns| S
    U -->|creates| I
    U -->|places| O
    U -->|makes| B
    U -->|writes| R
    U -->|marks| F
    U -->|creates| RE
    U -->|sends| M
    U -->|has| FR
    U -->|creates| T
    
    S -->|contains| I
    S -->|receives| O
    S -->|receives| B
    S -->|receives| R
    
    I -->|ordered in| O
    I -->|booked via| B
    I -->|reviewed as| R
    I -->|marked as| F
    
    O -->|likes/comments on| RE
    B -->|likes/comments on| RE
    
    M -->|between| U
    FR -->|connects| U
```

---

## 25. 🔐 DIAGRAMME SÉCURITÉ - AUTHENTIFICATION ET AUTORISATIONS

```mermaid
graph TD
    A["LOGIN"] -->|credentials| B["Supabase Auth"]
    B -->|validates| C["Email + Password"]
    B -->|generates| D["JWT Token"]
    
    D -->|contains| E["Claims:<br/>user_id<br/>role<br/>email<br/>exp"]
    
    E -->|sent in| F["HTTP Header<br/>Authorization: Bearer JWT"]
    
    F -->|on each request| G["API/Server Action"]
    G -->|verifies| H["JWT Signature<br/>Expiration<br/>User exists"]
    
    H -->|extracts| I["User Context:<br/>user_id<br/>role"]
    
    I -->|used in| J["RLS Policies"]
    J -->|at database| K["SELECT: Only owner<br/>UPDATE: Only owner<br/>DELETE: Only owner"]
    
    K -->|ensures| L["Row-level security<br/>User can't bypass<br/>Column encryption"]
    
    M["ROLES"] -->|define permissions| N["USER: Basic access<br/>PRO: Store access<br/>ADMIN: Full access"]
```

---

## 26. 📊 COMPARAISON DES TABLES - TAILLE ET CROISSANCE

```mermaid
graph TD
    A["ESTIMATED<br/>TABLE SIZES"] -->|small tables| B["AUTH_* tables<br/>~ 100s rows"]
    
    A -->|medium tables| C["STORES<br/>BANNERS<br/>SUPPORT_TICKETS<br/>~ 1000s rows"]
    
    A -->|large tables| D["ITEMS<br/>ORDERS<br/>MESSAGES<br/>~ 10000s rows"]
    
    A -->|very large| E["REELS<br/>REEL_COMMENTS<br/>REEL_LIKES<br/>~ 100000s rows"]
    
    F["GROWTH RATE"] -->|daily| G["STORES: +10-100"]
    F -->|daily| H["ITEMS: +100-1000"]
    F -->|daily| I["ORDERS: +1000-10000"]
    F -->|daily| J["REELS: +100-1000"]
    
    K["STORAGE"] -->|total estimate| L["Current: ~50GB<br/>Year 1: ~200GB<br/>Year 2: ~500GB"]
    
    M["ARCHIVAL<br/>STRATEGY"] -->|for old data| N["Archive completed<br/>orders after 2 years<br/>Keep for tax/audit"]
```

---

# 📈 Résumé des Diagrammes SQL

| # | Diagramme | Type | Cas d'Usage |
|---|-----------|------|-----------|
| 1 | ER General | Conceptuel | Vue d'ensemble des entités |
| 2 | Utilisateurs & Auth | Logique | Gestion des utilisateurs |
| 3 | Magasins | Logique | Gestion des stores |
| 4 | Produits/Services | Logique | Gestion de l'inventaire |
| 5 | Commandes | Détaillé | Processus e-commerce |
| 6 | Réservations | Détaillé | Processus de booking |
| 7 | Avis | Logique | Système d'évaluations |
| 8 | Reels & Stories | Détaillé | Contenu social |
| 9 | Messagerie | Logique | Communication |
| 10 | Favoris | Logique | Preferences utilisateurs |
| 11 | Friendships | Logique | Relations sociales |
| 12 | Support Tickets | Détaillé | Service client |
| 13 | Géolocalisation | Spatial | PostGIS queries |
| 14 | Recherche Sémantique | Vecteur | Embeddings & AI |
| 15 | Paiements | Transactionnel | Integration |
| 16 | Fraude | Analytique | ML & scoring |
| 17 | Sécurité RLS | Politique | Access control |
| 18 | Analytics | Analytique | Métriques |
| 19 | Normalisation | Conception | Design principles |
| 20 | Flux Transactionnel | Processus | Transactions ACID |
| 21 | Architecture Couches | Infra | Stack technique |
| 22 | Indexation | Performance | Optimization |
| 23 | Denormalisation | Performance | Caching |
| 24 | Schéma Simplifié | Référence | Vue globale |
| 25 | Sécurité Auth | Protection | Security flow |
| 26 | Taille & Croissance | Monitoring | Capacity planning |

---

**Document généré le**: 17 Mai 2026  
**Diagrammes SQL**: 26 diagrammes  
**Format**: Mermaid diagrams + descriptions  
**Couverture complète**: Structure, Relations, Sécurité, Performance, Analytique
