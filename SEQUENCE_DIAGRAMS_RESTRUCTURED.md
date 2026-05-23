# 🎯 45 DIAGRAMMES DE SÉQUENCES - VERSION RESTRUCTURÉE

**Plateforme Ro2ya - PFE 2026**  
**Format Pédagogique: Processus | Acteurs | Flux | Validation**

---

## 📅 ORGANISATION PAR SPRINTS

### 🏁 SPRINT 1: FONDATIONS & ACCÈS (9 diagrammes)
- Partie 1: Authentification (Diagrammes 1-4)
- Partie 2: Profil & Boutique (Diagrammes 5-9)

### 📦 SPRINT 2: CŒUR DU CATALOGUE (4 diagrammes)
- Partie 3: Catalogue Produits (Diagrammes 10-13)

### 🛒 SPRINT 3: CIRCUIT D'ACHAT (6 diagrammes)
- Partie 4: Circuit Achat (Diagrammes 14-19)

### 🔍 SPRINT 4: RECHERCHE & DÉCOUVERTE (4 diagrammes)
- Partie 5: Recherche Intelligente (Diagrammes 20-23)

### 📱 SPRINT 5: ENGAGEMENT & COMMUNICATION (9 diagrammes)
- Partie 6: Contenu Social (Diagrammes 24-27)
- Partie 7: Communication (Diagrammes 28-30)
- Partie 8: Promotions (Diagrammes 31-32)

### 🧠 SPRINT 6: INTELLIGENCE & ANALYTIQUE (13 diagrammes)
- Partie 9: Dashboard Marchand (Diagrammes 33-38)
- Partie 10: IA & Recommandations (Diagrammes 39-43)
- Partie 11: Sécurité & Analytics (Diagrammes 44-45)

---

# 🏁 SPRINT 1: FONDATIONS & ACCÈS (9 DIAGRAMMES)

# PARTIE 1: AUTHENTIFICATION (4 DIAGRAMMES)

## Diagramme 1: Inscription d'un Nouvel Utilisateur

| Aspect | Détails |
|--------|---------|
| **Processus** | Un nouveau client s'inscrit avec email + mot de passe |
| **Acteurs** | Client App → API Backend → Supabase Auth → PostgreSQL → Email Service |
| **Flux Principal** | Email/PWD reçu → Validation → Hash + Store → Confirmation email |
| **Validation** | Format email (RFC 5322), Force PWD (8+ chars, 1 maj, 1 chiffre), Unique email |
| **Résultat** | ✅ Utilisateur créé avec JWT token + email confirmation envoyé |

**Diagramme Flux ASCII**:
```
Client    →  API /signup     →  Auth DB      →  PostgreSQL   →  Email
 │            │ email,pwd     │              │  │                │
 ├─ POST────→ ├─ Validate    ├─ Hash        ├─ INSERT      ├─ Send confirm
 │            │  format      │   bcrypt     │  users       │  link + token
 │            │              │              │  │            │
 │  Token+200 │◄─────────────┴──────────────┴──┴────────────┴─ Confirmation
 └◄───────────┘
```

---

## Diagramme 2: Connexion Utilisateur

| Aspect | Détails |
|--------|---------|
| **Processus** | Utilisateur se connecte avec identifiants |
| **Acteurs** | Client App → API Backend → Supabase Auth → PostgreSQL → Redis Cache |
| **Flux Principal** | Email/PWD → Lookup → Verification → JWT Gen → Session Cache |
| **Validation** | Email existe, PWD correct (bcrypt compare), Compte actif, Rate limit |
| **Résultat** | ✅ JWT token + Session cache (24h TTL) |

**Conditions**:
- ✅ Identifiants corrects = Token valide
- ❌ Tentatives échouées x3 = Account lock 15min
- ⚠️ Email non confirmé = Accès refusé

---

## Diagramme 3: Réinitialisation du Mot de Passe

| Aspect | Détails |
|--------|---------|
| **Processus** | Utilisateur a oublié son mot de passe |
| **Acteurs** | Client Web → API Backend → PostgreSQL → Email Service → Redis Tokens |
| **Flux Principal** | "Oublié PWD" → Email recherche → Token génération → Lien email → Reset |
| **Validation** | Email existe, Token JWT (1h expiration), Token unique, One-time use |
| **Résultat** | ✅ Mot de passe réinitialisé, token invalidé |

