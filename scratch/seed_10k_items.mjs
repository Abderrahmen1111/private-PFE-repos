// seed_10k_items.mjs
// Script d'injection des 10 000 produits fictifs dans Supabase
// Utilisation: node scratch/seed_10k_items.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement manuellement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const envContent = readFileSync(join(rootDir, '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0 && !key.startsWith('#')) {
    env[key.trim()] = rest.join('=').trim();
  }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables SUPABASE manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =========== DONNÉES IDENTIQUES À mock-data-10k.ts ===========

const CATEGORIES = [
  'clothing','accessories','electronics','home','beauty','sports','food',
  'restaurant','salon','fitness','furniture','jewelry','books','toys',
  'garden','automotive','health','office','photography','music','travel',
  'pet','security','cleaning','repair','delivery','tutoring','design',
  'consulting','entertainment',
];

const PRODUCT_NAMES = {
  clothing: ['T-shirt','Jeans','Blazer','Cardigan','Hoodie','Jacket','Pants','Shorts','Sweater','Polo','Dress','Skirt','Blouse','Coat','Vest','Sweatpants','Leggings','Shirt','Bomber','Peacoat','Denim Jacket','Thermal Wear','Athletic Shirt','Tank Top','Halter Top','Crop Top'],
  accessories: ['Bag','Wallet','Belt','Scarf','Hat','Gloves','Sunglasses','Watch','Bracelet','Necklace','Ring','Earrings','Hair Clip','Tie','Pocket Square','Backpack','Clutch','Crossbody Bag','Tote Bag','Messenger Bag','Sunhat','Beanie','Mittens','Bandana','Keychain','Phone Case'],
  electronics: ['Smartphone','Laptop','Tablet','Headphones','Charger','Cable','Monitor','Keyboard','Mouse','Webcam','Speaker','Microphone','Smart Watch','Tablet Pen','USB Hub','Power Bank','Camera','Drone','Gaming Console','Projector','Router','Printer','Scanner','External SSD','Cooling Pad'],
  home: ['Lamp','Pillow','Blanket','Curtain','Rug','Mirror','Wall Art','Shelf','Rack','Organizer','Planter','Vase','Frame','Clock','Candle','Air Purifier','Humidifier','Heater','Fan','Storage Box','Drawer Divider','Wall Decal','Door Mat','Coaster Set','Desk Organizer'],
  beauty: ['Face Cream','Serum','Mask','Cleanser','Toner','Moisturizer','Sunscreen','Foundation','Concealer','Lipstick','Eyeshadow','Mascara','Blush','Bronzer','Perfume','Body Lotion','Shampoo','Conditioner','Body Wash','Deodorant','Nail Polish','Hair Mask','Bath Bomb','Face Scrub','Lip Gloss'],
  sports: ['Running Shoes','Yoga Mat','Dumbbells','Resistance Band','Jump Rope','Soccer Ball','Basketball','Tennis Racket','Swimming Goggles','Bike Helmet','Knee Pads','Wrist Guards','Boxing Gloves','Skates','Skateboard','Fitness Tracker','Water Bottle','Gym Bag','Exercise Ball','Push Up Handles'],
  food: ['Organic Coffee','Dark Chocolate','Honey','Olive Oil','Nuts Mix','Dried Fruits','Spice Blend','Tea Set','Granola','Protein Bar','Smoothie Mix','Pasta','Rice','Flour','Sugar','Salt','Vinegar','Soy Sauce','Jam','Cheese'],
  restaurant: ['Burger','Pizza','Pasta','Salad','Sandwich','Tacos','Sushi','Ramen','Curry','Steak','Fish & Chips','Fried Chicken','Pad Thai','Biryani','Falafel Wrap','Kebab','Meatballs','Soup','Risotto','Seafood Platter'],
  salon: ['Haircut','Hair Coloring','Hair Straightening','Hair Perming','Massage','Facial','Manicure','Pedicure','Waxing','Threading','Hair Treatment','Scalp Care','Beard Trim','Hair Styling','Extensions','Keratin Treatment'],
  fitness: ['Personal Training','Yoga Class','HIIT Class','Spin Class','Swimming','Boxing Class','Pilates','CrossFit','Zumba','Dance Class','Martial Arts','Strength Training','Cardio Workout','Flexibility Training','Nutrition Coaching'],
  furniture: ['Sofa','Chair','Table','Bed Frame','Nightstand','Wardrobe','Desk','Bookshelf','Cabinet','Console Table','Dining Chair','Ottoman','Bench','Recliner','Couch','Armchair','Tv Stand','Coffee Table','Side Table'],
  jewelry: ['Gold Ring','Silver Necklace','Diamond Earrings','Bracelet','Anklet','Brooch','Pendant','Locket','Charm Bracelet','Body Chain','Nose Ring','Ear Cuff','Toe Ring','Link Bracelet','Tennis Bracelet','Signet Ring'],
  books: ['Fantasy Novel','Mystery Thriller','Romance Novel','Science Fiction','Biography','Self-Help Book','Cookbook','Art Book','History Book','Business Book','Poetry Collection','Children Book','Comic Book','Graphic Novel'],
  toys: ['Action Figure','Building Blocks','Board Game','Puzzle','Doll','Car','Robot','Remote Control Helicopter','Building Set','Stuffed Animal','Toy Gun','Kite','Yo-Yo','Spinning Top'],
  garden: ['Shovel','Rake','Hose','Pruner','Gloves','Seeds','Fertilizer','Pot','Planter','Soil','Mulch','Plant Stand','Garden Light','Sprinkler','Watering Can','Garden Marker','Trellis','Compost Bin','Garden Bench'],
  automotive: ['Oil Filter','Air Filter','Wiper Blades','Car Seat Cover','Floor Mat','Air Freshener','Car Wash Kit','Tire Pressure Gauge','Jump Starter','Car Vacuum','Windshield Cleaner','Dashboard Polish','Bug Remover'],
  health: ['Vitamin','Protein Powder','Omega-3','Probiotic','Multivitamin','Collagen Supplement','Green Tea Extract','Melatonin','Iron Supplement','Calcium Supplement','Magnesium','Zinc','B-Complex','CBD Oil'],
  office: ['Desk Chair','Laptop Stand','Desk Lamp','Notebook','Pen Set','Stapler','File Cabinet','Desk Organizer','Paper Clip','Adhesive Tape','Scissors','Hole Punch','Document Holder','Cable Management','Filing Tray'],
  photography: ['Camera','Lens','Tripod','Camera Bag','Memory Card','Lightbox','Reflector','Ring Light','Backdrop','Flash','Filters','Lens Hood','Strap','Cleaning Kit','External Hard Drive'],
  music: ['Guitar','Keyboard','Ukulele','Violin','Trumpet','Drum Set','Microphone','Amplifier','Speaker','Tuner','Capo','Pick','Music Stand','Metronome'],
  travel: ['Luggage','Travel Backpack','Neck Pillow','Travel Adapter','Packing Cubes','Travel Pillow','Luggage Lock','Travel Size Toiletries','Passport Holder','Travel Insurance','Guidebook','Portable Charger','Travel Blanket'],
  pet: ['Dog Bed','Cat Toy','Food Bowl','Water Bowl','Leash','Collar','Harness','Pet Carrier','Dog Food','Cat Food','Treats','Brush','Comb','Nail Clipper'],
  security: ['Security Camera','Alarm System','Door Lock','Motion Detector','Safe Box','Security Light','Window Lock','Door Chain','Peephole Viewer','Intercom'],
  cleaning: ['Vacuum Cleaner','Mop','Broom','Dustpan','Cleaning Cloth','Sponge','Brush','Detergent','Disinfectant','Air Freshener','Trash Bin','Soap'],
  repair: ['Tool Kit','Hammer','Screwdriver Set','Wrench','Pliers','Drill','Saw','Level','Tape Measure','Nails','Screws','Epoxy Adhesive'],
  delivery: ['Same Day Delivery','Next Day Delivery','Express Shipping','Standard Shipping','International Shipping','Fragile Handling','Tracking Service'],
  tutoring: ['Math Tutoring','English Tutoring','Science Tutoring','History Tutoring','Language Tutoring','Piano Lessons','Art Classes','Coding Classes','Business Coaching','Test Preparation'],
  design: ['Logo Design','Website Design','Graphic Design','Interior Design','Fashion Design','UI/UX Design','Brand Identity','Packaging Design','Print Design','Social Media Design'],
  consulting: ['Business Consulting','Financial Consulting','Marketing Consulting','HR Consulting','IT Consulting','Legal Consulting','Tech Strategy','Growth Strategy','Management Consulting','Startup Consulting'],
  entertainment: ['Movie Tickets','Concert Tickets','Theater Tickets','Festival Tickets','Game Night Package','DJ Services','Photography Service','Video Production','Event Planning','Party Supplies'],
};

