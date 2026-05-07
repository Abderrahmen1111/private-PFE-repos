# 🤖 Choix Technologiques IA - Ro2ya Marketplace

**Date:** Mai 2026  
**Document:** Justification des services IA choisis

---

## 📊 Comparaison: Qui utilisons-nous et POURQUOI?

### Stack IA Actuelle

```
┌─────────────────────────────────────────────────────┐
│             Ro2ya AI Stack (Réel)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1️⃣ Groq (Llama 3.1 8B)                           │
│     ├─ Classification d'intent                     │
│     ├─ NLP Tunisien                               │
│     └─ Routing des requêtes                       │
│                                                     │
│  2️⃣ Gemini (Google)                               │
│     ├─ Chat & Conversations                       │
│     ├─ Streaming en temps réel                    │
│     └─ Assistant virtuel                          │
│                                                     │
│  3️⃣ OpenRouter (baai/bge-m3)                      │
│     ├─ Embeddings vectoriels                      │
│     ├─ Recherche sémantique                       │
│     └─ Support Darija multilingue                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Pourquoi Groq et PAS Anthropic?

### 1️⃣ Groq (Llama 3.1 8B) ✅ Choisi

| Aspect | Groq | Anthropic Claude 3 |
|--------|------|-------------------|
| **Vitesse** | ⚡⚡⚡ Ultra-rapide (50 tokens/s) | ⚡⚡ Rapide |
| **Coût** | 💰 Très économique (~$0.05 par 1M tokens) | 💸 Cher (~$3-15 par 1M tokens) |
| **Latence** | <100ms moyenne | 500ms-2s |
| **Intent Classification** | Parfait pour (rapide) | Overkill (trop puissant) |
| **Rate Limit** | Généreux pour MVP | Strict |
| **Support Darija** | ✅ Llama comprend bien | ✅ Mais trop cher |

**Verdict:** Pour la **classification d'intent** (décider si c'est "search", "chat", "analytics"), Groq est **parfait et moins cher**.

---

### 2️⃣ Gemini (Google) ✅ Choisi

| Aspect | Gemini 2.0 | Anthropic Claude 3 |
|--------|-----------|-------------------|
| **Polyvalence** | ✅ Chat + Vision | ✅ Chat uniquement |
| **Streaming** | ✅ Excellent | ✅ Excellent |
| **Coût** | 💰 Gratuit (tier free) | 💸 Payant |
| **Context Window** | 1M tokens | 200K tokens |
| **Vision (Images)** | ✅ Intégré | ❌ Séparé |
| **Tunisie Support** | ✅ Bon pour Darija | ✅ Bon pour Darija |
| **Rate Limits** | Généreux (free tier) | Limité |

**Verdict:** Gemini est **plus polyvalent** (chat + vision) pour le même prix/gratuit.

---

### 3️⃣ OpenRouter (Embeddings) ✅ Choisi

| Aspect | OpenRouter (baai/bge-m3) | Anthropic |
|--------|--------------------------|-----------|
| **Modèle** | baai/bge-m3 (1024 dims) | Pas d'embeddings |
| **Multilingue** | ✅ Excellent Darija | N/A |
| **Coût Embeddings** | 💰 Très bon marché | N/A |
| **Performance** | ✅ State-of-art | N/A |

**Verdict:** Anthropic **ne fait pas d'embeddings**, impossible de l'utiliser pour recherche sémantique.

---

## 🎯 Cas d'Usage: Pourquoi chaque service?

### 📌 Cas 1: Utilisateur cherche "نتاع الشعر" (Produits cheveux)

```
Utilisateur: "نتاع الشعر"
        ↓
[Groq - Intent Classification]
"C'est une RECHERCHE"
        ↓
[OpenRouter - Embeddings]
Générer vecteur pour: "produits cheveux"
        ↓
[Base de données pgvector]
Chercher produits similaires
        ↓
Résultats: Shampooing, Après-shampoing, Masque
```

**Pourquoi Anthropic ne marche pas:**
- ❌ Anthropic n'a pas d'API embeddings
- ❌ Coûterait 10x plus cher pour classifier
- ❌ Pas nécessaire pour cette use case simple

---

### 📌 Cas 2: Chat avec Assistant du Magasin

```
Client: "Salut! Vous avez des produits bio?"
        ↓
[Groq - Intent Classification]
"C'est un CHAT"
        ↓
[Gemini - Chat Principal]
Streaming de la réponse en temps réel
        ↓
"Oui! Nous avons 15 produits bio..."
```

**Pourquoi Anthropic ne marche pas:**
- ❌ Coûterait 20x plus cher
- ❌ Gemini est aussi bon
- ❌ Gemini a meilleur streaming

---

### 📌 Cas 3: Admin analyse ses ventes

```
Admin: "Quels sont mes 5 produits les plus vendus?"
        ↓
[Groq - Intent Classification]
"C'est ANALYTICS"
        ↓
[Gemini - Chat + Contexte]
Récupère données BD + génère rapport
        ↓
Graphique des ventes
```

**Pourquoi Anthropic ne marche pas:**
- ❌ Overkill pour cette use case
- ❌ Prix: 10-20x plus cher
- ❌ Pas besoin pour PFE MVP

---

## 💰 Analyse de Coût: Groq vs Anthropic

### Scénario: 100K utilisateurs/mois

```
GROQ (Llama 3.1 8B):
└─ Classification intent: 100K × 50 tokens = 5M tokens
   Coût: 5M × $0.05 / 1M = $0.25/mois
   ✅ Gratuit (tier free)