**Étapes**:
1. Client clique "Oublié PWD"
2. Entre email → Système génère JWT (1h)
3. Email sent avec lien reset
4. Client clique lien → Entre nouveau PWD
5. Hash + UPDATE, Token DELETE

---

## Diagramme 4: Déconnexion Utilisateur

| Aspect | Détails |
|--------|---------|
| **Processus** | Utilisateur termine sa session |
| **Acteurs** | Client App → API Backend → Redis Cache → Supabase Auth → PostgreSQL |
| **Flux Principal** | Logout request → Token verify → Session DELETE → Blacklist Token |
| **Validation** | JWT valide, User matching, Session ownership |
| **Résultat** | ✅ Session supprimée, token invalidé, cookies cleared |

**Sécurité**:
- ✅ Logout côté serveur (pas seulement client)
- ✅ Token blacklist (24h)
- ✅ Audit trail enregistré
- ✅ Redirection vers home

---

# PARTIE 2: PROFIL & BOUTIQUE (5 DIAGRAMMES)

## Diagramme 5: Création du Profil Client

| Aspect | Détails |
|--------|---------|
| **Processus** | Client complète son profil après inscription |
| **Acteurs** | Client App → API Backend → Cloudinary (Images) → PostgreSQL → Redis |
| **Flux Principal** | Form (nom, phone, bio) → Validate → Upload image → UPDATE profile → Cache |
| **Validation** | Nom regex (3-50 chars), Phone regex (10-15 digits), Image max 5MB |
| **Résultat** | ✅ Profil complété, avatar stocké, cache 24h |

---

## Diagramme 6: Modification du Profil

| Aspect | Détails |
|--------|---------|
| **Processus** | Utilisateur modifie ses informations |
| **Acteurs** | Client App → API Backend → PostgreSQL → Redis Cache → Cloudinary |
| **Flux Principal** | Changes soumis → Verify JWT → Validate fields → UPDATE → Cache invalidate |
| **Validation** | JWT valide, Ownership check, Field format, Image size |
| **Résultat** | ✅ Profil mis à jour, cache invalidé (force refresh) |

**Pédagogie** 📚: Cache invalidation est CRITIQUE - sans effacer le cache, les autres utilisateurs voient l'ancien profil!

---

## Diagramme 7: Création d'une Boutique

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant crée sa boutique (statut: pending) |
| **Acteurs** | Merchant Dashboard → API Backend → Geoapify → PostgreSQL → Redis |
| **Flux Principal** | Form (nom, addr, logo) → Geocode → Upload images → INSERT shop (pending) |
| **Validation** | Adresse geocodable, Images sécurisées, Status = pending, Admin approval |
| **Résultat** | ✅ Boutique créée (pending), Admin notifié |

**Transaction ACID**:
```sql
BEGIN;
  INSERT INTO shops (status='pending');
  INSERT INTO shop_hours;
  UPDATE geocoding;
COMMIT;
```

---

## Diagramme 8: Recherche de Boutiques par Géolocalisation

| Aspect | Détails |
|--------|---------|
| **Processus** | Client cherche boutiques près de sa position |
| **Acteurs** | Mobile App (GPS) → API Backend → PostgreSQL PostGIS → Redis Cache |
| **Flux Principal** | GPS coords → Check cache → PostGIS query → Sort by distance → Return results |
| **Validation** | Radius valid (max 50km), PostGIS indices utilisés, Cache 1h |
| **Résultat** | ✅ Boutiques actives + distances, affichage carte |

**PostGIS Query**:
```sql
SELECT * FROM shops 
WHERE ST_DWithin(location, ST_Point($lat,$lng), $radius)
AND status='active' AND verified=TRUE
ORDER BY ST_Distance(...) ASC LIMIT 50;
```

---

## Diagramme 9: Suivi d'une Boutique (Follow/Favorite)

| Aspect | Détails |
|--------|---------|
| **Processus** | Client marque une boutique comme favorite |
| **Acteurs** | Client App → API Backend → PostgreSQL → Redis Counter |
| **Flux Principal** | Follow button → Verify JWT → Check duplicate → INSERT follow → Update count |
| **Validation** | JWT valide, UNIQUE constraint (no duplicates), Shop exists |
| **Résultat** | ✅ Boutique suivie, follower_count +1, notifications enables |

