/**
 * Dictionnaire Darija Tunisien Complet
 * Inclut: Arabe, Phonétique (français/chiffres), Variations régionales
 * 
 * NOTE: Pas d'import fs/path ici (client-side)
 * Chargement côté serveur via lib/server/darija-loader.ts
 */

// Stub export — À charger dynamiquement côté serveur
const corpusPart1 = {}
const corpusPart2 = {}
const corpusPart3 = {}
const corpusPart4 = {}

export const DARIJA_TUNISIAN_DICTIONARY: Record<string, { french: string; category: string }> = {
  ...corpusPart1,
  ...corpusPart2,
  ...corpusPart3,
  ...corpusPart4,
  // ========== VERBES COURANTS ==========
  
  // "Vouloir" (toutes variantes)
  'نحب': { french: 'je veux', category: 'verb' },
  'n7eb': { french: 'je veux', category: 'verb' },
  'nhb': { french: 'je veux', category: 'verb' },
  'n7b': { french: 'je veux', category: 'verb' },
  'n7ib': { french: 'je veux', category: 'verb' },
  
  // "Chercher/Trouver"
  'نلقى': { french: 'trouver', category: 'verb' },
  'nel9a': { french: 'trouver', category: 'verb' },
  'nl9a': { french: 'trouver', category: 'verb' },
  'nlka': { french: 'trouver', category: 'verb' },
  'نبحث': { french: 'chercher', category: 'verb' },
  'nba7eth': { french: 'chercher', category: 'verb' },
  
  // "Manger"
  'نأكل': { french: 'manger', category: 'nourriture' },
  'nekel': { french: 'manger', category: 'nourriture' },
  'nakel': { french: 'manger', category: 'nourriture' },  // ← variante manquante !
  'nkel':  { french: 'manger', category: 'nourriture' },
  'nkl':   { french: 'manger', category: 'nourriture' },
  'nekil': { french: 'manger', category: 'nourriture' },
  'nakol': { french: 'manger', category: 'nourriture' },
  'kel':   { french: 'manger', category: 'nourriture' },
  'akel':  { french: 'manger', category: 'nourriture' },
  // "J'ai faim / Affamé" — ji3an / dj3an et variantes
  'ji3an':  { french: 'faim restaurant nourriture', category: 'nourriture' },
  'j3an':   { french: 'faim restaurant nourriture', category: 'nourriture' },
  'dj3an':  { french: 'faim restaurant nourriture', category: 'nourriture' },
  'jia3':   { french: 'faim restaurant nourriture', category: 'nourriture' },
  'jia3an': { french: 'faim restaurant nourriture', category: 'nourriture' },
  'جيعان':  { french: 'faim restaurant nourriture', category: 'nourriture' },
  'جعان':   { french: 'faim restaurant nourriture', category: 'nourriture' },
  // "Restaurant" en darija
  'resto':      { french: 'restaurant', category: 'nourriture' },
  'restorant':  { french: 'restaurant', category: 'nourriture' },
  'mta3 makel': { french: 'restaurant nourriture', category: 'nourriture' },
  // Phrases combinées fréquentes
  'nhb nakel':          { french: 'je veux manger restaurant', category: 'nourriture' },
  'nhb nakel ji3an':    { french: 'je veux manger j ai faim restaurant', category: 'nourriture' },
  'n7ib nekel':         { french: 'je veux manger restaurant', category: 'nourriture' },
  'nhb nkl':            { french: 'je veux manger restaurant', category: 'nourriture' },
  'nhb nkel':           { french: 'je veux manger restaurant', category: 'nourriture' },
  
  // "Acheter"
  'نشري': { french: 'acheter', category: 'verb' },
  'nechri': { french: 'acheter', category: 'verb' },
  'nchri': { french: 'acheter', category: 'verb' },

  // "Réparer / En panne"
  'fsdet': { french: 'en panne / cassé', category: 'verb' },
  'fesdet': { french: 'en panne / cassé', category: 'verb' },
  'makhdoum': { french: 'réparé / travaillé', category: 'verb' },
  'صلح': { french: 'réparer', category: 'verb' },
  'asla7': { french: 'réparer', category: 'verb' },
  
  // ========== TRANSPORT & AUTO ==========
  'كراهب': { french: 'voitures', category: 'auto' },
  'krahba': { french: 'voiture', category: 'auto' },
  'karhba': { french: 'voiture', category: 'auto' },
  'krhba': { french: 'voiture', category: 'auto' },
  'camion': { french: 'camion', category: 'auto' },
  'mecanique': { french: 'mécanique', category: 'auto' },
  'mecanicien': { french: 'mécanicien', category: 'auto' },
  'dhina': { french: 'peinture (auto)', category: 'auto' },
  
  // "Ouvert"
  'مفتوح': { french: 'ouvert', category: 'state' },
  'maftouh': { french: 'ouvert', category: 'state' },
  'mftouh': { french: 'ouvert', category: 'state' },
  'maftou7': { french: 'ouvert', category: 'state' },
  
  // "Fermé"
  'مسكر': { french: 'fermé', category: 'state' },
  'msakker': { french: 'fermé', category: 'state' },
  'msaker': { french: 'fermé', category: 'state' },
  
  // "Maintenant"
  'تو': { french: 'maintenant', category: 'time' },
  'توا': { french: 'maintenant', category: 'time' },
  'tawa': { french: 'maintenant', category: 'time' },
  'taw': { french: 'maintenant', category: 'time' },
  'tou': { french: 'maintenant', category: 'time' },
  
  // ========== PRÉPOSITIONS & LIEUX ==========
  
  // "À/Dans"
  'في': { french: 'à dans', category: 'preposition' },
  'fi': { french: 'à dans', category: 'preposition' },
  'f': { french: 'à dans', category: 'preposition' },
  
  // "Où"
  'وين': { french: 'où', category: 'question' },
  'wayn': { french: 'où', category: 'question' },
  'win': { french: 'où', category: 'question' },
  'wainek': { french: 'où es-tu', category: 'question' },
  
  // "Près/Proche"
  'قريب': { french: 'proche près', category: 'location' },
  '9rib': { french: 'proche près', category: 'location' },
  'krib': { french: 'proche près', category: 'location' },
  'karieb': { french: 'proche près', category: 'location' },
  
  // ========== VILLES TUNISIENNES (Phonétique) ==========
  
  'medenien': { french: 'Médenine', category: 'city' },
  'medenine': { french: 'Médenine', category: 'city' },
  'مدنين': { french: 'Médenine', category: 'city' },
  'sfax': { french: 'Sfax', category: 'city' },
  'صفاقس': { french: 'Sfax', category: 'city' },
  'sousse': { french: 'Sousse', category: 'city' },
  'سوسة': { french: 'Sousse', category: 'city' },
  'gabes': { french: 'Gabès', category: 'city' },
  'قابس': { french: 'Gabès', category: 'city' },
  'bizerte': { french: 'Bizerte', category: 'city' },
  'بنزرت': { french: 'Bizerte', category: 'city' },
  'kairouan': { french: 'Kairouan', category: 'city' },
  '9ayrawon': { french: 'Kairouan', category: 'city' },
  'القيروان': { french: 'Kairouan', category: 'city' },
  'tatwin': { french: 'Tataouine', category: 'city' },
  'tataouine': { french: 'Tataouine', category: 'city' },
  'تطاوين': { french: 'Tataouine', category: 'city' },
  'jerba': { french: 'Djerba', category: 'city' },
  'djerba': { french: 'Djerba', category: 'city' },
  'جربة': { french: 'Djerba', category: 'city' },
  'ariana': { french: 'Ariana', category: 'city' },
  'اريانة': { french: 'Ariana', category: 'city' },
  'manouba': { french: 'Manouba', category: 'city' },
  'منوبة': { french: 'Manouba', category: 'city' },
  'ben arous': { french: 'Ben Arous', category: 'city' },
  'بن عروس': { french: 'Ben Arous', category: 'city' },
  'nabeul': { french: 'Nabeul', category: 'city' },
  'نابل': { french: 'Nabeul', category: 'city' },
  
  // ========== QUANTITÉS ==========
  
  'برشا': { french: 'beaucoup', category: 'quantity' },
  'barcha': { french: 'beaucoup', category: 'quantity' },
  'برشة': { french: 'beaucoup', category: 'quantity' },
  'bercha': { french: 'beaucoup', category: 'quantity' },
  'ياسر': { french: 'très beaucoup', category: 'quantity' },
  'yaser': { french: 'très beaucoup', category: 'quantity' },
  'yasser': { french: 'très beaucoup', category: 'quantity' },
  'شوية': { french: 'un peu', category: 'quantity' },
  'chwaya': { french: 'un peu', category: 'quantity' },
  'chwiya': { french: 'un peu', category: 'quantity' },
  
  // "Quelque chose"
  'حاجة': { french: 'quelque chose', category: 'noun' },
  '7aja': { french: 'quelque chose', category: 'noun' },
  'haja': { french: 'quelque chose', category: 'noun' },
  
  // ========== NOURRITURE & VÉHICULES ==========
  
  'mekla': { french: 'nourriture', category: 'product' },
  'makla': { french: 'nourriture', category: 'product' },
  'ماكلة': { french: 'nourriture', category: 'product' },
  'كرهبة': { french: 'voiture', category: 'product' },
  
  // ========== QUESTIONS & EXISTENCE ==========
  
  'fama': { french: "il y a", category: 'state' },
  'famma': { french: "il y a", category: 'state' },
  'فما': { french: "il y a", category: 'state' },
  'chkoun': { french: 'qui', category: 'question' },
  'شكون': { french: 'qui', category: 'question' },
  'lel': { french: 'pour', category: 'preposition' },
  'ل': { french: 'pour', category: 'preposition' },
  'mara': { french: 'femme', category: 'person' },
  'mra': { french: 'femme', category: 'person' },
  'مرا': { french: 'femme', category: 'person' },
  
  // ========== QUALITÉS ==========
  
  // "Bon/Meilleur"
  'بهي': { french: 'bon bien', category: 'quality' },
  'behi': { french: 'bon bien', category: 'quality' },
  'behy': { french: 'bon bien', category: 'quality' },
  'أحسن': { french: 'meilleur', category: 'quality' },
  'a7sen': { french: 'meilleur', category: 'quality' },
  '7sen': { french: 'meilleur', category: 'quality' },
  
  // "Pas cher"
  'رخيص': { french: 'pas cher', category: 'price' },
  'rkhis': { french: 'pas cher', category: 'price' },
  'rkhiss': { french: 'pas cher', category: 'price' },
  'rakhis': { french: 'pas cher', category: 'price' },
  
  // "Cher"
  'غالي': { french: 'cher', category: 'price' },
  'ghali': { french: 'cher', category: 'price' },
  'ghalya': { french: 'cher', category: 'price' },
  
  // "Beau"
  'زوين': { french: 'beau', category: 'quality' },
  'zwin': { french: 'beau', category: 'quality' },
  'zouine': { french: 'beau', category: 'quality' },
  'زوينة': { french: 'belle', category: 'quality' },
  'zwina': { french: 'belle', category: 'quality' },
  
  // ========== COMMERCE & SERVICES ==========
  
  'كدوة': { french: 'cadeau', category: 'product' },
  'kadwa': { french: 'cadeau', category: 'product' },
  'kadoua': { french: 'cadeau', category: 'product' },
  'محل': { french: 'magasin commerce', category: 'business' },
  'm7el': { french: 'magasin commerce', category: 'business' },
  'm7al': { french: 'magasin commerce', category: 'business' },
  'ma7el': { french: 'magasin commerce', category: 'business' },
  'كسوة': { french: 'vêtements habits', category: 'product' },
  'kswa': { french: 'vêtements habits', category: 'product' },
  'ksou': { french: 'vêtements habits', category: 'product' },
  
  // ========== PERSONNES ==========
  
  'صغير': { french: 'petit enfant', category: 'person' },
  's\'ghir': { french: 'petit enfant', category: 'person' },
  'sghir': { french: 'petit enfant', category: 'person' },
  'صغيرة': { french: 'petite fille', category: 'person' },
  'sghira': { french: 'petite fille', category: 'person' },
  'بنت': { french: 'fille', category: 'person' },
  'bent': { french: 'fille', category: 'person' },
  'bnet': { french: 'filles', category: 'person' },
  'ولد': { french: 'garçon fils', category: 'person' },
  'weld': { french: 'garçon fils', category: 'person' },
  'ould': { french: 'garçon fils', category: 'person' },
  
  // ========== ARGENT & PAIEMENT ==========
  
  'فلوس': { french: 'argent', category: 'money' },
  'flous': { french: 'argent', category: 'money' },
  'flouss': { french: 'argent', category: 'money' },
  'نخلص': { french: 'payer', category: 'verb' },
  'nekhles': { french: 'payer', category: 'verb' },
  'nkhales': { french: 'payer', category: 'verb' },
  'بكداش': { french: 'combien', category: 'question' },
  'bkdech': { french: 'combien', category: 'question' },
  'b9adech': { french: 'combien', category: 'question' },
  // ========== PRODUITS SPÉCIFIQUES ==========
  'صباط': { french: 'chaussure', category: 'product' },
  'sabbat': { french: 'chaussure', category: 'product' },
  'sabbet': { french: 'chaussure', category: 'product' },
  'مريول': { french: 'chemise t-shirt', category: 'product' },
  'maryoul': { french: 'chemise t-shirt', category: 'product' },
  'serouel': { french: 'pantalon', category: 'product' },
  'serwel': { french: 'pantalon', category: 'product' },
  'سروال': { french: 'pantalon', category: 'product' },
  'saboun': { french: 'savon lessive', category: 'product' },
  'صابون': { french: 'savon lessive', category: 'product' },
  'zit': { french: 'huile', category: 'product' },
  'زيت': { french: 'huile', category: 'product' },
  'khobz': { french: 'pain', category: 'product' },
  'خبز': { french: 'pain', category: 'product' },
  '9ahwa': { french: 'café', category: 'product' },
  'قهوة': { french: 'café', category: 'product' },
  'atay': { french: 'thé', category: 'product' },
  'تاي': { french: 'thé', category: 'product' },
}

