# 🎯 DIAGRAMMES DE SÉQUENCE RÉDESSINÉS - PLATEFORME RO2YA

## Structure Standardisée

### Légende des Symboles
- **→** : Appel/Requête  
- **← ou ··→** : Réponse/Retour  
- **✅** : Succès / Action validée  
- **❌** : Erreur / Validation échouée  
- **🔔** : Notification/Événement  

---

## 1️⃣ INSCRIPTION (SIGNUP)

### Diagramme de Séquence
```
Utilisateur → Application → Rate Limiter → Auth (Supabase) → Email
    |              |              |              |            |
    | Remplit form |              |              |            |
    |→------------>|              |              |            |
    |              | Vérif 3 req/h|              |            |
    |              |→------------>|              |            |
    |              |              | ❌ 429 error|            |
    |              |←------------|              |            |
    |              | ❌ Trop de  |              |            |
    |←------------|              |              |            |
    |              | ✅ Autorisé |              |            |
    |              |←------------|              |            |
    |              | email+pwd   |              |            |
    |              |------------>|              |            |
    |              |             |signUp()    |            |
    |              |             |----------->|            |
    |              |             |            | Crée user  |
    |              |             |            |            |
    |              |             |            | Email conf |
    |              |             |            |───────────>|
    |              |             |←-----------|            |
    |              |←------------|{ user.id } |            |
    | ✅ Confirmer |←------------|            |            |
    |←------------|              |            |            |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Utilisateur | Saisit email, mot de passe, rôle | Formulaire complété |
| 2 | Application | Vérifie limite de taux (3 inscriptions/heure/IP) | Autorisé ou 429 |
| 3 | Auth | Crée utilisateur dans auth.users | user.id généré |
| 4 | Email | Envoie lien de confirmation | Confirmation pending |
| 5 | Utilisateur | Confirme email | Compte activé |

### Cas d'Erreur
- ❌ **429 Too Many Requests**: Trop d'inscriptions depuis cette IP
- ❌ **Email déjà utilisé**: Utilisateur existant
- ❌ **Validation email**: Lien expiré après 24h

---

## 2️⃣ CONNEXION (LOGIN)

### Diagramme de Séquence
```
Utilisateur → Application → Redis (Rate Limit) → Auth → PostgreSQL
    |              |              |               |          |
    | Email+pwd   |              |               |          |
    |→----------->|              |               |          |
    |             | Check 5 req  |               |          |
    |             | /15 min/IP   |               |          |
    |             |→------------>|               |          |
    |             | ❌ Bloqué    |               |          |
    |             |←------------|               |          |
    |❌ Compte    |←------------|               |          |
    |<-blocked---|              |               |          |
    |             | ✅ Autorisé |               |          |
    |             |←------------|               |          |
    |             | supabase.auth |              |          |
    |             | .signInWithPassword()        |          |
    |             |───────────────────────────-->|          |
    |             |                |crée session|          |
    |             |                |────────────|          |
    |             |                |←─────────--|          |
    |             |{access_token}  |            |          |
    |             |←───────────────|            |          |
    | ✅ user.id |←------------|               |          |
    |<---------token---|              |          |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Utilisateur | Saisit email + mot de passe | Form submitted |
| 2 | Rate Limiter | Vérifie tentatives (5 max / 15 min) | Allowed or Blocked |
| 3 | Auth | supabase.auth.signInWithPassword() | Session créée |
| 4 | Supabase | Génère access_token + refresh_token | Tokens retournés |
| 5 | App | Stocke tokens (localStorage/cookie) | User logged in |

### Cas d'Erreur
- ❌ **429 Bloqué**: Trop de tentatives
- ❌ **Email/password incorrect**: Auth error
- ❌ **Email non confirmé**: Redirection vers confirmation

---

## 3️⃣ RÉCUPÉRATION DU MOT DE PASSE

### Diagramme de Séquence
```
Utilisateur → Application → Auth → Email Service → Utilisateur
    |              |          |          |              |
    | Mot de pass  |          |          |              |
    | oublié?      |          |          |              |
    |→----------->|          |          |              |
    |             | resetPassword|      |              |
    |             | ForEmail()  |       |              |
    |             |──────────>|          |              |
    |             |           | Génère  |              |
    |             |           | OTP link|              |
    |             |           |──────────────────────>|
    |             |           |                 📧 Email|
    |             |           |              reçu    |
    |             |           |←────────────────────|
    | ✅ Email    |           |                      |
    | reçu        |←---------|                      |
    |<-----------|           |                      |
    |             |          |                      |
    | Clique lien |          |                      |
    |─────────────|──────────>|                      |
    |             | Vérifier |                      |
    |             | session  |                      |
    |             | Nouveau  |                      |
    |             | password |                      |
    |             |──────────>|                      |
    |             |           | UPDATE user |          |
    | ✅ Redir    |←---------| password     |          |
    | /login      |<-----------|                      |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Utilisateur | Clique "Mot de passe oublié" | Form email |
| 2 | App | supabase.auth.resetPasswordForEmail() | OTP généré |
| 3 | Email | Envoie lien réinitialisation | Email envoyé |
| 4 | Utilisateur | Clique lien + nouveau password | Form submit |
| 5 | Auth | Met à jour password | ✅ Success redirect |

---

## 4️⃣ CRÉATION D'UN ÉTABLISSEMENT (COMMERÇANT)

### Diagramme de Séquence
```
Commerçant → Dashboard → Storage (Cloudinary) → PostgreSQL → Admin
    |              |              |                  |        |
    | Form: nom    |              |                  |        |
    | catégorie    |              |                  |        |
    | adresse, GPS |              |                  |        |
    | RNE...       |→----------->|                  |        |
    |              |              |                  |        |
    | Upload docs  |→----------->|                  |        |
    | (licence CIN)|              | Stocke fichiers |        |
    |              |              |←-------->|        |
    |              |              | URLs pub |        |
    |              |←─────────────|        |        |
    |              |              |        |        |
    |              | INSERT INTO stores|          |
    |              |───────────────────────────>|
    |              |              |        | store.id |
    |              |              |        |<---------|
    | ✅ Boutique  |              |        |        |
    | créée        |←─────────────────────────|        |
    |<------------|              |        | ➡️ En attente|
    |              |              |        | de validation|
    |              |              |        | Admin      |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Remplit formulaire complet | Form data collected |
