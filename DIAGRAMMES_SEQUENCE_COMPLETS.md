# 📋 Diagrammes de Séquence Complets — Ro2ya Marketplace

**Plateforme:** Ro2ya — Marketplace Tunisienne (Web + Mobile + Admin SaaS)  
**Date:** Mai 2026 | **Rapport PFE - GLSI**

> Ce fichier contient **28 diagrammes de séquence** couvrant les 3 plateformes du projet Ro2ya.

---

## 📑 Table des Matières

| # | Diagramme | Plateforme |
|---|-----------|------------|
| 1 | Inscription (Signup) | Web / Mobile |
| 2 | Connexion (Login) | Web / Mobile |
| 3 | Récupération mot de passe | Web |
| 4 | Création d'un établissement | Web |
| 5 | Approbation boutique par Admin | Admin SaaS |
| 6 | Création de commande | Web / Mobile |
| 7 | Validation commande + QR Code | Web |
| 8 | Scan QR Code à la livraison | Web |
| 9 | Annulation commande | Web |
| 10 | Réservation de service | Web / Mobile |
| 11 | Confirmation réservation | Web |
| 12 | Complétion d'une réservation | Web |
| 13 | Recherche sémantique hybride | Web / Mobile |
| 14 | Recherche par image (Vision IA) | Web |
| 15 | Publication d'un Reel | Web |
| 16 | Like / Interaction sur un Reel | Web / Mobile |
| 17 | Publication d'une Story | Web |
| 18 | Messagerie Client ↔ Commerçant | Web / Mobile |
| 19 | Soumission d'un avis client | Web / Mobile |
| 20 | Réponse du commerçant à un avis | Web |
| 21 | Enregistrer un établissement (Favoris) | Web / Mobile |
| 22 | Notification temps réel (Supabase) | Web / Mobile |
| 23 | Assistant IA conversationnel | Web |
| 24 | Dashboard analytique commerçant | Web |
| 25 | Gestion des utilisateurs (Admin) | Admin SaaS |
| 26 | Ticket de support | Web / Admin |
| 27 | Abonnement commerçant | Web |
| 28 | Synchronisation asynchrone QStash | Backend |

---

## 1️⃣ Inscription (Signup)

**Acteurs:** Client/Commerçant, Application Web/Mobile, Supabase Auth, DB (users)

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant APP as Application (Web/Mobile)
    participant RL as Rate Limiter (Upstash)
    participant AUTH as Supabase Auth
    participant DB as PostgreSQL (users)
    participant NOTIF as Notifications

    U->>APP: Remplit formulaire (nom, email, mot de passe, rôle)
    APP->>RL: Vérifier limite (3 inscriptions/heure par IP)
    alt Limite dépassée
        RL-->>APP: 429 Too Many Requests
        APP-->>U: ❌ Trop de tentatives. Réessayez plus tard.
    else OK
        RL-->>APP: ✅ Autorisé
        APP->>AUTH: supabase.auth.signUp({ email, password })
        AUTH->>AUTH: Crée l'utilisateur dans auth.users
        AUTH->>AUTH: Envoie email de confirmation
        AUTH-->>APP: { user, session }
        APP->>DB: INSERT INTO users (id, role, full_name, ...)
        DB-->>APP: ✅ Profil créé
        APP->>NOTIF: createNotification(userId, "Bienvenue sur Ro2ya !")
        APP-->>U: ✅ Inscription réussie — Email de confirmation envoyé
    end
