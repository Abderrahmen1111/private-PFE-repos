# Plan Technique — Formulaire Add Business avec Google Maps + Création Inline

## 1. Contexte et Architecture Existante

### Tables DB concernées

```mermaid
erDiagram
    business_directory_tunisia {
        int id PK
        string title
        string city
        string phone
        string place_id "← Google Maps place_id (déjà en schema!)"
        string full_address
        float latitude
        float longitude
        string vitrine_category
        bool is_claimed
        string claimed_by
        int store_id FK
    }
    service_directory {
        int service_id PK
        string owner_id
        string name
        string slug
        string category
        string phone
        string address
        string city
        float latitude
        float longitude
        string status
    }
    stores {
        int id PK
        string owner_id FK
        string name
        string slug
        string category "RESTAURANT|PHARMACY|BOUTIQUE|SERVICE|OTHER"
        string status "PENDING|REVIEW|APPROVED|REJECTED|PUBLISHED"
        string rne
        int id_business FK "→ business_directory_tunisia.id"
        int business_directory_id FK "→ business_directory_tunisia.id"
        int service_id FK "→ service_directory.service_id"
        float latitude
        float longitude
    }
    users {
        string id PK
        string role "CLIENT|PRO|ADMIN"
    }

    business_directory_tunisia ||--o| stores : "id_business"
    service_directory ||--o| stores : "service_id"
    users ||--o{ stores : "owner_id"
```

> [!NOTE]
> La table `business_directory_tunisia` possède **déjà** un champ `place_id` pour stocker l'ID Google Maps. Cela signifie qu'on peut éviter les doublons en vérifiant si un `place_id` Google existe déjà dans la DB.

### Formulaire actuel — [page.tsx](file:///c:/Users/INFOKOM/Desktop/private-PFE-repos/app/merchants/business/add/page.tsx)
- Recherche dans `business_directory_tunisia` uniquement (via `searchBusinessDirectory()`)
- Bouton "RÉCLAMER" si le business existe et n'est pas réclamé
- Bouton "Ajouter mon business" si rien trouvé → mais ne fait rien de spécial, omet juste la liaison
- Pas de recherche Google Maps
- Pas de distinction Business / Service

### Server Action actuelle — [addbuss.ts](file:///c:/Users/INFOKOM/Desktop/private-PFE-repos/lib/actions/addbuss.ts)
- `searchBusinessDirectory(query)` : cherche dans `business_directory_tunisia`
- `addBusiness(formData)` : insère dans `stores` avec `status: PENDING`

---

## 2. Architecture Cible

### Flux complet (machine d'état)

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Searching : Utilisateur tape ≥ 3 caractères
    Searching --> ResultsFound : Résultats trouvés (DB et/ou GM)
    Searching --> NoResults : Aucun résultat
    ResultsFound --> ClaimFromDB : Click "Réclamer" sur résultat DB
    ResultsFound --> ClaimFromGM : Click "Réclamer" sur résultat Google Maps
    ResultsFound --> CreateMode : Click "Créer mon business"
    NoResults --> CreateMode : Auto ou click "Créer"
    ClaimFromDB --> FormFilled : Pré-remplir formulaire + directoryId
    ClaimFromGM --> FormFilled : Pré-remplir formulaire + googlePlaceId + coords
    CreateMode --> FormFilled : Champs supplémentaires révélés
    FormFilled --> Submitting : Submit
    Submitting --> [*] : Redirect /dashboard/{id}
```

### Séquence de recherche

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Formulaire (Client)
    participant API as /api/places/search
    participant SA as Server Action
    participant DB as Supabase (DB)
    participant GM as Google Places API

    U->>F: Tape "Café Express" (≥3 chars)
    F->>F: Debounce 500ms
    
    par Recherche parallèle
        F->>SA: searchBusinessDirectory("Café Express")
        SA->>DB: SELECT FROM business_directory_tunisia WHERE title ILIKE '%café%'
        DB-->>SA: [{id: 42, title: "Café Express", city: "Sfax", is_claimed: false}]
        SA-->>F: Résultats DB
    and
        F->>API: GET /api/places/search?q=Café Express&country=TN
        API->>GM: textSearch("Café Express", country: "TN")
        GM-->>API: [{place_id: "ChIJ...", name: "Café Express", address: "...", lat, lng}]
        API->>DB: Vérifier si place_id existe déjà dans business_directory_tunisia
        DB-->>API: Non trouvé
        API-->>F: Résultats GM (filtrés)
    end
    
    F->>F: Fusionner + dédupliquer + afficher dropdown
```

