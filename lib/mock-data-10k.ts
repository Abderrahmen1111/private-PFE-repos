// Types simples pour éviter les dépendances
interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  stock: number;
  createdAt: Date;
  rating?: number;
  reviewCount?: number;
}

// Mots darija courants en darija latin
const DARIJA_WORDS = [
  'ahla', 'marhba', 'kifek', 'labas', 'shkoun', 'wayn', 'fama', 'behi', 'rkhis',
  'tazkra', 'khridha', 'mekla', 'karhba', 'njib', 'nheb', 'nchri', 'nba7eth',
  'maftouh', 'msakker', 'tawa', 'taw', 'fi', 'krib', 'barcha', 'chwaya',
  'jdid', '7ssen', 'mtain', 'kwis', 'sla7', 'ma3a', 'sahib', 'bent', 'walad',
  'mel7a', 'tabl', 'stebel', 'ferga', 'bnaya', 'sebba', 'khalas', 'shwiya',
  'wakha', 'okhti', 'akh', 'rabbi', 'wslet', 'jit', 'roh', 'jibu', 'khud'
];

// Catégories de produits et services
const CATEGORIES = [
  'clothing',
  'accessories',
  'electronics',
  'home',
  'beauty',
  'sports',
  'food',
  'restaurant',
  'salon',
  'fitness',
  'furniture',
  'jewelry',
  'books',
  'toys',
  'garden',
  'automotive',
  'health',
  'office',
  'photography',
  'music',
  'travel',
  'pet',
  'security',
  'cleaning',
  'repair',
  'delivery',
  'tutoring',
  'design',
  'consulting',
  'entertainment',
];

