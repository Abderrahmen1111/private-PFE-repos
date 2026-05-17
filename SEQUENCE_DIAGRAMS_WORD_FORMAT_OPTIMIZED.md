# 🎯 DIAGRAMMES DE SÉQUENCE — PLATEFORME RO2YA
> Style : Français simple · Acteurs réels · Blocs alt · 1 flux = 1 diagramme

---
# 🔐 SECTION 1 : AUTHENTIFICATION

### Diagramme de cas d'utilisation — Authentification

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S1 ["Section 1 - Authentification"]
        UC1(["S'inscrire"])
        UC2(["Verifier OTP"])
        UC3(["Se connecter"])
        UC4(["Acceder page protegee"])
        UC1 -.->|inclut| UC2
        UC3 -.->|inclut| UC4
    end

    C --> UC1 & UC3
    P --> UC1 & UC3
```

---

## 1️⃣ Inscription d'un utilisateur

```mermaid
sequenceDiagram
    actor Utilisateur
    participant Application as Application Mobile
    participant RateLimiter as Limiteur de requêtes
    participant SupabaseAuth as Supabase Auth
    participant BD as Base de données
    participant Email as Service Email (SendGrid)

    Utilisateur->>Application: Remplit le formulaire d'inscription
    Application->>Application: Vérifie que tous les champs sont remplis
    Application->>Application: Vérifie que l'email est valide
    Application->>RateLimiter: Vérifie le nombre de tentatives
    alt Trop de tentatives
        RateLimiter-->>Application: Accès temporairement bloqué
        Application-->>Utilisateur: "Réessayez dans 15 minutes"
    else Autorisé
        Application->>SupabaseAuth: Envoie les données d'inscription
        SupabaseAuth->>BD: Vérifie si l'email existe déjà
        alt Email déjà utilisé
            BD-->>SupabaseAuth: Email trouvé
            SupabaseAuth-->>Application: "Email déjà utilisé"
            Application-->>Utilisateur: Affiche le message d'erreur
        else Email disponible
            SupabaseAuth->>BD: Enregistre le nouvel utilisateur
            BD-->>SupabaseAuth: Confirmation
            SupabaseAuth->>Email: Envoie le code de vérification
            Email-->>Utilisateur: 📧 Code OTP reçu par email
            SupabaseAuth-->>Application: "Vérifiez votre email"
            Application-->>Utilisateur: Affiche l'écran de vérification
            Utilisateur->>Application: Saisit le code OTP
            Application->>SupabaseAuth: Envoie le code OTP
            alt Code invalide ou expiré
                SupabaseAuth-->>Application: Code incorrect
                Application-->>Utilisateur: "Code invalide ou expiré"
            else Code valide
                SupabaseAuth->>BD: Active le compte
                SupabaseAuth-->>Application: Jeton de session
                Application-->>Utilisateur: ✅ Compte activé — Bienvenue !
            end
        end
    end
```
**Fichiers :** `app/(auth)/signup.tsx` · `lib/actions/auth.ts` · `lib/rate-limit.ts`

---

## 2️⃣ Connexion d'un utilisateur

```mermaid
sequenceDiagram
    actor Utilisateur
    participant Application as Application Mobile
    participant RateLimiter as Limiteur de requêtes
    participant SupabaseAuth as Supabase Auth
    participant BD as Base de données

    Utilisateur->>Application: Saisit email et mot de passe
    Application->>RateLimiter: Vérifie le nombre de tentatives
    alt Trop de tentatives
        RateLimiter-->>Application: Compte temporairement verrouillé
        Application-->>Utilisateur: "Réessayez dans 15 minutes"
    else Autorisé
        Application->>SupabaseAuth: Envoie les identifiants
        SupabaseAuth->>BD: Cherche l'utilisateur par email
        alt Identifiants incorrects
            BD-->>SupabaseAuth: Utilisateur non trouvé ou mot de passe invalide
            SupabaseAuth-->>Application: Identifiants incorrects
            Application-->>Utilisateur: "Email ou mot de passe incorrect"
        else Compte suspendu
            SupabaseAuth-->>Application: Compte suspendu
            Application-->>Utilisateur: "Compte suspendu — Contactez le support"
        else Connexion réussie
            SupabaseAuth->>BD: Met à jour la date de dernière connexion
            SupabaseAuth-->>Application: Jeton de session (JWT)
            Application->>Application: Sauvegarde la session
            Application-->>Utilisateur: ✅ Connecté — Redirection vers l'accueil
        end
    end
```
**Fichiers :** `app/(auth)/login.tsx` · `app/login/page.tsx` · `lib/actions/auth.ts`

---

## 3️⃣ Accès à une page protégée

```mermaid
sequenceDiagram
    actor Utilisateur
    participant Navigateur as Navigateur / Application
    participant Middleware as Vérificateur de session
    participant SupabaseAuth as Supabase Auth
    participant BD as Base de données

    Utilisateur->>Navigateur: Accède à une page réservée
    Navigateur->>Middleware: Présente le jeton de session
    Middleware->>SupabaseAuth: Vérifie la validité du jeton
    alt Jeton absent ou expiré
        SupabaseAuth-->>Middleware: Jeton invalide
        Middleware-->>Navigateur: Redirige vers la connexion
        Navigateur-->>Utilisateur: Page de connexion
    else Jeton valide
        SupabaseAuth-->>Middleware: Identité et rôle de l'utilisateur
        Middleware->>BD: Vérifie les droits d'accès
        alt Droits insuffisants
            BD-->>Middleware: Accès non autorisé
            Middleware-->>Navigateur: Page "Accès refusé"
            Navigateur-->>Utilisateur: ❌ Accès interdit
        else Autorisé
            Middleware-->>Navigateur: Accès accordé
            Navigateur-->>Utilisateur: ✅ Page affichée
        end
    end
