# CHAPITRE 3 : MÉTHODOLOGIE ET CONCEPTION

---

## 3.1 Introduction

Ce chapitre présente la démarche méthodologique adoptée pour concevoir et développer la plateforme **RO2YA**. Il décrit la méthode agile utilisée, les étapes de planification, ainsi que les choix de conception fonctionnelle et technique qui ont guidé le développement du projet, depuis l'analyse des besoins jusqu'aux diagrammes UML de chaque sprint.

---

## 3.2 Méthodologie de travail

### 3.2.1 Méthodes agiles

La méthode Agile est une approche itérative et collaborative de gestion de projet, permettant de répondre efficacement aux besoins initiaux du client ainsi qu'aux évolutions en cours de développement.

Elle repose sur un cycle centré sur le client, qui est impliqué tout au long du projet, de sa conception à sa livraison. Cette collaboration permet d'obtenir des retours réguliers et d'intégrer rapidement les ajustements nécessaires. Par rapport aux méthodes classiques, l'Agile offre une meilleure visibilité sur l'avancement du projet et permet de livrer un logiciel fonctionnel de manière progressive et continue.

### 3.2.2 Méthode agile adoptée : Scrum

Afin d'assurer le bon déroulement du projet, nous avons choisi **Scrum** comme méthode agile. Scrum est aujourd'hui la méthode agile la plus répandue. Inspirée du rugby, elle fonctionne par sprints, c'est-à-dire des cycles courts de développement (souvent de deux semaines), durant lesquels l'équipe se concentre sur un ensemble précis de tâches. À la fin de chaque sprint, une version incrémentée du produit est livrée, intégrant les nouvelles fonctionnalités développées.

> *[Figure : Cycle Scrum]*

**1) Les acteurs clés de Scrum**

Scrum s'articule autour de trois rôles principaux :

- **Le Product Owner** : il est chargé de transmettre les besoins des clients et utilisateurs finaux. Il coordonne la participation des parties prenantes et s'assure de l'alignement avec les priorités du projet pour garantir la cohérence du produit livré.
- **Le Scrum Master** : membre de l'équipe, il a pour mission d'optimiser la productivité du groupe. Il soutient l'équipe en favorisant son autonomie et en l'aidant à s'améliorer continuellement à travers les cérémonies Scrum.
- **L'équipe de développement** : composée idéalement de moins de dix personnes, elle fonctionne sans hiérarchie formelle. L'équipe est auto-organisée et responsable de l'exécution des tâches définies pour chaque sprint.

**2) Concepts clés de la méthode Scrum**

- **Product Backlog** : il s'agit de la liste initiale des exigences du projet, priorisées avec le client. Ce carnet évolue tout au long du développement, selon les besoins émergents.
- **Sprint Backlog** : au début de chaque sprint, l'équipe définit un objectif et sélectionne les tâches à accomplir à partir du Product Backlog. Ces tâches constituent le Sprint Backlog.
- **User Story** : ce terme désigne une fonctionnalité décrite du point de vue de l'utilisateur ou du client.
- **La mêlée quotidienne (Daily Scrum)** : réunion brève et quotidienne visant à faire le point sur l'avancement, les obstacles rencontrés et les actions à venir.

---

## 3.3 Mise en place du projet

Cette partie est dédiée à la première phase de la méthodologie Scrum, appelée « Sprint 0 ». Cette étape vise à poser les bases du projet en présentant les fonctionnalités principales, le diagramme global des cas d'utilisation, ainsi que le Product Backlog.

### 3.3.1 Analyse des besoins

Cette section a pour objectif de définir les besoins fonctionnels, tout en identifiant les différents acteurs impliqués dans le système.

#### 3.3.1.1 Identification des acteurs

**CLIENT**

Le client est l'utilisateur final de l'application mobile RO2YA. Il peut parcourir le catalogue des boutiques locales, effectuer des recherches par texte ou par photo, passer des commandes, réserver des services, regarder des Reels promotionnels, laisser des avis et discuter en temps réel avec les commerçants.

