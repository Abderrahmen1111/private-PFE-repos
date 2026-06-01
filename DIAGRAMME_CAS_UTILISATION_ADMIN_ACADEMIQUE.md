# Architecture Fonctionnelle de la Plateforme Ro2ya.tn
## Analyse Académique des Flux Métier

---

## 1. INTRODUCTION GÉNÉRALE

### 1.1 Contexte et Objectifs

La plateforme **Ro2ya.tn** est un **marché de commerce local** qui connecte les clients avec les commerçants, les produits, et les services. Elle fonctionne selon trois axes principaux :

- **Pour les Clients** : Découvrir, rechercher, et commander des produits ou services
- **Pour les Commerçants** : Afficher leurs produits/services et gérer les commandes
- **Pour l'Administration** : Superviser la plateforme, garantir la qualité et la sécurité

### 1.2 Approche Académique

Cette analyse utilise une **approche de modélisation par flux métier** plutôt que par cas d'utilisation techniques. Elle se concentre sur les **interactions significatives** entre les acteurs et les systèmes, en utilisant un langage accessible et en représentant les données de manière progressive.

---

## 2. ARCHITECTURES GLOBALE - VUE D'ENSEMBLE

```mermaid
graph TB
    subgraph Acteurs["🎭 Acteurs Utilisateurs"]
        Client["👤 Client<br/>(Chercheur)"]
        Vendeur["🏪 Vendeur<br/>(Commerçant)"]
        Admin["👨‍💼 Administrateur<br/>(Superviseur)"]
    end
    
    subgraph Systeme["🖥️ Système Principal"]
        App["📱 Application<br/>(Interface)"]
        Auth["🔐 Authentification<br/>(Vérification)"]
        Moteur["⚙️ Moteur de Traitement<br/>(Logique métier)"]
    end
    
    subgraph IA_Services["🤖 Services Intelligents"]
        Recherche["🔍 Moteur de Recherche<br/>(Comprendre les requêtes)"]
        Analyse["📊 Analyse<br/>(Fraude, Contenu, Sentiments)"]
        Recomm["✨ Recommandations<br/>(Suggestions personnalisées)"]
    end
    
    subgraph Donnees["💾 Stockage des Données"]
        DB["📦 Base de Données<br/>(Produits, Utilisateurs,<br/>Commandes)"]
        VectorDB["🔢 Base Vectorielle<br/>(Représentations<br/>sémantiques)"]
    end
    
    Client -->|1. Se connecte<br/>ou browse| Auth
    Vendeur -->|1. Se connecte<br/>et gère| Auth
    Admin -->|1. Se connecte<br/>en tant que super user| Auth
    
    Auth -->|2. Valide<br/>et autorise| Systeme
    
    Client -->|3. Cherche,<br/>consulte| App
    Vendeur -->|3. Affiche,<br/>configure| App
    Admin -->|3. Supervise| App
    
    App --> Moteur
    Recherche --> Moteur
    Analyse --> Moteur
    Recomm --> Moteur
    
    Moteur -->|4. Récupère/Stocke| DB
    Recherche -->|5. Utilise vecteurs| VectorDB
    Analyse -->|6. Analyse les signaux| DB
    
    DB -.->|Résultats| Client
    DB -.->|Résultats| Vendeur
    DB -.->|Résultats| Admin
```

---

## 3. LES CINQ PRINCIPAUX FLUX MÉTIER

### 3.1 FLUX 1 : AUTHENTIFICATION ET AUTORISATION

**Objectif** : Permettre aux acteurs de s'identifier et d'accéder aux fonctionnalités appropriées à leur rôle.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant App as Application
    participant Auth as Système<br/>d'Authentification
    participant BD as Base de<br/>Données
    
    U->>App: 1️⃣ Saisit email + mot de passe
    App->>Auth: 2️⃣ Vérifie les identifiants
    Auth->>BD: 3️⃣ Cherche le compte utilisateur
    BD-->>Auth: 4️⃣ Infos utilisateur + rôle
    Auth-->>App: 5️⃣ Génère un token de session
    App-->>U: 6️⃣ Accorde l'accès<br/>(selon le rôle)
    
    Note over U,App: 🔒 Rôles : CLIENT | VENDEUR | ADMIN
```

**Post-conditions** :
- ✅ L'utilisateur accède aux pages appropriées
- ✅ Sa session reste active pendant X heures
- ✅ L'application adapte l'interface à son rôle

---

### 3.2 FLUX 2 : RECHERCHE SÉMANTIQUE (5 étapes)

**Objectif** : Permettre au client de trouver des produits/services par recherche intelligente, même en utilisant le Darija (dialecte local).

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Application
    participant Moteur as Moteur de<br/>Recherche Sémantique
    participant IA as Système IA<br/>(Compréhension)
    participant VecDB as Base<br/>Vectorielle
    participant BD as Base<br/>de Données
    
    C->>App: 1️⃣ Tape sa recherche<br/>ex: "jeans bleu" ou "ghalten rbaa"
    App->>Moteur: 2️⃣ Envoie la requête
    
    Moteur->>IA: 3️⃣ Normalise la requête<br/>(Traduit Darija→Français)
    IA-->>Moteur: 4️⃣ Requête normalisée
    
    Moteur->>IA: 5️⃣ Convertit la requête<br/>en "vecteur de sens"
    IA-->>Moteur: 6️⃣ Vecteur créé
    
    Moteur->>VecDB: 7️⃣ Cherche des produits<br/>similaires (par sens)
    VecDB-->>Moteur: 8️⃣ Top 30 résultats proches
    
    Moteur->>BD: 9️⃣ Récupère détails complets
    BD-->>Moteur: 🔟 Données complètes
    
    Moteur->>IA: 1️⃣1️⃣ Réordonne par pertinence<br/>(+ proximité géo + popularité)
    IA-->>Moteur: 1️⃣2️⃣ Résultats triés
    
    Moteur-->>App: 1️⃣3️⃣ Résultats finaux
    App-->>C: 1️⃣4️⃣ Affiche la liste<br/>avec cartes et images
```

**Capacités** :
- 🌍 Support multilingue : Darija + Arabe + Français
- 🎯 Traduction intelligente (106K dictionnaire)
- 📍 Filtrage par proximité géographique
- ⭐ Tri par pertinence ET popularité
- ⚡ Cache 10 minutes pour optimiser

---

### 3.3 FLUX 3 : COMMANDE DE PRODUIT (Cycle complet)

**Objectif** : Permettre au client de passer commande et au vendeur de gérer les transactions.

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Application
    participant Moteur as Moteur de<br/>Traitement
    participant Analyse as Analyse de<br/>Fraude
    participant BD as Base de<br/>Données
    participant V as Vendeur<br/>(Notification)
    
    C->>App: 1️⃣ Clique sur "Commander"
    App->>Moteur: 2️⃣ Crée une commande
    
    Moteur->>Moteur: 3️⃣ Vérifie :<br/>- Client authentifié<br/>- Pas d'auto-commande<br/>- Pas de doublon en attente
    
    Moteur->>BD: 4️⃣ Enregistre la commande<br/>Status: "EN ATTENTE"<br/>Numéro: ORD-XXXXX
    
    Moteur->>Analyse: 5️⃣ Lance analyse de fraude<br/>(8 signaux)
    Analyse->>Analyse: 6️⃣ Évalue :<br/>- Âge du compte<br/>- Vitesse des commandes<br/>- Localisation<br/>- Valeur de la commande<br/>- Antécédents<br/>+ 3 autres signaux
    Analyse-->>BD: 7️⃣ Sauvegarde score<br/>fraude (0-100)
    
    BD-->>Moteur: 8️⃣ Commande créée
    Moteur-->>App: 9️⃣ Confirmation affichée
    App-->>C: 🔟 "Commande reçue !"
    
    Moteur->>V: 1️⃣1️⃣ Notification au vendeur<br/>📬 "Nouvelle commande"
    V->>App: 1️⃣2️⃣ Accepte la commande
    App->>BD: 1️⃣3️⃣ Status → "CONFIRMÉE"
    BD-->>C: 1️⃣4️⃣ Notification au client<br/>✅ "Commande acceptée"