// Noms de produits/services par catégorie
const PRODUCT_NAMES = {
  clothing: [
    'T-shirt', 'Jeans', 'Blazer', 'Cardigan', 'Hoodie', 'Jacket', 'Pants',
    'Shorts', 'Sweater', 'Polo', 'Dress', 'Skirt', 'Blouse', 'Coat', 'Vest',
    'Sweatpants', 'Leggings', 'Shirt', 'Bomber', 'Peacoat', 'Denim Jacket',
    'Thermal Wear', 'Athletic Shirt', 'Tank Top', 'Halter Top', 'Crop Top'
  ],
  accessories: [
    'Bag', 'Wallet', 'Belt', 'Scarf', 'Hat', 'Gloves', 'Sunglasses', 'Watch',
    'Bracelet', 'Necklace', 'Ring', 'Earrings', 'Hair Clip', 'Tie', 'Pocket Square',
    'Backpack', 'Clutch', 'Crossbody Bag', 'Tote Bag', 'Messenger Bag', 'Sunhat',
    'Beanie', 'Mittens', 'Bandana', 'Keychain', 'Phone Case'
  ],
  electronics: [
    'Smartphone', 'Laptop', 'Tablet', 'Headphones', 'Charger', 'Cable', 'Monitor',
    'Keyboard', 'Mouse', 'Webcam', 'Speaker', 'Microphone', 'Smart Watch',
    'Tablet Pen', 'USB Hub', 'Power Bank', 'Camera', 'Drone', 'Gaming Console',
    'Projector', 'Router', 'Printer', 'Scanner', 'External SSD', 'Cooling Pad'
  ],
  home: [
    'Lamp', 'Pillow', 'Blanket', 'Curtain', 'Rug', 'Mirror', 'Wall Art',
    'Shelf', 'Rack', 'Organizer', 'Planter', 'Vase', 'Frame', 'Clock',
    'Candle', 'Air Purifier', 'Humidifier', 'Heater', 'Fan', 'Storage Box',
    'Drawer Divider', 'Wall Decal', 'Door Mat', 'Coaster Set', 'Desk Organizer'
  ],
  beauty: [
    'Face Cream', 'Serum', 'Mask', 'Cleanser', 'Toner', 'Moisturizer', 'Sunscreen',
    'Foundation', 'Concealer', 'Lipstick', 'Eyeshadow', 'Mascara', 'Blush', 'Bronzer',
    'Perfume', 'Body Lotion', 'Shampoo', 'Conditioner', 'Body Wash', 'Deodorant',
    'Nail Polish', 'Hair Mask', 'Bath Bomb', 'Face Scrub', 'Lip Gloss'
  ],
  sports: [
    'Running Shoes', 'Yoga Mat', 'Dumbbells', 'Resistance Band', 'Jump Rope',
    'Soccer Ball', 'Basketball', 'Tennis Racket', 'Swimming Goggles', 'Bike Helmet',
    'Knee Pads', 'Wrist Guards', 'Boxing Gloves', 'Skates', 'Skateboard',
    'Fitness Tracker', 'Water Bottle', 'Gym Bag', 'Exercise Ball', 'Push Up Handles'
  ],
  food: [
    'Organic Coffee', 'Dark Chocolate', 'Honey', 'Olive Oil', 'Nuts Mix', 'Dried Fruits',
    'Spice Blend', 'Tea Set', 'Granola', 'Protein Bar', 'Smoothie Mix', 'Pasta',
    'Rice', 'Flour', 'Sugar', 'Salt', 'Vinegar', 'Soy Sauce', 'Jam', 'Cheese'
  ],
  restaurant: [
    'Burger', 'Pizza', 'Pasta', 'Salad', 'Sandwich', 'Tacos', 'Sushi', 'Ramen',
    'Curry', 'Steak', 'Fish & Chips', 'Fried Chicken', 'Pad Thai', 'Biryani',
    'Falafel Wrap', 'Kebab', 'Meatballs', 'Soup', 'Risotto', 'Seafood Platter'
  ],
  salon: [
    'Haircut', 'Hair Coloring', 'Hair Straightening', 'Hair Perming', 'Massage',
    'Facial', 'Manicure', 'Pedicure', 'Waxing', 'Threading', 'Hair Treatment',
    'Scalp Care', 'Beard Trim', 'Hair Styling', 'Extensions', 'Keratin Treatment'
  ],
  fitness: [
    'Personal Training', 'Yoga Class', 'HIIT Class', 'Spin Class', 'Swimming',
    'Boxing Class', 'Pilates', 'CrossFit', 'Zumba', 'Dance Class', 'Martial Arts',
    'Strength Training', 'Cardio Workout', 'Flexibility Training', 'Nutrition Coaching'
  ],
  furniture: [
    'Sofa', 'Chair', 'Table', 'Bed Frame', 'Nightstand', 'Wardrobe', 'Desk',
    'Bookshelf', 'Cabinet', 'Console Table', 'Dining Chair', 'Ottoman', 'Bench',
    'Recliner', 'Couch', 'Armchair', 'Tv Stand', 'Coffee Table', 'Side Table'
  ],
  jewelry: [
    'Gold Ring', 'Silver Necklace', 'Diamond Earrings', 'Bracelet', 'Anklet',
    'Brooch', 'Pendant', 'Locket', 'Charm Bracelet', 'Body Chain', 'Nose Ring',
    'Ear Cuff', 'Toe Ring', 'Link Bracelet', 'Tennis Bracelet', 'Signet Ring'
  ],
  books: [
    'Fantasy Novel', 'Mystery Thriller', 'Romance Novel', 'Science Fiction',
    'Biography', 'Self-Help Book', 'Cookbook', 'Art Book', 'History Book',
    'Business Book', 'Poetry Collection', 'Children Book', 'Comic Book', 'Graphic Novel'
  ],
  toys: [
    'Action Figure', 'Building Blocks', 'Board Game', 'Puzzle', 'Doll', 'Car',
    'Robot', 'Remote Control Helicopter', 'Building Set', 'Stuffed Animal',
    'Board Game', 'Toy Gun', 'Kite', 'Yo-Yo', 'Spinning Top'
  ],
  garden: [
    'Shovel', 'Rake', 'Hose', 'Pruner', 'Gloves', 'Seeds', 'Fertilizer', 'Pot',
    'Planter', 'Soil', 'Mulch', 'Plant Stand', 'Garden Light', 'Sprinkler',
    'Watering Can', 'Garden Marker', 'Trellis', 'Compost Bin', 'Garden Bench'
  ],
  automotive: [
    'Oil Filter', 'Air Filter', 'Wiper Blades', 'Car Seat Cover', 'Floor Mat',
    'Air Freshener', 'Car Wash Kit', 'Tire Pressure Gauge', 'Jump Starter',
    'Car Vacuum', 'Windshield Cleaner', 'Dashboard Polish', 'Bug Remover'
  ],
  health: [
    'Vitamin', 'Protein Powder', 'Omega-3', 'Probiotic', 'Multivitamin',
    'Collagen Supplement', 'Green Tea Extract', 'Melatonin', 'Iron Supplement',
    'Calcium Supplement', 'Magnesium', 'Zinc', 'B-Complex', 'CBD Oil'
  ],
  office: [
    'Desk Chair', 'Laptop Stand', 'Desk Lamp', 'Notebook', 'Pen Set', 'Stapler',
    'File Cabinet', 'Desk Organizer', 'Paper Clip', 'Adhesive Tape', 'Scissors',
    'Hole Punch', 'Document Holder', 'Cable Management', 'Filing Tray'
  ],
  photography: [
    'Camera', 'Lens', 'Tripod', 'Camera Bag', 'Memory Card', 'Lightbox',
    'Reflector', 'Ring Light', 'Backdrop', 'Flash', 'Filters', 'Lens Hood',
    'Strap', 'Cleaning Kit', 'External Hard Drive'
  ],
  music: [
    'Guitar', 'Keyboard', 'Ukulele', 'Violin', 'Trumpet', 'Drum Set', 'Microphone',
    'Amplifier', 'Speaker', 'Tuner', 'Capo', 'Pick', 'Music Stand', 'Metronome'
  ],
  travel: [
    'Luggage', 'Travel Backpack', 'Neck Pillow', 'Travel Adapter', 'Packing Cubes',
    'Travel Pillow', 'Luggage Lock', 'Travel Size Toiletries', 'Passport Holder',
    'Travel Insurance', 'Guidebook', 'Portable Charger', 'Travel Blanket'
  ],
  pet: [
    'Dog Bed', 'Cat Toy', 'Food Bowl', 'Water Bowl', 'Leash', 'Collar', 'Harness',
    'Pet Carrier', 'Dog Food', 'Cat Food', 'Treats', 'Brush', 'Comb', 'Nail Clipper'
  ],
  security: [
    'Security Camera', 'Alarm System', 'Door Lock', 'Motion Detector', 'Safe Box',
    'Security Light', 'Window Lock', 'Door Chain', 'Peephole Viewer', 'Intercom'
  ],
  cleaning: [
    'Vacuum Cleaner', 'Mop', 'Broom', 'Dustpan', 'Cleaning Cloth', 'Sponge',
    'Brush', 'Detergent', 'Disinfectant', 'Air Freshener', 'Trash Bin', 'Soap'
  ],
  repair: [
    'Tool Kit', 'Hammer', 'Screwdriver Set', 'Wrench', 'Pliers', 'Drill',
    'Saw', 'Level', 'Tape Measure', 'Nails', 'Screws', 'Epoxy Adhesive'
  ],
  delivery: [
    'Same Day Delivery', 'Next Day Delivery', 'Express Shipping', 'Standard Shipping',
    'International Shipping', 'Fragile Handling', 'Tracking Service'
  ],
  tutoring: [
    'Math Tutoring', 'English Tutoring', 'Science Tutoring', 'History Tutoring',
    'Language Tutoring', 'Piano Lessons', 'Art Classes', 'Coding Classes',
    'Business Coaching', 'Test Preparation'
  ],
  design: [
    'Logo Design', 'Website Design', 'Graphic Design', 'Interior Design',
    'Fashion Design', 'UI/UX Design', 'Brand Identity', 'Packaging Design',
    'Print Design', 'Social Media Design'
  ],
  consulting: [
    'Business Consulting', 'Financial Consulting', 'Marketing Consulting',
    'HR Consulting', 'IT Consulting', 'Legal Consulting', 'Tech Strategy',
    'Growth Strategy', 'Management Consulting', 'Startup Consulting'
  ],
  entertainment: [
    'Movie Tickets', 'Concert Tickets', 'Theater Tickets', 'Festival Tickets',
    'Game Night Package', 'DJ Services', 'Photography Service', 'Video Production',
    'Event Planning', 'Party Supplies'
  ]
};

