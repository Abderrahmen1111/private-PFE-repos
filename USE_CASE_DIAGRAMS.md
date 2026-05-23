# DIAGRAMMES DE CAS D'UTILISATION — PLATEFORME RO2YA

---

## Diagramme de cas d'utilisation GLOBAL

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

---

## Diagramme de cas d'utilisation — Sprint 1, Release 1 (Authentification)

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant"])

    subgraph Sprint1R1 ["Sprint 1 — Authentification"]
        UC1([S'inscrire])
        UC2([Vérifier le code OTP])
        UC3([Se connecter])
        UC4([Accéder à une page protégée])
        UC3 -.->|inclut| UC4
        UC1 -.->|inclut| UC2
    end

    C --> UC1 & UC3
    P --> UC1 & UC3
```

*Figure : Diagramme de cas d'utilisation — Sprint 1, Release 1*

---

## Diagramme de cas d'utilisation — Sprint 1, Release 2 (Gestion des Boutiques)

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
        UC5([Modifier le profil boutique])
        UC6([Consulter profil public])
        UC1 -.->|inclut| UC2
        UC3 -.->|étend| UC4
    end

    P --> UC1 & UC5
    A --> UC3 & UC4
    C --> UC6
```

*Figure : Diagramme de cas d'utilisation — Sprint 1, Release 2*

---

## Diagramme de cas d'utilisation — Sprint 2, Release 2 (Catalogue & Commandes)

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant PRO"])
    A(["🛡️ Administrateur"])

    subgraph Sprint2R2 ["Sprint 2 Release 2 — Catalogue & Commandes"]
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

---

## Diagramme de cas d'utilisation — Sprint 3, Release 2 (Réservations & Géolocalisation)

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant PRO"])

    subgraph Sprint3R2 ["Sprint 3 Release 2 — Réservations & Géolocalisation"]
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

---

## Diagramme de cas d'utilisation — Sprint 1, Release 3 (Intelligence Artificielle)

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

---

## Diagramme de cas d'utilisation — Sprint 2, Release 3 (Contenu & Social)

```mermaid
flowchart LR
    C(["👤 Client"])
    P(["💼 Commerçant PRO"])

    subgraph Sprint2R3 ["Sprint 2 Release 3 — Contenu & Engagement Social"]
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

---

## Diagramme de cas d'utilisation — Sprint 3, Release 3 (Administration SaaS)

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
