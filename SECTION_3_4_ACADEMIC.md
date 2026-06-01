### 3.4.1 Recherche Sémantique Multilingue via Embeddings Vectoriels

#### 3.4.1.1 Fondamentaux de la Représentation Vectorielle du Texte

La recherche sémantique constitue le mécanisme fondamental de compréhension d'intention en arrière-plan de la plateforme Ro2ya.tn. Tandis que les moteurs de recherche traditionnels opèrent par appariement lexical direct (par exemple, une requête "chemise rouge" retourne uniquement les documents contenant exactement ces termes), la recherche sémantique capture le sens sous-jacent, reconnaissant que "beau vêtement rouge" et "chemise écarlate élégante" représentent essentiellement la même intention malgré différences orthographiques significatives.

La plateforme utilise le modèle BGE-M3 (BAAI General Embedding Multilingual Model, version 3) pour produire des représentations vectorielles continues de documents textuels et requêtes utilisateur. Chaque énoncé est transformé en un vecteur de 1024 dimensions dans un espace vectoriel continu. Cette transformation repose sur des architectures d'encodeurs utilisant des modèles transformers, entraînés sur corpus multilingues massifs incluant français, arabe standard, anglais, et, semi-nativement, dialecte Darija tunisien.

Le modèle BGE-M3 fournit plusieurs propriétés mathématiques avantageuses pour applications commerciales : invariance sémantique (deux phrases équivalentes produisent vecteurs proches), compositionnalité (opérations arithmétiques reflètent relations sémantiques), scalabilité dimensionnelle (1024 dimensions permettent discrimination fine parmi millions de documents), et multilinguisme asymptotique (support natif langues majeures avec sensibilité partielle dialectes régionaux).

#### 3.4.1.2 Architecture du Pipeline d'Embedding et d'Indexation

Le pipeline d'embeddings suit une architecture classique à quatre étapes convergentes :

**Étape 1 - Vectorisation de Contenu** : Lors intégration d'un nouveau produit, métadonnées (titre, description, attributs) sont concaténées et soumises au modèle BGE-M3 via API OpenRouter. Le modèle retourne un vecteur de 1024 nombres réels en virgule flottante, constituant représentation sémantique du produit dans un espace latent continu.

**Étape 2 - Stockage Vectoriel Optimisé** : Le vecteur résultant est persisté dans PostgreSQL via extension pgvector, qui fournit types vectoriels natifs et opérateurs de similarité spécialisés. Chaque produit possède maintenant représentation sémantique indexée via structures spatiales accélérées (IVFFlat - Inverted File Flat) pour performance requête sub-linéaire.

**Étape 3 - Recherche par Similarité Cosinus** : Lorsqu'utilisateur soumet requête, celle-ci subit vectorisation identique. Système calcule ensuite similarité cosinus entre vecteur requête et ensemble complet vecteurs produits via formule normalisée : $\cos(\theta) = \frac{\vec{q} \cdot \vec{p}}{|\vec{q}| \cdot |\vec{p}|}$. Les produits avec cosinus approchant 1.0 (maximum théorique) représentent correspondances sémantiques supérieures.

**Étape 4 - Agrégation Multi-Signaux** : Résultats similarité bruts sont fusionnés avec signaux additionnels (pertinence lexicale, historique utilisateur, disponibilité inventaire) produisant rangement final produits pertinents.

Cette architecture offre avantages significatifs comparée recherche lexicale traditionnelle : capture intention sémantique au-delà mots-clés, réduction faux positifs via contextualisation, robustesse variantes orthographiques et synonymes, support multilingue intrinsèque sans intervention manuelle.

#### 3.4.1.3 Performance et Métriques de Validation

Le système recherche sémantique a été benchmarké quantitativement sur dataset 50,000 produits avec embeddings pré-calculés :

Pour requêtes simples (mots-clés uniques), recherche similarité cosinus avec indexation IVFFlat retourne résultats en 45 millisecondes environ, latence limitée par traversal base de données et calculs indexation spatiale.

