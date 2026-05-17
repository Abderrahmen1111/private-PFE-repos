import re

filepath = r"SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# --- Extract header (lines 1 to just before "# 🔐 SECTION 1:") ---
header_marker = "# 🔐 SECTION 1:"
header_end = content.find(header_marker)
header = content[:header_end].rstrip()

# --- Extract footer (from "# 📋 RÉSUMÉ FINAL") ---
footer_marker = "# 📋 RÉSUMÉ FINAL"
footer_start = content.find(footer_marker)
footer_text = content[footer_start:]

# --- Extract body ---
body = content[header_end:footer_start]

# --- Split body into blocks by "## " headings that have emoji numbers ---
# We split on lines that start with "## " and contain emoji digits
blocks = {}
current_key = None
current_lines = []

for line in body.split('\n'):
    # Check if this is a diagram heading (## with emoji number or 🔟)
    is_heading = False
    if line.startswith('## ') and any(c in line for c in ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','0️⃣','🔟']):
        is_heading = True

    if is_heading:
        if current_key is not None:
            blocks[current_key] = '\n'.join(current_lines).strip()
        current_key = line.strip()
        current_lines = [line]
    elif line.startswith('# ') and 'SECTION' in line:
        # Skip section category headers
        if current_key is not None:
            blocks[current_key] = '\n'.join(current_lines).strip()
            current_key = None
            current_lines = []
    else:
        if current_key is not None:
            current_lines.append(line)

if current_key is not None:
    blocks[current_key] = '\n'.join(current_lines).strip()

print(f"Extracted {len(blocks)} diagram blocks:")
for k in blocks:
    print(f"  - {k[:70]}")

# --- Define new order mapping: (new_number, new_title, old_key_substring) ---
# For existing blocks, we match by substring in the old key
# For new blocks, we provide the content directly

def get_block(substring):
    for k, v in blocks.items():
        if substring in k:
            return v
    print(f"  WARNING: Could not find block matching '{substring}'")
    return None

def renumber_block(block_content, new_num, new_title):
    """Replace the ## heading line with the new number and title"""
    lines = block_content.split('\n')
    # First line is the heading
    lines[0] = f"## {new_num} {new_title}"
    return '\n'.join(lines)

# New diagrams content (for diagrams that don't exist yet)
NEW_RECUPERATION_MDP = """## 3️⃣ RÉCUPÉRATION DU MOT DE PASSE

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant F as Interface (App/Web)
    participant A as Auth Service (Supabase)
    participant E as Service Email (SMTP/Resend)

    U->>F: Clique sur "Mot de passe oublié"
    F->>A: requestPasswordReset(email)
    activate A
    A->>E: Envoi lien de récupération (OTP/Magic Link)
    deactivate A
    E-->>U: Reçoit l'email avec le lien
    U->>F: Saisie nouveau mot de passe + Token
    F->>A: updateUser(newPassword, token)
    activate A
    A->>A: Hash & Update auth.users
    A-->>F: Succès
    deactivate A
    F-->>U: ✅ Mot de passe mis à jour
```

### 🛠 Implémentation & Démarche de Test
- **Composants** : `lib/actions/auth.ts` (fonction `resetPassword`), Supabase Auth `resetPasswordForEmail()`.
- **Validation** :
  1. **Action** : L'utilisateur clique sur "Mot de passe oublié" et saisit son email.
  2. **Vérification** : Un email contenant un lien sécurisé est envoyé via le service SMTP configuré.
  3. **Résultat** : Après clic sur le lien et saisie du nouveau mot de passe, l'ancien mot de passe est invalidé."""

NEW_STORY = """## 1️⃣7️⃣ PUBLICATION D'UNE STORY (24H)

```mermaid
sequenceDiagram
    autonumber
    actor P as Pro (Commerçant)
    participant D as Dashboard
    participant C as Cloudinary (CDN)
    participant A as Story API
    participant DB as Base de Données

    P->>D: Sélectionne Photo/Vidéo
    D->>C: Upload Direct (Signed request)
    activate C
    C-->>D: Media URL & Public ID
    deactivate C
    D->>A: POST /stories (url, expire_at=NOW()+24h)
    activate A
    A->>DB: INSERT INTO stories (expire_at)
    activate DB
    DB-->>A: Success
    deactivate DB
    A-->>D: Publié
    deactivate A
    D-->>P: ✅ Story visible pour 24h
```

### 🛠 Implémentation & Démarche de Test
- **Frontend (UI)** : `app/dashboard/[id]/stories/page.tsx`
- **Backend (API)** : `lib/actions/stories.ts`
- **Validation du flux (Test)** :
  1. **Action** : Le commerçant upload une photo/vidéo depuis son dashboard.
  2. **Vérification API** : Cloudinary optimise le média, puis l'API insère l'URL avec un `expire_at` à +24h.
  3. **Résultat attendu** : La story est visible sur l'app mobile et disparaît automatiquement après 24h."""

NEW_FAVORIS = """## 2️⃣1️⃣ ENREGISTRER UN ÉTABLISSEMENT (FAVORIS)

```mermaid
sequenceDiagram
    autonumber
    actor C as Client
    participant F as App Mobile
    participant A as Favorites API
    participant DB as Base de Données

    C->>F: Clique sur l'icône ❤️ (Boutique)
    F->>A: toggleFavorite(storeID)
    activate A
    A->>DB: INSERT/DELETE INTO user_favorites (user_id, store_id)
    activate DB
    DB-->>A: Success
    deactivate DB
    A-->>F: État mis à jour (isFavorite: true/false)
    deactivate A
    F-->>C: ✅ Ajouté/Retiré des favoris
```

### 🛠 Implémentation & Démarche de Test
- **Frontend (UI)** : `ro2ya-mobile-app/compnents/business-profile/FavoriteButton.tsx`
- **Backend (API)** : `lib/actions/favorites.ts`
- **Validation du flux (Test)** :
  1. **Action** : Le client clique sur l'icône cœur d'une boutique.
  2. **Vérification API** : L'API bascule l'état (toggle) du favori en base.
  3. **Résultat attendu** : L'icône change de couleur et la boutique apparaît dans la liste des favoris."""

NEW_ABONNEMENT = """## 2️⃣7️⃣ ABONNEMENT COMMERÇANT (PRO BUSINESS)

```mermaid
sequenceDiagram
    autonumber
    actor P as Pro (Commerçant)
    participant D as Dashboard (Web)
    participant A as Billing API
    participant S as Passerelle (Stripe)
    participant DB as Base de Données

    P->>D: Choisir Plan Premium
    D->>A: createCheckoutSession(plan_id)
    activate A
    A->>S: Initialize Stripe Checkout Session
    S-->>A: Checkout URL
    A-->>D: Redirect Link
    deactivate A
    D->>S: Saisie coordonnées bancaires
    S-->>A: Webhook (payment_intent.succeeded)
    activate A
    A->>DB: UPDATE profiles SET role='PRO_BUSINESS'
    A->>DB: INSERT INTO subscriptions (plan, start_date, end_date)
    deactivate A
    D-->>P: ✅ Compte surclassé avec succès
```

### 🛠 Implémentation & Démarche de Test
- **Frontend (UI)** : `app/dashboard/[id]/subscription/page.tsx`
- **Backend (API)** : `lib/actions/account_subscription.ts`
- **Validation du flux (Test)** :
  1. **Action** : Le commerçant souscrit à l'abonnement Premium (49 TND/mois).
  2. **Vérification API** : L'API crée la session Stripe, traite le webhook de paiement, et met à jour le rôle.
  3. **Résultat attendu** : Le commerçant débloque les fonctionnalités analytiques avancées."""

NEW_QSTASH = """## 2️⃣8️⃣ SYNCHRONISATION ASYNCHRONE VIA UPSTASH QSTASH

```mermaid
sequenceDiagram
    autonumber
    participant A as App API (Next.js)
    participant Q as Upstash QStash
    participant W as Worker / Background Task
    participant DB as PostgreSQL

    A->>Q: Publish Message (Webhook URL + Payload)
    activate Q
    Q-->>A: Message Enqueued (202 Accepted)
    deactivate Q
    Note over Q,W: Délai configurable / Retries automatiques
    Q->>W: Trigger Webhook (POST)
    activate W
    W->>DB: Process Heavy Task (Batch update / Sync / Email)
    activate DB
    DB-->>W: Success
    deactivate DB
    W-->>Q: 200 OK (Acknowledgement)
    deactivate W
```

### 🛠 Implémentation & Démarche de Test
- **Frontend (UI)** : N/A (processus backend uniquement).
- **Backend (API)** : `app/api/qstash/route.ts`, `lib/actions/sync.ts`
- **Validation du flux (Test)** :
  1. **Action** : Une action lourde est déclenchée (ex: envoi de 100 emails de promotion).
  2. **Vérification API** : QStash enqueue le message et appelle le webhook worker après le délai configuré.
  3. **Résultat attendu** : La tâche est exécutée en arrière-plan sans bloquer l'interface utilisateur."""

# --- Build the ordered list ---
ordered = []

# 1. Inscription
b = get_block("INSCRIPTION")
if b: ordered.append(renumber_block(b, "1️⃣", "INSCRIPTION (SIGNUP)"))

# 2. Connexion
b = get_block("CONNEXION")
if b: ordered.append(renumber_block(b, "2️⃣", "CONNEXION (LOGIN)"))

# 3. Récupération MDP (NEW)
ordered.append(NEW_RECUPERATION_MDP)

# 4. Création Établissement
b = get_block("CRÉATION D'UNE BOUTIQUE")
if b: ordered.append(renumber_block(b, "4️⃣", "CRÉATION D'UN ÉTABLISSEMENT (COMMERÇANT)"))

# 5. Approbation Admin
b = get_block("MODÉRATION & ACTIVATION")
if b: ordered.append(renumber_block(b, "5️⃣", "APPROBATION D'UNE BOUTIQUE PAR L'ADMIN"))

# 6. Création Commande
b = get_block("PASSAGE DE COMMANDE")
if b: ordered.append(renumber_block(b, "6️⃣", "CRÉATION D'UNE COMMANDE (CLIENT)"))

# 7. Validation Commande & QR
b = get_block("ACCEPTATION DE COMMANDE")
if b: ordered.append(renumber_block(b, "7️⃣", "VALIDATION DE COMMANDE & GÉNÉRATION QR CODE"))

# 8. Scan QR
b = get_block("LIVRAISON SÉCURISÉE VIA QR")
if b: ordered.append(renumber_block(b, "8️⃣", "SCAN QR CODE À LA LIVRAISON"))

# 9. Annulation
b = get_block("ANNULATION DE COMMANDE")
if b: ordered.append(renumber_block(b, "9️⃣", "ANNULATION D'UNE COMMANDE"))

# 10. Réservation
b = get_block("RÉSERVATION D'UN CRÉNEAU")
if b: ordered.append(renumber_block(b, "🔟", "RÉSERVATION D'UN SERVICE (CLIENT)"))

# 11. Confirmation Réservation
b = get_block("GESTION DES DISPONIBILITÉS")
if b: ordered.append(renumber_block(b, "1️⃣1️⃣", "CONFIRMATION D'UNE RÉSERVATION"))

# 12. Complétion Réservation
b = get_block("VALIDATION DE LA PRESTATION")
if b: ordered.append(renumber_block(b, "1️⃣2️⃣", "COMPLÉTION D'UNE RÉSERVATION (SERVICE TERMINÉ)"))

# 13. Recherche Sémantique
b = get_block("RECHERCHE SÉMANTIQUE")
if b: ordered.append(renumber_block(b, "1️⃣3️⃣", "RECHERCHE SÉMANTIQUE HYBRIDE"))

# 14. Recherche Image
b = get_block("RECHERCHE PAR IMAGE")
if b: ordered.append(renumber_block(b, "1️⃣4️⃣", "RECHERCHE PAR IMAGE (VISION IA)"))

# 15. Publication Reel
b = get_block("PUBLICATION REELS")
if b: ordered.append(renumber_block(b, "1️⃣5️⃣", "PUBLICATION D'UN REEL (COMMERÇANT)"))

# 16. Like Reel
b = get_block("INTERACTION REEL")
if b: ordered.append(renumber_block(b, "1️⃣6️⃣", "LIKE INTERACTION SUR UN REEL"))

# 17. Story (NEW)
ordered.append(NEW_STORY)

# 18. Messagerie
b = get_block("CHAT TEMPS RÉEL")
if b: ordered.append(renumber_block(b, "1️⃣8️⃣", "MESSAGERIE CLIENT-COMMERÇANT (TEMPS RÉEL)"))

# 19. Avis Client
b = get_block("PUBLICATION D'AVIS")
if b: ordered.append(renumber_block(b, "1️⃣9️⃣", "SOUMISSION D'UN AVIS CLIENT"))

# 20. Réponse Avis
b = get_block("RÉPONSE IA AUX AVIS")
if b: ordered.append(renumber_block(b, "2️⃣0️⃣", "RÉPONSE DU COMMERÇANT À UN AVIS"))

# 21. Favoris (NEW)
ordered.append(NEW_FAVORIS)

# 22. Notifications
b = get_block("NOTIFICATIONS TEMPS RÉEL")
if b: ordered.append(renumber_block(b, "2️⃣2️⃣", "NOTIFICATIONS TEMPS RÉEL (SUPABASE REALTIME)"))

# 23. Assistant IA
b = get_block("CONSEILLER DE VENTE IA")
if b: ordered.append(renumber_block(b, "2️⃣3️⃣", "ASSISTANT IA CONVERSATIONNEL"))

# 24. Dashboard Analytics
b = get_block("ANALYTIQUES")
if b: ordered.append(renumber_block(b, "2️⃣4️⃣", "DASHBOARD ANALYTIQUE COMMERÇANT"))

# 25. Gestion Users Admin
b = get_block("GESTION DES UTILISATEURS")
if b: ordered.append(renumber_block(b, "2️⃣5️⃣", "GESTION DES UTILISATEURS (ADMIN)"))

# 26. Ticket Support
b = get_block("CRÉATION TICKET SUPPORT")
if b: ordered.append(renumber_block(b, "2️⃣6️⃣", "TICKET DE SUPPORT"))

# 27. Abonnement (NEW)
ordered.append(NEW_ABONNEMENT)

# 28. QStash (NEW)
ordered.append(NEW_QSTASH)

# --- Collect remaining blocks not used above ---
used_substrings = [
    "INSCRIPTION", "CONNEXION", "CRÉATION D'UNE BOUTIQUE", "MODÉRATION & ACTIVATION",
    "PASSAGE DE COMMANDE", "ACCEPTATION DE COMMANDE", "LIVRAISON SÉCURISÉE VIA QR",
    "ANNULATION DE COMMANDE", "RÉSERVATION D'UN CRÉNEAU", "GESTION DES DISPONIBILITÉS",
    "VALIDATION DE LA PRESTATION", "RECHERCHE SÉMANTIQUE", "RECHERCHE PAR IMAGE",
    "PUBLICATION REELS", "INTERACTION REEL", "CHAT TEMPS RÉEL", "PUBLICATION D'AVIS",
    "RÉPONSE IA AUX AVIS", "NOTIFICATIONS TEMPS RÉEL", "CONSEILLER DE VENTE IA",
    "ANALYTIQUES", "GESTION DES UTILISATEURS", "CRÉATION TICKET SUPPORT"
]

extras = []
for k, v in blocks.items():
    used = False
    for sub in used_substrings:
        if sub in k:
            used = True
            break
    if not used:
        extras.append(v)

# --- Assemble final document ---
output = header + "\n\n"

for i, block in enumerate(ordered):
    output += block.rstrip() + "\n\n---\n\n"

if extras:
    output += "# ➕ DIAGRAMMES COMPLÉMENTAIRES\n\n"
    for block in extras:
        if block.strip():
            output += block.rstrip() + "\n\n---\n\n"

output += footer_text

with open(filepath, "w", encoding="utf-8") as f:
    f.write(output)

print(f"\n✅ Fichier réécrit avec {len(ordered)} diagrammes principaux + {len([e for e in extras if e.strip()])} complémentaires")