---

## 3. Fichiers à Modifier / Créer

### Vue d'ensemble

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `.env.local` | MODIFIER | Ajouter `GOOGLE_PLACES_API_KEY` |
| `app/api/places/search/route.ts` | **CRÉER** | Proxy sécurisé Google Places API |
| `lib/actions/addbuss.ts` | MODIFIER | Ajouter `searchGooglePlaces()`, adapter `addBusiness()` |
| `app/merchants/business/add/page.tsx` | MODIFIER | Nouveau UI avec search multi-source + mode création |

---

## 4. Détail Technique par Fichier

### 4.1 `app/api/places/search/route.ts` [NOUVEAU]

**But** : Proxy côté serveur pour éviter d'exposer la clé API Google côté client.

```typescript
// Endpoint : GET /api/places/search?q=café+express&country=TN
// Headers: Content-Type: application/json

// Paramètres
interface PlacesSearchParams {
  q: string;        // Terme de recherche (min 3 chars)
  country?: string;  // Code pays ISO (default: "TN")
}

// Réponse
interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  phone?: string;
  rating?: number;
  types?: string[];      // ["restaurant", "food", ...]
  business_status?: string;
  already_in_db: boolean; // Vérifié via place_id dans business_directory_tunisia
}

// Logique interne
// 1. Valider le paramètre q (min 3 chars)
// 2. Appeler Google Places Text Search API
//    URL: https://maps.googleapis.com/maps/api/place/textsearch/json
//    Params: query=q, region=country, key=GOOGLE_PLACES_API_KEY
// 3. Pour chaque résultat, vérifier si place_id existe dans business_directory_tunisia
// 4. Retourner max 5 résultats avec already_in_db flag
// 5. Ajouter cache-control: max-age=300 (5 min cache navigateur)
```

**Sécurité** :
- La clé API reste côté serveur (`GOOGLE_PLACES_API_KEY`, pas `NEXT_PUBLIC_`)
- Rate limit via le debounce côté client (500ms)
- Limite à 5 résultats par requête

---

### 4.2 `lib/actions/addbuss.ts` [MODIFIER]

**Nouvelles fonctions :**

#### `searchUnified(query: string)`
```typescript
// Recherche dans les DEUX directories locales
// Retourne un tableau unifié avec le type d'origine

interface UnifiedSearchResult {
  source: 'business_directory' | 'service_directory';
  id: number;
  name: string;
  city: string;
  phone: string | null;
  address: string | null;
  category: string | null;
  is_claimed: boolean;
  place_id: string | null; // GM place_id si présent dans DB
}

// 1. Requête // sur business_directory_tunisia + service_directory
// 2. Fusionner les résultats
// 3. Retourner max 5 résultats
```

#### Modification de `addBusiness(formData)` — nouveaux paramètres