ANTHROPIC (Claude 3 Haiku):
└─ Classification intent: 100K × 50 tokens = 5M tokens
   Coût: 5M × $0.25 / 1M = $1.25/mois
   💸 5x plus cher

───────────────────────────────────────

GEMINI (Free tier):
└─ Chat: 60K requêtes
   Coût: GRATUIT (free tier)
   ✅ $0/mois

ANTHROPIC (Claude 3):
└─ Chat: 60K requêtes
   Coût: 60K × 100 tokens × $3 / 1M = $18/mois
   💸 18x plus cher

───────────────────────────────────────

TOTAL/MOIS:
Groq + Gemini + OpenRouter = ~$0-5 (mostly free)
Anthropic Claude 3 = ~$20-50+
```

**Économies: 80-90% en utilisant Groq + Gemini au lieu d'Anthropic!**

---

## ❓ Quand UTILISER Anthropic Claude 3?

Claude 3 serait approprié si:

| Besoin | Claude 3 | Notre Stack |
|--------|----------|-----------|
| Raison complexe (philosophical) | ✅ Excellent | ⚠️ Overkill |
| Code generation avancé | ✅ Meilleur | ✅ Bon |
| Vision + Reasoning | ✅ Excellent | ⚠️ Séparé |
| Research writing | ✅ Excellent | ✅ Acceptable |
| **PFE MVP** | ❌ Trop cher | ✅ Parfait |
| **Production Tunisie** | ❌ Trop cher | ✅ Budget ok |

---

## 📋 Stack IA Final: Recommandations

### Phase 1: MVP (Actuel) ✅

```typescript
// Classification d'intent
import { classifyIntent } from '@/lib/ai/groq';

// Chat principal
import { chatWithGemini } from '@/lib/ai/gemini';

// Embeddings
import { generateEmbedding } from '@/lib/openrouter-embeddings';

// Coût: ~$0-5/mois
// Performance: Excellent
```

### Phase 2: Futur (Si budget++++)

```typescript
// Option 1: Ajouter Claude pour premium users
import { claudeForPremium } from '@/lib/ai/anthropic';

// Option 2: Ajouter Llama Vision
import { llamaVisionForImages } from '@/lib/ai/replicate';

// Option 3: Fine-tune sur Groq
const tunisianGroqModel = await finetuneGroq();

// Coût: $50-200/mois selon scaling
```

---

## 🎓 Pour le Rapport PFE

### À inclure:

```markdown
## 6.2 Choix des Services IA

### Justification Technique et Financière

**Services Choisis:**
1. **Groq (Llama 3.1 8B)** - Classification d'intent
   - Vitesse: 50 tokens/s (vs 5 pour Claude)
   - Coût: 80% moins cher
   - Performance: Suffisante pour classification simple

2. **Gemini (Google)** - Chat et Assistant
   - Polyvalent (chat + vision)
   - Support multilingue Darija
   - Gratuit tier (adapté pour MVP)

3. **OpenRouter (baai/bge-m3)** - Embeddings
   - Modèle multilingue
   - Excellent pour dialectes
   - Coût économique

**Alternative Rejetée: Anthropic Claude 3**
- Coût 10x+ supérieur
- Redondant avec Gemini
- Pas adapté pour PFE budget
- Pas d'API embeddings native

**Économies réalisées:**
- Groq vs Claude: -80%
- Gemini vs Claude: -90%
- Total: Stack IA à $0-5/mois vs $100+/mois
```

---

## 🔧 Configuration Actuelle

### Environment Variables

```bash
# Groq (Intent Classification)
GROQ_API_KEY=gsk_xxxxx

# Gemini (Chat Principal)
GEMINI_API_KEY=AIzaSyxxxxx

# OpenRouter (Embeddings)
OPENROUTER_API_KEY=sk-or-xxxxx

# Note: Pas de clé Anthropic nécessaire
```

### Code Exemple

```typescript
// Classification via Groq
async function classifyUserMessage(msg: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: msg }],
    }),
  });
  return response.json();
}

// Chat via Gemini
async function chatWithUser(msg: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: msg }] }],
      }),
    }
  );
  return response;
}

// Embeddings via OpenRouter
async function getEmbedding(text: string) {
  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'baai/bge-m3',
      input: text,
    }),
  });
  const data = await response.json();
  return data.data[0].embedding;
}
```

---

## 📊 Tableau Récapitulatif

| Critère | Groq | Gemini | OpenRouter | Anthropic |
|---------|------|--------|-----------|-----------|
| **Coût** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **Vitesse** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Polyvalence** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Darija Support** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Adapté MVP** | ✅ | ✅ | ✅ | ❌ |

---

## ✅ Conclusion

**Anthropic Claude 3 n'est PAS utilisé car:**

1. **Trop cher** pour une PFE/MVP (10-20x coût)
2. **Redondant** avec Gemini (même qualité)
3. **Pas optimisé** pour classification simple (Groq meilleur)
4. **Pas d'embeddings** (besoin OpenRouter de toute façon)
5. **Stack actuelle suffisante** pour toutes les use cases

**Notre choix: Groq + Gemini + OpenRouter = Optimal pour MVP**

---

**Document créé:** Mai 2026  
**Pour:** Rapport PFE - Ro2ya Marketplace
