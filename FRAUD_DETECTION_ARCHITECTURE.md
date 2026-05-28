# 🔐 SYSTÈME DE DÉTECTION DE FRAUDE MULTI-COUCHE

**Projet**: Ro2ya.tn E-Commerce Marketplace  
**Date**: 26 Mai 2026  
**Statut**: ✅ COMPLÈTEMENT IMPLÉMENTÉ  
**Fichier Principal**: `lib/actions/fraud-detection.ts` (365 lines total)

---

## 📋 Vue d'Ensemble

Le système utilise une architecture **4 couches** pour analyser les commandes et réservations:

```
┌─────────────────────────────────────────────────────────────┐
│         COUCHE 1: COLLECTE SIGNAUX HEURISTIQUES              │
│    (Supabase: compte, activités, annulations, montants)     │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│      COUCHE 2: CALCUL SCORE HEURISTIQUE (0-100)              │
│         Somme pondérée des 7 signaux détectés               │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│     COUCHE 3: ANALYSE IA (OpenRouter - Llama 3)              │
│   Reasoning contextuel + recommandation texte (FR)           │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│   COUCHE 4: CLASSIFICATION FINALE + ACTION                   │
│  safe | suspicious | high_risk | blocked                    │
│  approve | review | reject                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 COUCHE 1: COLLECTE DES SIGNAUX HEURISTIQUES

### Fonction: `collectHeuristicSignals()` [Lines 39-215]

Analyse **7 signaux** différents en temps réel depuis Supabase:

### Signal 1️⃣: Compte Très Récent [Lines 60-82]

**Description**: Détecte les nouveaux comptes créés < 24h  
**Logique**:
- Compte < 1h → **HIGH (30 pts)**
- Compte < 24h → **MEDIUM (15 pts)**

```typescript
const accountAge = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // heures

if (accountAge < 1) {
  signals.push({
    type: "new_account_under_1h",
    severity: "high",
    description: "Compte créé il y a moins d'1 heure",
    weight: 30,
  });
}
```

**Signification**: Les fraudeurs utilisent souvent des comptes fraîchement créés.

---

### Signal 2️⃣: Rafale d'Activités (Velocity Fraud) [Lines 85-119]

**Description**: Détecte les commandes/réservations multiples en courte période  
**Logique**:
- COMMANDES: ≥5 en 1h → **HIGH (35 pts)** | ≥3 en 1h → **MEDIUM (20 pts)**
- RÉSERVATIONS: ≥3 en 1h → **HIGH (35 pts)** | ≥2 en 1h → **MEDIUM (20 pts)**

```typescript
const { count: activitiesLastHour } = await supabase
  .from(table)
  .select("*", { count: "exact", head: true })
  .eq("customer_id", ctx.customer_id)
  .gte("created_at", oneHourAgo);

if ((activitiesLastHour ?? 0) >= burstThresholdHigh) {
  signals.push({
    type: `${ctx.entity_type.toLowerCase()}_burst_1h`,
    severity: "high",
    description: `${activitiesLastHour} ${isOrder ? 'commandes' : 'réservations'} en 1 heure`,
    weight: 35,
  });
}
```

**Signification**: Pattern courant de fraude - tester rapidement plusieurs transactions.

---

### Signal 3️⃣: Taux d'Annulation Élevé [Lines 122-133]

**Description**: Détecte les patterns d'annulation suspect  
**Logique**: ≥3 commandes/réservations annulées en 24h → **MEDIUM (20 pts)**

```typescript
const { count: cancelledActivities } = await supabase
  .from(table)
  .select("*", { count: "exact", head: true })
  .eq("customer_id", ctx.customer_id)
  .in("status", ["CANCELLED", "REJECTED"])
  .gte("created_at", oneDayAgo);

