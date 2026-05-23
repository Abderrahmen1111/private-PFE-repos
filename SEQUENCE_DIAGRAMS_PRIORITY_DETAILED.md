# 🔄 Diagrammes de Séquence Détaillés - Workflows Clés avec Web & Mobile

Diagrammes de séquence **complets et détaillés** pour les 4 workflows prioritaires avec support **Web et Mobile identique**.

---

## 📌 ARCHITECTURE MULTI-PLATEFORME

```mermaid
graph TD
    A["Web Platform<br/>Next.js<br/>Browser"] -->|API Call| D["Backend Server<br/>Supabase<br/>LLM/AI Services"]
    B["Mobile Platform<br/>React Native/Flutter<br/>App"] -->|API Call| D
    
    D -->|Response| A
    D -->|Response| B
    
    C["Shared Services"] -->|Used by| D
    C -->|Includes| E["Darija NLP<br/>Vision AI<br/>Embeddings<br/>Fraud Detection"]
    
    A -.->|Sync Data| X["User Profile<br/>Preferences<br/>History"]
    B -.->|Sync Data| X
    X -.->|Update| A
    X -.->|Update| B
```

---

## 🎯 DIAGRAMME 35 - RECHERCHE PAR IMAGE AVEC CONTEXTE + FRAUDE

### **Vue Complète: Web & Mobile**

```mermaid
sequenceDiagram
    participant UserWeb as User (Web)
    participant UserMobile as User (Mobile)
    participant App as Application<br/>Web & Mobile
    participant Storage as Upload<br/>Service
    participant VisionAI as Vision IA<br/>Service
    participant SearchEngine as Search<br/>Engine
    participant FraudDetector as Fraud<br/>Detector
    participant Database as Database
    participant UserNotif as User<br/>Notification
    
    alt User utilise WEB
        UserWeb->>App: Clique sur caméra
        App->>UserWeb: Accès à webcam du navigateur
        UserWeb->>App: Prend une photo
    else User utilise MOBILE
        UserMobile->>App: Clique sur caméra
        App->>UserMobile: Accès à caméra du téléphone
        UserMobile->>App: Prend une photo
    end
    
    App->>Storage: Upload image
    Storage->>App: Image URL stockée
    
    App->>VisionAI: Envoie image pour reconnaissance
    VisionAI->>VisionAI: Reconnaissance d'objet (CNN)
    VisionAI->>VisionAI: Extraction de features<br/>(couleur, texture, style)
    VisionAI->>App: Retourne objet identifié + features
    
    App->>SearchEngine: Cherche produits similaires
    SearchEngine->>Database: Query avec embedding visuel
    Database->>SearchEngine: Résultats produits
    
    SearchEngine->>App: Top 20 produits similaires
    
    par Pour chaque produit
        App->>FraudDetector: Analyse le commerçant
        FraudDetector->>Database: Récupère historique commerçant
        Database->>FraudDetector: Complaints, ratings, age account
        FraudDetector->>FraudDetector: Vérifie cohérence images produit
        FraudDetector->>FraudDetector: Scan watermarks/manipulation
        FraudDetector->>FraudDetector: Analyse patterns de prix
        FraudDetector->>App: Fraude score (0-100)
    end
    
    App->>App: Ajoute contexte utilisateur<br/>- Géolocalisation<br/>- Budget préféré<br/>- Historique achat
    
    App->>App: Filtre résultats<br/>- Par proximité géographique<br/>- Par fraude score < 70<br/>- Par prix acceptable
    
    App->>App: Trie par score pertinence
    
    alt Score fraude élevé (>70)
        App->>UserNotif: "⚠️ Attention: Cet utilisateur a X plaintes"
        App->>UserNotif: Affiche: Score fraude, Détails
    else Score fraude faible (<30)
        App->>UserNotif: "✅ Cet utilisateur a bonne réputation"
    end
    
    App->>UserNotif: Affiche résultats avec:<br/>- Photo du produit<br/>- Store name<br/>- Price<br/>- Distance<br/>- Rating<br/>- Fraude warning
    
    alt User surWeb
        UserNotif->>UserWeb: Affiche sur écran web
        UserWeb->>UserWeb: Peut filtrer/trier
    else User sur Mobile
        UserNotif->>UserMobile: Affiche sur mobile
        UserMobile->>UserMobile: Peut filtrer/trier
    end
    
    User->>App: Clique sur un résultat
    App->>Database: Charge détails complet du produit
    App->>UserNotif: Affiche profil du commerçant
```

