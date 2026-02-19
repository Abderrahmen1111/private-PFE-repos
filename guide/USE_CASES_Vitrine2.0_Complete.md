# USE CASES DÉTAILLÉS - VITRINE 2.0
## Plateforme Next.js + Supabase

---

## 📋 LISTE DES USE CASES

### Module 1: Authentification (UC-AUTH)
- UC-AUTH-01: S'inscrire en tant que Client
- UC-AUTH-02: S'inscrire en tant que PRO (avec KYC)
- UC-AUTH-03: Se connecter
- UC-AUTH-04: Réinitialiser mot de passe
- UC-AUTH-05: Gérer son profil

### Module 2: Recherche & Découverte (UC-SEARCH)
- UC-SEARCH-01: Rechercher des produits (classique)
- UC-SEARCH-02: Rechercher avec IA sémantique
- UC-SEARCH-03: Rechercher par géolocalisation
- UC-SEARCH-04: Filtrer les résultats
- UC-SEARCH-05: Consulter une fiche produit

### Module 3: Commerces (UC-STORE)
- UC-STORE-01: Consulter une vitrine
- UC-STORE-02: Créer sa vitrine (PRO)
- UC-STORE-03: Gérer sa vitrine (PRO)
- UC-STORE-04: Valider un commerce (ADMIN)

### Module 4: Produits (UC-PRODUCT)
- UC-PRODUCT-01: Ajouter un produit (PRO)
- UC-PRODUCT-02: Modifier un produit (PRO)
- UC-PRODUCT-03: Gérer le stock (PRO)
- UC-PRODUCT-04: Supprimer un produit (PRO)

### Module 5: Commandes (UC-ORDER)
- UC-ORDER-01: Passer une commande (CLIENT)
- UC-ORDER-02: Gérer les commandes (PRO)
- UC-ORDER-03: Suivre une commande (CLIENT)
- UC-ORDER-04: Valider/Expédier une commande (PRO)

### Module 6: Avis (UC-REVIEW)
- UC-REVIEW-01: Laisser un avis (CLIENT)
- UC-REVIEW-02: Vérifier un avis avec QR Code
- UC-REVIEW-03: Analyser les avis avec IA (PRO)
- UC-REVIEW-04: Répondre à un avis (PRO)
- UC-REVIEW-05: Générer une réponse avec IA (PRO)

### Module 7: Administration (UC-ADMIN)
- UC-ADMIN-01: Valider KYC d'un commerce
- UC-ADMIN-02: Modérer les avis
- UC-ADMIN-03: Gérer les utilisateurs

---

## 📝 USE CASES DÉTAILLÉS

### UC-AUTH-01: S'inscrire en tant que Client

**Acteur principal:** Visiteur  
**Objectif:** Créer un compte client  
**Préconditions:** Aucune  
**Déclencheur:** L'utilisateur clique sur "S'inscrire"

**Scénario principal:**
1. Le système affiche le formulaire d'inscription
2. L'utilisateur saisit :
   - Email
   - Mot de passe (min 8 caractères)
   - Nom complet
   - Téléphone (optionnel)
   - Ville
3. L'utilisateur accepte les CGU
4. L'utilisateur clique sur "Créer mon compte"
5. Le système valide les données
6. Le système crée le compte avec role='CLIENT'
7. Le système envoie un email de vérification
8. Le système affiche un message de confirmation
9. Le système redirige vers la page de connexion

**Postconditions:**
- Compte client créé dans `users`
- Email de vérification envoyé
- L'utilisateur peut se connecter

**Scénarios alternatifs:**
- 5a. Email déjà utilisé → Message d'erreur
- 5b. Mot de passe trop faible → Message d'erreur
- 7a. Erreur envoi email → Compte créé, option "Renvoyer email"

**Fréquence:** 20-50 nouveaux clients/jour  
**Priorité:** CRITIQUE

---

### UC-AUTH-02: S'inscrire en tant que PRO (avec KYC)

**Acteur principal:** Visiteur commerçant  
**Objectif:** Créer un compte professionnel et soumettre ses documents  
**Préconditions:** Posséder un commerce/activité  
**Déclencheur:** Visiteur clique sur "Devenir Vendeur"