| 2 | Pro | Upload logo + bannière + docs | Files attached |
| 3 | Storage | Stocke fichiers sur CDN | URL publique générée |
| 4 | PostgreSQL | INSERT INTO stores | store.id créé |
| 5 | App | Affiche confirmation | Status: PENDING |

### Validation
- Vérifier: Logo + Bannière requis
- Vérifier: Documents légaux (RNE, CIN, Licence)
- Status initial: **PENDING** (attente validation admin)

---

## 5️⃣ APPROBATION D'UNE BOUTIQUE PAR L'ADMIN

### Diagramme de Séquence
```
Admin → SaaS Dashboard → API → PostgreSQL → Notifications → Commerçant
  |            |           |         |            |             |
  | Accès       |           |         |            |             |
  | /dashboard/ |           |         |            |             |
  | pending     |           |         |            |             |
  |→----------→|           |         |            |             |
  |             | GET       |         |            |             |
  |             | /api/busi-|         |            |             |
  |             | nesses?   |         |            |             |
  |             | status=   |         |            |             |
  |             | PENDING   |         |            |             |
  |             |──────────→|         |            |             |
  |             |           | SELECT  |            |             |
  |             |           | FROM    |            |             |
  |             |           | stores  |            |             |
  |             |           |────────→|            |             |
  |             |           |← [list] |            |             |
  |             |←──────────|         |            |             |
  | Examine     |←─────────|         |            |             |
  | documents   |         |          |             |             |
  |             |         |          |             |             |
  | Clique      |         |          |             |             |
  | "Approuver" |         |          |             |             |
  |→──────────→|         |          |             |             |
  |             | API POST |         |            |             |
  |             | /approve |         |            |             |
  |             |─────────→|         |            |             |
  |             |          | UPDATE  |            |             |
  |             |          | status= |            |             |
  |             |          | APPROVED|            |             |
  |             |          |────────→|            |             |
  |             |          |       ✅ |            |             |
  |             |          |← OK   |             |             |
  |             |          |       | INSERT INTO |             |
  |             |          |       | notification|             |
  |             |          |       |────────────→|             |
  |             |          |       |             | Email + 🔔  |
  |             |          |       |             |────────────→|
  | ✅ Approuvé |←────────────────|             | ✅ Shop live|
  |←─────────→|           |         |            |←────────────|
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Admin | Accès /dashboard/pending-stores | Liste PENDING |
| 2 | API | SELECT * FROM stores status=PENDING | Liste retournée |
| 3 | Admin | Examine documents + Valide | Décision prise |
| 4 | API | UPDATE stores SET status=APPROVED | Status changé |
| 5 | Notif | INSERT INTO notifications | Email + In-app notif |
| 6 | Pro | Reçoit notification | ✅ Boutique approuvée |

---

## 6️⃣ CRÉATION D'UNE COMMANDE (CLIENT)

### Diagramme de Séquence
```
Client → Web/App → Auth → PostgreSQL → Panier
  |         |        |          |        |
  | Clique  |        |          |        |
  | Commander|        |         |        |
  |→────────→|        |         |        |
  |         | Vérifie|         |        |
  |         | session|         |        |
  |         |─────────→|        |        |
  |         |         | ✅ OK  |        |
  |         |←────────|        |        |
  |         |         |        | Vérif:  |
  |         |         |        | - Stock|
  |         |         |        | - Prix |
  |         |         |        | - Dispo|
  |         |         |←──────→|        |
  |         |         | ✅ OK |        |
  |         |────────────────→|
  |         | INSERT INTO    |
  |         | orders (PENDING)|
  |         |        |← ord.id |
  | ✅ Ajout|        |        |
  | panier  |←─────────────────|
  |←────────|        |        |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Client | Clique "Commander" produit | Cart submit |
| 2 | Auth | Vérifie session utilisateur | User ID récupéré |
| 3 | DB | Vérife stock + prix + dispo | ✅ Disponible |
| 4 | DB | INSERT INTO orders | order.id créé |
| 5 | App | Affiche confirmation | Item en panier |

### Cas d'Erreur
- ❌ **Pas de session**: Redirection /login
- ❌ **Stock épuisé**: "Produit indisponible"
- ❌ **Prix changé**: Recharger prix actuel

---

## 7️⃣ VALIDATION COMMANDE & QR CODE

### Diagramme de Séquence
```
Commerçant → Dashboard → PostgreSQL → QR Generator → Notifications
    |              |            |            |              |
    | Consulte     |            |            |              |
    | commandes    |            |            |              |
    | PENDING      |            |            |              |
    |→──────────→|            |            |              |
    |             | SELECT     |            |              |
    |             | FROM orders|            |              |
    |             | status=    |            |              |
    |             | PENDING    |            |              |
    |             |────────────→|            |              |
    |             |            | [commandes]|              |
    |             |←───────────|            |              |
    | Affiche     |←─────────|            |              |
    | liste       |         |              |              |
    |             |         |              |              |
    | Clique      |         |              |              |
    | "Valider"   |         |              |              |
    |→──────────→|         |              |              |
    |             | Générer  |              |              |
    |             | QR code  |              |              |
    |             |──────────────────────→|              |
    |             |          |            | QR-{ts}-{rnd}|
    |             |←────────────────────|              |
    |             | UPDATE    |            |              |
    |             | status=   |            |              |
    |             | VALIDATED |            |              |
    |             | + QR code |            |              |
    |             |────────────→|            |              |
    |             |            | ✅ OK    |              |
    |             |            |          | Notif client|
    |             |            |          |─────────────→|
    | ✅ Validée |←────────────────────────────────────|
    |←──────────|             |           |              |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Consulte liste PENDING | Affichage commandes |
| 2 | DB | SELECT * FROM orders PENDING | Liste retournée |
| 3 | Pro | Clique "Valider" | Validation initiated |
| 4 | QR Gen | Génère QR-{timestamp}-{random} | QR code créé |
| 5 | DB | UPDATE status=VALIDATED | Stock décrémenté |
| 6 | Notif | Envoie QR au client | Client reçoit QR |

---

## 8️⃣ SCAN QR CODE À LA LIVRAISON

### Diagramme de Séquence
```
Client → Commerçant → App Mobile → PostgreSQL → Notifications
  |          |             |              |           |
  | Présente |             |              |           |
  | QR Code  |             |              |           |
  |─────────→|             |              |           |
  |          | Scanne QR   |              |           |
  |          |    ou       |              |           |
  |          | Saisit code |              |           |
  |          |────────────→|              |           |
  |          |             | SELECT *     |           |
  |          |             | FROM orders  |           |
  |          |             | WHERE tracking|          |
  |          |             | _code=QR     |           |
  |          |             |─────────────→|           |
  |          |             |             | ❌ Not found|
  |          |             |←────────────|           |
  |          |             | Error       |           |
  |          |←────────────| "Invalid QR"|           |
  |          | ❌ Invalide |             |           |
  |          |             |             |           |
  |          | [Rescan]    |             |           |
  |          |────────────→|             |           |
  |          |             | ✅ Found    |           |
  |          |             |←────────────|           |
  |          |← Details    |             |           |
  |          | Montant,    |             |           |
  |          | Items...    |             |           |
  |          |             |             |           |
  | Confirme |             |             |           |
  | livraison|             |             |           |
  |─────────→| Confirme    |             |           |
  |          |────────────→|             |           |
  |          |             | UPDATE      |           |
  |          |             | status=     |           |
  |          |             | COMPLETED   |           |
  |          |             |─────────────→|           |
  |          |             |            | Notif client|
  |          |             |            |────────────→|
  | ✅ Livré |←────────────────────────|           |
  |←────────|             |            |           |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Client | Présente QR code | Verification ready |