if ((cancelledActivities ?? 0) >= 3) {
  signals.push({
    type: "high_cancellation_rate",
    severity: "medium",
    description: `${cancelledActivities} activités annulées/rejetées en 24h`,
    weight: 20,
  });
}
```

**Signification**: Les fraudeurs testent souvent et annulent quand ils sont détectés.

---

### Signal 4️⃣: Montant Anormalement Élevé [Lines 136-178]

**Description**: Détecte les montants aberrants par rapport à la boutique  
**Logique**:
- Montant > 4x moyenne → **HIGH (25 pts)**
- Montant > 2.5x moyenne → **LOW (10 pts)**
- Baseline fallback: 500 TND

```typescript
const priceColumn = isOrder ? "total_price" : "price";
const { data: avgActivity } = await supabase
  .from(table)
  .select(priceColumn)
  .eq("store_id", ctx.store_id)
  .eq("status", "COMPLETED")
  .limit(50);

let avg = 500; // Fallback
if (avgActivity && avgActivity.length > 5) {
  avg = avgActivity.reduce((sum, o) => sum + (o[priceColumn] ?? 0), 0) / avgActivity.length;
}

if (ctx.total > avg * 4) {
  signals.push({
    type: "abnormal_amount",
    severity: "high",
    description: `Montant ${ctx.total} TND — ${Math.round(ctx.total / avg)}x la moyenne (${Math.round(avg)} TND)`,
    weight: 25,
  });
}
```

**Signification**: Un montant 4x supérieur est hautement suspect.

---

### Signal 5️⃣: Quantité Suspecte [Lines 181-188]

**Description**: Détecte les grandes quantités (commandes seulement)  
**Logique**: Quantité > 20 unités → **MEDIUM (15 pts)**

```typescript
if (isOrder && ctx.quantity && ctx.quantity > 20) {
  signals.push({
    type: "bulk_quantity",
    severity: "medium",
    description: `Quantité inhabituelle: ${ctx.quantity} unités`,
    weight: 15,
  });
}
```

**Signification**: Peut indiquer du bulk fraud ou du reselling.

---

### Signal 6️⃣: Adresse de Livraison Invalide [Lines 191-198]

**Description**: Détecte les adresses incomplètes ou suspectes (commandes seulement)  
**Logique**: Adresse vide ou < 10 caractères → **MEDIUM (15 pts)**

```typescript
if (isOrder && (!ctx.delivery_address || ctx.delivery_address.trim().length < 10)) {
  signals.push({
    type: "invalid_address",
    severity: "medium",
    description: "Adresse de livraison incomplète ou invalide",
    weight: 15,
  });
}
```

**Signification**: Les fraudeurs utilisent souvent des adresses invalides.

---

### Signal 7️⃣: Spam sur Même Boutique [Lines 201-216]

**Description**: Détecte les attaques ciblées sur une boutique spécifique  
**Logique**: ≥3 activités PENDING chez même merchant en 1h → **HIGH (30 pts)**

```typescript
const { count: sameBusinessActivities } = await supabase
  .from(table)
  .select("*", { count: "exact", head: true })
  .eq("customer_id", ctx.customer_id)
  .eq("store_id", ctx.store_id)
  .eq("status", "PENDING")
  .gte("created_at", oneHourAgo);