**COMMERÇANT PRO**

Le commerçant est le propriétaire d'une boutique locale inscrite sur la plateforme. Il gère son catalogue de produits et services, traite les commandes reçues, gère les réservations et son planning, publie des contenus vidéo (Reels et Stories), consulte ses statistiques et bénéficie de fonctionnalités d'intelligence artificielle pour optimiser son activité.

**ADMINISTRATEUR**

L'administrateur est le gestionnaire de la plateforme SaaS RO2YA. Il est chargé de valider les demandes de création de boutiques, de modérer les contenus non conformes, de gérer les comptes utilisateurs et de surveiller les activités suspectes grâce au moteur de détection de fraude.

#### 3.3.1.2 Les besoins fonctionnels

**S'inscrire :**

Cette fonctionnalité permet à tout nouvel utilisateur de créer un compte sur la plateforme RO2YA en fournissant son adresse email et un mot de passe. Une vérification par code OTP est envoyée par email afin de valider l'identité de l'utilisateur avant l'activation de son compte.

**Se connecter :**

Cette fonctionnalité permet à tout utilisateur disposant d'un compte actif de se connecter à la plateforme à l'aide de ses identifiants (email et mot de passe). Le système délivre un jeton de session sécurisé (JWT) permettant l'accès aux fonctionnalités protégées.

**Gérer sa boutique (Commerçant) :**

Cette fonctionnalité permet au commerçant de créer sa boutique en renseignant ses informations (nom, catégorie, localisation GPS, photos), de modifier son profil et ses horaires, et de gérer son catalogue de produits et services.

**Passer une commande (Client) :**

Cette fonctionnalité permet au client d'ajouter des produits au panier, de valider sa commande et de suivre son état en temps réel. La livraison est confirmée par scan d'un QR Code sécurisé généré par l'application.

**Réserver un service (Client) :**

Cette fonctionnalité permet au client de consulter les créneaux disponibles d'un prestataire et de réserver un rendez-vous directement depuis l'application mobile.

**Rechercher par texte ou par photo (IA) :**

Cette fonctionnalité permet au client de rechercher des boutiques ou des produits en saisissant du texte en français ou en dialecte algérien (Darija), ou en prenant une photo d'un objet. Le moteur d'intelligence artificielle analyse la requête et retourne les résultats les plus pertinents.

**Valider une boutique (Administrateur) :**

Cette fonctionnalité permet à l'administrateur d'examiner les dossiers de création de boutiques soumis par les commerçants et de les approuver ou les rejeter selon les critères de conformité de la plateforme.

---

## 3.4 Diagramme de cas d'utilisation globale et planification des sprints

### 3.4.1 Langage de modélisation adopté

Le langage de modélisation adopté dans notre projet est **UML (Unified Modeling Language)**. Une image vaut mieux qu'un long discours. Ce proverbe résume l'origine de la schématisation en langage de modélisation unifié (UML). Son objectif : créer un langage visuel commun dans le monde complexe du développement de logiciels, un langage qui serait compris aussi bien par les développeurs que par les utilisateurs professionnels et toutes les parties prenantes souhaitant comprendre le système.

### 3.4.2 Diagramme de cas d'utilisation global

Afin de présenter de manière formelle les fonctionnalités de notre système, nous utilisons le diagramme de cas d'utilisation issu du langage de modélisation UML. Ces diagrammes offrent une vue d'ensemble du comportement fonctionnel d'un système logiciel. Ils sont particulièrement utiles pour communiquer avec la direction ou les parties prenantes d'un projet. Bien que moins détaillés pour le développement, ils permettent de visualiser les interactions principales entre les utilisateurs et le logiciel. Chaque cas d'utilisation décrit une interaction distincte entre un acteur et le système.