| 2 | Pro | Scanne/Saisit QR | QR submitted |
| 3 | DB | SELECT WHERE tracking_code | Lookup result |
| 4 | DB | ❌ ou ✅ Validity check | Valid/Invalid |
| 5 | Pro | Confirme livraison | Status: COMPLETED |
| 6 | Notif | Notifie client | Transaction complétée |

---

## 9️⃣ ANNULATION D'UNE COMMANDE

### Diagramme de Séquence
```
Client/Pro → Application → PostgreSQL → Stock → Notifications
    |            |             |          |         |
    | Clique     |             |          |         |
    | "Annuler"  |             |          |         |
    |───────────→|             |          |         |
    |            | SELECT      |          |         |
    |            | status FROM |          |         |
    |            | orders      |          |         |
    |            |────────────→|          |         |
    |            |            | status=? |         |
    |            |←───────────|          |         |
    |            | ❌ COMPLETED|          |         |
    |❌ Impossible|←────────────|          |         |
    |<───────────| annuler     |          |         |
    |            | commandelivrée|        |        |
    |            |             |          |         |
    |            | ✅ PENDING  |          |         |
    |            | ou VALIDATED|          |         |
    |            |←───────────|          |         |
    |            | UPDATE      |          |         |
    |            | status=     |          |         |
    |            | CANCELLED   |          |         |
    |            |────────────→|          |         |
    |            |            | UPDATE    |         |
    |            |            | stock_qty+|         |
    |            |            | quantity  |         |
    |            |            |──────────→|         |
    |            |            |          | ✅ Stock|
    |            |            |←─────────| restored|
    |            |            |          | Notif   |
    |            |            |          |────────→|
    | ✅ Annulée |←────────────────────────────────|
    |<───────────|             |          |         |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | User | Clique "Annuler" | Cancel request |
| 2 | DB | SELECT status | Current status |
| 3 | Check | Status = COMPLETED? | ❌ Can't cancel |
| 4 | Check | Status = PENDING/VALID? | ✅ Can cancel |
| 5 | DB | UPDATE status=CANCELLED | Status changed |
| 6 | Stock | Restaure quantité | Stock qty+1 |
| 7 | Notif | Notifie les deux parties | Confirmation |

---

## 🔟 RÉSERVATION D'UN SERVICE (CLIENT)

### Diagramme de Séquence
```
Client → App → Calendar/Schedule → PostgreSQL → Notifications → Pro
  |       |           |                 |            |          |
  | Choix |           |                 |            |          |
  | service|          |                 |            |          |
  | date  |           |                 |            |          |
  | heure |           |                 |            |          |
  |──────→|           |                 |            |          |
  |       | Affiche   |                 |            |          |
  |       | créneaux  |                 |            |          |
  |       | libres    |                 |            |          |
  |       |──────────→|                 |            |          |
  |       |          | SELECT * FROM   |            |          |
  |       |          | service_schedules|            |          |
  |       |          |─────────────────→|            |          |
  |       |          |                  | [créneaux]|            |
  |       |          |←─────────────────|            |          |
  |       |←─────────|                 |            |          |
  | ✅    |           |                 |            |          |
  |Créneaux|          |                 |            |          |
  |affichés|          |                 |            |          |
  |       |           |                 |            |          |
  | Sélect|           |                 |            |          |
  | créneau|          |                 |            |          |
  |──────→|           |                 |            |          |
  |       | Générer   |                 |            |          |
  |       | booking#  |                 |            |          |
  |       |───────────────────────────→|            |          |
  |       |                           | Créer booking|          |
  |       |                           |────────────→|          |
  |       |                           |             | Notif   |
  |       |                           |             |─────────→|
  | ✅   |                           |  booking.id |  ✅      |
  | Réser|                           |<────────────|  Notif   |
  | vée  |←──────────────────────────│ reçue      |
  |<────→|                           |            |          |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Client | Sélectionne service + date/heure | Selection made |
| 2 | App | Affiche créneaux disponibles | Calendar view |
| 3 | DB | SELECT service_schedules | Available slots |
| 4 | Client | Valide sélection | Booking submit |
| 5 | DB | Générer BKG-{ts}-{rnd} | booking.id created |
| 6 | Notif | Notifie Pro | New booking alert |

---

## 1️⃣1️⃣ CONFIRMATION D'UNE RÉSERVATION