**Scénario principal:**
1. Le système affiche le formulaire PRO en 3 étapes

**ÉTAPE 1: Informations personnelles**
2. L'utilisateur saisit :
   - Email
   - Mot de passe
   - Nom complet
   - Téléphone (obligatoire pour PRO)
3. L'utilisateur clique sur "Suivant"

**ÉTAPE 2: Documents KYC**
4. Le système affiche les champs de documents
5. L'utilisateur upload :
   - Patente / Registre de commerce (PDF ou image)
   - Carte d'identité (recto-verso)
6. L'utilisateur clique sur "Suivant"

**ÉTAPE 3: Vérification**
7. Le système affiche un récapitulatif
8. L'utilisateur valide
9. Le système :
   - Crée le compte avec role='PRO'
   - Upload les documents dans `store-documents` bucket
   - Envoie email de confirmation
   - Notifie les admins pour validation
10. Le système affiche "Compte créé, en attente de validation"

**Postconditions:**
- Compte PRO créé avec status='PENDING'
- Documents uploadés dans Supabase Storage
- Notification envoyée aux admins

**Scénarios alternatifs:**
- 5a. Documents invalides (format) → Message d'erreur
- 5b. Fichiers trop lourds (>10MB) → Message d'erreur
- 9a. Erreur upload → Réessayer

**Fréquence:** 10-20 nouveaux PRO/jour  
**Priorité:** CRITIQUE

---

### UC-SEARCH-02: Rechercher avec IA sémantique

**Acteur principal:** Client/Visiteur  
**Objectif:** Trouver des produits par intention (langage naturel)  
**Préconditions:** Produits avec embeddings générés  
**Déclencheur:** Utilisateur tape une requête complexe

**Scénario principal:**
1. L'utilisateur se rend sur la page de recherche
2. Le système affiche la barre "Recherche IA"
3. L'utilisateur saisit une requête en langage naturel
   - Exemple: "Je cherche un cadeau pour un enfant de 5 ans"
4. L'utilisateur clique sur "Recherche IA" (icône ✨)
5. Le système affiche un spinner
6. Le système appelle l'API route `/api/ai/semantic-search`
7. L'API route :
   - Génère l'embedding de la requête (OpenAI)
   - Appelle la fonction SQL `search_products_semantic()`
   - Récupère les produits similaires (pgvector)
8. Le système affiche les résultats par ordre de pertinence
9. Le système affiche le score de similarité (optionnel)
10. L'utilisateur clique sur un produit pour voir les détails

**Postconditions:**
- Résultats affichés (0-50 produits)
- Résultats triés par pertinence sémantique

**Scénarios alternatifs:**
- 6a. Erreur API OpenAI → Fallback sur recherche classique
- 8a. Aucun résultat → Suggestion de recherche alternative
- 8b. Résultats peu pertinents → Afficher "Essayez une autre requête"

**Règles métier:**
- Seuil de similarité : 0.7 (70%)
- Nombre max de résultats : 50
- Timeout : 5 secondes max
- Coût : ~0.0001$ par recherche (OpenAI)

**Fréquence:** 100-200 recherches IA/jour  
**Priorité:** ÉLEVÉE

---

### UC-ORDER-01: Passer une commande (Low-Tech)

**Acteur principal:** Client authentifié  
**Objectif:** Commander un produit sans paiement en ligne  
**Préconditions:**
- Utilisateur connecté
- Produit disponible
**Déclencheur:** Client clique sur "Commander"

**Scénario principal:**
1. Le client consulte une fiche produit
2. Le système affiche le bouton "Commander"
3. Le client clique sur "Commander"
4. Le système affiche un formulaire modal avec :
   - Quantité (avec sélecteur)
   - Prix unitaire (pré-rempli)
   - Prix total (calculé automatiquement)
   - Nom complet (pré-rempli depuis profil)
   - Téléphone (pré-rempli)
   - Email (pré-rempli)
   - Adresse de livraison (textarea)
   - Notes optionnelles