```

---

## 2️⃣ Connexion (Login)

**Acteurs:** Utilisateur, Application, Supabase Auth, DB (users, stores)

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant APP as Application
    participant RL as Rate Limiter (Upstash Redis)
    participant AUTH as Supabase Auth
    participant DB as PostgreSQL

    U->>APP: Email + Mot de passe
    APP->>RL: Vérifier (5 tentatives / 15 min / IP)
    alt Bloqué
        RL-->>APP: 429 - Bloqué
        APP-->>U: ❌ Compte temporairement bloqué
    else Autorisé
        APP->>AUTH: supabase.auth.signInWithPassword(email, password)
        alt Identifiants incorrects
            AUTH-->>APP: AuthError
            APP-->>U: ❌ Email ou mot de passe incorrect
        else Connexion réussie
            AUTH-->>APP: { user, session, access_token }
            APP->>DB: SELECT role FROM users WHERE id = user.id
            DB-->>APP: role = 'admin' | 'PRO' | 'CLIENT'
            alt Rôle = admin
                APP-->>U: 🔀 Redirection → /admin/dashboard
            else Rôle = PRO
                APP->>DB: SELECT id FROM stores WHERE owner_id = user.id
                DB-->>APP: store.id
                APP-->>U: 🔀 Redirection → /dashboard/[storeId]
            else Rôle = CLIENT
                APP-->>U: 🔀 Redirection → / (Accueil)
            end
        end
    end
```

---

## 3️⃣ Récupération du Mot de Passe

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant APP as Application Web
    participant AUTH as Supabase Auth
    participant EMAIL as Service Email

    U->>APP: Clique "Mot de passe oublié" → saisit email
    APP->>AUTH: supabase.auth.resetPasswordForEmail(email)
    AUTH->>EMAIL: Envoie email avec lien de réinitialisation (OTP)
    EMAIL-->>U: 📧 Email de réinitialisation reçu
    U->>APP: Clique sur le lien → saisit nouveau mot de passe
    APP->>AUTH: supabase.auth.updateUser({ password: newPassword })
    AUTH-->>APP: ✅ Mot de passe mis à jour
    APP-->>U: ✅ Mot de passe réinitialisé — Redirection vers /login
```

---

## 4️⃣ Création d'un Établissement (Commerçant)

```mermaid
sequenceDiagram
    actor PRO as Commerçant
    participant APP as Dashboard Web
    participant AUTH as Supabase Auth
    participant STORAGE as Supabase Storage
    participant DB as PostgreSQL (stores)
    participant ADMIN as Administrateur

    PRO->>APP: Remplit formulaire (nom, catégorie, adresse, GPS, RNE...)
    PRO->>APP: Upload logo + bannière + documents (licence, CIN)
    APP->>AUTH: Vérifie session utilisateur
    AUTH-->>APP: user.id (rôle PRO)
    APP->>STORAGE: Upload fichiers → buckets (logos/, documents/)
    STORAGE-->>APP: URLs publiques des fichiers
    APP->>DB: INSERT INTO stores { owner_id, name, category, status:'PENDING', logo_url, ... }
    DB-->>APP: { store.id }
    APP-->>PRO: ✅ Boutique créée — En attente de validation Admin
    Note over DB,ADMIN: L'admin reçoit une alerte pour validation
```

---

## 5️⃣ Approbation d'une Boutique par l'Admin

```mermaid
sequenceDiagram
    actor ADMIN as Administrateur
    participant SAAS as Plateforme Admin SaaS
    participant API as Django REST API
    participant DB as PostgreSQL (stores)
    participant NOTIF as Notifications
    actor PRO as Commerçant

    ADMIN->>SAAS: Consulte liste des boutiques PENDING
    SAAS->>API: GET /api/businesses?status=PENDING
    API->>DB: SELECT * FROM stores WHERE status = 'PENDING'
    DB-->>API: Liste des boutiques en attente
    API-->>SAAS: Données boutiques
    SAAS-->>ADMIN: Affiche liste avec documents
    ADMIN->>SAAS: Examine documents → Clique "Approuver"
    SAAS->>API: PATCH /api/businesses/{id} { status: 'APPROVED' }
    API->>DB: UPDATE stores SET status='APPROVED', verified_at=now()
    DB-->>API: ✅ Mis à jour
    API->>DB: INSERT INTO notifications (user_id=owner_id, type='SYSTEM', title='Boutique approuvée !')
    DB-->>PRO: 🔔 Notification temps réel via Supabase Realtime
    API-->>SAAS: ✅ Boutique approuvée
    SAAS-->>ADMIN: ✅ Confirmation