```
**Fichiers :** `middleware.ts` · `lib/supabase/middleware.ts`

---

# 🏪 SECTION 2 : GESTION ÉTABLISSEMENT

### Diagramme de cas d'utilisation — Gestion des Boutiques

```mermaid
flowchart LR
    P(["Commercant PRO"])
    A(["Administrateur"])
    C(["Client"])

    subgraph S2 ["Section 2 - Gestion des Boutiques"]
        UC1(["Creer une boutique"])
        UC2(["Uploader photos"])
        UC3(["Valider boutique"])
        UC4(["Rejeter boutique"])
        UC5(["Modifier profil"])
        UC6(["Consulter profil public"])
        UC1 -.->|inclut| UC2
        UC3 -.->|etend| UC4
    end

    P --> UC1 & UC5
    A --> UC3 & UC4
    C --> UC6
```

---

## 4️⃣ Création d'une boutique

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Cloudinary as Serveur d'images (Cloudinary)
    participant Serveur as API Boutiques
    participant BD as Base de données (PostGIS)

    Commerçant->>Dashboard: Remplit les informations de la boutique
    Commerçant->>Dashboard: Ajoute logo et photos
    Dashboard->>Cloudinary: Envoie les images
    Cloudinary->>Cloudinary: Compresse et optimise les images
    Cloudinary-->>Dashboard: Liens des images hébergées
    Dashboard->>Dashboard: Vérifie que tous les champs sont remplis
    alt Informations manquantes
        Dashboard-->>Commerçant: Affiche les erreurs
    else Informations complètes
        Dashboard->>Serveur: Envoie les données avec les liens images
        Serveur->>BD: Enregistre la boutique avec coordonnées GPS
        Note over Serveur,BD: Statut initial = "En attente de validation"
        BD-->>Serveur: Identifiant de la boutique
        Serveur-->>Dashboard: Boutique créée
        Dashboard-->>Commerçant: ✅ "En attente de validation par l'admin"
    end
```
**Fichiers :** `app/dashboard/stores/create/page.tsx` · `lib/actions/stores.ts` · `lib/cloudinary.ts`

---

## 5️⃣ Validation d'une boutique (Admin)

```mermaid
sequenceDiagram
    actor Administrateur
    participant Dashboard as Dashboard Admin (SaaS)
    participant Serveur as API Administration (Django)
    participant BD as Base de données
    participant Notif as Système de notifications

    Administrateur->>Dashboard: Consulte les boutiques en attente
    Dashboard->>Serveur: Demande la liste des boutiques "En attente"
    Serveur->>BD: Récupère les boutiques avec leurs documents
    BD-->>Serveur: Liste des boutiques
    Serveur-->>Dashboard: Affiche la liste
    Administrateur->>Dashboard: Examine les documents et décide
    alt Boutique approuvée
        Dashboard->>Serveur: Approuver la boutique
        Serveur->>BD: Met à jour le statut à "Approuvée"
        BD-->>Serveur: Confirmation
        Serveur->>Notif: Déclenche une notification
        Notif-->>Commerçant: 🔔 "Votre boutique a été approuvée"
        Dashboard-->>Administrateur: ✅ Approbation confirmée
    else Boutique rejetée
        Dashboard->>Serveur: Rejeter avec motif
        Serveur->>BD: Met à jour le statut à "Rejetée"
        BD-->>Serveur: Confirmation
        Serveur->>Notif: Déclenche une notification
        Notif-->>Commerçant: 🔔 "Votre boutique a été rejetée"
        Dashboard-->>Administrateur: ✅ Rejet confirmé
    end
```
**Fichiers :** `saas/app/admin/stores/pending/page.tsx` · `saas/backend/stores/admin.py`

---

## 6️⃣ Modification du profil et affichage public

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web
    participant Serveur as API Profil
    participant BD as Base de données (RLS)

    Commerçant->>Dashboard: Modifie horaires, bio ou réseaux sociaux
    Dashboard->>Serveur: Envoie les modifications
    Serveur->>BD: Vérifie que le commerçant est propriétaire de la boutique
    alt Propriétaire non confirmé
        BD-->>Serveur: Accès refusé
        Serveur-->>Dashboard: Modification non autorisée
        Dashboard-->>Commerçant: ❌ Erreur d'autorisation
    else Propriétaire confirmé
        Serveur->>BD: Enregistre les modifications
        BD-->>Serveur: Confirmation
        Serveur-->>Dashboard: Mise à jour réussie
        Dashboard-->>Commerçant: ✅ "Profil mis à jour avec succès"
    end
```
**Fichiers :** `app/dashboard/profile/page.tsx` · `lib/actions/profile.ts`

---

# 🛍️ SECTION 3 : CATALOGUE & PRODUITS

### Diagramme de cas d'utilisation — Catalogue et Produits

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])
    A(["Administrateur"])

    subgraph S3 ["Section 3 - Catalogue et Produits"]
        UC1(["Ajouter un produit"])
        UC2(["Modifier un produit"])
        UC3(["Retirer un produit"])
        UC4(["Parcourir le catalogue"])
    end

    P --> UC1 & UC2
    A --> UC3
    C --> UC4
```

---

## 7️⃣ Ajout d'un produit

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Cloudinary as Serveur d'images (Cloudinary)
    participant Serveur as API Catalogue
    participant BD as Base de données

    Commerçant->>Dashboard: Remplit les informations du produit
    Commerçant->>Dashboard: Ajoute une photo
    Dashboard->>Cloudinary: Envoie la photo
    Cloudinary-->>Dashboard: Lien de l'image optimisée
    Dashboard->>Dashboard: Vérifie les données (prix, nom, catégorie)
    alt Données invalides
        Dashboard-->>Commerçant: ❌ Affiche les erreurs
    else Données valides
        Dashboard->>Serveur: Envoie les informations du produit
        Serveur->>BD: Enregistre le produit dans le catalogue
        BD-->>Serveur: Confirmation
        Serveur-->>Dashboard: Produit créé
        Dashboard-->>Commerçant: ✅ "Produit ajouté au catalogue"
    end