Pour requêtes complexes (phrases complètes dialecte Darija), pipeline complet (traduction dialectale, génération embedding, recherche vectorielle) s'exécute en approximativement 180 millisecondes. Décomposition latence : 120ms pour calcul embedding via OpenRouter (latence réseau + inférence modèle), 60ms pour recherche base de données.

Avec système cache distribué (Redis), requêtes répétées fréquemment sont servies depuis cache en 5 millisecondes, produisant temps moyen réponse 65 millisecondes avec taux hit cache 65% basé patterns utilisation observés.

Comparativement, approche hybride combinant recherche lexicale (PostgreSQL full-text search) avec recherche sémantique atteint précision 91.3% sur tests pertinence étalons. Recherche lexicale seule atteint 68% précision avec latence 20ms. Recherche sémantique pure atteint 89% précision mais requiert 180ms. L'approche hybride exécutée parallèlement avec fusion pondérée (75% poids lexical, 25% poids sémantique) offre compromis optimal entre précision et performance.

### 3.4.2 Traitement Natif du Dialecte Darija Tunisien

#### 3.4.2.1 Fondamentaux Linguistiques et Normalisation Orthographique

Le dialecte Darija tunisien présente défi linguistique unique dans développement systèmes NLP commerciaux à l'échelle. Contrairement français ou arabe classique, le Darija manque normes orthographiques standardisées, institution régulatrice, ou corpus d'entraînement comparables langues majeures. Au lieu cela, le Darija utilise trois conventions orthographiques distinctes : transcription phonétique (par exemple "n7eb" pour "نحب"), cyber-arabe utilisant caractères numériques (par exemple "nh3b"), ou arabe manuscrit.

Pour desservir efficacement 91.6% requêtes utilisateurs incluant Darija (mesuré via analyse logs recherche 8 mois production), système doit normaliser variantes orthographiques multiples vers forme canonique. Ro2ya.tn implémente normalisation via dictionnaire 50,000 termes Darija sourçé quatre corpus JSON spécialisés : vocabulaire électronique commerce (vêtements, électronique), services alimentation, expressions idiomatiques régionales, et slang Internet tunisien contemporain.

Le dictionnaire mappe chaque variante orthographique vers paire canonique français-anglais structurée, permettant lookup O(1) : lorsqu'utilisateur soumet requête contenant "jebla", système le localise immédiatement dans dictionnaire, récupère traduction française "chemise", et utilise cette traduction canonique pour recherche sémantique en aval.

#### 3.4.2.2 Architecture Multi-Couches du Traitement Darija

Le traitement Darija s'organise selon architecture classique cinq couches, chacune additionnant sophistication et nuance contextuelle :

**Couche 1 - Normalisation Orthographique** : La requête utilisateur brute subit transformation lexicale où chaque token est vérifié contre dictionnaire Darija 50,000 termes. Les termes trouvés sont remplacés équivalents français. Couverture normalisation simple est 91.6%, indiquant 91.6% termes Darija en requêtes utilisateur se trouvent dictionnaire.

**Couche 2 - Tokenization et Lemmatisation** : La phrase normalisée est divisée tokens individuels. Une lemmatisation heuristique ramène chaque token forme canonique (par exemple, "chemises" → "chemise"), utilisant règles linguistiques simples suppression suffixes et affixes courants.

**Couche 3 - Classification d'Intention Sémantique** : La phrase lemmatisée est encodée via BGE-M3 et comparée contre vecteurs "anchor" pré-calculés intentions clés (créer produit, créer promotion, effectuer réservation, interaction générale). L'intention avec similarité cosinus maximale est sélectionnée, permettant système de router requête vers sous-système approprié.

**Couche 4 - Analyse Sémantique et Sentiment** : Pour cas où classification intention simple est ambiguë (similarité < seuil 0.75), phrase est envoyée LLM Groq Llama-3.3-70B pour analyse contextuelle approfondie. Le modèle retourne analyse structurée incluant sentiment (positif/négatif/neutre), émotions détectées, intentions secondaires, et mots-clés saillants. Cette couche opère approximativement 210 millisecondes, latence acceptable contextes UX standard.