/**
 * Normaliser mot darija → français
 */
export function normalizeDarijaWord(word: string): string {
  const normalized = word.toLowerCase().trim()
  
  if (DARIJA_TUNISIAN_DICTIONARY[normalized]) {
    return DARIJA_TUNISIAN_DICTIONARY[normalized].french
  }
  
  return word
}

/**
 * Détecter si un mot est darija
 */
export function isDarijaWord(word: string): boolean {
  const normalized = word.toLowerCase().trim()
  return normalized in DARIJA_TUNISIAN_DICTIONARY
}

/**
 * Extraire tous les mots darija d'une phrase
 */
export function extractDarijaWords(text: string): Array<{
  original: string
  french: string
  category: string
}> {
  const words = text.split(/\s+/)
  const darijaWords: Array<any> = []
  
  words.forEach(word => {
    const normalized = word.toLowerCase().trim()
    if (DARIJA_TUNISIAN_DICTIONARY[normalized]) {
      darijaWords.push({
        original: word,
        french: DARIJA_TUNISIAN_DICTIONARY[normalized].french,
        category: DARIJA_TUNISIAN_DICTIONARY[normalized].category,
      })
    }
  })
  
  return darijaWords
}

/**
 * Convert a full phrase replacing Darija words with French words, 
 * keeping other words intact to enhance semantic search.
 */
export function translateDarijaForSearch(query: string): string {
  if (!query) return query;
  
  // Split by whitespace
  const words = query.split(/\s+/);
  
  const mappedWords = words.map(word => {
    return normalizeDarijaWord(word);
  });
  
  return mappedWords.join(' ');
}