---

# 📦 SPRINT 2: CŒUR DU CATALOGUE (4 DIAGRAMMES)

# PARTIE 3: CATALOGUE PRODUITS (4 DIAGRAMMES)

## Diagramme 10: Création d'un Produit

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant ajoute un produit à vendre |
| **Acteurs** | Merchant Dashboard → API Backend → Cloudinary → PostgreSQL → pgvector |
| **Flux Principal** | Product form → Validate → Upload images → INSERT product → Generate embeddings |
| **Validation** | Price ≥ 0, Stock ≥ 0, Images (10 max, 5MB each), Category valide |
| **Résultat** | ✅ Produit actif + embeddings pour recherche vectorielle |

**Embeddings** (1536 dimensions): Transforment titre+desc en vecteurs pour recherche sémantique

---

## Diagramme 11: Modification d'un Produit

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant change prix, stock ou description |
| **Acteurs** | Merchant Dashboard → API Backend → PostgreSQL → Redis Cache |
| **Flux Principal** | Changes soumis → Invalidate cache → Validate → UPDATE → Confirm |
| **Validation** | Ownership check, Price format, Stock integer, Field lengths |
| **Résultat** | ✅ Produit mis à jour, cache invalidé |

---

## Diagramme 12: Suppression d'un Produit

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant retire un produit de la vente |
| **Acteurs** | Merchant Dashboard → API Backend → PostgreSQL → Redis Cache |
| **Flux Principal** | Delete request → Soft delete (status='inactive') → Cache DELETE → Confirm |
| **Validation** | Ownership check, Product exists, Soft delete preferred (audit trail) |
| **Résultat** | ✅ Produit inactif (pas hard delete), historique conservé |

---

## Diagramme 13: Gestion des Images et Catégories

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant organise ses produits par catégories |
| **Acteurs** | Merchant Dashboard → API Backend → Cloudinary → PostgreSQL |
| **Flux Principal** | Select products → Assign category → Upload/reorder images → UPDATE |
| **Validation** | Category prédéfinie, Image count/size valid, Product ownership |
| **Résultat** | ✅ Produits catégorisés, images organisées, recherche optimisée |

---

# 🛒 SPRINT 3: CIRCUIT D'ACHAT (6 DIAGRAMMES)

# PARTIE 4: CIRCUIT ACHAT (6 DIAGRAMMES)

## Diagramme 14: Ajout au Panier

| Aspect | Détails |
|--------|---------|
| **Processus** | Client ajoute un produit au panier |
| **Acteurs** | Client App → API Backend → PostgreSQL cart_items → Redis Cache |
| **Flux Principal** | Product ID + qty → Verify JWT → Check stock → INSERT cart_item → Invalidate cache |
| **Validation** | JWT valide, Product exists, Merchant actif, Stock suffisant, Qty > 0 |
| **Résultat** | ✅ Item au panier, total updated, cart count badge |

**Panier Format**:
- Table: cart_items (user_id, product_id, quantity, price_at_time)
- UNIQUE constraint: une ligne par produit par user
- Cache Redis: TTL 7 jours

---

## Diagramme 15: Modification du Panier

| Aspect | Détails |
|--------|---------|
| **Processus** | Client change quantités ou supprime items |
| **Acteurs** | Client App → API Backend → PostgreSQL → Redis Cache |
| **Flux Principal** | Update qty OR Delete → Invalidate cache → Validate stock → UPDATE → Recalc total |
| **Validation** | Ownership check, Stock check, Qty > 0 or DELETE |
| **Résultat** | ✅ Panier mis à jour, total recalculé, cache invalidé |

---

## Diagramme 16: Validation et Passage de la Commande

| Aspect | Détails |
|--------|---------|
| **Processus** | Client finalise son achat, crée la commande |
| **Acteurs** | Client App → API Backend → PostgreSQL → Redis → Fraud Engine |
| **Flux Principal** | Checkout → Validate items → ACID transaction → INSERT order → Check fraud → Clear cart |
| **Validation** | JWT valide, Stock verificiation (row locks), Address valid, Fraud score |
| **Résultat** | ✅ Commande créée (status pending/confirmed), stock réservé, cart cleared |