La figure ci-dessous illustre le diagramme global des cas d'utilisation de la plateforme RO2YA. Ce schéma met en évidence les trois acteurs principaux ainsi que les cas d'utilisation qui leur sont associés.

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])
    A(["Administrateur"])

    subgraph Plateforme_RO2YA ["Plateforme RO2YA"]
        direction TB

        subgraph AUTH ["Authentification"]
            UC1(["S'inscrire"])
            UC_OTP(["Verifier OTP"])
            UC2(["Se connecter"])
            UC_JWT(["Acceder page protegee"])
            UC1 -.->|"include"| UC_OTP
            UC2 -.->|"include"| UC_JWT
        end

        subgraph BOUTIQUE ["Boutiques"]
            UC3(["Creer une boutique"])
            UC_UPLOAD(["Uploader les photos"])
            UC4(["Modifier le profil"])
            UC5(["Consulter profil public"])
            UC20(["Valider une boutique"])
            UC_REJECT(["Rejeter la boutique"])
            UC3 -.->|"include"| UC_UPLOAD
            UC20 -.->|"extend"| UC_REJECT
        end

        subgraph COMMANDES ["Catalogue et Commandes"]
            UC6(["Ajouter un produit"])
            UC7(["Parcourir le catalogue"])
            UC8(["Passer une commande"])
            UC9(["Traiter la commande"])
            UC10(["Livrer via QR Code"])
            UC_ANNULER(["Annuler la commande"])
            UC8 -.->|"include"| UC9
            UC9 -.->|"include"| UC10
            UC8 -.->|"extend"| UC_ANNULER
        end

        subgraph RESERVATION ["Reservations"]
            UC_CRENEAUX(["Consulter les creneaux"])
            UC11(["Reserver un service"])
            UC12(["Gerer les disponibilites"])
            UC_CRENEAUX -.->|"include"| UC11
        end

        subgraph IA ["IA et Recherche"]
            UC13(["Recherche semantique"])
            UC14(["Recherche par photo"])
            UC15(["Assistant IA"])
            UC16(["Recommandation promos"])
            UC_FRAUDE(["Detecter fraude"])
            UC_BLOC(["Bloquer transaction"])
            UC14 -.->|"extend"| UC13
            UC_FRAUDE -.->|"include"| UC_BLOC
        end

        subgraph SOCIAL ["Contenu et Social"]
            UC17(["Publier Reel ou Story"])
            UC_CDN(["Uploader sur Cloudinary"])
            UC18(["Laisser un avis"])
            UC_SENT(["Analyser sentiment IA"])
            UC19(["Chat temps reel"])
            UC17 -.->|"include"| UC_CDN
            UC18 -.->|"extend"| UC_SENT
        end

        subgraph ADMIN ["Administration"]
            UC21(["Moderer le contenu"])
            UC22(["Gerer les utilisateurs"])
            UC23(["Surveiller les fraudes"])
        end
    end

    C --> UC1 & UC2 & UC5 & UC7 & UC8 & UC_CRENEAUX & UC13 & UC14 & UC15 & UC18 & UC19
    P --> UC1 & UC2 & UC3 & UC4 & UC6 & UC9 & UC12 & UC16 & UC17 & UC19 & UC_FRAUDE
    A --> UC2 & UC20 & UC21 & UC22 & UC23
