// import { describe, test, expect } from '@jest/globals'
declare var describe: any;
declare var test: any;
declare var expect: any;
import { 
  DARIJA_TUNISIAN_DICTIONARY,
  extractDarijaWords,
  normalizeDarijaWord,
  isDarijaWord 
} from './darija-dictionary'

describe('Darija Phonetic Dictionary', () => {
  test('should detect darija word variations', () => {
    expect(isDarijaWord('nhb')).toBe(true)
    expect(isDarijaWord('n7eb')).toBe(true)
    expect(isDarijaWord('n7b')).toBe(true)
    expect(isDarijaWord('نحب')).toBe(true)
  })

  test('should normalize darija words', () => {
    expect(normalizeDarijaWord('maftouh')).toBe('ouvert')
    expect(normalizeDarijaWord('tawa')).toBe('maintenant')
    expect(normalizeDarijaWord('medenien')).toBe('Médenine')
  })

  test('should extract darija words from sentence', () => {
    const text = 'nhb plombier maftouh tawa fi medenien'
    const words = extractDarijaWords(text)
    
    expect(words).toContainEqual({
      original: 'nhb',
      french: 'je veux',
      category: 'verb'
    })
    
    expect(words).toContainEqual({
      original: 'maftouh',
      french: 'ouvert',
      category: 'state'
    })
    
    expect(words.length).toBeGreaterThan(3)
  })

  test('should handle city name variations', () => {
    expect(normalizeDarijaWord('medenien')).toBe('Médenine')
    expect(normalizeDarijaWord('medenine')).toBe('Médenine')
    expect(normalizeDarijaWord('مدنين')).toBe('Médenine')
  })

  test('should handle time expressions', () => {
    expect(normalizeDarijaWord('tawa')).toBe('maintenant')
    expect(normalizeDarijaWord('taw')).toBe('maintenant')
    expect(normalizeDarijaWord('tou')).toBe('maintenant')
    expect(normalizeDarijaWord('توا')).toBe('maintenant')
  })

  test('should handle state/status words', () => {
    expect(normalizeDarijaWord('maftouh')).toBe('ouvert')
    expect(normalizeDarijaWord('mftouh')).toBe('ouvert')
    expect(normalizeDarijaWord('مفتوح')).toBe('ouvert')
  })
})

describe('Complex Darija Queries', () => {
  test('plombier query', () => {
    const query = 'nhb plombier maftouh tawa fi medenien'
    const words = extractDarijaWords(query)
    
    expect(words.length).toBe(5) // nhb, maftouh, tawa, fi, medenien
    expect(words.some(w => w.french === 'je veux')).toBe(true)
    expect(words.some(w => w.french === 'ouvert')).toBe(true)
    expect(words.some(w => w.french === 'maintenant')).toBe(true)
    expect(words.some(w => w.french === 'Médenine')).toBe(true)
  })

  test('restaurant query', () => {
    const query = 'n7eb mekla behi pas cher fi sousse'
    const words = extractDarijaWords(query)
    
    expect(words.some(w => w.french === 'je veux')).toBe(true)
    expect(words.some(w => w.french === 'nourriture')).toBe(true)
    expect(words.some(w => w.french === 'bon bien')).toBe(true)
  })

  test('coiffeur query', () => {
    const query = 'wayn nl9a coiffeur mara 9rib meni'
    const words = extractDarijaWords(query)
    
    expect(words.some(w => w.french === 'où')).toBe(true)
    expect(words.some(w => w.french === 'trouver')).toBe(true)
    expect(words.some(w => w.french === 'proche près')).toBe(true)
  })
})