**ACID Transaction**:
- Lock products rows (FOR UPDATE)
- Check stock pour chaque item
- INSERT orders table
- INSERT order_items
- UPDATE product quantities
- DELETE cart_items
- Commit ou Rollback

---

## Diagramme 17: Confirmation de Commande

| Aspect | Détails |
|--------|---------|
| **Processus** | Système valide la commande et envoie confirmations |
| **Acteurs** | API Backend → Fraud Engine → PostgreSQL → Email Service → Webhooks |
| **Flux Principal** | Order created → Fraud analysis (8 signals) → Decision → Email confirm + QR → Notify merchant |
| **Validation** | Fraud score < 30% auto-confirm, 30-70% merchant approval, > 70% block |
| **Résultat** | ✅ Commande confirmée, client + merchant notifiés, QR code généré |

**8 Signaux Fraude**:
1. Account age 2. First-time buyer 3. Amount anomaly 4. New address 5. Velocity check 6. IP geolocation 7. Payment method new 8. Disposable email

---

## Diagramme 18: Suivi de la Commande en Temps Réel

| Aspect | Détails |
|--------|---------|
| **Processus** | Client suit l'état de sa commande |
| **Acteurs** | Client App → API Backend → PostgreSQL → WebSocket connection |
| **Flux Principal** | GET /order → Afficher status → Subscribe WebSocket → Real-time updates |
| **Validation** | JWT valide, Order ownership, WebSocket auth, Status valid |
| **Résultat** | ✅ Client voit status en temps réel (confirmed → preparing → ready → pickup) |

**Timeline Tracking**:
- confirmed (15:30)
- preparing (15:45)
- ready_for_pickup (16:00)
- picked_up (16:30)

---

## Diagramme 19: Historique des Commandes avec Filtrage

| Aspect | Détails |
|--------|---------|
| **Processus** | Client consulte l'historique de ses commandes |
| **Acteurs** | Client App → API Backend → PostgreSQL orders table |
| **Flux Principal** | GET /orders → Pagination (limit 20) → Sort (récent first) → Afficher avec details |
| **Validation** | JWT valide, Ownership check, Pagination params valid |
| **Résultat** | ✅ Liste des commandes (date, boutique, montant, status), actions (détail, réavis, récommander) |

---

# 🔍 SPRINT 4: RECHERCHE & DÉCOUVERTE (4 DIAGRAMMES)

# PARTIE 5: RECHERCHE INTELLIGENTE (4 DIAGRAMMES)

## Diagramme 20: Recherche Textuelle

| Aspect | Détails |
|--------|---------|
| **Processus** | Client cherche un produit par mot-clé |
| **Acteurs** | Client App → API Backend → PostgreSQL (FTS) → Darija Dict → Redis Cache |
| **Flux Principal** | Query text → Translate (Darija) → Full-text search → Rank → Cache 1h |
| **Validation** | Query length (2-100 chars), Min term length, Cache check first |
| **Résultat** | ✅ Produits trouvés triés par relevance, synonymes appliqués |

**Full-text Search**:
```sql
SELECT * FROM products 
WHERE to_tsvector('french', name||description) @@ 
      to_tsquery('french', 'couscous|koskous|cuscus')
ORDER BY ts_rank(...) DESC
```

---

## Diagramme 21: Recherche par Image

| Aspect | Détails |
|--------|---------|
| **Processus** | Client cherche un produit en uploadant une photo |
| **Acteurs** | Client App → API Backend → Vision AI → pgvector (embeddings) |
| **Flux Principal** | Upload image → Extract features (vision model) → Generate embedding → Cosine similarity |
| **Validation** | Image format valide, File size < 10MB, Model inference timeout |
| **Résultat** | ✅ Produits similaires trouvés, classés par score de similarité |

---

## Diagramme 22: Recherche Géo-Localisée

| Aspect | Détails |
|--------|---------|
| **Processus** | Client cherche les boutiques près de lui |
| **Acteurs** | Mobile App (GPS) → API Backend → PostgreSQL PostGIS → Redis |
| **Flux Principal** | GPS → Check cache → PostGIS query → Distance calc → Map display |
| **Validation** | GPS valid, Radius constraint (≤ 50km), Cache hit check |
| **Résultat** | ✅ Boutiques actives proches affichées sur carte, sorted by distance |

---

## Diagramme 23: Suggestions Intelligentes