5. Le client remplit/vérifie les informations
6. Le client clique sur "Confirmer la commande"
7. Le système valide les données
8. Le système crée la commande :
   - Génère un order_number unique
   - Status = 'PENDING'
   - Enregistre dans la table `orders`
9. Le système envoie :
   - Email au client (confirmation)
   - Notification au vendeur (nouvelle commande)
10. Le système affiche "Commande envoyée ! Le vendeur va vous contacter"
11. Le système redirige vers "Mes commandes"

**Postconditions:**
- Commande créée en BDD
- Emails envoyés
- Stock produit NON décrémenté (Low-Tech)

**Scénarios alternatifs:**
- 3a. Produit en rupture → Message "Produit non disponible"
- 7a. Téléphone invalide → Message d'erreur
- 7b. Adresse manquante → Message d'erreur
- 8a. Erreur BDD → "Erreur technique, réessayez"

**Règles métier:**
- Pas de paiement en ligne
- Pas de panier (commande directe)
- Pas de gestion automatique du stock
- Contact vendeur/client en dehors de la plateforme

**Fréquence:** 50-100 commandes/jour  
**Priorité:** CRITIQUE

---

### UC-REVIEW-01: Laisser un avis

**Acteur principal:** Client authentifié  
**Objectif:** Partager son expérience sur un produit/commerce  
**Préconditions:**
- Utilisateur connecté
- Avoir passé une commande (optionnel pour vérification)
**Déclencheur:** Client clique sur "Laisser un avis"

**Scénario principal:**
1. Le client consulte une page produit/commerce
2. Le système affiche le bouton "Laisser un avis"
3. Le client clique sur "Laisser un avis"
4. Le système affiche un formulaire modal :
   - Note (1-5 étoiles) - obligatoire
   - Titre de l'avis (optionnel)
   - Commentaire (textarea) - obligatoire
   - Upload photos (max 2) - optionnel
5. Le client remplit le formulaire
6. Le client clique sur "Publier l'avis"
7. Le système valide les données
8. Le système :
   - Crée l'avis dans `reviews`
   - Génère un QR token unique
   - Upload les images dans `review-images` bucket
   - Si order_id fourni → is_verified = TRUE
9. Le système appelle Edge Function `analyze-sentiment`
10. L'Edge Function :
    - Analyse le sentiment avec Gemini API
    - Met à jour `sentiment_score` et `sentiment_label`
    - Si sentiment NEGATIVE → Génère suggestion réponse vendeur
11. Le système affiche "Avis publié !"
12. Le système met à jour les stats du store
13. Le système envoie notification au vendeur

**Postconditions:**
- Avis créé et visible publiquement
- Sentiment analysé par IA
- Stats store mises à jour
- Vendeur notifié

**Scénarios alternatifs:**
- 7a. Commentaire vide → Message d'erreur
- 8a. Erreur upload images → Avis créé sans images
- 9a. Erreur API IA → Avis créé, sentiment analysé plus tard
- 11a. Avis spam détecté → Envoyé en modération

**Règles métier:**
- 1 avis par commande max
- Badge "Achat vérifié" si order_id présent
- Modération automatique avec IA
- Impossibilité de modifier après 24h

**Fréquence:** 30-50 avis/jour  
**Priorité:** ÉLEVÉE

---

### UC-REVIEW-02: Vérifier un avis avec QR Code

**Acteur principal:** Client (achat en magasin physique)  
**Objectif:** Vérifier son avis après achat en magasin  
**Préconditions:**
- Avoir effectué un achat en magasin
- Vendeur a fourni un QR Code
**Déclencheur:** Client scanne le QR Code

**Scénario principal:**
1. Le vendeur génère un QR Code unique pour la transaction
2. Le vendeur imprime/affiche le QR Code au client
3. Le client scanne le QR Code avec son smartphone
4. Le QR Code contient l'URL : `https://vitrine2.tn/verify-review/{qr_token}`
5. Le système ouvre la page de vérification
6. Le système vérifie le token dans la table `reviews`
7. Le système affiche les infos de l'avis :
   - Nom du commerce
   - Date
   - Statut de vérification
