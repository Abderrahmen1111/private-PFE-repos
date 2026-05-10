import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateAndUploadImage } from '../lib/ai/image-generator';

async function testFullPipeline() {
  console.log('--- Test du Pipeline complet (Cloudflare AI + Supabase Storage) ---');
  const prompt = "A luxurious traditional Tunisian perfume bottle on a marble table, professional product photography, 8k";
  
  try {
    console.log('Étape 1: Génération et Upload en cours (attente ~15s)...');
    const url = await generateAndUploadImage(prompt, 'test-tunisian-product');
    
    if (url) {
      console.log('✅ SUCCÈS COMPLET !');
      console.log('URL de l\'image générée:', url);
    } else {
      console.log('❌ ÉCHEC du pipeline.');
      console.log('Vérifiez les logs ci-dessus pour voir si c\'est Cloudflare ou Supabase qui a échoué.');
    }
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testFullPipeline();