```
**Fichiers :** `app/dashboard/products/add/page.tsx` · `lib/actions/items.ts` · `lib/cloudinary.ts`

---

## 8️⃣ Consultation du catalogue et modération

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Serveur as API Catalogue
    participant BD as Base de données

    Client->>Application: Parcourt le catalogue
    Application->>Serveur: Demande la liste des produits (page suivante)
    Serveur->>BD: Récupère 20 produits actifs triés par date
    BD-->>Serveur: Liste de produits
    Serveur-->>Application: Produits reçus
    Application-->>Client: ✅ Affiche les nouveaux produits

    Note over Application: Le défilement infini charge automatiquement la suite
```
**Fichiers :** `app/search/results.tsx` · `lib/items.ts`

---

# 📦 SECTION 4 : COMMANDES

### Diagramme de cas d'utilisation — Commandes

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S4 ["Section 4 - Commandes"]
        UC1(["Ajouter au panier"])
        UC2(["Passer une commande"])
        UC3(["Annuler une commande"])
        UC4(["Traiter la commande"])
        UC5(["Livrer via QR Code"])
        UC1 -.->|inclut| UC2
        UC4 -.->|inclut| UC5
    end

    C --> UC1 & UC2 & UC3
    P --> UC4 & UC5
```

---

## 9️⃣ Panier et passage de commande

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Panier as Panier (Stockage local)
    participant Serveur as API Commandes
    participant BD as Base de données
    participant Notif as Système de notifications

    Client->>Application: Ajoute un produit au panier
    Application->>Panier: Vérifie que le produit vient de la même boutique
    alt Produit d'une autre boutique
        Panier-->>Application: Conflit détecté
        Application-->>Client: "Vider le panier et ajouter ce produit ?"
    else Même boutique
        Panier->>Panier: Met à jour la quantité et le total
        Application-->>Client: Panier mis à jour
    end

    Client->>Application: Valide le panier et confirme la commande
    Application->>Serveur: Envoie la commande
    Serveur->>BD: Vérifie la disponibilité du stock
    alt Stock insuffisant
        BD-->>Serveur: Rupture de stock
        Serveur-->>Application: "Stock insuffisant pour [produit]"
        Application-->>Client: ❌ Affiche le message d'erreur
    else Stock disponible
        Serveur->>BD: Enregistre la commande et réduit le stock
        BD-->>Serveur: Commande créée
        Serveur->>Notif: Notifie le commerçant
        Notif-->>Commerçant: 🔔 "Nouvelle commande reçue"
        Serveur-->>Application: Numéro de commande
        Application-->>Client: ✅ "Commande envoyée avec succès"
    end
```
**Fichiers :** `app/cart.tsx` · `app/checkout.tsx` · `store/cartStore.ts` · `lib/actions/orders.ts`

---

## 🔟 Traitement et livraison d'une commande

```mermaid
sequenceDiagram
    actor Commerçant
    actor Client
    participant Dashboard as Dashboard Web
    participant Serveur as API Commandes
    participant BD as Base de données
    participant Notif as Système de notifications

    Commerçant->>Dashboard: Reçoit une nouvelle commande
    Commerçant->>Dashboard: Clique "Accepter"
    Dashboard->>Serveur: Met à jour le statut à "Acceptée"
    Serveur->>BD: Enregistre le changement
    BD-->>Serveur: Confirmation
    Serveur->>Notif: Notifie le client
    Notif-->>Client: 🔔 "Votre commande est confirmée"
    Dashboard-->>Commerçant: ✅ Commande acceptée

    Client->>Client: Se présente en boutique avec son QR Code
    Commerçant->>Dashboard: Scanne le QR Code du client
    Dashboard->>Serveur: Vérifie la validité du QR Code
    alt QR invalide ou expiré
        Serveur-->>Dashboard: QR Code invalide
        Dashboard-->>Commerçant: ❌ "QR Code invalide"
    else QR valide
        Serveur->>BD: Marque la commande comme livrée
        BD-->>Serveur: Confirmation
        Serveur->>Notif: Notifie le client
        Notif-->>Client: 🔔 "Commande reçue — Laissez un avis"
        Dashboard-->>Commerçant: ✅ "Livraison confirmée"
    end
```
**Fichiers :** `app/dashboard/orders/page.tsx` · `app/dashboard/qr-verify/[code]/page.tsx` · `lib/actions/orders.ts`

---

# 📅 SECTION 5 : RÉSERVATIONS

### Diagramme de cas d'utilisation — Reservations

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S5 ["Section 5 - Reservations"]
        UC1(["Consulter les creneaux"])
        UC2(["Reserver un service"])
        UC3(["Annuler une reservation"])
        UC4(["Cloture une reservation"])
        UC5(["Gerer les disponibilites"])
        UC1 -.->|inclut| UC2
    end

    C --> UC1 & UC2 & UC3
    P --> UC4 & UC5
```

---

## 1️⃣1️⃣ Réservation d'un service et gestion des créneaux

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Serveur as API Réservations
    participant BD as Base de données
    participant Notif as Supabase Realtime

    Client->>Application: Consulte les créneaux disponibles d'un service
    Application->>Serveur: Demande les créneaux libres du commerçant
    Serveur->>BD: Récupère le calendrier et filtre les créneaux occupés
    BD-->>Serveur: Créneaux disponibles pour la date choisie
    Serveur-->>Application: Affiche les créneaux libres
    Client->>Application: Sélectionne un créneau et confirme

    Application->>Serveur: Envoie la demande de réservation
    Serveur->>BD: Vérifie que le créneau est toujours libre
    alt Créneau déjà pris entre-temps
        BD-->>Serveur: Créneau occupé par un autre client
        Serveur-->>Application: "Ce créneau n'est plus disponible"
        Application-->>Client: ❌ Propose de choisir un autre horaire
    else Créneau encore libre
        Serveur->>BD: Enregistre la réservation avec statut "Confirmée"
        Serveur->>BD: Marque le créneau comme occupé
        BD-->>Serveur: Réservation confirmée
        Serveur->>Notif: Notifie le commerçant en temps réel
        Notif-->>Commerçant: 🔔 "Nouvelle réservation reçue"
        Serveur-->>Application: Confirmation avec détails du RDV
        Application-->>Client: ✅ "Réservation confirmée pour [date] à [heure]"
    end

    Note over Serveur,BD: Vérification anti-chevauchement côté serveur avant chaque insertion
```
**Fichiers :** `app/booking/[serviceId].tsx` · `app/dashboard/schedules/page.tsx` · `lib/actions/reservation.ts`