// Descriptions génériques
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
  'Special edition limited availability',
  'Handmade with attention to detail',
  'Professional service with guaranteed satisfaction',
  'Expert guidance and top quality service',
  'Personalized and customized options available',
  'Competitive pricing with premium service',
];

// Descriptions en Darija Tunisien (Arabe)
const DESCRIPTIONS_DARIJA = [
  'منتج عالي الجودة بمتانة ممتازة',
  'مصمم للراحة القصوى والأسلوب',
  'مستوى مهني بأداء فائقة',
  'خيار صديق للبيئة ومستدام',
  'اختيار ميسور الثمن وموثوق',
  'جودة عالية بأفضل قيمة',
  'صنعة خبرة بعناية فائقة',
  'أحدث نموذج بميزات متقدمة',
  'العلامة الموثوقة بآراء ممتازة',
  'طبعة خاصة وفرة محدودة',
  'مصنوع يدويا بعناية بالتفاصيل',
  'خدمة احترافية برضا مضمون',
  'إرشادات خبيرة وخدمة أعلى',
  'خيارات شخصية ومخصصة',
  'تسعير تنافسي مع خدمة فاخرة',
  'بهي و جيّد',
  'رخيص و معقول السعر',
  'جديد و حديث',
  'ممتاز و نوعي',
  'متين و قوي',
];