if ((sameBusinessActivities ?? 0) >= 3) {
  signals.push({
    type: `same_business_spam`,
    severity: "high",
    description: `${sameBusinessActivities} activités PENDING chez le même merchant en 1h`,
    weight: 30,
  });
}
```

**Signification**: Pattern de fraude ciblée contre une boutique.

---

## 📊 COUCHE 2: CALCUL DU SCORE HEURISTIQUE

### Fonction: `computeHeuristicScore()` [Lines 217-221]

Additionne les poids de tous les signaux avec plafond à 100:

```typescript
function computeHeuristicScore(signals: FraudSignal[]): number {
  const rawScore = signals.reduce((sum, s) => sum + s.weight, 0);
  return Math.min(100, rawScore); // Maximum 100
}
```

### Exemples de Calcul

**Cas 1: Commande Normale**
```
Signaux détectés: []
Score: 0/100
```

**Cas 2: Compte Récent + Montant Élevé**
```
Signal 1 (compte < 24h): +15
Signal 4 (montant 3x moyenne): +25
Score: 40/100
```

**Cas 3: Attaque Coordinée**
```
Signal 1 (compte < 1h): +30
Signal 2 (5 commandes en 1h): +35
Signal 5 (quantité 30): +15
Signal 6 (adresse invalide): +15
Score: MIN(95, 100) = 95/100
```

---

## 🤖 COUCHE 3: ANALYSE IA (OpenRouter)

### Fonction: `analyzeWithAI()` [Lines 223-303]

Si `signals.length > 0` OU `heuristicScore ≥ 15`, l'IA analyse le contexte complet.

### Cascade de Modèles (Fallback Strategy)

```typescript
const modelChain = [
  process.env.OPENROUTER_MODEL,        // Modèle configuré
  "meta-llama/llama-3.2-3b-instruct",  // 3B instruct
  "meta-llama/llama-3.3-70b-instruct", // 70B instruct
  "meta-llama/llama-3.2-3b-instruct:free",  // Free tier
  "meta-llama/llama-3.3-70b-instruct:free", // Free tier
].filter(Boolean);
```

Si un modèle échoue, le suivant est utilisé automatiquement.

### Input IA

```
Tu es un système anti-fraude pour Ro2ya, une marketplace tunisienne.

Analyse cette COMMANDE suspecte et donne un avis court (2-3 phrases max) en français:

CONTEXTE:
- Type: ORDER
- Montant: 1500 TND
- Quantité: 25 unités
- Adresse: "Tunis"
- Score heuristique: 75/100

SIGNAUX DÉTECTÉS:
- [HIGH] Compte créé il y a moins d'1 heure (+30pts)
- [HIGH] 5 commandes en 1 heure (+35pts)
- [MEDIUM] Quantité inhabituelle: 25 unités (+15pts)

Donne uniquement ton analyse du risque et si le merchant doit approuver, vérifier manuellement ou rejeter. Sois direct et concis.
```

### Output IA

```
Score de risque très élevé. Vérification manuelle fortement recommandée avant validation.
```

### Fallback (Sans IA)

Si OpenRouter échoue:
```typescript
if (heuristicScore >= 75) 
  return "Score de risque très élevé. Vérification manuelle fortement recommandée.";
if (heuristicScore >= 55) 
  return "Plusieurs signaux suspects détectés. Contacter le client pour vérification.";
return "Signaux mineurs détectés. Peut être approuvé avec vigilance.";
```

---

## 📍 COUCHE 4: CLASSIFICATION FINALE

### Score Thresholds [Lines 33-37]

```typescript
const SCORE_THRESHOLDS = {
  safe: 25,          // Score < 25
  suspicious: 55,    // Score 25-54
  high_risk: 75,     // Score 55-74
                     // Score ≥ 75 = blocked
};
```

### Matrice de Décision

| Score | Niveau | Couleur | Recommandation | Action Automatique |
|-------|--------|--------|---|---|
| **0-24** | 🟢 SAFE | Vert | ✅ APPROVE | Approuver directement |
| **25-54** | 🟡 SUSPICIOUS | Jaune | ⏸️ REVIEW | Demander vérification |
| **55-74** | 🟠 HIGH_RISK | Orange | ❌ REJECT | Rejeter la transaction |
| **≥75** | 🔴 BLOCKED | Rouge | ❌ REJECT | Bloquer automatiquement |

### Fonctions de Classification [Lines 305-318]

```typescript
function computeLevel(score: number): FraudAnalysis["level"] {
  if (score < SCORE_THRESHOLDS.safe) return "safe";
  if (score < SCORE_THRESHOLDS.suspicious) return "suspicious";
  if (score < SCORE_THRESHOLDS.high_risk) return "high_risk";
  return "blocked";
}