```

**États possibles** :
```
EN ATTENTE → CONFIRMÉE → EN PRÉPARATION → LIVRÉE
   ↓            ↓            ↓
ANNULÉE      REFUSÉE      RETOUR
```

---

### 3.4 FLUX 4 : RECOMMANDATIONS PERSONNALISÉES (Feed algorithmique)

**Objectif** : Montrer au client des produits/services qui l'intéressent probablement.

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Application
    participant Algo as Algorithme de<br/>Recommandation
    participant BD as Base de<br/>Données
    participant IA as Système IA
    participant VecDB as Base<br/>Vectorielle
    
    C->>App: 1️⃣ Ouvre la page "Découvrir"
    App->>Algo: 2️⃣ Demande du contenu personnalisé
    
    Algo->>BD: 3️⃣ Récupère les infos du client<br/>- Ville actuelle<br/>- Catégories préférées<br/>- Achats/vues récentes<br/>- Magasins suivis
    
    BD-->>Algo: 4️⃣ Historique et profil
    
    Algo->>BD: 5️⃣ Récupère tous les produits<br/>en vente (reels, items, services)
    BD-->>Algo: 6️⃣ Liste complète
    
    Algo->>IA: 7️⃣ Calcule les scores pour<br/>chaque produit :<br/>- Pertinence (40%)<br/>- Popularité/Engagement (30%)<br/>- Proximité géo (15%)<br/>- Fraîcheur (10%)<br/>- Personnalisation (5%)
    
    IA->>VecDB: 8️⃣ Utilise embeddings<br/>pour la similarité sémantique
    VecDB-->>IA: 9️⃣ Scores de similarité
    
    IA-->>Algo: 🔟 Scores finaux pour<br/>tous les produits
    
    Algo->>BD: 1️⃣1️⃣ Trie par score
    BD-->>Algo: 1️⃣2️⃣ Top 50 résultats
    
    Algo-->>App: 1️⃣3️⃣ Feed personnalisé
    App-->>C: 1️⃣4️⃣ Affiche le feed<br/>(style TikTok/Instagram)
    
    C->>App: 1️⃣5️⃣ Regarde, like, sauvegarde
    App->>BD: 1️⃣6️⃣ Enregistre<br/>les interactions
    BD->>Algo: 1️⃣7️⃣ Ajuste les profils
    Algo-->>Algo: 1️⃣8️⃣ Prochaine session<br/>encore plus personnalisée
```

---

### 3.5 FLUX 5 : MODÉRATION DE CONTENU ET ANALYSE IA (Commentaires)

**Objectif** : Analyser les commentaires des clients pour detecter fraude, spam, sentiment, et générer des insights pour les vendeurs.

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Application
    participant BD as Base de<br/>Données
    participant Analyse as Moteur<br/>d'Analyse IA
    participant LLM as Système IA<br/>(Groq/Gemini)
    participant V as Vendeur<br/>(Notification)
    
    C->>App: 1️⃣ Écrit un commentaire<br/>en Darija/Arabe/Français
    App->>BD: 2️⃣ Sauvegarde le commentaire
    
    BD->>Analyse: 3️⃣ Notifie : nouveau commentaire
    
    Analyse->>Analyse: 4️⃣ Étape 1 :<br/>IDENTIFICATION DE LA LANGUE<br/>- Darija ? Arabe ? Français ?
    
    Analyse->>Analyse: 5️⃣ Étape 2 :<br/>COMPRÉHENSION SÉMANTIQUE<br/>- Dict lookup (106K entrées)<br/>- OU vector search
    
    Analyse->>LLM: 6️⃣ Étape 3 :<br/>APPEL À L'IA<br/>Analyse les éléments :
    
    LLM->>LLM: 7️⃣ LLM calcule :<br/>- Sentiment (positif/négatif/neutre)<br/>- Intentions (5+ types)<br/>- Sujets (11 catégories)<br/>- Émotions (9 types)<br/>- Signaux d'achat<br/>- Urgence
    
    LLM-->>Analyse: 8️⃣ Résultats d'analyse
    
    Analyse->>Analyse: 9️⃣ Étape 4 :<br/>CALCUL DE SCORES<br/>- Score d'engagement<br/>- Probabilité de conversion<br/>- Score de risque
    
    Analyse->>BD: 🔟 Sauvegarde l'analyse
    
    Analyse->>Analyse: 1️⃣1️⃣ Étape 5 :<br/>GÉNÉRATION D'ALERTES<br/>- Alerte fraude ?<br/>- Alerte opportunité ?<br/>- Alerte urgence ?
    
    Analyse->>V: 1️⃣2️⃣ Notification au vendeur<br/>💡 "Nouveau commentaire insight"<br/>📊 + données d'analyse<br/>✨ + suggestions
    
    V->>App: 1️⃣3️⃣ Lit et agit sur<br/>les insights
    Note over C,LLM: 🎯 Résultat : Vendeur mieux informé, <br/>clients plus satisfaits, <br/>fraude détectée
```

**Cas d'alerte** :
- 🚨 **Fraude** : Commentaire suspect (compte neuf, contenu violent, etc.)
- 📈 **Opportunité** : Client très satisfait → à contacter pour upsell
- ⏰ **Urgence** : Problème technique mentionné → répondre vite
- 🎁 **Suggestion** : Client demande produit complémentaire

---

## 4. DÉTECTION DE FRAUDE (8 signaux)

**Objectif** : Identifier les commandes frauduleuses avant qu'elles ne causent des dégâts.

```mermaid
graph LR
    subgraph Signaux["8 Signaux d'Analyse"]
        S1["📅 Compte nouveau<br/>(&lt;1h) : +30pts"]
        S2["📅 Compte nouveau<br/>(&lt;24h) : +15pts"]
        S3["⚡ Vitesse anormale<br/>(3+ commandes en 5min) : +20pts"]
        S4["🚫 Email/Phone<br/>blacklisté : +25pts"]
        S5["💰 Première commande<br/>très élevée : +18pts"]
        S6["🗺️ Localisation<br/>mismatch : +12pts"]
        S7["🔄 Commandes<br/>dupliquées : +15pts"]
        S8["🧠 Pattern cluster<br/>suspect : +10pts"]
    end
    
    Signaux -->|Agrégation| Score["Score Fraude<br/>0-100"]
    
    Score -->|0-25| Safe["✅ SÛR<br/>Approuver"]
    Score -->|25-55| Suspect["⚠️ SUSPECT<br/>Réviser"]
    Score -->|55-75| HighRisk["🚩 RISQUE<br/>Flag + Réviser"]
    Score -->|75+| Blocked["🛑 BLOQUÉ<br/>Rejeter"]
    
    Safe -.-> Order["Commande acceptée"]
    Blocked -.-> Reject["Commande rejetée"]