### Diagramme de Séquence
```
Pro → Dashboard → PostgreSQL → Notifications → Client
 |        |           |            |           |
 | Accès  |           |            |           |
 | booking|           |            |           |
 | PENDING|           |            |           |
 |───────→|           |            |           |
 |        | SELECT *  |            |           |
 |        | FROM      |            |           |
 |        | bookings  |            |           |
 |        | status=   |            |           |
 |        | PENDING   |            |           |
 |        |──────────→|            |           |
 |        |          | [bookings] |           |
 |        |←─────────|            |           |
 | Affiche|←────────|            |           |
 | liste  |         |            |           |
 |        |         |            |           |
 | Clique |         |            |           |
 |"Confirmer"|     |            |           |
 |───────→|         |            |           |
 |        | UPDATE  |            |           |
 |        | status= |            |           |
 |        | CONFIRMED|            |          |
 |        | confirmed_at|          |         |
 |        |─────────→|            |           |
 |        |         | ✅ OK      |           |
 |        |         |            | Notif     |
 |        |         |            |──────────→|
 |        |         |            |  Booking  |
 |        |         |            |confirmed  |
 | ✅     |         |            |           |
 |Confir- |←────────────────────→|           |
 |mée     |         |            |           |
 |←───────|         |            |           |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Accès réservations PENDING | List bookings |
| 2 | DB | SELECT * bookings PENDING | Returned |
| 3 | Pro | Valide réservation | Confirm click |
| 4 | DB | UPDATE status=CONFIRMED | Status changed |
| 5 | Notif | Envoie notification | Client notified |

---

## 1️⃣2️⃣ COMPLÉTION RÉSERVATION (SERVICE TERMINÉ)

### Diagramme de Séquence
```
Pro → Dashboard → Bookings Table → Transactions → Notifications → Client
 |        |           |               |              |            |
 | Marque |           |               |              |            |
 | service|           |               |              |            |
 | terminé|           |               |              |            |
 |───────→|           |               |              |            |
 |        | UPDATE    |               |              |            |
 |        | status=   |               |              |            |
 |        | COMPLETED |               |              |            |
 |        |──────────→|               |              |            |
 |        |          | ✅ OK         |              |            |
 |        |←─────────|               |              |            |
 |        |          | INSERT INTO   |              |            |
 |        |          | transactions  |              |            |
 |        |          |──────────────→|              |            |
 |        |          |              | ✅ Recorded |            |
 |        |          |←──────────────|              |            |
 |        |                          | Créer notif |            |
 |        |                          | "Évaluer"   |            |
 |        |                          |─────────────────────────→|
 | ✅    |          |               |              |  ✅ Notif  |
 |Terminé|←────────────────────────────────────────│ + rating  |
 |←───────|           |              |              | form      |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Marque service comme terminé | Complete click |
| 2 | DB | UPDATE bookings status=COMPLETED | Status updated |
| 3 | DB | INSERT INTO transactions | Transaction recorded |
| 4 | Notif | Envoie invitation évaluation | Client gets notif |

---

## 1️⃣3️⃣ RECHERCHE SÉMANTIQUE HYBRIDE

### Diagramme de Séquence
```
Utilisateur → App → API → Darija Dict → LLM → Embeddings → pgvector
    |         |     |        |         |       |           |
    | Saisit  |     |        |         |       |           |
    | "coiff" |     |        |         |       |           |
    | (Darija)|     |        |         |       |           |
    |────────→|     |        |         |       |           |
    |         | POST|        |         |       |           |
    |         | /api|        |         |       |           |
    |         | /semantic    |         |       |           |
    |         |────→|        |         |       |           |
    |         |     | Lookup|         |       |           |
    |         |     | Darija|         |       |           |
    |         |     |──────→|         |       |           |
    |         |     |       | Match:  |       |           |
    |         |     |       | "coiffure"|     |           |
    |         |     |←──────|         |       |           |
    |         |     |        |        | Trad  |           |
    |         |     |        |────────→| Darija           |
    |         |     |        |         | →Français|       |
    |         |     |        |         |         |→ "salon|
    |         |     |        |         |         |  coiffure"|
    |         |     |        |         |←────────|        |
    |         |     | Synonymes |       |           |
    |         |     |────────────→|      |           |
    |         |     |            | ["coif-|           |
    |         |     |            |  feur",|           |
    |         |     |            |  "salon|           |
    |         |     |            |  beauté"]|       |
    |         |     |←──────────────────|           |
    |         |     |          |    | Encoder vecteur|
    |         |     |          |    |──────────────→|
    |         |     |          |    |    [1024d]  |
    |         |     |          |    |←────────────|
    |         |     |          |    |    | SIMILARITY   |
    |         |     |          |    |    | SEARCH       |
    |         |     |          |    |───────────────→|
    |         |     |                    |<[results]|
    | ✅ Résul|     |←──────────────────────────────|
    | tats    |←────|                    |           |
    |<────────|     |                    |           |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | User | Saisit requête (Darija/Français) | Query submitted |
| 2 | API | POST /api/semantic-search | API call |
| 3 | Dict | Normalise Darija | Match found |
| 4 | LLM | Traduit + synonymes | Expansion termes |
| 5 | Embeddings | Encode requête en vecteur | [1024d] created |
| 6 | pgvector | Similarity search (cosine) | Top-k results |

---

## 1️⃣4️⃣ RECHERCHE PAR IMAGE (VISION IA)

### Diagramme de Séquence
```
Utilisateur → App → Vision API → LLM → Semantic Search → PostgreSQL
    |         |          |        |           |               |
    | Upload  |          |        |           |               |
    | image   |          |        |           |               |
    |────────→|          |        |           |               |
    |         | POST img |        |           |               |
    |         | to vision|        |           |               |
    |         |─────────→|        |           |               |
    |         |          | Analyse|           |               |
    |         |          | image  |           |               |
    |         |          |────────→|          |               |
    |         |          |         | Description  |            |
    |         |          |         | texte       |            |
    |         |          |         | ex: "tajine |            |
    |         |          |         | agneau"    |            |
    |         |          |←────────|           |               |
    |         |←─────────|        |           |               |
    |         | Appel    |        |           |               |
    |         | hybride  |        |           |               |
    |         |─────────────────────────────→|               |
    |         |                  |           | Vecteur +    |
    |         |                  |           | Texte search|
    |         |                  |           |─────────────→|
    |         |                  |           |              | Results
    |         |                  |           |←─────────────| restaus
    | ✅      |                  |           |              | plats
    | Résults |←──────────────────────────────────────────|
    |<────────|                  |           |              |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | User | Upload image | Form submit |
