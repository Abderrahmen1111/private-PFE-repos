import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { translateDarijaForSearch } from '../lib/darija-dictionary';
import { generateEmbedding } from '../lib/openrouter-embeddings';

async function test() {
  const input = "صالون تجميل قريب مني";
  console.log("=== ORIGINAL ===");
  console.log(input);
  
  const translated = translateDarijaForSearch(input);
  console.log("\n=== TRADUCTION DARIJA -> FRANÇAIS ===");
  console.log(translated);
  
  console.log("\n=== GÉNÉRATION D'EMBEDDING ===");
  try {
    const embedding = await generateEmbedding(translated);
    console.log(`Succès ! Le modèle BAAI/BGE-M3 a généré un vecteur de ${embedding.length} dimensions.`);
    console.log("Voici un aperçu des 10 premières dimensions du vecteur :");
    console.log(embedding.slice(0, 10));
  } catch (err) {
    console.error("Erreur lors de la génération de l'embedding :", err);
  }
}

test();
