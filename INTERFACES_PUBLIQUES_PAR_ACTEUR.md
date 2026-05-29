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

### 8️⃣bis **Formulaire de Commande (Drawer)** `/shop/product/[id]/checkout`

**À quoi ça sert?** Quand vous cliquez sur "Acheter" ou "Ajouter au Panier" depuis la fiche produit, un **drawer slide-in (panneau coulissant)** s'ouvre sur le côté droit. C'est ici que vous complétez votre commande: quantité, options (couleur, taille, etc.), adresse de livraison, mode de paiement. Vous voyez un récapitulatif en temps réel (prix total, frais de port). C'est l'étape finale avant validation.

- **URL**: Intégré comme drawer sur `/shop/product/[id]`
- **Acteurs**: Client connecté (redirection login si nécessaire)
- **Composants Principaux**:
  - **Header du drawer**: Titre "Passer la Commande", bouton fermer ✕
  - **Récapitulatif produit**: Image petit format, nom, prix unitaire
  - **Quantité**: Sélecteur (boutons +/-, ou input numérique)
  - **Options produit**: Couleur, taille, ou autres variants (si disponible)
  - **Adresse de livraison**: 
    - Adresses sauvegardées (dropdown)
    - Ou ajouter nouvelle adresse (formulaire inline)
    - Saisie: Rue, Code Postal, Gouvernorat, Ville
  - **Résumé des coûts**:
    - Prix produit
    - Frais de port (calculé en temps réel selon adresse)
    - Réduction appliquée (le cas échéant)
    - **Total TTC**
  - **Bouton**: "Confirmer la Commande" (CTA principal)
  - **Lien alternatif**: "Continuer le shopping" → ferme drawer
  
- **Fonctionnalités**:
  - Ajuster quantité (mise à jour prix total instantanément)
  - Sélectionner variantes (couleur, taille)
  - Choisir ou ajouter adresse de livraison
  - Choisir mode de livraison
  - Choisir mode de paiement
  - Voir total calculé en direct
  - Appliquer code promo (champ "Code de réduction")
  - Voir estimation livraison (J+1, J+2, etc.)
  - Confirmer commande → redirection vers paiement ou succès
  
- **Flux Post-Commande**:
  - **Si paiement ligne**: Redirection vers page paiement (Stripe)
  - **Si cash on delivery**: Commande confirmée immédiatement
  - Email de confirmation envoyé
  - Commande visible dans `/profile/orders`

- **Gestion des Erreurs**:
  - Stock insuffisant: Bloquer l'achat, proposer "Ajouter à la liste d'attente"
  - Adresse invalide: Message d'erreur, correction requise
  - Produit indisponible: Afficher message, proposer produits similaires

> **📱 Version Mobile (App Ro2ya)**  
> Le drawer s'ouvre en bas de l'écran (bottom sheet) plutôt que sur le côté. Le formulaire est optimisé avec inputs tactiles, une barre de défilement fluide, et un bouton CTA "Confirmer" fixé en bas. La validation en temps réel des données (adresse, téléphone) améliore l'expérience utilisateur.

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

**À quoi ça sert?** C'est le "command center" de votre boutique. Vous voyez d'un coup d'œil: combien de clients ont vu votre profil, combien vous avez reçu d'appels, vos réservations, vos ventes totales et votre revenu. C'est aussi d'ici que vous accédez à tous les outils pour gérer votre boutique (produits, promotions, stories, reels, etc.). Le tout dans une interface dark-mode élégante avec statistiques en temps réel.

