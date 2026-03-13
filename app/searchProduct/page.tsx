"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  image: string;
  tag: string;
  tagIcon: string;
  tagColor: string;
  title: string;
  price: string;
  seller: string;
  sellerRating: number;
  sellerReviews: number;
  distance: string;
  availability: string;
  delivery: boolean;
  badges: string[];
  gradient: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const products: Product[] = [
  {
    id: 1,
    image: "",
    tag: "Idéal pour études & usage quotidien",
    tagIcon: "",
    tagColor: "from-violet-50 to-indigo-50 text-indigo-700 border-indigo-100",
    title: "Lenovo IdeaPad 5 – 15.6″ FHD, Ryzen 5, 8Go RAM",
    price: "2 400 TND",
    seller: "TechStore Sfax",
    sellerRating: 5,
    sellerReviews: 128,
    distance: "1.2 km",
    availability: "Disponible en magasin",
    delivery: true,
    badges: ["Achat vérifié", "Garantie 2 ans"],
    gradient: "from-indigo-400/20 to-violet-400/20",
  },
  {
    id: 2,
    image: "",
    tag: "Choix équilibré performance / prix",
    tagIcon: "",
    tagColor: "from-emerald-50 to-teal-50 text-teal-700 border-teal-100",
    title: "HP Pavilion 15 – Core i5 12ème Gén, 16Go, SSD 512Go",
    price: "3 100 TND",
    seller: "Informatique Plus",
    sellerRating: 4,
    sellerReviews: 87,
    distance: "3.5 km",
    availability: "Stock limité",
    delivery: true,
    badges: ["Commerçant vérifié"],
    gradient: "from-teal-400/20 to-emerald-400/20",
  },
  {
    id: 3,
    image: "",
    tag: "Haute performance pour logiciels exigeants",
    tagIcon: "",
    tagColor: "from-amber-50 to-orange-50 text-orange-700 border-orange-100",
    title: "ASUS ROG Zephyrus G14 – Ryzen 9, RTX 4060, 32Go",
    price: "5 800 TND",
    seller: "GameZone Tunis",
    sellerRating: 5,
    sellerReviews: 214,
    distance: "8.1 km",
    availability: "Disponible en ligne",
    delivery: true,
    badges: ["Achat vérifié", "Commerçant vérifié", "Garantie 2 ans"],
    gradient: "from-orange-400/20 to-amber-400/20",
  },
  {
    id: 4,
    image: "no product yet",
    tag: "Budget maîtrisé, qualité assurée",
    tagIcon: "",
    tagColor: "from-sky-50 to-blue-50 text-blue-700 border-blue-100",
    title: "Acer Aspire 3 – Core i3, 8Go, SSD 256Go, 15.6″",
    price: "1 650 TND",
    seller: "ElectroMart Sfax",
    sellerRating: 4,
    sellerReviews: 63,
    distance: "0.8 km",
    availability: "Disponible en magasin",
    delivery: false,
    badges: ["Garantie 1 an"],
    gradient: "from-blue-400/20 to-sky-400/20",
  },
  {
    id: 5,
    image: "no product yet",
    tag: "Écosystème premium & longévité exceptionnelle",
    tagIcon: "",
    tagColor: "from-rose-50 to-pink-50 text-rose-700 border-rose-100",
    title: "MacBook Air M2 – 8Go, SSD 256Go, 13.6″ Liquid Retina",
    price: "4 200 TND",
    seller: "Apple Reseller Tunis",
    sellerRating: 5,
    sellerReviews: 341,
    distance: "12 km",
    availability: "Disponible en ligne",
    delivery: true,
    badges: ["Achat vérifié", "Commerçant vérifié"],
    gradient: "from-pink-400/20 to-rose-400/20",
  },
  {
    id: 6,
    image: "no product yet",
    tag: "Rapport qualité/prix imbattable",
    tagIcon: "",
    tagColor: "from-purple-50 to-violet-50 text-purple-700 border-purple-100",
    title: "Dell Inspiron 15 – Core i5, 8Go, 512Go SSD, FHD IPS",
    price: "2 750 TND",
    seller: "Dell Official Sfax",
    sellerRating: 5,
    sellerReviews: 156,
    distance: "2.3 km",
    availability: "Disponible en magasin",
    delivery: true,
    badges: ["Achat vérifié", "Garantie 2 ans"],
    gradient: "from-violet-400/20 to-purple-400/20",
  },
];

const filters = [
  { label: "Usage étudiant", icon: "🎓" },
  { label: "Qualité/prix", icon: "💎" },
  { label: "Haute performance", icon: "🚀" },
  { label: "Budget maîtrisé", icon: "💰" },
  { label: "Prix", icon: "" },
  { label: "Localisation", icon: "" },
  { label: "Disponibilité", icon: "" },
  { label: "Livraison", icon: "" },
  { label: "Note", icon: "⭐" },
];

