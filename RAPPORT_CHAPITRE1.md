# Chapitre I : Étude de l'existant et spécification des besoins

---

## Introduction générale

Dans un monde de plus en plus connecté, le commerce local peine à s'adapter aux nouvelles habitudes de consommation numérique. En Tunisie, des milliers de commerçants, artisans et prestataires de services opèrent encore sans visibilité en ligne, sans outils de gestion modernes, et sans accès aux technologies qui permettraient de développer leur activité.

C'est dans ce contexte que s'inscrit notre projet de fin d'études : **Ro2ya**, une plateforme SaaS de marketplace multiservice destinée au marché tunisien. Cette solution vise à connecter les consommateurs avec les commerçants et prestataires locaux à travers une interface numérique intelligente, multilingue (Français, Arabe, Darija), et dotée de fonctionnalités d'intelligence artificielle.

Ce premier chapitre présente le contexte général du projet. Nous commencerons par une étude de l'existant pour analyser les solutions actuellement disponibles sur le marché, identifier leurs limites, puis formuler la problématique à laquelle répond notre plateforme. Nous terminerons par une spécification détaillée des besoins fonctionnels et non fonctionnels du système.

---

## I. Introduction

Le commerce électronique connaît une croissance exponentielle à l'échelle mondiale. Cependant, en Tunisie, cette transformation numérique reste partielle et inégale. Si certains grands groupes ont su s'adapter, la grande majorité des petits commerces et artisans locaux restent en dehors de l'économie numérique, faute de solutions adaptées à leurs réalités : contraintes linguistiques (Darija, Arabe), absence d'infrastructure de paiement en ligne fiable, et manque de compétences techniques.

Notre projet **Ro2ya** (qui signifie « Vision » en arabe) ambitionne de combler ce fossé en proposant une plateforme complète qui réunit produits, services et réservations en un seul endroit, accessible à tous les acteurs du marché tunisien.

---

## II. Étude de l'existant

### 1. Description de l'existant

Plusieurs solutions existent sur le marché local et international qui tentent de répondre partiellement aux besoins des commerçants tunisiens :

#### a) **Jumia Tunisie**
Jumia est la principale marketplace e-commerce en Afrique. Elle permet la vente de produits physiques en ligne avec livraison. Elle cible principalement les grandes marques et les vendeurs avec un volume de stock important.

#### b) **Tayara.tn**
Tayara est une plateforme d'annonces classées (similaire à Le Bon Coin) très populaire en Tunisie. Elle permet aux particuliers et professionnels de publier des annonces de vente ou de location, mais sans système de commande intégré ni gestion de services.

#### c) **TakiAcademy / CoachingTN**
Des plateformes spécialisées dans les services éducatifs et de coaching en ligne. Elles intègrent des systèmes de réservation de séances mais restent limitées à un seul secteur d'activité.

#### d) **Google Business Profile (anciennement Google My Business)**
Un outil gratuit de Google qui permet aux commerces locaux de gérer leur fiche d'établissement sur Google Maps et Search. Cependant, il ne permet pas de commandes en ligne ni de gestion des transactions.

#### e) **Solutions internationales (Shopify, WooCommerce)**
Des outils puissants mais inadaptés au contexte tunisien : interface non arabisée, absence de support Darija, pas d'intégration avec les moyens de paiement locaux, et coût élevé pour les petits commerçants.

---

### 2. Critique de l'existant

L'analyse comparative des solutions existantes révèle plusieurs lacunes majeures :

| Critère | Jumia | Tayara.tn | Google Business | Shopify |
|---------|-------|-----------|-----------------|---------|
| Support Darija/Arabe Tunisien | ❌ | ❌ | Partiel | ❌ |
| Gestion produits ET services | ❌ | ❌ | ❌ | Partiel |
| Système de réservation intégré | ❌ | ❌ | ❌ | Extension |
| Recherche intelligente (IA) | ❌ | ❌ | Partiel | ❌ |
| Tableau de bord commerçant | Partiel | ❌ | Partiel | ✅ |
| Messagerie client-commerçant | ❌ | Partiel | ❌ | Extension |
| Contenu vidéo (Reels/Stories) | ❌ | ❌ | ❌ | ❌ |
| Adapté au marché tunisien | Partiel | ✅ | Partiel | ❌ |
| Gratuit pour les petits commerçants | ❌ | Partiel | ✅ | ❌ |