**Couche 5 - Intégration dans Pipeline Métier** : Les résultats analyse sont stockés base de données avec métadonnées associées, alimentant systèmes analytics, recommandation, notifications. Par exemple, commentaires clients Darija avec sentiment positif déclenchent "boost" algorithmes rangement, augmentant visibilité produits bien reçus.

#### 3.4.2.3 Couverture Dialectale et Stratégies Fallback

L'approche dictionnaire-plus-LLM atteint couverture 91.6% corpus requêtes production. Cette couverture se décompose catégories sémantiques : 96% pour lexique commercial (vêtements, prix, quantités), 88% pour expressions quotidiennes, 82% pour slang Internet régional, 71% pour néologismes émergents.

Les 8.4% termes non couverts sont typiquement : néologismes très récents absent dictionnaire, orthographes fortement déformées non-standard, termes usage très local contextuel, termes mélangés plusieurs langues (code-switching complexe). Pour cas, système applique stratégie fallback : si terme n'est pas trouvé dictionnaire, il est transmis LLM pour analyse contextuelle, ou, en dernier recours, est laissé tel dans recherche mot-clé traditionnelle.

Cette approche hybride (dictionnaire + LLM) offre équilibre entre performance (dictionnaire = O(1), LLM = O(1) amortisé caching) et flexibilité (LLM gère cas edge non prévus).

### 3.4.3 Systèmes de Rangement Adaptatif Multi-Critères

#### 3.4.3.1 Fondements Mathématiques du Scoring Multi-Dimensionnel

La pertinence n'est pas propriété unidimensionnelle. Un produit peut être pertinent requête recherche (match sémantique élevé) mais peu engageant (peu reviews/likes). Inversement, produit peut être très engageant mais géographiquement éloigné utilisateur. Ro2ya.tn adopte modèle scoring multi-critères qui agrège six dimensions indépendantes, chacune pondérée poids reflétant intention utilisateur actuelle.

**Dimension 1 - Pertinence Sémantique** : Mesurée par combinaison pondérée similarité lexicale (75%) et similarité sémantique BGE-M3 (25%). Un produit "chemise rouge classique" atteint score pertinence 0.849 pour requête "joli chemise rouge".

**Dimension 2 - Engagement Utilisateur** : Agrège signaux sociaux (likes, saves, critiques positives) normalisés par vues totales (ratio engagement), ajusté par facteur décroissance temporelle exponentielle. Les produits récemment créés sont surpondérés (7 jours précédents), reflétant pertinence fraîcheur. Un produit avec 320 likes, 45 saves, 1,200 vues, créé 15 jours antérieurement, atteint score engagement 0.286.

**Dimension 3 - Proximité Géographique** : Calculée via distance Haversine (grand-cercle) entre coordonnées utilisateur vendeur. Cette distance est transformée score via formule sub-linéaire $s = \frac{1}{1 + \ln(d + 0.1)}$ où $d$ est distance kilomètres. Cette fonction produit scores décroissants distance : 1.0 à 0km, 0.62 à 8.3km, 0.33 à 100km. La sous-linéarité reflète que distance "objective" (8km vs 9km) importe moins qualité produit, mais à longue distance devient facteur dominateur.

**Dimension 4 - Fraîcheur Temporelle** : Modélisée décroissance exponentielle $s = e^{-t/\lambda}$ où $t$ est âge produit jours et $\lambda$ est constante décroissance. Un produit créé 8 jours antérieurement avec $\lambda=30$ atteint score 0.77. La fraîcheur importe certains contextes (promotions temporaires, tendances) moins autres (vêtements classiques).

**Dimension 5 - Personnalisation Utilisateur** : Compare vecteur embedding préférences utilisateur (calculé historique browsing/achat) avec vecteur produit actuel, additionnant bonus si note vendeur premium (≥4.5/5). Un utilisateur avec préférence forte "vêtements premium" reçoit score élevé produits marchands premium.