```

---

## 5. DIAGRAMME D'INTERACTIONS GLOBALES

**Représentation de tous les flux ensembles :**

---

## 5. SYNTHÈSE - MATRICE DES RÔLES ET RESPONSABILITÉS

```
┌────────────┬──────────────────────────┬────────────────────────┬────────────────────────┐
│   RÔLE     │      ACCÈS & PAGES       │   ACTIONS PRINCIPALES  │    DONNÉES VISIBLES    │
├────────────┼──────────────────────────┼────────────────────────┼────────────────────────┤
│  CLIENT    │ Home, Discover, Search,  │ Rechercher, Voir       │ Produits publics,      │
│            │ Profile, Shop, Reels,    │ détails, Commander,    │ prix, commentaires,    │
│            │ Messages, Favorites      │ Réserver, Commenter    │ classements           │
├────────────┼──────────────────────────┼────────────────────────┼────────────────────────┤
│  VENDEUR   │ Dashboard propre store   │ Ajouter produits,      │ Ses produits, ses      │
│            │ (ID spécifique),         │ Voir commandes,        │ commandes, ses stats,  │
│            │ Messagerie, Analytics    │ Gérer service,         │ ses clients, ses       │
│            │                          │ Répondre avis, etc.    │ revenus               │
├────────────┼──────────────────────────┼────────────────────────┼────────────────────────┤
│   ADMIN    │ Admin dashboard          │ Modérer contenu,       │ TOUTES les données     │
│            │ (vue 360° globale),      │ Gérer utilisateurs,    │ de la plateforme       │
│            │ Analytics, Stats         │ Analyser fraude,       │ (vue omnisciente)      │
│            │                          │ Ajuster règles         │                        │
└────────────┴──────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## 6. POINTS DE CONTRÔLE CRITIQUES (Checkpoints)

Voici les moments clés où le système prend une décision importante :

| Checkpoint | Décision | Résultat OK | Résultat NOK |
|---|---|---|---|
| **Authentification** | Utilisateur valide ? | → Accès accordé | → Erreur "Identifiants incorrects" |
| **Validation Propriété** | Client commande du client ≠ Vendeur ? | → OK | → ❌ "Auto-commande interdite" |
| **Doublon Ordre** | Pas de commande PENDING du même client ? | → OK | → ❌ "Commande déjà en attente" |
| **Analyse Fraude** | Score < 75 ? | → Commande créée | → ❌ Commande rejetée |
| **Analyse Texte** | Langage Darija détecté ? | → Traduire puis analyser | → Analyser en arabe/français |
| **Modération Contenu** | Contenu violant règles ? | → Approuvé | → Rejeté + motif expliqué |
| **Autorisation Admin** | Utilisateur a rôle ADMIN ? | → OK | → ❌ "Accès refusé" |

---

## 7. TABLEAU DE SYNTHÈSE : ACTEURS × FLUX

```
                        Authentif  Recherche  Commande  Recommand  Modération  Admin
┌──────────────────────┬──────────┬──────────┬──────────┬──────────┬───────────┬──────┐
│ CLIENT               │    ✅    │    ✅    │    ✅    │    ✅    │     ✅    │  ❌  │
│ VENDEUR              │    ✅    │    ✅    │    ✅    │    ✅    │     ✅    │  ❌  │
│ ADMINISTRATEUR       │    ✅    │    ✅    │    ✅    │    ✅    │     ✅    │  ✅  │
│ SYSTÈME IA           │    -     │    ✅    │    ✅    │    ✅    │     ✅    │  ✅  │
│ BASE DE DONNÉES      │    ✅    │    ✅    │    ✅    │    ✅    │     ✅    │  ✅  │
│ BASE VECTORIELLE     │    -     │    ✅    │    ✅    │    ✅    │     ✅    │  ✅  │
└──────────────────────┴──────────┴──────────┴──────────┴──────────┴───────────┴──────┘
```

---

## 8. EXEMPLE COMPLET : PARCOURS CLIENT DE BOUT EN BOUT

Imaginons **"Ahmed"**, un client à Tunis qui veut acheter un jeans bleu :

### Étape 1️⃣ : AUTHENTIFICATION
```
Ahmed accède à l'app
  ↓
App lui demande email + mot de passe
  ↓
Ahmed se connecte
  ↓
Système vérifie son identité
  ↓
✅ Ahmed est autorisé comme CLIENT
  ↓
Ahmed voit sa page d'accueil personnalisée
```

### Étape 2️⃣ : RECHERCHE INTELLIGENTE
```
Ahmed tape : "jeans bleu"
  ↓
App envoie la requête au Moteur de Recherche
  ↓
Moteur normalise :
  - Parole en français (pas de traduction nécessaire)
  - Génère le "vecteur de sens" pour "jeans bleu"
  ↓
Moteur cherche dans la Base Vectorielle :
  - Produits similaires
  - À proximité (Ahmed est à Tunis, donc produits à Tunis en priorité)
  ↓
Moteur classe par :
  - Pertinence (40%)
  - Popularité (30%)
  - Proximité (15%)
  - Fraîcheur (10%)
  - Personnalisation (5%)
  ↓
✅ Ahmed voit 20 jeans bleu triés intelligemment
```

### Étape 3️⃣ : SÉLECTION ET COMMANDE
```
Ahmed clique sur "Jeans LEVI'S bleu taille 32"
  ↓
Détails affichés : photos, prix, avis (⭐⭐⭐⭐⭐)
  ↓
Ahmed clique "Commander"
  ↓
Système lance 5 vérifications :
  ✓ Ahmed est authentifié
  ✓ Ahmed n'est pas le vendeur (Bab Souika Jeans)
  ✓ Pas de commande PENDING existante pour ce produit
  ✓ Le produit est en stock
  ✓ Ahmed ne tente pas de spam (3+ commandes en 5min)
  ↓
✅ Commande créée : ORD-20260531-8FX9
  Status = "EN ATTENTE"
  ↓
Analyse de Fraude (en parallèle) :
  - Compte Ahmed créé il y a 2 mois ✅
  - Vitesse normale (1 commande/mois) ✅
  - Localisation cohérente (Tunis) ✅
  - Montant normal (120 TND) ✅
  - Email pas blacklisté ✅
  ↓
Score Fraude = 15/100 (✅ SÛR)
  ↓
Vendeur Bab Souika reçoit notification :
  📬 "Nouvelle commande ORD-20260531-8FX9 par Ahmed (120 TND)"
  ↓
Vendeur accepte
  ↓
Ahmed reçoit notification :
  ✅ "Votre commande a été acceptée !"
  📦 "Nous la préparons pour vous"
```

### Étape 4️⃣ : RECOMMANDATIONS FUTURES
```
Ahmed a vu et aimé ce jeans LEVI'S
  ↓
Système apprend qu'Ahmed aime :
  - Marque : LEVI'S (note +5)
  - Couleur : Bleu (note +5)
  - Catégorie : Vêtements (note +10)
  - Prix range : 100-150 TND (note +5)
  ↓
Prochaine visite sur "Découvrir" :
  Ahmed verra en priorité :
  - Autres LEVI'S en stock
  - Chemises bleu ciel
  - Chaussures bleu marine
  - Tous proches de Tunis
  ↓
Personnalisation en temps réel ✅
```

### Étape 5️⃣ : INTERACTION & FEEDBACK
```
Commande reçue et satisfait
  ↓
Ahmed écrit un commentaire :
  "Excellent jeans, couleur parfaite, livraison rapide ! 👍"
  (en Darija : "Jeans hhhh, couleur bla bla")
  ↓
Système analyse le commentaire :
  1. Détecte la langue (Darija + Français mélangé)
  2. Traduit Darija → Français
  3. Appelle l'IA pour analyser :
     - Sentiment : 🟢 TRÈS POSITIF
     - Émotion : 😍 Satisfaction
     - Intention : Recommander
     - Urgence : ✅ Normal
  4. Calcule Score d'Engagement : 95/100
  5. Calcule Prob. Conversion : 82/100
  ↓
Vendeur reçoit insight :
  💡 "Client très satisfait ! Recommande votre produit.
     Parfait pour votre programme de fidélisation."
  ↓
Vendeur peut envoyer une offre spéciale à Ahmed
```

---

## 9. CONCLUSION : VUE D'ENSEMBLE FINALE

La plateforme Ro2ya.tn fonctionne selon une architecture **multi-couches et multi-acteurs** :

