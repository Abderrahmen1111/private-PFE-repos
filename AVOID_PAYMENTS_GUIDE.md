# ⚠️ GUIDE: ÉVITER COMPLÈTEMENT LES PAIEMENTS

**Projet**: Ro2ya.tn E-Commerce Marketplace  
**Objectif**: Désactiver/Éviter toutes les fonctionnalités liées aux paiements  
**Date**: 25 Mai 2026

---

## 📋 SOMMAIRE DES ÉLÉMENTS DE PAIEMENT

### 1. WORKFLOWS AFFECTÉS PAR LES PAIEMENTS

| Workflow | Impact | Solution |
|----------|--------|----------|
| WF-20: Passer Commande | ✅ Création sans paiement possible | Ignorer phase paiement |
| WF-21: Accepter Commande | ✅ OK - Pas de paiement | AUCUNE ACTION |
| WF-22: Validation QR | ✅ OK - Validation délivrance | AUCUNE ACTION |
| WF-28: AI Sales Intelligence | ✅ OK - Analytics seulement | AUCUNE ACTION |
| WF-41: AI Agent Chat | ✅ OK - Chat seulement | AUCUNE ACTION |
| WF-42: Validation Transaction | ❌ PROBLÈME - Référence paiement | À modifier |
| WF-44: Gestion Transactionnel | ❌ PROBLÈME - Affiche montants | À modifier |

---

## 🔴 FICHIERS À DÉSACTIVER/MODIFIER

### 1. Workers de Paiement (À SUPPRIMER ou DÉSACTIVER)

#### ❌ `app/api/workers/payment-retry/route.ts`
**Rôle**: Vérifie si paiement confirmé, retry si non validé  
**Action**: SUPPRIMER ou laisser vide

```typescript
// ACTUEL - Logique de retry paiement
if (order.status !== 'VALIDATED' && order.status !== 'COMPLETED') {
    throw new Error('Payment not yet confirmed. Retrying...');
}

// À FAIRE: Supprimer ce fichier complètement
// OU remplacer par:
return NextResponse.json({ success: true, message: 'Skipped payment check' });
```

#### ❌ `app/api/workers/process-refund/route.ts`
**Rôle**: Traite les remboursements (mock)  
**Action**: SUPPRIMER ou remplacer

```typescript
// ACTUEL - Logique de remboursement
// Call external 3rd-party Payment Provider API to process money refund here
await new Promise(resolve => setTimeout(resolve, 500)); // Mock
await cancelOrder(Number(orderId), reason || 'Refund resolved...');

// À FAIRE: Retirer la logique ou simplement retourner succès
```

#### ❌ `app/api/webhooks/order/refund/route.ts`
**Rôle**: Webhook de remboursement  
**Action**: SUPPRIMER ou laisser comme trace

---

### 2. Appels QStash (Payment Retry Jobs) - À DÉSACTIVER

#### Fichier: `lib/actions/orders.ts` (ligne ~50-60)

```typescript
// ❌ ACTUEL - Lance job de vérification paiement
await publishQStashEvent('payment-retry', { orderId: order.id }, 120);

// ✅ À FAIRE - COMMENTEZ ou SUPPRIMEZ cette ligne
// await publishQStashEvent('payment-retry', { orderId: order.id }, 120);
```

**Impact**: Arrête les jobs de vérification de paiement automatiques toutes les 2 minutes

#### Fonction à modifier: `publishQStashEvent`

Définition trouvée dans `lib/actions/orders.ts`:

```typescript
const publishQStashEvent = async (endpoint: string, payload: any, delay: number = 0) => {
  if (!qstash) return;  // ← Déjà protégé si pas de QSTASH_TOKEN
  try {
    await qstash.publishJSON({
      url: `${siteUrl}/api/workers/${endpoint}`,
      body: payload,
      delay
    });
  } catch (err) {
    console.error(`[QStash] Failed to publish ${endpoint}:`, err);
  }
};
```