### **Détail de la Détection de Fraude Commerçant**

```mermaid
graph TD
    A["FRAUDE DETECTOR"] -->|reçoit| B["Product ID<br/>Store ID"]
    
    B -->|récupère| C["Store Metrics"]
    C -->|includes| D["Account age<br/>Total orders<br/>Total complaints<br/>Average rating<br/>Return rate<br/>Chargeback rate"]
    
    B -->|récupère| E["Product Analysis"]
    E -->|checks| F["Image consistency<br/>Description vs reality<br/>Price vs market<br/>Stock vs sales"]
    
    B -->|analyse| G["Historical Patterns"]
    G -->|detects| H["Sudden price drops<br/>Mass complaints<br/>New account behavior<br/>Geographic anomalies"]
    
    C -->|calcul| I["SCORING MODEL"]
    E -->|calcul| I
    G -->|calcul| I
    
    I -->|poids| J["30% Historical Score<br/>40% Image Authenticity<br/>30% Market Analysis"]
    
    J -->|résultat| K["FRAUDE SCORE<br/>0-100"]
    
    K -->|output| L["0-30: SAFE ✅<br/>30-70: REVIEW ⚠️<br/>70-100: HIGH RISK 🚫"]
    
    L -->|action| M["Green Badge / Yellow Warning / Red Block"]
```

---

## 🧠 DIAGRAMME 38 - APPRENTISSAGE PREFERENTIAL EN CONTINU (Web + Mobile)

### **Vue Complète avec Synchronisation Cross-Device**

```mermaid
sequenceDiagram
    participant UserWeb as User<br/>(Web)
    participant UserMobile as User<br/>(Mobile)
    participant WebApp as Web App
    participant MobileApp as Mobile App
    participant EventBus as Event Bus<br/>Real-time
    participant ML as ML Engine<br/>Recommendations
    participant Database as Database<br/>User Profile
    participant EmbeddingStore as Embedding<br/>Store
    participant Cache as Cache<br/>10min TTL
    
    par Web Interaction
        UserWeb->>WebApp: Voit produit A
        WebApp->>EventBus: Event: "VIEW" {product_id, duration}
    and Mobile Interaction
        UserMobile->>MobileApp: Aime produit B
        MobileApp->>EventBus: Event: "LIKE" {product_id}
    and Mobile Interaction
        UserMobile->>MobileApp: Achète service C
        MobileApp->>EventBus: Event: "BUY" {product_id, amount}
    end
    
    EventBus->>EventBus: Accumule interactions
    EventBus->>Database: Enregistre dans user_interactions
    Database->>Cache: Met à jour cache utilisateur
    
    Database->>ML: Déclenche update user profile
    ML->>Database: Récupère toutes les interactions
    Database->>ML: Retourne: 500 views, 50 likes, 10 buys
    
    ML->>EmbeddingStore: Crée user embedding<br/>basé sur interactions
    EmbeddingStore->>EmbeddingStore: Analyse patterns<br/>- Préfère catégorie X<br/>- Aime prix Y-Z<br/>- Cherche près de localisation
    
    EmbeddingStore->>ML: User vector updated
    ML->>ML: Calcule recommendations<br/>- Similar items à liked<br/>- Trending dans ses catégories<br/>- Stores populaires près de lui
    
    ML->>Database: Stocke top 20 recommendations
    ML->>Cache: Cache recommendations (10 min)
    
    par Web reçoit update
        Database->>WebApp: Notification: Recommendations updated
        WebApp->>EventBus: WebSocket: Push update
        EventBus->>WebApp: New recommendations
        WebApp->>UserWeb: Affiche "Recommandé pour vous"
        UserWeb->>UserWeb: Voit produits pertinents
    and Mobile reçoit SAME update
        Database->>MobileApp: Notification: Recommendations updated
        MobileApp->>EventBus: WebSocket: Push update
        EventBus->>MobileApp: New recommendations
        MobileApp->>UserMobile: Affiche "Recommandé pour vous"
        UserMobile->>UserMobile: Voit mêmes produits (synchro)
    end
    
    par User interagit sur WEB
        UserWeb->>WebApp: Like un produit recommandé
        WebApp->>EventBus: Event: "LIKE_FROM_RECOMMENDATION"
    and User interagit sur MOBILE
        UserMobile->>MobileApp: Buy un produit recommandé
        MobileApp->>EventBus: Event: "BUY_FROM_RECOMMENDATION"
    end
    
    EventBus->>ML: Renforce ces patterns
    ML->>ML: ML améliore rapidement recommendations
    
    note over ML, Cache
        La prochaine fois que l'utilisateur ouvre l'app
        (web ou mobile), les recommendations seront
        encore plus pertinentes!
    end
```