| Aspect | Détails |
|--------|---------|
| **Processus** | Système recommande des produits personnalisés au client |
| **Acteurs** | Client App → API Backend → ML Engine → PostgreSQL → pgvector embeddings |
| **Flux Principal** | User profile → Content-based + Collaborative filtering → Hybrid scoring → Top 12 recommendations |
| **Validation** | User has viewing history, Model trained, Cache 24h |
| **Résultat** | ✅ Recommendations personnalisées (content sim 40%, collab 30%, popularity 20%, geo 10%) |

**Scoring Hybrid**:
- Content-based: similar to what user viewed
- Collaborative: what similar users liked
- Popularity: trending overall
- Geography: near user's city

---

# 📱 SPRINT 5: ENGAGEMENT & COMMUNICATION (9 DIAGRAMMES)

# PARTIE 6: CONTENU SOCIAL (4 DIAGRAMMES)

## Diagramme 24: Création et Publication de Reels

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant crée une vidéo courte pour promouvoir |
| **Acteurs** | Merchant Dashboard → API Backend → Video Storage → PostgreSQL → Redis |
| **Flux Principal** | Record/upload video → Add text/music/filters → Add hashtags → Publish (ou schedule) |
| **Validation** | Video length (15-60s), File size < 500MB, Content moderation |
| **Résultat** | ✅ Reel publié, apparaît sur fil d'accueil des clients de la région |

---

## Diagramme 25: Consultation des Reels

| Aspect | Détails |
|--------|---------|
| **Processus** | Client regarde des vidéos courtes de boutiques |
| **Acteurs** | Client App → API Backend → Video CDN → PostgreSQL (metrics) |
| **Flux Principal** | Open Reels tab → Swipe through videos → Like/comment/share possible |
| **Validation** | User authenticated, Video available, Ownership check |
| **Résultat** | ✅ Engagement recorded (views, likes, shares), client discover new shops |

---

## Diagramme 26: Avis et Notation

| Aspect | Détails |
|--------|---------|
| **Processus** | Client laisse un avis après son achat |
| **Acteurs** | Client App → API Backend → PostgreSQL reviews → Sentiment AI |
| **Flux Principal** | Post-delivery → Rate (5 stars) → Write comment → Optionally add photos → Publish |
| **Validation** | Order purchased, User can review (once per order), Text length reasonable |
| **Résultat** | ✅ Avis publié, compte pour rating moyen, merchants peut répondre |

---

## Diagramme 27: Favoris et Likes

| Aspect | Détails |
|--------|---------|
| **Processus** | Client marque produit/boutique/reel comme favori |
| **Acteurs** | Client App → API Backend → PostgreSQL favorites → Redis counter |
| **Flux Principal** | Double-tap or click heart → INSERT favorite (or DELETE if already liked) → Update counter |
| **Validation** | JWT valide, Item exists, UNIQUE constraint prevent duplicates |
| **Résultat** | ✅ Contenu favorisé, client peut retrouver dans "Mes Favoris", popular content = featured |

---

# PARTIE 7: COMMUNICATION (3 DIAGRAMMES)

## Diagramme 28: Messagerie Entre Client et Commerçant

| Aspect | Détails |
|--------|---------|
| **Processus** | Client envoie un message au commerçant |
| **Acteurs** | Client App → API Backend → PostgreSQL messages → WebSocket (real-time) |
| **Flux Principal** | Open shop → Click message → Type question → Send → Receive notification (merchant) |
| **Validation** | JWT valide, Shop/Merchant exists, Message not empty, Length reasonable |
| **Résultat** | ✅ Message envoyé, historique gardé, notifications pushées, read receipts |

---

## Diagramme 29: Notifications en Temps Réel

| Aspect | Détails |
|--------|---------|
| **Processus** | Client reçoit des alertes sur ses activités |
| **Acteurs** | Event System → Notification Service → Client App (Push/Email/SMS) |
| **Flux Principal** | Event triggered (order status, new message, promo) → Check user preferences → Send notification |
| **Validation** | User opted-in, Preference check, Notification type valid |
| **Résultat** | ✅ Notifications reçues (push, email, SMS based on preference) |

**Notification Types**:
- Commandes (confirmed, preparing, ready, delivered)
- Messages (new reply, support response)
- Boutiques (new reel, promotion, new product)
- Sociales (someone liked your review, someone followed you)