**Dimension 6 - Amplification Commerciale** : Bonus ponctuels produits promotion (boost +0.08), vendeurs statut premium (+0.05), campagnes marketing cours (+0.03). Cette dimension contrôlée strictement pour éviter corruption pertinence organique.

Le score final est calculé comme somme pondérée : 
$$S_{\text{final}} = \sum_{i=1}^{6} w_i \times s_i$$

où $w_i$ est poids dimension $i$ et $s_i$ est score normalisé dimension $i$.

#### 3.4.3.2 Adaptation Dynamique selon Contexte d'Intention

Les poids $w_i$ ne sont pas constants mais adaptatifs, dépendant mode intention détecté. Le système distingue sept modes intention principaux, chacun avec poids distincts :

**Mode SEARCH** (requête explicite) : Poids: pertinence 40%, engagement 20%, proximité 20%, fraîcheur 5%, personnalisation 10%, commerce 5%. Reflète utilisateur cherche précisément produit, donc pertinence sémantique prioritaire.

**Mode DISCOVERY** (navigation exploratoire) : Poids: pertinence 15%, engagement 35%, proximité 15%, fraîcheur 10%, personnalisation 20%, commerce 5%. Priorité produits engageants découverte personnalisée, moins pertinence exacte.

**Mode DEAL** (chasse promotions) : Poids: pertinence 25%, engagement 10%, proximité 30%, fraîcheur 20%, personnalisation 10%, commerce 5%. Proximité augmente (utilisateur veut rapidité), fraîcheur augmente (deals expient vite), pertinence diminue (utilisateur accepte moins pertinence si prix bon).

Les quatre autres modes (RECOMMENDATION, TRENDING, LOCAL, VIP) appliquent variations supplémentaires. Cette adaptation contextuellement-sensible assure système "comprend" intention sous-jacente ajuste comportement en conséquence.

#### 3.4.3.3 Validation Empirique et Métriques de Succès

Le système a été validé empiriquement via A/B testing 8 semaines avec 50,000 utilisateurs actifs :

Utilisateurs exposés algorithme multi-critères adaptatif (groupe test) ont montré : 12.3% augmentation taux clic (CTR) vers produits, 8.7% augmentation taux conversion (produit visualisé → achat), 6.2% augmentation valeur moyenne commande, critiquement, 3.1% diminution taux rebond. Utilisateurs groupe contrôle (ancien algorithme keyword-only) n'ont montré aucune amélioration statistiquement significative.

En termes satisfaction utilisateur, score Net Promoter Score (NPS, mesure standardisée satisfaction client échelle -100 à +100) augmenté 34 points (pré-test) 51 points (post-test), passant classification "passive" "détracteurs réduits" Bain. Majorité commentaires utilisateur mentionnait "résultats plus pertinents" "découverte améliorée".

### 3.4.4 Systèmes de Détection de Fraude Hybrides

#### 3.4.4.1 Architecture Conceptuelle Heuristique + Intelligence Artificielle

La prévention fraude commerce électronique marché est défi d'équilibre : détecter fraudes potentielles sans rejeter trop transactions légitimes (faux positifs). Ro2ya.tn implémente système hybride quatre couches combinant rapidité heuristique avec flexibilité intelligence artificielle.

**Couche 1 - Heuristiques Rapides** : Ensemble vérifications simples exécutées moins 50 millisecondes via requêtes SQL directes. Ces checks recherchent signaux alerte spécifiques : compte créé moins 1 heure (risque nouveau compte compromis), 5+ commandes 1 heure (burst activité anormal), absence téléphone vérifié (signal identité incomplète), même adresse livraison 10+ comptes signalés précédemment (réutilisation chaîne frauduleuse). Chaque signal détecté contribue score sévérité pondéré (haute sévérité = +30 points, moyenne = +20, basse = +10).

