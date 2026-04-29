# Chapitre 2 : Conception

---

## I. Introduction

Ce chapitre présente la phase de conception de notre plateforme. Après avoir défini les besoins fonctionnels et non fonctionnels dans le chapitre précédent, nous allons maintenant modéliser le système à travers des diagrammes UML, définir l'architecture technique globale, et décrire le modèle de données. Cette phase est essentielle pour garantir la cohérence, la maintenabilité et la scalabilité de l'ensemble du système avant d'entamer le développement.

---

## II. Architecture Générale du Système

### 1. Vue d'Ensemble

Notre plateforme repose sur une architecture **three-tier** (trois couches) orientée services :

```
┌─────────────────────────────────────────────────────────┐
│                     COUCHE PRÉSENTATION                  │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Application Web │  │ App Mobile   │  │  Dashboard │  │
│  │   (Next.js)     │  │(React Native)│  │  (Next.js) │  │
│  └────────┬────────┘  └──────┬───────┘  └─────┬──────┘  │
└───────────┼──────────────────┼────────────────┼─────────┘
            │                  │                │
            ▼                  ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                      COUCHE LOGIQUE                      │
│           API REST / Server Actions (Next.js)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Auth    │ │  Search  │ │  Orders  │ │  Reels    │  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                     COUCHE DONNÉES                       │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ PostgreSQL       │  │   Supabase   │  │  Groq AI / │  │
│  │ + pgvector       │  │   Storage    │  │  Gemini   │  │
│  └──────────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2. Choix Technologiques

| Composante | Technologie | Justification |
|---|---|---|
| Frontend Web | Next.js 14 (App Router) | SSR/SSG, performance, SEO, Server Actions |
| Frontend Mobile | React Native (Expo) | Cross-platform iOS/Android, partage de logique |
| Backend | Next.js API Routes + Server Actions | Unification frontend/backend, serverless |
| Base de données | PostgreSQL (Supabase) | Robustesse, extensions (pgvector, RLS) |
| Authentification | Supabase Auth | JWT, OAuth, Magic Link, Row-Level Security |
| Stockage médias | Supabase Storage | CDN intégré, gestion des accès |
| Recherche sémantique | Groq AI / Gemini + pgvector | Modèles de langage et embeddings, similarité cosinus |
| Temps réel | Supabase Realtime | WebSockets gérés, notifications push |
| Déploiement | Vercel | CI/CD automatique, edge functions, scalabilité |

---

## III. Diagrammes de Cas d'Utilisation (Use Case)

### 1. Cas d'Utilisation — Consommateur (User)

```
                    ┌─────────────────────────────────┐
                    │           Système                │
                    │                                  │
    ┌────────┐      │  ┌─────────────────────────┐    │
    │        │──────┼─▶│  Rechercher un produit  │    │
    │        │      │  └─────────────────────────┘    │
    │        │      │  ┌─────────────────────────┐    │
    │        │──────┼─▶│  Consulter une boutique  │    │
    │  User  │      │  └─────────────────────────┘    │
    │        │      │  ┌─────────────────────────┐    │
    │        │──────┼─▶│  Passer une commande     │    │
    │        │      │  └─────────────────────────┘    │
    │        │      │  ┌─────────────────────────┐    │
    │        │──────┼─▶│  Visionner des reels     │    │
    │        │      │  └─────────────────────────┘    │
    │        │      │  ┌─────────────────────────┐    │
    │        │──────┼─▶│  Envoyer un message      │    │
    └────────┘      │  └─────────────────────────┘    │
                    │  ┌─────────────────────────┐    │
                    │  │  Gérer son profil        │    │
                    │  └─────────────────────────┘    │
                    └─────────────────────────────────┘
```

### 2. Cas d'Utilisation — Commerçant (Business Owner / Pro)

```
                    ┌─────────────────────────────────┐
                    │           Système                │
                    │                                  │
    ┌────────────┐  │  ┌─────────────────────────┐    │
    │            │──┼─▶│  Créer/gérer sa boutique │    │
    │            │  │  └─────────────────────────┘    │
    │            │  │  ┌─────────────────────────┐    │
    │ Commerçant │──┼─▶│  Ajouter des produits    │    │
    │            │  │  └─────────────────────────┘    │
    │            │  │  ┌─────────────────────────┐    │
    │            │──┼─▶│  Publier des reels       │    │
    │            │  │  └─────────────────────────┘    │
    │            │  │  ┌─────────────────────────┐    │
    │            │──┼─▶│  Gérer les commandes     │    │
    │            │  │  └─────────────────────────┘    │
    │            │  │  ┌─────────────────────────┐    │
    │            │──┼─▶│  Consulter les stats     │    │
    └────────────┘  │  └─────────────────────────┘    │
                    └─────────────────────────────────┘