```

*Figure : Diagramme de cas d'utilisation global de RO2YA*

### 3.4.3 Adaptation au cycle de développement Scrum

#### 3.4.3.1 Répartition des rôles

Pour assurer une gestion efficace du projet selon la méthodologie Scrum, les rôles suivants ont été définis :

| Rôle | Personne concernée |
|------|--------------------|
| Product Owner | Encadrant académique |
| Scrum Master | Chef de projet (étudiant) |
| Équipe de développement | Équipe étudiante |

*Tableau : Répartition des rôles Scrum*

#### 3.4.3.2 Product Backlog

Le Product Backlog constitue l'inventaire structuré de toutes les fonctionnalités requises pour la plateforme RO2YA. Il présente une vue d'ensemble des besoins fonctionnels identifiés lors de l'analyse, organisés de manière à faciliter la planification et le développement itératif.

Le tableau ci-dessous représente les fonctionnalités selon des critères de classification :

- **L'effort** : représente la difficulté technique estimée pour implémenter la fonctionnalité. Il est noté sur une échelle de 1 à 5, où 1 correspond à une tâche simple et 5 à une tâche complexe nécessitant plus de ressources.
- **La priorité** : également notée sur 5, reflète l'importance de la fonctionnalité pour les utilisateurs finaux ainsi que son impact sur les objectifs du projet. Plus la note est élevée, plus la fonctionnalité est considérée comme prioritaire.

| Thème | Fonctionnalité | Description | Effort | Priorité |
|-------|---------------|-------------|--------|---------|
| Authentification | S'inscrire | Permettre à un nouvel utilisateur de créer un compte avec vérification OTP | 3 | 5 |
| Authentification | Se connecter | Permettre à un utilisateur existant de s'authentifier via email et mot de passe | 2 | 5 |
| Authentification | Accéder à une page protégée | Vérifier le jeton de session (JWT) et les droits d'accès à chaque requête | 3 | 5 |
| Boutique | Créer une boutique | Permettre au commerçant de créer son profil boutique avec géolocalisation et photos | 4 | 5 |
| Boutique | Valider une boutique | Permettre à l'admin de valider ou rejeter les demandes de création | 3 | 5 |
| Boutique | Modifier le profil | Permettre au commerçant de mettre à jour ses horaires et informations | 2 | 4 |
| Catalogue | Ajouter un produit | Permettre au commerçant d'ajouter un produit ou service à son catalogue | 3 | 5 |
| Commandes | Passer une commande | Permettre au client de commander avec gestion du stock en temps réel | 5 | 5 |
| Commandes | Livrer via QR Code | Permettre la confirmation de livraison par scan d'un QR Code sécurisé | 4 | 5 |
| Réservations | Réserver un service | Permettre au client de réserver un créneau disponible | 4 | 4 |
| Recherche IA | Recherche sémantique | Permettre la recherche en Darija/Français via un moteur vectoriel | 5 | 5 |
| Recherche IA | Recherche par photo | Permettre l'identification de produits par analyse d'image (Vision IA) | 5 | 4 |
| Contenu | Publier un Reel | Permettre au commerçant de publier des vidéos promotionnelles | 4 | 3 |
| Social | Chat temps réel | Permettre la messagerie instantanée entre client et commerçant | 4 | 4 |
| IA | Détection de fraude | Analyser les transactions pour détecter les comportements suspects | 5 | 5 |
| IA | Analyse de sentiment | Analyser les avis clients pour extraire les points forts et axes d'amélioration | 4 | 3 |
| IA | Recommandation promos | Suggérer des promotions adaptées basées sur les données de vente | 4 | 3 |
| IA | Assistant conversationnel | Fournir un chatbot IA capable de répondre aux questions métier | 5 | 4 |
| Admin | Modérer le contenu | Permettre la suppression de contenus non conformes signalés | 3 | 5 |
| Admin | Gérer les utilisateurs | Permettre la suspension et réactivation des comptes utilisateurs | 3 | 4 |

*Tableau : Product Backlog de la plateforme RO2YA*

#### 3.4.3.3 Planification des sprints du projet

Le sprint est une période qui dure entre une et quatre semaines, au bout de laquelle l'équipe doit réaliser un incrément de produit livrable. Un nouveau sprint démarre lorsque le précédent est terminé.

L'objectif de cette étape est d'organiser le calendrier de travail et de définir le Backlog pour chaque sprint. La planification des sprints est illustrée dans le tableau ci-dessous :

| | SPRINT | Fonctionnalités |
|--|--------|----------------|
| **RELEASE 1** | Sprint 1 | Authentification (Inscription · Connexion · Session protégée) |
| **RELEASE 2** | Sprint 1 | Gestion des Boutiques (Création · Validation Admin · Modification profil) |
| | Sprint 2 | Catalogue & Commandes (Ajout produit · Commande · QR Code · Annulation) |
| | Sprint 3 | Réservations & Géolocalisation |
| **RELEASE 3** | Sprint 1 | Intelligence Artificielle (Recherche Darija · Vision · Fraude · Sentiment · Promos · RAG) |
| | Sprint 2 | Contenu & Social (Reels · Stories · Likes · Chat temps réel · Avis) |
| | Sprint 3 | Administration SaaS (Modération · Utilisateurs · Analytics · Notifications) |

*Tableau : Planification des sprints du projet RO2YA*

**Planification Release 1**

Une fois l'analyse des besoins et les spécifications des exigences du projet élaborées, nous présentons notre premier release qui comporte un sprint axé sur les fonctionnalités d'authentification.

*Sprint 1 :*

| Thème | Fonctionnalité | Estimation (jours) |
|-------|---------------|-------------------|
| Authentification | S'inscrire (avec vérification OTP) | 7 |
| Authentification | Se connecter | 5 |
| Authentification | Accéder à une page protégée (JWT) | 4 |

*Tableau : Backlog Sprint 1 — Release 1*

**Planification Release 2**

*Sprint 1 :*

L'objectif de ce sprint est de permettre aux commerçants de créer et gérer leur boutique sur la plateforme, et à l'administrateur de valider les demandes.

| Thème | Fonctionnalités | Estimation (jours) |
|-------|----------------|-------------------|
| Boutique | Créer une boutique · Valider (Admin) · Modifier le profil | 12 |

*Tableau : Backlog Sprint 1 — Release 2*

*Sprint 2 :*

L'objectif de ce sprint est de permettre aux commerçants de gérer leur catalogue et aux clients de passer des commandes complètes, de la mise au panier jusqu'à la livraison par QR Code.

| Thème | Fonctionnalités | Estimation (jours) |
|-------|----------------|-------------------|
| Catalogue & Commandes | Ajout produit · Commande · QR Code · Annulation | 15 |

*Tableau : Backlog Sprint 2 — Release 2*

*Sprint 3 :*

L'objectif de ce sprint est de permettre aux clients de réserver des services auprès des prestataires et d'explorer les boutiques à proximité via une carte géographique interactive.

| Thème | Fonctionnalités | Estimation (jours) |
|-------|----------------|-------------------|
| Réservations | Réserver un créneau · Clôturer une réservation | 10 |
| Géolocalisation | Exploration sur carte · Filtres de proximité | 8 |

*Tableau : Backlog Sprint 3 — Release 2*

---


## 3.5 Conception

### 3.5.1 Conception de Sprint 1 — Release 1 (Authentification)

#### 3.5.1.1 Diagramme de cas d'utilisation de Sprint 1

La figure ci-dessous illustre le diagramme des cas d'utilisation du premier sprint.

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant"])

    subgraph Sprint1R1 ["Sprint 1 — Authentification"]
        UC1([S'inscrire])
        UC2([Vérifier le code OTP])
        UC3([Se connecter])
        UC4([Accéder à une page protégée])
        UC1 -.->|inclut| UC2
        UC3 -.->|inclut| UC4
    end

    C --> UC1 & UC3
    P --> UC1 & UC3
```