```typescript
// Nouveaux champs dans FormData :
// - businessType: 'BUSINESS' | 'SERVICE'
// - isCreateMode: 'true' | 'false'
// - googlePlaceId: string (optionnel — si réclamé depuis GM)
// - lat: string (optionnel)
// - lng: string (optionnel)
// - serviceDirectoryId: string (optionnel — si réclamé depuis service_directory)

// Logique mise à jour:

if (isCreateMode === 'true') {
  // → CRÉER dans la directory PUIS dans stores
  
  if (businessType === 'BUSINESS') {
    // 1. Insérer dans business_directory_tunisia
    const { data: dirEntry } = await supabase
      .from('business_directory_tunisia')
      .insert({
        title: name,
        city,
        phone,
        full_address: address,
        place_id: googlePlaceId || null,
        latitude: lat || null,
        longitude: lng || null,
        vitrine_category: category,
        is_claimed: true,
        claimed_by: user.id,
        data_source: 'user_created',
      })
      .select('id')
      .single();
    
    // 2. Insérer dans stores avec liaison
    directoryId = dirEntry.id;
    // → reste du flow existant mais avec id_business = dirEntry.id
    
  } else if (businessType === 'SERVICE') {
    // 1. Insérer dans service_directory
    const { data: serviceEntry } = await supabase
      .from('service_directory')
      .insert({
        name,
        slug: generateSlug(name),
        category,
        phone,
        address,
        city,
        owner_id: user.id,
        latitude: lat || 0,
        longitude: lng || 0,
        status: 'ACTIVE',
      })
      .select('service_id')
      .single();
    
    // 2. Insérer dans stores avec service_id
    // → service_id = serviceEntry.service_id, id_business = null
  }
  
} else if (googlePlaceId) {
  // → RÉCLAMER depuis Google Maps
  // 1. Chercher dans DB si place_id existe déjà
  // 2. Si oui → lier au store comme avant
  // 3. Si non → insérer dans business_directory_tunisia PUIS lier
  
} else {
  // → RÉCLAMER depuis DB (flow existant inchangé)
}
```

---

### 4.3 `app/merchants/business/add/page.tsx` [MODIFIER]

#### Nouvel état du composant

```typescript
// État existant conservé + nouveaux états :

const [businessType, setBusinessType] = useState<'BUSINESS' | 'SERVICE'>('BUSINESS');
const [isCreateMode, setIsCreateMode] = useState(false);

// Résultats de recherche multi-source
const [dbResults, setDbResults] = useState<UnifiedSearchResult[]>([]);
const [gmResults, setGmResults] = useState<PlaceResult[]>([]);

// Source sélectionnée
const [selectedSource, setSelectedSource] = useState<
  | { type: 'db'; data: UnifiedSearchResult }
  | { type: 'gm'; data: PlaceResult }
  | { type: 'new' }
  | null
>(null);

// Coordonnées (auto-remplies ou manuelles)
const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
```

#### Structure UI modifiée

```
┌─────────────────────────────────────────────────┐
│  Shop Info                                       │
│                                                  │
│  ┌─── Type ──────────────────────────────────┐  │
│  │  [🏪 Business]  [🔧 Service]             │  │  ← NOUVEAU: Toggle
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Logo: [Browse]                                  │  ← Existant
│                                                  │
│  ┌─── Company Name ──── ┐  ┌── Email ────────┐ │
│  │ [Café Express     🔍] │  │ [email@...]     │ │
│  │ ┌─────────────────┐  │  └────────────────┘ │
│  │ │ 🗺️ Google Maps   │  │                    │  ← NOUVEAU: Section GM
│  │ │  Café Express    │  │                    │
│  │ │  Sfax  [RÉCLAMER]│  │                    │
│  │ ├─────────────────┤  │                    │
│  │ │ 🗄️ Base locale   │  │                    │  ← Existant amélioré
│  │ │  Café Express    │  │                    │
│  │ │  Sfax  [RÉCLAMÉ] │  │                    │
│  │ ├─────────────────┤  │                    │
│  │ │ ➕ Créer nouveau │  │                    │  ← NOUVEAU: Mode création
│  │ └─────────────────┘  │                    │
│  └──────────────────────┘                    │
│                                                  │
│  ┌── Phone ──────┐  ┌── Category ──────────┐   │  ← Existant
│  │ [+216...]     │  │ [Restaurant ▼]       │   │
│  └───────────────┘  └─────────────────────┘   │
│                                                  │
│  ┌── RNE * ──────────────────────────────────┐  │  ← Existant
│  │ [1234567A]                                │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌── Website ────────────────────────────────┐  │  ← Existant
│  │ 🌐 [https://...]                          │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌── Address ─────┐  ┌── Location ──────────┐  │  ← Existant
│  │ [Rue ...]      │  │ [Sfax ▼]            │  │
│  └────────────────┘  └─────────────────────┘  │
│                                                  │
│  ╔══════════════════════════════════════════════╗│
│  ║ 📍 Coordonnées (auto)                       ║│  ← NOUVEAU: Si mode
│  ║  Lat: 34.7405   Lng: 10.7603               ║│    création ou GM
│  ║  (pré-rempli par Google Maps)               ║│
│  ╚══════════════════════════════════════════════╝│
│                                                  │
│  ┌── Description ────────────────────────────┐  │  ← Existant
│  │ [Texte libre...]                          │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│          [Cancel]  [Save]                        │
└─────────────────────────────────────────────────┘
```