---

## Diagramme 30: Support et Tickets

| Aspect | Détails |
|--------|---------|
| **Processus** | Client a un problème et crée un ticket support |
| **Acteurs** | Client App → API Backend → PostgreSQL tickets → Support Team (Escalation) |
| **Flux Principal** | FAQ → Not found? → Create ticket → Select category → Describe + attach → Submit |
| **Validation** | User authenticated, Category valid, Description length (20-5000 chars) |
| **Résultat** | ✅ Ticket créé avec ID, support team reçoit, client peut track status |

**Catégories**: Order, Payment, Account, Technical, Other

---

# PARTIE 8: PROMOTIONS (2 DIAGRAMMES)

## Diagramme 31: Création de Promotions

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant crée une offre spéciale |
| **Acteurs** | Merchant Dashboard → API Backend → PostgreSQL promotions |
| **Flux Principal** | New promo form → Select type (%, fixed amount, BOGO) → Select products → Set dates → Publish |
| **Validation** | Discount % valid (0-100), Valid date range, Products exist, Ownership |
| **Résultat** | ✅ Promotion active, clients voient badges/prices, cart applies auto |

---

## Diagramme 32: Application de Promo au Panier

| Aspect | Détails |
|--------|---------|
| **Processus** | Client utilise une promotion |
| **Acteurs** | Client App → API Backend → PostgreSQL (promo check) → Order |
| **Flux Principal** | Promo visible on product → Add to cart → Checkout → Promo auto-applied → Final price |
| **Validation** | Promo still active, Product in promo, Min amount requirement, Date valid |
| **Résultat** | ✅ Discount applied to order, saved amount shown, order confirmed with reduced price |

---

# 🧠 SPRINT 6: INTELLIGENCE & ANALYTIQUE (13 DIAGRAMMES)

# PARTIE 9: DASHBOARD MARCHAND (6 DIAGRAMMES)

## Diagramme 33: Accès au Tableau de Bord

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant accède à son dashboard |
| **Acteurs** | Merchant Browser → API Backend → Data aggregation → UI Render |
| **Flux Principal** | Login → Dashboard link → Load overview widgets → Display menu sections |
| **Validation** | JWT valide, Role = merchant, Shop exists |
| **Résultat** | ✅ Dashboard affiche: commandes du jour, revenus, score avis, clients actifs |

**Menu Sections**: Accueil, Produits, Commandes, Statistiques, Reels, Avis, Revenus, Paramètres

---

## Diagramme 34: Consultation des Statistiques de Ventes

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant analyse ses ventes (daily, weekly, monthly) |
| **Acteurs** | Merchant Dashboard → API Backend → PostgreSQL aggregations → Redis cache (6h) |
| **Flux Principal** | Select period (30d default) → Check cache → Aggregate sales data → Top products → Metrics |
| **Validation** | Period valid, Cache TTL check, Data accuracy |
| **Résultat** | ✅ Dashboard shows: daily revenue, top products, customer count, conversion rate, growth % |

**KPIs**:
- Daily revenue chart
- Top 10 products
- Unique customers
- New vs returning
- Conversion rate (views → orders)
- Revenue growth (vs last period)

---

## Diagramme 35: Analyse de Performance des Produits

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant voit lesquels produits se vendent le mieux |
| **Acteurs** | Merchant Dashboard → API Backend → PostgreSQL (order_items) |
| **Flux Principal** | View products list → Sort by (qty sold, revenue, rating, views) → Actionable insights |
| **Validation** | Ownership check, Period valid, Sort field valid |
| **Résultat** | ✅ Products ranked, shows: qty sold, revenue, rating, favorites, views |

**Actions**: Increase stock of best sellers, improve low-rated products, reduce low-selling items

---

## Diagramme 36: Gestion des Stocks, Prix et Promotions

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant met à jour stocks, prix et promotions |
| **Acteurs** | Merchant Dashboard → API Backend → PostgreSQL (products, promotions) |
| **Flux Principal** | Products list → Edit qty/price → Apply changes → Or create new promotion |
| **Validation** | Ownership, Price format, Stock non-negative, Promo dates valid |
| **Résultat** | ✅ Stocks/prices updated real-time, promotions active, clients see immediately |

---