**Principales lacunes identifiées :**

1. **Absence de support linguistique adapté** : Aucune plateforme ne supporte nativement la Darija tunisienne dans son moteur de recherche, ce qui constitue un frein majeur pour les utilisateurs locaux qui s'expriment naturellement dans ce dialecte.

2. **Séparation produits / services** : Les solutions actuelles sont soit orientées e-commerce de produits physiques (Jumia), soit orientées annonces (Tayara), mais aucune ne propose une gestion unifiée des produits, services et réservations.

3. **Absence d'intelligence artificielle** : Les moteurs de recherche des plateformes locales reposent sur des recherches par mots-clés basiques, sans compréhension sémantique ni capacité de recommandation personnalisée.

4. **Outils de gestion limités pour les commerçants** : Les petits commerçants tunisiens n'ont pas accès à des tableaux de bord analytiques simples, des statistiques de vente, ou des outils de marketing intégrés.

5. **Absence de contenu engageant** : Dans un écosystème où TikTok et Instagram dominent, aucune plateforme locale de commerce ne propose des fonctionnalités de contenu vidéo (Reels, Stories) pour attirer les clients.

6. **Expérience utilisateur fragmentée** : Les consommateurs doivent jongler entre plusieurs applications pour trouver un produit, réserver un service, contacter un commerçant, et lire des avis.

---

### 3. Problématique

**Comment permettre aux commerçants et prestataires tunisiens de digitaliser leur activité et d'accéder à une clientèle plus large, tout en offrant aux consommateurs une expérience de recherche et d'achat adaptée à leurs habitudes linguistiques et culturelles ?**

Plus précisément, nous identifions trois niveaux de problèmes :

- **Pour le commerçant :** Il manque d'une plateforme abordable, facile à prendre en main, qui centralise la gestion de son catalogue (produits/services), ses commandes, ses réservations, ses avis clients et ses statistiques de performance.

- **Pour le consommateur :** Il ne dispose pas d'un outil de découverte locale performant capable de comprendre ses requêtes en Darija, de lui proposer des résultats pertinents et de lui permettre de commander ou réserver en quelques clics.

- **Pour l'écosystème commercial local :** Il n'existe pas de pont numérique fiable entre l'offre locale (commerçants, artisans, prestataires) et la demande (consommateurs connectés), ce qui freine la croissance économique locale.

---

### 4. Solution proposée

Pour répondre à cette problématique, nous proposons **Ro2ya**, une plateforme SaaS de marketplace multiservice conçue spécifiquement pour le marché tunisien.

**Ro2ya** se distingue par les caractéristiques suivantes :

- **Plateforme unifiée** : Gestion centralisée des produits, services et réservations dans un seul écosystème.

- **Moteur de recherche hybride multilingue** : Pipeline de recherche à 7 étapes combinant normalisation Darija (dictionnaire local + LLM), expansion de requête, embeddings vectoriels, recherche hybride (sémantique + textuelle), fusion RRF et re-ranking par IA.

- **Intelligence Artificielle intégrée** : Assistant IA de marketplace (via Groq/Llama), recherche par image (vision IA), et agent intelligent pour les commerçants (analyse des ventes, recommandations marketing).

- **Dashboard commerçant complet** : Statistiques de vente, gestion des commandes avec suivi QR code, gestion des réservations, publication de Reels/Stories promotionnels, messagerie clients.

- **Système de transactions sécurisé** : Suivi complet du cycle de vie des commandes (PENDING → VALIDATED → COMPLETED) avec génération de QR codes de suivi.

- **Architecture moderne et scalable** : Next.js 14, Supabase (PostgreSQL + RLS), Upstash QStash pour les jobs asynchrones, et déploiement sur Vercel.

---

## III. Analyse et spécification des besoins

### 1. Identification des acteurs

La plateforme Ro2ya implique trois types d'acteurs principaux :

#### a) **Le Client (Consommateur)**
Utilisateur final de la plateforme. Il recherche des produits ou services, effectue des commandes ou réservations, laisse des avis, et interagit avec les commerçants via la messagerie.

- **Rôle dans le système :** `client`
- **Actions clés :** Rechercher, Commander, Réserver, Évaluer, Messagerie

#### b) **Le Commerçant / Prestataire (Pro)**
Propriétaire d'une boutique ou d'un service sur la plateforme. Il gère son catalogue, traite les commandes et réservations, publie du contenu promotionnel et analyse ses performances.