const DESCRIPTIONS = [
  'Premium quality product with excellent durability',
  'Designed for maximum comfort and style',
  'Professional grade with superior performance',
  'Eco-friendly and sustainable option',
  'Affordable and reliable choice',
  'High quality with best value',
  'Expert crafted and carefully selected',
  'Latest model with advanced features',
  'Trusted brand with excellent reviews',
  'Handmade with attention to detail',
  'Professional service with guaranteed satisfaction',
  'Competitive pricing with premium service',
  'منتج عالي الجودة بمتانة ممتازة',
  'اختيار ميسور الثمن وموثوق',
  'جودة عالية بأفضل قيمة',
  'بهي و جيّد',
  'رخيص و معقول السعر',
  'Produit haute qualité bel mtana',
  'Khiyar rakhis w trustable',
  'Behi w j7a barcha mli7',
];

// Catégories service vs produit
const SERVICE_CATEGORIES = new Set(['restaurant','salon','fitness','delivery','tutoring','design','consulting','entertainment','repair']);

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

function generateProducts(storeIds) {
  const products = [];
  const categoriesArray = Object.entries(PRODUCT_NAMES);
  const colorVariants = ['Red','Blue','Black','White','Green','Yellow','Pink','Purple','Orange','Gray'];
  const sizeVariants = ['XS','S','M','L','XL','XXL','One Size'];
  let count = 0;

  for (const [category, names] of categoriesArray) {
    const perCategory = Math.ceil(10000 / categoriesArray.length);
    const isService = SERVICE_CATEGORIES.has(category);

    for (let i = 0; i < perCategory; i++) {
      if (count >= 10000) break;

      const baseName = rand(names);
      const variant = Math.random() > 0.5
        ? ` - ${rand(colorVariants)}`
        : Math.random() > 0.7 ? ` - ${rand(sizeVariants)}` : '';
      const name = baseName + variant;
      const desc = `[${category}] ${rand(DESCRIPTIONS)}`;
      const price = Math.round((Math.random() * 490 + 10) * 100) / 100;
      const storeId = rand(storeIds);

      products.push({
        name,
        description: desc,
        price,
        price_unit: 'TND',
        main_image: `https://picsum.photos/seed/${count + 1}/400/300`,
        status: Math.random() > 0.15 ? 'AVAILABLE' : 'UNAVAILABLE',
        item_type: isService ? 'SERVICE' : 'PRODUCT',
        stock_quantity: isService ? null : Math.floor(Math.random() * 50) + 1,
        rating_average: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        total_reviews: Math.floor(Math.random() * 500),
        store_id: storeId,
        slug: slugify(name),
        is_bookable: isService,
        view_count: Math.floor(Math.random() * 1000),
        order_count: Math.floor(Math.random() * 100),
      });

      count++;
    }
    if (count >= 10000) break;
  }

  return products.slice(0, 10000);
}

