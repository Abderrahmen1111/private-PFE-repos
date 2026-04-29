# 📊 DIAGRAMMES DE SÉQUENCE SIMPLIFIÉS - PLATEFORME RO2YA

**Plateforme:** Ro2ya - Marketplace IA Tunisienne  
**Version:** 2.0 (Simplifiée pour Rapport)  
**Date:** Avril 2026

---

## 📋 Table des Matières

1. [Recherche Intelligente (Darija/Image)](#1-recherche-intelligente)
2. [Navigation & Géolocalisation](#2-navigation--géolocalisation)
3. [Passage de Commande & Réservation](#3-commande--réservation)
4. [Gestion Marchand (Produits/Inventory)](#4-gestion-marchand)
5. [Administration & Modération](#5-administration)

---

## 1. Recherche Intelligente (Darija/Image)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as Application Web
    participant AI as Services AI (Parsing & Embeddings)
    participant DB as Base de Données (Supabase/pgVector)

    U->>A: Saisit requête (Darija, Arabe, Image)
    A->>AI: Analyse intention & Normalisation
    AI-->>A: Texte propre + Vecteur
    A->>DB: Recherche sémantique (pgVector)
    DB-->>A: Liste des produits triés
    A-->>U: Affiche les résultats pertinents
```

---

## 2. Navigation & Géolocalisation

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as Application Web
    participant DB as Base de Données
    participant G as Google Maps API

    U->>A: Accède à la carte des commerces
    A->>A: Récupère position GPS
    A->>DB: Cherche commerces à proximité
    DB-->>A: Données des boutiques
    A->>G: Charge carte interactive
    G-->>A: Affichage carte + Marqueurs
    A-->>U: Affiche les boutiques géolocalisées
```

---

## 3. Commande & Réservation (Sans Paiement en ligne)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as Application Web
    participant DB as Base de Données
    participant M as Commerçant

    U->>A: Valide Panier ou Réserve Service
    A->>DB: Enregistre commande (Statut: PENDING)
    DB-->>A: ID Commande
    A->>M: Notification (Push / Temps Réel)
    A-->>U: Confirmation & Suivi de commande
```

---

## 4. Gestion Marchand (Produits & Stocks)

```mermaid
sequenceDiagram
    participant M as Commerçant
    participant D as Dashboard Marchand
    participant AI as Services AI
    participant DB as Base de Données

    M->>D: Ajoute un nouvel item
    D->>AI: Génère description & tags auto
    AI-->>D: Contenu enrichi
    D->>DB: Sauvegarde (Image + Texte + Vecteurs)
    DB-->>D: Succès
    D-->>M: Produit publié avec succès
```

---

## 5. Administration & Modération

```mermaid
sequenceDiagram
    participant Ad as Administrateur
    participant P as Panneau Admin
    participant DB as Base de Données
    participant M as Commerçant

    Ad->>P: Vérifie demande création magasin
    P->>DB: Récupère infos magasin
    Ad->>P: Approuve le magasin
    P->>DB: Statut -> 'APPROVED'
    P->>M: Notification de bienvenue
```

---

## 🏗️ Diagramme de Cas d'Utilisation (Simplifié)

```mermaid
useCaseDiagram
    actor "Client" as C
    actor "Commerçant" as M
    actor "Admin" as A

    package "Plateforme Ro2ya" {
        usecase "Recherche Sémantique (Darija)" as UC1
        usecase "Commander / Réserver" as UC2
        usecase "Gérer Profil & Favoris" as UC3
        usecase "Gérer Catalogue & Stocks" as UC4
        usecase "Publier Reels/Stories" as UC5
        usecase "Gérer Commandes & QR" as UC6
        usecase "Modérer & Approuver" as UC7
        usecase "Consulter Analytics" as UC8
    }

    C --> UC1
    C --> UC2
    C --> UC3
    
    M --> UC4
    M --> UC5
    M --> UC6
    M --> UC8
    
    A --> UC7
    A --> UC8
```

---

**Note:** Les flux ont été simplifiés pour se concentrer sur l'expérience utilisateur et l'intégration de l'IA, en masquant les détails de bas niveau (headers, types de vecteurs, retries).