*Figure : Diagramme de cas d'utilisation — Sprint 1, Release 1*

#### 3.5.1.2 Diagramme de séquence de Sprint 1

**Diagramme de séquence : Inscription d'un utilisateur**

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
            SupabaseAuth->>Email: Envoie le code de vérification OTP
            Email-->>Utilisateur: Code OTP reçu par email
            Utilisateur->>Application: Saisit le code OTP
            Application->>SupabaseAuth: Envoie le code OTP
            alt Code invalide ou expiré
                SupabaseAuth-->>Application: Code incorrect
                Application-->>Utilisateur: "Code invalide ou expiré"
            else Code valide
                SupabaseAuth->>BD: Active le compte
                SupabaseAuth-->>Application: Jeton de session
                Application-->>Utilisateur: Compte activé — Bienvenue
            end
        end
    end
```

> *[Figure : Diagramme de séquence — Inscription]*

**Diagramme de séquence : Connexion d'un utilisateur**

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
            Application-->>Utilisateur: Connecté — Redirection vers l'accueil
        end
    end
```

> *[Figure : Diagramme de séquence — Connexion]*

---

### 3.5.2 Conception de Sprint 1 — Release 2 (Gestion des Boutiques)

#### 3.5.2.1 Diagramme de cas d'utilisation de Sprint 1 (Release 2)