```

---

## 6️⃣ Création d'une Commande (Client)

```mermaid
sequenceDiagram
    actor C as Client
    participant APP as Application Web/Mobile
    participant AUTH as Supabase Auth
    participant DB as PostgreSQL
    participant QSTASH as Upstash QStash
    participant PRO as Commerçant

    C->>APP: Clique "Commander" sur un produit
    APP->>AUTH: Vérifie session
    alt Non connecté
        AUTH-->>APP: Pas de session
        APP-->>C: ❌ Redirection → /login
    else Connecté
        AUTH-->>APP: user.id
        APP->>DB: Vérifier que le client ≠ propriétaire du store
        APP->>DB: Vérifier commande PENDING existante pour cet article
        alt Déjà une commande PENDING
            DB-->>APP: Commande existante (ORD-XXXXX)
            APP-->>C: ❌ Une commande est déjà en attente
        else OK
            APP->>DB: Générer order_number = "ORD-{timestamp}-{random}"
            APP->>DB: INSERT INTO orders { status:'PENDING', customer_id, store_id, item_id, ... }
            DB-->>APP: { order.id, order_number }
            APP->>DB: INSERT INTO notifications (store_owner, type='ORDER', "Nouvelle commande !")
            APP->>QSTASH: PublishJSON → /api/workers/sync-order (retry automatique)
            QSTASH-->>PRO: 🔔 Notification async
            APP-->>C: ✅ Commande créée (ORD-XXXXXX)
        end
    end
```

---

## 7️⃣ Validation de Commande + Génération QR Code

```mermaid
sequenceDiagram
    actor PRO as Commerçant
    participant DASH as Dashboard Commerçant
    participant DB as PostgreSQL
    participant NOTIF as Notifications
    actor C as Client

    PRO->>DASH: Consulte commandes PENDING
    DASH->>DB: SELECT * FROM orders WHERE store_id=X AND status='PENDING'
    DB-->>DASH: Liste commandes
    DASH-->>PRO: Affiche commandes en attente
    PRO->>DASH: Clique "Valider" sur une commande
    DASH->>DB: Générer tracking_code = "QR-{timestamp}-{random}"
    DASH->>DB: UPDATE orders SET status='VALIDATED', tracking_code=QR, validated_at=now()
    DASH->>DB: UPDATE items SET stock_quantity = stock_quantity - quantity (decrementStock)
    DB-->>DASH: ✅ Stock mis à jour
    DASH->>DB: INSERT INTO transactions { order_number, qr_code_token, status:'completed' }
    DASH->>NOTIF: createNotification(customer_id, "Commande validée ! QR: QR-XXXXX")
    DB-->>C: 🔔 Notification Realtime
    DASH-->>PRO: ✅ Commande validée — QR Code généré
```

---

## 8️⃣ Scan QR Code à la Livraison

```mermaid
sequenceDiagram
    actor C as Client
    actor PRO as Commerçant
    participant APP as Application
    participant DB as PostgreSQL
    participant NOTIF as Notifications

    C->>PRO: Présente le QR Code (tracking_code)
    PRO->>APP: Scanne / Saisit le code QR dans /valider
    APP->>DB: SELECT * FROM orders WHERE tracking_code = 'QR-XXXXX'
    alt Code invalide
        DB-->>APP: Aucun résultat
        APP-->>PRO: ❌ Code QR invalide
    else Commande trouvée
        DB-->>APP: Commande { status:'VALIDATED', customer_name, items }
        APP-->>PRO: Affiche détails de la commande
        PRO->>APP: Confirme la livraison
        APP->>DB: UPDATE orders SET status='COMPLETED', completed_at=now()
        APP->>DB: UPDATE transactions SET status='completed', time_delivered=now()
        APP->>NOTIF: createNotification(customer_id, "Commande livrée ✅")
        DB-->>C: 🔔 Notification temps réel
        APP-->>PRO: ✅ Livraison confirmée
    end