---

## 1️⃣2️⃣ Clôture d'une réservation par le commerçant

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Serveur as API Réservations
    participant BD as Base de données
    participant Notif as Supabase Realtime

    Commerçant->>Dashboard: Consulte ses réservations du jour
    Dashboard->>Serveur: Demande les réservations confirmées du jour
    Serveur->>BD: Récupère les réservations du jour pour cette boutique
    BD-->>Serveur: Liste des réservations
    Serveur-->>Dashboard: Affiche les réservations avec détails client

    Commerçant->>Dashboard: Marque une réservation comme terminée
    Dashboard->>Serveur: Met à jour le statut à "Terminée"
    Serveur->>BD: Enregistre la clôture avec date de complétion
    BD-->>Serveur: Confirmation
    Serveur->>Notif: Envoie une notification au client
    Notif-->>Client: 🔔 "Prestation terminée — Laissez un avis !"
    Serveur-->>Dashboard: Confirmation de la clôture
    Dashboard-->>Commerçant: ✅ "Réservation clôturée"
```
**Fichiers :** `app/dashboard/reservations/page.tsx` · `lib/actions/reservation.ts`

---

# 🔍 SECTION 6 : RECHERCHE & INTELLIGENCE ARTIFICIELLE

### Diagramme de cas d'utilisation — Recherche et Intelligence Artificielle

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S6 ["Section 6 - Recherche et IA"]
        UC1(["Recherche semantique Darija"])
        UC2(["Recherche par photo"])
        UC3(["Exploration sur la carte"])
        UC4(["Filtres de proximite"])
        UC3 -.->|inclut| UC4
    end

    C --> UC1 & UC2 & UC3
    P --> UC3
```

---

## 1️⃣3️⃣ Recherche intelligente (texte Darija / Français)

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant ServeurIA as API Recherche Sémantique
    participant LLM as OpenRouter (LLM Cloud)
    participant BD as PostgreSQL (pgvector)

    Client->>Application: Tape une recherche (ex : "حلاق" ou "coiffeur")
    Application->>ServeurIA: Envoie le texte de recherche brut
    ServeurIA->>ServeurIA: Nettoie et normalise le texte saisi
    ServeurIA->>LLM: Envoie le texte pour traduction Darija → Français
    LLM-->>ServeurIA: Terme traduit et normalisé (ex : "salon de coiffure")
    ServeurIA->>LLM: Demande la conversion du texte en vecteur numérique
    LLM-->>ServeurIA: Vecteur de représentation sémantique
    ServeurIA->>BD: Recherche les boutiques les plus proches (distance cosinus)
    BD-->>ServeurIA: Résultats classés par pertinence sémantique
    ServeurIA-->>Application: Liste des boutiques correspondantes
    Application-->>Client: ✅ Affiche les résultats triés par pertinence

    Note over ServeurIA,LLM: Le moteur comprend les synonymes, les dialectes et les variantes orthographiques
    Note over BD: Extension pgvector pour la recherche vectorielle SQL native
```
**Fichiers :** `compnents/search/searchBar.tsx` · `app/api/semantic-search/route.ts` · `lib/darija-dictionary.ts`

---

## 1️⃣4️⃣ Recherche par photo (Vision IA)

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant ServeurIA as API Vision (Image Search)
    participant GroqVision as Groq Vision (IA Cloud)
    participant BD as PostgreSQL (Recherche texte)

    Client->>Application: Prend une photo d'un plat ou d'un vêtement
    Application->>Application: Compresse et encode l'image en base64
    Application->>ServeurIA: Envoie l'image pour analyse
    ServeurIA->>GroqVision: Soumet l'image au modèle de vision
    GroqVision->>GroqVision: Analyse l'image et identifie les objets
    GroqVision-->>ServeurIA: Description des objets identifiés (ex : "Pizza Margherita")
    alt Objet non reconnu
        ServeurIA-->>Application: "Impossible d'identifier l'objet"
        Application-->>Client: ❌ Propose la recherche manuelle
    else Objet reconnu
        ServeurIA->>BD: Recherche en texte intégral avec les mots-clés extraits
        BD-->>ServeurIA: Boutiques et produits correspondants
        ServeurIA-->>Application: Résultats de recherche
        Application-->>Client: ✅ Affiche les boutiques qui vendent cet objet
    end

    Note over GroqVision: Modèle multimodal capable d'analyser des images en temps réel
```
**Fichiers :** `lib/imageSearch.ts` · `app/api/image-search/route.ts`

---

## 1️⃣5️⃣ Exploration géographique et filtres

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Serveur as API Exploration
    participant BD as PostgreSQL (PostGIS)

    Client->>Application: Active sa localisation GPS
    Client->>Application: Applique des filtres (catégorie, distance < 5km)
    Application->>Serveur: Envoie la position GPS et les filtres choisis
    Serveur->>BD: Recherche les boutiques dans le rayon demandé
    Note over Serveur,BD: Requête spatiale ST_DWithin(position, boutique, rayon)
    BD-->>Serveur: Boutiques trouvées avec distances calculées
    Serveur->>Serveur: Trie par distance croissante
    Serveur-->>Application: Résultats filtrés avec coordonnées
    Application-->>Client: ✅ Affiche les boutiques sur la carte interactive
```
**Fichiers :** `app/search/mapView.tsx` · `lib/actions/explore.ts`

---

# 📱 SECTION 7 : CONTENU VIDÉO (REELS & STORIES)

### Diagramme de cas d'utilisation — Contenu Video

```mermaid
flowchart LR
    P(["Commercant PRO"])
    C(["Client"])

    subgraph S7 ["Section 7 - Contenu Video Reels et Stories"]
        UC1(["Publier un Reel"])
        UC2(["Publier une Story"])
        UC3(["Liker un Reel"])
        UC4(["Sauvegarder un Reel"])
        UC1 -.->|etend| UC2
    end

    P --> UC1 & UC2
    C --> UC3 & UC4