async function main() {
  console.log('🚀 Démarrage du script d\'injection des 10 000 produits...\n');

  // Étape 1: Récupérer les store_ids existants
  console.log('📦 Récupération des magasins existants...');
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id')
    .limit(500);

  if (storesError) {
    console.error('❌ Erreur lors de la récupération des magasins:', storesError.message);
    process.exit(1);
  }

  if (!stores || stores.length === 0) {
    console.error('❌ Aucun magasin trouvé dans la base de données. Créez au moins un magasin avant de lancer ce script.');
    process.exit(1);
  }

  const storeIds = stores.map(s => s.id);
  console.log(`✅ ${storeIds.length} magasin(s) trouvé(s): [${storeIds.slice(0, 5).join(', ')}${storeIds.length > 5 ? '...' : ''}]\n`);

  // Étape 2: Générer les produits
  console.log('⚙️  Génération des 10 000 produits...');
  const products = generateProducts(storeIds);
  console.log(`✅ ${products.length} produits générés.\n`);

  // Étape 3: Insertion par lots de 1000
  const BATCH_SIZE = 1000;
  let inserted = 0;
  let errors = 0;

  console.log('💾 Insertion dans Supabase par lots de 1 000...\n');

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    process.stdout.write(`  Lot ${batchNum}/${totalBatches} (${i + 1} → ${Math.min(i + BATCH_SIZE, products.length)})... `);

    const { error } = await supabase.from('items').insert(batch);

    if (error) {
      console.error(`❌ ERREUR: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`✅ OK`);
    }

    // Pause légère pour ne pas saturer l'API
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`🎉 Injection terminée !`);
  console.log(`   ✅ ${inserted} produits insérés avec succès`);
  if (errors > 0) console.log(`   ❌ ${errors} produits en erreur`);
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