## Diagramme 37: Suivi des Leads et Conversion Clients

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant suit le parcours client (visitor → buyer) |
| **Acteurs** | Merchant Dashboard → Analytics Engine → PostgreSQL conversion events |
| **Flux Principal** | View funnel (visitors → viewers → cart-adders → buyers) → Identify drop-off points |
| **Validation** | Data aggregation accurate, Period valid |
| **Résultat** | ✅ Conversion rate shown, drop-off points identified, improvement suggestions |

**Metrics**:
- Visitors today: 100
- Product viewers: 70 (70%)
- Cart additions: 25 (25%)
- Orders: 15 (15%)
- Conversion: 15%

---

## Diagramme 38: Suivi des Remboursements

| Aspect | Détails |
|--------|---------|
| **Processus** | Commerçant gère les demandes de remboursement |
| **Acteurs** | Client App + Merchant Dashboard → API Backend → PostgreSQL refunds |
| **Flux Principal** | Client requests refund (with reason/photos) → Merchant reviews → Approve/Deny → Payment processed |
| **Validation** | Order ownership, Refund reason valid, Merchant approval or Auto-process |
| **Résultat** | ✅ Refund approved, money returned to customer within 5 business days |

---

# PARTIE 10: IA & RECOMMANDATIONS (5 DIAGRAMMES)

## Diagramme 39: Recommandations Produits Personnalisés

| Aspect | Détails |
|--------|---------|
| **Processus** | Système recommande des produits au client |
| **Acteurs** | Client App → API Backend → ML Recommendation Engine → pgvector embeddings |
| **Flux Principal** | User profile analysis → Content-based filtering → Collaborative filtering → Hybrid scoring |
| **Validation** | User has history, Model trained, Cache 24h |
| **Résultat** | ✅ Top 12 personalized recommendations, different reasons per user |

**Stratégies**:
1. Content-based: Similar to user's past interests
2. Collaborative: What similar users liked
3. Popularity: What's trending
4. Geography: Shops near user
5. Diversity: Mix of different categories

---

## Diagramme 40: Suggestions Produits Complémentaires

| Aspect | Détails |
|--------|---------|
| **Processus** | IA suggère des produits qui vont avec celui sélectionné |
| **Acteurs** | Client App → API Backend → Association Engine (product pairs) |
| **Flux Principal** | Product selected → Find frequently bought together (FBT) → Suggest complementary items |
| **Validation** | Association data available, Product relevance score > threshold |
| **Résultat** | ✅ "Clients achètent aussi..." suggestions, cart value increase |

**Example**: "Vous regardez Couscous → Voulez-vous aussi Sauce (+5 DT)?"

---

## Diagramme 41: Prédiction de Demande et Prix Optimal

| Aspect | Détails |
|--------|---------|
| **Processus** | IA prédite la demande et recommande les meilleurs prix |
| **Acteurs** | Merchant Dashboard → Analytics Engine → ML Price Optimizer → PostgreSQL data |
| **Flux Principal** | Analyze sales history (90d) → Demand prediction → Price elasticity → Recommend optimal price |
| **Validation** | Historical data available (30+ days), Prediction confidence > 70% |
| **Résultat** | ✅ Merchant sees price recommendations + estimated impact on revenue |

**Insights**:
- "Lower price to 45 DT = +1250 DT revenue"
- "Stock shortage Friday = increase supply"
- "Kesra product abandoned = reintroduce due to demand"

---

## Diagramme 42: Génération Automatique de Descriptions

| Aspect | Détails |
|--------|---------|
| **Processus** | IA génère les descriptions de produits |
| **Acteurs** | Merchant Dashboard → API Backend → LLM (OpenRouter) → PostgreSQL |
| **Flux Principal** | Upload product image + brief description → AI generates full description → Merchant reviews → Publish |
| **Validation** | Image provided, Brief description min 3 words, LLM inference successful |
| **Résultat** | ✅ Professional descriptions in seconds, merchant can edit or regenerate |

---

## Diagramme 43: Analyse de Sentiment des Avis

| Aspect | Détails |
|--------|---------|
| **Processus** | IA analyse les avis clients pour détecter tendances |
| **Acteurs** | Merchant Dashboard → Sentiment Analysis Engine → NLP model → Insights |
| **Flux Principal** | Reviews submitted → Sentiment classification (positive/neutral/negative) → Aggregate insights |
| **Validation** | Reviews available (10+ for meaningful analysis), Model confidence > 60% |
| **Résultat** | ✅ Sentiment dashboard: % positive/negative, key complaint topics, recommendations |