- **Rôle dans le système :** `pro` / `business_owner`
- **Actions clés :** Gérer catalogue, Traiter commandes, Répondre aux avis, Publier Reels/Stories, Consulter analytiques

#### c) **L'Administrateur (Admin)**
Responsable de la gestion globale de la plateforme. Il supervise les inscriptions des commerçants, modère le contenu, gère les litiges et accède aux statistiques globales.

- **Rôle dans le système :** `admin`
- **Actions clés :** Approuver/Rejeter boutiques, Modérer contenu, Gérer utilisateurs, Consulter tableau de bord global

---

### 2. Les besoins fonctionnels

#### BF-01 : Gestion des comptes utilisateurs
- L'utilisateur peut créer un compte avec email et mot de passe.
- L'utilisateur peut se connecter, se déconnecter et récupérer son mot de passe.
- L'utilisateur peut modifier son profil (avatar, informations personnelles, langue préférée).
- Le système redirige l'utilisateur selon son rôle après connexion :
  - Admin → `/admin/dashboard`
  - Pro → `/dashboard/[storeId]`
  - Client → `/` (page d'accueil)

#### BF-02 : Gestion du catalogue (Commerçant)
- Le commerçant peut créer, modifier et supprimer des produits (`PRODUCT`) et des services (`SERVICE`/`BOOKING`).
- Chaque item possède : nom, description, prix, catégorie, images, statut (`ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`).
- Le commerçant peut gérer son stock et recevoir des alertes de rupture.

#### BF-03 : Recherche et Découverte (Client)
- Le client peut effectuer des recherches en Français, Arabe ou Darija tunisienne.
- Le système normalise automatiquement les requêtes en Darija via un dictionnaire local et un modèle de langage (LLM).
- La recherche hybride combine similarité vectorielle (sémantique) et recherche textuelle (ILIKE), fusionnées via l'algorithme RRF.
- Le client peut filtrer les résultats par ville, catégorie, prix et note.
- Le client peut rechercher par image (vision IA).

#### BF-04 : Gestion des commandes
- Le client peut ajouter des articles à son panier et passer une commande.
- La commande suit le cycle : `PENDING` → `VALIDATED` → `COMPLETED` (ou `CANCELLED`).
- Lors de la validation, le système génère un QR code de suivi unique.
- Le commerçant valide la livraison en scannant le QR code présenté par le client.
- Le client et le commerçant reçoivent des notifications à chaque étape.

#### BF-05 : Gestion des réservations
- Le client peut réserver un service avec date, heure et nombre de personnes.
- La réservation suit le cycle : `PENDING` → `CONFIRMED` → `COMPLETED` (ou `CANCELLED`).
- Le prestataire confirme ou refuse la réservation depuis son tableau de bord.
- Un code de confirmation est généré à la validation.

#### BF-06 : Système d'avis et évaluations
- Le client peut laisser un avis (note 1-5 étoiles + commentaire) sur un établissement.
- Pour les boutiques actives, un avis nécessite une commande ou réservation terminée préalable.
- Le commerçant peut répondre aux avis depuis son tableau de bord.
- Le système met à jour automatiquement la note moyenne de l'établissement.

#### BF-07 : Messagerie Client-Commerçant
- Le client peut envoyer un message au commerçant depuis la page de l'établissement.
- Le commerçant peut répondre aux messages depuis son tableau de bord.
- Les conversations sont regroupées par établissement.

#### BF-08 : Contenu vidéo (Reels & Stories)
- Le commerçant peut publier des vidéos courtes (Reels) et des stories éphémères (24h).
- Le client peut visionner, liker et partager le contenu vidéo.
- Les Reels sont intégrés dans le fil d'accueil pour maximiser l'engagement.

#### BF-09 : Établissements favoris / Enregistrés
- Le client peut enregistrer un établissement dans sa liste de lieux favoris.
- Le client peut consulter et gérer sa liste d'établissements enregistrés.

#### BF-10 : Assistant IA de Marketplace
- Un assistant IA conversationnel (Groq/Llama) répond aux questions des utilisateurs en Français, Arabe ou Anglais.
- L'assistant aide à trouver des produits, comparer des options et naviguer dans la plateforme.

#### BF-11 : Tableau de bord analytique (Commerçant)
- Le commerçant dispose d'un tableau de bord avec : nombre de ventes, revenu total, commandes par statut, nombre d'avis, et note moyenne.
- Un agent IA analyse les données et propose des recommandations marketing personnalisées.

#### BF-12 : Gestion administrative (Admin)
- L'administrateur peut approuver, rejeter ou suspendre les boutiques.
- L'administrateur peut modérer les avis et le contenu des commerçants.
- L'administrateur accède à un tableau de bord global avec les statistiques de la plateforme.

#### BF-13 : Notifications
- Les utilisateurs reçoivent des notifications in-app en temps réel (via Supabase Real-time WebSocket).
- Types de notifications : `ORDER`, `BOOKING`, `MESSAGE`, `REVIEW`, `SYSTEM`, `SUPPORT`.
- L'utilisateur peut marquer les notifications comme lues individuellement ou toutes d'un coup.

---

### 3. Les besoins non fonctionnels

#### BNF-01 : Performance
- Le temps de réponse des API ne doit pas dépasser **2 secondes** pour les opérations courantes.
- La recherche sémantique doit retourner des résultats en moins de **3 secondes**.
- L'assistant IA doit afficher le premier token en moins de **1 seconde** (streaming).
- Le système doit supporter une charge de **10 000 utilisateurs simultanés**.

#### BNF-02 : Sécurité
- Toutes les communications sont chiffrées via **HTTPS/TLS**.
- Les données utilisateurs sont protégées par des politiques **Row-Level Security (RLS)** au niveau de la base de données.
- Les routes d'administration sont protégées par une clé API (`ADMIN_API_KEY`).
- Un système de **rate limiting** prévient les attaques par force brute :
  - Connexion : 5 tentatives / 15 minutes
  - Inscription : 3 tentatives / heure
- Les variables d'environnement sensibles ne sont jamais exposées côté client.

#### BNF-03 : Disponibilité & Fiabilité
- La plateforme doit viser une disponibilité de **99,9%** (moins de 9h d'indisponibilité/an).
- En cas d'échec d'une opération asynchrone (ex: synchronisation commande), le système effectue automatiquement des **retries** via Upstash QStash.
- Les erreurs sont loguées et tracées pour faciliter le diagnostic.

#### BNF-04 : Scalabilité
- L'architecture serverless (Next.js sur Vercel + Supabase) permet une **mise à l'échelle automatique** en fonction de la charge.
- La base de données est optimisée avec des **index** sur les colonnes fréquemment interrogées (status, city, category, created_at).
- La recherche vectorielle utilise des index **IVFFlat** pour des performances optimales même avec des millions d'embeddings.

#### BNF-05 : Maintenabilité
- Le code est structuré en **Server Actions** typées (TypeScript) pour une maintenance facilitée.
- L'architecture suit le pattern **Next.js App Router** avec séparation claire entre composants serveur et client.
- Chaque module est documenté et suit des conventions de nommage cohérentes.

#### BNF-06 : Accessibilité et Utilisabilité
- L'interface supporte trois langues : **Français**, **Arabe** et **Darija tunisienne**.
- Le design est **responsive** et optimisé pour les appareils mobiles (iOS/Android).
- L'interface respecte les principes d'ergonomie web modernes (contraste, lisibilité, feedback visuel).

#### BNF-07 : Compatibilité
- La plateforme web est compatible avec les navigateurs modernes : Chrome, Firefox, Safari, Edge (2 dernières versions majeures).
- Une API REST est exposée pour l'intégration avec une application mobile React Native.

---

## IV. Conclusion

Ce premier chapitre nous a permis de poser les fondations conceptuelles de notre projet. Après une étude comparative des solutions existantes sur le marché tunisien, nous avons constaté l'absence d'une plateforme unifiée et intelligente adaptée aux réalités linguistiques et économiques locales.

La solution **Ro2ya** que nous proposons répond directement à cette problématique en combinant :
- Une gestion complète du commerce local (produits, services, réservations)
- Un moteur de recherche hybride multilingue basé sur l'IA
- Des outils analytiques pour les commerçants
- Une architecture moderne, sécurisée et scalable

Dans le chapitre suivant, nous présenterons la **conception technique** de la plateforme, notamment son architecture système, ses diagrammes de cas d'utilisation et ses diagrammes de séquence détaillant les flux principaux de l'application.

---

*Projet de Fin d'Études — Plateforme Ro2ya*  
*Étudiants : Khaireddine Dab & Abderrahman Abdelli*  
*Année universitaire : 2025-2026*
