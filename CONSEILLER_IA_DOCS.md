📊 **Conseiller de Promotion IA** — Documentation Technique
===========================================================

## 🎯 Aperçu

Le Conseiller de Promotion IA analyse les données réelles de ventes et utilise l'IA Groq (Llama 3) pour générer des recommandations stratégiques de promotion.

## 🏗️ Architecture

### 1. **API Endpoint** (`/api/dashboard/[storeId]/sales-recommendations`)
   - **Fichier**: `app/api/dashboard/[storeId]/sales-recommendations/route.ts`
   - **Méthode**: GET
   - **Authentification**: Vérification du propriétaire du store
   - **Données collectées**:
     - Produits/services (views, sales, bookings)
     - Commandes (90 derniers jours)
     - Réservations (90 derniers jours)

### 2. **Service d'Analyse Groq** (`lib/actions/sales-analyzer.ts`)
   - **Fonction**: `analyzeSalesDataWithGroq()`
   - **Modèle**: `llama-3.1-8b-instant`
   - **Analyse**:
     - Produits "dormants" (beaucoup de vues, peu de ventes)
     - Pics et creux de fréquentation (Happy Hours)
     - Produits achetés ensemble (Bundles)
     - Opportunités de vente croisée (Upsell)

### 3. **Composant UI** (`components/dashboard/AIAdvisorSection.tsx`)
   - Affichage des recommandations en cartes
   - Badges d'urgence et de confiance
   - Bouton "Créer une promotion"
   - Statistiques récapitulatives

### 4. **Intégration Dashboard**
   - Onglet "Conseiller IA" dans la page Intelligence
   - Chemin: `/dashboard/[storeId]/intelligence`

## 📝 Types de Recommandations

| Type | Description | Cas d'usage |
|------|-------------|-----------|
| **dormant_product** | Produit peu vendu malgré le trafic | Lancer une promo pour relancer |
| **happy_hour** | Identifie les heures de faible activité | "Happy Hours" pour remplir les creux |
| **bundle** | Produits souvent achetés ensemble | Créer des packs/combos |
| **upsell** | Produits à proposer après achat | Augmenter le ticket moyen |

## 🚀 Utilisation

### Pour un commerçant:
1. Aller à `Dashboard → Intelligence → Conseiller IA`
2. Voir les recommandations analysées par IA
3. Cliquer sur "Créer une promotion" pour actionner une recommandation
4. Le système suggère un taux de réduction optimal

### API Call:
```typescript
const response = await fetch('/api/dashboard/123/sales-recommendations');
const { recommendations, summary } = await response.json();
```

### Response Format:
```typescript
{
  success: true,
  recommendations: [
    {
      type: "dormant_product",
      title: "Relancer T-shirt blanc",
      description: "237 vues mais seulement 8 ventes...",
      suggestedDiscount: 15,
      targetItems: [42],
      targetItemNames: ["T-shirt blanc"],
      urgency: "high",
      estimatedImpact: "Conversion: +20-30%",
      confidence: 0.92
    }
  ],
  summary: {
    totalItems: 45,
    totalOrders: 128,
    totalBookings: 23
  }
}
```

## 🔧 Variables d'Environnement Requises

```env
GROQ_API_KEY=<your-groq-api-key>
```

## 📊 Logique d'Analyse Groq

Le prompt Groq inclut:
- Données d'items (views, sales, bookings, ratios)
- Données de commandes par heure (identifies peaks/off-peaks)
- Paires d'items achetées ensemble

L'IA générer les recommandations basées sur:
- **Confiance**: 0.6-0.95 (basée sur la qualité des données)
- **Urgence**: low/medium/high (basée sur l'impact potentiel)
- **Taux de réduction**: Suggestions optimales (5-30%)

## ✅ Checklist de Déploiement

- [ ] GROQ_API_KEY est configurée dans .env.local
- [ ] Les données de commandes et réservations sont présentes (>5 items)
- [ ] Test: Visiter `/dashboard/[storeId]/intelligence`
- [ ] Test: Cliquer sur l'onglet "Conseiller IA"
- [ ] Vérifier que les recommandations s'affichent

## 🐛 Dépannage

### Erreur: "Clé GROQ_API_KEY manquante"
→ Ajouter `GROQ_API_KEY` dans `.env.local`

### Erreur: "Pas assez de données"
→ Créer au moins 5 produits + quelques commandes/réservations

### Les recommandations vides
→ Vérifier que les items ont des `view_count` et `order_count` > 0

## 🎓 Exemple Complet d'Intégration

```typescript
// Dans un composant
const [recs, setRecs] = useState([]);

const fetchRecs = async () => {
  const res = await fetch(`/api/dashboard/${storeId}/sales-recommendations`);
  const data = await res.json();
  setRecs(data.recommendations);
};

// Appliquer une recommandation
const applyPromotion = (rec) => {
  // Envoyer à l'API promotions
  const formData = {
    title: rec.title,
    discount_percent: rec.suggestedDiscount,
    item_ids: rec.targetItems
  };
  // API call...
};
```

## 🔮 Améliorations Futures

1. **Prédictions à long terme**: ML pour forecasting des ventes
2. **Stratégies multi-canaux**: Recommandations par canal (products vs bookings)
3. **A/B Testing**: Mesurer l'impact des promotions appliquées
4. **Export**: Télécharger les recommandations en CSV/PDF
5. **Webhooks**: Notifications automatiques des nouvelles recommandations
