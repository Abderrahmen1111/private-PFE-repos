import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { parseDarijaPrompt } from '../lib/ai/darija-parser';

async function testParser() {
  console.log('--- Test de l\'Analyseur Darija (Gemini + OpenRouter) ---');
  
  const prompts = [
    "zid produit jdid: kasket noire b 25 DT",
    "dir promo 20% 3la kol les produits"
  ];

  for (const prompt of prompts) {
    console.log(`\nAnalyse du prompt: "${prompt}"...`);
    try {
      const result = await parseDarijaPrompt(prompt);
      console.log('✅ Résultat:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('❌ ERREUR CRITIQUE:', error instanceof Error ? error.message : error);
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
    }
  }
}

testParser();