const sortOptions = [
  "Pertinence",
  "Prix croissant",
  "Les mieux notés ⭐",
  "Proches de vous 📍",
];

const recommendations = [
  { icon: "💎", label: "Meilleur rapport qualité/prix", sub: "HP Pavilion 15", color: "from-teal-500 to-emerald-500" },
  { icon: "⭐", label: "Le plus populaire", sub: "MacBook Air M2", color: "from-violet-500 to-purple-500" },
  { icon: "💰", label: "Budget optimisé", sub: "Acer Aspire 3", color: "from-sky-500 to-blue-500" },
];

const similarSearches = [
  "PC portable gaming étudiant",
  "Meilleur ordinateur portable 2024",
  "Laptop léger longue autonomie",
  "PC pour développeur",
  "Ordinateur étudiant médecine",
];

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= n ? "text-amber-400" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ p, compared, onCompare }: { p: Product; compared: boolean; onCompare: () => void }) {
  const [wished, setWished] = useState(false);

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-stone-100 hover:border-stone-200 hover:-translate-y-1">
      {/* Image zone */}
      <div className={`relative h-44 bg-gradient-to-br ${p.gradient} flex items-center justify-center overflow-hidden`}>
        <span className="text-7xl select-none transition-transform duration-500 group-hover:scale-110">{p.image}</span>
        {/* Wishlist */}
        <button
          onClick={() => setWished(w => !w)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${wished ? "bg-rose-500 text-white" : "bg-white/80 text-stone-400 hover:text-rose-400"} shadow-sm`}
        >
          <svg className="w-4 h-4" fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2.5">
        {/* Smart Tag */}
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-gradient-to-r border w-fit ${p.tagColor}`}>
          {p.tagIcon} {p.tag}
        </span>

        {/* Title */}
        <h3 className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2">{p.title}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-stone-900">{p.price}</span>
        </div>

        {/* Seller */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px]">🏪</div>
          <span className="text-xs text-stone-500">
            <span className="text-stone-700 font-medium">{p.seller}</span>
            {" · "}<Stars n={p.sellerRating} />{" "}
            <span className="text-stone-400">({p.sellerReviews})</span>
          </span>
        </div>

        {/* Availability */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
            {p.availability}
          </span>
          {p.delivery && (
            <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
              🚚 Livraison possible
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full">
            📍 À {p.distance}
          </span>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-1">
          {p.badges.map(b => (
            <span key={b} className="text-[10px] text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full font-medium">
              ✓ {b}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button className="flex-1 text-[13px] font-semibold bg-stone-900 text-white py-2 rounded-xl hover:bg-stone-700 transition-colors duration-200">
            Voir détails
          </button>
          <button className="flex-1 text-[13px] font-medium border border-stone-200 text-stone-700 py-2 rounded-xl hover:bg-stone-50 transition-colors duration-200">
            🛒 Panier
          </button>
          <button
            onClick={onCompare}
            className={`w-9 flex items-center justify-center text-[13px] rounded-xl border transition-all duration-200 ${compared ? "bg-violet-100 border-violet-300 text-violet-700" : "border-stone-200 text-stone-400 hover:border-violet-200 hover:text-violet-500"}`}
            title="Comparer"
          >
            ⚖️
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SearchResultsPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Pertinence");
  const [compared, setCompared] = useState<number[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  const toggleFilter = (f: string) =>
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const toggleCompare = (id: number) =>
    setCompared(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-3));

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-[system-ui]" style={{ fontFamily: "'DM Sans', 'Instrument Sans', system-ui, sans-serif" }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { font-family: 'DM Sans', system-ui, sans-serif; }
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .card-delay-1 { animation-delay: 0.05s; }
        .card-delay-2 { animation-delay: 0.1s; }
        .card-delay-3 { animation-delay: 0.15s; }
        .card-delay-4 { animation-delay: 0.2s; }
        .card-delay-5 { animation-delay: 0.25s; }
        .card-delay-6 { animation-delay: 0.3s; }
        `}</style>

      {/* ── Navbar placeholder ── */}
  



      {/* ── Main Content ── */}

      <main className="max-w-6xl mx-auto px-6 py-8">
<nav className="bg-white border-b border-stone-100 px-6 py-3.5 flex items-center justify-center sticky top-0 z-50">
  <div className="flex items-center gap-3 bg-stone-100 rounded-xl px-4 py-2 w-80">
    <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
    <span className="text-stone-500 text-sm text-center">PC idéal pour étudiant</span>
  </div>
</nav>
      {/* ── 1. Query Interpretation Banner ── */}

        
      <div className="bg-white border-b border-stone-100 px-6 py-4 fade-up">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:"18px",height:"18px"}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Résultats pour</p>
            <p className="text-stone-800 font-semibold text-base">
              Nous avons trouvé des ordinateurs adaptés à un usage étudiant 🎓
              <span className="ml-3 text-sm font-normal text-stone-400">— {products.length} produits</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Sticky Filter Bar ── */}
      <div className="sticky top-[57px] z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div
            ref={filterRef}
            className="flex items-center gap-2 overflow-x-auto hide-scroll flex-1 pb-0.5"
          >
            {filters.map(f => {
              const active = activeFilters.includes(f.label);
              return (
                <button
                  key={f.label}
                  onClick={() => toggleFilter(f.label)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 shadow-sm
                    ${active
                      ? "bg-stone-900 text-white border-stone-900 shadow-md"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:text-stone-900"
                    }`}
                >
                  {f.icon && <span>{f.icon}</span>}
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-stone-400 whitespace-nowrap">Trier par</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none focus:border-stone-400 appearance-none pr-7 bg-no-repeat"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundPosition: "right 8px center", backgroundSize: "14px" }}
            >
              {sortOptions.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>
        {/* ── 4 & 5. Product Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.slice(0, 3).map((p, i) => (
            <div key={p.id} className={`fade-up card-delay-${i + 1} opacity-0`}>
              <ProductCard p={p} compared={compared.includes(p.id)} onCompare={() => toggleCompare(p.id)} />
            </div>
          ))}
        </div>

        {/* ── 6. Cognitive Guidance ── */}
        <div className="my-8 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden fade-up" style={{animationDelay:"0.35s"}}>
          <div className="px-6 pt-5 pb-3 border-b border-stone-50">
            <p className="text-stone-500 text-xs uppercase tracking-widest font-medium mb-0.5">Aide à la décision</p>
            <h2 className="text-stone-900 font-semibold text-lg serif">Vous hésitez ? Voici nos recommandations 👇</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-50">
            {recommendations.map(r => (
              <button key={r.label} className="flex items-center gap-3 px-6 py-4 hover:bg-stone-50 transition-colors text-left group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  {r.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700">{r.label}</p>
                  <p className="text-xs text-stone-400">{r.sub}</p>
                </div>
                <svg className="w-4 h-4 text-stone-300 ml-auto group-hover:text-stone-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* ── More Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.slice(3).map((p, i) => (
            <div key={p.id} className={`fade-up card-delay-${i + 1} opacity-0`} style={{animationDelay:`${0.4 + i * 0.05}s`}}>
              <ProductCard p={p} compared={compared.includes(p.id)} onCompare={() => toggleCompare(p.id)} />
            </div>
          ))}
        </div>

        {/* ── 7. Discovery Section ── */}
        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {/* Trending local */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
            <p className="text-stone-500 text-xs uppercase tracking-widest font-medium mb-1">Tendances</p>
            <h3 className="text-stone-900 font-semibold mb-4 serif">Populaires dans votre région </h3>
            <div className="space-y-3">
              {products.slice(0, 3).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 group cursor-pointer">
                  <span className="text-2xl w-8 text-center">{p.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate group-hover:text-stone-900 transition-colors">{p.title}</p>
                    <p className="text-xs text-stone-400">{p.price}</p>
                  </div>
                  <span className="text-xs text-violet-500 font-semibold bg-violet-50 px-2 py-0.5 rounded-full">#{i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar searches */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
            <p className="text-stone-500 text-xs uppercase tracking-widest font-medium mb-1">Explorer</p>
            <h3 className="text-stone-900 font-semibold mb-4 serif">Recherches similaires </h3>
            <div className="flex flex-wrap gap-2">
              {similarSearches.map(s => (
                <button
                  key={s}
                  className="text-sm text-stone-600 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Load more */}
        <div className="flex justify-center mt-10">
          <button className="flex items-center gap-2 text-sm font-medium text-stone-600 border border-stone-200 bg-white px-6 py-3 rounded-xl hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 shadow-sm">
            Voir plus de résultats
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </main>

      {/* ── Compare Bar ── */}
      {compared.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-4 fade-up">
          <span className="text-sm font-medium">{compared.length} produit{compared.length > 1 ? "s" : ""} sélectionné{compared.length > 1 ? "s" : ""}</span>
          <button className="bg-white text-stone-900 text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-stone-100 transition-colors">
            Comparer ⚖️
          </button>
          <button onClick={() => setCompared([])} className="text-stone-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}
      <Footer/>
    </div>
  );
}