La figure ci-dessous illustre le diagramme des cas d'utilisation du premier sprint de la deuxième release.

```mermaid
flowchart LR
    P(["💼 Commerçant PRO"])
    A(["🛡️ Administrateur"])
    C(["👤 Client"])

    subgraph Sprint1R2 ["Sprint 1 Release 2 — Gestion des Boutiques"]
        UC1([Créer une boutique])
        UC2([Uploader les photos])
        UC3([Valider une boutique])
        UC4([Rejeter une boutique])
        UC5([Modifier le profil])
        UC6([Consulter profil public])
        UC1 -.->|inclut| UC2
        UC3 -.->|étend| UC4
    end

    P --> UC1 & UC5
    A --> UC3 & UC4
    C --> UC6
```

*Figure : Diagramme de cas d'utilisation — Sprint 1, Release 2*

**Description textuelle du cas d'utilisation « Créer une boutique »**

| Cas d'utilisation | Créer une boutique |
|-------------------|--------------------|
| **Acteurs** | Commerçant PRO |
| **Pré-condition** | Le commerçant est connecté et son compte est actif. |
| **Post-condition** | La boutique est créée avec le statut « En attente de validation ». Les informations et photos sont sauvegardées. |
| **Scénario principal** | 1. Le commerçant remplit le formulaire (nom, catégorie, adresse, coordonnées GPS). 2. Il ajoute le logo et les photos de la boutique. 3. L'application vérifie que tous les champs obligatoires sont remplis. 4. Si les données sont valides, les images sont envoyées au serveur d'images (Cloudinary). 5. Le serveur Cloudinary compresse et héberge les images. 6. L'application envoie les données complètes (avec liens images) au serveur. 7. Le serveur enregistre la boutique dans la base de données avec le statut « En attente ». 8. Le commerçant reçoit une confirmation. |
| **Scénario alternatif** | Données incomplètes ou invalides → l'application affiche un message d'erreur avant d'envoyer la requête. |

*Tableau : Description textuelle du cas « Créer une boutique »*

**Description textuelle du cas d'utilisation « Valider une boutique » (Admin)**

| Cas d'utilisation | Valider une boutique |
|-------------------|---------------------|
| **Acteurs** | Administrateur |
| **Pré-condition** | L'administrateur est connecté. Des boutiques sont en attente de validation. |
| **Post-condition** | La boutique est approuvée (visible publiquement) ou rejetée. Le commerçant est notifié. |
| **Scénario principal** | 1. L'administrateur consulte la liste des boutiques en attente. 2. Il examine les informations et les documents soumis. 3. Il clique sur « Approuver » ou « Rejeter » avec un motif. 4. Le serveur met à jour le statut de la boutique. 5. Une notification est envoyée au commerçant en temps réel. |
| **Scénario alternatif** | L'administrateur n'a pas les droits suffisants → accès refusé (403 Forbidden). |

*Tableau : Description textuelle du cas « Valider une boutique »*

#### 3.5.2.2 Diagramme de séquence de Sprint 1 (Release 2)

**Diagramme de séquence : Création d'une boutique**

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
        BD-->>Serveur: Identifiant de la boutique
        Serveur-->>Dashboard: Boutique créée
        Dashboard-->>Commerçant: "En attente de validation par l'admin"
    end
