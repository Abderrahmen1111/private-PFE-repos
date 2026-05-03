# Chapitre III : Réalisation

---

## I. Introduction

Ce chapitre est consacré à la présentation des réalisations concrètes du projet **Ro2ya**. Après avoir défini les besoins dans le premier chapitre et établi la conception dans le deuxième, nous présentons ici l'environnement de développement utilisé, suivi d'une description détaillée des trois plateformes développées. Pour chaque plateforme, nous exposons les interfaces graphiques réalisées ainsi que les implémentations techniques clés.

Le projet Ro2ya est composé de trois plateformes complémentaires :
1. **L'application Web Marketplace** — destinée aux clients et commerçants
2. **L'application Mobile** — destinée aux clients (iOS & Android)
3. **L'application d'Administration SaaS** — destinée aux administrateurs de la plateforme

---

## II. Environnement de Développement

### 1. Outils et Technologies

| Outil / Technologie | Version / Usage |
|---|---|
| Node.js | Runtime JavaScript (20.x LTS) |
| Next.js | Framework web + API (14.x App Router) |
| React Native (Expo) | Framework mobile multiplateforme (SDK 51) |
| Supabase | BaaS (PostgreSQL, Auth, Storage, Realtime) |
| PostgreSQL + pgvector | Base de données vectorielle |
| OpenRouter (baai/bge-m3) | Génération d'embeddings pour la recherche IA |
| Vercel | Déploiement et hébergement cloud |
| TailwindCSS & Framer Motion | Style utilitaire et animations |
| Zustand | Gestion d'état globale |

### 2. Structure Globale du Projet

Le projet est divisé en plusieurs modules gérés au sein d'un monorepo :
- `app/` : Application Next.js (Web + Admin)
- `components/` : Composants réutilisables (React)
- `lib/` : Utilitaires, actions serveur et clients Supabase
- `mobile/` : Application React Native (Expo)

---

## III. Plateforme Web Marketplace (Clients & Commerçants)

L'application web principale constitue le cœur de la plateforme Ro2ya. Elle permet aux clients de rechercher et commander des produits, et aux commerçants de gérer leur vitrine numérique.

### 1. Interfaces Graphiques

#### 1.1 Interface d'authentification et Inscription

![Capture d'écran : Interface d'authentification / Inscription](chemin/vers/image.png)
*Figure : Interface d'authentification et d'inscription*

La page de connexion (`/login`) et d'inscription (`/register`) permet de s'authentifier. Elle inclut un système de rate limiting et une redirection automatique basée sur le rôle de l'utilisateur (Client, Commerçant, Admin).

#### 1.2 Tableau de bord Commerçant