```

### 3. Cas d'Utilisation — Administrateur

```
                    ┌─────────────────────────────────┐
                    │           Système                │
                    │                                  │
    ┌────────────┐  │  ┌─────────────────────────┐    │
    │            │──┼─▶│  Gérer les utilisateurs  │    │
    │            │  │  └─────────────────────────┘    │
    │   Admin    │──┼─▶│  Modérer le contenu      │    │
    │            │  │  └─────────────────────────┘    │
    │            │──┼─▶│  Consulter les stats     │    │
    │            │  │  └─────────────────────────┘    │
    │            │──┼─▶│  Gérer les boutiques     │    │
    └────────────┘  │  └─────────────────────────┘    │
                    └─────────────────────────────────┘
```

---

## IV. Diagrammes de Séquence

### 1. Séquence : Recherche Sémantique

```
Utilisateur    App Web     API Route       AI API      Supabase/pgvector   Google Maps
    │              │            │              │               │               │
    │─[Saisit requête]─▶│      │              │               │               │
    │              │─[POST /api/semantic-search]─▶│           │               │
    │              │            │─[Génère embedding]─▶│       │               │
    │              │            │◀─[Vecteur]──────────│       │               │
    │              │            │─[search_items_semantic(vector)]─▶│           │
    │              │            │◀─────────────────────[Résultats triés]│       │
    │              │            │              │               │               │
    │              │─[Si recherche locale]────────────────────────────────────▶│
    │              │            │              │               │      [Google Maps API]
    │              │◀──────────────────────────────────────────────────────────│
    │              │◀─[JSON résultats + Map]──│      │               │               │
    │◀─[Affiche résultats + Carte]──│   │              │               │               │
```

### 2. Séquence : Authentification

```
Utilisateur    App Web     Supabase Auth    Base de données
    │              │              │                │
    │─[Email+MDP]─▶│             │                │
    │              │─[signInWithPassword]─▶│       │
    │              │              │─[Vérifie credentials]─▶│
    │              │              │◀─[User data + role]────│
    │              │◀─[JWT Token]─│                │
    │              │─[Fetch role]─────────────────▶│
    │              │◀─[Rôle: user/pro/admin]───────│
    │              │─[Redirige selon rôle]          │
    │◀─[Dashboard approprié]──│   │                │
```

### 3. Séquence : Passage de Commande

```
Utilisateur    App Web     API Route      Supabase DB    Commerçant
    │              │            │              │               │
    │─[Valide panier]─▶│        │              │               │
    │              │─[POST /api/orders]─▶│     │               │
    │              │            │─[INSERT order]─▶│           │
    │              │            │◀─[Order ID]──│              │
    │              │            │─[Notify realtime]────────────▶│
    │              │◀─[Confirmation]──│         │               │
    │◀─[Affiche confirmation]─│  │              │               │
```

---

## V. Modèle de Données (MCD)

### Tables principales

```
┌─────────────────┐         ┌─────────────────┐
│    profiles     │         │     stores      │
│─────────────────│         │─────────────────│
│ id (UUID) PK    │◀────────│ owner_id (FK)   │
│ full_name       │         │ id (UUID) PK    │
│ avatar_url      │         │ name            │
│ role            │         │ description     │
│ created_at      │         │ logo_url        │
└─────────────────┘         │ category        │
                            │ created_at      │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │     items       │
                            │─────────────────│
                            │ id (UUID) PK    │
                            │ store_id (FK)   │
                            │ name            │
                            │ description     │
                            │ price           │
                            │ image_url       │
                            │ embedding (Vect)│◀── pgvector
                            │ created_at      │
                            └────────┬────────┘
                                     │
              ┌──────────────────────┼────────────────────┐
              │                      │                    │
     ┌────────▼──────┐    ┌──────────▼──────┐  ┌─────────▼──────┐
     │   orders      │    │     reels       │  │   reviews      │
     │───────────────│    │─────────────────│  │────────────────│
     │ id (UUID) PK  │    │ id (UUID) PK    │  │ id (UUID) PK   │
     │ user_id (FK)  │    │ store_id (FK)   │  │ user_id (FK)   │
     │ item_id (FK)  │    │ item_id (FK)    │  │ rating (1-5)   │
     │ status        │    │ video_url       │  │ comment        │
     │ quantity      │    │ likes_count     │  │ created_at     │
     │ total_price   │    │ created_at      │  └────────────────┘
     └───────────────┘    └─────────────────┘

