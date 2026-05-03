# 📊 Diagrammes UML - Ro2ya Marketplace

**Pour:** Rapport PFE - GLSI  
**Plateforme:** Ro2ya - Marketplace Tunisienne  
**Date:** Mai 2026

> 📌 **Note:** Ce document présente d'abord les diagrammes de cas d'utilisation (par acteur), puis les diagrammes de séquence détaillant les flux principaux de la plateforme.

---

## 📑 Table des Matières

### Partie A — Diagrammes de Cas d'Utilisation
1. [Cas d'utilisation — Client](#cas-dutilisation--client)
2. [Cas d'utilisation — Commerçant](#cas-dutilisation--commerçant-pro)
3. [Cas d'utilisation — Administrateur](#cas-dutilisation--administrateur)

### Partie B — Diagrammes de Séquence
4. [Authentification](#1️⃣-authentification)
5. [Système de Commandes](#2️⃣-système-de-commandes)
6. [Système de Réservations](#3️⃣-système-de-réservations)
7. [Validation par QR Code](#4️⃣-validation-par-qr-code)
8. [Messagerie & Chat](#5️⃣-messagerie--chat)
9. [Recherche Intelligente](#6️⃣-recherche-intelligente)
10. [Système d'Avis](#7️⃣-système-davis)
11. [Gestion des Favoris](#8️⃣-gestion-des-favoris)
12. [Notifications](#9️⃣-notifications)

---

## 📊 Partie A : Diagrammes de Cas d'Utilisation

---

### Cas d'utilisation — Client

**Acteur :** 👤 Client (consommateur inscrit sur la plateforme Ro2ya)

```mermaid
flowchart LR
    Client(["👤 Client"])

    subgraph SYS ["Système Ro2ya — Espace Client"]
        UC1["S'inscrire / Se connecter"]
        UC2["Rechercher un produit / service\n(Français, Arabe, Darija)"]
        UC3["Rechercher par image (IA Vision)"]
        UC4["Explorer les établissements"]
        UC5["Consulter la fiche d'un établissement"]
        UC6["Consulter le détail d'un produit"]
        UC7["Ajouter au panier"]
        UC8["Passer une commande"]
        UC9["Suivre le statut d'une commande\n(QR Code de suivi)"]
        UC10["Réserver un service"]
        UC11["Consulter ses réservations"]
        UC12["Laisser un avis / évaluation"]
        UC13["Envoyer un message au commerçant"]
        UC14["Visionner des Reels"]
        UC15["Enregistrer un établissement (Favoris)"]
        UC16["Gérer son profil"]
        UC17["Consulter ses notifications"]
        UC18["Utiliser l'assistant IA"]
    end

    Client --> UC1
    Client --> UC2
    Client --> UC3
    Client --> UC4
    Client --> UC5
    Client --> UC6
    Client --> UC7
    Client --> UC8
    Client --> UC9
    Client --> UC10
    Client --> UC11
    Client --> UC12
    Client --> UC13
    Client --> UC14
    Client --> UC15
    Client --> UC16
    Client --> UC17
    Client --> UC18

    UC7 -.->|"inclut"| UC6
    UC8 -.->|"inclut"| UC7
    UC9 -.->|"étend"| UC8
    UC12 -.->|"nécessite"| UC8
```

---

### Cas d'utilisation — Commerçant (Pro)

**Acteur :** 🏪 Commerçant / Prestataire de services inscrit comme "Pro" sur la plateforme

```mermaid
flowchart LR
    Pro(["🏪 Commerçant"])

    subgraph SYS ["Système Ro2ya — Espace Commerçant"]
        direction TB
        UC1["S'inscrire / Se connecter"]
        UC2["Créer / Gérer son établissement"]
        UC3["Ajouter / Modifier / Supprimer\nun produit ou service"]
        UC4["Gérer le stock des produits"]
        UC5["Consulter les commandes reçues"]
        UC6["Valider une commande\n(Génération QR Code)"]
        UC7["Confirmer la livraison\n(Scan QR Code Client)"]
        UC8["Annuler une commande"]
        UC9["Consulter les réservations reçues"]
        UC10["Confirmer / Refuser une réservation"]
        UC11["Marquer un service comme terminé"]
        UC12["Répondre aux avis clients"]
        UC13["Répondre aux messages clients"]
        UC14["Publier un Reel promotionnel"]
        UC15["Publier une Story (24h)"]
        UC16["Consulter le tableau de bord\n(Statistiques & Revenus)"]
        UC17["Utiliser l'agent IA (Recommandations)"]
        UC18["Consulter les transactions"]
        UC19["Gérer les leads / demandes de contact"]
        UC20["Mettre à jour le profil du magasin"]
    end

    Pro --> UC1
    Pro --> UC2
    Pro --> UC3
    Pro --> UC4
    Pro --> UC5
    Pro --> UC6
    Pro --> UC7
    Pro --> UC8
    Pro --> UC9
    Pro --> UC10
    Pro --> UC11
    Pro --> UC12
    Pro --> UC13
    Pro --> UC14
    Pro --> UC15
    Pro --> UC16
    Pro --> UC17
    Pro --> UC18
    Pro --> UC19
    Pro --> UC20

    UC6 -.->|"inclut"| UC5
    UC7 -.->|"étend"| UC6
    UC11 -.->|"étend"| UC10
```

---

### Cas d'utilisation — Administrateur

**Acteur :** 🛡️ Administrateur système (accès à la plateforme SaaS d'administration)

```mermaid
flowchart LR
    Admin(["🛡️ Administrateur"])

    subgraph SYS ["Système Ro2ya — Espace Administration SaaS"]
        direction TB
        UC1["Se connecter (Auth Admin)"]
        UC2["Consulter le tableau de bord global\n(KPIs, Graphiques)"]
        UC3["Approuver / Rejeter / Suspendre\nun établissement"]
        UC4["Gérer les commerçants inscrits"]
        UC5["Gérer les utilisateurs\n(Clients & Pros)"]
        UC6["Suspendre / Réactiver un compte"]
        UC7["Consulter toutes les commandes"]
        UC8["Exporter les commandes (CSV)"]
        UC9["Consulter les transactions\net paiements"]
        UC10["Générer des rapports de revenus"]
        UC11["Modérer les avis clients"]
        UC12["Approuver / Rejeter / Masquer un avis"]
        UC13["Consulter les alertes de fraude"]
        UC14["Gérer les bannières publicitaires"]
        UC15["Créer des codes promo / coupons"]
        UC16["Gérer les tickets de support"]
        UC17["Répondre aux tickets commerçants"]
        UC18["Configurer les paramètres système"]
        UC19["Surveiller la santé de la plateforme\n(Uptime, API, DB)"]
        UC20["Gérer le contenu CMS"]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20

    UC3 -.->|"inclut"| UC4
    UC6 -.->|"étend"| UC5
    UC8 -.->|"étend"| UC7
    UC12 -.->|"inclut"| UC11
    UC17 -.->|"inclut"| UC16
```

---

## 📋 Partie B : Diagrammes de Séquence

---

## 1️⃣ Authentification

### 1.1 Flux d'Inscription (Signup)

**Objectif:** Un nouvel utilisateur crée un compte sur la plateforme.

**Étapes simples:**
1. L'utilisateur remplit le formulaire (email, mot de passe, prénom, nom, téléphone)
2. Le système vérifie que l'email n'existe pas déjà
3. Un compte est créé dans la base de données
4. Un email de confirmation est envoyé
5. L'utilisateur confirme son email en cliquant le lien
6. Le compte est activé

```mermaid
sequenceDiagram
    participant U as 👤 Utilisateur
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données
    participant EMAIL as 📧 Système Email

    U->>APP: 1. Remplir formulaire d'inscription
    APP->>DB: 2. Vérifier si email existe
    
    alt Email déjà utilisé
        DB-->>APP: ❌ Email existe
        APP-->>U: Erreur: Email déjà utilisé
    else Email valide
        DB-->>APP: ✅ Email libre
        APP->>DB: 3. Créer profil utilisateur
        DB-->>APP: Profil créé
        
        APP->>EMAIL: 4. Envoyer email de confirmation
        EMAIL-->>U: 📨 Email de confirmation reçu
        
        U->>APP: 5. Cliquer sur lien de confirmation
        APP->>DB: 6. Marquer email comme vérifié
        DB-->>APP: ✅ Compte activé
        APP-->>U: 🎉 Inscription réussie!
    end
```

---

### 1.2 Flux de Connexion (Login)

**Objectif:** Un utilisateur existant se connecte à son compte.

**Étapes simples:**
1. L'utilisateur entre son email et mot de passe
2. Le système vérifie les identifiants
3. Une session de sécurité est créée
4. L'utilisateur est redirigé selon son rôle

```mermaid
sequenceDiagram
    participant U as 👤 Utilisateur
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données
    participant AUTH as 🔐 Système Auth

    U->>APP: 1. Entrer email et mot de passe
    APP->>AUTH: 2. Vérifier identifiants
    
    alt Identifiants invalides
        AUTH-->>APP: ❌ Email/MDP incorrect
        APP-->>U: Erreur: Identifiants invalides
    else Identifiants valides
        AUTH->>DB: Récupérer rôle utilisateur
        DB-->>AUTH: Rôle: admin/pro/client
        
        AUTH-->>APP: ✅ Authentification réussie
        APP->>APP: 3. Créer session sécurisée
        
        alt Rôle = client
            APP-->>U: → Redirection vers accueil ("/")
        else Rôle = pro
            AUTH->>DB: Vérifier si le magasin existe
            DB-->>AUTH: Store ID: 123
            APP-->>U: → Redirection vers tableau de bord ("/dashboard/123")
        else Rôle = admin
            APP-->>U: → Redirection vers panneau admin ("/admin/dashboard")
        end
    end
```

---

## 2️⃣ Système de Commandes

### 2.1 Flux Complet d'une Commande

**Objectif:** Un client commande un produit dans un magasin, le propriétaire valide, et la commande est livrée.

```mermaid
sequenceDiagram
    participant C as 👤 Client
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données
    participant O as 👨‍💼 Propriétaire Magasin
    participant QR as 📱 QR Code

    Note over C,O: Phase 1: Client crée une commande

    C->>APP: 1. Sélectionner produit et quantité
    C->>APP: 2. Entrer adresse de livraison
    C->>APP: 3. Cliquer "Passer la commande"
    
    APP->>DB: Créer commande (Status: PENDING)
    DB->>DB: Générer numéro: ORD-XXXXX-XXXX
    DB-->>APP: ✅ Commande créée
    
    APP-->>C: 📱 Numéro de commande et détails reçus

    Note over C,O: Phase 2: Propriétaire voit la demande

    APP->>O: 🔔 Notification: Nouvelle commande
    O->>APP: Consulter tableau de bord (Demandes)
    APP-->>O: Afficher détails de la commande:
    APP-->>O: - Nom du client + téléphone
    APP-->>O: - Produit commandé + quantité
    APP-->>O: - Prix total
    APP-->>O: - Adresse de livraison

    Note over C,O: Phase 3: Propriétaire accepte ou refuse

    alt Propriétaire refuse la commande
        O->>APP: Cliquer "Refuser"
        APP->>DB: Marquer Status: CANCELLED
        APP->>C: 📧 Email: Commande refusée
        C-->>C: ❌ Commande rejetée
    else Propriétaire accepte la commande
        O->>APP: Cliquer "Accepter"
        APP->>DB: Marquer Status: VALIDATED
        APP->>DB: Générer tracking_code (QR)
        
        QR-->>APP: Code QR généré
        APP-->>O: Afficher QR code à imprimer
        APP->>C: 📧 Email: Commande acceptée!
        C->>C: ✅ Commande en cours de préparation

        Note over C,O: Phase 4: Livraison et confirmation

        O->>O: Préparer commande
        O->>C: 🚗 Livrer le produit
        C->>C: Recevoir produit
        C->>APP: Scanner QR code ou entrer code
        APP->>DB: Marquer Status: DELIVERED
        
        APP->>O: ✅ Commande livrée - Confirmer
        O->>APP: Confirmer livraison
        APP->>DB: Status: COMPLETED
        
        APP-->>C: 🎉 Commande terminée!
        APP-->>O: 💰 Paiement enregistré
    end
```

---

## 3️⃣ Système de Réservations

### 3.1 Flux de Réservation de Service

**Objectif:** Un client réserve un service (coiffeur, salon, etc.) dans un magasin.

```mermaid
sequenceDiagram
    participant C as 👤 Client
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données
    participant S as 👨‍💼 Prestataire

    Note over C,S: Phase 1: Consultation et recherche

    C->>APP: 1. Chercher services (ex: "coiffure")
    APP->>DB: Rechercher services
    DB-->>APP: Afficher disponibilités
    APP-->>C: 📋 Liste des services disponibles

    Note over C,S: Phase 2: Client fait une réservation

    C->>APP: 2. Sélectionner service + date + heure
    C->>APP: 3. Consulter prix et durée
    C->>APP: 4. Cliquer "Réserver"

    APP->>DB: Créer réservation (Status: PENDING)
    DB-->>APP: Réservation créée (ID: XXXXXX)
    
    APP-->>C: 📱 Confirmation de réservation

    Note over C,S: Phase 3: Prestataire reçoit et confirme

    APP->>S: 🔔 Notification: Nouvelle réservation
    S->>APP: Consulter les réservations
    APP-->>S: Afficher détails:
    APP-->>S: - Nom du client + téléphone
    APP-->>S: - Service demandé
    APP-->>S: - Date et heure réservée

    alt Prestataire refuse
        S->>APP: Cliquer "Refuser"
        APP->>DB: Status: REJECTED
        APP->>C: 📧 Réservation refusée
    else Prestataire confirme
        S->>APP: Cliquer "Confirmer"
        APP->>DB: Status: CONFIRMED
        APP->>C: 📧 Réservation confirmée
        C-->>C: ✅ Service réservé

        Note over C,S: Phase 4: Client se présente

        C->>S: 🏢 Arriver à l'heure
        S->>S: 👨‍💼 Effectuer le service
        S->>APP: Marquer Status: COMPLETED
        S->>C: ✅ Service terminé
        C->>APP: Évaluer le service (avis)
        APP-->>S: 📊 Avis reçu
    end
```

---

## 4️⃣ Validation par QR Code

### 4.1 Flux de Confirmation de Livraison (QR Code)

**Objectif:** Le propriétaire confirme la livraison en scannant un QR code généré pour chaque commande.

> **⚠️ Important:** La plateforme n'a PAS de système de paiement en ligne. Le paiement se fait:
> - Directement au propriétaire (en main à la livraison)
> - Ou via système externe (Ooredoo Money, Tunisie Telecom, etc.)

```mermaid
sequenceDiagram
    participant C as 👤 Client
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données
    participant O as 👨‍💼 Propriétaire
    participant QR as 📱 Scanner QR

    Note over C,QR: Phase 1: Commande validée par propriétaire

    O->>APP: 1. Propriétaire valide la commande
    APP->>DB: Marquer Status: VALIDATED
    APP->>DB: Générer tracking_code unique
    DB-->>APP: ✅ QR Code généré
    
    APP->>C: 📧 Email: Commande acceptée!
    C-->>C: ✅ QR Code reçu dans profil

    Note over C,QR: Phase 2: Préparation et livraison

    O->>O: 2. Préparer la commande
    C->>C: 3. Payer le propriétaire (en main)
    O->>C: 4. Livrer le produit

    Note over C,QR: Phase 3: Confirmation de livraison

    C->>APP: 5. Ouvrir l'app → Mes Commandes
    C->>APP: 6. Scanner le QR code OU entrer code manuel
    
    C->>QR: 📱 Présenter le QR code au propriétaire
    QR->>QR: 7. Scanner le code (Propriétaire)
    QR-->>APP: Code: QR-XYZ...

    App->>DB: Valider le tracking_code
    DB-->>APP: ✅ Code valide
    
    APP->>DB: Mettre à jour Status: COMPLETED
    DB-->>APP: ✅ Commande terminée
    
    Note over C,QR: Phase 4: Confirmations

    APP-->>C: 🎉 Commande confirmée!
    APP->>O: ✅ Livraison confirmée
    APP->>DB: Enregistrer transaction:
    APP->>DB: - order_id
    APP->>DB: - montant: 150 DT
    APP->>DB: - status: COMPLETED
    APP->>DB: - completed_at: timestamp

    alt Client peut aussi refuser
        C->>APP: Client clique "Non reçu"
        APP->>DB: Status: DISPUTED
        APP->>O: ⚠️ Réclamation: Commande non confirmée
    end
```

### 4.2 Flux de Paiement (OPTIONNEL - Futur)

> 📌 **À implémenter:** Intégration futur pour paiements en ligne

**Services possibles:**
- Stripe (paiements carte bancaire)
- Ooredoo Money (paiement mobile Tunisie)
- Tunisie Telecom (paiement mobile)
- Konnect (agrégateur paiements tunisien)

---

## 5️⃣ Messagerie & Chat

### 5.1 Flux de Messagerie entre Client et Propriétaire

**Objectif:** Un client peut discuter directement avec le propriétaire du magasin.

```mermaid
sequenceDiagram
    participant C as 👤 Client
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données
    participant O as 👨‍💼 Propriétaire
    participant NOTIF as 🔔 Notifications

    Note over C,O: Phase 1: Initier la conversation

    C->>APP: 1. Cliquer "Contacter le magasin"
    APP->>DB: Créer conversation
    DB-->>APP: Conversation créée (ID: XYZ)
    APP-->>C: 💬 Chat ouvert

    Note over C,O: Phase 2: Client envoie un message

    C->>APP: 2. Taper message: "Quel est le prix?"
    C->>APP: 3. Cliquer "Envoyer"
    
    APP->>DB: Enregistrer message
    DB-->>APP: Message sauvegardé
    
    APP->>NOTIF: Envoyer notification
    NOTIF->>O: 🔔 Nouveau message du client

    APP-->>C: ✅ Message envoyé

    Note over C,O: Phase 3: Propriétaire reçoit et répond

    O->>APP: 4. Ouvrir la messagerie
    APP-->>O: Afficher tous les messages
    O->>O: 5. Lire le message du client
    
    O->>APP: 6. Taper réponse: "150 DT"
    O->>APP: 7. Cliquer "Envoyer"
    
    APP->>DB: Enregistrer réponse
    DB-->>APP: Message sauvegardé
    
    APP->>NOTIF: Envoyer notification
    NOTIF->>C: 🔔 Réponse du magasin

    APP-->>O: ✅ Message envoyé

    Note over C,O: Phase 4: Client voit la réponse
    
    C->>APP: 8. Consulter ses messages (Vue Client)
    APP-->>C: Afficher réponse: "150 DT"
    C->>C: ✅ Info reçue
```

---

## 6️⃣ Recherche Intelligente

### 6.1 Flux de Recherche Sémantique en Darija

**Objectif:** Un utilisateur cherche un produit en dialecte tunisien (Darija), le système le comprend.

> **Modèles IA utilisés:**
> - **Groq (Llama 3.1 8B)** - Normalisation et traduction Darija
> - **OpenRouter (baai/bge-m3)** - Génération de vecteurs d'embedding

```mermaid
sequenceDiagram
    Note over U,AI: Phase 1: Traitement Intelligent de la Requête
    
    U->>APP: 1. Taper: "نتاع الشعر" (Darija)
    
    APP->>APP: 2. Pré-normalisation (Dictionnaire Local)
    Note right of APP: Traduction directe des mots clés connus
    
    APP->>AI: 3. Normalisation LLM (Darija -> Français)
    AI-->>APP: "Produits de soin capillaire"
    
    APP->>AI: 4. Expansion de requête (Synonymes)
    AI-->>APP: "shampoing, après-shampoing, soin, cuir chevelu..."

    Note over U,AI: Phase 2: Recherche Hybride & Vectorielle
    
    APP->>AI: 5. Génération d'Embedding (Vecteur)
    AI-->>APP: [0.12, -0.45, 0.88, ...] (768 dims)
    
    APP->>DB: 6. Recherche Hybride (Vector + ILIKE)
    DB-->>APP: Liste de résultats bruts
    
    APP->>APP: 7. Fusion RRF (Reciprocal Rank Fusion)
    Note right of APP: Combine les scores vectoriels et textuels
    
    APP->>AI: 8. Re-ranking LLM (Pertinence finale)
    AI-->>APP: Top 10 produits triés
    
    APP-->>U: 📋 Affichage des résultats optimisés
    U->>U: ✅ Résultats ultra-pertinents trouvés!
```

---

## 7️⃣ Système d'Avis

### 7.1 Flux de Publication d'Avis

**Objectif:** Un client laisse un avis sur un produit ou service qu'il a acheté.

```mermaid
sequenceDiagram
    participant C as 👤 Client
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données
    participant NOTIF as 🔔 Notifications
    participant O as 👨‍💼 Propriétaire

    Note over C,O: Phase 1: Client ouvre la page avis

    C->>APP: 1. Aller sur produit/service acheté
    APP->>DB: Vérifier transaction terminée
    DB-->>APP: Achat/Réservation trouvé
    APP-->>C: 📝 Afficher formulaire d'avis

    Note over C,O: Phase 2: Client remplit l'avis

    C->>C: 2. Donner une note: ⭐⭐⭐⭐ (4/5)
    C->>C: 3. Écrire commentaire: "Excellent produit!"
    C->>APP: 4. Ajouter photos (optionnel)
    
    C->>APP: 5. Cliquer "Publier avis"

    Note over C,O: Phase 3: Enregistrement de l'avis

    APP->>DB: Valider avis
    DB-->>APP: Validation OK
    
    APP->>DB: Enregistrer avis
    APP->>DB: - Note: 4/5
    APP->>DB: - Commentaire: "Excellent produit!"
    APP->>DB: - Date d'avis
    APP->>DB: - Photos
    
    DB-->>APP: ✅ Avis enregistré

    Note over C,O: Phase 4: Notification du propriétaire

    APP->>NOTIF: Notifier le propriétaire
    NOTIF->>O: 🔔 Nouvel avis: 4 ⭐

    Note over C,O: Phase 5: Affichage de l'avis

    APP-->>C: ✅ Avis publié avec succès!
    
    APP->>DB: Mettre à jour note moyenne:
    APP->>DB: (3.5 + 4) / 2 = 3.75 ⭐
    
    APP-->>C: 📋 Afficher avis sur la page produit
    APP-->>O: Consulter les avis

    Note over C,O: Phase 6: Réponse du propriétaire

    O->>APP: 6. Lire l'avis
    O->>APP: 7. Répondre: "Merci beaucoup!"
    
    APP->>DB: Enregistrer réponse
    APP-->>C: 💬 Le propriétaire a répondu
```

---

## 8️⃣ Gestion des Favoris

### 8.1 Flux d'Ajout aux Favoris

**Objectif:** Un client ajoute un produit ou magasin à ses favoris.

```mermaid
sequenceDiagram
    participant C as 👤 Client
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données

    Note over C,DB: Phase 1: Client consulte un produit

    C->>APP: 1. Ouvrir page produit
    APP->>DB: Récupérer détails produit
    DB-->>APP: Données produit
    APP-->>C: 📱 Afficher produit avec bouton ❤️

    Note over C,DB: Phase 2: Client ajoute aux favoris

    C->>APP: 2. Cliquer sur ❤️ (Ajouter aux favoris)
    
    APP->>DB: Vérifier si déjà enregistré
    DB-->>APP: Non, pas encore enregistré
    
    APP->>DB: Créer lien (Table: saved_places)
    APP->>DB: - user_id: 123
    APP->>DB: - store_id: 456
    
    DB-->>APP: ✅ Ajouté aux favoris

    Note over C,DB: Phase 3: Mise à jour visuelle

    APP-->>C: ❤️ Le bouton devient rempli (rouge)
    APP-->>C: Notification: "Ajouté à vos favoris"

    Note over C,DB: Phase 4: Client consulte ses favoris

    C->>APP: 3. Aller à "Mes Établissements Enregistrés"
    APP->>DB: Récupérer saved_places du client
    DB-->>APP: Liste des établissements
    APP-->>C: 📋 Afficher magasins enregistrés:

    Note over C,DB: Phase 5: Supprimer des favoris

    C->>APP: 4. Cliquer ❌ sur un produit pour supprimer
    APP->>DB: Supprimer lien favori
    DB-->>APP: ✅ Supprimé
    APP-->>C: 📋 Produit retiré des favoris
```

---

## 9️⃣ Notifications

### 9.1 Flux de Notification en Temps Réel

**Objectif:** L'utilisateur reçoit des notifications pour les événements importants.

```mermaid
sequenceDiagram
    participant U as 👤 Utilisateur
    participant APP as 🌐 Application
    participant DB as 💾 Base de Données (Supabase)
    participant RT as ⚡ Real-time (WebSocket)

    Note over U,DEVICE: Phase 1: Événement déclenche une notification

    DB->>APP: Action (ex: Nouvel avis enregistré)
    APP->>DB: createNotification()
    DB-->>DB: Insertion dans la table 'notifications'
    
    Note over U,RT: Phase 2: Réception en temps réel

    DB->>RT: Émission de l'événement (Insert)
    RT->>APP: 📲 WebSocket: Nouvelle notification reçue
    APP-->>U: 🔔 Affichage de la pastille/toast dans l'app

    Note over U,RT: Phase 3: Utilisateur consulte la notification

    U->>APP: Cliquer sur la notification (toast)
    APP->>APP: Naviguer vers la page concernée
    APP-->>U: 📋 Afficher les détails

    Note over U,RT: Phase 4: Marquer comme lu

    APP->>DB: markAsRead(notificationId)
    DB-->>APP: ✅ is_read = true
    APP-->>U: ✅ Notification grisée (lue)

    Note over U,RT: Phase 5: Centre de notifications

    U->>APP: Consulter "Notifications"
    APP->>DB: Récupérer toutes les notifications
    DB-->>APP: Liste de notifications
    APP-->>U: 📋 Afficher:
    APP-->>U: 🔴 [Nouveau] Commande livrée (maintenant)
    APP-->>U: ⚪ Nouvel avis (hier)
    APP-->>U: ⚪ Message du magasin (2 jours)
```

---

## 🎯 Résumé des Flux Principaux

| Flux | Acteurs | Objectif | Étapes |
|------|---------|----------|--------|
| **Authentification** | Client | Se connecter | 3-5 |
| **Commande** | Client + Propriétaire | Vendre/Acheter | 4-5 |
| **QR Validation** | Client + Propriétaire | Confirmer livraison | 4-5 |
| **Réservation** | Client + Prestataire | Réserver service | 4 |
| **Messagerie** | Client + Propriétaire | Communiquer | 4-5 |
| **Recherche** | Client + IA | Trouver produits | 4 |
| **Avis** | Client + Propriétaire | Évaluer | 5-6 |
| **Favoris** | Client | Sauvegarder | 3-4 |
| **Notifications** | Système + Client | Informer | 3-5 |

---

## 🏗️ Architecture Générale Simplifiée

```
┌──────────────────────────────────────────────────────────────┐
│                    🌐 Frontend (React)                       │
│        Pages, Formulaires, Notifications Visuelles           │
└──────────────────────┬───────────────────────────────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ API Routes  │  │Server Actions│  │ Middleware   │
│ (Backend)   │  │ (Backend)    │  │ (Sécurité)   │
└─────────────┘  └──────────────┘  └──────────────┘
    │                  │                  │
    └──────────────────┼──────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │  📊 Base de Données         │
         │  (PostgreSQL - Supabase)    │
         │                             │
         │  • Users & Profiles         │
         │  • Products & Stores        │
         │  • Orders & Transactions    │
         │  • Messages & Reviews       │
         │  • Favorites & Bookings     │
         └─────────────────────────────┘
                        │
    ┌──────────────────┼──────────────────┬──────────────────┐
    │                  │                  │                  │
    ▼                  ▼                  ▼                  ▼
┌──────────┐    ┌────────────┐    ┌──────────┐    ┌────────────┐
│ Email    │    │ AI (Groq)  │    │ Storage  │    │ QStash     │
│Service   │    │ + Search   │    │ (Images) │    │ (Workers)  │
└──────────┘    └────────────┘    └──────────┘    └────────────┘
```

---

## 📚 Glossaire pour le Rapport

### Termes Techniques Simplifiés

| Terme | Explication Simple |
|-------|------------------|
| **Database** | Base de données = Classeur électronique où tout est enregistré |
| **API** | Service qui reçoit les demandes et les traite |
| **Session** | Connexion active entre l'utilisateur et l'application |
| **Status** | État de quelque chose (PENDING = en attente, VALIDATED = validé) |
| **Notification** | Message d'alerte envoyé à l'utilisateur |
| **QR Code** | Code barre à scanner pour confirmer |
| **Middleware** | Filtre de sécurité pour protéger l'application |
| **Server Action** | Fonction qui s'exécute sur le serveur (sûr) |
| **Real-time** | En temps réel (immédiat) |
| **Transaction** | Enregistrement d'une opération (paiement, etc.) |

---

## 🔒 Considérations de Sécurité

Chaque flux intègre:
- ✅ **Authentification** - Vérifier que l'utilisateur est bien celui qu'il prétend être
- ✅ **Autorisation** - Vérifier que l'utilisateur a le droit de faire cette action
- ✅ **Validation** - Vérifier que les données sont correctes
- ✅ **Chiffrement** - Protéger les données sensibles
- ✅ **Audit** - Enregistrer toutes les actions importantes

---

## 📝 Notes pour le Rapport PFE

### 🔴 Point Important: Pas de Paiement en Ligne

**La plateforme Ro2ya n'intègre PAS de système de paiement en ligne.** Cela signifie:

| Aspect | Détail |
|--------|--------|
| **Paiement Actuel** | En main à la livraison (cash) |
| **Traçabilité** | Enregistrement de la transaction dans la DB |
| **QR Code** | Confirmation de livraison (pas de paiement) |
| **Transactions enregistrées** | Historique uniquement, pas d'argent traité |

**Raisons possibles:**
1. ✅ Marché Tunisien préfère paiement cash
2. ✅ Compliance PCI-DSS complexe
3. ✅ Phase MVP - paiement = futur
4. ✅ Autorités Tunisiennes (réglementation)

**À ajouter dans le rapport:**
- [ ] Diagramme: Flux actuel (sans paiement)
- [ ] Table: Services paiement à intégrer
- [ ] Timeline: Quand implémenter le paiement
- [ ] Risques: Sécurité, conformité


Ces diagrammes montrent les **flux utilisateur** de manière simple. Chaque ligne représente une action, chaque flèche une communication. Cela aide à:

1. **Comprendre le système** - Voir comment tout fonctionne ensemble
2. **Identifier les problèmes** - Voir où ça peut casser
3. **Optimiser le processus** - Voir où on peut améliorer
4. **Documenter le projet** - Garder une trace claire

### Comment présenter dans le rapport?

1. **Introduction** - Expliquer que la plateforme a 9 flux principaux
2. **Pour chaque flux** - Ajouter:
   - Objectif du flux
   - Les acteurs impliqués
   - Les étapes principales
   - Le diagramme de séquence
   - Les cas d'erreur
3. **Conclusion** - Résumer l'architecture générale

### Questions à traiter dans le rapport

- ✅ Quel est le flux le plus critique? *Réponse: Commandes + Paiements*
- ✅ Quels sont les risques de sécurité? *Réponse: Authentification faible, données sensibles*
- ✅ Comment améliorer les performances? *Réponse: Cache, Base de données optimisée*
- ✅ Comment gérer les erreurs? *Réponse: Logs, Alerts, Retry logic*

---

## 🚀 Prochaines Étapes Recommandées

Pour la plateforme:
1. Ajouter **paiement mobile** (Ooredoo Money, Tunisie Telecom)
2. Ajouter **géolocalisation** pour les recherches proches
3. Ajouter **recommandations personnalisées** par IA
4. Ajouter **système de notation des utilisateurs**
5. Ajouter **support vidéo** pour les services

Pour le rapport:
1. Ajouter des **cas d'usage détaillés**
2. Ajouter des **statistiques** (nombre d'utilisateurs, transactions, etc.)
3. Ajouter des **captures d'écran** de l'interface
4. Ajouter des **plans d'amélioration futurs**
5. Ajouter des **métriques de performance**

---

**Créé pour le projet PFE - Mai 2026**  
**Étudiants:** Khaireddine Dab & Abderrahman Abdelli


---

### Diagramme de Cas d'Utilisation — Acteur : Client

```mermaid
flowchart LR
    Client(["👤 Client"])

    subgraph SYS ["Système Ro2ya — Espace Client"]
        UC1["S'inscrire / Se connecter"]
        UC2["Rechercher un produit / service\n(Français, Arabe, Darija)"]
        UC3["Rechercher par image (IA Vision)"]
        UC4["Explorer les établissements"]
        UC5["Consulter la fiche d'un établissement"]
        UC6["Consulter le détail d'un produit"]
        UC7["Ajouter au panier"]
        UC8["Passer une commande"]
        UC9["Suivre le statut d'une commande\n(QR Code de suivi)"]
        UC10["Réserver un service"]
        UC11["Consulter ses réservations"]
        UC12["Laisser un avis / évaluation"]
        UC13["Envoyer un message au commerçant"]
        UC14["Visionner des Reels"]
        UC15["Enregistrer un établissement (Favoris)"]
        UC16["Gérer son profil"]
        UC17["Consulter ses notifications"]
        UC18["Utiliser l'assistant IA"]
    end

    Client --> UC1
    Client --> UC2
    Client --> UC3
    Client --> UC4
    Client --> UC5
    Client --> UC6
    Client --> UC7
    Client --> UC8
    Client --> UC9
    Client --> UC10
    Client --> UC11
    Client --> UC12
    Client --> UC13
    Client --> UC14
    Client --> UC15
    Client --> UC16
    Client --> UC17
    Client --> UC18

    UC7 -.->|"inclut"| UC6
    UC8 -.->|"inclut"| UC7
    UC9 -.->|"étend"| UC8
    UC12 -.->|"nécessite"| UC8
```

---

### Diagramme de Cas d'Utilisation — Acteur : Commerçant (Pro)

```mermaid
flowchart LR
    Pro(["🏪 Commerçant"])

    subgraph SYS ["Système Ro2ya — Espace Commerçant"]
        direction TB
        UC1["S'inscrire / Se connecter"]
        UC2["Créer / Gérer son établissement"]
        UC3["Ajouter / Modifier / Supprimer\nun produit ou service"]
        UC4["Gérer le stock des produits"]
        UC5["Consulter les commandes reçues"]
        UC6["Valider une commande\n(Génération QR Code)"]
        UC7["Confirmer la livraison\n(Scan QR Code Client)"]
        UC8["Annuler une commande"]
        UC9["Consulter les réservations reçues"]
        UC10["Confirmer / Refuser une réservation"]
        UC11["Marquer un service comme terminé"]
        UC12["Répondre aux avis clients"]
        UC13["Répondre aux messages clients"]
        UC14["Publier un Reel promotionnel"]
        UC15["Publier une Story (24h)"]
        UC16["Consulter le tableau de bord\n(Statistiques & Revenus)"]
        UC17["Utiliser l'agent IA (Recommandations)"]
        UC18["Consulter les transactions"]
        UC19["Gérer les leads / demandes de contact"]
        UC20["Mettre à jour le profil du magasin"]
    end

    Pro --> UC1
    Pro --> UC2
    Pro --> UC3
    Pro --> UC4
    Pro --> UC5
    Pro --> UC6
    Pro --> UC7
    Pro --> UC8
    Pro --> UC9
    Pro --> UC10
    Pro --> UC11
    Pro --> UC12
    Pro --> UC13
    Pro --> UC14
    Pro --> UC15
    Pro --> UC16
    Pro --> UC17
    Pro --> UC18
    Pro --> UC19
    Pro --> UC20

    UC6 -.->|"inclut"| UC5
    UC7 -.->|"étend"| UC6
    UC11 -.->|"étend"| UC10
```

---

### Diagramme de Cas d'Utilisation — Acteur : Administrateur

```mermaid
flowchart LR
    Admin(["🛡️ Administrateur"])

    subgraph SYS ["Système Ro2ya — Espace Administration SaaS"]
        direction TB
        UC1["Se connecter (Auth Admin)"]
        UC2["Consulter le tableau de bord global\n(KPIs, Graphiques)"]
        UC3["Approuver / Rejeter / Suspendre\nun établissement"]
        UC4["Gérer les commerçants inscrits"]
        UC5["Gérer les utilisateurs\n(Clients & Pros)"]
        UC6["Suspendre / Réactiver un compte"]
        UC7["Consulter toutes les commandes"]
        UC8["Exporter les commandes (CSV)"]
        UC9["Consulter les transactions\net paiements"]
        UC10["Générer des rapports de revenus"]
        UC11["Modérer les avis clients"]
        UC12["Approuver / Rejeter / Masquer un avis"]
        UC13["Consulter les alertes de fraude"]
        UC14["Gérer les bannières publicitaires"]
        UC15["Créer des codes promo / coupons"]
        UC16["Gérer les tickets de support"]
        UC17["Répondre aux tickets commerçants"]
        UC18["Configurer les paramètres système"]
        UC19["Surveiller la santé de la plateforme\n(Uptime, API, DB)"]
        UC20["Gérer le contenu CMS"]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20

    UC3 -.->|"inclut"| UC4
    UC6 -.->|"étend"| UC5
    UC8 -.->|"étend"| UC7
    UC12 -.->|"inclut"| UC11
    UC17 -.->|"inclut"| UC16
```

---

**Créé pour le projet PFE - Mai 2026**  
**Étudiants:** Khaireddine Dab & Abderrahman Abdelli