![Capture d'écran : Tableau de bord Commerçant](chemin/vers/image.png)
*Figure : Tableau de bord Commerçant*

Accessible depuis `/dashboard/[id]`, il présente les statistiques clés en temps réel (vues, clics, revenus) et des graphiques interactifs sur l'activité du magasin.

#### 1.3 Gestion des Produits et Services

![Capture d'écran : Gestion des Produits et Services](chemin/vers/image.png)
*Figure : Gestion des Produits et Services*

Permet au commerçant de créer, modifier et supprimer des articles (produits, services, réservations) avec gestion du stock et des images multiples.

#### 1.4 Gestion des Commandes (avec QR Code)

![Capture d'écran : Gestion des Commandes](chemin/vers/image.png)
*Figure : Gestion des Commandes*

Affiche les commandes passées. La validation d'une commande génère automatiquement un **QR code de suivi unique** (format `QR-XXXXX-XXXXX`) utilisé pour confirmer la livraison.

#### 1.5 Recherche Intelligente Multilingue (Client)

![Capture d'écran : Recherche Intelligente](chemin/vers/image.png)
*Figure : Recherche Intelligente Multilingue*

Intègre un moteur de recherche hybride. Le client peut saisir sa requête en Darija, Arabe ou Français. Le système utilise des embeddings vectoriels pour trouver les résultats les plus pertinents.

#### 1.6 Page d'accueil et Découverte

![Capture d'écran : Accueil et Découverte](chemin/vers/image.png)
*Figure : Page d'accueil (Feed) et Découverte*

Affiche un fil personnalisé avec les établissements mis en avant, les Reels promotionnels, et permet d'explorer les commerces proches via une carte interactive.

### 2. Implémentation Technique

#### 2.1 Authentification et Redirection par Rôle

L'authentification repose sur **Supabase Auth**. Après connexion, le système détecte le rôle de l'utilisateur et effectue la redirection appropriée via les Server Actions Next.js :

```typescript
// lib/actions/auth.ts
export async function loginAction(formData: FormData) {
  const supabase = createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }

  // Fetch user role for redirection
  const { data: profile } = await supabase.from('profiles')
    .select('role').eq('id', data.user.id).single()

  const role = profile?.role?.toLowerCase()
  if (role === 'admin') return redirect('/admin')
  if (role === 'pro' || role === 'business_owner') return redirect('/dashboard')
  return redirect('/')
}
```

#### 2.2 Moteur de Recherche Sémantique Sémantique

Le moteur combine recherche vectorielle via OpenRouter (baai/bge-m3) et pgvector, avec un fallback par mots-clés :

```typescript
// app/api/semantic-search/route.ts
// 1. Générer l'embedding de la requête
const orResponse = await fetch('https://openrouter.ai/api/v1/embeddings', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
  body: JSON.stringify({ input: query, model: 'baai/bge-m3' }),
})
const queryVector = data[0].embedding

// 2. Recherche par similarité cosinus via RPC Supabase
const { data: results } = await supabase.rpc(
  'search_items_semantic',
  { query_embedding: queryVector, match_threshold: 0.5 }
)
```

#### 2.3 Messagerie en Temps Réel (WebSockets)

Utilisation de **Supabase Realtime** pour écouter les nouveaux messages instantanément :

```typescript
// hooks/useMessages.ts
const channel = supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
  (payload) => {
    setMessages(prev => [...prev, payload.new as Message])
  }).subscribe()
```

---

## IV. Application Mobile (Clients iOS & Android)

L'application mobile est spécialement conçue pour offrir une expérience client fluide, tactile et engageante.

### 1. Interfaces Graphiques

#### 1.1 Accueil Mobile (Feed & Reels)

![Capture d'écran : Accueil Mobile](chemin/vers/image.png)
*Figure : Interface d'Accueil Mobile (Reels)*

L'onglet accueil présente un fil principal vertical avec lecture vidéo automatique (façon TikTok) pour les Reels des commerçants, optimisé par Reanimated.

#### 1.2 Découverte et Recherche Mobile

![Capture d'écran : Recherche Mobile](chemin/vers/image.png)
*Figure : Interface de Découverte et Recherche*

Permet d'explorer les commerces par catégorie avec une interface de cartes scrollables et une barre de recherche intelligente.

#### 1.3 Messagerie Mobile et Profil

![Capture d'écran : Messagerie et Profil](chemin/vers/image.png)
*Figure : Interfaces Messagerie et Profil Client*

Accès au chat en temps réel avec les commerçants, historique des commandes, et gestion des notifications push.

### 2. Implémentation Technique

#### 2.1 Configuration Axios avec JWT Automatique

Pour sécuriser les appels API vers le backend Next.js, nous utilisons un intercepteur Axios qui injecte automatiquement le token JWT de Supabase :

```typescript
// mobile/lib/api.ts
import axios from 'axios'
import { supabase } from './supabase'

export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL })

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
```

#### 2.2 Intégration des Notifications Push

Gestion de l'engagement client via Expo Push Notifications :

```typescript
// mobile/lib/notifications.ts
export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return
  const token = (await Notifications.getExpoPushTokenAsync()).data
  
  // Enregistrement du token en base de données
  await supabase.from('profiles').update({ push_token: token }).eq('id', userId)
}
```

---

## V. Plateforme d'Administration SaaS

L'application SaaS d'administration offre une vue à 360° sur tout l'écosystème de la plateforme Ro2ya.

### 1. Interfaces Graphiques

#### 1.1 Landing Page Publique

![Capture d'écran : Landing Page SaaS](chemin/vers/image.png)
*Figure : Landing Page de la plateforme d'administration*

Page de présentation avec tarification (Starter/Professional/Enterprise), témoignages et prise de rendez-vous pour les futurs commerçants franchisés.

#### 1.2 Tableau de Bord Analytique Global

![Capture d'écran : Dashboard Analytique](chemin/vers/image.png)
*Figure : Tableau de bord analytique global*

Présente les KPIs globaux (utilisateurs, commandes, revenus) et l'état de santé du système (uptime, temps de réponse) avec des graphiques d'évolution.

#### 1.3 Modération et Détection de Fraude

![Capture d'écran : Modération et Fraude](chemin/vers/image.png)
*Figure : Panneau de modération et alertes de fraude*

Regroupe les alertes générées par l'IA concernant des comportements suspects (avis en masse, commandes anormales) et permet de gérer les tickets de support.

### 2. Implémentation Technique

#### 2.1 Requêtes Statistiques Globales

Les calculs statistiques sont effectués côté serveur pour un affichage instantané des KPIs :

```typescript
// app/(admin)/dashboard/page.tsx
async function getStats() {
  const supabase = createServerClient()
  const [users, stores, orders, items] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('stores').select('id', { count: 'exact' }),
    supabase.from('orders').select('id', { count: 'exact' }),
    supabase.from('items').select('id', { count: 'exact' }),
  ])
  return {
    totalUsers: users.count, totalStores: stores.count,
    totalOrders: orders.count, totalItems: items.count,
  }
}
```

#### 2.2 Sécurité Row-Level Security (RLS)

Les politiques RLS de PostgreSQL garantissent que chaque donnée est isolée correctement, tout en laissant un accès complet aux administrateurs :

```sql
-- Politique : un commerçant ne voit que ses propres produits
CREATE POLICY "owners_see_own_items" ON items FOR ALL USING (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

-- Politique : admin voit tout
CREATE POLICY "admin_full_access" ON items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## VI. Tests et Validation

### 1. Tests Fonctionnels

| Fonctionnalité | Résultat | Notes |
|---|---|---|
| Inscription / Connexion | ✅ | Authentification sécurisée + JWT Mobile |
| Redirection par rôle | ✅ | Routage vers les 3 plateformes distinctes |
| Recherche sémantique | ✅ | Fallback keyword opérationnel |
| Publication de reels | ✅ | Upload vidéo fluide sur Supabase Storage |
| Commandes et QR Codes | ✅ | Génération et scan des QR codes valides |
| Messagerie temps réel | ✅ | Latence minime sur Web et Mobile |

### 2. Performances

| Métrique | Résultat |
|---|---|
| Temps réponse recherche sémantique | ~650ms |
| Score Lighthouse Performance (Web) | 88/100 |
| Score Lighthouse SEO (Web) | 95/100 |
| Latence messagerie (WebSocket) | ~180ms |

---

## VII. Difficultés Rencontrées et Solutions

| Difficulté | Solution Apportée |
|---|---|
| Conflit de types pgvector (`PGRST203`) | Recréation de la fonction RPC Supabase avec un cast explicite `::vector(1024)` |
| Rate limiting IA lors du seed | Implémentation d'un système de batching asynchrone |
| Expiration du JWT sur Mobile | Développement d'un intercepteur Axios pour l'actualisation silencieuse |
| Gestion des états sur 3 applications | Séparation claire des environnements tout en partageant la base de données |

---

## VIII. Conclusion

Ce chapitre a mis en lumière la phase de réalisation de la plateforme Ro2ya. En structurant le développement autour de **trois plateformes distinctes** (Application Web Marketplace, Application Mobile, et Administration SaaS), nous avons pu répondre précisément aux besoins spécifiques de chaque type d'utilisateur (Client, Commerçant, Administrateur). 

L'intégration de technologies modernes telles que Next.js, React Native, Supabase et les algorithmes d'intelligence artificielle nous a permis de fournir une solution robuste, sécurisée et évolutive. Les défis techniques, allant de la recherche sémantique vectorielle à la synchronisation en temps réel, ont été surmontés avec succès, aboutissant à un écosystème commercial local complet et performant.

---

*Projet de Fin d'Études — Plateforme Ro2ya*
*Étudiants : Khaireddine Dab & Abderrahman Abdelli*
*Année universitaire : 2025-2026*