| 2 | Vision | Analyse image | Text extraction |
| 3 | LLM | Description: "tajine agneau" | Description |
| 4 | Semantic | Recherche hybride (vecteur+texte) | Results |
| 5 | DB | Retourne restaurants/plats | Top matches |

---

## 1️⃣5️⃣ PUBLICATION D'UN REEL (COMMERÇANT)

### Diagramme de Séquence
```
Commerçant → Dashboard → Storage (Cloudinary) → PostgreSQL → Notifications
    |            |             |                   |            |
    | Sélect    |             |                   |            |
    | vidéo     |             |                   |            |
    | + titre   |             |                   |            |
    | + CTA     |             |                   |            |
    |───────────→|            |                   |            |
    |            | Upload     |                   |            |
    |            | vers CDN   |                   |            |
    |            |───────────→|                   |            |
    |            |           | Process vidéo    |            |
    |            |           | Générer thumbs   |            |
    |            |           | Optimize stream  |            |
    |            |           |←─────────────────|            |
    |            | secure_url|                   |            |
    |            |←──────────|                   |            |
    |            |           |                   |            |
    |            | INSERT    |                   |            |
    |            | INTO reels|                   |            |
    |            |───────────────────────────→|            |
    |            |                           | reel.id  |
    |            |←──────────────────────────|            |
    | ✅ Publié |            |                   |            |
    |<───────────|            |                   |            |
    |            |            |                   | Notif    |
    |            |            |                   | followers|
    |            |            |                   |──────────→|
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Sélectionne vidéo + titre + CTA | Form complete |
| 2 | Storage | Upload vers Cloudinary CDN | Optimized |
| 3 | DB | INSERT INTO reels | reel.id created |
| 4 | Notif | Notifie followers | Followers alerted |

---

## 1️⃣6️⃣ LIKE INTERACTION SUR UN REEL

### Diagramme de Séquence
```
Client → App → PostgreSQL → Realtime Broadcast
  |       |         |             |
  | Like  |         |             |
  | reel  |         |             |
  |──────→|         |             |
  |       | SELECT  |             |
  |       | user_inte-|            |
  |       | ractions |            |
  |       |─────────→|             |
  |       |         | Already     |
  |       |         | liked?      |
  |       |         |             |
  |       | ✅ Found|             |
  |       |←────────|             |
  |       | DELETE  |             |
  |       | interaction|           |
  |       |─────────→|             |
  |       |←────────|✅ Removed   |
  | ❌ Like|←────────|             |
  | removed|         |             |
  |       |         | Broadcast  |
  |       |         |────────────→|
  |       |         |             |
  |       |              NOT found |
  |       |←────────| ← ─ ─ ─ ─ ─ |
  |       | CREATE |              |
  |       | interaction|           |
  |       |─────────→|             |
  |       |         | RPC         |
  |       |         | increment_  |
  |       |         | reel_like   |
  |       |         |             |
  | ✅ Liked|←────────|✅ Added     |
  |<──────|         |             |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Client | Clique Like | Toggle submitted |
| 2 | DB | SELECT user_interactions | Check if exists |
| 3 | DB | ✅ Existe: DELETE interaction | Like removed |
| 4 | DB | ❌ N'existe pas: INSERT | Like added |
| 5 | RPC | increment_reel_like() | Counter updated |

---

## 1️⃣7️⃣ PUBLICATION D'UNE STORY (24H)

### Diagramme de Séquence
```
Commerçant → Dashboard → Storage → PostgreSQL → Scheduler → Cleanup
    |            |          |           |         |         |
    | Upload     |          |           |         |         |
    | story      |          |           |         |         |
    |───────────→|          |           |         |         |
    |            | POST     |           |         |         |
    |            | fichier  |           |         |         |
    |            |─────────→|           |         |         |
    |            |         | CDN URL   |         |         |
    |            |←────────|           |         |         |
    |            |          |           |         |         |
    |            | INSERT   |           |         |         |
    |            | INTO     |           |         |         |
    |            | stories  |           |         |         |
    |            |─────────────────────→|         |         |
    |            |                     | schedule|         |
    |            |                     | delete  |         |
    |            |                     | in 24h  |         |
    |            |                     |─────────→|         |
    | ✅ Story  |                     |         | [24h    |
    | publiée  |←────────────────────|         | later]  |
    | (24h)    |                     |         |─────────→|
    |<────────────────────────────────────────── | DELETE |
    |            |          |         |         | expired|
    |            |          |         |         | story  |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Upload image/vidéo + caption | Form submit |
| 2 | Storage | Stocke fichier CDN | URL générée |
| 3 | DB | INSERT INTO stories | story.id created |
| 4 | Scheduler | Planifie suppression 24h | Auto-delete scheduled |
| 5 | Cleanup | Supprime après 24h | Story expired |

---

## 1️⃣8️⃣ MESSAGERIE CLIENT-COMMERÇANT (TEMPS RÉEL)

### Diagramme de Séquence
```
Client → WebSocket → Realtime → PostgreSQL → Commerçant → Commerçant
  |         |          |            |            |           |
  | Ouvre   |          |            |            |           |
  | chat    |          |            |            |           |
  |────────→|          |            |            |           |
  |         | WebSocket|            |            |           |
  |         | connecté |            |            |           |
  |         |←─────────|            |            |           |
  |         |          |            |            |           |
  | Envoie  |          |            |            |           |
  | message |          |            |            |           |
  |────────→|          |            |            |           |
  |         | INSERT   |            |            |           |
  |         | INTO     |            |            |           |
  |         | messages |            |            |           |
  |         |──────────────────────→|            |           |
  |         |          |            | Broadcast |           |
  |         |          |───────────────────────→|           |
  |         |          |            |           | Message  |
  |         |          |            |           | reçu en  |
  |         |          |            |           | temps    |
  |         |          |            |           | réel     |
  |         |          |            |           |──────────→|
  |         |          |            |           |          | Affiche
  |         |          |            |           |          | msg
  |         |          |            |           |           |
  |         |          |            |           | Répond   |
  |         |          |            |           |←─────────|
  |         |          |            |           |          |
  | Message |          |            |           | INSERT   |
  | reçu    |←─────────────────────────────────|─────────→|
  |<────────|          |            |           |          |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Client | Ouvre chat | WebSocket connect |
