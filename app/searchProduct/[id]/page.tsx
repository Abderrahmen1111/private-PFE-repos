"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "@/components/Footer";

// ─── Shared product data ──────────────────────────────────────────────────────
const products = [
  { id: 1, image: "💻", tag: "Idéal pour études & usage quotidien", tagIcon: "🎓", tagColor: "text-indigo-700 bg-indigo-50 border-indigo-100", title: "Lenovo IdeaPad 5 – 15.6″ FHD, Ryzen 5, 8Go RAM", price: "2 400 TND", originalPrice: "2 650 TND", seller: "TechStore Sfax", sellerRating: 5, sellerReviews: 128, distance: "1.2 km", availability: "Disponible en magasin", delivery: true, badges: ["Achat vérifié", "Garantie 2 ans"], gradient: "from-indigo-400/20 to-violet-400/20",
    specs: { "Processeur": "AMD Ryzen 5 5500U", "RAM": "8 Go DDR4", "Stockage": "512 Go SSD NVMe", "Écran": "15.6″ FHD IPS 60Hz", "GPU": "AMD Radeon Graphics", "OS": "Windows 11 Home", "Batterie": "57Wh — jusqu'à 9h", "Poids": "1.66 kg" },
    description: "Le Lenovo IdeaPad 5 est le compagnon parfait pour les étudiants. Léger, rapide et doté d'une excellente autonomie, il gère sans effort les cours en ligne, la bureautique, et les petits projets créatifs.",
    images: ["💻", "🖥️", "⌨️"],
    sellerInfo: { name: "TechStore Sfax", address: "Av. Habib Bourguiba, Sfax 3000", phone: "+216 74 123 456", hours: "Lun–Sam 9h–18h", verified: true },
    relatedIds: [2, 4, 6] },
  { id: 2, image: "🖥️", tag: "Choix équilibré performance / prix", tagIcon: "💎", tagColor: "text-teal-700 bg-teal-50 border-teal-100", title: "HP Pavilion 15 – Core i5 12ème Gén, 16Go, SSD 512Go", price: "3 100 TND", originalPrice: "3 350 TND", seller: "Informatique Plus", sellerRating: 4, sellerReviews: 87, distance: "3.5 km", availability: "Stock limité", delivery: true, badges: ["Commerçant vérifié"], gradient: "from-teal-400/20 to-emerald-400/20",
    specs: { "Processeur": "Intel Core i5-1235U 12ème Gén", "RAM": "16 Go DDR4", "Stockage": "512 Go SSD NVMe", "Écran": "15.6″ FHD IPS antireflet", "GPU": "Intel Iris Xe Graphics", "OS": "Windows 11 Home", "Batterie": "41Wh — jusqu'à 7.5h", "Poids": "1.75 kg" },
    description: "Le HP Pavilion 15 offre un équilibre parfait entre performances et prix. Avec son processeur Intel 12ème génération et ses 16 Go de RAM, il gère aisément la programmation, le montage vidéo léger et le multitâche intensif.",
    images: ["🖥️", "💻", "🖱️"],
    sellerInfo: { name: "Informatique Plus", address: "Rue de la République, Sfax", phone: "+216 74 456 789", hours: "Lun–Sam 8h30–17h30", verified: true },
    relatedIds: [1, 3, 5] },
  { id: 3, image: "⚡", tag: "Haute performance pour logiciels exigeants", tagIcon: "🚀", tagColor: "text-orange-700 bg-orange-50 border-orange-100", title: "ASUS ROG Zephyrus G14 – Ryzen 9, RTX 4060, 32Go", price: "5 800 TND", originalPrice: "6 200 TND", seller: "GameZone Tunis", sellerRating: 5, sellerReviews: 214, distance: "8.1 km", availability: "Disponible en ligne", delivery: true, badges: ["Achat vérifié", "Commerçant vérifié", "Garantie 2 ans"], gradient: "from-orange-400/20 to-amber-400/20",
    specs: { "Processeur": "AMD Ryzen 9 7940HS", "RAM": "32 Go DDR5", "Stockage": "1 To SSD NVMe PCIe 4.0", "Écran": "14″ QHD+ 165Hz", "GPU": "NVIDIA RTX 4060 8Go", "OS": "Windows 11 Home", "Batterie": "76Wh — jusqu'à 10h", "Poids": "1.65 kg" },
    description: "La machine ultime pour les créatifs et gamers exigeants. Le Zephyrus G14 combine une puissance de calcul exceptionnelle avec une portabilité surprenante.",
    images: ["⚡", "🎮", "🔥"],
    sellerInfo: { name: "GameZone Tunis", address: "Centre Commercial Tunis City", phone: "+216 71 789 012", hours: "Tlj 10h–21h", verified: true },
    relatedIds: [2, 5, 6] },
  { id: 4, image: "🎯", tag: "Budget maîtrisé, qualité assurée", tagIcon: "💰", tagColor: "text-blue-700 bg-blue-50 border-blue-100", title: "Acer Aspire 3 – Core i3, 8Go, SSD 256Go, 15.6″", price: "1 650 TND", originalPrice: "1 800 TND", seller: "ElectroMart Sfax", sellerRating: 4, sellerReviews: 63, distance: "0.8 km", availability: "Disponible en magasin", delivery: false, badges: ["Garantie 1 an"], gradient: "from-blue-400/20 to-sky-400/20",
    specs: { "Processeur": "Intel Core i3-1215U", "RAM": "8 Go DDR4", "Stockage": "256 Go SSD", "Écran": "15.6″ HD", "GPU": "Intel UHD Graphics", "OS": "Windows 11 Home S", "Batterie": "36Wh — jusqu'à 6h", "Poids": "1.9 kg" },
    description: "L'Acer Aspire 3 est la solution idéale pour les budgets serrés. Simple, efficace, fiable — il couvre tous les besoins essentiels : navigation web, bureautique, communication.",
    images: ["🎯", "💻", "📱"],
    sellerInfo: { name: "ElectroMart Sfax", address: "Rue Farhat Hached, Sfax", phone: "+216 74 234 567", hours: "Lun–Sam 9h–19h", verified: false },
    relatedIds: [1, 2, 6] },
  { id: 5, image: "🍎", tag: "Écosystème premium & longévité exceptionnelle", tagIcon: "✨", tagColor: "text-rose-700 bg-rose-50 border-rose-100", title: "MacBook Air M2 – 8Go, SSD 256Go, 13.6″ Liquid Retina", price: "4 200 TND", originalPrice: "4 500 TND", seller: "Apple Reseller Tunis", sellerRating: 5, sellerReviews: 341, distance: "12 km", availability: "Disponible en ligne", delivery: true, badges: ["Achat vérifié", "Commerçant vérifié"], gradient: "from-pink-400/20 to-rose-400/20",
    specs: { "Processeur": "Apple M2 (8 cœurs CPU)", "RAM": "8 Go RAM unifiée", "Stockage": "256 Go SSD", "Écran": "13.6″ Liquid Retina 2560×1664", "GPU": "Apple M2 (8 cœurs GPU)", "OS": "macOS Ventura", "Batterie": "52.6Wh — jusqu'à 18h", "Poids": "1.24 kg" },
    description: "Le MacBook Air M2 redéfinit ce qu'un ordinateur portable peut être. Ultra-fin, silencieux, d'une autonomie record, avec un écran Retina époustouflant.",
    images: ["🍎", "💻", "✨"],
    sellerInfo: { name: "Apple Reseller Tunis", address: "Les Berges du Lac, Tunis", phone: "+216 71 345 678", hours: "Lun–Sam 9h–20h", verified: true },
    relatedIds: [3, 2, 6] },
  { id: 6, image: "🔥", tag: "Rapport qualité/prix imbattable", tagIcon: "💎", tagColor: "text-purple-700 bg-purple-50 border-purple-100", title: "Dell Inspiron 15 – Core i5, 8Go, 512Go SSD, FHD IPS", price: "2 750 TND", originalPrice: "2 950 TND", seller: "Dell Official Sfax", sellerRating: 5, sellerReviews: 156, distance: "2.3 km", availability: "Disponible en magasin", delivery: true, badges: ["Achat vérifié", "Garantie 2 ans"], gradient: "from-violet-400/20 to-purple-400/20",
    specs: { "Processeur": "Intel Core i5-1335U", "RAM": "8 Go DDR4", "Stockage": "512 Go SSD NVMe", "Écran": "15.6″ FHD IPS antireflet", "GPU": "Intel Iris Xe Graphics", "OS": "Windows 11 Home", "Batterie": "54Wh — jusqu'à 8h", "Poids": "1.65 kg" },
    description: "Le Dell Inspiron 15 est une valeur sûre. Construit avec soin, il offre des performances solides au quotidien, une belle finition et un excellent support Dell.",
    images: ["🔥", "🖥️", "💼"],
    sellerInfo: { name: "Dell Official Sfax", address: "Zone Industrielle Sfax Sud", phone: "+216 74 567 890", hours: "Lun–Ven 8h–17h", verified: true },
    relatedIds: [1, 4, 5] },
];