8. Le système propose :
   - "Confirmer cet avis comme vérifié"
   - OU "Laisser un nouvel avis vérifié"
9. Le client clique sur "Confirmer"
10. Le système met à jour l'avis :
    - is_verified = TRUE
    - qr_scanned_at = NOW()
11. Le système affiche "✓ Avis vérifié avec succès"

**Postconditions:**
- Avis marqué comme vérifié
- Badge "Achat vérifié ✓" visible publiquement

**Scénarios alternatifs:**
- 6a. Token invalide → "QR Code invalide ou expiré"
- 6b. Token déjà utilisé → "Ce QR Code a déjà été utilisé"
- 8a. Client choisit "Nouvel avis" → Redirection vers formulaire

**Règles métier:**
- 1 QR Code = 1 vérification unique
- Expiration du QR : 30 jours
- Seul l'auteur de l'avis peut le vérifier

**Fréquence:** 10-20 vérifications/jour  
**Priorité:** MOYENNE

---

### UC-PRODUCT-01: Ajouter un produit (PRO)

**Acteur principal:** Business Owner (PRO)  
**Objectif:** Ajouter un nouveau produit à sa vitrine  
**Préconditions:**
- Utilisateur connecté avec role='PRO'
- Commerce validé (status='ACTIVE')
**Déclencheur:** PRO clique sur "Ajouter un produit"

**Scénario principal:**
1. Le PRO accède à son dashboard
2. Le PRO clique sur "Produits" → "Ajouter un produit"
3. Le système affiche un formulaire :

**Section 1: Informations de base**
   - Nom du produit* (text)
   - Description* (textarea, rich text)
   - Prix* (number, TND)

**Section 2: Stock**
   - Quantité en stock (number)
   - Statut (select: Disponible / Rupture / Sur commande)

**Section 3: Images**
   - Image principale* (file upload)
   - Image 2 (optionnel)
   - Image 3 (optionnel)

4. Le PRO remplit le formulaire
5. Le PRO upload les images
6. Le PRO clique sur "Publier le produit"
7. Le système valide les données
8. Le système :
   - Upload les images vers Supabase Storage (`product-images/{store_id}/{filename}`)
   - Génère le slug depuis le nom
   - Crée le produit dans `products`
   - Génère l'embedding pour recherche IA (async)
9. Le système affiche "✓ Produit créé avec succès"
10. Le système redirige vers la liste des produits

**Postconditions:**
- Produit créé et visible
- Images uploadées dans Storage
- Embedding généré (peut prendre quelques secondes)

**Scénarios alternatifs:**
- 7a. Nom vide → "Le nom est obligatoire"
- 7b. Prix invalide → "Le prix doit être supérieur à 0"
- 8a. Erreur upload image → Réessayer
- 8b. Image trop lourde (>5MB) → "Image trop volumineuse"
- 9a. Erreur génération embedding → Produit créé, embedding généré plus tard

**Règles métier:**
- Max 3 images par produit
- Formats acceptés : JPEG, PNG, WEBP
- Taille max : 5MB par image
- Prix en TND avec 3 décimales
- Stock géré manuellement

**Fréquence:** 100-200 nouveaux produits/jour  
**Priorité:** CRITIQUE

---

### UC-ADMIN-01: Valider KYC d'un commerce

**Acteur principal:** Administrateur  
**Objectif:** Valider ou rejeter l'inscription d'un commerce  
**Préconditions:**
- Utilisateur connecté avec role='ADMIN'
- Commerce en attente (status='PENDING')
**Déclencheur:** Admin clique sur "Commerces en attente"

**Scénario principal:**
1. L'admin accède au dashboard admin
2. L'admin clique sur "Validation KYC"
3. Le système affiche la liste des commerces PENDING
4. L'admin clique sur un commerce
5. Le système affiche :
   - Informations du commerce
   - Nom du propriétaire
   - Documents uploadés (patente, CIN)
   - Viewer de documents (PDF/Image)
6. L'admin examine les documents :
   - Vérifie l'authenticité
   - Vérifie la cohérence des informations