```

---

## 1️⃣6️⃣ Publication d'un Reel ou d'une Story

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Cloudinary as Cloudinary (CDN Cloud)
    participant Serveur as API Contenu
    participant BD as Base de données

    Commerçant->>Dashboard: Sélectionne une vidéo (max 60s) ou une image
    Dashboard->>Cloudinary: Envoie le fichier pour hébergement
    Cloudinary->>Cloudinary: Transcode la vidéo et génère une miniature
    Cloudinary-->>Dashboard: Lien sécurisé du contenu hébergé
    Dashboard->>Serveur: Envoie les métadonnées + lien du fichier
    Serveur->>Serveur: Valide le format et la taille

    alt Publication d'un Reel (permanent)
        Serveur->>BD: Enregistre le Reel avec le lien Cloudinary
        BD-->>Serveur: Reel ID créé
        Serveur-->>Dashboard: Confirmation
        Dashboard-->>Commerçant: ✅ "Reel publié avec succès"
    else Publication d'une Story (éphémère)
        Serveur->>BD: Enregistre la Story avec expiration = maintenant + 24h
        BD-->>Serveur: Story ID créée
        Serveur-->>Dashboard: Confirmation
        Dashboard-->>Commerçant: ✅ "Story publiée — Expire dans 24 heures"
    end

    Note over Cloudinary: Compression automatique + conversion WebP/MP4 optimisé
    Note over BD: Un job automatique supprime les stories expirées chaque heure
```
**Fichiers :** `app/reels/create/page.tsx` · `app/stories/create/page.tsx` · `lib/actions/reels.ts`

---

## 1️⃣7️⃣ Interactions sur le contenu (Like, Sauvegarde, Partage)

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Serveur as API Interactions
    participant BD as Base de données

    Client->>Application: Appuie deux fois sur la vidéo (Like)
    Application-->>Client: Affiche l'animation de cœur immédiatement
    Application->>Serveur: Enregistre l'interaction en arrière-plan
    Serveur->>BD: Vérifie si le like existe déjà

    alt Like déjà donné → retrait
        Serveur->>BD: Supprime le like et décrémente le compteur
        BD-->>Serveur: Like retiré
        Serveur-->>Application: Like annulé
    else Nouveau like → ajout
        Serveur->>BD: Ajoute le like et incrémente le compteur
        BD-->>Serveur: Like enregistré
        Serveur-->>Application: Like confirmé
    end

    Note over Application: Mise à jour optimiste — l'UI réagit avant la réponse du serveur
    Note over BD: Compteur incrémenté via fonction RPC PostgreSQL (anti-conflit)
```
**Fichiers :** `app/reels/feed.tsx` · `lib/actions/favorites.ts`

---

# 💬 SECTION 8 : MESSAGERIE & AVIS

### Diagramme de cas d'utilisation — Messagerie et Avis

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S8 ["Section 8 - Messagerie et Avis"]
        UC1(["Envoyer un message"])
        UC2(["Recevoir un message"])
        UC3(["Laisser un avis"])
        UC4(["Repondre a un avis"])
        UC1 -.->|inclut| UC2
    end

    C --> UC1 & UC3
    P --> UC2 & UC4
```

---

## 1️⃣8️⃣ Chat en temps réel (Client ↔ Commerçant)

```mermaid
sequenceDiagram
    actor Client
    participant AppClient as Application Mobile
    participant Supabase as Supabase Realtime (WebSocket)
    participant BD as Base de données
    participant AppPro as Dashboard Web (Next.js)
    actor Commerçant

    Client->>AppClient: Écrit et envoie un message
    AppClient->>Supabase: Transmet le message via WebSocket
    Supabase->>BD: Enregistre le message dans la conversation
    BD-->>Supabase: Message sauvegardé
    Supabase->>AppPro: Diffuse le message en temps réel
    AppPro-->>Commerçant: 💬 Message reçu instantanément

    Commerçant->>AppPro: Rédige et envoie une réponse
    AppPro->>Supabase: Transmet la réponse via WebSocket
    Supabase->>BD: Enregistre la réponse
    BD-->>Supabase: Réponse sauvegardée
    Supabase->>AppClient: Diffuse la réponse en temps réel
    AppClient-->>Client: 💬 Réponse reçue instantanément

    Note over Supabase: Connexion WebSocket permanente — latence < 100ms
    Note over BD: Chaque conversation est isolée par un identifiant unique (ChatRoom)
```
**Fichiers :** `app/messages/[id].tsx` · `app/messages/page.tsx`

---

## 1️⃣9️⃣ Dépôt d'un avis et réponse IA

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Serveur as API Avis
    participant BD as Base de données
    participant LLM as LLM Cloud (Génération texte)

    Client->>Application: Note la prestation (1-5 étoiles) et écrit un commentaire
    Application->>Serveur: Envoie l'avis
    Serveur->>BD: Vérifie qu'une transaction réelle a eu lieu entre les deux parties
    alt Aucune transaction vérifiée
        BD-->>Serveur: Pas de commande ou réservation confirmée
        Serveur-->>Application: "Vous devez avoir effectué un achat pour laisser un avis"
        Application-->>Client: ❌ Affiche le message d'erreur
    else Transaction confirmée
        Serveur->>BD: Enregistre l'avis
        Serveur->>BD: Recalcule la note moyenne de la boutique
        BD-->>Serveur: Nouvelle note moyenne
        Serveur-->>Commerçant: 🔔 "Nouvel avis reçu — 5 étoiles"
        Serveur-->>Application: Avis publié
        Application-->>Client: ✅ "Merci pour votre avis !"
    end

    Note over Serveur,BD: Seuls les clients ayant une transaction validée peuvent laisser un avis