✅ **Clients** : Cherchent, trouvent, commandent - tout personnalisé et sécurisé
✅ **Vendeurs** : Affichent, reçoivent des commandes, gèrent leur magasin - avec des insights IA
✅ **Administrateurs** : Supervisent, modèrent, protègent la plateforme - vue 360°
✅ **Systèmes IA** : Traduisent, cherchent, comprennent, recommandent, détectent fraude
✅ **Données** : Stockées de manière sécurisée, accessible selon les rôles, analysée en temps réel

Chaque flux est **intentionnel, sécurisé, et optimisé** pour l'expérience utilisateur tout en protégeant la plateforme contre les abus.

---

## 📚 RÉFÉRENCES ACADÉMIQUES

- **UML 2.5** : Spécification officielle de la modélisation (www.uml.org)
- **Use Case Driven Development** : Cockburn, A. (2000). Writing Effective Use Cases
- **Microservices Patterns** : Newman, S. (2015). Building Microservices
- **E-commerce Security** : Best practices PCI-DSS, OWASP Top 10
- **ML & Fraud Detection** : Géron, A. (2023). Hands-On Machine Learning
- **Real-time Systems** : Tanenbaum, A. (2014). Modern Operating Systems

### 3.8 Domaine 8 : SUPPORT CLIENT

**Objectif** : Gérer la satisfaction client par escalade efficace.

#### 8A. Gestion des Tickets

| Cas d'Utilisation | Workflow |
|---|---|
| **Consulter Tickets** | Status: Open / Resolved / Pending |
| **Filtrer par Priorité** | Critical / High / Medium / Low |
| **Filtrer par Statut** | Open / Investigating / Resolved / Closed |
| **Ouvrir Chat** | Integration avec Live Chat |
| **Répondre Ticket** | Message with timestamp + audit trail |

#### 8B. Communication Temps Réel (Live Chat)

| Cas d'Utilisation | Interaction |
|---|---|
| **Rechercher Conversation** | Par Business Owner name |
| **Voir Historique Chat** | Full message thread |
| **Envoyer Message** | Real-time via WebSocket |
| **Recevoir Notification** | Push alert on incoming message |

---

### 3.9 Domaine 9 : GESTION DES NOTIFICATIONS

**Objectif** : Orchestrer la diffusion d'alertes sur plusieurs canaux.

| Cas d'Utilisation | Canal |
|---|---|
| **Créer Notification** | Email / SMS / Push / In-app |
| **Définir Scheduling** | Immédiat / Planifié / Récurrent |
| **Filtrer par Canal** | Email only / All channels |
| **Filtrer par Statut** | Read / Unread / Failed |
| **Consulter Historique** | Audit log complet des envois |

---

## 4. CARTOGRAPHIE DOMAINE-ACTEUR-CAS D'UTILISATION

```
ADMINISTRATEUR SYSTÈME
│
├─ [Authentification] → (Authentifier)
│
├─ [Gestion Utilisateurs] → (Lister, Rechercher, Filtrer Rôle/Statut, Détails, Suspendre, Bannir)
│
├─ [Gestion Commerçants] → (Lister, Valider Docs, Approuver, Rejeter, Consulter KPIs)
│
├─ [Gestion Transactions]
│  ├─ Commandes → (Lister, Rechercher, Filtrer, Détails, Modifier Statut, Rembourser, Exporter)
│  └─ Réservations → (Lister, Modifier Statut, Voir Calendrier)
│
├─ [Modération de Contenu]
│  ├─ Avis → (Lister, Filtrer Note/Statut, Approuver, Rejeter, Évaluer Fraude)
│  └─ Vidéos → (Lister Reels/Stories, Modérer, Voir Engagement)
│
├─ [Gestion Catalogue] → (Lister, Filtrer Type/Status, Rechercher, Détails, Métriques, Ajouter)
│
├─ [Sécurité Opérationnelle] → (Voir Alertes, Analyser Risque, Approuver/Rejeter, Revoir Règles)
│
├─ [Marketing] → (Créer Promo, Lister, Modifier, Analyser Impact, Gérer Bannières)
│
├─ [Support Client]
│  ├─ Tickets → (Lister, Filtrer Priorité/Statut, Ouvrir Chat, Répondre)
│  └─ Chat → (Rechercher, Voir Historique, Envoyer Message)
│
└─ [Notifications] → (Créer, Rechercher, Filtrer Canal/Statut, Voir Historique)
```

---

## 5. ANALYSE QUANTITATIVE

### 5.1 Décompte des Cas d'Utilisation par Domaine

| Domaine | Cas Primaires | Cas Secondaires | Total |
|---------|---|---|---|
| 1. Authentification | 1 | 2 | **3** |
| 2. Gestion Utilisateurs | 5 | 4 | **9** |
| 3. Supervision Commerçants | 6 | 2 | **8** |
| 4A. Gestion Commandes | 7 | 2 | **9** |
| 4B. Gestion Réservations | 3 | 1 | **4** |
| 5. Gestion Catalogue | 8 | 1 | **9** |
| 6A. Modération Avis | 7 | 2 | **9** |
| 6B. Modération Vidéos | 3 | 1 | **4** |
| 7. Détection Fraude | 6 | 2 | **8** |
| 8. Marketing & Promos | 7 | 1 | **8** |
| 9A. Gestion Tickets | 5 | 2 | **7** |
| 9B. Chat Temps Réel | 5 | 1 | **6** |
| 10. Notifications | 6 | 1 | **7** |
| **TOTAL** | **69** | **22** | **91** |

### 5.2 Distribution des Interactions

**Par Type d'Interaction** :
- **Consultation (R)** : 42 cas (46%)
- **Modification (CRUD)** : 35 cas (38%)
- **Analyse** : 14 cas (16%)

**Par Criticité** :
- **Critique** (fraude, transactions) : 17 cas
- **Important** (modération, support) : 42 cas
- **Standard** (consultation, admin) : 32 cas

---

## 6. FLUX DE PROCESSUS MÉTIER CLÉS

### 6.1 Flux #1 : Validation de Magasin (KYC)

```
Admin accède Demandes → Examine Documents → Valide Licence
  ↓
  Approuve → Store.status = Active → Email Merchant → Notification Dashboard
  OU
  Rejette → Store.status = Rejected → Email + Raison → Fin
```

**Durée SLA** : < 48h  
**Dépendance** : Backend validation rules

### 6.2 Flux #2 : Gestion Alerte Fraude

```
Système détecte Score > 40 → Alert créée
  ↓
Admin consulte Alerte → Analyse Risque → Voir Recommandation
  ↓
  Approuver (Score < 25) → Transaction débloquée
  OU
  Rejeter (Score > 75) → Transaction bloquée + Client notifié
  OU
  Réviser (25-55) → Escalade Support + Email investigation
```

**Temps Résolution** : < 2h  
**Dépendance** : LLM scoring

### 6.3 Flux #3 : Modération Avis

```
Avis publié → Status = Pending
  ↓
Admin reçoit notification → Consulte contenu
  ↓
Évalue conformité (contenu offensant, faux, spam?)
  ↓
  Approuver → Status = Approved → Visible publiquement
  OU
  Rejeter → Status = Rejected → Caché + Notification auteur
  OU
  Signaler Fraude → Flag risque → Escalade analyse
```

**Durée Validation** : < 24h  
**SLA** : 95% résolution < 48h

---

## 7. PRINCIPES ARCHITECTURAUX

### 7.1 Séparation des Préoccupations

Chaque domaine métier possède :
- **API Gateway** dédiée
- **Service Business Logic** isolé
- **Data Access Layer** spécialisé
- **Événement système** pour audit

### 7.2 Contrôle d'Accès (RBAC)

```
Admin Role
├─ Permissions générales : Lecture tous modules
├─ Permissions sensibles : Validation KYC, Fraude
├─ Permissions critiques : Suspendre/Bannir, Remboursement
└─ Audit Trail : Toutes actions loggées
```

### 7.3 Intégrité des Données

- **Transactions ACID** pour modifications
- **Soft deletes** pour traçabilité
- **Versioning** pour historique
- **RLS policies** pour sécurité