- **URL**: `https://ro2ya.tn/dashboard/123`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:

  **Header (Top Bar)**:
  - Logo Ro2ya (coin haut-gauche)
  - Titre "Overview" avec dropdown sélecteur boutique "Restaurant El Bacha"
  - Barre de recherche: "Rechercher réservations, avis, clients..."
  - Icônes: Support, Notifications, Messages
  - Avatar vendeur (RE)

  **Sidebar Gauche (Navigation Menu)**:
  - 📊 **Overview** (actif - fond blanc)
  - 🏢 **Business Profile** - Gérer profil boutique
  - 📦 **Products & Promo** - Produits et promotions
  - 📹 **Discovery & Stories** - Reels et Stories
  - 👥 **Customer Actions** - Interactions clients (Leads, Réservations)
  - 💰 **Transactions** - Historique de paiements
  - 🧠 **Social Intelligence & Re...** - Analytics IA + Avis
  - 💬 **Support & Messages** - Support clients + Chat
  - 🔙 **back to marketplace** - Retour boutique publique

  **Contenu Principal (Dashboard Stats)**:
  - **Tabs de période**: Today | This Week | This Month
  - **6 Cards de Statistiques** (grille 3x2):
    1. 👁️ **Profile Views** - Nombre de fois où le profil a été vu (0)
    2. 📞 **Phone Clicks** - Clics sur le numéro de téléphone (0)
    3. 📍 **Direction Requests** - Demandes de directions (0)
    4. 🛒 **Reservations** - Nombre de réservations (0)
    5. 🛍️ **Purchases** - Nombre de commandes/achats (5)
    6. 💵 **Revenue Total** - Revenu total avec % croissance (35 with ↑ 12%)
  
  - **Graphiques**:
    - 📈 **Activity Trend** (left chart) - Tendance d'activité (courbe)
    - ⭐ **Rating Distribution** (right chart) - Distribution des notes (pie/bar chart)

  **Design**:
  - Mode sombre (dark navy background #1a1f3a approx)
  - Cards colorées avec icônes distinctives (cyan, teal, pink, purple)
  - Texte blanc/gris clair
  - Accent bleu sur "Customer Actions"
  - Spacing généreux, layout responsive

- **Fonctionnalités**:
  - Voir aperçu stats en temps réel
  - Filtrer par période (Today/Week/Month)
  - Naviguer vers sections spécialisées (sidebar)
  - Rechercher clients/réservations/avis
  - Voir tendances et distributions
  - Accéder à support/messages
  - Basculer vers boutique publique

> **📱 Version Mobile (App Ro2ya)**  
> Le Dashboard est optimisé avec un menu hamburger (≡) remplaçant la sidebar. Les 6 cartes se disposent en grille responsive (2 colonnes). Les graphiques se mettent à l'échelle. La barre de recherche reste accessible en haut. Navigation par tabs horizontals pour les périodes.

---

### 🏢 **Business Profile** `/dashboard/[id]/business-profile`

**À quoi ça sert?** Gérez toutes les informations de votre boutique: logo, nom, description, catégorie, téléphone, adresse, horaires d'ouverture, et galerie photos/vidéos. C'est la vitrine publique de votre entreprise.

- **URL**: `https://ro2ya.tn/dashboard/123/business-profile`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:

  **Section 1: Basic Information**
  - Business Logo (upload zone)
  - Business Name (champ texte)
  - Description (textarea large)
  - Category (dropdown)
  - Phone Number (champ texte)
  - Address (champ texte)

  **Section 2: Working Hours**
  - Tableau 7 jours (Monday-Sunday)
  - Checkbox "Closed" par jour
  - Time inputs: OPENS (heure) | CLOSES (heure)
  - Design: Chaque jour avec toggle fermé/ouvert

  **Section 3: Business Gallery**
  - Titre: "Business Gallery"
  - Sous-titre: "Upload images to showcase your establishment"
  - Zone glisser-déposer pour images
  - Bouton "+ Add Media"

- **Fonctionnalités**:
  - Modifier infos basiques
  - Gérer horaires (7 jours)
  - Toggle jour fermé/ouvert
  - Upload/gérer galerie photos
  - Voir aperçu
  - Sauvegarder changes

> **📱 Version Mobile (App Ro2ya)**  
> Formulaire optimisé avec sections scrollables. Horaires en card séparées. Upload photos avec préview.

---

### 3️⃣ **Mes Produits** `/dashboard/[id]/products`

**À quoi ça sert?** C'est ici que vous gérez votre inventaire. Vous voyez tous les produits que vous vendez avec images, prix et stock. Vous pouvez ajouter, modifier, supprimer ou créer avec l'IA en uploadant une photo!

- **URL**: `https://ro2ya.tn/dashboard/123/products`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:

  **Header**:
  - Titre: "Inventaire & Marketing"
  - Sous-titre: "Gérez vos annonces et optimisez vos ventes avec des promotions ciblées."
  - Bouton "🤖 AI Darija" (violet)
  - Bouton "+ Ajouter" (blanc/outline)

  **Grille de Produits**:
  - Chaque produit: Image (miniature bird jaune), Nom (Darija), Description (Darija), Prix "35 unit", Stock "Stock: 2 unités"
  - Oeil icon (voir)
  - Bouton "Modifier" (outline)
  - Bouton "Supprimer" (red text)

- **Fonctionnalités**:
  - Voir tous les produits en grille
  - Modifier produit
  - Supprimer produit
  - Voir produit public
  - Créer produit avec IA Darija
  - Ajouter nouveau produit (modal)

> **📱 Version Mobile (App Ro2ya)**  
> Grille responsive (2 colonnes). Modal pour ajouter produit avec upload image, nom, description, prix, stock.

---

---

### 4️⃣ **Ajouter/Éditer Produit** (Modal) `/dashboard/[id]/products/add`

**À quoi ça sert?** Formulaire modal pour créer ou modifier un produit. Remplissez nom, description, prix, stock, catégorie, et uploadez images/vidéos.

- **URL**: Modal sur `/dashboard/[id]/products`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - **Header**: "Ajouter une annonce" | "Modifier l'annonce"
  - **Tabs**: Produit (sélectionné) | Service
  - **Form Fields**:
    - Image principale (upload zone)
    - Galerie photos (+ button pour ajouter)
    - Vidéos / Reels (upload zone)
    - Nom * (input)
    - Description (textarea)
    - Prix (DT) * (input)
    - Stock (input)
    - Catégorie * (dropdown)
    - Checkbox: "Disponible à la vente" (coché)
  - **Boutons**: "Annuler" (outline) | "Créer" (white)

- **Fonctionnalités**:
  - Upload/organiser images
  - Remplir tous détails
  - Toggle disponibilité
  - Sauvegarder
  - Annuler

---

### 5️⃣ **Assistant IA Darija** (Modal) `/dashboard/[id]/products/ai-darija`

**À quoi ça sert?** Assistant IA dédié pour décrire votre produit en Darija (texte ou voix). L'IA génère descriptions attractives pour vos annonces.

- **URL**: Modal sur `/dashboard/[id]/products`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - **Header**: "Assistant IA — Darija" (icon violet)
  - **Subtitle**: "Décris ton produit en Darija — par texte ou par voix ✨"
  - **Mode Tabs**: "Texte" (sélectionné) | "Voix Darija"
  - **Input Section**: "TON PROMPT EN DARIJA"
    - Placeholder: "Exemple: zid produit jdid kasket noire b 25 DT..."
    - Exemple suggestions (tags): "zid produit jdid kasket noire b 25 DT", "n7eb nnd sabat nike blanc taille 42 b 1...", "3mel item jdid t-shirt rayé b 35 dinars"
  - **Bouton**: "Générer avec l'IA" (purple)
  - **Bouton**: "Fermer" (close X)

- **Fonctionnalités**:
  - Saisir prompt Darija (texte ou voix)
  - IA génère description
  - Suggestions contextuelles

---

### 6️⃣ **Marketing & Offres** `/dashboard/[id]/products/promotions`

**À quoi ça sert?** Gérez vos promotions pour booster vos ventes. Créez des offres spéciales avec réductions et dates.

- **URL**: `https://ro2ya.tn/dashboard/123/products/promotions`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - **Header**: "Marketing & Offres" (avec | orange)
  - **Subtitle**: "Boostez votre visibilité et fidélisez vos clients avec des campagnes percutantes."
  - **Boutons**: "🤖 AI Darija" | "+ Nouvelle Offre" (red)
  - **Onglets**: 🔴 "Actives (0)" | 📦 "À venir (1)" | ❄️ "Inactives (0)"
  - **Empty State** (si aucune): Icon gift, "Prêt à booster vos ventes?", "Créez votre première offre spéciale et attirez de nouveaux clients dès aujourd'hui.", Bouton "+ Lancer une campagne" (red)

- **Fonctionnalités**:
  - Créer nouvelle promotion
  - Voir promos actives/à venir/inactives
  - Générer avec IA

> **📱 Version Mobile (App Ro2ya)**  
> Onglets pour filtrer promotions. Modal pour créer offre.

---

### 7️⃣ **Nouvelle Offre Spéciale** (Modal) `/dashboard/[id]/promotions/new`

**À quoi ça sert?** Modal pour créer une nouvelle promotion avec titre, description, réduction%, dates et articles.

- **URL**: Modal sur `/dashboard/[id]/products/promotions`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - **Header**: "Nouvelle Offre Spéciale" (red text)
  - **Premium Badge**: "APERÇU PREMIUM" (avec icon spark)
    - Card preview: "VOTRE OFFRE ICI", "Une description qui donne envie...", Bouton "PROMO" (orange)
  - **Form Fields**:
    - Titre de l'offre * (input)
    - Description (textarea)
    - RÉDUCTION (%) (input)
    - TEXTE (EX: 1+1) (input)
    - Début (date picker)
    - Fin (date picker)
    - "Appliquer à tous les articles" (button)
    - Table: Articles applicables (liste produits avec prix)
  - **Boutons**: "Annuler" | "Lancer" (red)

- **Fonctionnalités**:
  - Créer offre avec titre, description, réduction
  - Définir dates début/fin
  - Appliquer à produits
  - Aperçu premium
  - Lancer campagne

---

---

### 1️⃣1️⃣ **Mes Reels** `/dashboard/[id]/reels`

**À quoi ça sert?** Créez et gérez vos vidéos courtes pour promouvoir votre boutique. Enregistrez ou importez des vidéos, publiez-les pour votre audience.

- **URL**: `https://ro2ya.tn/dashboard/123/reels`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - **Header**: "PUBLIER UN REEL" | "CONTENU LIVE"
  - **Subtitle**: "Partagez votre contenu avec votre audience."
  - **Bouton**: "+ Nouveau Contenu" (red)
  - **Tabs**: "Reels Discover" | "Stories Boutique" (cyan active)
  - **Stories Section**:
    - Vidéo miniature avec badge "Expiré"
    - Item shows status and expiry

- **Fonctionnalités**:
  - Enregistrer vidéo live (caméra)
  - Importer vidéo fichier
  - Remplir titre, description, prix, catégorie
  - Publier
  - Voir analytics

---

### 🔟 **Ajouter Reel** (Modal) `/dashboard/[id]/reels/add`

**À quoi ça sert?** Modal pour créer et publier un nouveau reel avec vidéo, titre, description.

- **URL**: Modal sur `/dashboard/[id]/reels`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - **Header**: "PUBLIER UN REEL"
  - **Subtitle**: "Partagez votre contenu avec votre audience."
  - **Video Upload**:
    - Zone avec icon upload
    - "Importer un fichier" (red button)
    - "MP4, JPG, PNG (MAX 50MB)"
    - OU "Caméra Live" (button avec camera icon)
  - **Form Fields**:
    - TITRE / LÉGENDE (textarea)
    - PRIX (DT) (input)
    - CATÉGORIE (dropdown)
  - **Bouton**: "Mettre en ligne" (red)

- **Fonctionnalités**:
  - Enregistrer ou importer vidéo
  - Ajouter titre et description
  - Définir prix
  - Sélectionner catégorie
  - Publier

---

---

### 9️⃣ **Mes Leads/Commandes** `/dashboard/[id]/leads`

**À quoi ça sert?** Toutes les demandes des clients (commandes et réservations). Voyez qui a commandé quoi, acceptez/refusez les demandes, et discutez avec les clients.

- **URL**: `https://ro2ya.tn/dashboard/123/leads`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - **Header**: "Actions clients & Leads"
  - **Subtitle**: "Suivez vos commandes et réservations en temps réel"
  - **3 Stats Cards**:
    - 🔗 "Total interactions" (3)
    - 🛒 "Commandes" (3)
    - 📅 "Réservations" (0)
  - **Filtres**:
    - Dropdown "Tout" (filtrer tous/commandes/réservations)
    - Buttons: "Plus récent" | "Plus ancien"
  - **Leads List**:
    - Icon (🛒 pour commande)
    - "Commande #15" | Client Name (ABDERRAHMEN EBDELLI)
    - Phone: "58730950"
    - "Montant: 35 DT"
    - Date "25 mai", Timestamp "21:23"
    - Badge "PENDING" (orange)
    - Buttons: "✓ ACCEPTER" (green) | "✕ REFUSER" (red) | "🚫 BLOQUER CLIENT"

- **Fonctionnalités**:
  - Voir tous les leads
  - Filtrer par type et date
  - Accepter/refuser demande
  - Bloquer client
  - Chatter avec client

---

### 🔟 **Transactions & Suivi** `/dashboard/[id]/transactions`

**À quoi ça sert?** Gestion complète des paiements et validations. Voyez revenu, commandes en attente, validations avec QR code.

- **URL**: `https://ro2ya.tn/dashboard/123/transactions`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - **Header**: "Transactions & Suivi"
  - **Subtitle**: "Gérez vos paiements et vos actions directes"
  - **Tabs**: "Liste Détaillée" (active) | "Mes Transactions"
  - **4 Stats Cards**:
    - 📊 "Transactions" (5 au total)
    - 💚 "Revenu Réel" (35 DT, 1 validées)
    - ⏳ "En attente" (280 DT, 3 à traiter)
    - 💰 "Commissions" (3,5 DT, Frais Ro2ya 10%)
  - **Filters** (row):
    - Type: "Tous les types" (dropdown)
    - Statut: "Tous les statuts" (dropdown)
    - Date: "jj/mm/aaaa" to "jj/mm/aaaa"
  - **Search**: "Rechercher par référence ou client..."
  - **Table Columns**: DATE | RÉFÉRENCE | TYPE | CLIENT | DÉTAILS | MONTANT | FRAUDE | STATUT
  - **Table Rows**: Exemple "ORD-726272-I0SP", Client "abderrahmen ebdelli", Montant "35 DT", Status "PENDING"
  - **Pagination**: "Affichage de 1-5 sur 5"

- **Fonctionnalités**:
  - Voir toutes transactions
  - Filtrer par type, statut, date
  - Rechercher par référence
  - Scanner QR client (validation)
  - Valider manuellement
  - Déclarer no-show
  - Voir statut fraude

> **Mise à jour de Transaction (Modal)**:
- Modal: "Mise à jour de la transaction"
- Section: "Confirmer la prestation"
- Message: "Demandez au client de vous montrer son code QR pour valider la prestation et garantir votre paiement."
- Buttons:
  - "Scanner le QR du Client" (white)
  - ✓ "Valider manuellement (Sans QR)" (avec OR)
- Section: "Déclarer un No-Show" (red)
  - Message: "Si le client ne s'est pas présenté, marquez la réservation comme échouée."
  - Button: "Déclarer comme échouée" (red)

---

### 1️⃣1️⃣ **Social Intelligence & Reviews** `/dashboard/[id]/intelligence`

**À quoi ça sert?** Votre intelligence sociale complète: gérez vos avis clients, analyser les commentaires sur vos reels, et recevez des recommandations IA personnalisées. Interface centralisée pour votre réputation et vos interactions.

- **URL**: `https://ro2ya.tn/dashboard/123/intelligence`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:

  **Header Global**:
  - Breadcrumb: "Intelligence"
  - Business Selector: "Restaurant El Bacha" (dropdown)
  - Barre de recherche: "Rechercher réservations, avis, clients..."
  - Support | Notifications | Messages | Avatar

  **Section Header du Contenu**:
  - Titre: "Social & Reviews ✨"
  - Sous-titre: "Gérez votre réputation et vos interactions clients."
  - Bouton "Actualiser" (refresh icon, coin haut-droit)

  **Tabs de Navigation** (4 onglets):
  - 🧠 **Analyses IA** (déprecié ou fusionné)
  - 👥 **Avis Clients (2)** (avec badge numéro d'avis)
  - 💬 **Comments Reels (0)** (avec badge numéro commentaires)
  - 🤖 **Conseiller IA**

---

#### **📊 ONGLET 1: Avis Clients (2)**

**À quoi ça sert?** Liste complète de tous les avis reçus. Voir les notes, commentaires, et répondre publiquement pour améliorer votre réputation.

**Composants**:

  **Layout: 2 Colonnes**:
  
  **Colonne Gauche (70%): Liste des Avis**
    - Chaque avis card:
      - Avatar circulaire avec initiale (couleur par utilisateur)
      - Nom client (ex: "Khairdin Dab")
      - 5 ⭐ (note)
      - Date (ex: "14 MAI 2026")
      - Texte avis (ex: "*test comment*")
      - Section "VOTRE RÉPONSE" (si répondu):
        - Badge blanc "VOTRE RÉPONSE"
        - Date de réponse (ex: "19 mai 2026")
        - Texte réponse du vendeur (ex: "kassah sahbi khayri")
    - Scroll vertical si plusieurs avis
  
  **Colonne Droite (30%): RÉSUMÉ DES AVIS**
    - Titre: "RÉSUMÉ DES AVIS"
    - Note moyenne: "4.5" (très grand texte)
    - Badge ⭐⭐⭐⭐⭐ (5 étoiles)
    - Sous-titre: "MOYENNE SUR 2 AVIS"
    - Distribution par note (barres horizontales):
      - 5* : [████████████] 1
      - 4* : [████████████] 1
      - 3* : [           ] 0
      - 2* : [           ] 0
      - 1* : [           ] 0

- **Fonctionnalités**:
  - Voir tous les avis avec notes ⭐
  - Voir commentaires clients en détail
  - Répondre publiquement aux avis
  - Voir résumé statistique (note moyenne, distribution)
  - Calculé automatiquement sur le nombre d'avis

---

#### **💬 ONGLET 2: Comments Reels (0)**

**À quoi ça sert?** Voir et gérer les commentaires sur vos vidéos Discover/Reels. Répondre directement pour engager l'audience.

**Composants**:

  **Empty State** (si 0 commentaires):
    - Icon: Video camera (grisé)
    - Titre: "Aucun commentaire Reel"
    - Sous-titre: "Les interactions sur vos vidéos Discover apparaîtront ici."
    - Message: Invitant à créer du contenu

  **Si données présentes**:
    - Liste commentaires par reel
    - Sentiment analysis (positif/neutre/négatif)
    - Bouton "Répondre" par commentaire
    - Historique interactions

- **Fonctionnalités**:
  - Voir tous les commentaires sur reels
  - Filtrer par sentiment (positif/neutre/négatif)
  - Répondre aux commentaires
  - Marquer commentaire comme signalé si problème
  - Voir nombre total interactions par video

---

#### **🤖 ONGLET 3: Conseiller IA**

**À quoi ça sert?** Recommandations IA intelligentes basées sur vos données de vente, vues, et interactions. L'IA génère des suggestions pour améliorer votre réputation et stratégie.

**Composants**:

  **Empty State** (si données insuffisantes):
    - Icon: Sparkles/Magic wand (grisé)
    - Titre: "PAS ENCORE DE CONSEILS"
    - Message: "L'IA a besoin de plus de données de vente ou de vues pour générer des recommandations stratégiques précises."
    - Bouton "Actualiser" (avec refresh icon)
    - Note: Apparaît jusqu'à avoir assez d'historique

  **Si données suffisantes (Contenu IA)**:
    - Titre: "RECOMMANDATIONS STRATÉGIQUES"
    - Liste de recommandations (cartes):
      1. Sujet/Catégorie de la recommandation
      2. Description détaillée (ex: "Ajouter des photos de produit XXX")
      3. Impact estimé (ex: "+15% chance de vente")
      4. Bouton "Appliquer" ou "En savoir plus"
    - Sections:
      - **📈 Pricing Optimization**: Suggérer prix optimal
      - **🎯 Best Times to Post**: Moments meilleurs pour publier
      - **💬 Response Suggestions**: Réponses suggérées aux avis
      - **🏆 Competitive Analysis**: Comparaison avec concurrents
      - **🔥 Trending Topics**: Sujets chauds à exploiter

- **Fonctionnalités**:
  - Voir recommandations personnalisées en temps réel
  - Filtrer recommandations par catégorie
  - Appliquer recommandations IA en 1 clic
  - Voir impact estimé de chaque suggestion
  - Rafraîchir pour obtenir nouvelles suggestions
  - Chat avec l'IA pour explications supplémentaires

---

### 📱 **Comportements & Interactions Globales** (Tous les Onglets)

- **Recherche & Filtres** (si applicable):
  - Recherche par nom client
  - Filtrer par note (1-5 ⭐)
  - Filtrer par date
  - Filtrer par sentiment

- **Actions Rapides**:
  - Répondre à avis/commentaire
  - Marquer comme utile (👍)
  - Signaler comme spam si nécessaire
  - Partager avis positif

- **Notifications**:
  - Nouvel avis reçu
  - Commentaire sur reel
  - Recommandation IA importante

> **📱 Version Mobile (App Ro2ya)**  
> Onglets swipables horizontalement. Colonne droite (résumé) passe en haut en mobile. Liste avis utilise card design optimisé. Buttons d'action sont larges et tactiles. Hauteur des éléments augmentée pour doigts. Empty states avec icons grands et lisibles.

---

### 1️⃣2️⃣ **Messages/Chat Vendeur** `/dashboard/[id]/messages`

**À quoi ça sert?** Les clients vous posent des questions avant d'acheter. Recevez tous leurs messages et répondez directement. Clarifiez les doutes, donnez plus de détails, et vendez en étant aimable!

- **URL**: `https://ro2ya.tn/dashboard/123/messages`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Sidebar: Listes conversations avec clients
  - Zone principale: Chat actif (conversation)
  - Historique messages avec timestamps
  - Champ de saisie pour répondre
  - Boutons: Partager lien produit, Archiver, Bloquer

- **Fonctionnalités**:
  - Voir toutes conversations
  - Répondre en temps réel
  - Partager lien produit
  - Archiver conversation
  - Bloquer client si besoin

---

### 1️⃣3️⃣ **Support & Messages** `/dashboard/[id]/support`

**À quoi ça sert?** Votre centre complet et unifié de support et messagerie. Une seule page pour: créer/gérer tickets support, communiquer avec l'équipe Ro2ya, et répondre aux messages des clients. Interface accessible via breadcrumb "Tickets" au top et contenant 2 vues principales togglables.

- **URL**: `https://ro2ya.tn/dashboard/123/support`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:

  **Header Global**:
  - Breadcrumb: "Tickets" (title)
  - Business Selector: "Restaurant El Bacha" (dropdown)
  - Barre de recherche globale: "Rechercher réservations, avis, clients..."
  - Support | Notifications | Messages | Avatar

  **Navigation Principal** (Tabs/Buttons):
  Deux vues accessibles depuis la même page:
  
  1️⃣ **"Support Tickets"** (Première Tab) → Gestion des tickets support
  2️⃣ **"Centre de Messagerie"** (Deuxième Tab, visible via bouton) → Chat & Conversations

---

#### **VUE 1: Support Tickets** (Vue Par Défaut)

**Composants**:

  **Section Header**:
  - Titre: "Support Tickets"
  - Sous-titre: "Historique et gestion des requêtes"
  - Bouton "+ Nouveau Ticket" (blanc, coin haut-droit)
  - Bouton "Aller au Centre de Messagerie" (outline, alternative nav)

  **4 Stats Cards** (grille 4 colonnes):
  - 🔴 **Tickets Ouverts**: 0 (EN ATTENTE D'ACTION)
  - 🟡 **En Cours**: 0 (ÉQUIPE ACTIVE)
  - 🟢 **Résolus**: 0 (PROBLÈMES RÉGLÉS)
  - 📊 **Efficacité**: 98% (SATISFACTION CLIENT)

  **Barre de Recherche + Filtres** (row):
  - Search: "Rechercher par ID, sujet, client ou téléphone..."
  - Dropdown: "Tous les statuts"
  - Dropdown: "Toutes les priorités"

  **Table de Tickets**:
  - Colonnes: TICKET ID | CUSTOMER CONTACT | SUBJECT | PRIORITY | STATUS | LAST UPDATE | ACTION
  - Rows: Vides ou avec données (scrollable)
  - Empty State: "Aucun ticket trouvé."
  - Pagination: Affichage X-Y sur Z

  **Design**:
  - Dark theme (navy background)
  - Cards colorées avec icons distinctifs
  - Tableau avec séparation claire des lignes

- **Fonctionnalités (Vue Support Tickets)**:
  - Créer nouveau ticket
  - Rechercher par ID, sujet, client, téléphone
  - Filtrer par statut et priorité
  - Voir détails ticket complets
  - Mettre à jour status ticket
  - Ajouter commentaires/notes
  - Marquer comme résolu

---

#### **VUE 2: Centre de Messagerie** (Tab Alternative)

**Composants**:

  **Section Header**:
  - Titre: "Centre de Messagerie"
  - Bouton "Support ROZYA" (blanc/outline, tab)
  - Bouton "Conversations Clients" (rouge/actif, tab)

  **Layout Split View** (Sidebar + Main):
  
  **Sidebar Gauche**:
    - Barre de recherche: "Chercher une discussion..."
    - Liste conversations:
      - Chaque item:
        - Avatar (icon coloré ou lettre initiale)
        - Titre: "Ticket Support" ou "Discussion Client"
        - Status: "STATUS: ..." (ex: "DIRECT CONVERSATION")
        - Timestamp dernier message
        - Indicateur non-lu si besoin
    - Empty State (si vide): 
      - Icon envelope
      - "AUCUN TICKET SUPPORT"

  **Contenu Principal (Droite)**:
    - Zone messages: Historique conversation scrollable
    - Empty State (aucune sélection): 
      - Icon chat bubbles
      - "OUVRIR UNE DISCUSSION"
    - Zone input (bottom):
      - Textarea pour répondre
      - Boutons: Envoyer | Attacher fichier
      - Caractères restants (si limite)

  **Onglet "Support ROZYA"** (Blanc/Outline):
    - Icon: Question mark bleu
    - Liste: Tous tickets support ouverts
    - Messages: Entre vendeur et Ro2ya Support Team
    - Status: En cours, Résolu, etc.

  **Onglet "Conversations Clients"** (Rouge/Actif par défaut):
    - Icon: Question mark rouge
    - Liste: Messages directs des clients
    - Type: "DIRECT CONVERSATION"
    - Messages: Entre vendeur et clients
    - Indicateur: Côté client

- **Fonctionnalités (Vue Centre de Messagerie)**:
  - Basculer entre Support ROZYA et Conversations Clients
  - Chercher conversation par keyword
  - Ouvrir/sélectionner conversation
  - Lire historique complet
  - Répondre instantanément
  - Attacher fichiers
  - Archiver conversation
  - Bloquer client si nécessaire (Conversations Clients)
  - Voir timestamps et status
  - Notification messages non-lus

- **Navigation Inter-Vues**:
  - Bouton "Support Tickets" dans Centre de Messagerie → Retour à Vue 1
  - Bouton "Centre de Messagerie" dans Support Tickets → Passage à Vue 2
  - Aussi accessible via sidebar menu principal

> **📱 Version Mobile (App Ro2ya)**  
> Page unique avec 2 tabs horizontaux swipables. Vue Support Tickets: Stats empilées verticalement, table simplifiée avec swipe pour actions. Vue Centre de Messagerie: Sidebar conversations peut swiper en overlay/drawer. Split view devient empilé (conversation list en haut, chat en bas). Input optimisé pour tactile.

---

### 1️⃣4️⃣ **Social & Avis Clients** `/dashboard/[id]/social`

**À quoi ça sert?** Voyez tous les avis reçus, répondez publiquement aux clients, suivez votre note moyenne et % d'avis positifs.

- **URL**: `https://ro2ya.tn/dashboard/123/social`
- **Acteurs**: Propriétaire de la boutique
- **Composants Principaux**:
  - Section "Avis clients"
  - Filtres: Note (⭐⭐⭐⭐⭐), Récent, Plus utile
  - Chaque avis: Auteur, Note, Texte, Bouton "Répondre"
  - Section "Réponses" (avis auxquels on a répondu)
  - Stats: Note moyenne, % positifs

- **Fonctionnalités**:
  - Voir tous les avis
  - Filtrer par note/date
  - Répondre publiquement
  - Voir statistiques
  - Éditer réponses

---

### 1️⃣5️⃣ **Paramètres Boutique** `/dashboard/[id]/settings`

**À quoi ça sert?** Gestion complète des paramétrages: profil, infos boutique, notifications, paiement, intégrations.

- **URL**: `https://ro2ya.tn/dashboard/123/settings`
- **Acteurs**: Propriétaire de la boutique
- **Onglets**:
  - **Profil** - Avatar, Bio, Téléphone, Email
  - **Boutique** - Nom, Description, Logo, Bannière, Localisation
  - **Notifications** - Email, SMS, Push preferences
  - **Paiement** - Compte bancaire, RIB, Devises
  - **Intégrations** - Social media, APIs

- **Fonctionnalités**:
  - Modifier toutes infos
  - Gérer notifications
  - Paramétrer paiement
  - Connecter intégrations
  - Voir facturation

> **📱 Version Mobile (App Ro2ya)**  
> Réglages en onglets scrollables. Chaque section avec préférences claires.

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