```
**Fichiers :** `lib/actions/reviews.ts`

---

# 🛡️ SECTION 9 : DÉTECTION DE FRAUDE IA

### Diagramme de cas d'utilisation — Detection de Fraude IA

```mermaid
flowchart LR
    P(["Commercant PRO"])
    A(["Administrateur"])

    subgraph S9 ["Section 9 - Detection de Fraude IA"]
        UC1(["Analyser une transaction"])
        UC2(["Bloquer automatiquement"])
        UC3(["Recevoir alerte fraude"])
        UC4(["Examiner alerte"])
        UC1 -.->|inclut| UC2
        UC2 -.->|inclut| UC3
        UC3 -.->|inclut| UC4
    end

    P --> UC1
    A --> UC3 & UC4
```

---

## 2️⃣0️⃣ Détection de fraude pour les commerçants (IA)

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Serveur as API Commandes
    participant IA as Moteur de détection IA (Groq)
    participant BD as Base de données
    participant Admin as Dashboard Admin (SaaS)

    Commerçant->>Dashboard: Crée une nouvelle commande ou promotion suspecte
    Dashboard->>Serveur: Envoie les données de la transaction
    Serveur->>BD: Récupère l'historique récent du commerçant
    BD-->>Serveur: Historique des transactions et comportements

    Serveur->>IA: Envoie les données pour analyse de risque
    IA->>IA: Analyse les indicateurs de fraude
    IA->>IA: Vérifie les prix anormalement bas ou élevés
    IA->>IA: Détecte les volumes inhabituels de commandes
    IA->>IA: Compare avec les patterns de fraude connus
    IA-->>Serveur: Score de risque (0-100) et détails

    alt Score de risque élevé (> 80)
        Serveur->>BD: Bloque la transaction automatiquement
        Serveur->>BD: Enregistre l'alerte avec les preuves
        BD-->>Serveur: Transaction bloquée
        Serveur->>Admin: Notification "Fraude potentielle détectée"
        Admin-->>Administrateur: 🚨 Alerte fraude à examiner
        Serveur-->>Dashboard: "Transaction suspendue — En cours de vérification"
        Dashboard-->>Commerçant: ❌ Transaction en attente de vérification
    else Score de risque moyen (40-80)
        Serveur->>BD: Marque la transaction comme "À surveiller"
        BD-->>Serveur: Confirmation
        Serveur->>Admin: Notification discrète pour surveillance
        Serveur-->>Dashboard: Transaction acceptée avec surveillance
        Dashboard-->>Commerçant: ✅ Transaction acceptée
    else Score de risque faible (< 40)
        Serveur->>BD: Enregistre la transaction normalement
        BD-->>Serveur: Confirmation
        Serveur-->>Dashboard: Transaction acceptée
        Dashboard-->>Commerçant: ✅ Transaction confirmée
    end

    Note over IA: Indicateurs analysés : fréquence anormale, prix aberrants, géolocalisation incohérente
    Note over Serveur,BD: Chaque analyse est journalisée pour audit et amélioration du modèle
```
**Fichiers :** `lib/actions/orders.ts` · `app/api/fraud-check/route.ts` · `saas/backend/transactions/api.py`

---

# 📊 SECTION 10 : ANALYTIQUES & ASSISTANT IA

### Diagramme de cas d'utilisation — Analytiques et Assistant IA

```mermaid
flowchart LR
    P(["Commercant PRO"])
    C(["Client"])

    subgraph S10 ["Section 10 - Analytiques et Assistant IA"]
        UC1(["Consulter le tableau de bord"])
        UC2(["Voir les statistiques"])
        UC3(["Poser une question a l IA"])
        UC4(["Recevoir une reponse IA"])
        UC1 -.->|inclut| UC2
        UC3 -.->|inclut| UC4
    end

    P --> UC1 & UC2 & UC3
    C --> UC3
```

---

## 2️⃣1️⃣ Tableau de bord analytique

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Serveur as API Analytiques
    participant BD as PostgreSQL (Agrégation SQL)

    Commerçant->>Dashboard: Ouvre l'onglet statistiques
    Dashboard->>Serveur: Demande les métriques de la période choisie
    Serveur->>BD: Calcule le chiffre d'affaires (SUM des commandes complétées)
    Serveur->>BD: Compte le nombre de commandes et réservations
    Serveur->>BD: Calcule le nombre de vues du profil
    Serveur->>BD: Calcule le taux de conversion (commandes / vues)
    BD-->>Serveur: Données agrégées par jour/semaine/mois
    Serveur-->>Dashboard: Métriques formatées pour les graphiques
    Dashboard-->>Commerçant: ✅ Affiche les graphiques et indicateurs clés

    Note over Serveur,BD: Requêtes SQL d'agrégation : SUM, COUNT, AVG, GROUP BY période
```
**Fichiers :** `app/dashboard/page.tsx` · `lib/actions/analyzer-service.ts`

---

## 2️⃣2️⃣ Assistant IA conversationnel (Sales Advisor)

```mermaid
sequenceDiagram
    actor Utilisateur
    participant Application as Application Mobile
    participant ServeurIA as API Assistant IA
    participant BD as PostgreSQL (pgvector - RAG)
    participant LLM as OpenRouter (LLM Cloud)

    Utilisateur->>Application: Pose une question (ex : "Quels sont mes produits les plus vendus ?")
    Application->>ServeurIA: Envoie la question
    ServeurIA->>ServeurIA: Analyse l'intention de la question
    ServeurIA->>BD: Recherche les données pertinentes (produits, commandes, stock)
    BD-->>ServeurIA: Données contextuelles de la boutique
    ServeurIA->>ServeurIA: Construit le prompt avec le contexte réel
    ServeurIA->>LLM: Envoie le prompt enrichi au modèle IA
    LLM-->>ServeurIA: Génère la réponse en streaming (mot par mot)
    ServeurIA-->>Application: Transmet la réponse progressivement
    Application-->>Utilisateur: ✅ Affiche la réponse mot par mot (effet typewriter)

    Note over ServeurIA,BD: RAG : l'IA se base sur les données réelles de la boutique, pas de réponse inventée
    Note over LLM: Streaming via Server-Sent Events — réponse affichée en temps réel