function computeRecommendation(level: FraudAnalysis["level"]): FraudAnalysis["recommendation"] {
  if (level === "safe") return "approve";
  if (level === "suspicious") return "review";
  return "reject";
}
```

---

## 🎯 FONCTION PRINCIPALE: `analyzeFraud()` [Lines 323-333]

```typescript
export async function analyzeFraud(ctx: FraudContext): Promise<FraudAnalysis> {
  // Step 1: Collecte signaux
  const signals = await collectHeuristicSignals(ctx);
  
  // Step 2: Score heuristique
  const heuristicScore = computeHeuristicScore(signals);
  
  // Step 3: Analyse IA
  const ai_reasoning = await analyzeWithAI(ctx, signals, heuristicScore);
  
  // Step 4: Niveau final
  const level = computeLevel(heuristicScore);

  // Résultat complet
  return {
    score: heuristicScore,
    level,
    signals,
    recommendation: computeRecommendation(level),
    ai_reasoning,
    checked_at: new Date().toISOString(),
  };
}
```

---

## 📊 INTERFACES TYPESCRIPT [Lines 7-31]

### FraudContext (Input)
```typescript
export interface FraudContext {
  customer_id: string;        // UUID utilisateur
  store_id: number;           // ID boutique
  item_id: number;            // ID produit/service
  quantity?: number;          // Quantité commandée
  total: number;              // Montant en TND
  delivery_address?: string;  // Adresse livraison (ORDER only)
  customer_ip?: string;       // IP client (optional)
  entity_type: 'ORDER' | 'BOOKING';  // Type transaction
}
```

### FraudSignal (Signal Détecté)
```typescript
export interface FraudSignal {
  type: string;                    // Identifiant signal
  severity: "low" | "medium" | "high";
  description: string;             // Description lisible
  weight: number;                  // Contribution au score (0-100)
}
```

### FraudAnalysis (Output)
```typescript
export interface FraudAnalysis {
  score: number;                               // 0-100
  level: "safe" | "suspicious" | "high_risk" | "blocked";
  signals: FraudSignal[];                      // Tous les signaux détectés
  recommendation: "approve" | "review" | "reject";
  ai_reasoning: string;                        // Explication IA
  checked_at: string;                          // Timestamp ISO
}
```

---

## 💾 SAUVEGARDE EN BASE DE DONNÉES

### Fonction: `saveFraudAnalysis()` [Lines 337-365]

```typescript
export async function saveFraudAnalysis(
  entityId: number,
  analysis: FraudAnalysis,
  type: 'ORDER' | 'BOOKING'
): Promise<void>
```

Sauvegarde dans:
- **`order_fraud_checks`** si type = ORDER
- **`booking_fraud_checks`** si type = BOOKING

**Colonnes sauvegardées**:
```
order_id / booking_id (PK)
├─ score: number
├─ level: string (safe|suspicious|high_risk|blocked)
├─ signals: JSON[] (array of FraudSignal)
├─ recommendation: string (approve|review|reject)
├─ ai_reasoning: text
└─ checked_at: timestamp
```

---

## 📈 CAS D'USAGE RÉELS

### Cas 1: Commande Suspecte - SCORE ÉLEVÉ ❌

```json
{
  "customer_id": "new-user-123",
  "store_id": 1,
  "item_id": 100,
  "quantity": 50,
  "total": 2000,
  "delivery_address": "XYZ",
  "entity_type": "ORDER"
}
```

**Signaux Détectés**:
1. ✓ Nouveau compte < 1h (+30)
2. ✓ 5 commandes en 1h (+35)
3. ✓ Montant 4x moyenne (+25)
4. ✓ Quantité > 20 (+15)
5. ✓ Adresse < 10 chars (+15)

**Score**: 120 → capped at 100  
**Level**: BLOCKED 🔴  
**Recommendation**: REJECT ❌  
**Action**: Bloquer automatiquement

---

### Cas 2: Réservation Normale - SCORE BAS ✅

```json
{
  "customer_id": "regular-user-456",
  "store_id": 5,
  "item_id": 200,
  "total": 50,
  "entity_type": "BOOKING"
}
```

**Signaux Détectés**: Aucun

**Score**: 0  
**Level**: SAFE 🟢  
**Recommendation**: APPROVE ✅  
**Action**: Approuver directement

---

### Cas 3: Transaction Modérée - SCORE MOYEN ⏸️

```json
{
  "customer_id": "user-789",
  "store_id": 3,
  "item_id": 50,
  "quantity": 10,
  "total": 600,
  "delivery_address": "12 Rue de la Paix, Tunis",
  "entity_type": "ORDER"
}
```

**Signaux Détectés**:
1. ✓ Compte < 24h (+15)
2. ✓ Montant 2.5x moyenne (+10)

**Score**: 25  
**Level**: SUSPICIOUS 🟡  
**Recommendation**: REVIEW ⏸️  
**AI Reasoning**: "Plusieurs signaux suspects détectés. Contacter le client pour vérification."  
**Action**: Demander vérification manuelle

---

## 🔧 INTÉGRATION DANS LES WORKFLOWS

### WF-20: Passer Commande

```
Client → Click "Acheter"
       ↓
