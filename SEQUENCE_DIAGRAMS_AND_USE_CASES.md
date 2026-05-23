# 📊 DIAGRAMMES DE SÉQUENCES & CAS D'UTILISATION - RAPPORT PFE

---

## **TABLE DES MATIÈRES**
1. [50 Diagrammes de Séquences](#diagrammes-de-séquences)
2. [Cas d'Utilisation - Vue Globale](#cas-dutilisation-vue-globale)
3. [Cas d'Utilisation - Client](#cas-dutilisation-client)
4. [Cas d'Utilisation - Commerçant](#cas-dutilisation-commerçant)
5. [Architecture Multi-Plateforme](#architecture-multi-plateforme)

---

# 📈 DIAGRAMMES DE SÉQUENCES

## **PARTIE 1: AUTHENTIFICATION & ACCÈS (4)**

1. Inscription & vérification email
2. Connexion utilisateur
3. Gestion mot de passe (réinitialisation/changement)
4. Déconnexion utilisateur

## **PARTIE 2: PROFIL & BOUTIQUE (5)**

5. Création/modification profil utilisateur
6. Visualisation profil public
7. Création/gestion d'une boutique
8. Recherche & localisation boutiques
9. Suivi boutique (follow/unfollow)

## **PARTIE 3: CATALOGUE (4)**

10. Création/modification produits
11. Suppression produit
12. Gestion images & catégories
13. Création/modification services

## **PARTIE 4: CIRCUIT ACHAT COMPLET (6)**

14. Panier (ajout/suppression/modification)
15. Passage commande (validation adresse)
16. Création & confirmation commande
17. Suivi commande client
18. Historique commandes & remboursements
19. Réservation services

## **PARTIE 5: RECHERCHE INTELLIGENTE (4)**

20. Recherche textuelle produits
21. Recherche par image
22. Recherche vocale & géographique
23. Suggestions intelligentes

## **PARTIE 6: CONTENU & ENGAGEMENT (4)**

24. Création/publication reels & stories
25. Consultation contenu (reels/stories)
26. Avis & ratings (création/réponse)
27. Favoris/likes

## **PARTIE 7: COMMUNICATION (3)**

28. Messagerie (envoi/consultation)
29. Notifications & statut lecture
30. Support tickets (création/suivi)

## **PARTIE 8: PROMOTIONS (2)**

31. Création/gestion promotions
32. Application promo au panier

## **PARTIE 9: DASHBOARD BUSINESS OWNER (6)**

33. Accès & gestion profil boutique
34. Statistiques & analytics ventes
35. Performance produits & tendances
36. Gestion stocks, prix & promotions
37. Leads & conversion clients
38. Suivi commandes & remboursements

## **PARTIE 10: IA & RECOMMANDATIONS (5)**

39. Recommandations produits personnalisés
40. Suggestions produits complémentaires & similaires
41. Prédiction demande & optimisation prix
42. Génération automatique (descriptions, catégorisation)
43. Analyse sentiment & reconnaissance image

## **PARTIE 11: SÉCURITÉ & FRAUDE IA (2)**

44. Détection fraude - Analyse comportementale
45. Analytics IA - Tendances & insights vendeur

## **PARTIE 12: NOTIFICATIONS AVANCÉES (2)**

46. Envoi notifications push
47. Gestion préférences notifications

## **PARTIE 13: GESTION ADMINISTRATIVE (2)**

48. Validation/suspension boutiques (admin)
49. Gestion utilisateurs & litiges (admin)

## **PARTIE 14: CHATBOT IA SUPPORT (1)**

50. Chatbot IA - Support client automatisé

---

# 🎯 CAS D'UTILISATION - VUE GLOBALE

```
Système: Plateforme E-Commerce Multicanal avec IA
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────────┐      ┌──────────────┐  ┌──────────┐   │
│  │   Client     │      │  Commerçant  │  │  Admin   │   │
│  └──────────────┘      └──────────────┘  └──────────┘   │
│         │                      │                │         │
│         └──────────┬───────────┴────────┬──────┘         │
│                    │                    │                │
│         ┌──────────v──────────┐         │                │
│         │                     │         │                │
│    [Système E-Commerce]       │         │                │
│                               │         │                │
│         ┌─────────────────────v─────────v──────┐         │
│         │                                       │         │
│         │  • Authentification & Profils         │         │
│         │  • Catalogue & Recherche              │         │
│         │  • Panier & Commandes                 │         │
│         │  • Paiement & Logistique              │         │
│         │  • Messagerie & Support               │         │
│         │  • Avis & Engagement                  │         │
│         │  • Dashboard Analytics                │         │
│         │  • IA & Recommandations               │         │
│         │  • Détection Fraude                   │         │
│         │  • Administration                     │         │
│         │                                       │         │
│         └───────────────────────────────────────┘         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### **Fonctionnalités Transversales**
- Gestion utilisateurs & authentification
- Notifications en temps réel
- Système de messages intégrés
- Analytics & reporting avancé
- Sécurité & détection fraude (IA)

---

# 👥 CAS D'UTILISATION - CLIENT

```
┌────────────────────────────────────────────────────────────┐
│           CLIENT (Acheteur/Consommateur)                   │
└────────────────────────────────────────────────────────────┘

UC-C1: S'authentifier
├─ Créer un compte
├─ Se connecter
├─ Réinitialiser mot de passe
└─ Gérer profil personnel

UC-C2: Découvrir des produits & boutiques
├─ Consulter catalogue
├─ Rechercher par texte/image/voix
├─ Voir localisation (nearby)
├─ Consulter avis & ratings
├─ Suivre une boutique
└─ Recevoir suggestions IA

UC-C3: Naviguer contenu social
├─ Regarder reels & stories
├─ Aimer/favoriter contenu
├─ Commenter & noter
└─ Partager contenu

UC-C4: Effectuer un achat
├─ Ajouter articles au panier
├─ Modifier panier
├─ Appliquer promotion
├─ Valider panier
├─ Confirmer commande
├─ Saisir adresse livraison
└─ Attendre confirmation

UC-C5: Suivre commande
├─ Consulter historique
├─ Suivre statut en temps réel
├─ Demander remboursement
└─ Accéder facture

UC-C6: Réserver un service
├─ Consulter disponibilités
├─ Réserver slot horaire
├─ Recevoir confirmation
└─ Gérer réservations

UC-C7: Communiquer & interagir
├─ Envoyer message commerçant
├─ Consulter réponses
├─ Créer ticket support
├─ Recevoir notifications
└─ Laisser avis/review

UC-C8: Gérer compte
├─ Modifier profil
├─ Gérer adresses
├─ Consulter historique
├─ Gérer préférences notifications
└─ Supprimer compte
```

---

# 🏪 CAS D'UTILISATION - COMMERÇANT

```
┌────────────────────────────────────────────────────────────┐
│              COMMERÇANT (Business Owner/Vendeur)            │
└────────────────────────────────────────────────────────────┘

UC-M1: Gérer boutique
├─ Créer/modifier boutique
├─ Gérer profil magasin
├─ Configurer horaires
├─ Gérer localisation
└─ Ajouter images/descriptions

UC-M2: Gérer catalogue produits
├─ Créer/modifier/supprimer produits
├─ Gérer images
├─ Catégoriser produits
├─ Gérer stocks
├─ Gérer prix & promotions
└─ Génération descriptions IA

UC-M3: Gérer services
├─ Créer/modifier services
├─ Gérer tarifs
├─ Configurer disponibilités
├─ Gérer réservations
└─ Valider services

UC-M4: Créer contenu marketing
├─ Publier reels/vidéos
├─ Publier stories
├─ Ajouter promotions
├─ Optimiser performances (IA)
└─ Consulter engagement

UC-M5: Traiter commandes
├─ Consulter commandes entrantes
├─ Confirmer/annuler
├─ Gérer livraison
├─ Traiter remboursements
├─ Générer factures
└─ Consulter historique

UC-M6: Consulter analytics & insights
├─ Accéder tableau de bord
├─ Voir statistiques ventes
├─ Analyser performances produits
├─ Voir tendances marché
├─ Prédiction demande (IA)
├─ Recommandations pricing (IA)
└─ Rapport chiffre d'affaires

UC-M7: Gérer clients & leads
├─ Consulter liste clients
├─ Suivre leads qualifiés
├─ Voir taux conversion
├─ Analyser segments clients (IA)
└─ Créer campanyes ciblées (IA)

UC-M8: Gérer avis & réputation
├─ Consulter avis reçus
├─ Répondre aux avis
├─ Voir analyse sentiment (IA)
├─ Consulter note globale
└─ Générer rapports qualité

UC-M9: Communiquer avec clients
├─ Consulter messages entrants
├─ Répondre aux clients
├─ Consulter tickets support
├─ Répondre tickets
└─ Notifier clients

UC-M10: Gérer sécurité
├─ Configurer 2FA
├─ Gérer accès équipe
├─ Consulter logs activité
└─ Gérer permissions
```

---

# 🛡️ CAS D'UTILISATION - ADMINISTRATEUR (BONUS)

```
┌────────────────────────────────────────────────────────────┐
│                   ADMINISTRATEUR (Admin Plateforme)        │
└────────────────────────────────────────────────────────────┘

UC-A1: Gérer utilisateurs
├─ Valider nouvelles boutiques
├─ Suspendre/bannir comptes
├─ Gérer litiges
├─ Consulter rapports fraude
└─ Générer rapports utilisateurs

UC-A2: Monitorer sécurité
├─ Consulter alertes fraude (IA)
├─ Voir tentatives anomalies
├─ Bloquer IP/comptes suspects
└─ Consulter logs sécurité

UC-A3: Analytics plateforme
├─ Voir stats globales
├─ Analyser performances
├─ Consulter taux conversion
├─ Générer rapports business
└─ Exporter données
```

---

# 🔄 ARCHITECTURE MULTI-PLATEFORME

## **Version Web & Mobile Identiques**

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATEFORME DIGITALE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐        ┌──────────────────────┐   │
│  │   APPLICATION WEB    │        │  APPLICATION MOBILE  │   │
│  │  (Responsive Design) │        │  (Native/React Native)   │
│  │                      │        │                      │   │
│  │  • Dashboard complet │        │  • Optimisé mobile   │   │
│  │  • Features avancées │        │  • Notifications     │   │
│  │  • Gestion complète  │        │  • Accès rapide      │   │
│  │  • Analytics détail  │        │  • Touch-friendly    │   │
│  └──────────────────────┘        └──────────────────────┘   │
│           │                                  │                │
│           └──────────────┬───────────────────┘                │
│                          │                                    │
│                  [API BACKEND UNIFIÉ]                         │
│                          │                                    │
│          ┌───────────────┼───────────────┐                   │
│          │               │               │                   │
│      [DATABASE]   [SERVICES IA]   [CACHE REDIS]              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

FONCTIONNALITÉS IDENTIQUES:
✓ Authentification & Profils
✓ Catalogue & Recherche
✓ Panier & Commandes
✓ Messagerie & Support
✓ Avis & Engagement
✓ Dashboard Analytics
✓ IA & Recommandations
✓ Notifications Push
✓ Détection Fraude

OPTIMISATIONS MOBILES:
✓ Chargement plus rapide
✓ Interface tactile
✓ Notifications en temps réel
✓ Accès hors ligne (partiel)
✓ Consommation données minimale
```

---

# 📊 RÉSUMÉ DES DIAGRAMMES

| Type | Nombre | Détails |
|------|--------|---------|
| **Diagrammes de Séquences** | 50 | 14 parties + IA détaillée |
| **Use Cases Clients** | 8 | Découverte, Achat, Engagement |
| **Use Cases Commerçants** | 10 | Gestion, Analytics, Communication |
| **Use Cases Admin** | 3 | Sécurité, Utilisateurs, Analytics |
| **Acteurs Système** | 3 | Client, Commerçant, Admin |
| **Plateforme** | 2 | Web + Mobile (identiques) |

---

# 🎓 STRUCTURE RAPPORT PFE

**Suggestion de chapitres:**

1. **Introduction** - Contexte & Problématique
2. **État de l'Art** - Analyse solutions existantes
3. **Spécifications Fonctionnelles**
   - Cas d'utilisation globaux (diagramme UML)
   - Cas d'utilisation par acteur
   - Scénarios principaux

4. **Architecture & Design**
   - Architecture système multi-plateforme
   - Design patterns utilisés
   - Intégration IA & Sécurité

5. **Diagrammes de Séquences** (50 diagrammes)
   - Regroupés par domaine
   - 5-6 développés en détail
   - Autres en format résumé

6. **Fonctionnalités Innovantes**
   - IA & Recommandations
   - Détection Fraude
   - Analytics avancée
   - Multiplateforme

7. **Implémentation & Résultats**
8. **Conclusion & Perspectives**

---

**Document généré:** Mai 2026  
**Projet:** Plateforme E-Commerce Multicanal avec IA  
**Contexte:** Rapport PFE - Université Marocaine