```
**Fichiers :** `app/messages/ai-assistant.tsx` · `lib/actions/ai-agent.ts`

---

## 2️⃣3️⃣ Analyse de sentiment des commentaires (IA)

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Serveur as API Avis
    participant BD as Base de données
    participant IA as Moteur d'analyse IA (Groq / OpenRouter)

    Commerçant->>Dashboard: Ouvre la section "Avis clients"
    Dashboard->>Serveur: Demande les avis de la boutique
    Serveur->>BD: Récupère tous les avis non analysés
    BD-->>Serveur: Liste des avis avec texte brut

    Serveur->>IA: Envoie les textes des avis pour analyse de sentiment
    IA->>IA: Analyse chaque commentaire (positif, neutre, négatif)
    IA->>IA: Extrait les thèmes récurrents (qualité, prix, service, propreté)
    IA->>IA: Identifie les suggestions d'amélioration
    IA-->>Serveur: Résultats d'analyse (sentiment + thèmes + score par catégorie)

    Serveur->>BD: Enregistre les résultats d'analyse pour chaque avis
    BD-->>Serveur: Analyse sauvegardée
    Serveur-->>Dashboard: Résultats formatés avec statistiques

    alt Majorité de commentaires négatifs détectés
        Dashboard-->>Commerçant: ⚠️ "Attention : baisse de satisfaction sur le thème Service"
        Dashboard->>Dashboard: Affiche des recommandations d'amélioration
    else Commentaires globalement positifs
        Dashboard-->>Commerçant: ✅ Tableau de bord sentiment avec graphiques
    end

    Note over IA: L'IA identifie automatiquement les points forts et les axes d'amélioration
    Note over BD: L'historique des analyses permet de suivre l'évolution de la satisfaction dans le temps
```
**Fichiers :** `lib/actions/reviews.ts` · `lib/actions/sales-analyzer.ts` · `app/dashboard/reviews/page.tsx`

---

## 2️⃣4️⃣ Recommandation intelligente de promotions (IA)

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Serveur as API Promotions
    participant BD as Base de données
    participant IA as Moteur de recommandation IA (OpenRouter)

    Commerçant->>Dashboard: Clique sur "Créer une promotion assistée par IA"
    Dashboard->>Serveur: Demande une recommandation de promotion
    Serveur->>BD: Récupère les données de la boutique
    Serveur->>BD: Analyse les ventes des 30 derniers jours
    Serveur->>BD: Identifie les produits à faible rotation de stock
    Serveur->>BD: Récupère les tendances de la catégorie
    BD-->>Serveur: Données commerciales complètes

    Serveur->>IA: Envoie les données pour analyse et recommandation
    IA->>IA: Analyse les produits à écouler en priorité
    IA->>IA: Calcule le pourcentage de remise optimal
    IA->>IA: Propose une durée de promotion adaptée
    IA->>IA: Génère un texte promotionnel attractif
    IA-->>Serveur: Recommandation complète (produits, remise %, durée, texte)

    Serveur-->>Dashboard: Proposition de promotion pré-remplie
    Dashboard-->>Commerçant: 📋 "Promotion suggérée par l'IA"

    alt Commerçant accepte la suggestion
        Commerçant->>Dashboard: Valide et publie la promotion
        Dashboard->>Serveur: Enregistre la promotion
        Serveur->>BD: INSERT promotion avec dates de début et fin
        BD-->>Serveur: Promotion créée
        Serveur-->>Dashboard: Confirmation
        Dashboard-->>Commerçant: ✅ "Promotion publiée — Visible par les clients"
    else Commerçant modifie la suggestion
        Commerçant->>Dashboard: Ajuste les paramètres manuellement
        Dashboard->>Serveur: Enregistre la version modifiée
        Serveur->>BD: INSERT promotion personnalisée
        BD-->>Serveur: Promotion créée
        Dashboard-->>Commerçant: ✅ "Promotion personnalisée publiée"
    end

    Note over IA: L'IA recommande des remises basées sur les données réelles de vente (pas de suggestion aléatoire)
    Note over BD: Les promotions ont une date d'expiration automatique
```
**Fichiers :** `lib/actions/promotions.ts` · `lib/actions/ai-agent.ts` · `app/dashboard/promotions/page.tsx`

---

# 🤖 SECTION 11 : ANALYSE IA (SENTIMENT & PROMOTIONS)

### Diagramme de cas d'utilisation — Analyse IA

```mermaid
flowchart LR
    P(["Commercant PRO"])

    subgraph S11 ["Section 11 - Analyse IA Sentiment et Promotions"]
        UC1(["Analyser les avis clients"])
        UC2(["Voir score de sentiment"])
        UC3(["Creer promo assistee IA"])
        UC4(["Valider suggestion IA"])
        UC5(["Modifier suggestion IA"])
        UC1 -.->|inclut| UC2
        UC3 -.->|inclut| UC4
        UC3 -.->|etend| UC5
    end

    P --> UC1 & UC2 & UC3
```

---

# 🛡️ SECTION 12 : ADMINISTRATION & SUPPORT

### Diagramme de cas d'utilisation — Administration et Support

```mermaid
flowchart LR
    A(["Administrateur"])
    C(["Client"])

    subgraph S12 ["Section 12 - Administration et Support"]
        UC1(["Moderer le contenu"])
        UC2(["Suspendre un utilisateur"])
        UC3(["Traiter un ticket"])
        UC4(["Consulter le tableau admin"])
        UC5(["Signaler un contenu"])
        UC5 -.->|inclut| UC1
    end

    A --> UC1 & UC2 & UC3 & UC4
    C --> UC5