#### Logique de recherche debounced (modifiée)

```typescript
useEffect(() => {
  const debounce = setTimeout(async () => {
    if (formData.companyName.length < 3) {
      setDbResults([]); setGmResults([]); return;
    }
    
    setIsSearching(true);
    
    // Recherche parallèle DB + Google Maps
    const [dbRes, gmRes] = await Promise.all([
      searchUnified(formData.companyName),                    // Server Action
      fetch(`/api/places/search?q=${encodeURIComponent(formData.companyName)}&country=TN`)
        .then(r => r.json())
        .catch(() => [])
    ]);
    
    setDbResults(dbRes);
    setGmResults(gmRes.filter((g: PlaceResult) => !g.already_in_db)); // Filtrer doublons
    setIsSearching(false);
    setShowSuggestions(true);
  }, 500);
  
  return () => clearTimeout(debounce);
}, [formData.companyName]);
```

---

## 5. Gestion des doublons (GM ↔ DB)

Le champ `place_id` dans `business_directory_tunisia` permet d'éviter les doublons :

```mermaid
flowchart TD
    A[Résultat Google Maps reçu] --> B{place_id existe dans DB?}
    B -->|Oui| C[Marquer already_in_db = true]
    C --> D[Afficher dans la section DB au lieu de GM]
    B -->|Non| E[Afficher dans la section Google Maps]
    E --> F{Utilisateur clique RÉCLAMER}
    F --> G[Insérer dans business_directory_tunisia avec place_id]
    G --> H[Créer store lié]
```

---

## 6. Soumission finale — Logique serveur

```mermaid
flowchart TD
    A[Submit formulaire] --> B{isCreateMode?}
    
    B -->|Non - Réclamation| C{Source?}
    C -->|DB locale| D[Flow existant: stores.insert avec id_business]
    C -->|Google Maps| E[1. Insérer dans business_directory_tunisia avec place_id]
    E --> F[2. stores.insert avec id_business = nouveau ID]
    
    B -->|Oui - Création| G{businessType?}
    G -->|BUSINESS| H[1. Insérer dans business_directory_tunisia data_source='user_created']
    H --> I[2. stores.insert avec id_business]
    G -->|SERVICE| J[1. Insérer dans service_directory]
    J --> K[2. stores.insert avec service_id]
    
    D --> L[stores.status = 'PENDING']
    F --> L
    I --> L
    K --> L
    
    L --> M[users.role = 'PRO']
    M --> N[Redirect → /dashboard/store_id]
```

---

## 7. Environnement requis

```env
# .env.local — à ajouter
GOOGLE_PLACES_API_KEY=AIzaSy...  # Server-side only (pas NEXT_PUBLIC_)
```

> [!WARNING]
> **Pas de clé Google Maps trouvée** dans votre `.env.local` actuel. Il faut en créer une sur [Google Cloud Console](https://console.cloud.google.com/) avec l'API **Places** activée. Le quota gratuit est de $200/mois (~11 700 requêtes Text Search).

---

## 8. Estimation du travail

| Tâche | Complexité | Temps estimé |
|-------|------------|-------------|
| API Route `/api/places/search` | Faible | ~30 min |
| Modifier `addbuss.ts` (searchUnified + nouveau addBusiness) | Moyenne | ~45 min |
| Modifier `page.tsx` (UI multi-source + mode création) | Haute | ~1h30 |
| Tests et vérification | Moyenne | ~30 min |
| **Total** | | **~3h** |

---

## Open Questions

> [!IMPORTANT]
> 1. **Avez-vous une clé Google Maps API** ou dois-je vous guider pour en créer une ?
> 2. **Le RNE est-il obligatoire pour les Services** ? (Un `if` conditionnel suffirait)
> 3. **Faut-il afficher les photos** des résultats Google Maps dans le dropdown ? (Place Photos API = coût supplémentaire)
