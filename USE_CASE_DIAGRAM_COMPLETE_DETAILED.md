# 🎯 DIAGRAMME DES CAS D'UTILISATION COMPLET & DÉTAILLÉ - RO2YA

## Documentation Complète avec `extends` et `includes`

---

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Diagramme Principal](#diagramme-principal)
3. [Matrice des Relations](#matrice-des-relations)
4. [Détail des Cas d'Utilisation](#détail-des-cas-dutilisation)

---

## Vue d'Ensemble

Ce diagramme UML détaille **tous les cas d'utilisation** de la plateforme **ro2ya.tn** avec:
- ✅ **Includes**: fonctionnalités toujours exécutées quand on déclenche un cas
- 🔄 **Extends**: variantes conditionnelles d'un cas d'utilisation
- 👥 **Acteurs**: Client, Commerçant, Admin, Moteur IA
- 🔗 **Relations de dépendance**: flux d'interdépendance

---

## Diagramme Principal

```mermaid
useCaseDiagram
    actor "👤 Client/Acheteur" as C
    actor "🏪 Commerçant/Vendeur" as P
    actor "⚙️ Administrateur" as A
    actor "🤖 Moteur IA" as IA
    actor "📧 Service Email" as EMAIL
    actor "📱 Service Push Notification" as NOTIF

    %% ========================================
    %% PACKAGE AUTHENTIFICATION & PROFIL
    %% ========================================
    package "🔐 AUTHENTIFICATION & PROFIL" {
        usecase UC_AUTH_SIGNUP as "📝 S'inscrire (Sign Up)"
        usecase UC_AUTH_LOGIN as "🔐 Se Connecter (Login)"
        usecase UC_AUTH_LOGOUT as "🚪 Se Déconnecter (Logout)"
        usecase UC_AUTH_FORGET_PWD as "🔑 Récupérer Mot de Passe"
        usecase UC_AUTH_VERIFY_EMAIL as "✉️ Vérifier Email"
        usecase UC_PROFILE_VIEW as "👁️ Consulter son Profil"
        usecase UC_PROFILE_EDIT as "✏️ Modifier son Profil"
        usecase UC_PROFILE_AVATAR as "🖼️ Mettre à jour Avatar"
        usecase UC_PROFILE_DELETE as "❌ Supprimer le Compte"
    }

    %% ========================================
    %% PACKAGE RECHERCHE & DÉCOUVERTE
    %% ========================================
    package "🔍 RECHERCHE & DÉCOUVERTE" {
        usecase UC_SEARCH_TEXT as "🔍 Recherche par Texte/Darija"
        usecase UC_SEARCH_IMAGE as "🖼️ Recherche par Image (IA)"
        usecase UC_SEARCH_FILTER as "🎯 Appliquer Filtres"
        usecase UC_BROWSE_CATEGORY as "📂 Parcourir Catégories"
        usecase UC_BROWSE_SHOP as "🏪 Consulter un Shop (Magasin)"
        usecase UC_VIEW_PRODUCT as "📦 Voir Détails Produit"
        usecase UC_VIEW_SERVICE as "📋 Voir Détails Service"
        usecase UC_RECOMMEND_AI as "🤖 Recommandations Personnalisées (IA)"
    }

    %% ========================================
    %% PACKAGE PANIER & COMMANDE
    %% ========================================
    package "🛒 PANIER & COMMANDE" {
        usecase UC_CART_ADD as "➕ Ajouter au Panier"
        usecase UC_CART_REMOVE as "➖ Retirer du Panier"
        usecase UC_CART_UPDATE_QTY as "🔄 Modifier Quantité"
        usecase UC_CART_VIEW as "👁️ Consulter Panier"
        usecase UC_ORDER_CREATE as "✅ Créer une Commande"
        usecase UC_ORDER_VALIDATE as "📋 Valider Commande (Vérif Données)"
        usecase UC_ORDER_PAYMENT as "💳 Effectuer Paiement"
        usecase UC_ORDER_FRAUD_CHECK as "🚨 Vérification Fraude (IA)"
        usecase UC_ORDER_CONFIRM as "✔️ Confirmation Commande"
        usecase UC_ORDER_QR_GENERATE as "🎟️ Générer QR Code"
        usecase UC_ORDER_STATUS as "📊 Suivre Statut Commande"
        usecase UC_ORDER_CANCEL as "❌ Annuler Commande"
        usecase UC_ORDER_HISTORY as "📜 Consulter Historique Commandes"
    }

    %% ========================================
    %% PACKAGE RÉSERVATION SERVICE
    %% ========================================
    package "📅 RÉSERVATION SERVICE" {
        usecase UC_BOOKING_CHECK_AVAIL as "📅 Vérifier Disponibilité"
        usecase UC_BOOKING_CREATE as "✏️ Créer Réservation"
        usecase UC_BOOKING_CALENDAR as "🗓️ Consulter Calendrier"
        usecase UC_BOOKING_CONFIRM as "✅ Confirmer Réservation"
        usecase UC_BOOKING_CANCEL as "❌ Annuler Réservation"
        usecase UC_BOOKING_RESCHEDULE as "🔄 Reporter Réservation"
        usecase UC_BOOKING_HISTORY as "📜 Historique Réservations"
        usecase UC_BOOKING_REMINDER as "🔔 Rappel Réservation"
    }

    %% ========================================
    %% PACKAGE AVIS & ÉVALUATIONS
    %% ========================================
    package "⭐ AVIS & ÉVALUATIONS" {
        usecase UC_REVIEW_ADD as "✍️ Poster un Avis"
        usecase UC_REVIEW_RATING as "⭐ Évaluation (1-5 étoiles)"
        usecase UC_REVIEW_SENTIMENT as "🧠 Analyse Sentiment (IA)"
        usecase UC_REVIEW_DISPLAY as "📖 Consulter les Avis"
        usecase UC_REVIEW_HELPFUL as "👍 Marquer Avis Utile/Inutile"
        usecase UC_REVIEW_MERCHANT_REPLY as "💬 Commerçant Répond Avis"
        usecase UC_REVIEW_MODERATE as "🛡️ Modérer Avis (Admin)"
        usecase UC_REVIEW_DELETE as "🗑️ Supprimer Avis"
    }

    %% ========================================
    %% PACKAGE COMMUNICATION
    %% ========================================
    package "💬 COMMUNICATION & SUPPORT" {
        usecase UC_MSG_SEND as "💌 Envoyer Message"
        usecase UC_MSG_RECEIVE as "📬 Recevoir Message"
        usecase UC_MSG_REALTIME as "⚡ Notification Temps Réel"
        usecase UC_MSG_ARCHIVE as "📦 Archiver Conversation"
        usecase UC_SUPPORT_TICKET as "🎫 Créer Ticket Support"
        usecase UC_SUPPORT_REPLY as "💬 Répondre Ticket"
        usecase UC_CONTACT_LEAD as "📞 Demande de Contact (Lead)"
    }

    %% ========================================
    %% PACKAGE CONTENU & SOCIAL
    %% ========================================
    package "🎬 CONTENU SOCIAL & MARKETING" {
        usecase UC_REEL_CREATE as "📹 Créer Reel"
        usecase UC_REEL_EDIT as "✏️ Modifier Reel"
        usecase UC_REEL_PUBLISH as "📤 Publier Reel"
        usecase UC_REEL_VIEW as "👁️ Regarder Reel"
        usecase UC_REEL_LIKE as "❤️ Liker Reel"
        usecase UC_REEL_COMMENT as "💬 Commenter Reel"
        usecase UC_REEL_SHARE as "📱 Partager Reel"
        usecase UC_REEL_SAVE as "🔖 Enregistrer Reel"
        usecase UC_STORY_CREATE as "📷 Créer Story (24h)"
        usecase UC_STORY_VIEW as "👁️ Regarder Story"
        usecase UC_STORY_REPLY as "💬 Répondre Story"
    }

    %% ========================================
    %% PACKAGE FAVORIS & NOTIFICATIONS
    %% ========================================
    package "❤️ FAVORIS & NOTIFICATIONS" {
        usecase UC_FAVORITE_ADD as "❤️ Ajouter Favoris"
        usecase UC_FAVORITE_REMOVE as "🚫 Retirer Favoris"
        usecase UC_FAVORITE_LIST as "👁️ Consulter Favoris"
        usecase UC_NOTIF_VIEW as "🔔 Consulter Notifications"
        usecase UC_NOTIF_SETTINGS as "⚙️ Configurer Notifications"
        usecase UC_NOTIF_CLEAR as "🗑️ Effacer Notifications"
    }

    %% ========================================
    %% PACKAGE MERCHANT (COMMERÇANT)
    %% ========================================
    package "🏪 BACK-OFFICE COMMERÇANT" {
        usecase UC_SHOP_CREATE as "🏪 Créer Établissement"
        usecase UC_SHOP_EDIT as "✏️ Modifier Shop"
        usecase UC_SHOP_PROFILE as "👁️ Consulter Profil Shop"
        usecase UC_SHOP_VERIFY as "✅ Vérification Établissement (Admin)"
        usecase UC_SHOP_ACTIVATE as "🟢 Activer Shop"
        usecase UC_SHOP_SUSPEND as "🔴 Suspendre Shop"
        usecase UC_PRODUCT_ADD as "➕ Ajouter Produit/Service"
        usecase UC_PRODUCT_EDIT as "✏️ Modifier Produit"
        usecase UC_PRODUCT_DELETE as "🗑️ Supprimer Produit"
        usecase UC_PRODUCT_BULK_IMPORT as "📥 Import Produits (Bulk)"
        usecase UC_INVENTORY_MANAGE as "📊 Gérer Stock/Inventaire"
        usecase UC_INVENTORY_ALERT as "⚠️ Alerte Stock Bas"
        usecase UC_ORDER_MERCHANT_VIEW as "👁️ Consulter Commandes Reçues"
        usecase UC_ORDER_MERCHANT_ACCEPT as "✅ Accepter Commande"
        usecase UC_ORDER_MERCHANT_REJECT as "❌ Refuser Commande"
        usecase UC_ORDER_MERCHANT_PREPARE as "📦 Préparer Commande"
        usecase UC_ORDER_MERCHANT_SHIP as "🚚 Marquer Expédiée"
        usecase UC_ORDER_QR_SCAN as "🔍 Scanner QR Code (Livraison)"
        usecase UC_BOOKING_MERCHANT_VIEW as "👁️ Consulter Réservations"
        usecase UC_BOOKING_MERCHANT_CONFIRM as "✅ Confirmer Réservation"
        usecase UC_BOOKING_MERCHANT_COMPLETE as "✔️ Marquer Service Terminé"
        usecase UC_PROMO_CREATE as "🎉 Créer Promotion"
        usecase UC_PROMO_EDIT as "✏️ Modifier Promotion"
        usecase UC_PROMO_ANALYTICS as "📊 Analytics Promotion"
        usecase UC_DASHBOARD_VIEW as "📊 Consulter Tableau de Bord"
        usecase UC_DASHBOARD_STATS as "📈 Statistiques & Revenus"
        usecase UC_IMAGE_GENERATE as "🎨 Générer Images (DALL-E)"
        usecase UC_SELLER_ADVISOR as "🤖 Assistant IA Ventes"
    }

    %% ========================================
    %% PACKAGE ADMINISTRATEUR
    %% ========================================
    package "⚙️ ADMINISTRATION & MODÉRATION" {
        usecase UC_ADMIN_LOGIN as "🔐 Connexion Admin"
        usecase UC_ADMIN_DASHBOARD as "📊 Tableau de Bord Admin"
        usecase UC_ADMIN_MERCHANT_MANAGE as "👥 Gérer Commerçants"
        usecase UC_ADMIN_MERCHANT_VERIFY as "✅ Vérifier Établissement"
        usecase UC_ADMIN_MERCHANT_SUSPEND as "🔴 Suspendre Commerçant"
        usecase UC_ADMIN_USER_MANAGE as "👥 Gérer Utilisateurs"
        usecase UC_ADMIN_USER_BAN as "🚫 Bannir Utilisateur"
        usecase UC_ADMIN_ORDERS_VIEW as "👁️ Consulter Toutes Commandes"
        usecase UC_ADMIN_ORDERS_EXPORT as "📥 Exporter Commandes (CSV)"
        usecase UC_ADMIN_FRAUD_DETECT as "🚨 Détection Fraude (IA)"
        usecase UC_ADMIN_FRAUD_REVIEW as "👁️ Examiner Alertes Fraude"
        usecase UC_ADMIN_PAYMENT_VIEW as "💳 Consulter Paiements"
        usecase UC_ADMIN_REVENUE_REPORT as "📊 Rapport Revenus"
        usecase UC_ADMIN_CONTENT_MODERATE as "🛡️ Modérer Contenu (Reels/Stories)"
        usecase UC_ADMIN_REVIEW_MODERATE as "🛡️ Modérer Avis"
        usecase UC_ADMIN_PROMO_MANAGE as "🎉 Gérer Promos Globales"
        usecase UC_ADMIN_COUPON_CREATE as "🎟️ Créer Coupons Promo"
        usecase UC_ADMIN_BANNER_MANAGE as "🖼️ Gérer Bannières"
        usecase UC_ADMIN_SETTINGS as "⚙️ Paramètres Système"
        usecase UC_ADMIN_HEALTH_MONITOR as "🏥 Surveillance Santé Plateforme"
        usecase UC_ADMIN_LOG_VIEW as "📝 Consulter Logs"
    }

    %% ========================================
    %% LIENS CLIENTS - AUTHENTICATION
    %% ========================================
    C --> UC_AUTH_SIGNUP
    C --> UC_AUTH_LOGIN
    C --> UC_AUTH_LOGOUT
    C --> UC_AUTH_FORGET_PWD

    UC_AUTH_SIGNUP ..> UC_AUTH_VERIFY_EMAIL : include
    UC_AUTH_SIGNUP ..> EMAIL : "envoie email"
    UC_AUTH_LOGIN ..> UC_AUTH_VERIFY_EMAIL : include
    UC_AUTH_FORGET_PWD ..> EMAIL : "envoie lien réinitialisation"

    %% ========================================
    %% LIENS CLIENTS - PROFILE
    %% ========================================
    C --> UC_PROFILE_VIEW
    C --> UC_PROFILE_EDIT
    UC_PROFILE_EDIT ..> UC_PROFILE_AVATAR : include

    %% ========================================
    %% LIENS CLIENTS - SEARCH & BROWSE
    %% ========================================
    C --> UC_SEARCH_TEXT
    C --> UC_SEARCH_IMAGE
    C --> UC_BROWSE_CATEGORY
    C --> UC_BROWSE_SHOP

    UC_SEARCH_TEXT ..> UC_SEARCH_FILTER : extend
    UC_SEARCH_IMAGE ..> IA : "appel IA Vision"
    UC_BROWSE_SHOP ..> UC_VIEW_PRODUCT : extend
    UC_BROWSE_SHOP ..> UC_VIEW_SERVICE : extend
    UC_VIEW_PRODUCT ..> UC_RECOMMEND_AI : extend
    UC_VIEW_SERVICE ..> UC_RECOMMEND_AI : extend

    %% ========================================
    %% LIENS CLIENTS - CART & ORDER
    %% ========================================
    C --> UC_CART_ADD
    C --> UC_CART_VIEW
    C --> UC_ORDER_CREATE
    C --> UC_ORDER_STATUS
    C --> UC_ORDER_HISTORY

    UC_CART_ADD ..> UC_CART_VIEW : include
    UC_CART_VIEW ..> UC_CART_REMOVE : extend
    UC_CART_VIEW ..> UC_CART_UPDATE_QTY : extend
    UC_ORDER_CREATE ..> UC_ORDER_VALIDATE : include
    UC_ORDER_CREATE ..> UC_ORDER_PAYMENT : include
    UC_ORDER_PAYMENT ..> PAY : "passerelle paiement"
    UC_ORDER_PAYMENT ..> UC_ORDER_FRAUD_CHECK : include
    UC_ORDER_FRAUD_CHECK ..> IA : "analyse risque"
    UC_ORDER_FRAUD_CHECK ..> UC_ORDER_CONFIRM : extend
    UC_ORDER_CONFIRM ..> UC_ORDER_QR_GENERATE : include
    UC_ORDER_CONFIRM ..> NOTIF : "notifie client"
    UC_ORDER_STATUS ..> UC_ORDER_HISTORY : include

    %% ========================================
    %% LIENS CLIENTS - BOOKING
    %% ========================================
    C --> UC_BOOKING_CREATE
    C --> UC_BOOKING_HISTORY

    UC_BOOKING_CREATE ..> UC_BOOKING_CHECK_AVAIL : include
    UC_BOOKING_CREATE ..> UC_BOOKING_CALENDAR : extend
    UC_BOOKING_CREATE ..> UC_BOOKING_CONFIRM : include
    UC_BOOKING_CONFIRM ..> NOTIF : "notifie vendeur"
    UC_BOOKING_HISTORY ..> UC_BOOKING_CANCEL : extend
    UC_BOOKING_HISTORY ..> UC_BOOKING_RESCHEDULE : extend

    %% ========================================
    %% LIENS CLIENTS - REVIEWS
    %% ========================================
    C --> UC_REVIEW_ADD
    C --> UC_REVIEW_DISPLAY

    UC_REVIEW_ADD ..> UC_REVIEW_RATING : include
    UC_REVIEW_ADD ..> UC_REVIEW_SENTIMENT : include
    UC_REVIEW_SENTIMENT ..> IA : "analyse sentiment"
    UC_REVIEW_DISPLAY ..> UC_REVIEW_HELPFUL : extend
    UC_REVIEW_DISPLAY ..> UC_REVIEW_MERCHANT_REPLY : extend

    %% ========================================
    %% LIENS CLIENTS - MESSAGING
    %% ========================================
    C --> UC_MSG_SEND
    C --> UC_MSG_RECEIVE
    C --> UC_SUPPORT_TICKET

    UC_MSG_SEND ..> UC_MSG_REALTIME : include
    UC_MSG_RECEIVE ..> NOTIF : "push notification"
    UC_SUPPORT_TICKET ..> UC_SUPPORT_REPLY : extend

    %% ========================================
    %% LIENS CLIENTS - SOCIAL & CONTENT
    %% ========================================
    C --> UC_REEL_VIEW
    C --> UC_REEL_LIKE
    C --> UC_REEL_COMMENT
    C --> UC_STORY_VIEW
    P --> UC_REEL_CREATE
    P --> UC_STORY_CREATE

    UC_REEL_CREATE ..> UC_REEL_PUBLISH : include
    UC_REEL_VIEW ..> UC_REEL_LIKE : extend
    UC_REEL_VIEW ..> UC_REEL_COMMENT : extend
    UC_REEL_VIEW ..> UC_REEL_SHARE : extend
    UC_REEL_VIEW ..> UC_REEL_SAVE : extend
    UC_REEL_COMMENT ..> NOTIF : "notifie auteur"
    UC_STORY_VIEW ..> UC_STORY_REPLY : extend

    %% ========================================
    %% LIENS CLIENTS - FAVORITES & NOTIF
    %% ========================================
    C --> UC_FAVORITE_ADD
    C --> UC_FAVORITE_LIST
    C --> UC_NOTIF_VIEW

    UC_FAVORITE_LIST ..> UC_FAVORITE_REMOVE : extend
    UC_NOTIF_VIEW ..> UC_NOTIF_SETTINGS : extend
    UC_NOTIF_VIEW ..> UC_NOTIF_CLEAR : extend

    %% ========================================
    %% LIENS COMMERÇANT - SHOP
    %% ========================================
    P --> UC_SHOP_CREATE
    P --> UC_SHOP_EDIT
    P --> UC_SHOP_PROFILE
    A --> UC_SHOP_VERIFY

    UC_SHOP_CREATE ..> UC_SHOP_VERIFY : include
    UC_SHOP_VERIFY ..> UC_SHOP_ACTIVATE : extend
    UC_SHOP_EDIT ..> UC_INVENTORY_MANAGE : extend

    %% ========================================
    %% LIENS COMMERÇANT - PRODUCTS
    %% ========================================
    P --> UC_PRODUCT_ADD
    P --> UC_PRODUCT_EDIT
    P --> UC_INVENTORY_MANAGE
    P --> UC_PRODUCT_BULK_IMPORT

    UC_PRODUCT_ADD ..> UC_PRODUCT_EDIT : extend
    UC_PRODUCT_BULK_IMPORT ..> UC_PRODUCT_ADD : extend
    UC_INVENTORY_MANAGE ..> UC_INVENTORY_ALERT : extend

    %% ========================================
    %% LIENS COMMERÇANT - ORDERS
    %% ========================================
    P --> UC_ORDER_MERCHANT_VIEW
    P --> UC_DASHBOARD_VIEW

    UC_ORDER_MERCHANT_VIEW ..> UC_ORDER_MERCHANT_ACCEPT : extend
    UC_ORDER_MERCHANT_ACCEPT ..> UC_ORDER_MERCHANT_PREPARE : include
    UC_ORDER_MERCHANT_PREPARE ..> UC_ORDER_MERCHANT_SHIP : include
    UC_ORDER_MERCHANT_SHIP ..> UC_ORDER_QR_SCAN : extend
    UC_ORDER_MERCHANT_VIEW ..> UC_ORDER_MERCHANT_REJECT : extend

    %% ========================================
    %% LIENS COMMERÇANT - BOOKING & SERVICES
    %% ========================================
    P --> UC_BOOKING_MERCHANT_VIEW

    UC_BOOKING_MERCHANT_VIEW ..> UC_BOOKING_MERCHANT_CONFIRM : extend
    UC_BOOKING_MERCHANT_CONFIRM ..> UC_BOOKING_MERCHANT_COMPLETE : extend

    %% ========================================
    %% LIENS COMMERÇANT - PROMOTIONS & ANALYTICS
    %% ========================================
    P --> UC_PROMO_CREATE
    P --> UC_DASHBOARD_STATS
    P --> UC_SELLER_ADVISOR

    UC_PROMO_CREATE ..> UC_PROMO_EDIT : extend
    UC_PROMO_CREATE ..> UC_PROMO_ANALYTICS : include
    UC_DASHBOARD_VIEW ..> UC_DASHBOARD_STATS : include
    UC_DASHBOARD_STATS ..> UC_IMAGE_GENERATE : extend
    UC_SELLER_ADVISOR ..> IA : "consultation IA"

    %% ========================================
    %% LIENS ADMIN
    %% ========================================
    A --> UC_ADMIN_LOGIN
    A --> UC_ADMIN_DASHBOARD
    A --> UC_ADMIN_MERCHANT_MANAGE
    A --> UC_ADMIN_USER_MANAGE
    A --> UC_ADMIN_ORDERS_VIEW
    A --> UC_ADMIN_FRAUD_DETECT
    A --> UC_ADMIN_CONTENT_MODERATE
    A --> UC_ADMIN_SETTINGS

    UC_ADMIN_DASHBOARD ..> UC_ADMIN_HEALTH_MONITOR : include
    UC_ADMIN_MERCHANT_MANAGE ..> UC_ADMIN_MERCHANT_VERIFY : include
    UC_ADMIN_MERCHANT_VERIFY ..> UC_ADMIN_MERCHANT_SUSPEND : extend
    UC_ADMIN_USER_MANAGE ..> UC_ADMIN_USER_BAN : extend
    UC_ADMIN_ORDERS_VIEW ..> UC_ADMIN_ORDERS_EXPORT : extend
    UC_ADMIN_FRAUD_DETECT ..> IA : "moteur fraude"
    UC_ADMIN_FRAUD_DETECT ..> UC_ADMIN_FRAUD_REVIEW : include
    UC_ADMIN_CONTENT_MODERATE ..> UC_ADMIN_REVIEW_MODERATE : extend
    UC_ADMIN_SETTINGS ..> UC_ADMIN_LOG_VIEW : extend
```

---

## 📊 Matrice des Relations

### 🔗 Relations "Include" (Inclusion Obligatoire)

| Cas Principal | Include | Description |
|---|---|---|
| **S'inscrire** | Vérifier Email | Chaque inscription exige une vérification d'email |
| **Se Connecter** | Vérifier Email | Vérification de l'email de connexion |
| **Modifier Profil** | Mettre à jour Avatar | Avatar obligatoire quand on modifie |
| **Ajouter au Panier** | Consulter Panier | Affichage du panier après ajout |
| **Créer Commande** | Valider Données | Validation des infos de commande obligatoire |
| **Créer Commande** | Effectuer Paiement | Le paiement est une étape obligatoire |
| **Effectuer Paiement** | Vérification Fraude | Vérification fraude après paiement |
| **Confirmation Commande** | Générer QR Code | QR Code généré automatiquement |
| **Confirmation Commande** | Notifier Client | Client reçoit notification |
| **Créer Réservation** | Vérifier Disponibilité | Vérifier si le créneau est libre |
| **Créer Réservation** | Confirmer Réservation | Confirmation automatique |
| **Poster Avis** | Évaluation 1-5 étoiles | Note obligatoire avec avis |
| **Poster Avis** | Analyse Sentiment | IA analyse le sentiment |
| **Envoyer Message** | Notification Temps Réel | Message envoyé en temps réel |
| **Recevoir Message** | Push Notification | Notification reçue |
| **Créer Reel** | Publier Reel | Publication après création |
| **Créer Shop** | Vérification Établissement | Admin doit vérifier |
| **Ajouter Produit** | Modifier Produit | Modification possible après ajout |
| **Import Produits** | Ajouter Produit | Utilise le cas "Ajouter Produit" |
| **Accepter Commande** | Préparer Commande | Préparation suite à acceptance |
| **Préparer Commande** | Marquer Expédiée | Expédition après préparation |
| **Créer Promotion** | Modifier Promotion | Modification possible après création |
| **Créer Promotion** | Analytics Promotion | Analytics générés après création |
| **Tableau de Bord** | Statistiques & Revenus | Stats automatiquement affichées |
| **Gérer Commerçants** | Vérifier Établissement | Vérification incluse |
| **Vérifier Établissement** | Activer Shop | Activation suite à vérification |
| **Consulter Commandes** | Exporter CSV | Export possible des commandes |
| **Détection Fraude** | Examiner Alertes | Examen des alertes générées |
| **Tableau de Bord Admin** | Surveillance Santé | Santé du système automatiquement affichée |

---

### 🔄 Relations "Extend" (Variantes Conditionnelles)

| Cas Extendant | Cas de Base | Condition/Contexte |
|---|---|---|
| **Recherche avec Filtres** | Recherche par Texte | Si client ajoute des critères (prix, distance) |
| **Voir Détails Produit** | Parcourir Shop | Quand on clique sur un produit spécifique |
| **Voir Détails Service** | Parcourir Shop | Quand on clique sur un service spécifique |
| **Recommandations IA** | Voir Détails Produit | Si le client consent aux recommandations |
| **Recommandations IA** | Voir Détails Service | Si le client consent aux recommandations |
| **Retirer du Panier** | Consulter Panier | Optionnel, si client veut supprimer |
| **Modifier Quantité** | Consulter Panier | Optionnel, si client veut changer quantité |
| **Annuler Commande** | Historique Commandes | Si commande éligible à annulation |
| **Marquer Avis Utile** | Consulter Avis | Si client veut donner feedback |
| **Répondre Avis** | Consulter Avis | Si commerçant veut répondre |
| **Liker Reel** | Regarder Reel | Si client aime le contenu |
| **Commenter Reel** | Regarder Reel | Si client veut commenter |
| **Partager Reel** | Regarder Reel | Si client veut partager |
| **Enregistrer Reel** | Regarder Reel | Si client veut sauvegarder |
| **Répondre Story** | Regarder Story | Si client veut répondre |
| **Retirer Favoris** | Consulter Favoris | Si client veut supprimer favoris |
| **Configurer Notifications** | Consulter Notifications | Si client veut gérer préférences |
| **Effacer Notifications** | Consulter Notifications | Si client veut nettoyer |
| **Modifier Shop** | Consulter Profil Shop | Commerçant veut changer détails |
| **Gérer Stock** | Modifier Shop | Commerçant veut gérer inventaire |
| **Alerte Stock Bas** | Gérer Inventaire | Alerte automatique quand stock bas |
| **Modifier Produit** | Ajouter Produit | Commerçant veut changer détails |
| **Supprimer Produit** | Ajouter Produit | Commerçant veut retirer |
| **Refuser Commande** | Consulter Commandes | Commerçant refuse la commande |
| **Scanner QR Code** | Marquer Expédiée | Vérification à la livraison |
| **Confirmer Réservation** | Consulter Réservations | Commerçant accepte la réservation |
| **Marquer Service Terminé** | Confirmer Réservation | Après fourniture du service |
| **Modifier Promotion** | Créer Promotion | Commerçant veut changer promo |
| **Générer Images IA** | Statistiques & Revenus | Commerçant veut images produits |
| **Suspendre Commerçant** | Gérer Commerçants | Admin veut punir un mauvais commerçant |
| **Bannir Utilisateur** | Gérer Utilisateurs | Admin veut bloquer un utilisateur |
| **Modérer Avis** | Modérer Contenu | Admin veut modérer les avis |
| **Consulter Logs** | Paramètres Système | Admin veut voir l'historique système |

---

## 📋 Détail des Cas d'Utilisation

### 🔐 AUTHENTIFICATION & PROFIL

#### 1. **S'inscrire (Sign Up)**
- **Acteurs**: Client
- **Préconditions**: Pas de compte existant
- **Flux Principal**:
  1. Client va à page d'inscription
  2. Remplit email, mot de passe, nom
  3. Système valide format email
  4. Envoie email de confirmation
  5. Client clique lien dans email
  6. Compte activé
- **Flux Alternatifs**: 
  - Email déjà utilisé → erreur
  - Email invalide → erreur
- **Postconditions**: Compte créé, email vérifié
- **Include**: ✉️ Vérifier Email
- **Acteurs Impliqués**: Client, Service Email

#### 2. **Se Connecter (Login)**
- **Acteurs**: Client, Commerçant, Admin
- **Préconditions**: Compte existant et email vérifié
- **Flux Principal**:
  1. Va à page login
  2. Entre email et mot de passe
  3. Système valide identifiants
  4. Crée session
  5. Redirige vers accueil
- **Flux Alternatifs**:
  - Credentials incorrects → erreur
  - Compte suspendu → bloqué
- **Postconditions**: Utilisateur connecté, session créée
- **Include**: ✉️ Vérifier Email

#### 3. **Récupérer Mot de Passe**
- **Acteurs**: Client, Commerçant, Admin
- **Flux Principal**:
  1. Clique "Mot de passe oublié"
  2. Entre email
  3. Email de réinitialisation envoyé
  4. Clique lien dans email
  5. Remplit nouveau mot de passe
  6. Mot de passe réinitialisé
- **Acteurs Impliqués**: Service Email

### 🛒 PANIER & COMMANDE

#### 4. **Ajouter au Panier**
- **Acteurs**: Client
- **Préconditions**: Client connecté, produit disponible
- **Flux Principal**:
  1. Consulte produit
  2. Entre quantité
  3. Clique "Ajouter au Panier"
  4. Système valide stock
  5. Ajoute au panier
  6. Affiche confirmation
- **Postconditions**: Article dans panier, stock mis à jour (provisoire)
- **Include**: 👁️ Consulter Panier

#### 5. **Créer une Commande**
- **Acteurs**: Client
- **Préconditions**: Panier non vide, client connecté
- **Flux Principal**:
  1. Client clique "Passer Commande"
  2. Vérifie informations de livraison
  3. Sélectionne mode paiement
  4. Effectue paiement
  5. Système vérifie fraude
  6. Génère numéro de commande (ORD-XXXXXX-XXXX)
  7. Crée QR Code
  8. Envoie confirmation client
  9. Notifie commerçant
- **Postconditions**: Commande créée, paiement confirmé, notifications envoyées
- **Include**: 
  - ✅ Valider Données
  - 💳 Effectuer Paiement
  - 🚨 Vérification Fraude
  - 🎟️ Générer QR Code
- **Acteurs Impliqués**: Client, Passerelle Paiement, Moteur IA, Service Notification

### 📅 RÉSERVATION SERVICE

#### 6. **Créer Réservation**
- **Acteurs**: Client
- **Préconditions**: Client connecté, service disponible
- **Flux Principal**:
  1. Client voit calendrier du service
  2. Vérifie disponibilité
  3. Sélectionne créneaux
  4. Entre détails (nombre personnes, préférences)
  5. Confirme réservation
  6. Génère ID réservation (BK-XXXXXX-XXXX)
  7. Envoie confirmation
  8. Notifie commerçant
- **Postconditions**: Réservation créée, créneau bloqué, notifications envoyées
- **Include**:
  - 📅 Vérifier Disponibilité
  - ✅ Confirmer Réservation
- **Extend**:
  - 🗓️ Consulter Calendrier (optionnel)

### ⭐ AVIS & ÉVALUATIONS

#### 7. **Poster un Avis**
- **Acteurs**: Client (après commande/service complété)
- **Préconditions**: Commande/Réservation complétée
- **Flux Principal**:
  1. Client accède à produit/service complété
  2. Clique "Laisser un avis"
  3. Sélectionne note 1-5 étoiles
  4. Écrit texte avis (facultatif)
  5. Ajoute photos (facultatif)
  6. Soumet avis
  7. IA analyse sentiment
  8. Avis publié
  9. Notifie commerçant
- **Postconditions**: Avis publié, score sentiment calculé, moyenne notes mise à jour
- **Include**:
  - ⭐ Évaluation 1-5 étoiles
  - 🧠 Analyse Sentiment (IA)
- **Acteurs Impliqués**: Client, Moteur IA

---

## 🚀 Utilisation pour Sprints et Releases

### **Release 1: Fondation**
- UC_AUTH_SIGNUP, UC_AUTH_LOGIN, UC_AUTH_LOGOUT
- UC_PROFILE_VIEW, UC_PROFILE_EDIT
- UC_ADMIN_LOGIN, UC_ADMIN_DASHBOARD

### **Release 2: Commerce**
- UC_SHOP_CREATE, UC_PRODUCT_ADD
- UC_CART_ADD, UC_ORDER_CREATE
- UC_BOOKING_CREATE

### **Release 3: Social & Contenu**
- UC_REEL_CREATE, UC_REEL_PUBLISH
- UC_STORY_CREATE
- UC_REVIEW_ADD

### **Release 4: IA & Analytics**
- UC_SEARCH_IMAGE (IA Vision)
- UC_RECOMMEND_AI
- UC_SELLER_ADVISOR
- UC_ADMIN_FRAUD_DETECT

---

**Document créé**: 18 Mai 2026  
**Dernière mise à jour**: 18 Mai 2026  
**Statut**: ✅ Complet et Détaillé
