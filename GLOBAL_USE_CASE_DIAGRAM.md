# 🌍 DIAGRAMME DES CAS D'UTILISATION GLOBAL - RO2YA (EXHAUSTIF)

Ce diagramme Mermaid est la version complète et définitive. Il intègre **tous les éléments présents dans vos 3 images** (Espace Client, Commerçant, Admin), et y ajoute **les fonctionnalités d'IA avancées qui étaient absentes de ces images** (Génération d'image, Analyse de sentiment, ciblage).

```mermaid
useCaseDiagram
    actor "Client" as C
    actor "Commerçant" as P
    actor "Administrateur" as A
    actor "Moteur IA / Cloud" as IA

    package "Plateforme Ro2ya — Système Global Exhaustif" {
        %% ==========================================
        %% SECTION CLIENT (D'après Image 3 + Ajouts)
        %% ==========================================
        usecase C1 as "S'inscrire / Se connecter"
        usecase C2 as "Recherche de Produit (Mots-clés/Darija/Filtres)"
        usecase C3 as "Rechercher par image (IA Vision)"
        usecase C4 as "Explorer les établissements"
        usecase C5 as "Consulter le Shop (Page Commerçant)"
        usecase C6 as "Réserver un service"
        usecase C7 as "Consulter ses réservations"
        usecase C8 as "Envoyer un message au commerçant"
        usecase C9 as "Visionner des Reels"
        usecase C10 as "Enregistrer un établissement (Favoris)"
        usecase C11 as "Gérer son profil"
        usecase C12 as "Consulter ses notifications"
        usecase C13 as "Utiliser l'assistant IA"
        usecase C14 as "Consulter le détail d'un produit"
        usecase C15 as "Ajouter au panier"
        usecase C16 as "Passer une commande"
        usecase C17 as "Suivre le statut d'une commande (QR Code)"
        usecase C18 as "Laisser un avis / évaluation"
        %% AJOUT IA ABSENT DE L'IMAGE CLIENT :
        usecase C19 as "Recevoir des Recommandations Ciblées (IA)"

        %% ==========================================
        %% SECTION COMMERÇANT (D'après Image 1 + Ajouts)
        %% ==========================================
        usecase P1 as "S'inscrire / Se connecter"
        usecase P2 as "Créer / Gérer son établissement"
        usecase P3 as "Mettre à jour le profil du magasin"
        usecase P4 as "Ajouter / Modifier / Supprimer un produit"
        usecase P5 as "Gérer le stock des produits"
        usecase P6 as "Consulter les commandes reçues"
        usecase P7 as "Valider une commande (Génération QR Code)"
        usecase P8 as "Confirmer la livraison (Scan QR Code)"
        usecase P9 as "Annuler une commande"
        usecase P10 as "Consulter les réservations reçues"
        usecase P11 as "Confirmer / Refuser une réservation"
        usecase P12 as "Marquer un service comme terminé"
        usecase P13 as "Répondre aux avis clients"
        usecase P14 as "Répondre aux messages clients"
        usecase P15 as "Publier un Reel promotionnel"
        usecase P16 as "Publier une Story (24h)"
        usecase P17 as "Consulter le tableau de bord (Stats & Revenus)"
        usecase P18 as "Utiliser l'agent IA (Recommandations)"
        usecase P19 as "Consulter les transactions"
        usecase P20 as "Gérer les leads / demandes de contact"
        %% AJOUTS IA ABSENTS DE L'IMAGE COMMERÇANT :
        usecase P21 as "Générer des Images Produits (IA DALL-E)"
        usecase P22 as "Analyse de Sentiment automatique des avis (IA)"
        usecase P23 as "Configurer/Lancer des Recommandations de Promo (IA)"
        usecase P24 as "Consulter la Détection de Fraude sur Commandes (IA)"

        %% ==========================================
        %% SECTION ADMINISTRATEUR (D'après Image 2 + Ajouts)
        %% ==========================================
        usecase A1 as "Se connecter (Auth Admin)"
        usecase A2 as "Consulter le tableau de bord global"
        usecase A3 as "Gérer les commerçants inscrits"
        usecase A4 as "Approuver / Rejeter / Suspendre un établissement"
        usecase A5 as "Gérer les utilisateurs (Clients & Pros)"
        usecase A6 as "Suspendre / Réactiver un compte"
        usecase A7 as "Consulter les transactions et paiements"
        usecase A8 as "Générer des rapports de revenus"
        usecase A9 as "Consulter les alertes de fraude"
        usecase A10 as "Gérer les bannières publicitaires"
        usecase A11 as "Créer des codes promo / coupons"
        usecase A12 as "Configurer les paramètres système"
        usecase A13 as "Surveiller la santé de la plateforme"
        usecase A14 as "Gérer le contenu CMS"
        usecase A15 as "Consulter toutes les commandes"
        usecase A16 as "Exporter les commandes (CSV)"
        usecase A17 as "Modérer les avis clients"
        usecase A18 as "Approuver / Rejeter / Masquer un avis"
        usecase A19 as "Gérer les tickets de support"
        usecase A20 as "Répondre aux tickets commerçants"
        %% AJOUT IA ABSENT DE L'IMAGE ADMIN :
        usecase A21 as "Détection proactive de Fraude (Moteur IA)"
    }

    %% ==========================================
    %% LIENS CLIENT
    %% ==========================================
    C --> C1
    C --> C2
    C --> C3
    C --> C4
    C --> C6
    C --> C7
    C --> C8
    C --> C9
    C --> C10
    C --> C11
    C --> C12
    C --> C13
    C --> C16
    C --> C18
    C --> C19

    C4 ..> C5 : <<étend>>
    C5 ..> C14 : <<inclut>>
    C14 ..> C15 : <<inclut>>
    C15 ..> C16 : <<inclut>>
    C16 ..> C17 : <<étend>>
    C18 ..> C16 : <<nécessite>>

    %% ==========================================
    %% LIENS COMMERÇANT
    %% ==========================================
    P --> P1
    P --> P2
    P --> P4
    P --> P5
    P --> P9
    P --> P10
    P --> P13
    P --> P14
    P --> P15
    P --> P16
    P --> P17
    P --> P18
    P --> P19
    P --> P20
    P --> P21
    P --> P23
    P --> P24

    P7 ..> P6 : <<inclut>>
    P8 ..> P7 : <<étend>>
    P12 ..> P11 : <<étend>>
    P2 ..> P3 : <<inclut>>

    %% ==========================================
    %% LIENS ADMIN
    %% ==========================================
    A --> A1
    A --> A2
    A --> A7
    A --> A8
    A --> A9
    A --> A10
    A --> A11
    A --> A12
    A --> A13
    A --> A14

    A4 ..> A3 : <<inclut>>
    A6 ..> A5 : <<étend>>
    A16 ..> A15 : <<étend>>
    A18 ..> A17 : <<inclut>>
    A20 ..> A19 : <<inclut>>

    %% ==========================================
    %% LIENS MOTEUR IA
    %% ==========================================
    C2 -- IA : "NLP / LLM"
    C3 -- IA : "Vision API"
    C13 -- IA : "RAG"
    C19 -- IA : "pgvector"
    P18 -- IA
    P21 -- IA : "DALL-E"
    P22 -- IA : "Analyse NLP"
    P23 -- IA : "Promotion Targeting"
    P24 -- IA : "Fraud Guard"
    A9 -- IA
    A21 -- IA : "Score de risque"
    
    P13 ..> P22 : <<étend>>
    P6 ..> P24 : <<étend>>
    C19 ..> P23 : <<déclenche>>
    A9 ..> A21 : <<inclut>>
```