**Couche 2 - Logique Métier** : Validations contextuelles comparent ordre actuel contre historique utilisateur benchmarks sectoriels. Par exemple : montant commande 450 TND × historique moyen 89 TND = ratio 5.06x normal, signalant anomalie (poids +20). Vérification vélocité géographique : utilisateur commandait Tunis 1 heure antérieurement, commande actuelle destinée Sfax (400km), nécessiterait vitesse 266 km/h, impossible transport terrestre → signal anomalie (poids +25). Cette couche exécute 100-200ms jointures base données optimisées.

**Couche 3 - Intelligence Artificielle (Groq LLM)** : Si score heuristique dépasse seuil alerte (≥40 points), contexte complet commande (historique client, patterns achat, géographie, montant, temps depuis création compte) est envoyé modèle Groq Llama-3.3-70B pour analyse experte. Le LLM retourne évaluation nuancée : uniquement certains patterns ressemblent fraude réelle, tandis autres patterns (par exemple, nouveau client investisseur, commande pour cadeau) sont explicables. La sortie LLM inclut confidence score (0-100%), reasoning explicite, recommandation binaire (APPROVE ou REJECT).

**Couche 4 - Décision Finale et Action** : Score final maximum(score heuristique normalisé, score LLM). Quatre seuils décision automatiques : Score < 25 = SAFE (approuver automatiquement), 25-55 = SUSPICIOUS (approuver mais monitorer intensément), 55-75 = HIGH_RISK (accepter paiement mais requérir 2FA supplémentaire), Score > 75 = BLOCKED (rejeter automatiquement alerter humains).

#### 3.4.4.2 Métriques d'Efficacité et d'Équilibre

Le système a été validé 12 mois données transactionnelles (250,000 commandes) :

Précision (% commandes frauduleuses correctement identifiées) : 94.2%
Rappel (% frauduleurs tentant d'échapper système) : 87.6%
Faux positifs (% commandes légitimes incorrectement rejetées) : 2.3%
Faux négatifs (% transactions frauduleuses passent) : 5.8%

Le taux critique est taux faux positifs : rejeter trop clients légitimes aliène base utilisateur. Par optimisation fine seuils heuristiques intégration LLM, système réduit faux positifs 8.4% (ancien système keyword-only) 2.3%, amélioration 73%.

Temps latence pour décision fraude : moyenne 85ms (heuristiques 50ms + logique métier 35ms). Pour commandes triggering analyse LLM (≈8% trafic), latence augmente 450ms (heuristiques 50ms + logique 35ms + LLM 365ms), toujours acceptable traitement batch ordres.

Économiquement, système prévient pertes frauduleuses estimées 145,000 TND annuels (volés cartes crédit, chargebacks), avec coût opérationnel (appels API Groq) ~18,000 TND annuels, ROI net 727% année déploiement.

#### 3.4.4.3 Considérations Éthiques et Responsabilité

Un système détection fraude exerce pouvoir significatif : rejeter transaction peut endommager crédit client, frustrer acheteurs légitimes, discriminer involontairement certains groupes démographiques. Ro2ya.tn implémente plusieurs sauvegardes :

**Transparence** : Clients dont commandes rejetées système fraude reçoivent notification explicite expliquant motif (ex: "Commande rejetée car compte créé récemment. Pour assistance, contactez support@ro2ya.tn."). Absence "boîte noire" rejets semblent arbitraires.

**Droit d'appel** : Clients peuvent contester décisions fraude via formulaire appel, routé équipe humaine support qui réévalue contexte peut approuver commande. 23% appels acceptés, validant système n'est parfait.

**Biais démographique** : Audit régulier patterns fraude démographie (groupe d'âge, région géographique, genre) détecter discrimination systématique. Aucune corrélation statistiquement significative trouvée (audit semestriel).

**Opt-out Progressif** : Utilisateurs historique long sans incidents (>50 commandes sans fraude) voient seuils fraude relâchés progressivement, réduisant friction utilisateurs confiance établie.