function Stars({ n, size = "sm" }: { n: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${cls} ${i <= n ? "text-amber-400" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  );
}

// ─── Page component receives params directly (no useSearchParams needed) ──────
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = Number(params.id);
  const product = products.find(p => p.id === id) ?? products[0];
  const related = products.filter(p => product.relatedIds.includes(p.id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [wished, setWished] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "seller" | "reviews">("specs");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const priceNum = parseFloat(product.price.replace(/\s|TND/g, ""));
  const originalNum = parseFloat(product.originalPrice.replace(/\s|TND/g, ""));
  const discount = Math.round((1 - priceNum / originalNum) * 100);
  const savings = Math.round(originalNum - priceNum);

  return (
    <div className="min-h-screen bg-[#F8F7F5]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Retour aux résultats
          </button>
          <span className="text-stone-200">·</span>
          <span className="text-sm text-stone-400 truncate">{product.title}</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Hero: Image + Info ── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12 fade-up">

          {/* Image gallery */}
          <div className="space-y-3">
            <div className={`relative h-80 bg-gradient-to-br ${product.gradient} rounded-2xl flex items-center justify-center overflow-hidden border border-stone-100`}>
              <span className="text-9xl select-none drop-shadow-sm">{product.images[selectedImage]}</span>
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discount}%
                </div>
              )}
              <button onClick={() => setWished(w => !w)}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${wished ? "bg-rose-500 text-white" : "bg-white text-stone-400 hover:text-rose-400"}`}>
                <svg className="w-4 h-4" fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 rounded-xl flex items-center justify-center text-3xl transition-all border-2 ${selectedImage === i ? "border-stone-900 bg-white shadow-md" : "border-stone-100 bg-white hover:border-stone-300"}`}>
                  {img}
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border w-fit ${product.tagColor}`}>
              {product.tagIcon} {product.tag}
            </span>

            <h1 className="text-2xl font-bold text-stone-900 leading-snug serif">{product.title}</h1>

            <div className="flex items-center gap-3">
              <Stars n={product.sellerRating} size="md" />
              <span className="text-sm text-stone-500">{product.sellerReviews} avis</span>
              <span className="text-stone-200">·</span>
              <span className="text-sm text-stone-500">📍 {product.distance}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-stone-900">{product.price}</span>
              <span className="text-lg text-stone-400 line-through">{product.originalPrice}</span>
              {savings > 0 && (
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Économisez {savings} TND
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${product.availability === "Stock limité" ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50"}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${product.availability === "Stock limité" ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                {product.availability}
              </span>
              {product.delivery && (
                <span className="inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full font-medium">
                  🚚 Livraison disponible
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {product.badges.map(b => (
                <span key={b} className="text-xs text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full font-medium">✓ {b}</span>
              ))}
            </div>

            <p className="text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">{product.description}</p>

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-600 hover:bg-stone-50 font-bold transition-colors">−</button>
                <span className="w-6 text-center text-sm font-semibold text-stone-900">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-600 hover:bg-stone-50 font-bold transition-colors">+</button>
              </div>
              <button onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${addedToCart ? "bg-emerald-500 text-white" : "bg-stone-900 text-white hover:bg-stone-700"}`}>
                {addedToCart ? "✓ Ajouté au panier !" : "🛒 Ajouter au panier"}
              </button>
              <button className="flex items-center justify-center w-11 h-11 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-stone-500 hover:text-stone-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
              </button>
            </div>

            {/* Seller quick info */}
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-xl shadow-sm">🏪</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{product.seller}</p>
                <p className="text-xs text-stone-500">📍 {product.distance} · {product.sellerInfo.hours}</p>
              </div>
              {product.sellerInfo.verified && (
                <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-1 rounded-full flex-shrink-0">✓ Vérifié</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-10 fade-up" style={{animationDelay:"0.1s"}}>
          <div className="flex border-b border-stone-100">
            {(["specs", "seller", "reviews"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 ${activeTab === tab ? "text-stone-900 border-b-2 border-stone-900" : "text-stone-400 hover:text-stone-600"}`}>
                {tab === "specs" ? "📋 Caractéristiques" : tab === "seller" ? "🏪 Vendeur" : "⭐ Avis"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "specs" && (
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-2.5 px-4 bg-stone-50 rounded-xl">
                    <span className="text-xs text-stone-500 font-medium">{key}</span>
                    <span className="text-sm font-semibold text-stone-800">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "seller" && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl border border-stone-200">🏪</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900 serif">{product.sellerInfo.name}</h3>
                      {product.sellerInfo.verified && <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">✓ Vérifié</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Stars n={product.sellerRating} size="md" />
                      <span className="text-sm text-stone-500">{product.sellerReviews} avis</span>
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: "📍", label: "Adresse", val: product.sellerInfo.address },
                    { icon: "📞", label: "Téléphone", val: product.sellerInfo.phone },
                    { icon: "🕐", label: "Horaires", val: product.sellerInfo.hours },
                    { icon: "📦", label: "Livraison", val: product.delivery ? "Disponible" : "Retrait en magasin uniquement" },
                  ].map(({ icon, label, val }) => (
                    <div key={label} className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                      <span className="text-lg">{icon}</span>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">{label}</p>
                        <p className="text-sm font-semibold text-stone-800 mt-0.5">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-200">
                  📍 Voir sur la carte
                </button>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                <div className="flex items-center gap-6 p-5 bg-stone-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-stone-900 serif">{product.sellerRating}.0</p>
                    <Stars n={product.sellerRating} size="md" />
                    <p className="text-xs text-stone-400 mt-1">{product.sellerReviews} avis</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(s => (
                      <div key={s} className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 w-3">{s}</span>
                        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: s === product.sellerRating ? "75%" : s === product.sellerRating - 1 ? "15%" : "5%" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {[
                  { name: "Ahmed B.", rating: 5, date: "Il y a 3 jours", text: "Excellent produit, exactement comme décrit. La livraison était rapide et l'emballage soigné. Je recommande !" },
                  { name: "Sarah M.", rating: 5, date: "Il y a 1 semaine", text: "Très satisfaite de mon achat. Le produit est de bonne qualité et le rapport qualité/prix est imbattable." },
                  { name: "Karim T.", rating: 4, date: "Il y a 2 semaines", text: "Bon produit dans l'ensemble. Quelques délais mais le service client a bien géré." },
                ].map((r, i) => (
                  <div key={i} className="p-4 border border-stone-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">{r.name[0]}</div>
                        <div><p className="text-sm font-semibold text-stone-800">{r.name}</p><Stars n={r.rating} /></div>
                      </div>
                      <span className="text-xs text-stone-400">{r.date}</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed pl-10">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ── */}
        <div className="fade-up" style={{animationDelay:"0.2s"}}>
          <div className="mb-5">
            <p className="text-stone-500 text-xs uppercase tracking-widest font-medium mb-1">Vous pourriez aimer</p>
            <h2 className="text-stone-900 font-bold text-xl serif">Produits similaires</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map(p => (
              <div key={p.id} onClick={() => router.push(`/searchProduct/${p.id}`)}
                className="group bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                <div className={`h-32 bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{p.image}</span>
                </div>
                <div className="p-4 space-y-1.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${p.tagColor}`}>
                    {p.tagIcon} {p.tag}
                  </span>
                  <p className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug">{p.title}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-bold text-stone-900">{p.price}</span>
                    <div className="flex items-center gap-1">
                      <Stars n={p.sellerRating} />
                      <span className="text-[10px] text-stone-400">({p.sellerReviews})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}