**Action**: Laisser vide ou retourner immédiatement pour ne pas publier

---

### 3. Logique de Fraude & Transactions

#### Fichier: `lib/actions/fraud-detection.ts`
**Rôle**: Analyse fraude sur paiements  
**Action**: Peut rester (non-invasif) ou SUPPRIMER

```typescript
export interface FraudAnalysis {
  score: number;      // 0 = sûr, 100 = fraude
  level: "safe" | "suspicious" | "high_risk" | "blocked";
  // ... etc
}

export async function analyzeFraud(context: FraudContext): Promise<FraudAnalysis>
```

**À faire**:
- Ou ignorer les résultats en frontend
- Ou retourner toujours `level: "safe"`

---

### 4. Système de Transactions (À ADAPTER ou LAISSER)

#### Fichiers: 
- `lib/actions/transactions.ts`
- `app/api/dashboard/[storeId]/transactions/route.ts`
- `app/dashboard/[id]/transactions/page.tsx`

**Rôle**: 
- Syncs commandes/réservations → table transactions
- Affiche l'historique des transactions aux vendeurs
- **NE TRAITE PAS VRAIMENT PAIEMENT** (juste suivi)

**Action**: Optionnel
- ✅ **Laisser**: Utile pour audit trail
- ❌ **Supprimer**: Si veulent éviter mentions de montants/paiements

**Si supprimer**, modifier `lib/actions/orders.ts`:

```typescript
// Avant:
await syncOrderTransaction(order, supabase);

// Après:
// await syncOrderTransaction(order, supabase);  // Commenté
```

---

## ✅ ACTIONS CONCRÈTES À FAIRE

### ÉTAPE 1: Désactiver QStash Payment Retry

**Fichier**: `lib/actions/orders.ts`

À la ligne ~60 (après création de la commande):

```typescript
// ❌ AVANT
await publishQStashEvent('payment-retry', { orderId: order.id }, 120);

// ✅ APRÈS
// PAYMENT RETRY DISABLED - Eviter tous paiements
// await publishQStashEvent('payment-retry', { orderId: order.id }, 120);
```

**Effet**: Plus de vérification automatique de paiement

---

### ÉTAPE 2: Vider Workers de Paiement

**Fichier**: `app/api/workers/payment-retry/route.ts`

Remplacer tout par:

```typescript
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // PAYMENT RETRY DISABLED - All payments skipped
  return NextResponse.json({ 
    success: true, 
    message: 'Payment retry disabled - no payment processing' 
  }, { status: 200 })
}
```

**Fichier**: `app/api/workers/process-refund/route.ts`

Remplacer tout par:

```typescript
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // REFUND PROCESSING DISABLED - No actual refunds
  return NextResponse.json({ 
    success: true, 
    message: 'Refund processing disabled - no payment handling' 
  }, { status: 200 })
}
```

---

### ÉTAPE 3: Désactiver Sync de Transactions (Optionnel)

**Fichier**: `lib/actions/orders.ts`

À la ligne ~55 (après création de la commande):

```typescript
// ❌ AVANT
if (order) {
    await syncOrderTransaction(order, supabase);
    await publishQStashEvent('payment-retry', { orderId: order.id }, 120);
}

// ✅ APRÈS - Commenté si ne veulent pas tracker
if (order) {
    // TRANSACTION SYNC DISABLED - Eviter suivi de paiements
    // await syncOrderTransaction(order, supabase);
    // PAYMENT RETRY DISABLED
    // await publishQStashEvent('payment-retry', { orderId: order.id }, 120);
}
```

---

### ÉTAPE 4: Masquer Table Transactions en Frontend (Optionnel)

**Fichier**: `app/dashboard/[id]/transactions/page.tsx`

**Option A**: Supprimer complètement la route ou rediriger

```typescript
// Au début du page.tsx
import { redirect } from 'next/navigation';

export default function TransactionsPage() {
  // Redirect to dashboard home to avoid transaction tracking
  redirect('/dashboard/[id]');
}
```