```

> *[Figure : Diagramme de séquence — Création de boutique]*

---

### 3.5.3 Conception de Sprint 2 — Release 2 (Catalogue & Commandes)

#### 3.5.3.1 Diagramme de cas d'utilisation de Sprint 2

La figure ci-dessous illustre le diagramme des cas d'utilisation du deuxième sprint.

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant PRO"])
    A(["🛡️ Administrateur"])

    subgraph Sprint2R2 ["Sprint 2 Release 2 — Catalogue et Commandes"]
        UC1([Ajouter un produit])
        UC2([Parcourir le catalogue])
        UC3([Retirer un produit])
        UC4([Ajouter au panier])
        UC5([Passer une commande])
        UC6([Traiter la commande])
        UC7([Livrer via QR Code])
        UC8([Annuler une commande])
        UC4 -.->|inclut| UC5
        UC5 -.->|inclut| UC6
        UC6 -.->|inclut| UC7
    end

    C --> UC2 & UC4 & UC5 & UC8
    P --> UC1 & UC6 & UC7
    A --> UC3
```

*Figure : Diagramme de cas d'utilisation — Sprint 2, Release 2*

**Description textuelle du cas d'utilisation « Passer une commande »**

| Cas d'utilisation | Passer une commande |
|-------------------|--------------------|
| **Acteurs** | Client |
| **Pré-condition** | Le client est connecté. La boutique est approuvée. Les produits sont en stock. |
| **Post-condition** | La commande est enregistrée. Le stock est mis à jour. Le commerçant est notifié. |
| **Scénario principal** | 1. Le client ajoute des produits au panier. 2. L'application vérifie que tous les produits viennent de la même boutique. 3. Le client valide le panier et choisit le mode de récupération. 4. L'application envoie la commande au serveur. 5. Le serveur vérifie la disponibilité du stock pour chaque article. 6. Si le stock est suffisant, la commande est enregistrée et le stock est décrémenté. 7. Le commerçant reçoit une notification en temps réel. 8. Le client reçoit la confirmation avec le numéro de commande. |
| **Scénario alternatif** | Stock insuffisant → le serveur retourne une erreur et la commande est annulée. Produits de boutiques différentes → l'application demande de vider le panier avant d'ajouter. |

*Tableau : Description textuelle du cas « Passer une commande »*

#### 3.5.3.2 Diagramme de séquence de Sprint 2 « Passer une commande »

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Panier as Panier (Stockage local)
    participant Serveur as API Commandes
    participant BD as Base de données
    participant Notif as Supabase Realtime

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
        Application-->>Client: Affiche le message d'erreur
    else Stock disponible
        Serveur->>BD: Enregistre la commande et réduit le stock
        BD-->>Serveur: Commande créée
        Serveur->>Notif: Notifie le commerçant
        Notif-->>Commerçant: "Nouvelle commande reçue"
        Serveur-->>Application: Numéro de commande
        Application-->>Client: "Commande envoyée avec succès"
    end
```

> *[Figure : Diagramme de séquence — Passer une commande]*

---

### 3.5.4 Conception de Sprint 3 — Release 2 (Réservations)

#### 3.5.4.1 Diagramme de cas d'utilisation de Sprint 3

La figure ci-dessous illustre le diagramme des cas d'utilisation du troisième sprint.

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant PRO"])

    subgraph Sprint3R2 ["Sprint 3 Release 2 — Réservations et Géolocalisation"]
        UC1([Consulter les créneaux])
        UC2([Réserver un service])
        UC3([Clôturer une réservation])
        UC4([Gérer les disponibilités])
        UC5([Explorer sur la carte])
        UC6([Appliquer des filtres])
        UC1 -.->|inclut| UC2
        UC5 -.->|inclut| UC6
    end

    C --> UC1 & UC2 & UC5
    P --> UC3 & UC4
```

*Figure : Diagramme de cas d'utilisation — Sprint 3, Release 2*

**Description textuelle du cas d'utilisation « Réserver un service »**

| Cas d'utilisation | Réserver un service |
|-------------------|---------------------|
| **Acteurs** | Client |
| **Pré-condition** | Le client est connecté. La boutique propose des services avec des créneaux disponibles. |
| **Post-condition** | La réservation est confirmée. Le créneau est marqué comme occupé. Le commerçant est notifié. |
| **Scénario principal** | 1. Le client consulte les créneaux disponibles d'un prestataire. 2. L'application récupère le calendrier du commerçant depuis le serveur. 3. Le client sélectionne un créneau et confirme. 4. Le serveur vérifie que le créneau est encore libre. 5. La réservation est enregistrée et le créneau est verrouillé. 6. Le commerçant reçoit une notification en temps réel. 7. Le client reçoit une confirmation avec les détails du rendez-vous. |
| **Scénario alternatif** | Créneau déjà pris entre-temps → le serveur retourne une erreur et propose de choisir un autre créneau. |