### **Continuous Learning Loop**

```mermaid
graph TD
    A["Utilisateur Interagit<br/>(Web ou Mobile)"] -->|Event| B["Event Bus"]
    B -->|Enregistre| C["Database<br/>user_interactions"]
    C -->|Trigger| D["ML Engine"]
    D -->|Analyse| E["User Behavior Pattern"]
    E -->|Met à jour| F["User Embedding Vector<br/>pgvector"]
    F -->|Calcule| G["Personalized<br/>Recommendations"]
    G -->|Cache 10min| H["Redis Cache"]
    G -->|Push via| I["WebSocket to<br/>Web & Mobile"]
    I -->|affiche| J["Next time user opens<br/>Better recommendations!"]
    J -->|cycle continue| A
    
    K["Feedback Loop"] -->|Like/Buy| L["Strengthens patterns"]
    L -->|Signals| A
    
    M["Cross-device Sync"] -->|same user| N["Web sees what mobile liked"]
    M -->|same user| O["Mobile sees what web viewed"]
```

---

## 🎤 DIAGRAMME 53 - DARIJA VOICE COMMAND (Web + Mobile)

### **Vue Complète: Voice Commands en Darija**

```mermaid
sequenceDiagram
    participant UserWeb as User<br/>(Web)
    participant UserMobile as User<br/>(Mobile)
    participant WebApp as Web App<br/>Browser
    participant MobileApp as Mobile App
    participant AudioCapture as Audio<br/>Capture
    participant DarijaTranscriber as Darija<br/>Speech-to-Text
    participant CommandParser as Command<br/>Parser
    participant ActionExecutor as Action<br/>Executor
    participant VoiceResponse as Voice<br/>Response Engine
    participant Database as Database
    
    alt User sur WEB - Clique Microphone
        UserWeb->>WebApp: "Clique sur icône microphone"
        WebApp->>AudioCapture: Demande accès microphone
        AudioCapture->>WebApp: Permission acceptée
    else User sur MOBILE - Clique Microphone
        UserMobile->>MobileApp: "Clique sur icône microphone"
        MobileApp->>AudioCapture: Accès au microphone du téléphone
        AudioCapture->>MobileApp: Prêt
    end
    
    note over UserWeb, UserMobile
        L'expérience est IDENTIQUE sur les deux platforms
    end
    
    par Web Recording
        AudioCapture->>WebApp: Streaming audio en temps réel
    and Mobile Recording
        AudioCapture->>MobileApp: Streaming audio en temps réel
    end
    
    UserWeb->>AudioCapture: Parle: "Khdem promotion 20%"
    UserMobile->>AudioCapture: Parle: "Khdem promotion 20%"
    
    par Web Transcription
        AudioCapture->>DarijaTranscriber: Envoie audio Darija
    and Mobile Transcription
        AudioCapture->>DarijaTranscriber: Envoie audio Darija
    end
    
    DarijaTranscriber->>DarijaTranscriber: Transcrip Darija en temps réel
    DarijaTranscriber->>DarijaTranscriber: "Khdem promotion 20%"
    DarijaTranscriber->>CommandParser: Texte transcrit + context utilisateur
    
    CommandParser->>CommandParser: Parse commande Darija
    CommandParser->>CommandParser: Identifie: ACTION=Create, TYPE=Promotion, VALUE=20%
    CommandParser->>CommandParser: Extrait paramètres
    
    alt Commande valide
        CommandParser->>ActionExecutor: Execute: Create_Promotion(20%)
        ActionExecutor->>Database: Crée nouvelle promotion
        Database->>ActionExecutor: Promotion ID retourné
        ActionExecutor->>ActionExecutor: Prépare réponse vocal
        ActionExecutor->>VoiceResponse: "Promotion 20% créée avec succès!"
        VoiceResponse->>VoiceResponse: Synthèse vocale en Darija
    else Commande ambiguë
        CommandParser->>VoiceResponse: "Pouvez-vous préciser?"
        VoiceResponse->>VoiceResponse: Synthèse en Darija
    end
    
    par Web Output
        VoiceResponse->>WebApp: Audio response + text
        WebApp->>UserWeb: Affiche résultat textuel ET vocal
        UserWeb->>UserWeb: Écoute confirmation vocale
    and Mobile Output
        VoiceResponse->>MobileApp: Audio response + text
        MobileApp->>UserMobile: Affiche résultat textuel ET vocal
        UserMobile->>UserMobile: Écoute confirmation vocale
    end
    
    alt User satisfait
        UserWeb/UserMobile->>WebApp/MobileApp: Clique "Confirmer" OU
        UserWeb/UserMobile->>AudioCapture: Parle "Oui" ou "Confirm"
        WebApp/MobileApp->>Database: Finalise l'action
    else User corrige
        UserWeb/UserMobile->>AudioCapture: Parle la correction: "Non 25%"
        AudioCapture->>DarijaTranscriber: Retranscrit
        DarijaTranscriber->>CommandParser: Parse correction
        CommandParser->>ActionExecutor: Execute: Create_Promotion(25%)
        ActionExecutor->>VoiceResponse: Confirmation
        VoiceResponse->>WebApp/MobileApp: Affiche correction
    end
```