| 2 | Client | Envoie message | Message submit |
| 3 | DB | INSERT INTO messages | Stored |
| 4 | Realtime | Broadcast à Pro | Message reçu |
| 5 | Pro | Voit message en temps réel | Live update |
| 6 | Pro | Répond | Reply sent |
| 7 | Client | Reçoit réponse | Realtime update |

---

## 1️⃣9️⃣ SOUMISSION D'UN AVIS CLIENT

### Diagramme de Séquence
```
Client → App → PostgreSQL → Stores Table → Notifications
  |       |         |            |            |
  | Clique|         |            |            |
  | "Avis"|         |            |            |
  |──────→|         |            |            |
  |       | Vérif   |            |            |
  |       | transaction|          |            |
  |       | COMPLETED|            |            |
  |       |─────────→|            |            |
  |       |         | ❌ Not found|            |
  |       |         |            |            |
  | ❌    |←────────| Achat ou   |            |
  | Required|       | réservation|            |
  |<──────| purchase|requis      |            |
  |       |         |            |            |
  |       |         | ✅ Found   |            |
  |       |         |            |            |
  | Saisit|         |            |            |
  | avis  |         |            |            |
  |──────→|         |            |            |
  |       | INSERT  |            |            |
  |       | INTO    |            |            |
  |       | reviews |            |            |
  |       |────────→|            |            |
  |       |         | UPDATE     |            |
  |       |         | stores SET |            |
  |       |         | rating_avg |            |
  |       |         |────────────→|            |
  |       |         |            | Notif Pro |
  |       |         |            |───────────→|
  | ✅    |         |            |            |
  | Avis |←────────|────────────|            |
  | publié|         |            |            |
  |<──────|         |            |            |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Client | Clique "Laisser un avis" | Modal opens |
| 2 | DB | Vérif transaction COMPLETED | Validation |
| 3 | Client | ❌ Pas de transaction | Error msg |
| 4 | Client | Saisit rating + texte | Form submit |
| 5 | DB | INSERT INTO reviews | Review created |
| 6 | DB | UPDATE stores SET rating_avg | Avg updated |
| 7 | Notif | Notifie Pro | Alert sent |

---

## 2️⃣0️⃣ RÉPONSE DU COMMERÇANT À UN AVIS

### Diagramme de Séquence
```
Commerçant → Dashboard → AI LLM → PostgreSQL → Notifications
    |            |         |          |            |
    | Consulte   |         |          |            |
    | avis reçus|         |          |            |
    |───────────→|         |          |            |
    |            | SELECT  |          |            |
    |            | * FROM  |          |            |
    |            | reviews |          |            |
    |            |─────────→|          |            |
    |            |         | Reviews  |            |
    |            |←────────| list     |            |
    | Affiche    |←────────────────────|            |
    | avis       |         |          |            |
    |            |         |          |            |
    | Clique     |         |          |            |
    | "Générer   |         |          |            |
    | réponse IA"|         |          |            |
    |───────────→|         |          |            |
    |            | Appel AI|          |            |
    |            | /chat   |          |            |
    |            |─────────→|          |            |
    |            |         | Réponse  |            |
    |            |         | profession-|           |
    |            |         | nelle    |            |
    |            |←────────|suggérée  |            |
    | Affiche    |←────────────────────|            |
    | suggestion |         |          |            |
    |            |         |          |            |
    | Valide +   |         |          |            |
    | envoie     |         |          |            |
    |───────────→|         |          |            |
    |            | UPDATE  |          |            |
    |            | reviews |          |            |
    |            |─────────→|          |            |
    |            |         | vendor_  |            |
    |            |         | response |            |
    |            |         | set      |            |
    |            |         |          | Notif     |
    |            |         |          |─ Client  |
    | ✅ Réponse|         |          |───────────→|
    | envoyée   |←────────|────────→|            |
    |<──────────|         |          |            |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Consulte avis reçus | List displayed |
| 2 | DB | SELECT * FROM reviews | Reviews returned |
| 3 | Pro | Clique "Générer réponse IA" | AI modal |
| 4 | LLM | Génère réponse professionnelle | Suggestion shown |
| 5 | Pro | Valide + envoie | Submit |
| 6 | DB | UPDATE vendor_response | Stored |
| 7 | Notif | Notifie client | Client alerted |

---

## 2️⃣1️⃣ ENREGISTRER ÉTABLISSEMENT (FAVORIS)

### Diagramme de Séquence
```
Client → App → PostgreSQL → saved_places Table
  |       |         |              |
  | Clique|         |              |
  | Favori|         |              |
  |──────→|         |              |
  |       | SELECT  |              |
  |       | FROM    |              |
  |       | saved_  |              |
  |       | places  |              |
  |       |─────────→|              |
  |       |         | ✅ Already |
  |       |         | saved     |
  |       |         |           |
  |       | DELETE  |           |
  |       |────────→|           |
  |       |         | Removed   |
  | ❌    |←────────|from favs  |
  | Retiré|←────────|────────────|
  |<──────|         |            |
  |       |         |            |
  |       | ✅      |            |
  |       | NOT     |            |
  |       | found   |            |
  |       |         |            |
  |       | INSERT  |            |
  |       | INTO    |            |
  |       | saved_  |            |
  |       | places  |            |
  |       |────────→|            |
  |       |         | Added to  |
  | ✅    |←────────| favs      |
  | Ajouté|←────────|────────────|
  |<──────|         |            |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Client | Clique icône Favori | Toggle submitted |
| 2 | DB | SELECT FROM saved_places | Check |
| 3 | DB | ✅ Exists: DELETE | Removed |
| 4 | DB | ❌ Not exists: INSERT | Added |

---

## 2️⃣2️⃣ NOTIFICATIONS TEMPS RÉEL (SUPABASE REALTIME)

### Diagramme de Séquence
```
Database → Realtime Channel → WebSocket → App UI → User
   |             |                |        |        |
   | INSERT      |                |        |        |
   | INTO notifs |                |        |        |
   |─────────────→|                |        |        |
   |             | Trigger event |        |        |
   |             |────────────────→|       |        |
   |             |                | Reçoit|        |
   |             |                | event |        |
   |             |                |       | Update|
   |             |                |       | UI    |
   |             |                |       |──────→|
   |             |                |       | Badge |
   |             |                |       | +1    |
   |             |                |       |       |
   | ... autre   |                |       |       |
   | action      |                |       |       |
   |─────────────→|                |       |       |
   |             | Broadcast      |       |       |
   |             |────────────────→|       |       |
   |             |                | notif|       |
   |             |                |──────→|
   |             |                |       | Audio |
   |             |                |       | + visual|
   |             |                |       | alert |
   |             |                |       |───────→|
   |             |                |       |        |
   | User clicks |                |       |        |
   | notif       |                |       |        |
   |             |                |       | UPDATE|
   |             |                |       | is_read|
   |             |                |       |────────→|
   |             |                |       |        |
   |             |                |       | Badge |
   |             |                |       |─ reset|
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | DB | INSERT INTO notifications | Event triggered |
| 2 | Realtime | Broadcast à clients | WebSocket event |
| 3 | App | Reçoit événement | Socket listener |
| 4 | UI | Badge +1 + Affichage | User sees notif |
| 5 | User | Clique notification | Badge reset |
| 6 | DB | UPDATE is_read=true | Marked as read |