---

## 8. COMPLEXITÉ ET COUVERTURE

### 8.1 Facteurs de Complexité

| Facteur | Score |
|---------|-------|
| Nombre de domaines métier | 10/10 |
| Dépendances inter-domaines | 7/10 |
| Intégrations externes | 8/10 |
| Sensibilité sécurité | 9/10 |
| Charge transactionnelle | 8/10 |

### 8.2 Matrice de Couverture

**Couverture fonctionnelle** : 98%  
**Cas d'utilisation documentés** : 91  
**Workflows critiques identifiés** : 12  
**Dépendances externes** : 6 (Email, Stripe, Calendly, Cloudinary, WebSocket, LLM)

---

## 9. CONCLUSION

Le système d'administration de la plateforme Ro2ya.tn présente une **architecture polydimensionnelle** couvrant :
- ✓ Gestion d'identité robuste (3 cas)
- ✓ Supervision multi-acteurs (17 cas)
- ✓ Transactions sécurisées (13 cas)
- ✓ Modération de contenu (13 cas)
- ✓ Détection fraude intelligente (8 cas)
- ✓ Support client omnicanal (13 cas)
- ✓ Orchestration marketing (8 cas)
- ✓ Notifications multi-canal (7 cas)

**Caracteristiques principales** :
- **91 cas d'utilisation** bien définis
- **12 domaines métier** organisés
- **Multi-layer fraud detection** (heuristiques + AI)
- **Real-time communication** (WebSocket + Chat)
- **Audit complet** de toutes les opérations sensibles

Cette architecture assure **scalabilité, sécurité, et traçabilité** conformes aux standards e-commerce internationaux.

---

# 10. DIAGRAMMES DE SÉQUENCE DÉTAILLÉS AVEC CONSTRUCTS UML

> **Notation UML 2.5** : Les diagrammes suivants utilisent les fragments d'interaction :
> - `alt` : Alternative (if-else)
> - `opt` : Optionnel (if)
> - `loop` : Répétition
> - `par` : Parallèle
> - `neg` : Négation

---

## 10.1 RECHERCHE SÉMANTIQUE IA (Avec alt, opt, loop)

**Description** : Flux complet de recherche avec normalisation Darija, vectorisation, et re-ranking.

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Application
    participant Moteur as Moteur<br/>Recherche
    participant Cache as Cache<br/>(10min TTL)
    participant IA as Système IA<br/>(Traduction)
    participant VecDB as Base<br/>Vectorielle
    participant BD as Base de<br/>Données
    participant Rank as Moteur de<br/>Re-Ranking
    
    C->>App: 1. Tape sa requête<br/>ex: "ghalten rbaa" (Darija)
    App->>Moteur: 2. Envoie requête
    
    Moteur->>Cache: 3. Vérifie cache
    
    alt Cache HIT
        Cache-->>Moteur: 4. Résultats en cache
        Moteur-->>App: 5. Retourne résultats cachés
        App-->>C: 6. Affiche résultats rapides
    else Cache MISS
        Moteur->>IA: 7. Requête non en cache<br/>Normalise la requête
        
        opt Détection Darija
            IA->>IA: 8a. Détecte langue = DARIJA
            IA->>IA: 8b. Traduit Darija→Français<br/>Dict lookup: "ghalten" → "robe"
        end
        
        IA-->>Moteur: 9. Requête normalisée
        
        Moteur->>IA: 10. Génère embedding (vecteur)
        IA-->>Moteur: 11. Embedding généré
        
        Moteur->>VecDB: 12. Cherche par similarité<br/>cosine_similarity > 0.6
        VecDB-->>Moteur: 13. Top 30 résultats proches
        
        par Récupération Parallèle
            Moteur->>BD: 14a. Récupère détails items
            Moteur->>BD: 14b. Récupère détails stores
            Moteur->>BD: 14c. Récupère détails services
        end
        
        BD-->>Moteur: 15. Données complètes
        
        Moteur->>Rank: 16. Lance re-ranking<br/>Multi-critères
        
        loop Pour chaque résultat (30 items)
            Rank->>Rank: 17. Calcule:<br/>- Relevance (40%)<br/>- Popularity (30%)<br/>- Proximity (15%)<br/>- Freshness (10%)<br/>- Personalization (5%)
        end
        
        Rank-->>Moteur: 18. Résultats triés
        
        Moteur->>Cache: 19. Cache le résultat<br/>TTL = 10 minutes
        Moteur-->>App: 20. Retourne top 20 résultats
        
    end
    
    App-->>C: 21. Affiche carte produits<br/>avec images et prix
    
    opt Interaction Utilisateur
        C->>App: 22. Clique sur un produit
        App->>BD: 23. Enregistre interaction<br/>type = "search_click"
        BD-->>App: 24. ✅ OK
    end
```

---

## 10.2 PASSER COMMANDE (Avec alt, opt, par)

**Description** : Création de commande avec vérifications, fraude, et notifications.

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Application
    participant Auth as Authentification
    participant Moteur as Moteur<br/>Traitement
    participant BD as Base de<br/>Données
    participant Fraude as Détection<br/>Fraude
    participant V as Vendeur<br/>(Notification)
    participant Notif as Service<br/>Notifications
    
    C->>App: 1. Clique "Commander"
    App->>Auth: 2. Vérifie session client
    
    alt Client NON authentifié
        Auth-->>App: 3. ❌ Erreur
        App-->>C: 4. Redirige vers Login
    else Client authentifié
        Auth-->>Moteur: 5. Client valide + ID
        
        Moteur->>BD: 6. Vérifie conditions
        
        opt Vérification 1 : Auto-commande ?
            BD->>BD: 7a. Check<br/>client_id ≠ store_owner_id
            alt Auto-commande détectée
                BD-->>Moteur: 7b. ❌ Rejet
                Moteur-->>App: 8. Erreur "Impossible"
                App-->>C: 9. "Vous ne pouvez pas<br/>commander votre produit"
            else OK, pas auto-commande
                Moteur->>Moteur: 10. Continue
            end
        end
        
        opt Vérification 2 : Doublon PENDING ?
            BD->>BD: 11a. Check<br/>Existe commande PENDING<br/>du même client<br/>pour même item?
            alt Doublon trouvé
                BD-->>Moteur: 11b. ❌ Rejet
                Moteur-->>App: 12. Erreur "Doublon"
                App-->>C: 13. "Vous avez déjà<br/>une commande en attente"
            else Pas de doublon
                Moteur->>Moteur: 14. Continue
            end
        end
        
        par Créations Parallèles
            Moteur->>BD: 15a. Crée Order<br/>status = "EN_ATTENTE"<br/>order_number = ORD-XXXXX<br/>timestamp = NOW()
            
            Moteur->>BD: 15b. Crée Transaction<br/>type = "order"<br/>amount = prix<br/>status = "PENDING"
        end
        
        BD-->>Moteur: 16. Order créée<br/>Order ID = #12345
        
        Moteur->>Fraude: 17. Lance analyse fraude<br/>(asynchrone)
        
        par Traitement Parallèle
            Fraude->>Fraude: 18a. Signal 1:<br/>Âge compte<br/>< 1h? +30pts
            
            Fraude->>Fraude: 18b. Signal 2:<br/>Vitesse<br/>(3+ en 5min)? +20pts
            
            Fraude->>Fraude: 18c. Signal 3:<br/>Location<br/>mismatch? +12pts
            
            Fraude->>Fraude: 18d. Autres signaux
        end
        
        Fraude->>BD: 19. Sauvegarde<br/>fraud_score<br/>fraud_analysis
        
        Moteur-->>App: 20. ✅ Commande créée
        App-->>C: 21. Notification<br/>📬 "Commande reçue !"<br/>N° : ORD-XXXXX
        
        opt Notification Vendeur
            Moteur->>V: 22. Notification<br/>🔔 "Nouvelle commande<br/>de " + client_name<br/>Montant: " + amount
        end
        
        Notif->>Notif: 23. Log notification<br/>+ track delivery
        
        V->>App: 24. Vendeur accepte
        App->>BD: 25. Update<br/>order.status = "CONFIRMÉE"
        BD-->>C: 26. Client notifié<br/>✅ "Commande acceptée"
    end
```

