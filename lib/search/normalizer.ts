/**
 * ═══════════════════════════════════════════════════════════════
 * ÉTAPE 1 — NORMALIZER DARIJA
 * ═══════════════════════════════════════════════════════════════
 * Entrée  : query string brute (Darija latin, arabe, français, mix)
 * Sortie  : NormalizedQuery — tout ce dont le pipeline a besoin
 *
 * Ce module ne fait AUCUN appel API. C'est une étape synchrone,
 * gratuite et instantanée basée sur le dictionnaire local.
 */

import {
  DARIJA_TUNISIAN_DICTIONARY,
  extractDarijaWords,
} from '@/lib/darija-dictionary'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NormalizedQuery {
  /** Requête originale nettoyée */
  original: string
  /** Phrase traduite mot à mot (Darija → Français) */
  translated: string
  /** Phrase étendue avec expansions sémantiques (pour l'embedding) */
  expanded: string
  /** Mots-clés uniques pour la recherche texte */
  keywords: string[]
  /** Script détecté */
  script: 'arabic' | 'latin_darija' | 'french' | 'mixed' | 'numeric'
  /** Catégories Darija détectées */
  detectedCategories: string[]
  /** Expansions sémantiques générées depuis les catégories */
  semanticExpansions: string[]
  /** true si tous les mots sont dans le dictionnaire (skip LLM) */
  fullyTranslated: boolean
  /** Mots Darija détectés avec leur traduction */
  darijaWords: Array<{ original: string; french: string; category: string }>
}

// ─── Map catégorie → mots-clés sémantiques ───────────────────────────────────

const CATEGORY_SEMANTIC_MAP: Record<string, string[]> = {
  verb:        ['action', 'service', 'prestation'],
  auto:        ['voiture', 'mécanique', 'garage', 'pneu', 'huile', 'révision', 'carrosserie'],
  nourriture:  ['restaurant', 'traiteur', 'plat', 'cuisine', 'repas', 'livraison', 'menu', 'food', 'manger', 'restauration rapide'],
  commerce:    ['magasin', 'boutique', 'vente', 'achat', 'marché', 'shop'],
  beaute:      ['coiffure', 'salon', 'soin', 'esthétique', 'manucure', 'hammam'],
  santé:       ['médecin', 'clinique', 'pharmacie', 'docteur', 'soins'],
  mode:        ['vêtements', 'habits', 'prêt-à-porter', 'confection', 'tissu'],
  lieux:       ['quartier', 'adresse', 'local', 'espace', 'lieu'],
  transports:  ['taxi', 'livraison', 'transport', 'chauffeur', 'déménagement'],
  artisanat:   ['fait main', 'traditionnel', 'artisan', 'poterie', 'tissu'],
  gastronomie: ['cuisine tunisienne', 'spécialité', 'plat traditionnel', 'restaurant'],
  product:     ['produit', 'article', 'vente', 'achat'],
  business:    ['entreprise', 'boutique', 'service', 'professionnel'],
  services:    ['prestataire', 'artisan', 'technicien', 'réparation'],
  médical:     ['santé', 'médecin', 'clinique', 'pharmacie', 'soins'],
  éducation:   ['cours', 'formation', 'école', 'enseignement', 'soutien'],
  finance:     ['banque', 'assurance', 'crédit', 'prêt'],
  sport:       ['fitness', 'salle', 'coach', 'musculation', 'yoga'],
}

// ─── Détection de script ──────────────────────────────────────────────────────

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F]/
const LATIN_REGEX  = /[a-zA-Z]/
const DIGIT_REGEX  = /\d/

function detectScript(query: string): NormalizedQuery['script'] {
  const trimmed = query.trim()
  if (!trimmed) return 'french'

  const hasArabic = ARABIC_REGEX.test(trimmed)
  const hasLatin  = LATIN_REGEX.test(trimmed)
  const hasDigit  = DIGIT_REGEX.test(trimmed)

  if (hasDigit && !hasLatin && !hasArabic) return 'numeric'
  if (hasArabic && hasLatin) return 'mixed'
  if (hasArabic) return 'arabic'

  // Détection Darija en latin : si >25% des mots sont dans le dict
  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean)
  const darijaCount = words.filter(w => DARIJA_TUNISIAN_DICTIONARY[w]).length
  if (words.length > 0 && darijaCount / words.length > 0.25) return 'latin_darija'
  return 'french'
}

// ─── Lookup multi-mot (ex: "nhb nakel ji3an" en une seule clé) ───────────────