```

---

## 9️⃣ Annulation d'une Commande

```mermaid
sequenceDiagram
    actor U as Client ou Commerçant
    participant APP as Application
    participant DB as PostgreSQL
    participant NOTIF as Notifications

    U->>APP: Clique "Annuler" sur une commande
    APP->>DB: SELECT status FROM orders WHERE id = orderId
    alt Statut = COMPLETED
        DB-->>APP: status = COMPLETED
        APP-->>U: ❌ Impossible d'annuler une commande livrée
    else Annulation possible
        DB-->>APP: status = PENDING ou VALIDATED
        APP->>DB: UPDATE orders SET status='CANCELLED', updated_at=now()
        alt Stock à restituer (si VALIDATED)
            APP->>DB: UPDATE items SET stock_quantity = stock_quantity + quantity
        end
        APP->>NOTIF: Notifier l'autre partie (client ou commerçant)
        APP-->>U: ✅ Commande annulée
    end
```

---

## 🔟 Réservation d'un Service (Client)

```mermaid
sequenceDiagram
    actor C as Client
    participant APP as Application Web/Mobile
    participant DB as PostgreSQL (bookings, items)
    participant NOTIF as Notifications
    actor PRO as Prestataire

    C->>APP: Sélectionne un service → Choisit date/heure/durée
    APP->>DB: Vérifier disponibilité (service_schedules)
    DB-->>APP: Créneau disponible
    APP->>DB: Générer booking_number = "BKG-{timestamp}-{random}"
    APP->>DB: INSERT INTO bookings { status:'PENDING', item_id, customer_id, store_id, booking_date, start_time, price... }
    DB-->>APP: { booking.id, booking_number }
    APP->>DB: UPDATE items SET booking_count = booking_count + 1
    APP->>NOTIF: createNotification(store_owner, type='BOOKING', "Nouvelle réservation !")
    DB-->>PRO: 🔔 Notification temps réel
    APP-->>C: ✅ Réservation créée (BKG-XXXXXX) — En attente de confirmation
```

---

## 1️⃣1️⃣ Confirmation d'une Réservation

```mermaid
sequenceDiagram
    actor PRO as Prestataire
    participant DASH as Dashboard
    participant DB as PostgreSQL
    participant NOTIF as Notifications
    actor C as Client

    PRO->>DASH: Consulte réservations PENDING
    DASH->>DB: SELECT * FROM bookings WHERE store_id=X AND status='PENDING'
    DB-->>DASH: Liste des réservations
    PRO->>DASH: Clique "Confirmer" sur une réservation
    DASH->>DB: UPDATE bookings SET status='CONFIRMED', confirmed_at=now()
    DASH->>NOTIF: createNotification(customer_id, "Réservation confirmée ✅")
    DB-->>C: 🔔 Notification temps réel
    DASH-->>PRO: ✅ Réservation confirmée
    Note over PRO,C: Le client peut maintenant se présenter
```

---

## 1️⃣2️⃣ Complétion d'une Réservation (Service Terminé)

```mermaid
sequenceDiagram
    actor PRO as Prestataire
    participant DASH as Dashboard
    participant DB as PostgreSQL (bookings, transactions)
    participant NOTIF as Notifications
    actor C as Client

    PRO->>DASH: Marque la réservation comme terminée
    DASH->>DB: UPDATE bookings SET status='COMPLETED', completed_at=now()
    DASH->>DB: INSERT INTO transactions { booking_id, amount, status:'completed' }
    DB-->>DASH: ✅ Transaction enregistrée
    DASH->>NOTIF: createNotification(customer_id, "Service terminé — Laissez un avis !")
    DB-->>C: 🔔 Notification + invitation à évaluer
    DASH-->>PRO: ✅ Prestation marquée comme terminée
