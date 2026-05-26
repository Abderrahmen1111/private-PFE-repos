# 🎯 INTERFACES PUBLIQUES RO2YA PAR ACTEUR

**Plateforme**: Ro2ya.tn - Marketplace Social  
**Date**: 25 Mai 2026  
**Statut**: Documentation Complète des Interfaces Publiques  
**Mise à jour**: Ajout des descriptions de la version Application Mobile (React Native / Expo)

---

## 📋 TABLE DES MATIÈRES

1. [Interfaces Publiques (Tous)](#interfaces-publiques)
2. [Interfaces Client](#interfaces-client)
3. [Interfaces Commerçant/Vendeur](#interfaces-commerçant)
4. [Interfaces Admin](#interfaces-admin)
5. [Synthèse Comparée](#synthèse)

---

## 🌐 INTERFACES PUBLIQUES (Accessibles à Tous)

Ces pages sont accessibles **sans connexion** et visibles par tous les visiteurs.

### 1️⃣ **Homepage** `/`

**À quoi ça sert?** La page d'accueil est la première impression de la plateforme. Elle affiche les produits en tendance, les boutiques les plus populaires, et les vidéos qui buzz. C'est le point de départ parfait pour découvrir ce qui se vend bien en ce moment.

- **URL**: `https://ro2ya.tn/`
- **Acteurs**: Tout le monde (anonyme ou connecté)
- **Composants Principaux**:
  - Barre de navigation (Navbar)
  - Hero section avec CTA "S'inscrire" ou "Se Connecter"
  - Section "Tendances" (produits populaires)
  - Section "Boutiques Populaires"
  - Section "Reels Trending" (courtes vidéos)
  - Footer avec liens
- **Fonctionnalités**:
  - Voir produits en tendance (lecture seule)
  - Cliquer sur un produit → Page détail (si connecté)
  - Voir boutiques populaires
  - Voir reels trendy
  - Accès: Inscription, Connexion, Catégories

> **📱 Version Mobile (App Ro2ya)**  
> L'écran d'accueil natif affiche le feed principal (Reels, promotions, boutiques à proximité). L'interface détecte automatiquement le rôle (Client/Vendeur) et adapte la vue. La navigation est facilitée par une barre de menu flottante offrant un accès rapide aux principales fonctionnalités de l'application.

---

### 2️⃣ **Page Inscription** `/register`

**À quoi ça sert?** C'est ici qu'un nouveau client crée son compte. En quelques clics, il donne son email, un mot de passe, et son nom. Un email de confirmation est envoyé pour vérifier qu'il est bien le propriétaire de l'email.

- **URL**: `https://ro2ya.tn/register`
- **Acteurs**: Visiteurs non-connectés
- **Composants Principaux**:
  - Carte blanche avec formulaire
  - Champs: Email, Mot de passe, Confirmer mot de passe, Nom complet
  - Bouton "Créer un compte"
  - Lien "Vous avez un compte? Connectez-vous"
  - Footer avec lien politique de confidentialité
- **Fonctionnalités**:
  - Saisir informations de base
  - Validation email (pas de doublon)
  - Création de compte
  - Redirection vers email de confirmation
- **Flux Post-Inscription**:
  - Email de confirmation envoyé
  - Utilisateur clique lien
  - Confirmé → peut se connecter

> **📱 Version Mobile (App Ro2ya)**  
> L'inscription propose un écran unifié avec boutons de connexion sociale. Le formulaire classique bénéficie de validations en temps réel. La sécurité et l'authentification sont entièrement gérées via Supabase Auth pour une expérience fluide.

---

### 3️⃣ **Page Connexion** `/login`

**À quoi ça sert?** Les utilisateurs existants se connectent ici avec leur email et mot de passe. Une fois connectés, ils accèdent à leur compte personnel, leur panier, et toutes leurs données privées. Il y a aussi une option "Mot de passe oublié?" en cas de besoin.

- **URL**: `https://ro2ya.tn/login`
- **Acteurs**: Visiteurs non-connectés
- **Composants Principaux**:
  - Carte blanche avec formulaire
  - Champs: Email, Mot de passe (avec œil révéler)
  - Bouton "Se Connecter"
  - Lien "Mot de passe oublié?"
  - Lien "Vous n'avez pas de compte? Inscrivez-vous"
- **Fonctionnalités**:
  - Saisir identifiants
  - Validation et authentification
  - Session créée (cookie httpOnly)
  - Redirection vers homepage ou URL d'origine
- **Flux Alternative**:
  - Oubli mot de passe → Email reset
  - Cliquer lien reset → Formulaire nouveau mot de passe
  - Nouveau mot de passe → Peut se reconnecter

> **📱 Version Mobile (App Ro2ya)**  
> La connexion s'effectue sur l'écran unifié. Elle est sécurisée par Supabase (session persistante) et propose un accès rapide via les réseaux sociaux. Un AuthGuard gère la redirection automatique vers l'accueil après authentification.

---



### 4️⃣ **Magic Link Inscription** `/register/magic-link`

**À quoi ça sert?** Une façon plus rapide et plus sûre de s'inscrire. Au lieu de créer et mémoriser un mot de passe, vous entrez juste votre email. Ro2ya vous envoie un lien spécial (valide 24h). Vous cliquez le lien et **tadaaa!** Vous êtes automatiquement inscrit et connecté! Zéro friction, zéro mot de passe à oublier.

- **URL**: `https://ro2ya.tn/register/magic-link`
- **Acteurs**: Visiteurs non-connectés
- **Composants Principaux**:
  - Champ simple: "Votre adresse email"
  - Bouton: "📧 Envoyer le lien magique"
  - Message: "Un lien sera envoyé à votre email. Cliquez-le pour vous inscrire!"
  - Lien: "Préférez un mot de passe? Inscription classique"
- **Flux Complet**:
  1. Utilisateur entre son email
  2. Clique "Envoyer le lien magique"
  3. Message: "✓ Vérifiez votre email!"
  4. Email reçu avec: "Bienvenue sur Ro2ya! Cliquez ici pour finaliser votre compte"
  5. Utilisateur clique le lien
  6. **Automatiquement inscrit et connecté** → Redirection vers homepage
  7. Profil créé, prêt à acheter/vendre

**Avantages**:
- ✅ Pas de mot de passe à mémoriser
- ✅ Plus sécurisé (lien unique + temporaire)
- ✅ Plus rapide (moins de clics)
- ✅ Moins de risque "oubli de mot de passe"
- ✅ Fonctionne sur tous les appareils

---

### 5️⃣ **Magic Link Connexion** `/login/magic-link`

**À quoi ça sert?** Vous avez déjà un compte mais vous ne voulez pas rentrer votre mot de passe. C'est normal - qui mémorise les 50 mots de passe de tous les sites? Vous entrez juste votre email, Ro2ya vous envoie un lien, vous cliquez, et vous êtes connecté. C'est tout!

- **URL**: `https://ro2ya.tn/login/magic-link`
- **Acteurs**: Visiteurs non-connectés (avec compte existant)
- **Composants Principaux**:
  - Champ simple: "Votre adresse email"
  - Bouton: "📧 Envoyer le lien de connexion"
  - Message: "Entrez l'email de votre compte"
  - Lien: "Vous n'avez pas de compte? Inscrivez-vous" ou "Préférez rentrer votre mot de passe?"
- **Flux Complet**:
  1. Utilisateur entre son email
  2. Clique "Envoyer le lien de connexion"
  3. Message: "✓ Vérifiez votre email!"
  4. Email reçu avec: "Cliquez ici pour vous connecter à Ro2ya"
  5. Utilisateur clique le lien
  6. **Automatiquement connecté** → Redirection vers la page d'avant ou homepage
  7. Pas besoin de taper le mot de passe!

**Sécurité**:
- ✅ Lien valide pendant 24 heures seulement
- ✅ Lien spécifique à cet utilisateur (ne peut pas être réutilisé)
- ✅ Si quelqu'un d'autre reçoit l'email, il peut juste se connecter (accès au compte)
- ✅ Meilleur que mot de passe faible

**Utilisation Courante**:
- Vous êtes sur mobile et vous trouvez un produit intéressant
- Vous cliquez "Acheter" et vous devez vous connecter
- Vous tapez votre email, recevez le lien, cliquez → Connecté instantanément
- Vous achetez! 🛒

---

### 6️⃣ **Page Découverte** `/discover`

**À quoi ça sert?** C'est l'équivalent de TikTok ou Instagram Reels sur Ro2ya. On scroll verticalement pour regarder des petites vidéos sympas des vendeurs et clients. Les vidéos sont triées de façon à vous montrer ce qui vous intéresse (votre feed personnel).

- **URL**: `https://ro2ya.tn/discover`
- **Acteurs**: Tous (anonyme: contenu limité, connecté: personnalisé)
- **Composants Principaux**:
  - Navbar complète
  - Feed vertical de Reels (comme TikTok)
  - Chaque Reel affiche: vidéo, créateur, icônes interactions
  - Icônes côté droit: ❤️ Like, 💬 Commentaires, ⭐ Favoris, 🔗 Partage, 👥 Suivre
- **Fonctionnalités** (Anonyme):
  - Voir Reels (lecture seule)
  - Scroll vertical
  - Aucune interaction possible
- **Fonctionnalités** (Connecté):
  - Liker un Reel
  - Commenter
  - Sauvegarder (aux favoris)
  - Partager
  - Suivre le créateur
  - Voir notifications d'interactions

> **📱 Version Mobile (App Ro2ya)**  
> L'onglet Discover offre une expérience immersive de type TikTok avec un feed vertical fullscreen. Les utilisateurs peuvent interagir (liker, commenter, partager) de manière fluide. L'interface s'adapte au thème sombre pour une consultation optimale.

---

### 7️⃣ **Page Recherche** `/search`

**À quoi ça sert?** Vous cherchez un produit spécifique? Vous tapez "téléphone noir" ou même en Darija, et Ro2ya vous montre les boutiques et produits qui correspondent. On voit aussi la distance (5km, 10km) et on peut filtrer par prix ou catégorie. Il y a même une recherche par image si vous avez une photo!

- **URL**: `https://ro2ya.tn/search?query=...&location=...`
- **Acteurs**: Tous (résultats limités si anonyme)
- **Composants Principaux**:
  - Barre de recherche grande
  - Suggestions en temps réel
  - Catégories populaires (icônes)
  - Onglets: "Tous", "Boutiques", "Produits", "Services"
  - Carte avec épingles 📍
  - Liste de résultats avec cartes produits/boutiques
  - Filtres en sidebar: Catégorie, Distance, Prix, Note
- **Fonctionnalités**:
  - Rechercher par texte (Français ou Darija)
  - Recherche par image (upload/caméra)
  - Résultats géolocalisés (distance affichée)
  - Filtrer par catégorie, prix, distance
  - Trier par pertinence, distance, prix
  - Cliquer résultat → Page détail (si connecté)

> **📱 Version Mobile (App Ro2ya)**  
> La recherche avancée intègre l'IA sémantique, la recherche par image et la géolocalisation. Les résultats (supportant la Darija) sont organisés par onglets filtrables, avec un affichage précis de la distance et de l'adresse.

---

### 8️⃣ **Détail Reel** `/reels/[id]`

**À quoi ça sert?** Vous cliquez sur une vidéo pour la voir en grand. Vous pouvez lire les commentaires, liker, et si vous êtes connecté, vous pouvez commenter aussi. Si le créateur a tagué un produit, vous pouvez aller directement l'acheter depuis là.

- **URL**: `https://ro2ya.tn/reels/123`
- **Acteurs**: Tous (interactions réservées aux connectés)
- **Composants Principaux**:
  - Vidéo fullscreen
  - Créateur avec avatar et nom
  - Icônes interactions à droite
  - Section commentaires (si présents)
  - Bouton "Voir la boutique" (si c'est un vendeur)
- **Fonctionnalités** (Anonyme):
  - Voir vidéo
  - Voir créateur
  - Voir commentaires
- **Fonctionnalités** (Connecté):
  - Liker
  - Commenter
  - Sauvegarder
  - Partager
  - Suivre créateur
  - Si produit tagué: Voir produit

---

### 9️⃣ **Catégories/Filtres** `/discover?category=electronics`

**À quoi ça sert?** Plutôt que de scroll indéfiniment, vous pouvez filtrer le feed par catégorie (Électronique, Mode, Restaurants, etc.). Ça vous montre uniquement ce qui vous intéresse.

- **URL**: `https://ro2ya.tn/discover?category=...`
- **Acteurs**: Tous
- **Composants Principaux**:
  - Même que découverte mais filtrée par catégorie
- **Fonctionnalités**:
  - Voir reels d'une catégorie spécifique
  - Filtrer par catégorie

---

## � AUTHENTIFICATION ALTERNATIVE - Magic Link

Ces pages permettent une connexion/inscription **sans mot de passe**, juste avec un email.

### Magic Link Inscription `/register/magic-link`

**À quoi ça sert?** Une façon plus rapide et plus sûre de s'inscrire. Au lieu de créer et mémoriser un mot de passe, vous entrez juste votre email. Ro2ya vous envoie un lien spécial (valide 24h). Vous cliquez le lien et **tadaaa!** Vous êtes automatiquement inscrit et connecté! Zéro friction, zéro mot de passe à oublier.

- **URL**: `https://ro2ya.tn/register/magic-link`
- **Acteurs**: Visiteurs non-connectés
- **Composants Principaux**:
  - Champ simple: "Votre adresse email"
  - Bouton: "📧 Envoyer le lien magique"
  - Message: "Un lien sera envoyé à votre email. Cliquez-le pour vous inscrire!"
  - Lien: "Préférez un mot de passe? Inscription classique"
- **Flux Complet**:
  1. Utilisateur entre son email
  2. Clique "Envoyer le lien magique"
  3. Message: "✓ Vérifiez votre email!"
  4. Email reçu avec: "Bienvenue sur Ro2ya! Cliquez ici pour finaliser votre compte"
  5. Utilisateur clique le lien
  6. **Automatiquement inscrit et connecté** → Redirection vers homepage
  7. Profil créé, prêt à acheter/vendre

**Avantages**:
- ✅ Pas de mot de passe à mémoriser
- ✅ Plus sécurisé (lien unique + temporaire)
- ✅ Plus rapide (moins de clics)
- ✅ Moins de risque "oubli de mot de passe"
- ✅ Fonctionne sur tous les appareils

---

### Magic Link Connexion `/login/magic-link`

**À quoi ça sert?** Vous avez déjà un compte mais vous ne voulez pas rentrer votre mot de passe. C'est normal - qui mémorise les 50 mots de passe de tous les sites? Vous entrez juste votre email, Ro2ya vous envoie un lien, vous cliquez, et vous êtes connecté. C'est tout!

- **URL**: `https://ro2ya.tn/login/magic-link`
- **Acteurs**: Visiteurs non-connectés (avec compte existant)
- **Composants Principaux**:
  - Champ simple: "Votre adresse email"
  - Bouton: "📧 Envoyer le lien de connexion"
  - Message: "Entrez l'email de votre compte"
  - Lien: "Vous n'avez pas de compte? Inscrivez-vous" ou "Préférez rentrer votre mot de passe?"
- **Flux Complet**:
  1. Utilisateur entre son email
  2. Clique "Envoyer le lien de connexion"
  3. Message: "✓ Vérifiez votre email!"
  4. Email reçu avec: "Cliquez ici pour vous connecter à Ro2ya"
  5. Utilisateur clique le lien
  6. **Automatiquement connecté** → Redirection vers la page d'avant ou homepage
  7. Pas besoin de taper le mot de passe!

**Sécurité**:
- ✅ Lien valide pendant 24 heures seulement
- ✅ Lien spécifique à cet utilisateur (ne peut pas être réutilisé)
- ✅ Si quelqu'un d'autre reçoit l'email, il peut juste se connecter (accès au compte)
- ✅ Meilleur que mot de passe faible

**Utilisation Courante**:
- Vous êtes sur mobile et vous trouvez un produit intéressant
- Vous cliquez "Acheter" et vous devez vous connecter
- Vous tapez votre email, recevez le lien, cliquez → Connecté instantanément
- Vous achetez! 🛒

---

## �👤 INTERFACES CLIENT (Après Connexion)

Ces pages sont accessibles uniquement par les clients connectés (non-vendeurs).

### 1️⃣ **Page Profil Client** `/profile`

**À quoi ça sert?** C'est votre "maison" personnelle. Vous voyez votre avatar, votre nom, vos statistiques (nombre de favoris, commandes, avis). À partir d'ici, vous pouvez accéder à tous vos données: favoris, commandes passées, avis laissés. C'est aussi ici que vous modifiez vos paramétrages.

- **URL**: `https://ro2ya.tn/profile`
- **Acteurs**: Client connecté
- **Composants Principaux**:
  - Avatar + Nom du client
  - Bio courte
  - Statistiques: Favoris, Commandes, Avis
  - Onglets: "Mes Favoris", "Mes Commandes", "Mes Avis", "Paramètres"
  - Menu: "Modifier Profil", "Mes Adresses", "Préférences", "Déconnexion"
- **Fonctionnalités**:
  - Voir profil personnel
  - Modifier avatar/nom/bio
  - Voir favoris
  - Voir historique commandes
  - Voir avis laissés
  - Gérer adresses de livraison
  - Paramètres de notification
  - Déconnexion

> **📱 Version Mobile (App Ro2ya)**  
> Le profil propose une interface sous forme de cartes (Activités, Amis, Favoris, Suivis) et une édition simple. Il permet de retrouver l'historique des commandes, d'accéder au chat, et d'afficher le QR Code de livraison.

---

### 2️⃣ **Mes Favoris** `/profile/favorites`

**À quoi ça sert?** C'est votre liste de courses personnelle. Chaque fois que vous cliquez sur le cœur (❤️), un produit, une boutique, ou un reel s'ajoute ici. Vous pouvez y revenir quand vous le voulez, trier, ou même partager votre liste avec vos amis.

- **URL**: `https://ro2ya.tn/profile/favorites`
- **Acteurs**: Client connecté
- **Composants Principaux**:
  - Grille de produits/boutiques/reels sauvegardés
  - Filtres: Type (Produits, Boutiques, Reels)
  - Tri: Récent, Ancien, Pertinence
  - Chaque item affiche: Image, Nom, Prix (si produit), Boutique, ❌ pour retirer
- **Fonctionnalités**:
  - Voir liste complète des favoris
  - Filtrer par type
  - Trier
  - Retirer un favori
  - Partager la liste
  - Cliquer pour accéder

> **📱 Version Mobile (App Ro2ya)**  
> Les favoris sont directement intégrés dans l'écran Profil. Chaque boutique ou élément sauvegardé apparaît sous forme de carte résumée, permettant un accès direct à sa page détaillée en un seul clic.

---

### 3️⃣ **Mes Commandes** `/profile/orders`

**À quoi ça sert?** Toutes les commandes que vous avez passées sont ici. Vous voyez la date, la boutique, le prix, et surtout l'état de livraison (En cours, Livrée, etc.). C'est pratique pour suivre ce que vous attendez et c'est facile de recontacter le vendeur ou de laisser un avis.

- **URL**: `https://ro2ya.tn/profile/orders`
- **Acteurs**: Client connecté
- **Composants Principaux**:
  - Liste de toutes les commandes passées
  - Colonnes: Numéro, Date, Boutique, Montant, Statut, Actions
  - Filtres: En cours, Livrées, Annulées
  - Chaque ligne: Détails, 📊 Suivi, 💬 Chat vendeur, ⭐ Laisser avis
- **Fonctionnalités**:
  - Voir historique complet
  - Filtrer par statut
  - Voir détails d'une commande
  - Suivre livraison (statut)
  - Chat avec vendeur
  - Laisser avis
  - Retélécharger facture (PDF)

> **📱 Version Mobile (App Ro2ya)**  
> L'historique des commandes se trouve dans la section "Activités" avec des badges de statut colorés. Pour les commandes validées, un bouton affiche un QR Code dynamique en plein écran, scannable par le vendeur lors de la livraison.

---

### 4️⃣ **Détail Commande** `/profile/orders/[id]`

**À quoi ça sert?** Vous cliquez sur une commande pour voir tous les détails: chaque article, le prix exact, l'adresse de livraison, les frais, etc. C'est aussi ici que vous pouvez chatter avec le vendeur, laisser un avis, ou réclamer si quelque chose ne va pas. Vous voyez aussi un **QR Code dynamique** que vous pouvez montrer au vendeur à la livraison pour confirmer la réception.

- **URL**: `https://ro2ya.tn/profile/orders/ORD-123456`
- **Acteurs**: Client propriétaire de la commande
- **Composants Principaux**:
  - Numéro et date
  - Articles commandés (liste détaillée)
  - Statut de livraison
  - Adresse de livraison
  - Prix avec détails (sous-total, frais, taxes)
  - **QR Code dynamique** (scannable par le vendeur à la livraison)
  - Boutons: 💬 "Chat Vendeur", ⭐ "Laisser Avis", 🔗 "Partager"
- **Fonctionnalités**:
  - Voir détails complets
  - **Afficher QR Code en plein écran** (pour scanning mobile)
  - Chat avec vendeur
  - Laisser avis si livrée
  - Partager avec ami
  - Imprimer facture

---

### 5️⃣ **Mes Réservations** `/profile/reservations`

**À quoi ça sert?** Toutes les réservations de services que vous avez faites sont ici. Vous voyez la date, le service, le prestataire, l'heure de réservation, et surtout l'état (En attente, Confirmée, En cours, Terminée). C'est pratique pour suivre vos rendez-vous et contacter le prestataire si besoin. Chaque réservation a aussi un **QR Code unique** que vous montrez au prestataire à votre arrivée.

- **URL**: `https://ro2ya.tn/profile/reservations`
- **Acteurs**: Client connecté
- **Composants Principaux**:
  - Liste de toutes les réservations passées
  - Colonnes: Service, Prestataire, Date, Heure, Lieu, Statut, Actions
  - Filtres: À venir, En cours, Terminées, Annulées
  - Chaque ligne: Détails, 📄 QR Code, 📞 Appeler, 💬 Chat prestataire, ⭐ Laisser avis
- **Fonctionnalités**:
  - Voir historique complet des réservations
  - Filtrer par statut
  - Voir détails d'une réservation
  - **Afficher QR Code en plein écran** (scannable par le prestataire)
  - Appeler le prestataire
  - Chat avec prestataire
  - Laisser avis si terminée
  - Annuler réservation si besoin
  - Recevoir rappel avant la réservation

---

### 6️⃣ **Messagerie** `/messages`

**À quoi ça sert?** C'est votre espace de chat personnel. Vous pouvez discuter avec d'autres clients ou avec les vendeurs des boutiques. C'est pratique pour poser des questions avant d'acheter, ou pour coordonner une livraison. Les messages arrivent en temps réel.

- **URL**: `https://ro2ya.tn/messages`
- **Acteurs**: Client connecté
- **Composants Principaux**:
  - Sidebar: Liste conversations
  - Zone principale: Conversation active
  - Champ de saisie pour messages
  - Historique de messages avec timestamps
  - Boutons: Partager lien, Envoyer image, Bloquer, Archiver
- **Fonctionnalités**:
  - Voir toutes les conversations
  - Ouvrir conversation avec client ou vendeur
  - Envoyer/recevoir messages en temps réel
  - Partager images/liens
  - Bloquer utilisateur
  - Archiver conversation
  - Supprimer message

> **📱 Version Mobile (App Ro2ya)**  
> La messagerie mobile se compose de la **liste des conversations** (onglet principal) et de l'**écran de chat** individuel (`app/chat/[id].tsx`).
> 
> L'interface de chat présente des bulles stylisées et des séparateurs de dates clairs. Les messages sont synchronisés en **temps réel** grâce à Supabase Realtime.
> 
> Le système inclut des fonctionnalités pratiques comme l'auto-scroll vers les nouveaux messages, l'affichage du statut en ligne, et une option simple pour **bloquer** un interlocuteur via le header.

---

### 7️⃣ **Boutique/Shop** `/shop`

**À quoi ça sert?** C'est comme un grand magasin virtuel centralisé. Tous les produits de toutes les boutiques sont ici en grille. Vous pouvez rechercher, filtrer par prix ou catégorie, et trier par popularité. C'est l'endroit parfait pour découvrir des produits sans avoir à chercher boutique par boutique.

- **URL**: `https://ro2ya.tn/shop`
- **Acteurs**: Client connecté ou non
- **Composants Principaux**:
  - Header: "La Boutique Ro2ya"
  - Barre de recherche + Filtres
  - Grille de produits avec cartes
  - Chaque carte: Image, Nom, Prix, Note, Statut stock, Boutons "Voir", "❤️"
- **Fonctionnalités**:
  - Parcourir tous les produits
  - Rechercher
  - Filtrer par catégorie, prix, boutique
  - Trier
  - Ajouter aux favoris
  - Cliquer produit → Détail

> **📱 Version Mobile (App Ro2ya)**  
> La page boutique centralise toutes les informations du commerçant (statistiques, stories, actions rapides). Les articles sont organisés par onglets (Produits, Services, Reels) et présentés dans une grille interactive.

---

### 8️⃣ **Détail Produit** `/shop/product/[id]`

**À quoi ça sert?** Vous entrez dans la fiche complète d'un produit. Grandes images, description détaillée, prix, disponibilité, avis d'autres clients, note moyenne. C'est ici que vous décidez d'acheter. Il y a aussi un bouton pour poser une question au vendeur.

- **URL**: `https://ro2ya.tn/shop/product/456`
- **Acteurs**: Client (connecté recommandé)
- **Composants Principaux**:
  - Galerie d'images (swipe mobile)
  - Nom, prix, note ⭐, stock
  - Description complète
  - Vendeur avec logo et note
  - Boutons: 🛒 "Ajouter au Panier", 🛍️ "Acheter", ❤️ "Favoris"
  - Section avis clients en bas
- **Fonctionnalités**:
  - Voir détails complets
  - Voir images en haute résolution
  - Voir avis et ratings
  - Ajouter au panier
  - Acheter directement
  - Ajouter aux favoris
  - Laisser avis (si acheté)
  - Chat vendeur: "Poser question"

> **📱 Version Mobile (App Ro2ya)**  
> La fiche produit offre un design élégant avec image plein écran, caractéristiques structurées et profil vendeur détaillé. Une barre d'action flottante permet d'ajouter aux favoris ou de contacter le vendeur via WhatsApp.

---

### 9️⃣ **Détail Service** `/merchants/service/[id]`

**À quoi ça sert?** Vous voyez la page complète d'un service. Grande image, nom, description, prix (à l'heure ou par intervention), durée estimée, avis clients, note moyenne. Vous voyez aussi les **stories récentes** de la boutique (petites vidéos/photos du jour). Il y a un bouton pour réserver et un formulaire à côté où vous pouvez sélectionner la date et l'heure.

- **URL**: `https://ro2ya.tn/merchants/service/789`
- **Acteurs**: Client connecté ou non
- **Composants Principaux**:
  - Hero image du service
  - Nom, prix, note ⭐, durée estimée, catégorie
  - Description complète
  - Photos/galerie (si plusieurs)
  - **Stories de la boutique** affichées (carousel horizontal)
  - Avis clients
  - Bouton "Réserver ce service"
  - Appel direct 📞
- **Fonctionnalités**:
  - Voir détails complets
  - Voir galerie images
  - Voir stories du prestataire
  - Lire avis
  - Appeler le prestataire
  - Ajouter aux favoris
  - Accéder au formulaire de réservation

---

### 🔟 **Réservation de Service** `/merchants/service/[id]/booking`

**À quoi ça sert?** C'est le formulaire pour réserver un service. Vous choisissez la date et l'heure qui vous convient (à partir de ce qui est disponible), vous précisez le lieu (à domicile ou en boutique), et vous entrez vos détails de contact. Vous voyez le prix final avant de confirmer. Ce formulaire s'affiche généralement comme un **drawer/modal sur le côté** de la page de détail.

- **URL**: `https://ro2ya.tn/merchants/service/789/booking` (ou drawer inline)
- **Acteurs**: Client connecté
- **Composants Principaux**:
  - **ServiceBookingCard** (composant réservation):
    - Récapitulatif du service (mini-fiche)
    - Calendrier pour choisir date
    - Heures disponibles pour la date choisie
    - Sélection lieu de prestation:
      - À mon domicile (adresse à remplir)
      - En boutique (adresse prestataire)
    - Numéro de téléphone
    - Notes spéciales (allergies, préférences, etc.)
    - Calcul prix final
    - Bouton "Réserver"
- **Fonctionnalités**:
  - Choisir date et heure disponibles
  - Spécifier lieu de prestation
  - Ajouter notes/préférences
  - Voir prix final
  - Confirmer réservation
  - Recevoir confirmation par email

---

### 1️⃣1️⃣ **Consulter une Boutique** `/merchants/business/[id]`

**À quoi ça sert?** Vous cliquez sur une boutique pour voir sa page complète. Il y a le logo, le nom du vendeur, sa note moyenne (⭐⭐⭐⭐), sa description, ses produits et services. Vous voyez aussi ses **stories du jour** et ses **promotions actuelles**. C'est parfait pour explorer l'offre complète avant d'acheter.

- **URL**: `https://ro2ya.tn/merchants/business/123`
- **Acteurs**: Client connecté ou non
- **Composants Principaux**:
  - Hero image + Logo vendeur
  - Nom, note ⭐, nombre avis
  - Description boutique
  - Localisation + Distance
  - Boutons: 💬 "Contacter", ❤️ "Suivre", 🔗 "Partager"
  - **Stories actuelles** (carousel horizontal - photos/vidéos 24h)
  - **Promotions en cours** (bannières)
  - Onglets: "Produits", "Services", "Avis"
  - Grille de produits/services
- **Fonctionnalités**:
  - Voir profil complet
  - Voir stories récentes
  - Voir promotions
  - Consulter produits/services
  - Lire avis
  - Contacter vendeur
  - Ajouter favoris
  - Suivre boutique

---

### 1️⃣2️⃣ **Checkout/Panier** `/shop/checkout`

**À quoi ça sert?** C'est l'étape finale avant de payer. Vous vérifiez tous vos articles, vous entrez votre adresse de livraison, vous choisissez comment recevoir (livraison à domicile, retrait en magasin), et vous voyez le prix final. À la fin, il y a un bouton pour confirmer l'achat.

- **URL**: `https://ro2ya.tn/shop/checkout`
- **Acteurs**: Client connecté avec articles dans le panier
- **Composants Principaux**:
  - Récapitulatif panier (liste articles)
  - Formulaire adresse de livraison
  - Sélection méthode livraison
  - Calcul prix final
  - Bouton "Passer Commande"
  - Boutons: "Continuer shopping", "Vider panier"
- **Fonctionnalités**:
  - Voir panier détaillé
  - Modifier quantités
  - Retirer articles
  - Saisir/modifier adresse livraison
  - Choisir méthode livraison
  - Voir calcul prix final
  - Passer la commande

> **📱 Version Mobile (App Ro2ya)**  
> Le panier propose une interface premium affichant les détails des articles et les quantités. Le checkout s'ouvre dans un modal pré-rempli, générant automatiquement des commandes groupées par boutique après validation.

---

### 1️⃣3️⃣ **Support Client** `/support`

**À quoi ça sert?** Vous avez un problème? Un produit endommé, une livraison retardée, une question de compte? Vous venez ici. Il y a d'abord une FAQ (questions répondues déjà), et si vous ne trouvez pas, vous créez un ticket. L'équipe du support vous répond dans les 24-48h.

- **URL**: `https://ro2ya.tn/support`
- **Acteurs**: Tout le monde
- **Composants Principaux**:
  - FAQ (questions réponses)
  - Formulaire "Créer un Ticket"
  - Catégories: Produit, Livraison, Paiement, Compte, Autre
  - Champs: Titre, Description, Attachements, Contact
- **Fonctionnalités**:
  - Parcourir FAQ
  - Créer ticket support
  - Attacher images/fichiers
  - Recevoir numéro ticket
  - Chat avec support

> **📱 Version Mobile (App Ro2ya)**  
> L'assistance est accessible depuis le dashboard pour créer et suivre ses tickets. Un écran de chat en temps réel permet d'échanger directement avec les administrateurs pour résoudre rapidement tout problème.

---

### 1️⃣4️⃣ **Suivi Ticket Support** `/support/tickets/[id]`

**À quoi ça sert?** Vous avez créé un ticket? Vous le retrouvez ici avec un numéro de référence. Vous voyez tous les messages échangés avec le support, et vous pouvez ajouter des commentaires. C'est comme une conversation préservée jusqu'à ce que votre problème soit résolu.

- **URL**: `https://ro2ya.tn/support/tickets/TICKET-12345`
- **Acteurs**: Client propriétaire du ticket
- **Composants Principaux**:
  - Informations du ticket
  - Historique conversation
  - Champ pour ajouter commentaires
  - Statut (En cours, Résolu, Fermé)
  - Bouton "Fermer Ticket"
- **Fonctionnalités**:
  - Voir progression du ticket
  - Ajouter commentaires
  - Chat avec support
  - Fermer ticket

---

## 🏪 INTERFACES COMMERÇANT/VENDEUR (Après Connexion + Propriétaire Boutique)

Ces pages sont accessibles uniquement par les vendeurs connectés qui ont créé une boutique.

### 1️⃣ **Créer Boutique** `/merchants/business/add`

**À quoi ça sert?** Vous voulez vendre sur Ro2ya? C'est ici que vous créez votre boutique. Vous donnez son nom, sa catégorie, une description, vous uploadez le logo et la bannière, et vous dites où vous êtes localisé. Après, l'admin examine et approuve votre boutique.

- **URL**: `https://ro2ya.tn/merchants/business/add`
- **Acteurs**: Client connecté sans boutique
- **Composants Principaux**:
  - Formulaire multi-sections:
    - Infos basiques: Nom, Catégorie, Description, Téléphone
    - Localisation: Adresse, Ville, Carte
    - Images: Logo, Bannière (upload zones)
  - Bouton "Soumettre"
  - Barre de progression
- **Fonctionnalités**:
  - Remplir infos boutique
  - Upload images (compressées)
  - Localisation sur carte
  - Validation et soumission
  - En attente d'approbation admin
  - Email de confirmation

> **📱 Version Mobile (App Ro2ya)**  
> La création de boutique se lance depuis le profil client. Le formulaire interactif permet de télécharger logo et bannière, de configurer les informations, et d'utiliser une carte GPS pour un positionnement précis.

---

### 2️⃣ **Dashboard Vendeur** `/dashboard/[id]`

**À quoi ça sert?** C'est le "command center" de votre boutique. Vous voyez d'un coup d'œil: combien vous avez vendu, combien de commandes en attente, quels produits sont les plus aimés. C'est aussi d'ici que vous accédez à tous les outils pour gérer votre boutique (produits, promotions, messages, etc.).

- **URL**: `https://ro2ya.tn/dashboard/123`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Menu latéral (Sidebar):
    - 📊 Aperçu
    - 📦 Produits
    - 🎁 Promotions
    - 📹 Reels
    - 📖 Stories
    - 💼 Leads (Commandes)
    - 💰 Transactions
    - 💬 Messages
    - ❓ Support
    - 🧠 Intelligence (Analytics IA)
    - ⚙️ Paramètres
  - Contenu principal: Aperçu statistiques
  - Cards: Ventes totales, Commandes, Produits, Favoris
- **Fonctionnalités**:
  - Naviguer vers toutes les sections
  - Voir statistiques rapides
  - Voir notifications
  - Profil vendeur

> **📱 Version Mobile (App Ro2ya)**  
> Le Dashboard remplace l'accueil pour les vendeurs, offrant une vue claire sur les revenus et des raccourcis clés. Un menu complet donne accès à tous les modules, assisté en permanence par un chatbot IA flottant.

---

### 3️⃣ **Mes Produits** `/dashboard/[id]/products`

**À quoi ça sert?** C'est ici que vous gérez votre inventaire. Vous voyez tous les produits que vous vendez (avec les images, prix, stock). Vous pouvez en ajouter des nouveaux, en modifier, les supprimer, ou même les créer automatiquement avec l'IA en uploadant juste une photo!

- **URL**: `https://ro2ya.tn/dashboard/123/products`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Bouton "+ Ajouter Produit"
  - Bouton "🤖 Créer avec IA"
  - Tableau/Grille de tous les produits
  - Colonnes: Image, Nom, Prix, Stock, Statut, Actions
  - Boutons par ligne: "✏️ Éditer", "🗑️ Supprimer", "👁️ Voir"
- **Fonctionnalités**:
  - Créer nouveau produit
  - Créer produit avec IA (upload photo)
  - Éditer produit existant
  - Supprimer produit
  - Voir produit comme client
  - Filtrer par statut, stock
  - Rechercher produit
  - Bulk actions (éditer plusieurs)

> **📱 Version Mobile (App Ro2ya)**  
> Le catalogue des produits est affiché sous forme de liste éditable. Les vendeurs peuvent ajouter manuellement de nouveaux articles ou utiliser l'Assistant IA intégré pour générer instantanément les fiches produits.

---

### 4️⃣ **Ajouter/Éditer Produit** `/dashboard/[id]/products/add` ou `/products/[id]/edit`

**À quoi ça sert?** C'est le formulaire complet d'un produit. Vous remplissez: nom, prix, stock, description détaillée, marque, et vous uploadez entre 1 et 5 photos de bonne qualité. Vous voyez un aperçu en temps réel de comment ça va apparaître pour les clients.

- **URL**: `https://ro2ya.tn/dashboard/123/products/add`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Sections de formulaire:
    - Infos basiques: Nom, Description, Prix, Stock
    - Détails: Marque, Code, Garantie, Poids
    - Images: Upload zone glisser-déposer
    - Catégorie, Tags, SKU
  - Aperçu du produit en temps réel
  - Bouton "Sauvegarder", "Annuler", "Supprimer"
- **Fonctionnalités**:
  - Remplir tous les détails
  - Upload/organiser images (max 5)
  - Aperçu produit
  - Sauvegarder
  - Modifier après création
  - Supprimer si nécessaire

---

### 5️⃣ **Créer Produit avec IA** `/dashboard/[id]/products/ai`

**À quoi ça sert?** Vous êtes pressé? Au lieu de remplir un long formulaire, vous prenez juste une photo du produit. L'IA anal yse l'image, devine automatiquement le nom, la catégorie, écrit une bonne description, et même propose un prix. Vous pouvez tout corriger si besoin.

- **URL**: `https://ro2ya.tn/dashboard/123/products/ai`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Zone upload photo du produit
  - Bouton "📷 Prendre Photo" ou "📤 Importer"
  - Barre progression "Analyse..."
  - Résultats générés: Nom, Catégorie, Description, Prix suggéré
  - Champs éditables pour chaque résultat
  - Bouton "Créer Produit"
- **Fonctionnalités**:
  - Prendre/importer photo
  - IA analyse image
  - IA génère suggestions
  - Éditer suggestions
  - Créer produit finalisé

> **📱 Version Mobile (App Ro2ya)**  
> Accessible via l'onglet "AI Bot", le chatbot génère une fiche produit complète à partir d'une simple description ou photo. Un bouton "Publier" permet ensuite la mise en ligne instantanée du produit.

---

### 6️⃣ **Mes Promotions** `/dashboard/[id]/promotions`

**À quoi ça sert?** C'est ici que vous faites des soldes et des promos. Vous voyez toutes vos promotions en cours (les remises, les dates), et vous pouvez en créer de nouvelles. Le système vous montre aussi comment ça marche (combien de clics, combien de ventes augmentées).

- **URL**: `https://ro2ya.tn/dashboard/123/promotions`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Bouton "+ Créer Promotion"
  - Tableau de promotions actives/passées
  - Colonnes: Titre, Produits, Réduction, Dates, Statut, Actions
  - Boutons: "✏️ Éditer", "🗑️ Supprimer", "📊 Voir Stats"
- **Fonctionnalités**:
  - Créer nouvelle promo
  - Éditer promo existante
  - Supprimer promo
  - Voir statistiques (clics, conversions, ROI)
  - Voir reductions appliquées
  - Ajouter/retirer produits

> **📱 Version Mobile (App Ro2ya)**  
> Les offres promotionnelles sont listées dans un tableau détaillé de suivi. Les vendeurs peuvent configurer leurs promotions manuellement ou demander au chatbot IA de les créer via une requête textuelle.

---

### 7️⃣ **Ajouter/Éditer Promotion** `/dashboard/[id]/promotions/add` ou `/promotions/[id]/edit`

**À quoi ça sert?** Vous créez une promotion ici: vous choisissez quels produits promouvoir, vous décidez de la réduction (10%, 20%, 50%, etc.), vous fixez les dates de début et fin. Le système vous montre le prix avant/après en temps réel.

- **URL**: `https://ro2ya.tn/dashboard/123/promotions/add`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Sélection produits (grille avec checkbox)
  - Réduction %: Slider ou input (10%, 20%, ..., 50%+)
  - Aperçu prix: "Avant: 800 DT | Après: 600 DT (-25%)"
  - Date début/fin (calendrier)
  - Titre promotion: "Soldes de Fin d'Été!"
  - Description (optionnel)
  - Bouton "Créer", "Annuler"
- **Fonctionnalités**:
  - Sélectionner 1+ produits
  - Définir réduction
  - Définir durée
  - Voir aperçu en temps réel
  - Créer/modifier promotion

---

### 8️⃣ **Dashboard Intelligence** `/dashboard/[id]/intelligence`

**À quoi ça sert?** C'est votre "conseiller en affaires" personnel. L'IA analyse ce qui se vend bien cette semaine, voit vos produits similaires, et vous propose d'en promouvoir certains. Elle vous dit: "Ce produit a beaucoup de demande cette semaine, baissez le prix de 30% et vous allez vendre 45% plus!" Vous pouvez accepter ou refuser ses idées.

- **URL**: `https://ro2ya.tn/dashboard/123/intelligence`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Cartes de recommandations:
    - 📊 Tendances cette semaine
    - 🤖 Produits à Promouvoir
    - 📈 Opportunités d'Upsell
    - 💡 Conseils Vendeur
  - Chat "Conseiller IA" (coin bas-droit)
  - Chaque recommandation affiche: Image, Description, Action suggérée
- **Fonctionnalités**:
  - Voir recommandations IA
  - Détail d'une recommandation
  - Accepter/modifier/refuser une recommandation
  - Chat interactif avec IA
  - Générer promo suggérée depuis recommandation

> **📱 Version Mobile (App Ro2ya)**  
> Cet espace regroupe les recommandations IA : tendances, conseils en upsell et opportunités de vente. Le chatbot conseiller est disponible pour aider les marchands à interpréter les données et optimiser leurs résultats.

---

### 9️⃣ **Mes Leads/Commandes** `/dashboard/[id]/leads`

**À quoi ça sert?** À chaque fois qu'un client vous commande quelque chose, c'est inscrit ici. Vous voyez: qui a commandé, quoi, combien, et l'état (En Attente, Acceptée, Refusée). Vous pouvez accepter une commande, la refuser (avec raison), ou contacter le client directement.

- **URL**: `https://ro2ya.tn/dashboard/123/leads`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Tableau de tous les leads (commandes + réservations)
  - Colonnes: Client, Produits, Montant, Statut, Date, Actions
  - Filtres: Type (Tous, Commandes, Réservations), Statut (En Attente, Acceptée, Rejetée)
  - Boutons par ligne: "Voir", "✓ Accepter", "❌ Refuser"
- **Fonctionnalités**:
  - Voir tous les leads reçus
  - Filtrer par type et statut
  - Accepter/refuser un lead
  - Voir détails complets
  - Chat avec client
  - Raison de rejet

> **📱 Version Mobile (App Ro2ya)**  
> L'écran liste toutes les commandes et réservations, filtrables par statut. Le vendeur peut accepter ou refuser chaque demande (avec motif) et ouvrir directement une discussion avec le client depuis la fiche.

---

### 🔟 **Transactions/Livraisons** `/dashboard/[id]/transactions`

**À quoi ça sert?** Une fois que vous avez accepté une commande et que vous l'avez livrée, vous le marquez ici avec un code QR. Le client scanne le code avec son téléphone, et Ro2ya sait que la commande est bien livrée. C'est pratique et sécurisé pour éviter les accés sans consentement.

- **URL**: `https://ro2ya.tn/dashboard/123/transactions`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Bouton "📱 Scanner QR Code"
  - Tableau des transactions:
    - Colonnes: Client, Commande, Montant, Statut, Date, Actions
    - Statuts: En Attente, Prête, En Livraison, Livrée, Annulée
  - Caméra QR scanner (si clic sur scanner)
  - Historique validation complète
- **Fonctionnalités**:
  - Voir toutes transactions
  - Scanner code QR de livraison
  - Marquer comme livré
  - Voir historique complet
  - Annuler si nécessaire

> **📱 Version Mobile (App Ro2ya)**  
> L'historique des validations est centralisé pour un suivi optimal. L'interface intègre un scanner de QR code permettant au vendeur de flasher le code du client à la livraison, garantissant une validation instantanée.

---

### 1️⃣1️⃣ **Mes Reels** `/dashboard/[id]/reels`
**À quoi ça sert?** Vous pouvez faire des petites vidéos (max 60 sec) pour promouvoir votre boutique ou vos produits. C'est comme TikTok. Vous voyez tous vos reels ici, combien de gens les ont aimés, combien les ont partagés. Vous pouvez aussi supprimer un reel si vous changez d'avis.
- **URL**: `https://ro2ya.tn/dashboard/123/reels`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Bouton "+ Créer Reel"
  - Grille de tous les reels du vendeur
  - Chaque carte: Miniature vidéo, Titre, ❤️ Likes, 💬 Commentaires, Actions
  - Boutons: "✏️ Éditer", "🗑️ Supprimer", "📊 Stats"
- **Fonctionnalités**:
  - Créer nouveau reel
  - Éditer reel (titre, description)
  - Supprimer reel
  - Voir statistiques (vues, likes, partages)
  - Voir commentaires

> **📱 Version Mobile (App Ro2ya)**  
> La galerie vidéo permet aux créateurs de gérer leurs vidéos courtes et d'analyser leurs performances. Ces contenus peuvent être importés ou filmés directement avant d'être diffusés sur la plateforme.

---

### 1️⃣2️⃣ **Mes Stories** `/dashboard/[id]/stories`
**À quoi ça sert?** Les stories sont comme les reels, mais plus éphémérales: elles disparaissent au bout de 24h. C'est idéal pour annoncer une promo du jour, ou partager une nouvelle en direct. Vous voyez combien de gens les ont regardées.
- **URL**: `https://ro2ya.tn/dashboard/123/stories`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Bouton "+ Ajouter Story"
  - Grille de stories actives
  - Chaque carte: Miniature, Titre, 👁️ Vues, Compte à rebours "18h restantes"
  - Boutons: "✏️ Éditer", "🗑️ Supprimer", "👁️ Voir Vues"
- **Fonctionnalités**:
  - Créer story
  - Éditer story
  - Supprimer story
  - Voir qui a regardé
  - Voir compte à rebours

> **📱 Version Mobile (App Ro2ya)**  
> Gérées depuis le même espace que les Reels, les stories s'affichent sous forme de bulles sur la page de la boutique. Elles restent visibles 24 heures, avec un compte à rebours soulignant leur nature éphémère.

---

### 1️⃣3️⃣ **Messages/Chat Vendeur** `/dashboard/[id]/messages`
**À quoi ça sert?** Les clients vous posent des questions avant d'acheter. Vous recevez tous leurs messages ici et vous pouvez répondre directement. C'est pratique pour clarifier un doute, donner plus de détails, ou vendre plus en étant aimable et réactif.
- **URL**: `https://ro2ya.tn/dashboard/123/messages`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Sidebar: Conversations avec clients
  - Zone principale: Chat actif
  - Historique messages
  - Champ réponse
  - Boutons: Lien vers produit, Archiver, Bloquer
- **Fonctionnalités**:
  - Voir toutes conversations
  - Répondre aux clients
  - Partager lien produit
  - Archiver conversation
  - Assister client pré-achat

---

### 1️⃣4️⃣ **Support Vendeur** `/dashboard/[id]/support`
**À quoi ça sert?** Si vous avez un problème technique avec votre boutique ou votre compte, vous créez un ticket ici. L'admin de Ro2ya le voit et vous aide en direct. C'est un chat en temps réel pour résoudre vos soucis rapidement.
- **URL**: `https://ro2ya.tn/dashboard/123/support`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Bouton "❓ Contacter Support"
  - Tableau des tickets ouverts
  - Colonnes: Titre, Catégorie, Statut, Date
  - Chaque ligne: "Voir", "Ajouter Commentaire", "Marquer Résolu"
- **Fonctionnalités**:
  - Créer ticket auprès de l'admin
  - Voir tous les tickets ouverts
  - Chat en temps réel avec admin
  - Voir progression résolution

---

### 1️⃣5️⃣ **Social Vendeur** `/dashboard/[id]/social`
**À quoi ça sert?** Vous voyez tous les avis que vos clients ont laissés. Vous pouvez leur répondre publiquement pour les remercier ou clarifier quelque chose. Le système montre aussi votre note moyenne et le pourcentage d'avis positifs.
- **URL**: `https://ro2ya.tn/dashboard/123/social`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Section "Avis clients" (toutes les reviews)
  - Filtres: Note (⭐⭐⭐⭐⭐), Récent, Plus utile
  - Chaque avis: Auteur, Note, Texte, Bouton "Répondre"
  - Section "Réponses" (avis auxquels on a répondu)
  - Statistiques: Note moyenne, % positifs
- **Fonctionnalités**:
  - Voir tous les avis reçus
  - Filtrer par note/date
  - Répondre à un avis
  - Voir statistiques globales
  - Éditer sa réponse

---

### 1️⃣6️⃣ **Paramètres Vendeur** `/dashboard/[id]/settings`
**À quoi ça sert?** C'est ici que vous gérez tous vos paramétrages: votre profil personnel, les infos de votre boutique (nom, logo, localisation), comment vous voulez ître notifié (email, SMS, etc.), et où vous veulent recevoir l'argent que vous gagnez.
- **URL**: `https://ro2ya.tn/dashboard/123/settings`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Onglets: Profil, Boutique, Notifications, Paiement, Intégrations
  - Profil: Avatar, Bio, Téléphone, Email
  - Boutique: Nom, Description, Logo, Bannière, Localisation
  - Notifications: Email alerts, SMS, Push
  - Paiement: Compte bancaire, RIB, Devises
- **Fonctionnalités**:
  - Modifier infos profil
  - Modifier infos boutique
  - Gérer notifications
  - Paramétrer paiement
  - Connecter intégrations (Social media, etc.)
  - Voir facturation

> **📱 Version Mobile (App Ro2ya)**  
> L'écran de réglages rassemble toutes les préférences (sécurité, langue, profil boutique) de manière intuitive. Un espace structuré regroupe l'ensemble des notifications pour faciliter la gestion du compte.

---

## 🔒 INTERFACES ADMIN (Non-Publiques, Backend)

**IMPORTANT**: Ces interfaces sont réservées aux administrateurs et ne sont pas publiquement accessibles. Seuls les administrateurs système peuvent y accéder.

### 1️⃣ **Admin Dashboard** (Backend)

**À quoi ça sert?** C'est le "command center" général de toute la plateforme. L'admin voit tout: combien d'utilisateurs inscrits, combien de boutiques, les tendances de vente, les problèmes signalés. C'est le poste de controle pour vérifier que tout fonctionne bien.

- **Accès**: Admin uniquement
- **Fonctionnalités Principales**:
  - Approuver/Rejeter boutiques
  - Gérer utilisateurs
  - Voir statistiques globales
  - Gérer signalements
  - Modérer contenu (Reels, Avis)
  - Gérer support tickets
  - Voir transactions globales
  - Gérer promotions (flagging)
  - Analytics complète

### 2️⃣ **Gestion Boutiques** (Backend Admin)

**À quoi ça sert?** Quand un nouveau vendeur veut créer sa boutique, elle vient d'abord ici en attente d'approbation. L'admin examine les détails, les images, et vérifie que tout est conforme. Il peut approuver (boutique visible aux clients) ou refuser (avec explication).

- **Accès**: Admin uniquement
- **Fonctionnalités**:
  - Liste boutiques "EN ATTENTE"
  - Examiner chaque boutique
  - Approuver/Rejeter avec raison
  - Suspendre boutique
  - Voir toutes les boutiques

### 3️⃣ **Gestion Utilisateurs** (Backend Admin)

**À quoi ça sert?** L'admin voit tous les utilisateurs inscrits sur Ro2ya. Si quelqu'un abuse (spam, fraud, contenu inapproprié), l'admin peut suspendre ou bannir cet utilisateur. L'admin peut aussi voir l'historique complet de chaque personne pour investiguer.

- **Accès**: Admin uniquement
- **Fonctionnalités**:
  - Voir tous les utilisateurs
  - Suspendre/Bannir utilisateurs
  - Voir historique transactions
  - Réinitialiser mots de passe
  - Gérer rôles

### 4️⃣ **Modération Contenu** (Backend Admin)

**À quoi ça sert?** Les utilisateurs peuvent "signaler" du contenu (un reel offensant, un avis inapproprié, un commentaire spam). L'admin reçoit ces signalements ici, examine le contenu, et décide s'il faut le supprimer ou bannir l'utilisateur. C'est important pour garder la plateforme sécurisée et respectueuse.

- **Accès**: Admin uniquement
- **Fonctionnalités**:
  - Signalements de Reels
  - Signalements d'Avis
  - Signalements de Commentaires
  - Supprimer contenu violant
  - Bannir utilisateurs problématiques

---

## 📊 SYNTHÈSE COMPARÉE

### Matrice d'Accès par Rôle

| Interface | Public | Client | Vendeur | Admin |
|-----------|--------|--------|---------|-------|
| Homepage | ✅ | ✅ | ✅ | ✅ |
| Inscription | ✅ | ✅ | ✅ | ✅ |
| Connexion | ✅ | ✅ | ✅ | ✅ |
| Découverte | ✅ | ✅ | ✅ | ✅ |
| Recherche | ✅ | ✅ | ✅ | ✅ |
| Profil Personnel | ❌ | ✅ | ✅ | ❌ |
| Mes Favoris | ❌ | ✅ | ✅ | ❌ |
| Mes Commandes | ❌ | ✅ | ✅ | ❌ |
| Messagerie | ❌ | ✅ | ✅ | ❌ |
| Shop/Boutique | ✅ | ✅ | ✅ | ✅ |
| Détail Produit | ✅ | ✅ | ✅ | ✅ |
| Panier/Checkout | ❌ | ✅ | ✅ | ❌ |
| Support | ✅ | ✅ | ✅ | ✅ |
| **Créer Boutique** | ❌ | ✅* | ✅ | ❌ |
| **Dashboard Vendeur** | ❌ | ❌ | ✅ | ❌ |
| **Produits** | ❌ | ❌ | ✅ | ❌ |
| **Promotions** | ❌ | ❌ | ✅ | ❌ |
| **Intelligence** | ❌ | ❌ | ✅ | ❌ |
| **Leads** | ❌ | ❌ | ✅ | ❌ |
| **Transactions** | ❌ | ❌ | ✅ | ❌ |
| **Reels Vendeur** | ❌ | ❌ | ✅ | ❌ |
| **Stories Vendeur** | ❌ | ❌ | ✅ | ❌ |
| **Admin Dashboard** | ❌ | ❌ | ❌ | ✅ |

*Client peut créer sa première boutique et devenir vendeur

---

### Résumé par Acteur

#### 👥 **CLIENT (Utilisateur Normal)**
- **Interfaces Publiques**: 7 pages (Homepage, Login, Register, Discover, Search, Shop, Support)
- **Interfaces Connectées**: 11 pages (Profil, Favoris, Commandes, Réservations, Messages, Checkout, etc.)
- **Total**: ~18 interfaces distinctes
- **📱 Écrans Mobile**: 12 écrans natifs (Home, Discover, AI Bot, Messages, Profile, Search, Cart, Product Detail, Business Profile, Chat, User Profile, Notifications)
- **Actions Principales**: Parcourir, Chercher, Acheter, Réserver, Commenter, Favoriser, Chatter

#### 🏪 **VENDEUR (Commerçant)**
- **Interfaces Publiques**: Accès à toutes les interfaces client (17)
- **Interfaces Vendeur**: 16 pages de dashboard spécialisé
- **Total**: ~33 interfaces distinctes
- **📱 Écrans Mobile Vendeur**: 18 écrans dashboard (Dashboard, Products, Add Product, Add Reel, Camera, Intelligence, Leads, Map, Profile, Promotions, Reels, Refunds, Reviews, Support, Support Chat, Transactions, Account, + ChatBot IA overlay)
- **Actions Principales**: Gérer produits, promotions, commandes, reels, analyser

#### 👨‍💼 **ADMIN (Administrateur)**
- **Interfaces Publiques**: Accès complet à toutes les pages (comme client)
- **Interfaces Admin**: 4 pages backend (Boutiques, Utilisateurs, Modération, Dashboard)
- **Total**: ~21 interfaces (publiques + admin)
- **Actions Principales**: Modérer, Approuver, Gérer système, Supporter

---

## 🎯 CAS D'USAGE TYPIQUES

### Client - Parcours d'Achat Typique
1. `/` (Homepage) → Voir tendances
2. `/search` (Recherche) → Chercher produit
3. `/shop/product/[id]` (Détail) → Consulter détails
4. `/shop/checkout` (Checkout) → Acheter
5. `/profile/orders` (Mes Commandes) → Suivre livraison
6. `/messages` (Chat) → Contacter vendeur
7. `/profile` (Profil) → Voir avis posté

### Vendeur - Gestion Boutique Typique
1. `/merchants/business/add` (Créer) → Créer boutique
2. `/dashboard/[id]/products` (Produits) → Ajouter articles
3. `/dashboard/[id]/promotions` (Promos) → Créer offres
4. `/dashboard/[id]/leads` (Commandes) → Accepter leads
5. `/dashboard/[id]/transactions` (Livraisons) → Valider QR
6. `/dashboard/[id]/intelligence` (IA) → Voir recommandations
7. `/dashboard/[id]/messages` (Messages) → Répondre clients

---

**Document Généré**: 25 Mai 2026  
**Couverture**: 50+ Interfaces Publiques  
**Acteurs**: 3 rôles principaux (Client, Vendeur, Admin)  
**App Mobile**: React Native (Expo) — 30+ écrans natifs avec les mêmes fonctionnalités  
**Statut**: ✅ **COMPLET**