### **Exemples de Commandes Darija**

```
Format: [ACTION] [OBJECT] [PARAMETERS]

CRÉER (Create):
- "Khdem promotion 30%" → Create promotion 30%
- "Zid produit t-shirt" → Add product t-shirt
- "Khdem story" → Create story

CHERCHER (Search):
- "Wach kayn tablets?" → Show available tablets
- "Shufi stores jodod" → Show new stores
- "Recherche restaurants" → Find restaurants

MODIFIER (Update):
- "Beddel price 100 DH" → Change price to 100 DH
- "Ghayyar description" → Update description

SUPPRIMER (Delete):
- "Supp hada reel" → Delete this reel
- "Waqaf promotion" → Stop promotion
```

### **Darija Voice Command - Advanced Flow**

```mermaid
graph TD
    A["User Voice Input<br/>Darija"] -->|Stream| B["Speech-to-Text<br/>Darija Model"]
    B -->|Incremental| C["Partial Transcription<br/>Live Display"]
    C -->|Display to User| D["User sees what<br/>system heard"]
    
    A -->|Stop| E["Final Audio"]
    E -->|Process| B
    B -->|Final| F["Complete Transcription"]
    
    F -->|Parse| G["NLP Command Parser"]
    G -->|Extract| H["Intent + Entities<br/>Action, Object, Params"]
    
    H -->|Query| I["Context DB<br/>User preferences<br/>Current store"]
    I -->|Provide| J["Rich Context"]
    
    H -->|+| J -->|Execute| K["Action Handler"]
    
    K -->|Result| L["Success/Error"]
    L -->|Generate| M["Response Message<br/>Darija"]
    M -->|Synthesize| N["Text-to-Speech<br/>Darija Voice"]
    N -->|Play| O["User hears<br/>confirmation"]
    O -->|Display| P["Web or Mobile App"]
```

---

## 🤖 DIAGRAMME 54 - CHATBOT DARIJA AVEC CONTEXTE (Web + Mobile)

### **Vue Complète: Conversation Darija Contextuelle**