**Option B**: Afficher message "Désactivé"

```typescript
export default function TransactionsPage() {
  return (
    <div className="p-8">
      <h1>Gestion des Transactions</h1>
      <p className="text-gray-500">
        Les transactions et paiements ont été désactivés dans cette application.
      </p>
    </div>
  );
}
```

---

### ÉTAPE 5: Modifier WF-20 (Passer Commande)

**Impact**: Clients peuvent encore créer commandes mais sans paiement

**Fichier**: `lib/actions/orders.ts`

Après création commande, statut reste `PENDING` (pas de paiement requis):

```typescript
// Actuel - Statut PENDING (attend paiement/validation)
status: 'PENDING',

// Alternatif - Directement CONFIRMED (sans paiement)
status: process.env.SKIP_PAYMENT === 'true' ? 'CONFIRMED' : 'PENDING',
```

Puis ajouter `.env`:
```
SKIP_PAYMENT=true
```

---

## 📊 RÉSUMÉ DES DÉSACTIVATIONS

| Élément | Fichier | Action | Impact |
|---------|---------|--------|--------|
| QStash Payment Retry | `lib/actions/orders.ts` | Commenter ligne ~60 | Plus de vérif paiement auto |
| Payment Retry Worker | `app/api/workers/payment-retry/route.ts` | Vider handler | Endpoint retourne succès |
| Refund Worker | `app/api/workers/process-refund/route.ts` | Vider handler | Endpoint retourne succès |
| Transaction Sync | `lib/actions/orders.ts` | Commenter ligne ~55 | Plus de suivi transaction |
| Transactions Dashboard | `app/dashboard/[id]/transactions/page.tsx` | Redirect ou message | Masquer UI transactionnel |

---

## ⚡ IMPACT SUR WORKFLOWS

Après ces modifications:

| Workflow | Avant | Après |
|----------|-------|-------|
| WF-20: Passer Commande | Création + attente paiement | Création directe (PENDING) |
| WF-21: Accepter Commande | Normal | Normal (pas de paiement) |
| WF-42: Validation Transaction | Affiche transact/paiements | ❌ Désactivé/Masqué |
| WF-44: Gestion Transactionnel | Voir toutes transact | ❌ Désactivé/Masqué |
| WF-45: Gestion Sociale | Normal | Normal (pas lié paiement) |

---

## 🔒 SÉCURITÉ

**Attention**: Ces modifications:
- ✅ Arrêtent vérification de paiement
- ✅ Désactivent remboursement automatique
- ❌ NE SUPPRIMENT PAS les données (commandes restent en DB)
- ❌ NE SUPPRIMENT PAS les webhooks (ils existent juste vides)

**Recommandation**: 
- Garder backup avant modification
- Tester en staging d'abord
- Les commandes restent créables mais sans paiement vérifiable

---

## ✔️ VÉRIFICATION POST-MODIFICATION

Après implémenter ces changements, vérifier:

```bash
# 1. Tester création commande
curl -X POST /api/orders \
  -H "Content-Type: application/json" \
  -d '{"store_id": 1, "item_id": 1, "quantity": 1, "total_price": 100}'

# 2. Vérifier commande créée sans paiement
# Status devrait être: PENDING (pas d'erreur paiement)

# 3. Vérifier QStash job ne lancé pas
# Logs ne doivent pas show "publishQStashEvent: payment-retry"

# 4. Vérifier transactions vides/masquées
# GET /dashboard/[id]/transactions → 404 ou message
```

---

## 📝 NOTES FINALES

1. **L'app NE utilise PAS Stripe** - Juste mock de paiement
2. **Paiement = QStash retry + statut PENDING/VALIDATED**
3. **Transactions = suivi non-critiques**
4. **Commandes restent créables** - Juste sans vérif paiement
5. **Remboursements = worker vide** - Pas d'implémentation réelle

**Résultat**: Application fonctionne sans traiter aucun paiement réel ✅