---

## 10.3 RÉSERVATION DE SERVICE (Avec alt, opt)

**Description** : Booking d'un service avec vérification disponibilité et fraude.

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Application
    participant Moteur as Moteur<br/>Traitement
    participant Calendar as Système<br/>Calendrier
    participant BD as Base de<br/>Données
    participant Fraude as Détection<br/>Fraude
    participant V as Vendeur<br/>(Notification)
    
    C->>App: 1. Sélectionne service<br/>+ date/heure
    App->>Moteur: 2. Demande réservation
    
    Moteur->>Calendar: 3. Vérifie disponibilité<br/>à la date/heure
    
    alt Créneau NON disponible
        Calendar-->>Moteur: 4. ❌ Créneau occupé
        Moteur-->>App: 5. Erreur
        App-->>C: 6. "Créneau indisponible.<br/>Choisissez autre."
    else Créneau disponible
        Calendar-->>Moteur: 7. ✅ Créneau libre
        
        Moteur->>BD: 8. Crée Booking<br/>status = "PENDING"<br/>booking_number = BK-XXXXX<br/>reserved_slot = date+heure
        
        BD-->>Moteur: 9. Booking créé
        
        par Traitement Parallèle
            Moteur->>Fraude: 10a. Lance fraude check<br/>(8 signaux)
            
            Moteur->>Calendar: 10b. Lock le créneau<br/>(protection contre double-booking)
        end
        
        Fraude->>BD: 11. Sauvegarde<br/>booking_fraud_analysis
        
        opt Évaluation Fraude
            alt Fraude score > 75
                Fraude-->>Moteur: 12a. Booking BLOQUÉ
                Moteur->>BD: 12b. booking.status<br/>= "BLOCKED"
                Moteur-->>App: 12c. Erreur
                App-->>C: 12d. "Réservation refusée<br/>pour raisons de sécurité"
            else Fraude score < 75
                Fraude-->>Moteur: 13. Booking OK
            end
        end
        
        Moteur-->>App: 14. ✅ Réservation confirmée
        App-->>C: 15. Notification<br/>📅 Votre réservation<br/>le " + date + " à " + heure<br/>Numéro: BK-XXXXX
        
        Moteur->>V: 16. Notifie vendeur<br/>🔔 "Nouvelle réservation<br/>par " + client_name<br/>Date: " + date
        
        loop Rappels Automatiques
            Note over Moteur,V: 24h avant :<br/>Envoi rappel vendeur
            Note over Moteur,C: 2h avant :<br/>Envoi rappel client
        end
    end
```

---

## 10.4 VALIDATION PAR QR CODE (Commande ou Réservation)

**Description** : Vérification et finalisation par scan QR à la livraison ou au rendez-vous.

```mermaid
sequenceDiagram
    participant C as Client
    participant App as Application
    participant QR as Lecteur QR<br/>(caméra)
    participant BD as Base de<br/>Données
    participant Moteur as Moteur<br/>Traitement
    participant V as Vendeur
    participant Notif as Service<br/>Notifications
    
    C->>App: 1. Ouvre la commande/réservation
    App->>App: 2. Affiche code QR<br/>ou flashe QR du vendeur
    
    alt Mode 1 : Client affiche son QR
        V->>QR: 3. Scan le QR du client<br/>avec caméra/lecteur
        QR-->>V: 4. Données extraites<br/>order_id / booking_id + client_id
    else Mode 2 : Client scanne QR vendeur
        C->>QR: 3. Scan le QR du vendeur<br/>via l'app
        QR-->>App: 4. Données extraites<br/>store_id + vendor_id
    end
    
    Moteur->>BD: 5. Cherche l'ordre/réservation<br/>WHERE order_id = extracted_id
    
    alt Ordre/Réservation NON trouvé
        BD-->>Moteur: 6a. ❌ Pas de match
        Moteur-->>App: 6b. Erreur "QR invalide"
        App-->>C: 6c. "Code QR invalide<br/>ou expiré"
    else Ordre/Réservation trouvé
        BD-->>Moteur: 7. Données order/booking
        
        opt Vérifications
            Moteur->>Moteur: 8a. Check 1:<br/>Status = "CONFIRMÉE"?
            
            Moteur->>Moteur: 8b. Check 2:<br/>Timing OK?<br/>(Date/heure pour reservation)<br/>(Pas trop tard pour order)
            
            Moteur->>Moteur: 8c. Check 3:<br/>Client authentifié<br/>= client de la commande?
        end
        
        alt Vérifications KO
            Moteur-->>App: 9a. Erreur détection
            App-->>C: 9b. "Commande invalide<br/>ou expirée"
        else Vérifications OK
            Moteur->>BD: 10. Update<br/>order/booking.status<br/>= "VALIDÉE"<br/>+ validated_at<br/>+ validated_by (client/vendor)
            
            par Mise à jour Parallèle
                BD->>BD: 11a. Update stock<br/>(si PRODUCT)
                BD->>BD: 11b. Update<br/>transaction.status<br/>= "COMPLETED"
                BD->>BD: 11c. Mark slot<br/>as occupied<br/>(si SERVICE)
            end
            
            Moteur-->>App: 12. ✅ Validation OK
            App-->>C: 13. Notification<br/>✅ "Commande validée<br/>et finalisée"
            
            Moteur->>V: 14. Notifie vendeur<br/>✅ "Livraison/Visite confirmée<br/>par client"
            
            Notif->>Notif: 15. Log transaction complétée<br/>+ marquer comme succès
            
            loop Post-Delivery (24h après)
                Moteur->>C: 16. Demande<br/>avis/feedback<br/>"Satisfait de votre<br/>expérience?"
            end
        end
    end
```

---

## 10.5 CRÉATION DE PRODUIT/SERVICE PAR IA DARIJA

**Description** : Vendeur décrit produit en Darija, IA génère listing complet.

```mermaid
sequenceDiagram
    participant V as Vendeur
    participant App as Application
    participant IA as Système IA<br/>(Darija)
    participant Trad as Traducteur<br/>Darija→FR
    participant Groq as LLM Groq
    participant Embed as Embeddings<br/>(Vecteurs)
    participant BD as Base de<br/>Données
    participant Admin as Modération<br/>Admin
    
    V->>App: 1. Clique "Créer produit"
    App->>App: 2. Mode "IA Darija" activé
    V->>App: 3. Décrit le produit<br/>EN DARIJA ORAL<br/>ex: "jeans bleu, mta3 dyal<br/>levi's, jdid, taille 32"
    
    opt Reconnaissance Vocale
        App->>App: 4. Transcrit audio<br/>en texte Darija
    end
    
    App->>IA: 5. Envoie description Darija
    
    IA->>Trad: 6. Demande traduction
    
    loop Traduction 2-tiers
        Trad->>Trad: 7a. Lookup dict<br/>(106K entrées)
        Trad->>Trad: 7b. Fallback vec search<br/>si mot absent
    end
    
    Trad-->>IA: 8. Description traduite<br/>en Français
    
    IA->>Groq: 9. Demande génération<br/>de listing complet<br/>Prompt: "Génère un listing<br/>e-commerce complet"
    
    Groq->>Groq: 10. Génère:<br/>- Titre commercial<br/>- Description détaillée<br/>- Catégorie<br/>- Tags/mots-clés<br/>- Prix suggéré<br/>- Spécifications
    
    Groq-->>IA: 11. Listing généré
    
    par Traitement Parallèle
        IA->>Embed: 12a. Génère embeddings<br/>pour indexation vecteur
        
        IA->>IA: 12b. Analyse qualité<br/>texte (spam, violence?)
    end
    
    Embed-->>IA: 13. Embeddings créés
    
    IA-->>App: 14. Listing complèt<br/>+ preview + quality score
    
    opt Review Vendeur
        V->>App: 15. Peut éditer/modifier<br/>titre, prix, catégorie
        App->>IA: 16. Retouches<br/>envoyées
        IA-->>App: 17. Validation<br/>retouches
    end
    
    V->>App: 18. Valide et publie
    App->>BD: 19. Crée item<br/>status = "PENDING_REVIEW"<br/>source = "ai_generated"
    
    BD-->>App: 20. Item créé
    
    alt Auto-Modération
        IA->>IA: 21a. Check qualité<br/>score > 80?
        alt Qualité OK
            IA->>BD: 21b. Auto-approve<br/>item.status<br/>= "PUBLISHED"
            BD-->>V: 21c. ✅ Item visible
        else Qualité faible
            IA->>Admin: 21d. Flag pour révision
            Admin->>Admin: 21e. Humain révise
        end
    else Manual Review
        Admin->>App: 22. Révise listing
        
        opt Approbation/Rejet
            alt Admin approuve
                Admin->>BD: 23a. item.status<br/>= "PUBLISHED"
                BD-->>V: 23b. ✅ Item visible
            else Admin rejette
                Admin->>BD: 23c. item.status<br/>= "REJECTED"
                Admin->>V: 23d. Message rejet<br/>+ raison
            end
        end
    end