Créer Order dans Supabase (status: PENDING)
       ↓
POST /api/fraud/analyze {ctx}
       ↓
analyzeFraud() → FraudAnalysis
       ↓
IF score >= 75:
   ├─ Order status = FRAUD_BLOCKED
   └─ Alert Admin
ELSE IF score >= 55:
   ├─ Order status = FRAUD_REVIEW
   └─ Alert Admin + Email Client
ELSE:
   ├─ Order status = CONFIRMED
   └─ Proceed normally
```

### WF-22: Validation QR

```
Seller → Scan Order QR
        ↓
Retrieve order_fraud_checks
        ↓
IF recommendation = "reject":
   └─ Block delivery
ELSE:
   └─ Allow delivery + Mark COMPLETED
```

---

## 📈 MÉTRIQUES & PERFORMANCES

### Accuracy Targets

- **False Positive Rate**: < 2% (éviter de rejeter les bons clients)
- **True Fraud Catch Rate**: > 95% (détecter les fraudeurs)
- **Average Check Latency**: < 500ms (analyse rapide)
- **Chargeback Rate**: 0.3% (protection vendeur)

### Volume Estimé

- **Orders/day**: 10,000+
- **Fraud checks/day**: 10,000+
- **DB Storage**: ~5MB/day (signals JSON)
- **API calls OpenRouter**: ~1,000/day

---

## 🛡️ LIMITATIONS & FALLBACKS

1. **Sans IA (OpenRouter down)**:
   - Utilise score heuristique uniquement
   - Retourne texte par défaut

2. **Sans Supabase (Database down)**:
   - Impossible de collecter signaux
   - Retourne niveau "safe" par défaut (graceful degradation)

3. **Score Plafond**:
   - Limite à 100 pts même si total > 100
   - Évite les scores aberrants

4. **Thresholds Configurables**:
   - Les limites (safe: 25, suspicious: 55, etc) peuvent être ajustées
   - Permet tuning par expérience réelle

---

## 🚀 AMÉLIORATIONS FUTURES

1. **Machine Learning**:
   - Entraîner un modèle sur l'historique
   - Remplacer heuristiques par prédictions ML

2. **Signaux Additionnels**:
   - Géo-velocity (order from 2 countries in 10min)
   - Device fingerprinting
   - Email domain analysis

3. **Rate Limiting**:
   - Bloquer après N tentatives échouées
   - Progressive backoff

4. **Chargeback Monitoring**:
   - Tracker les chargebacks par customer
   - Incrementer score pour récidivistes

5. **3D Secure Integration**:
   - Valider authentification 3D
   - Augmenter confiance pour approuvé

---

**Document Généré**: 26 Mai 2026  
**Statut**: ✅ COMPLET & OPÉRATIONNEL  
**Auteur**: Ro2ya Technical Team