---

## 2️⃣3️⃣ ASSISTANT IA CONVERSATIONNEL

### Diagramme de Séquence
```
User → App → /api/ai-chat → LLM (Llama) → PostgreSQL → App → User
  |     |         |             |            |         |     |
  | Ask |         |             |            |         |     |
  | en  |         |             |            |         |     |
  | Darija|       |             |            |         |     |
  |────→|         |             |            |         |     |
  |     | POST    |             |            |         |     |
  |     | message |             |            |         |     |
  |     |────────→|             |            |         |     |
  |     |         | Fetch       |            |         |     |
  |     |         | contexte    |            |         |     |
  |     |         | (cat, city) |            |         |     |
  |     |         |────────────────────────→|         |     |
  |     |         |            |            | Context |     |
  |     |         |            |            |<────────|     |
  |     |         | System     |            |         |     |
  |     |         | prompt +   |            |         |     |
  |     |         | context    |            |         |     |
  |     |         |───────────→|            |         |     |
  |     |         |            | Chat      |         |     |
  |     |         |            | completion|         |     |
  |     |         |            | (streaming|         |     |
  |     |         |            | tokens)   |         |     |
  |     |         |            |────────────────────→|     |
  |     |         |            |           |    SSE  |     |
  |     |         |            |           |<────────|     |
  |     |         |            |           | Stream |     |
  | ✅ |         |            |           | render |     |
  | Réponse|      |            |           |        |───→|
  | progressive|   |           |           |        |     |
  |<────|     |            |            |         |     |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | User | Pose question (Darija/FR) | Message submit |
| 2 | API | POST /api/ai-chat | API call |
| 3 | DB | Fetch contexte | Data returned |
| 4 | LLM | Chat completion + streaming | Tokens |
| 5 | API | Server-Sent Events | SSE stream |
| 6 | App | Render progressive | User sees response |

---

## 2️⃣4️⃣ DASHBOARD ANALYTIQUE COMMERÇANT

### Diagramme de Séquence
```
Commerçant → Dashboard → getDashboardOverview() → PostgreSQL
    |            |              |                    |
    | Accès      |              |                    |
    | dashboard  |              |                    |
    |───────────→|              |                    |
    |            | Call action |                    |
    |            | getDashboard|                    |
    |            |─────────────→|                    |
    |            |              |COUNT orders      |
    |            |              |COMPLETED         |
    |            |              |───────────────→|
    |            |              |                | Orders  |
    |            |              |                | count  |
    |            |              |←────────────────|
    |            |              |SUM total_price |
    |            |              |───────────────→|
    |            |              |              | Revenue  |
    |            |              |              |←────────|
    |            |              |COUNT bookings|
    |            |              |───────────────→|
    |            |              |              | Bookings |
    |            |              |              |←────────|
    |            |              |SELECT rating_|
    |            |              |average       |
    |            |              |───────────────→|
    |            |              |              | Ratings |
    |            |              |              |←────────|
    |            |              |SELECT store_ |
    |            |              |analytics     |
    |            |              |───────────────→|
    |            |              |              | Views/  |
    |            |              |              | Clicks  |
    |            |              |              |←────────|
    |            |              |SELECT rating,|
    |            |              |COUNT FROM    |
    |            |              |reviews GROUP |
    |            |              |BY rating     |
    |            |              |───────────────→|
    |            |              |              | Review  |
    |            |              |              | distrib |
    |            |              |              |←────────|
    | ✅ Tableau|              |    ← ────────────────────|
    | analytique|←──────────────────────────────|
    | complet  |←────────────────────────────────|
    |<────────|              |                    |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Accès /dashboard/[storeId] | Dashboard loads |
| 2 | Action | getDashboardOverview() | Call initiated |
| 3 | DB | COUNT orders COMPLETED | Orders |
| 4 | DB | SUM total_price | Revenue |
| 5 | DB | COUNT bookings | Bookings |
| 6 | DB | SELECT rating_avg | Ratings |
| 7 | DB | SELECT store_analytics | Views/Clicks |
| 8 | DB | SELECT review distribution | Review stats |
| 9 | UI | Display dashboard | Full metrics |

---

## 2️⃣5️⃣ GESTION DES UTILISATEURS (ADMIN)