```

---

## 10.6 CRÉATION DE TICKET ADMIN (Escalade d'alerte)

**Description** : Détection d'anomalie → création ticket admin avec priorité.

```mermaid
sequenceDiagram
    participant Syst as Système<br/>(Monitoring)
    participant Detect as Détection<br/>Anomalie
    participant BD as Base de<br/>Données
    participant Ticket as Gestionnaire<br/>Tickets
    participant Admin as Administrateur
    participant Email as Service<br/>Email
    
    Syst->>Detect: 1. Vérifie signaux<br/>toutes les 5 secondes
    
    loop Monitoring Continu
        Detect->>Detect: 2. Évalue:<br/>- Fraude score > 75?<br/>- Spam détecté?<br/>- Bug système?<br/>- Trop d'erreurs?
        
        alt Anomalie Détectée
            Detect->>Detect: 3. Calcule priorité<br/>CRITICAL (P0)<br/>HIGH (P1)<br/>MEDIUM (P2)<br/>LOW (P3)
            
            Detect->>Ticket: 4. Crée ticket admin<br/>title = anomaly name<br/>priority = calc priority<br/>status = "OPEN"<br/>timestamp = NOW()
            
            Ticket->>BD: 5. Insert ticket<br/>support_tickets table
            
            opt Assignation Auto
                Ticket->>Ticket: 6a. Check<br/>disponibilité admins
                
                alt Admins dispo?
                    Ticket->>Ticket: 6b. Assign à admin<br/>le moins occupé
                    Ticket->>Email: 6c. Envoie email<br/>📧 "Nouveau ticket P" +<br/>priority + détails
                else Tous occupés
                    Ticket->>Ticket: 6d. Ticket en queue<br/>status = "WAITING"
                end
            end
            
            opt Escalade Temps Réel
                alt Priority = P0 (CRITICAL)
                    Ticket->>Email: 7a. Email urgent<br/>à tout le team
                    Ticket->>Email: 7b. SMS alerte<br/>(si disponible)
                    Ticket->>Email: 7c. Slack notification<br/>(si disponible)
                end
            end
            
            BD-->>Detect: 8. ✅ Ticket créé<br/>ticket_id = #9999
            Detect-->>Syst: 9. Anomalie loggée
            
            Admin->>App: 10. Voit ticket<br/>dans dashboard
            
            opt Resolution Workflow
                Admin->>App: 11. Clique ticket<br/>pour détails complets
                App-->>Admin: 12. Affiche:<br/>- Description<br/>- Données relevantes<br/>- Historique
                
                Admin->>App: 13. Enquête<br/>et analyse cause
                
                alt Problem Identified
                    Admin->>App: 14a. Documente finding<br/>+ solution proposée
                    Admin->>App: 14b. Change<br/>ticket.status<br/>= "RESOLVED"<br/>ticket.resolution = text
                else Still Investigating
                    Admin->>App: 14c. Change<br/>ticket.status<br/>= "IN_PROGRESS"<br/>+ internal notes
                end
            end
            
        else Pas d'anomalie
            Detect->>Detect: 15. Continue monitoring
        end
    end
```

---

## 10.7 RECOMMANDATION DE PROMOTION PAR IA

**Description** : IA analyse ventes et recommande promotions intelligentes.

```mermaid
sequenceDiagram
    participant V as Vendeur
    participant App as Application
    participant IA as Système IA<br/>(Groq)
    participant BD as Base de<br/>Données
    participant Analyt as Analytics<br/>Engine
    participant Moteur as Moteur<br/>Traitement
    
    V->>App: 1. Visite section<br/>"AI Advisor"<br/>(Intelligence Tab)
    
    App->>Moteur: 2. Lance analyse
    Moteur->>BD: 3. Récupère données<br/>store_id du vendeur
    
    par Collecte Données Parallèle
        BD->>BD: 4a. Fetch orders<br/>des 30 derniers jours
        BD->>BD: 4b. Fetch product<br/>metrics (views,<br/>clicks, conversions)
        BD->>BD: 4c. Fetch inventory<br/>(stock, valeur)
        BD->>BD: 4d. Fetch reviews<br/>& ratings
    end
    
    BD-->>Analyt: 5. Données complètes
    
    Analyt->>Analyt: 6. Analyse 4 dimensions:<br/>- Produits DORMANTS<br/>(vues < 10/jour,<br/>zéro commande 15j)<br/>- Produits HOT<br/>(vues > 100/jour,<br/>commandes régulières)<br/>- Stock EXCESS<br/>(>3 mois, slow moving)<br/>- Prix ANOMALY<br/>(trop haut ou bas)
    
    loop Scoring Chaque Produit
        Analyt->>Analyt: 7. Calcule:<br/>- Conversion rate<br/>- Profit margin<br/>- Shelf life<br/>- Seasonal demand
    end
    
    Analyt->>IA: 8. Envoie:<br/>- 10 produits dormants<br/>- 5 produits hot<br/>- Stock excess info<br/>- Contexte saisonnier
    
    IA->>Groq: 9. Prompt génération<br/>"Suggère 5 promotions<br/>pour booster<br/>les ventes"
    
    Groq->>Groq: 10. Génère recommandations:<br/>1. Produits dormants<br/>→ Flash sale 30%<br/>2. Bundle HOT + DORMANT<br/>→ Promo combo 20%<br/>3. Stock excess<br/>→ Clearance 40%<br/>4. "Happy Hour"<br/>→ 1h/jour offre<br/>5. Loyalty bonus<br/>→ +10% fidèles
    
    Groq-->>IA: 11. 5 recommandations<br/>avec descriptions<br/>+ expected impact
    
    par Impact Analysis
        IA->>IA: 12a. Estime impact<br/>sur revenue<br/>(+20% espéré<br/>pour promo 1)
        
        IA->>IA: 12b. Estime compétence<br/>requise pour implémenter<br/>(easy/medium/hard)
    end
    
    IA-->>App: 13. Affiche 5 options<br/>au vendeur<br/>avec chiffres + détails
    
    opt Vendeur Choisit
        V->>App: 14a. Sélectionne promo #2<br/>(Bundle combo)
        
        App->>Moteur: 14b. Crée promo<br/>discount = 20%<br/>applicable_items =<br/>[dormant_id1,<br/>hot_id1, ...]<br/>valid_from = TODAY<br/>valid_until = +7 days
        
        Moteur->>BD: 14c. Insert promotion
        
        BD-->>V: 14d. ✅ Promo créée<br/>et LIVE
        
        loop Suivi Performance
            Note over IA,V: Jour 1 → Jour 7:<br/>IA suit conversion<br/>+ revenue boost<br/>Ajuste recommandations
        end
    else Vendeur Rejette
        V->>App: 15. Rejette promo
        App->>App: 16. Log rejection<br/>+ demande feedback
    end