```

---

## 2️⃣5️⃣ Signalement et modération de contenu

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Serveur as API Modération
    participant BD as Base de données
    participant Admin as Dashboard Admin (SaaS)

    Client->>Application: Clique "Signaler" sur un contenu inapproprié
    Application->>Serveur: Envoie le signalement avec le motif
    Serveur->>BD: Enregistre le signalement
    Serveur->>BD: Compte le total des signalements pour ce contenu
    BD-->>Serveur: Nombre total de signalements

    alt Seuil de signalements dépassé (> 3)
        Serveur->>BD: Masque automatiquement le contenu
        BD-->>Serveur: Contenu masqué
        Serveur->>Admin: Notification "Contenu à examiner"
        Admin-->>Administrateur: 🔔 Nouveau contenu à modérer
    else Seuil non atteint
        BD-->>Serveur: Signalement enregistré
    end

    Serveur-->>Application: "Signalement enregistré — Merci"
    Application-->>Client: ✅ Confirmation du signalement
```
**Fichiers :** `saas/app/admin/moderation/page.tsx` · `saas/backend/content/admin.py`

---

## 2️⃣6️⃣ Gestion des utilisateurs et tickets de support

```mermaid
sequenceDiagram
    actor Administrateur
    participant Admin as Dashboard Admin (SaaS)
    participant Serveur as API Administration (Django)
    participant BD as Base de données

    Administrateur->>Admin: Recherche un utilisateur suspect
    Admin->>Serveur: Demande les informations de l'utilisateur
    Serveur->>BD: Récupère le profil, l'historique et les signalements
    BD-->>Serveur: Données complètes de l'utilisateur
    Serveur-->>Admin: Affiche le profil et l'historique
    Administrateur->>Admin: Clique "Suspendre le compte" avec motif

    Admin->>Serveur: Demande de suspension
    Serveur->>BD: Met à jour le statut à "Suspendu" avec motif et date
    BD-->>Serveur: Confirmation de suspension
    Serveur-->>Admin: Suspension confirmée
    Admin-->>Administrateur: ✅ "Compte suspendu — Utilisateur déconnecté"

    Note over Serveur,BD: L'utilisateur suspendu est déconnecté immédiatement de tous ses appareils
    Note over BD: Toutes les actions de modération sont journalisées (audit trail)
```
**Fichiers :** `saas/app/admin/users/page.tsx` · `saas/backend/users/admin.py` · `saas/backend/support/admin.py`

---

## 2️⃣7️⃣ Notifications en temps réel

```mermaid
sequenceDiagram
    participant Action as Événement système
    participant BD as Base de données
    participant Realtime as Supabase Realtime (WebSocket)
    participant Application as Application Mobile / Dashboard

    Action->>BD: Un événement métier se produit (commande, like, message, avis)
    BD->>BD: Trigger PostgreSQL détecte l'insertion
    BD->>Realtime: Déclenche une diffusion sur le canal concerné
    Realtime->>Application: Pousse la notification via WebSocket
    Application-->>Utilisateur: 🔔 Notification affichée (badge, bannière, son)

    Note over BD,Realtime: Notifications automatiques sans action manuelle — déclenchées par les triggers PostgreSQL
    Note over Realtime: Connexion WebSocket permanente — latence < 100ms
```
**Fichiers :** `lib/actions/notifications.ts` · `lib/notifications.ts`

---

# 📋 TABLEAU RÉCAPITULATIF

| # | Section | Fonctionnalité | Acteurs principaux |
|---|---------|---------------|-------------------|
| 1 | Auth | Inscription | Utilisateur, App, Supabase Auth, BD, SendGrid |
| 2 | Auth | Connexion | Utilisateur, App, Rate Limiter, Supabase Auth, BD |
| 3 | Auth | Page protégée | Utilisateur, Middleware, Supabase Auth, BD |
| 4 | Boutique | Création boutique | Commerçant, Dashboard, Cloudinary, API, BD |
| 5 | Boutique | Validation Admin | Admin, Dashboard SaaS, Django API, BD, Notifs |
| 6 | Boutique | Modification profil | Commerçant, Dashboard, API, BD (RLS) |
| 7 | Catalogue | Ajout produit | Commerçant, Dashboard, Cloudinary, API, BD |
| 8 | Catalogue | Consultation catalogue | Client, App, API, BD |
| 9 | Commandes | Panier + Commande | Client, App, Panier, API, BD, Notifs |
| 10 | Commandes | Traitement + QR Code | Client, Commerçant, Dashboard, API, BD, Notifs |
| 11 | Réservations | Prise de RDV | Client, App, API, BD, Supabase Realtime |
| 12 | Réservations | Clôture réservation | Commerçant, Dashboard, API, BD, Realtime |
| 13 | IA | Recherche sémantique | Client, App, API IA, OpenRouter (LLM), pgvector |
| 14 | IA | Recherche par photo | Client, App, API Vision, Groq Vision, BD |
| 15 | Recherche | Filtres géographiques | Client, App, API, PostGIS |
| 16 | Contenu | Publication Reel/Story | Commerçant, Dashboard, Cloudinary, API, BD |
| 17 | Contenu | Like/Sauvegarde | Client, App, API, BD |
| 18 | Messagerie | Chat temps réel | Client, App, Supabase Realtime, BD, Dashboard |
| 19 | Avis | Dépôt + Réponse IA | Client, App, API, BD, LLM |
| 20 | Sécurité IA | Détection de fraude | Commerçant, Dashboard, API, Groq (IA), BD, Admin |
| 21 | Analytics | Tableau de bord | Commerçant, Dashboard, API, PostgreSQL |
| 22 | IA | Assistant conversationnel | Utilisateur, App, API IA, pgvector (RAG), LLM |
| 23 | IA | Analyse de sentiment des avis | Commerçant, Dashboard, API, Groq/OpenRouter, BD |
| 24 | IA | Recommandation de promotions | Commerçant, Dashboard, API, OpenRouter (IA), BD |
| 25 | Admin | Signalement + Modération | Client, App, API, BD, Dashboard Admin |
| 26 | Admin | Gestion utilisateurs | Admin, Dashboard SaaS, Django API, BD |
| 27 | Système | Notifications temps réel | Événement, BD, Supabase Realtime, App |

**Total : 27 diagrammes · Toutes les fonctionnalités couvertes · Stack complète visible**