```

---

## 1️⃣3️⃣ Recherche Sémantique Hybride (7 étapes)

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant APP as Application
    participant API as /api/semantic-search
    participant DICT as Dictionnaire Darija Local
    participant LLM as Groq API (Llama)
    participant EMBED as Modèle Embeddings
    participant DB as PostgreSQL (pgvector)

    U->>APP: Saisit requête (ex: "chwaya dial coiffure")
    APP->>API: POST /api/semantic-search { query, city, category }

    Note over API: Étape 1 — Pré-normalisation locale
    API->>DICT: Normaliser Darija → dict local
    DICT-->>API: "coiffure" (partiel)

    Note over API: Étape 2 — Normalisation LLM
    API->>LLM: Traduire/normaliser requête Darija → Français
    LLM-->>API: "salon de coiffure"

    Note over API: Étape 3 — Expansion synonymes
    API->>LLM: Générer synonymes et termes liés
    LLM-->>API: ["coiffeur", "salon beauté", "barbier"]

    Note over API: Étape 4 — Génération Embedding
    API->>EMBED: Encoder "salon de coiffure" → vecteur [1024 dims]
    EMBED-->>API: embedding vector

    Note over API: Étape 5 — Recherche Hybride
    API->>DB: RPC search_items_semantic(embedding, city, category)
    API->>DB: SELECT items WHERE name ILIKE '%coiffure%' (textuel)
    DB-->>API: Résultats vectoriels + textuels

    Note over API: Étape 6 — Fusion RRF
    API->>API: Algorithme Reciprocal Rank Fusion (RRF)
    Note over API: Étape 7 — Re-ranking IA
    API->>LLM: Re-classer résultats selon pertinence
    LLM-->>API: Résultats re-classés

    API-->>APP: JSON { results[], total }
    APP-->>U: Affiche résultats pertinents
```

---