### Diagramme de Séquence
```
Admin → SaaS Dashboard → API → PostgreSQL
  |          |           |        |
  | Accès    |           |        |
  | /users   |           |        |
  |─────────→|           |        |
  |          | GET       |        |
  |          | /api/users|        |
  |          |──────────→|        |
  |          |           | SELECT |
  |          |           | FROM   |
  |          |           | users  |
  |          |           |───────→|
  |          |           |       | [users]
  |          |           |←──────|
  | Tableau  |           |       |
  | users    |←─────────────────→|
  |<────────|            |       |
  |          |           |       |
  | Clique   |           |       |
  | "Suspendre"|         |       |
  |─────────→|           |       |
  |          | API POST  |       |
  |          | /suspend  |       |
  |          |──────────→|       |
  |          |           | UPDATE|
  |          |           | status|
  |          |           | =     |
  |          |           | suspended|
  |          |           |───────→|
  | ✅       |           |       | ✅
  | Suspendu |←─────────────────→|
  |<────────|           |        |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Admin | Navigue /dashboard/users | Users page |
| 2 | API | GET /api/users?page=1 | Paginated list |
| 3 | DB | SELECT * FROM users | Users returned |
| 4 | UI | Affiche tableau | Users displayed |
| 5 | Admin | Clique "Suspendre" | Suspend action |
| 6 | API | POST /suspend | Suspend call |
| 7 | DB | UPDATE status=suspended | User suspended |

---

## 2️⃣6️⃣ TICKET DE SUPPORT

### Diagramme de Séquence
```
Commerçant → App → PostgreSQL → Realtime → Support Admin
    |        |         |           |           |
    | Crée   |         |           |           |
    | ticket |         |           |           |
    |───────→|         |           |           |
    |        | Subject |           |           |
    |        | + msg   |           |           |
    |        | INSERT  |           |           |
    |        | INTO    |           |           |
    |        | support |           |           |
    |        | _tickets|           |           |
    |        |────────→|           |           |
    |        |        | ticket.id |           |
    |        |←───────|           |           |
    | ✅    |←────────|           |           |
    | Ticket|         |           |           |
    | créé  |         |           |           |
    |       |         |           | Broadcast|
    |       |         |───────────────────→|
    |       |         |           |  Nouveau |
    |       |         |           |  ticket  |
    |       |         |           |  visible |
    |       |         |           |←─────────|
    |       |         |           |          |
    | Admin |         |           |          |
    | répond|         |           |          |
    |───────────────────────────────────────│
    |       |         |           |          |
    |       |         | INSERT    |          |
    |       |         | INTO msgs |          |
    |       |         |────────────→|        |
    |       |         |           | Broadcast|
    |       |         |───────────────────→|
    | Réponse|        |           |     Réponse|
    | reçue |←────────────────────|─────────|
    |<──────|         |           |          |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Crée ticket (sujet + msg) | Form submit |
| 2 | DB | INSERT INTO support_tickets | ticket.id |
| 3 | App | Affiche confirmation | Ticket created |
| 4 | Admin | Voit nouveau ticket | Notification |
| 5 | Admin | Répond au ticket | Reply submit |
| 6 | DB | INSERT INTO messages | Message stored |
| 7 | Realtime | Broadcast réponse | Pro reçoit |

---

## 2️⃣7️⃣ ABONNEMENT COMMERÇANT (PRO ↔ BUSINESS)

### Diagramme de Séquence
```
Commerçant → Dashboard → DB → Subscriptions Table
    |            |        |         |
    | Consulte   |        |         |
    | son plan   |        |         |
    |───────────→|        |         |
    |            | SELECT |         |
    |            | * FROM |         |
    |            | subscri-|         |
    |            | ptions  |         |
    |            |────────→|         |
    |            |        | plan=FREE|
    |            |        | period_end|
    |            |←────────|         |
    | Affiche    |←───────|         |
    | plans      |         |         |
    |            |         |         |
    | Clique     |         |         |
    | "Upgrade" |         |         |
    |───────────→|         |         |
    |            | Action  |         |
    |            | upgrade |         |
    |            |────────→|         |
    |            |        | UPDATE  |
    |            |        | plan=PRO|
    |            |        | price=49|
    |            |        | period_ |
    |            |        | end=+30d|
    |            |        |────────→|
    |            |        | ✅ OK   |
    |            |        |←────────|
    | ✅        |←───────────────→|
    | PRO       |        |         |
    | activé    |        |         |
    |<────────→|        |         |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | Pro | Consulte plan actuel | Dashboard |
| 2 | DB | SELECT * FROM subscriptions | Plan: FREE |
| 3 | UI | Affiche plans disponibles | Plans shown |
| 4 | Pro | Clique "Upgrade PRO" | Upgrade initiated |
| 5 | Action | upgradeSubscription() | Update triggered |
| 6 | DB | UPDATE plan=PRO, +30days | Plan updated |
| 7 | UI | Confirmation notification | ✅ Activated |

---

## 2️⃣8️⃣ SYNCHRONISATION ASYNCHRONE VIA QSTASH

### Diagramme de Séquence
```
QStash Worker → API Endpoint → PostgreSQL → Notifications
     |               |             |            |
     | Webhook call  |             |            |
     | /api/workers  |             |            |
     | /sync-order   |             |            |
     |──────────────→|             |            |
     |               | Vérifier    |            |
     |               | signature   |            |
     |               | QStash      |            |
     |               |             |            |
     |               | ✅ Valide   |            |
     |               |             |            |
     |               | SELECT      |            |
     |               | orders SYNC |            |
     |               |────────────→|            |
     |               |            | Order data |
     |               |            |←───────────|
     |               | UPDATE     |            |
     |               | status     |            |
     |               |────────────→|            |
     |               |            | ✅ Synced |
     |               |            |←───────────|
     |               |                         |
     |               | Envoyer notif|          |
     |               | manquantes   |          |
     |               |─────────────────────→|
     |               |                  | Notif |
     |               |                  | sent  |
     | ✅ Success    |←───────────────────────|
     |<──────────────|             |            |
```

### Détails du Flux
| Étape | Acteur | Action | Résultat |
|-------|--------|--------|----------|
| 1 | QStash | Appelle webhook | API endpoint |
| 2 | Worker | Vérifie signature QStash | ✅ Valid |
| 3 | Worker | Synchronise state | Db query |
| 4 | DB | Retourne état | Status check |
| 5 | Worker | Envoie notif manquantes | Send |
| 6 | QStash | Marque comme complete | Done |

---

# 📊 LÉGENDE COMPLÈTE DES SYMBOLES

| Symbole | Signification | Exemple |
|---------|--------------|---------|
| → | Appel/Requête direct | Client → App |
| ← | Réponse/Retour | DB ← API |
| ··→ | Réponse asynchrone | Realtime ··→ App |
| ✅ | Succès / Validation | ✅ OK |
| ❌ | Erreur / Validation échouée | ❌ Error |
| 🔔 | Notification / Événement | 🔔 Alert |
| [ ] | Données retournées | [users list] |
| { } | Objet JSON | {user.id} |

---

# 🎯 RÉSUMÉ STRUCTURÉ

**Total Diagrammes:** 28  
**Format:** Standardisé avec tables détails  
**Composants:** WebSocket, API, DB, Storage, Realtime, LLM, QStash  
**Patterns:** Sync/Async, Webhook, Streaming, Broadcasting  