**Metrics**:
- 60% Positive (happy customers)
- 25% Neutral (satisfied)
- 15% Negative (issues: slow service)

---

# PARTIE 11: SÉCURITÉ & ANALYTICS (2 DIAGRAMMES)

## Diagramme 44: Détection de Fraude

| Aspect | Détails |
|--------|---------|
| **Processus** | Système détecte les commandes suspectes |
| **Acteurs** | API Backend → Fraud Detection Engine → Decision Logic → PostgreSQL |
| **Flux Principal** | Order submitted → Score on 8 signals → Risk calculation → Auto-approve or flag or block |
| **Validation** | All signals checklist, Score > 0% and < 100%, Decision logic applied |
| **Résultat** | ✅ < 30% risk = auto-approve, 30-70% = merchant reviews, > 70% = block |

**8 Fraud Signals**:
1. New account
2. First purchase ever
3. Unusually high amount
4. New delivery address
5. Velocity (many orders fast)
6. IP geolocation mismatch
7. New payment method
8. Disposable email

---

## Diagramme 45: Analytics IA - Tendances et Insights Vendeur

| Aspect | Détails |
|--------|---------|
| **Processus** | IA génère des insights quotidiens pour le commerçant |
| **Acteurs** | Analytics Engine → ML Insights Generator → Email/Dashboard |
| **Flux Principal** | Daily data collection → Trend analysis → Anomaly detection → Generate insights & recommendations |
| **Validation** | Data quality check, Trend significance threshold, Confidence score |
| **Résultat** | ✅ Weekly & monthly reports, alerts on important changes, actionable recommendations |

**Types d'Insights**:
- Sales trends ("Sales down 15% → competitor launched promo")
- Best times ("Sell best after 12h → promo at 11:30")
- Content performance ("Cooking videos = 3x views")
- Customer behavior ("20% abandon at checkout → shipping fees too high")
- Competitor analysis ("New competitor nearby → adjust pricing")

---

---

# 📊 TABLEAU RÉCAPITULATIF

| Sprint | Phase | Diagrammes | Total |
|--------|-------|-----------|-------|
| 1 | Authentification | 1-4 | 4 |
| 1 | Profil & Boutique | 5-9 | 5 |
| 2 | Catalogue | 10-13 | 4 |
| 3 | Achat | 14-19 | 6 |
| 4 | Recherche | 20-23 | 4 |
| 5 | Social | 24-27 | 4 |
| 5 | Communication | 28-30 | 3 |
| 5 | Promotions | 31-32 | 2 |
| 6 | Dashboard | 33-38 | 6 |
| 6 | IA & Recommandations | 39-43 | 5 |
| 6 | Sécurité & Analytics | 44-45 | 2 |
| **TOTAL** | | **1-45** | **45** |

---

# 🎓 STRUCTURE STANDARDISÉE

Chaque diagramme suit ce format équilibré:

```
┌─────────────────────────────────────────────┐
│ 1. TITRE & NUMÉRO                           │
├─────────────────────────────────────────────┤
│ 2. TABLEAU (Processus | Acteurs | Flux)     │
├─────────────────────────────────────────────┤
│ 3. DESCRIPTION DÉTAILLÉE (si complexe)      │
├─────────────────────────────────────────────┤
│ 4. RÉSULTAT FINAL & VALIDATION              │
└─────────────────────────────────────────────┘
```

---

# ✅ OBJECTIFS ATTEINTS

- ✅ **45 diagrammes** organisés en 6 sprints
- ✅ **Noms exacts** du fichier éducatif
- ✅ **Structure uniforme**: Processus | Acteurs | Flux | Validation
- ✅ **Acteurs équilibrés**: Descriptifs sans jargon excessif
- ✅ **Format pédagogique**: Facile à comprendre
- ✅ **Basé sur le code réel**: APIs, BD, logique métier
- ✅ **Sans diagrammes de paiement pure**: Focus sur logique métier
- ✅ **Prêt pour rapport PFE**: Documentation professionnelle

---

*Document généré pour la plateforme Ro2ya - PFE 2026 - Université de Tunis*