7. L'admin clique sur "Valider" ou "Rejeter"

**Si VALIDATION:**
8a. Le système affiche un modal de confirmation
9a. L'admin confirme
10a. Le système :
    - Met à jour status = 'ACTIVE'
    - verified_at = NOW()
    - Envoie email au PRO : "✓ Commerce validé !"
    - Active la visibilité des produits
11a. Le système affiche "Commerce validé avec succès"

**Si REJET:**
8b. Le système affiche un modal avec champ "Raison du rejet"
9b. L'admin saisit la raison
10b. Le système :
    - Met à jour status = 'REJECTED'
    - verification_notes = raison saisie
    - Envoie email au PRO avec la raison
11b. Le système affiche "Commerce rejeté"

**Postconditions:**
- Commerce validé ou rejeté
- Email envoyé au PRO
- Si validé : produits visibles publiquement

**Scénarios alternatifs:**
- 5a. Documents manquants → Bouton "Demander documents"
- 5b. Documents illisibles → Bouton "Demander de nouveaux documents"
- 10a. Erreur envoi email → Commerce validé mais email en échec

**Règles métier:**
- Délai de validation : 24-48h max
- 1 validation par admin (pas de double validation)
- Historique des validations conservé
- Possibilité de réactiver un commerce rejeté

**Fréquence:** 10-20 validations/jour  
**Priorité:** ÉLEVÉE

---

## 📊 MATRICE DES USE CASES

| ID | Use Case | Acteur | Fréquence/jour | Priorité |
|----|----------|--------|---------------|----------|
| UC-AUTH-01 | Inscription Client | Visiteur | 20-50 | CRITIQUE |
| UC-AUTH-02 | Inscription PRO + KYC | Visiteur | 10-20 | CRITIQUE |
| UC-AUTH-03 | Connexion | Tous | 200-500 | CRITIQUE |
| UC-SEARCH-01 | Recherche classique | Tous | 500-1000 | CRITIQUE |
| UC-SEARCH-02 | Recherche IA | Tous | 100-200 | ÉLEVÉE |
| UC-SEARCH-03 | Recherche géo | Tous | 200-400 | ÉLEVÉE |
| UC-PRODUCT-01 | Ajouter produit | PRO | 100-200 | CRITIQUE |
| UC-ORDER-01 | Passer commande | Client | 50-100 | CRITIQUE |
| UC-REVIEW-01 | Laisser avis | Client | 30-50 | ÉLEVÉE |
| UC-REVIEW-02 | Vérifier QR | Client | 10-20 | MOYENNE |
| UC-REVIEW-03 | Analyser avis IA | PRO | 30-50 | ÉLEVÉE |
| UC-REVIEW-04 | Répondre avis | PRO | 20-40 | ÉLEVÉE |
| UC-ADMIN-01 | Valider KYC | Admin | 10-20 | ÉLEVÉE |

**Total estimé : ~1500-3000 interactions/jour**

---

## 🎯 PRIORISATION DÉVELOPPEMENT

### Phase 1 - MVP (Mois 1-2)
**Use Cases CRITIQUES:**
- UC-AUTH-01, 02, 03 (Authentification complète)
- UC-SEARCH-01 (Recherche classique)
- UC-PRODUCT-01 (Ajouter produits)
- UC-ORDER-01 (Commandes Low-Tech)
- UC-ADMIN-01 (Validation KYC)

**Livrables:** Plateforme fonctionnelle de base

### Phase 2 - IA (Mois 3)
**Use Cases ÉLEVÉE:**
- UC-SEARCH-02 (Recherche sémantique IA)
- UC-REVIEW-01, 03, 04 (Avis + Analyse IA)
- UC-SEARCH-03 (Géolocalisation)

**Livrables:** Différenciation IA

### Phase 3 - Optimisations (Mois 4+)
**Use Cases MOYENNE:**
- UC-REVIEW-02 (QR Code vérification)
- Analytics avancés
- Notifications push
- App mobile

---

Suite dans le fichier suivant avec les diagrammes de séquence...