```mermaid
sequenceDiagram
    participant UserWeb as User<br/>(Web Chat)
    participant UserMobile as User<br/>(Mobile Chat)
    participant ChatUI as Chat Interface<br/>Web & Mobile
    participant ChatBus as Chat Message<br/>Bus
    participant DarijaProcessor as Darija<br/>Processor
    participant ContextEngine as Context<br/>Engine
    participant SearchService as Search<br/>Service
    participant Database as Database
    participant ChatResponse as Response<br/>Generator
    participant Sync as Cross-Device<br/>Sync
    
    alt User sur WEB ouvre chat
        UserWeb->>ChatUI: Clique sur icône chat
        ChatUI->>ChatUI: Charge historique conversation
    else User sur MOBILE ouvre chat
        UserMobile->>ChatUI: Ouvre chat
        ChatUI->>ChatUI: Charge historique (synchro depuis web)
    end
    
    UserWeb->>ChatUI: Tape ou parle: "Wach kayn tablets?"
    ChatUI->>ChatBus: Envoie message
    
    ChatBus->>DarijaProcessor: Traite message Darija
    DarijaProcessor->>DarijaProcessor: Traduit Darija en intent structuré
    DarijaProcessor->>DarijaProcessor: "Wach kayn tablets?" = "Are there tablets in stock?"
    
    DarijaProcessor->>ContextEngine: Envoie intent + user context
    ContextEngine->>Database: Récupère contexte utilisateur
    Database->>ContextEngine: User location, budget, history
    
    ContextEngine->>ContextEngine: Compile contexte:
    ContextEngine->>ContextEngine: - User géolocalisation: Tunis
    ContextEngine->>ContextEngine: - Budget préféré: 1000-2000 DH
    ContextEngine->>ContextEngine: - Historique achat: électronique
    
    ContextEngine->>SearchService: "Find tablets near Tunis, price 1000-2000"
    SearchService->>Database: Query avec contexte
    Database->>SearchService: Retourne 15 tablets pertinents
    
    par Analyse résultats
        SearchService->>SearchService: Trie par: relevance, distance, rating
        SearchService->>SearchService: Top 5 résultats
    end
    
    SearchService->>ChatResponse: Résultats trouvés
    ChatResponse->>ChatResponse: Génère réponse en Darija
    ChatResponse->>ChatResponse: "Kaynin 5 tablets jdad:<br/>1. Store X - 1500 DH - 2km away"
    
    ChatResponse->>ChatUI: Affiche réponse
    ChatUI->>UserWeb: Affiche: "Kaynin 5 tablets jdad:..."
    ChatUI->>UserWeb: Affiche thumbnail images
    ChatUI->>UserWeb: Affiche buttons: "Voir détails", "Acheter"
    
    par Sync to Mobile
        Sync->>UserMobile: Notification: "Chat history updated"
        ChatUI->>UserMobile: Affiche même conversation
    end
    
    UserWeb->>ChatUI: Clique "Voir détails" sur tablet 1
    ChatUI->>ChatBus: Event: "User clicked on tablet result"
    ChatBus->>SearchService: Load full tablet details
    
    UserWeb->>ChatUI: Tape: "Quel est le meilleur?"
    ChatUI->>DarijaProcessor: Process question
    DarijaProcessor->>ContextEngine: Parse: "Which one is best for my needs?"
    
    ContextEngine->>ContextEngine: Considère:
    ContextEngine->>ContextEngine: - User preferences (specs preferred)
    ContextEngine->>ContextEngine: - Price sensitivity
    ContextEngine->>ContextEngine: - Store ratings
    
    ContextEngine->>ChatResponse: Recommande #3 (meilleur rapport qualité/prix)
    ChatResponse->>ChatUI: "Tablet #3 est mieux: 1800 DH, 4.8★, RAM 4GB"
    
    ChatUI->>UserWeb: Affiche recommandation
    
    par User actions
        UserWeb->>ChatUI: "Je vais l'acheter"
        ChatUI->>Database: Log conversation + intent
    end
    
    par Sync all
        Sync->>UserMobile: Message history synced
        Sync->>Database: Conversation saved
    end
```

### **Chatbot Context Flow**