┌─────────────────────────────────────────────┐
│              messages                        │
│─────────────────────────────────────────────│
│ id (UUID) PK                                │
│ sender_id (FK → profiles)                   │
│ receiver_id (FK → profiles)                 │
│ content                                     │
│ read_at                                     │
│ created_at                                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            notifications                    │
│─────────────────────────────────────────────│
│ id (UUID) PK                                │
│ user_id (FK → profiles)                     │
│ type (order/message/like/system)            │
│ title                                       │
│ body                                        │
│ read (boolean)                              │
│ created_at                                  │
└─────────────────────────────────────────────┘
```

---

## VI. Architecture de la Recherche Sémantique

### Principe de fonctionnement

La recherche sémantique repose sur la représentation des textes sous forme de **vecteurs numériques** (embeddings) dans un espace de haute dimension. La similarité entre deux textes est mesurée par la **similarité cosinus** entre leurs vecteurs respectifs.

```
Texte produit ──▶ [AI API] ──▶ Vecteur [0.12, -0.45, ..., 0.87]
                                      │
                                      ▼
                             [Stocké dans pgvector]

Requête user ───▶ [AI API] ──▶ Vecteur requête
                                      │
                                      ▼
                      [Calcul cosine similarity vs tous les items]
                                      │
                                      ▼
                      [Top N résultats les plus proches]
```

### Flux de seed des embeddings

```
Script seed ──▶ Fetch items (batch de 10)
                     │
                     ▼
                 [AI API] ──▶ Génère embeddings pour chaque item
                     │
                     ▼
              UPDATE items SET embedding = [...] WHERE id = ?
                     │
                     ▼
              Rate limit: 200ms entre batches
                     │
                     ▼
              Répéter jusqu'à completion (3000+ items)
```

---

## VII. Architecture de Déploiement

```
┌──────────────────────────────────────────────────┐
│                    VERCEL (Cloud)                │
│                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  │
│  │   Web App          │  │  Admin Dashboard   │  │
│  │   (Next.js)        │  │   (Next.js)        │  │
│  │   Edge Functions   │  │   Edge Functions   │  │
│  └────────────┬───────┘  └──────────┬─────────┘  │
└───────────────┼──────────────────────┼────────────┘
                │                      │
                ▼                      ▼
┌──────────────────────────────────────────────────┐
│                  SUPABASE (BaaS)                 │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Auth     │ │ Storage  │ │   PostgreSQL      │  │
│  │ (JWT)    │ │ (CDN)    │ │   + pgvector      │  │
│  └──────────┘ └──────────┘ │   + Realtime      │  │
│                             └──────────────────┘  │
└──────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────┐
│              SERVICES EXTERNES                   │
│  ┌──────────────────┐      ┌───────────────────┐  │
│  │ Groq / Gemini API│      │  Expo (Mobile)    │  │
│  │  (NLP & AI)      │      │  Push Notifs      │  │
│  └──────────────────┘      └───────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## VIII. Conception de l'Interface Utilisateur

### 1. Principes de Design

Notre interface adopte les principes du **design moderne** avec :
- **Dark mode** par défaut avec palette sombre harmonieuse
- **Glassmorphism** pour les cartes et modales
- **Micro-animations** pour améliorer l'engagement utilisateur
- **Typography premium** (Inter / Outfit via Google Fonts)
- **Design responsive** adapté à tous les écrans

### 2. Palette de Couleurs

| Rôle | Couleur | Usage |
|---|---|---|
| Primaire | `#6C63FF` (Violet) | CTA, boutons principaux |
| Secondaire | `#FF6584` (Rose) | Accents, notifications |
| Background | `#0F0F1A` | Fond principal (dark) |
| Surface | `#1A1A2E` | Cartes, panneaux |
| Texte | `#E8E8F0` | Texte principal |
| Succès | `#4CAF8C` | Confirmations |
| Erreur | `#FF5252` | Alertes |

### 3. Maquettes des Écrans Principaux

**Application Web :**
- Page d'accueil : Hero section + Fil de reels + Catégories
- Page de recherche : Barre de recherche sémantique + Résultats filtrables
- Fiche produit : Images, description, bouton commande, avis
- Profil boutique : Présentation, catalogue, reels
- Messages : Interface de chat en temps réel

**Application Mobile :**
- Onboarding : Slides de présentation
- Home Feed : Reels en plein écran (style TikTok/Instagram)
- Recherche : Barre de recherche + résultats
- Profil : Informations, historique commandes
- Notifications : Centre de notifications

**Dashboard Admin :**
- Vue d'ensemble : KPIs, graphiques de performance
- Gestion boutiques : Liste, filtres, actions
- Gestion produits : CRUD complet
- Gestion commandes : Pipeline de statuts
- Statistiques : Graphiques analytiques

---

## IX. Conclusion

Ce chapitre de conception a permis de définir l'architecture globale de notre plateforme sur trois niveaux : présentation, logique métier et données. Les diagrammes UML ont modélisé les interactions entre les différents acteurs du système, tandis que le modèle de données a établi la structure relationnelle de la base de données. L'architecture de la recherche sémantique, basée sur les modèles d'intelligence artificielle (Groq / Gemini) et l'extension pgvector, constitue l'élément innovant central du projet.

Ces fondements conceptuels guideront la phase de réalisation détaillée dans le chapitre suivant, où nous présenterons les implémentations concrètes de chaque module du système.
