
### 3.5.5 Conception de Sprint 1 — Release 3 (Intelligence Artificielle)

#### 3.5.5.1 Diagramme de cas d'utilisation de Sprint 1 (Release 3)

> *[Figure : Diagramme de cas d'utilisation — Intelligence Artificielle]*

**Description textuelle du cas d'utilisation « Recherche sémantique (Darija / Français) »**

| Cas d'utilisation | Recherche sémantique |
|-------------------|---------------------|
| **Acteurs** | Client |
| **Pré-condition** | Le client est connecté. Le moteur de recherche vectoriel est actif. |
| **Post-condition** | Les boutiques et produits les plus pertinents sont affichés. |
| **Scénario principal** | 1. Le client saisit une requête en texte libre (Darija ou français). 2. L'application envoie le texte au serveur IA. 3. Le serveur normalise et traduit le texte si nécessaire. 4. Le texte est converti en vecteur numérique par le modèle de langage. 5. Une recherche par similarité cosinus est effectuée dans la base de données (pgvector). 6. Les résultats sont classés par pertinence et retournés à l'application. |
| **Scénario alternatif** | Aucun résultat trouvé → l'application propose d'affiner la recherche. |

*Tableau : Description textuelle — Recherche sémantique*

#### 3.5.5.2 Diagrammes de séquence de Sprint 1 (Release 3)

**Diagramme de séquence : Recherche sémantique en Darija / Français**

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
    LLM-->>ServeurIA: Terme traduit et normalisé
    ServeurIA->>LLM: Demande la conversion du texte en vecteur numérique
    LLM-->>ServeurIA: Vecteur de représentation sémantique
    ServeurIA->>BD: Recherche les boutiques les plus proches (distance cosinus)
    BD-->>ServeurIA: Résultats classés par pertinence
    ServeurIA-->>Application: Liste des boutiques correspondantes
    Application-->>Client: Affiche les résultats triés par pertinence
```

> *[Figure : Diagramme de séquence — Recherche sémantique]*

**Diagramme de séquence : Recherche par photo (Vision IA)**

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant ServeurIA as API Vision (Image Search)
    participant GroqVision as Groq Vision (IA Cloud)
    participant BD as PostgreSQL (Recherche texte)

    Client->>Application: Prend une photo d'un produit ou d'un plat
    Application->>Application: Compresse et encode l'image en base64
    Application->>ServeurIA: Envoie l'image pour analyse
    ServeurIA->>GroqVision: Soumet l'image au modèle de vision
    GroqVision->>GroqVision: Analyse l'image et identifie les objets
    GroqVision-->>ServeurIA: Description des objets identifiés
    alt Objet non reconnu
        ServeurIA-->>Application: "Impossible d'identifier l'objet"
        Application-->>Client: Propose la recherche manuelle
    else Objet reconnu
        ServeurIA->>BD: Recherche en texte intégral avec les mots-clés extraits
        BD-->>ServeurIA: Boutiques et produits correspondants
        ServeurIA-->>Application: Résultats de recherche
        Application-->>Client: Affiche les boutiques qui vendent cet objet
    end
```

> *[Figure : Diagramme de séquence — Recherche par photo]*

**Diagramme de séquence : Détection de fraude (IA)**

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Serveur as API Commandes
    participant IA as Moteur de détection IA (Groq)
    participant BD as Base de données
    participant Admin as Dashboard Admin (SaaS)

    Commerçant->>Dashboard: Crée une nouvelle commande ou promotion
    Dashboard->>Serveur: Envoie les données de la transaction
    Serveur->>BD: Récupère l'historique récent du commerçant
    BD-->>Serveur: Historique des transactions et comportements
    Serveur->>IA: Envoie les données pour analyse de risque
    IA->>IA: Analyse les indicateurs de fraude
    IA->>IA: Vérifie les prix anormalement bas ou élevés
    IA->>IA: Détecte les volumes inhabituels de commandes
    IA-->>Serveur: Score de risque (0-100) et détails
    alt Score de risque élevé (> 80)
        Serveur->>BD: Bloque la transaction automatiquement
        Serveur->>Admin: Notification "Fraude potentielle détectée"
        Dashboard-->>Commerçant: "Transaction suspendue — En cours de vérification"
    else Score de risque moyen (40-80)
        Serveur->>BD: Marque la transaction comme "À surveiller"
        Dashboard-->>Commerçant: Transaction acceptée avec surveillance
    else Score de risque faible (< 40)
        Serveur->>BD: Enregistre la transaction normalement
        Dashboard-->>Commerçant: Transaction confirmée
    end
```

> *[Figure : Diagramme de séquence — Détection de fraude]*

**Diagramme de séquence : Analyse de sentiment des avis (IA)**

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
    IA->>IA: Extrait les thèmes récurrents (qualité, prix, service)
    IA-->>Serveur: Résultats d'analyse (sentiment + thèmes + score)
    Serveur->>BD: Enregistre les résultats d'analyse
    BD-->>Serveur: Analyse sauvegardée
    Serveur-->>Dashboard: Résultats formatés avec statistiques
    alt Majorité de commentaires négatifs
        Dashboard-->>Commerçant: "Attention : baisse de satisfaction sur le thème Service"
    else Commentaires globalement positifs
        Dashboard-->>Commerçant: Tableau de bord sentiment avec graphiques
    end
```

> *[Figure : Diagramme de séquence — Analyse de sentiment]*

**Diagramme de séquence : Recommandation de promotions (IA)**

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Serveur as API Promotions
    participant BD as Base de données
    participant IA as Moteur de recommandation IA (OpenRouter)

    Commerçant->>Dashboard: Clique "Créer une promotion assistée par IA"
    Dashboard->>Serveur: Demande une recommandation de promotion
    Serveur->>BD: Récupère les données de vente des 30 derniers jours
    Serveur->>BD: Identifie les produits à faible rotation de stock
    BD-->>Serveur: Données commerciales complètes
    Serveur->>IA: Envoie les données pour analyse et recommandation
    IA->>IA: Calcule le pourcentage de remise optimal
    IA->>IA: Propose une durée de promotion adaptée
    IA->>IA: Génère un texte promotionnel attractif
    IA-->>Serveur: Recommandation complète (produits, remise %, durée, texte)
    Serveur-->>Dashboard: Proposition de promotion pré-remplie
    alt Commerçant accepte la suggestion
        Commerçant->>Dashboard: Valide et publie la promotion
        Dashboard->>Serveur: Enregistre la promotion
        Serveur->>BD: INSERT promotion avec dates de début et fin
        Dashboard-->>Commerçant: "Promotion publiée"
    else Commerçant modifie la suggestion
        Commerçant->>Dashboard: Ajuste les paramètres manuellement
        Dashboard->>Serveur: Enregistre la version modifiée
        Dashboard-->>Commerçant: "Promotion personnalisée publiée"
    end
```

> *[Figure : Diagramme de séquence — Recommandation de promotions]*

**Diagramme de séquence : Assistant IA conversationnel (RAG)**

```mermaid
sequenceDiagram
    actor Utilisateur
    participant Application as Application Mobile
    participant ServeurIA as API Assistant IA
    participant BD as PostgreSQL (pgvector - RAG)
    participant LLM as OpenRouter (LLM Cloud)

    Utilisateur->>Application: Pose une question à l'assistant
    Application->>ServeurIA: Envoie la question
    ServeurIA->>ServeurIA: Analyse l'intention de la question
    ServeurIA->>BD: Recherche les données pertinentes (produits, commandes, stock)
    BD-->>ServeurIA: Données contextuelles de la boutique
    ServeurIA->>ServeurIA: Construit le prompt avec le contexte réel
    ServeurIA->>LLM: Envoie le prompt enrichi au modèle IA
    LLM-->>ServeurIA: Génère la réponse en streaming (mot par mot)
    ServeurIA-->>Application: Transmet la réponse progressivement
    Application-->>Utilisateur: Affiche la réponse mot par mot
```

> *[Figure : Diagramme de séquence — Assistant IA conversationnel]*

---

### 3.5.6 Conception de Sprint 2 — Release 3 (Contenu & Engagement Social)

#### 3.5.6.1 Diagramme de cas d'utilisation de Sprint 2 (Release 3)

> *[Figure : Diagramme de cas d'utilisation — Contenu & Engagement Social]*

#### 3.5.6.2 Diagrammes de séquence de Sprint 2 (Release 3)

**Diagramme de séquence : Publication d'un Reel ou d'une Story**

```mermaid
sequenceDiagram
    actor Commerçant
    participant Dashboard as Dashboard Web (Next.js)
    participant Cloudinary as Cloudinary (CDN Cloud)
    participant Serveur as API Contenu
    participant BD as Base de données

    Commerçant->>Dashboard: Sélectionne une vidéo ou une image à publier
    Dashboard->>Cloudinary: Envoie le fichier pour hébergement
    Cloudinary->>Cloudinary: Transcode la vidéo et génère une miniature
    Cloudinary-->>Dashboard: Lien sécurisé du contenu hébergé
    Dashboard->>Serveur: Envoie les métadonnées et le lien du fichier
    alt Publication d'un Reel
        Serveur->>BD: Enregistre le Reel avec le lien Cloudinary
        Dashboard-->>Commerçant: "Reel publié avec succès"
    else Publication d'une Story
        Serveur->>BD: Enregistre la Story avec expiration 24h
        Dashboard-->>Commerçant: "Story publiée — Expire dans 24 heures"
    end
```

> *[Figure : Diagramme de séquence — Publication Reel / Story]*

**Diagramme de séquence : Chat en temps réel (Client ↔ Commerçant)**

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
    AppPro-->>Commerçant: Message reçu instantanément
    Commerçant->>AppPro: Rédige et envoie une réponse
    AppPro->>Supabase: Transmet la réponse via WebSocket
    Supabase->>BD: Enregistre la réponse
    BD-->>Supabase: Réponse sauvegardée
    Supabase->>AppClient: Diffuse la réponse en temps réel
    AppClient-->>Client: Réponse reçue instantanément
```

> *[Figure : Diagramme de séquence — Chat temps réel]*

**Diagramme de séquence : Dépôt d'un avis client**

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Serveur as API Avis
    participant BD as Base de données

    Client->>Application: Note la prestation et écrit un commentaire
    Application->>Serveur: Envoie l'avis
    Serveur->>BD: Vérifie qu'une transaction réelle a eu lieu
    alt Aucune transaction vérifiée
        BD-->>Serveur: Pas de commande ou réservation confirmée
        Serveur-->>Application: "Vous devez avoir effectué un achat"
        Application-->>Client: Affiche le message d'erreur
    else Transaction confirmée
        Serveur->>BD: Enregistre l'avis et recalcule la note moyenne
        BD-->>Serveur: Nouvelle note moyenne
        Serveur-->>Commerçant: Notification "Nouvel avis reçu"
        Serveur-->>Application: Avis publié
        Application-->>Client: "Merci pour votre avis"
    end
```

> *[Figure : Diagramme de séquence — Dépôt d'un avis]*

---

### 3.5.7 Conception de Sprint 3 — Release 3 (Administration SaaS)

#### 3.5.7.1 Diagramme de cas d'utilisation de Sprint 3 (Release 3)

> *[Figure : Diagramme de cas d'utilisation — Administration SaaS]*

#### 3.5.7.2 Diagrammes de séquence de Sprint 3 (Release 3)

**Diagramme de séquence : Signalement et modération de contenu**

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
        Serveur->>Admin: Notification "Contenu à examiner"
        Admin-->>Administrateur: Nouveau contenu à modérer
    else Seuil non atteint
        BD-->>Serveur: Signalement enregistré
    end
    Serveur-->>Application: "Signalement enregistré — Merci"
    Application-->>Client: Confirmation du signalement
```

> *[Figure : Diagramme de séquence — Signalement et modération]*

**Diagramme de séquence : Suspension d'un utilisateur (Admin)**

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
    Admin-->>Administrateur: "Compte suspendu — Utilisateur déconnecté"
```

> *[Figure : Diagramme de séquence — Suspension d'un utilisateur]*

**Diagramme de séquence : Notifications en temps réel**

```mermaid
sequenceDiagram
    participant Action as Événement système
    participant BD as Base de données
    participant Realtime as Supabase Realtime (WebSocket)
    participant Application as Application Mobile / Dashboard

    Action->>BD: Un événement métier se produit (commande, like, message)
    BD->>BD: Trigger PostgreSQL détecte l'insertion
    BD->>Realtime: Déclenche une diffusion sur le canal concerné
    Realtime->>Application: Pousse la notification via WebSocket
    Application-->>Utilisateur: Notification affichée (badge, bannière, son)
```

> *[Figure : Diagramme de séquence — Notifications temps réel]*

---

### 3.5.8 Diagramme de classe global

Le diagramme de classes global représente la structure statique de la base de données de la plateforme RO2YA. Il décrit les entités principales du système, leurs attributs et les relations qui les unissent.

> *[Figure : Diagramme de classes global de RO2YA]*

| Entité | Attributs principaux | Relations |
|--------|---------------------|-----------|
| **User** | id, email, role, status, created_at | 1 User → 0..1 Store |
| **Store** | id, owner_id, name, status, location (GPS), rating | 1 Store → N Items, N Orders, N Bookings |
| **Item** | id, store_id, name, price, stock_qty, is_active, image_url | N Items → N OrderItems |
| **Order** | id, customer_id, store_id, status, total, created_at | 1 Order → N OrderItems |
| **OrderItem** | id, order_id, item_id, qty, unit_price | — |
| **Booking** | id, customer_id, store_id, slot_date, slot_time, status | — |
| **Review** | id, customer_id, store_id, rating, comment, sentiment_score | — |
| **Message** | id, sender_id, receiver_id, content, read_at | — |
| **Reel** | id, store_id, video_url, likes_count, views_count | — |
| **Promotion** | id, store_id, title, discount_pct, starts_at, ends_at | — |

*Tableau : Entités principales du diagramme de classes global*

---

## 3.6 Conclusion

Ce chapitre a présenté la démarche méthodologique adoptée pour le développement de la plateforme RO2YA, basée sur la méthode Scrum. L'analyse des besoins, la planification en sprints et la conception UML détaillée pour chaque release constituent une base solide pour l'implémentation décrite dans le chapitre suivant.