```

---

## 10.8 DÉTECTION DE FRAUDE (8 signaux avec alt/par)

**Description** : Analyse en temps réel avec 8 signaux heuristiques et escalade.

```mermaid
sequenceDiagram
    participant Ordre as Créateur<br/>d'Ordre/Booking
    participant Moteur as Moteur<br/>Traitement
    participant Fraude as Moteur<br/>Fraude (8 signaux)
    participant BD as Base de<br/>Données
    participant Escalade as Escalade<br/>Décision
    participant Admin as Admin<br/>(Si besoin)
    
    Ordre->>Moteur: 1. Crée order/booking
    Moteur->>Fraude: 2. Lance fraude check<br/>(asynchrone)
    
    par Signal 1-8 Parallèle
        
        Fraude->>Fraude: 3a. SIGNAL 1:<br/>Compte < 1h?<br/>OUI → +30pts<br/>NON → +0
        
        Fraude->>Fraude: 3b. SIGNAL 2:<br/>Compte < 24h?<br/>OUI → +15pts<br/>NON → +0
        
        Fraude->>Fraude: 3c. SIGNAL 3:<br/>Vitesse (3+ orders<br/>en 5min)?<br/>OUI → +20pts<br/>NON → +0
        
        Fraude->>Fraude: 3d. SIGNAL 4:<br/>Email/Phone<br/>blacklisté?<br/>OUI → +25pts<br/>NON → +0
        
        Fraude->>Fraude: 3e. SIGNAL 5:<br/>Première commande<br/>très élevée<br/>(> 2x avg price)?<br/>OUI → +18pts<br/>NON → +0
        
        Fraude->>Fraude: 3f. SIGNAL 6:<br/>Localisation<br/>mismatch?<br/>(IP ≠ address)<br/>OUI → +12pts<br/>NON → +0
        
        Fraude->>Fraude: 3g. SIGNAL 7:<br/>Commandes<br/>dupliquées?<br/>OUI → +15pts<br/>NON → +0
        
        Fraude->>Fraude: 3h. SIGNAL 8:<br/>Cluster suspect?<br/>OUI → +10pts<br/>NON → +0
        
    end
    
    Fraude->>Fraude: 4. Agrège tous les pts<br/>Score_Total = Σ signaux
    
    opt Score Analysis
        Fraude->>Escalade: 5. Envoie:<br/>Score_Total<br/>+ détails signaux<br/>+ contexte ordre
    end
    
    alt Score 0-25 (SÛR)
        Escalade->>Escalade: 6a. Risk = TRÈS BAS
        Escalade->>BD: 6b. fraud_status<br/>= "APPROVED"<br/>fraud_risk = "SAFE"
        Escalade->>Moteur: 6c. ✅ Ordre continue
    else Score 25-55 (SUSPECT)
        Escalade->>Escalade: 6d. Risk = BAS
        Escalade->>BD: 6e. fraud_status<br/>= "FLAGGED"<br/>fraud_risk = "SUSPICIOUS"
        
        opt Manual Review Flag
            Escalade->>Admin: 6f. Flag pour révision<br/>mais ordre créé quand même
            Admin->>Admin: 6g. Admin peut<br/>monitorer ou<br/>rejeter manuellement
        end
        
        Escalade->>Moteur: 6h. ℹ️ Ordre créée<br/>+ flag
        
    else Score 55-75 (RISQUE ÉLEVÉ)
        Escalade->>Escalade: 6i. Risk = ÉLEVÉ
        Escalade->>BD: 6j. fraud_status<br/>= "ON_HOLD"<br/>fraud_risk = "HIGH_RISK"
        
        par Escalade Actions
            Escalade->>Admin: 7a. Email urgent<br/>📧 "Fraude détectée"<br/>Ticket créé
            
            Escalade->>Moteur: 7b. Ordre créée<br/>MAIS status<br/>= "ON_HOLD"<br/>(non visible<br/>au vendeur)
        end
        
        Admin->>App: 8a. Voit alerte<br/>dans dashboard
        Admin->>App: 8b. Analyse<br/>commande<br/>+ signaux
        
        opt Admin Decision
            alt Admin Approve
                Admin->>BD: 8c. fraud_status<br/>= "APPROVED"<br/>order.status<br/>= "CONFIRMED"
                BD-->>Ordre: 8d. ✅ Ordre active
            else Admin Reject
                Admin->>BD: 8e. fraud_status<br/>= "REJECTED"<br/>order.status<br/>= "CANCELLED"
                Admin->>Ordre: 8f. ❌ Ordre annulée<br/>+ raison expliquée
            end
        end
        
    else Score > 75 (BLOQUÉ)
        Escalade->>Escalade: 6k. Risk = TRÈS ÉLEVÉ
        Escalade->>BD: 6l. fraud_status<br/>= "BLOCKED"<br/>order/booking.status<br/>= "REJECTED"
        
        Escalade->>Moteur: 6m. ❌ Ordre rejetée
        Moteur-->>Ordre: 6n. Erreur<br/>"Transaction refusée<br/>pour raisons<br/>de sécurité"
        
        par Sécurité Actions
            Escalade->>BD: 7c. Log tentative<br/>fraud attempt
            Escalade->>Admin: 7d. Alerte urgente<br/>P0 Priority<br/>Ticket créé
        end
        
        Admin->>App: 8g. Enquête<br/>immédiate
        
        alt Faux Positif?
            Admin->>BD: 8h. Peut débloquer<br/>si erreur confirmée
        else Vrai Fraude
            Admin->>Ordre: 8i. Account<br/>peut être suspendu
        end
    end
    
    Fraude->>BD: 9. Sauvegarde<br/>fraude_analysis<br/>complète<br/>+ tous signaux<br/>détaillés
    
    Moteur-->>Ordre: 10. ✅ / ⚠️ / ❌<br/>Résultat final
```

---

## 📊 RÉSUMÉ COMPARATIF DES DIAGRAMMES

| Flux | Acteurs | Complexité | Alt | Opt | Loop | Par | Signaux |
|---|---|---|---|---|---|---|---|
| Recherche Sémantique | 7 | ⭐⭐⭐ | 1 | 1 | 1 | 1 | Cache, Darija |
| Passer Commande | 7 | ⭐⭐⭐⭐ | 2 | 2 | 0 | 2 | Auth, Duplicate |
| Réservation | 6 | ⭐⭐⭐ | 2 | 1 | 1 | 1 | Calendar, Fraude |
| Validation QR | 6 | ⭐⭐ | 2 | 1 | 0 | 1 | QR decode |
| Création Produit IA | 7 | ⭐⭐⭐⭐ | 1 | 2 | 1 | 1 | Darija, LLM |
| Ticket Admin | 5 | ⭐⭐⭐ | 3 | 2 | 1 | 0 | Escalade |
| Promo IA | 6 | ⭐⭐⭐⭐ | 1 | 1 | 1 | 1 | Analytics, LLM |
| Fraude Detection | 6 | ⭐⭐⭐⭐⭐ | 4 | 2 | 0 | 1 | 8 signaux |

---

## 📚 Références Académiques

- Cockburn, A. (2000). *Writing Effective Use Cases*. Addison-Wesley.
- UML 2.5 Specification (2015). Object Management Group.
- Sommerville, I. (2015). *Software Engineering* (10th edition). Pearson.
- Booch, G., Rumbaugh, J., & Jacobson, I. (2005). *The Unified Modeling Language User Guide*.