function multiWordLookup(query: string): string | null {
  const lower = query.toLowerCase().trim()
  // Essaie la phrase entière, puis les sous-phrases de 3, 2 mots
  if (DARIJA_TUNISIAN_DICTIONARY[lower]) {
    return DARIJA_TUNISIAN_DICTIONARY[lower].french
  }
  const words = lower.split(/\s+/)
  for (let len = Math.min(words.length, 4); len >= 2; len--) {
    for (let start = 0; start <= words.length - len; start++) {
      const phrase = words.slice(start, start + len).join(' ')
      if (DARIJA_TUNISIAN_DICTIONARY[phrase]) {
        return DARIJA_TUNISIAN_DICTIONARY[phrase].french
      }
    }
  }
  return null
}

// ─── Traduction mot par mot + expansion ──────────────────────────────────────

function buildTranslation(query: string): {
  translated: string
  detectedCategories: string[]
  semanticExpansions: string[]
} {
  const words = query.trim().split(/\s+/).filter(Boolean)
  const translatedWords: string[] = []
  const detectedCategories = new Set<string>()
  const semanticExpansions: string[] = []

  for (const word of words) {
    const normalized = word.toLowerCase().trim()
    const entry = DARIJA_TUNISIAN_DICTIONARY[normalized]
    if (entry) {
      translatedWords.push(entry.french)
      detectedCategories.add(entry.category)
      const catExp = CATEGORY_SEMANTIC_MAP[entry.category]
      if (catExp) semanticExpansions.push(...catExp)
    } else {
      translatedWords.push(word) // garde le mot original
    }
  }

  return {
    translated:         translatedWords.join(' ').trim() || query,
    detectedCategories: [...detectedCategories],
    semanticExpansions: [...new Set(semanticExpansions)].slice(0, 10),
  }
}

// ─── Extraction des keywords pour la recherche texte ─────────────────────────

function buildKeywords(original: string, translated: string): string[] {
  const raw = [
    ...translated.toLowerCase().split(/\s+/),
    ...original.toLowerCase().split(/\s+/).map(
      w => DARIJA_TUNISIAN_DICTIONARY[w]?.french ?? w
    ),
  ]
  return [...new Set(raw)]
    .map(w => w.trim())
    .filter(w => w.length > 2)
    .slice(0, 8)
}

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Normalise une requête brute (Darija/arabe/français/mix) en une structure
 * enrichie utilisable par toutes les étapes du pipeline de recherche.
 *
 * @pure — synchrone, aucun appel API, gratuit
 */
export function normalizeQuery(query: string): NormalizedQuery {
  const original = query.trim()

  // 1. Lookup multi-mot (phrase complète dans le dict)
  const phraseTranslation = multiWordLookup(original)

  // 2. Traduction mot par mot
  const { translated: wordByWordTranslation, detectedCategories, semanticExpansions } =
    buildTranslation(original)

  // Priorité : phrase complète > mot par mot
  const translated = phraseTranslation ?? wordByWordTranslation

  // 3. Phrase étendue pour l'embedding (contient les expansions sémantiques)
  const expanded = [translated, ...semanticExpansions].join(', ')

  // 4. Script
  const script = detectScript(original)

  // 5. Mots Darija détectés (pour le hint LLM)
  const darijaWords = extractDarijaWords(original)

  // 6. fullyTranslated : true si chaque mot est dans le dict (skip LLM safe)
  const words = original.split(/\s+/)
  const fullyTranslated = words.every(
    w => DARIJA_TUNISIAN_DICTIONARY[w.toLowerCase()] || w.length <= 2
  )

  // 7. Keywords pour la recherche texte
  const keywords = buildKeywords(original, translated)

  // ── Debug log ──────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🔤 [NORMALIZER] Requête     : "${original}"`)
    console.log(`🌐 [NORMALIZER] Script      : ${script}`)
    words.forEach(w => {
      const entry = DARIJA_TUNISIAN_DICTIONARY[w.toLowerCase()]
      console.log(entry
        ? `   "${w}" ✅ → "${entry.french}" [${entry.category}]`
        : `   "${w}" ❌ → non trouvé dans le dictionnaire`
      )
    })
    if (phraseTranslation) {
      console.log(`🔗 [NORMALIZER] Phrase entière trouvée : "${phraseTranslation}"`)
    }
    console.log(`📝 [NORMALIZER] Traduit     : "${translated}"`)
    console.log(`📦 [NORMALIZER] Expanded    : "${expanded.slice(0, 120)}..."`)
    console.log(`🏷️  [NORMALIZER] Catégories  : [${detectedCategories.join(', ')}]`)
    console.log(`🔑 [NORMALIZER] Keywords    : [${keywords.join(', ')}]`)
    console.log(`⚡ [NORMALIZER] fullyTranslated: ${fullyTranslated}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  return {
    original,
    translated,
    expanded,
    keywords,
    script,
    detectedCategories,
    semanticExpansions,
    fullyTranslated,
    darijaWords,
  }
}