## 1️⃣4️⃣ Recherche par Image (Vision IA)

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant APP as Application Web
    participant API as /api/vision-search
    participant LLM as Groq Vision API
    participant SEARCH as /api/semantic-search
    participant DB as PostgreSQL

    U->>APP: Upload une photo (ex: photo d'un plat)
    APP->>API: POST /api/vision-search { image: base64 }
    API->>LLM: Analyser image → extraire description textuelle
    LLM-->>API: "tajine d'agneau aux légumes, cuisine tunisienne"
    API->>SEARCH: POST /api/semantic-search { query: description }
    SEARCH->>DB: Recherche hybride (vecteur + texte)
    DB-->>SEARCH: Résultats restaurants/plats similaires
    SEARCH-->>API: Résultats classés
    API-->>APP: Résultats de recherche visuelle
    APP-->>U: Affiche établissements proposant ce type de plat
```

---

## 1️⃣5️⃣ Publication d'un Reel (Commerçant)

```mermaid
sequenceDiagram
    actor PRO as Commerçant
    participant DASH as Dashboard Web
    participant CLOUD as Cloudinary API
    participant DB as PostgreSQL (reels, reel_stats)

    PRO->>DASH: Sélectionne fichier (image/vidéo) + titre + CTA
    DASH->>CLOUD: POST upload { file, upload_preset:'ro2ya_reels' }
    CLOUD-->>DASH: secure_url (Cloudinary CDN)
    DASH->>DB: INSERT INTO reels { store_id, media_path, media_type, title, cta_type, status:'active' }
    DB-->>DASH: reel.id
    DASH->>DB: INSERT INTO reel_stats { reel_id, views:0, likes:0 }
    DASH-->>PRO: Reel publié avec succès
```

---

## 1️⃣6️⃣ Like / Interaction sur un Reel

```mermaid
sequenceDiagram
    actor C as Client
    participant APP as Application
    participant DB as PostgreSQL (user_interactions, reel_stats)

    C->>APP: Like un Reel
    APP->>DB: SELECT id FROM user_interactions WHERE user_id=X AND reel_id=Y AND type='like'
    alt Interaction existante
        DB-->>APP: found
        APP->>DB: DELETE FROM user_interactions WHERE id = existing.id
        APP-->>C: Like retiré
    else Nouveau like
        APP->>DB: INSERT INTO user_interactions { user_id, reel_id, type:'like' }
        APP->>DB: RPC increment_reel_like(reel_id)
        APP-->>C: Reel liké
    end
```

---

## 1️⃣7️⃣ Publication d'une Story (24h)

```mermaid
sequenceDiagram
    actor PRO as Commerçant
    participant DASH as Dashboard Web
    participant STORAGE as Supabase Storage
    participant DB as PostgreSQL (stories)

    PRO->>DASH: Sélectionne image/vidéo + caption
    DASH->>STORAGE: Upload vers bucket stories/
    STORAGE-->>DASH: URL publique
    DASH->>DB: INSERT INTO stories { store_id, author_id, media_url, caption, expires_at: now()+24h }
    DB-->>DASH: story.id
    DASH-->>PRO: Story publiée — Expire dans 24h
    Note over DB: Cron supprime automatiquement les stories expirées
```

---

## 1️⃣8️⃣ Messagerie Client-Commerçant (Temps Réel)

```mermaid
sequenceDiagram
    actor C as Client
    participant APPC as App Client
    participant RT as Supabase Realtime
    participant DB as PostgreSQL (messages)
    participant APPD as Dashboard Commerçant
    actor PRO as Commerçant

    C->>APPC: Ouvre chat avec un commerçant
    APPC->>RT: Subscribe channel messages:{store_id}_{client_id}
    RT-->>APPC: Canal WebSocket ouvert
    C->>APPC: Envoie un message
    APPC->>DB: INSERT INTO messages { sender_id, receiver_id, content, store_id, is_read:false }
    DB->>RT: Broadcast nouveau message
    RT-->>APPD: Message reçu en temps réel
    APPD-->>PRO: Affiche message dans le support
    PRO->>APPD: Répond au message
    APPD->>DB: INSERT INTO messages { sender_id=PRO, receiver_id=C, content }
    DB->>RT: Broadcast réponse
    RT-->>APPC: Réponse reçue
    APPC-->>C: Affiche la réponse
```

---

## 1️⃣9️⃣ Soumission d'un Avis Client

```mermaid
sequenceDiagram
    actor C as Client
    participant APP as Application
    participant DB as PostgreSQL (reviews, orders, bookings, stores)

    C->>APP: Clique "Laisser un avis"
    APP->>DB: Vérifier commande ou réservation COMPLETED pour ce store
    alt Aucune transaction
        DB-->>APP: Pas de transaction trouvée
        APP-->>C: Achat ou réservation requis pour évaluer
    else Transaction confirmée
        APP->>DB: INSERT INTO reviews { author_id, store_id, rating, comment, is_verified:true }
        APP->>DB: UPDATE stores SET rating_average=AVG(rating), total_reviews=total_reviews+1
        APP-->>C: Avis publié
    end
```

---

## 2️⃣0️⃣ Réponse du Commerçant à un Avis

```mermaid
sequenceDiagram
    actor PRO as Commerçant
    participant DASH as Dashboard
    participant AI as Groq Agent IA
    participant DB as PostgreSQL (reviews)

    PRO->>DASH: Consulte les avis reçus
    DASH->>DB: SELECT * FROM reviews WHERE store_id=X
    DB-->>DASH: Liste des avis
    PRO->>DASH: Clique "Générer réponse IA"
    DASH->>AI: Générer réponse professionnelle
    AI-->>DASH: Réponse suggérée
    PRO->>DASH: Valide et envoie la réponse
    DASH->>DB: UPDATE reviews SET vendor_response=response, responded_at=now()
    DASH-->>PRO: Réponse enregistrée
```

---

## 2️⃣1️⃣ Enregistrer un Établissement (Favoris)

```mermaid
sequenceDiagram
    actor C as Client
    participant APP as Application
    participant DB as PostgreSQL (saved_places)

    C->>APP: Clique icône Favori sur une fiche
    APP->>DB: SELECT id FROM saved_places WHERE user_id=X AND store_id=Y
    alt Déjà en favori
        APP->>DB: DELETE FROM saved_places WHERE user_id=X AND store_id=Y
        APP-->>C: Retiré des favoris
    else Nouveau
        APP->>DB: INSERT INTO saved_places { user_id, store_id }
        APP-->>C: Ajouté aux favoris
    end
```

---

## 2️⃣2️⃣ Notifications Temps Réel (Supabase Realtime)

```mermaid
sequenceDiagram
    participant SERVER as Server Action
    participant DB as PostgreSQL (notifications)
    participant RT as Supabase Realtime (WebSocket)
    participant APP as Application Utilisateur
    actor U as Utilisateur

    SERVER->>DB: INSERT INTO notifications { user_id, title, type, is_read:false }
    DB->>RT: Broadcast INSERT sur la table notifications
    RT-->>APP: Événement WebSocket reçu
    APP->>APP: Badge non-lus + 1
    APP-->>U: Notification affichée
    U->>APP: Clique sur la notification
    APP->>DB: UPDATE notifications SET is_read=true WHERE id=notifId
    APP-->>U: Badge mis à jour
```

---

## 2️⃣3️⃣ Assistant IA Conversationnel

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant APP as Application Web
    participant API as /api/ai-chat
    participant LLM as Groq API (Llama 3)
    participant DB as PostgreSQL

    U->>APP: Pose une question en Darija/Français
    APP->>API: POST { message, history[] }
    API->>DB: Fetch contexte (catégories, villes)
    DB-->>API: Données contextuelles
    API->>LLM: Chat completion avec system prompt + contexte (streaming)
    LLM-->>API: Stream de tokens
    API-->>APP: Server-Sent Events (SSE)
    APP-->>U: Réponse affichée progressivement
```

---

## 2️⃣4️⃣ Dashboard Analytique Commerçant

```mermaid
sequenceDiagram
    actor PRO as Commerçant
    participant DASH as Dashboard Web
    participant ACTION as getDashboardOverview()
    participant DB as PostgreSQL

    PRO->>DASH: Ouvre /dashboard/[storeId]
    DASH->>ACTION: getDashboardOverview(storeId, period)
    par Requêtes parallèles
        ACTION->>DB: COUNT orders COMPLETED
        ACTION->>DB: SUM total_price (revenus)
        ACTION->>DB: COUNT bookings
        ACTION->>DB: SELECT rating_average, total_reviews FROM stores
        ACTION->>DB: SELECT type, COUNT FROM store_analytics (vues, clics)
        ACTION->>DB: SELECT rating, COUNT FROM reviews GROUP BY rating
        ACTION->>DB: SELECT day, COUNT FROM store_analytics GROUP BY day
    end
    DB-->>ACTION: Données agrégées
    ACTION-->>DASH: { profileViews, purchases, revenue, weeklyStats, ratingData }
    DASH-->>PRO: KPIs + graphiques + activité récente
```

---

## 2️⃣5️⃣ Gestion des Utilisateurs (Admin SaaS)

```mermaid
sequenceDiagram
    actor ADMIN as Administrateur
    participant SAAS as Plateforme Admin SaaS
    participant API as Django REST API
    participant DB as PostgreSQL (users)

    ADMIN->>SAAS: Navigue vers /dashboard/users
    SAAS->>API: GET /api/users?page=1
    API->>DB: SELECT * FROM users ORDER BY created_at DESC
    DB-->>API: Liste paginée
    API-->>SAAS: Données utilisateurs
    SAAS-->>ADMIN: Tableau des utilisateurs
    ADMIN->>SAAS: Clique "Suspendre" sur un compte
    SAAS->>API: PATCH /api/users/{id} { status:'suspended' }
    API->>DB: UPDATE users SET status='suspended'
    API->>DB: INSERT INTO notifications { user_id, title:"Compte suspendu" }
    API-->>SAAS: Confirmation
    SAAS-->>ADMIN: Utilisateur suspendu
```

---

## 2️⃣6️⃣ Ticket de Support

```mermaid
sequenceDiagram
    actor PRO as Commerçant
    participant APP as Application
    participant DB as PostgreSQL (support_tickets, support_messages)
    participant RT as Supabase Realtime
    actor ADMIN as Agent Support

    PRO->>APP: Crée un ticket (sujet + message)
    APP->>DB: INSERT INTO support_tickets { store_id, subject, priority:'medium', status:'open' }
    DB-->>APP: ticket.id
    APP->>DB: INSERT INTO support_messages { ticket_id, sender_type:'customer', content }
    APP-->>PRO: Ticket créé — En attente de réponse
    ADMIN->>DB: SELECT * FROM support_tickets WHERE status='open'
    DB-->>ADMIN: Nouveau ticket visible
    ADMIN->>DB: INSERT INTO support_messages { ticket_id, sender_type:'support', content }
    DB->>RT: Broadcast nouveau message
    RT-->>APP: Réponse reçue
    APP-->>PRO: Réponse du support affichée
    ADMIN->>DB: UPDATE support_tickets SET status='resolved'
```

---

## 2️⃣7️⃣ Abonnement Commerçant (PRO / BUSINESS)

```mermaid
sequenceDiagram
    actor PRO as Commerçant
    participant DASH as Dashboard (AccountSection)
    participant ACTION as account_subscription.ts
    participant DB as PostgreSQL (subscriptions)

    PRO->>DASH: Consulte son plan actuel
    DASH->>DB: SELECT * FROM subscriptions WHERE user_id=X
    DB-->>DASH: Plan FREE actif
    DASH-->>PRO: Affiche plans disponibles
    PRO->>DASH: Clique "Passer au PRO"
    DASH->>ACTION: upgradeSubscription(userId, 'PRO')
    ACTION->>DB: UPDATE subscriptions SET plan_name='PRO', price=49, period_end=now()+30days
    ACTION->>DB: INSERT INTO notifications { title:"Abonnement PRO activé !" }
    DB-->>PRO: Notification activation
    ACTION-->>DASH: Plan mis à jour
    DASH-->>PRO: Fonctionnalités PRO débloquées
```

---

## 2️⃣8️⃣ Synchronisation Asynchrone via Upstash QStash

```mermaid
sequenceDiagram
    participant ACTION as Server Action (Next.js)
    participant QSTASH as Upstash QStash
    participant WORKER as /api/workers/sync-order
    participant DB as PostgreSQL
    participant NOTIF as Notifications

    ACTION->>QSTASH: publishJSON({ url:/api/workers/sync-order, body:{orderId} })
    QSTASH-->>ACTION: Message en file (messageId)
    QSTASH->>WORKER: POST /api/workers/sync-order { orderId }
    WORKER->>WORKER: Vérifie signature QStash
    WORKER->>DB: Synchroniser état de la commande
    alt Succès
        DB-->>WORKER: OK
        WORKER->>NOTIF: Envoyer notifications manquantes
        WORKER-->>QSTASH: HTTP 200 — Traité
    else Échec
        DB-->>WORKER: Erreur
        WORKER-->>QSTASH: HTTP 500 — Retry
        Note over QSTASH: Retry automatique (backoff exponentiel, max 3)
        QSTASH->>WORKER: Nouvel essai après délai
    end
```

---

## Récapitulatif des 28 Diagrammes

| Catégorie | Diagrammes |
|-----------|------------|
| **Authentification** | 1 Signup, 2 Login, 3 Reset Password |
| **Boutique** | 4 Création établissement, 5 Approbation Admin |
| **Commandes** | 6 Création, 7 Validation QR, 8 Scan QR, 9 Annulation |
| **Réservations** | 10 Réservation, 11 Confirmation, 12 Complétion |
| **Recherche IA** | 13 Pipeline 7 étapes, 14 Vision IA |
| **Contenu** | 15 Reel publication, 16 Interaction Reel, 17 Story |
| **Social** | 18 Messagerie, 19 Avis, 20 Réponse avis, 21 Favoris |
| **Système** | 22 Notifications, 23 Assistant IA, 24 Dashboard |
| **Admin SaaS** | 25 Gestion utilisateurs, 26 Support tickets |
| **Business** | 27 Abonnement, 28 QStash async |

---
*Projet de Fin d'Études — Ro2ya | Khaireddine Dab & Abderrahman Abdelli | 2025-2026*