```mermaid
graph TD
    A["User Message<br/>Darija"] -->|Parse| B["Intent Extraction"]
    B -->|"Wach kayn tablets?"| C["Intent: SEARCH<br/>Entity: tablets"]
    
    C -->|Query| D["User Context DB"]
    D -->|Return| E["Location: Tunis<br/>Budget: 1000-2000<br/>History: Electronics"]
    
    C -->|+| E -->|Combined| F["Search Query<br/>WITH CONTEXT"]
    
    F -->|Query| G["Product Search"]
    G -->|Filter| H["Near Tunis<br/>Price 1000-2000<br/>Electronics category"]
    
    H -->|Rank| I["By relevance<br/>By distance<br/>By rating"]
    
    I -->|Results| J["Top 5 Products<br/>WITH RECOMMENDATIONS"]
    
    J -->|Generate| K["Darija Response<br/>Template"]
    K -->|Interpolate| L["Response Message"]
    L -->|Affiche| M["User sees contextual<br/>answer in Darija"]
    
    N["Multi-turn Dialog"] -->|Remember| O["Previous messages"]
    O -->|Improve| P["Next response quality"]
```

### **Exemples de Conversation Darija**

```
User: "Wach kayn coffee shops ljnab diali?"
Bot: "Kaynin 7 coffee shops jdad ljnab diak..."

User: "Amin les aqrab?"
Bot: "Coffee Blue - 300m away - Open now - 4.9★"

User: "Oukhtana ntat chi menu?"
Bot: "Menu: Espresso (15 DH), Cappuccino (20 DH)..."

User: "Nqass chi promo?"
Bot: "Yes! Promotion: Buy 2 get 1 free this weekend"

User: "Nstakhdim voucher?"
Bot: "Sure! Use code FRIDAY20 for 20% off"
```

---

## 🌐 ARCHITECTURE WEB + MOBILE SYNCHRONISÉE

```mermaid
graph TB
    subgraph "Web Platform"
        WEB["Next.js App<br/>Browser"]
        WSES["Web Session<br/>State"]
        WPUSH["Web WebSocket"]
    end
    
    subgraph "Mobile Platform"
        MOB["React Native/Flutter<br/>Mobile App"]
        MSES["Mobile Session<br/>State"]
        MPUSH["Mobile WebSocket"]
    end
    
    subgraph "Backend Sync Layer"
        SYNC["Sync Engine<br/>Supabase Realtime"]
        QUEUE["Message Queue<br/>Real-time"]
    end
    
    subgraph "AI & Services"
        DARIJA["Darija NLP"]
        VISION["Vision AI"]
        FRAUD["Fraud Detector"]
        SEARCH["Search Engine"]
    end
    
    subgraph "Data Layer"
        USER["User Profile"]
        CACHE["Cache<br/>Redis"]
        DB["PostgreSQL<br/>Supabase"]
    end
    
    WEB -->|State| WSES
    MOB -->|State| MSES
    
    WSES -->|Sync| SYNC
    MSES -->|Sync| SYNC
    
    WPUSH -->|WebSocket| SYNC
    MPUSH -->|WebSocket| SYNC
    
    SYNC -->|Update| WSES
    SYNC -->|Update| MSES
    
    WEB -->|API| DARIJA
    MOB -->|API| DARIJA
    
    WEB -->|API| VISION
    MOB -->|API| VISION
    
    DARIJA -->|Cache| CACHE
    VISION -->|Cache| CACHE
    FRAUD -->|Cache| CACHE
    
    CACHE -->|Read| USER
    CACHE -->|Read| DB
    
    USER -->|Query| DB
```

---

## ✅ RÉSUMÉ DES 4 WORKFLOWS PRIORITAIRES

| # | Workflow | Web | Mobile | Sync | Priorité |
|---|----------|-----|--------|------|----------|
| **35** | Recherche par Image + Fraude | ✅ | ✅ | Cross-device | **HAUTE** |
| **38** | Apprentissage Préférentiel | ✅ | ✅ | Real-time sync | **HAUTE** |
| **53** | Voice Commands Darija | ✅ | ✅ | Instant | **HAUTE** |
| **54** | Chatbot Darija | ✅ | ✅ | Real-time | **HAUTE** |

---

**Points clés:**
- 🌐 Chaque workflow fonctionne **identiquement** sur Web ET Mobile
- 🔄 Synchronisation en temps réel entre appareils
- 🎤 Support Darija natif
- 🛡️ Détection fraude intégrée
- ⚡ Performance optimisée avec cache
- 🔐 Authentification et RLS