// Descriptions en Darija Tunisien (Latin/Phonétique)
const DESCRIPTIONS_DARIJA_LATIN = [
  'Produit haute qualité bel mtana',
  'Makhsa lel ra7a w lel style',
  'Nivo professionnel bel ada a7san',
  'Khiyar safya lel bi2a w sustainable',
  'Khiyar ra5is w trustable',
  'Kalité a7san bel 9ima',
  'Snaa5a b9alba w bel t9asil',
  'Model jdid bel features a7san',
  'Alama trustable bel avis',
  'Edision special w limited',
  'Sanou2 b yad bel t9asil',
  'Khidma professionnel b rda',
  'Ershad5 khbir w khidma a7san',
  'Khiyarат shakseya',
  'Si3ar t3a5si w khidma',
  'Behi w j7a',
  'Ra5is w 9asim',
  'Jdid w 7adith',
  'Imtya2 w nwe3',
  'Matin w 9wi',
];

// Noms d'entreprises en Darija Tunisien (Latin/Phonétique)
const BUSINESS_NAMES_DARIJA_LATIN = [
  'Mutajer Nkhebba',
  'Sle3 Fahira',
  'Zawiya lel Qualité',
  'A7san Safkat',
  'A3la Alamat',
  'Mutajer Zki',
  'Souq Sri3',
  '3aml Makli',
  'Mutajer Familya',
  'Darouriyat Yawmeya',
  'Khidmat Professionnel',
  '3eyada Khabira',
  'Hall77ul 7aditha',
  'Mzoud Trustable',
  'Merkez Ibda3',
  'Studio Ibda3',
  'Tatab5 Kamela',
  'Khidmat Trustable',
  'Makhrrej Modern',
  'Boutik Klasiki',
  'Souq Dinami',
  'Qiyma Ziyada',
  'Akhtar Awwal',
];

// Noms d'entreprises
const BUSINESS_NAMES = [
  'Elite Store', 'Premium Goods', 'Quality Corner', 'Best Deals', 'Top Brands',
  'Smart Shop', 'Express Market', 'Local Business', 'Family Store', 'Daily Essentials',
  'Professional Services', 'Expert Clinic', 'Modern Solutions', 'Trusted Provider',
  'Innovation Hub', 'Creative Studio', 'Perfect Match', 'Reliable Services',
  'Trendy Outlet', 'Classic Boutique', 'Dynamic Market', 'Value Plus', 'Prime Selection'
];

// Noms d'entreprises en Darija Tunisien
const BUSINESS_NAMES_DARIJA = [
  'متجر النخبة',
  'السلع الفاخرة',
  'زاوية الجودة',
  'أفضل الصفقات',
  'أعلى العلامات',
  'المتجر الذكي',
  'سوق سريع',
  'عمل محلي',
  'متجر العائلة',
  'الضروريات اليومية',
  'الخدمات المهنية',
  'عيادة الخبراء',
  'حلول حديثة',
  'مزود موثوق',
  'مركز الابتكار',
  'استوديو إبداعي',
  'المطابقة المثالية',
  'الخدمات الموثوقة',
  'المخرج العصري',
  'البوتيك الكلاسيكي',
  'السوق الديناميكي',
  'قيمة بالإضافة',
  'الاختيار الأول',
];