*Tableau : Description textuelle du cas « Réserver un service »*

#### 3.5.4.2 Diagramme de séquence de Sprint 3

```mermaid
sequenceDiagram
    actor Client
    participant Application as Application Mobile
    participant Serveur as API Réservations
    participant BD as Base de données
    participant Notif as Supabase Realtime

    Client->>Application: Consulte les créneaux disponibles
    Application->>Serveur: Demande les créneaux libres du commerçant
    Serveur->>BD: Récupère le calendrier et filtre les créneaux occupés
    BD-->>Serveur: Créneaux disponibles pour la date choisie
    Serveur-->>Application: Affiche les créneaux libres
    Client->>Application: Sélectionne un créneau et confirme
    Application->>Serveur: Envoie la demande de réservation
    Serveur->>BD: Vérifie que le créneau est toujours libre
    alt Créneau déjà pris
        BD-->>Serveur: Créneau occupé par un autre client
        Serveur-->>Application: "Ce créneau n'est plus disponible"
        Application-->>Client: Propose de choisir un autre horaire
    else Créneau encore libre
        Serveur->>BD: Enregistre la réservation
        Serveur->>BD: Marque le créneau comme occupé
        BD-->>Serveur: Réservation confirmée
        Serveur->>Notif: Notifie le commerçant en temps réel
        Notif-->>Commerçant: "Nouvelle réservation reçue"
        Serveur-->>Application: Confirmation avec détails du RDV
        Application-->>Client: "Réservation confirmée"
    end
```

> *[Figure : Diagramme de séquence — Réservation]*

---


### 3.5.5 Conception de Sprint 1 — Release 3 (Intelligence Artificielle)

#### 3.5.5.1 Diagramme de cas d'utilisation de Sprint 1 (Release 3)

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant PRO"])
    A(["🛡️ Administrateur"])

    subgraph Sprint1R3 ["Sprint 1 Release 3 — Intelligence Artificielle"]
        UC1([Recherche sémantique Darija])
        UC2([Recherche par photo])
        UC3([Utiliser l'assistant IA])
        UC4([Analyser les avis — IA])
        UC5([Recommandation de promos])
        UC6([Détection de fraude])
    end

    C --> UC1 & UC2 & UC3
    P --> UC3 & UC4 & UC5
    A --> UC6
```

*Figure : Diagramme de cas d'utilisation — Sprint 1, Release 3*

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

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant PRO"])

    subgraph Sprint2R3 ["Sprint 2 Release 3 — Contenu et Engagement Social"]
        UC1([Publier un Reel])
        UC2([Publier une Story])
        UC3([Liker / Sauvegarder])
        UC4([Laisser un avis])
        UC5([Chat temps réel])
        UC1 -.->|étend| UC2
    end

    C --> UC3 & UC4 & UC5
    P --> UC1 & UC2 & UC5
```

*Figure : Diagramme de cas d'utilisation — Sprint 2, Release 3*

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

```mermaid
flowchart LR
    A(["🛡️ Administrateur"])
    C(["👤 Client"])

    subgraph Sprint3R3 ["Sprint 3 Release 3 — Administration SaaS"]
        UC1([Modérer le contenu])
        UC2([Suspendre un utilisateur])
        UC3([Traiter un ticket de support])
        UC4([Consulter le tableau de bord])
        UC5([Signaler un contenu])
        UC5 -.->|inclut| UC1
    end

    A --> UC1 & UC2 & UC3 & UC4
    C --> UC5
```

*Figure : Diagramme de cas d'utilisation — Sprint 3, Release 3*

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