// Fonction pour générer les 10k produits
export function generateMockProducts10k(): Product[] {
  const products: Product[] = [];
  let productId = 1;
  let businessId = 1;

  const categoriesArray = Object.entries(PRODUCT_NAMES);

  categoriesArray.forEach(([category, names]) => {
    // Générer environ 333 produits par catégorie (30 catégories * 333 ≈ 10k)
    const productsPerCategory = Math.ceil(10000 / categoriesArray.length);

    for (let i = 0; i < productsPerCategory; i++) {
      const basePrice = Math.random() * 500 + 10;
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomBusiness = BUSINESS_NAMES[Math.floor(Math.random() * BUSINESS_NAMES.length)];
      const randomBusinessDarija = BUSINESS_NAMES_DARIJA[Math.floor(Math.random() * BUSINESS_NAMES_DARIJA.length)];
      
      // Descriptions: 33% français, 33% darija arabe, 34% darija latin
      const descChoice = Math.random();
      let randomDescription: string;
      
      if (descChoice < 0.33) {
        randomDescription = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
      } else if (descChoice < 0.66) {
        randomDescription = DESCRIPTIONS_DARIJA[Math.floor(Math.random() * DESCRIPTIONS_DARIJA.length)];
      } else {
        randomDescription = DESCRIPTIONS_DARIJA_LATIN[Math.floor(Math.random() * DESCRIPTIONS_DARIJA_LATIN.length)];
      }
      
      const colorVariants = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray'];
      const sizeVariants = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Small', 'Medium', 'Large'];

      // Ajouter une variante aléatoire au nom
      const variant = Math.random() > 0.5 
        ? ` - ${colorVariants[Math.floor(Math.random() * colorVariants.length)]}`
        : Math.random() > 0.7
        ? ` - ${sizeVariants[Math.floor(Math.random() * sizeVariants.length)]}`
        : '';

      const product: Product = {
        id: `prod-${String(productId).padStart(6, '0')}`,
        businessId: `biz-${String(businessId).padStart(6, '0')}`,
        name: randomName + variant,
        description: randomDescription,
        price: Math.round(basePrice * 100) / 100,
        category: category as any,
        image: `/images/product-${productId}.jpg`,
        available: Math.random() > 0.15, // 85% disponible
        stock: Math.floor(Math.random() * 50) + (Math.random() > 0.15 ? 1 : 0),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Aléatoire dans les 90 derniers jours
        rating: Math.random() * 2 + 3.5, // Entre 3.5 et 5.5
        reviewCount: Math.floor(Math.random() * 500),
      };

      products.push(product);
      productId++;

      // Changer de business tous les 50 produits
      if (productId % 50 === 0) {
        businessId++;
      }

      // Arrêter à 10000
      if (products.length >= 10000) {
        return;
      }
    }

    if (products.length >= 10000) {
      return;
    }
  });

  return products.slice(0, 10000);
}

// Export direct des 10k produits
export const mockProducts10k = generateMockProducts10k();

// Export des types
export type { Product };

// Statistiques
export const mock10kStats = {
  totalProducts: mockProducts10k.length,
  totalCategories: CATEGORIES.length,
  totalBusinesses: Math.ceil(mockProducts10k.length / 50),
  availableProducts: mockProducts10k.filter(p => p.available).length,
  averagePrice: Math.round((mockProducts10k.reduce((sum, p) => sum + p.price, 0) / mockProducts10k.length) * 100) / 100,
  averageRating: Math.round((mockProducts10k.reduce((sum, p) => sum + (p.rating || 0), 0) / mockProducts10k.length) * 100) / 100,
};

// Utilitaires pour utiliser le darija
export function getRandomDarijaWord(): string {
  return DARIJA_WORDS[Math.floor(Math.random() * DARIJA_WORDS.length)];
}

export function getDarijaBusinessName(): string {
  return BUSINESS_NAMES_DARIJA[Math.floor(Math.random() * BUSINESS_NAMES_DARIJA.length)];
}

export function getDarijaBusinessNameLatin(): string {
  return BUSINESS_NAMES_DARIJA_LATIN[Math.floor(Math.random() * BUSINESS_NAMES_DARIJA_LATIN.length)];
}

export function getDarijaDescription(): string {
  return DESCRIPTIONS_DARIJA[Math.floor(Math.random() * DESCRIPTIONS_DARIJA.length)];
}

export function getDarijaDescriptionLatin(): string {
  return DESCRIPTIONS_DARIJA_LATIN[Math.floor(Math.random() * DESCRIPTIONS_DARIJA_LATIN.length)];
}

// Obtenir une traduction darija du dictionnaire
export function getDarijanTranslation(frenchWord: string): string | null {
  // Dictionnaire simple darija-français
  const darijaDict: Record<string, string> = {
    'bonjour': 'ahla',
    'bienvenue': 'marhba',
    'comment ça va': 'kifek',
    'ça va bien': 'labas',
    'qui': 'shkoun',
    'où': 'wayn',
    'il y a': 'fama',
    'bon': 'behi',
    'pas cher': 'rkhis',
    'cher': 'ghali',
    'nourriture': 'mekla',
    'voiture': 'karhba',
    'chercher': 'nba7eth',
    'acheter': 'nchri',
    'vouloir': 'nheb',
    'maintenant': 'tawa',
    'à': 'fi',
    'proche': 'krib',
    'beaucoup': 'barcha',
    'un peu': 'chwaya',
    'nouveau': 'jdid',
    'meilleur': '7ssen',
    'bien': 'kwis',
    'renseignement': 'tazkra',
  };
  
  return darijaDict[frenchWord.toLowerCase()] || null;
}
