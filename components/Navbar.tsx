'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FolderKanban, Search, MapPin, Plus, Camera, X, Upload, Loader2, Mic, MicOff, Navigation,
  Utensils, Wrench, ShoppingBag, Stethoscope, GraduationCap, Car, Home, Scissors,
  Dumbbell, Laptop, Bell, MessageCircle, ShoppingCart, AlertTriangle
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/supabase/auth';
import Link from 'next/link';
import { NotificationPopover } from '@/components/ui/notification-popover';
import type { Notification } from '@/components/ui/notification-popover';import { UserDropdown } from '@/components/ui/user-dropdown';
import { useState as useMotionState } from 'react';
import { Menu, MenuItem, HoveredLink, ProductItem } from '@/components/ui/navbar-menu';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { useSavesStore } from '@/lib/store/use-saves-store';
import { useMessaging } from '@/hooks/useMessaging';
import { useCartStore } from '@/lib/store/use-cart-store';

// ─── Category menu data ───────────────────────────────────────────────────────
const categoryMenuItems = [
  {
    label: 'Restaurants',
    icon: Utensils,
    href: '/search?category=restaurants',
    sub: [
      { label: 'Restaurants tunisiens', href: '/search?category=restaurants&sub=tunisien' },
      { label: 'Fast Food',             href: '/search?category=restaurants&sub=fastfood' },
      { label: 'Pizzerias',             href: '/search?category=restaurants&sub=pizza' },
      { label: 'Cafés & Salons de thé', href: '/search?category=cafes' },
    ],
  },
  {
    label: 'Services',
    icon: Wrench,
    href: '/search?category=services',
    sub: [
      { label: 'Plomberie',       href: '/search?category=services&sub=plomberie' },
      { label: 'Électricité',     href: '/search?category=services&sub=electricite' },
      { label: 'Climatisation',   href: '/search?category=services&sub=clim' },
      { label: 'Déménagement',    href: '/search?category=services&sub=demenagement' },
    ],
  },
  {
    label: 'Shopping',
    icon: ShoppingBag,
    href: '/search?category=shopping',
    sub: [
      { label: 'Vêtements',    href: '/search?category=shopping&sub=vetements' },
      { label: 'Électronique', href: '/search?category=shopping&sub=electronique' },
      { label: 'Maison',       href: '/search?category=shopping&sub=maison' },
      { label: 'Sport',        href: '/search?category=shopping&sub=sport' },
    ],
  },
  {
    label: 'Santé',
    icon: Stethoscope,
    href: '/search?category=sante',
    sub: [
      { label: 'Médecins',      href: '/search?category=sante&sub=medecins' },
      { label: 'Pharmacies',    href: '/search?category=sante&sub=pharmacies' },
      { label: 'Dentistes',     href: '/search?category=sante&sub=dentistes' },
      { label: 'Laboratoires',  href: '/search?category=sante&sub=labo' },
    ],
  },
  {
    label: 'Éducation',
    icon: GraduationCap,
    href: '/search?category=education',
    sub: [
      { label: 'Cours particuliers', href: '/search?category=education&sub=cours' },
      { label: 'Langues',            href: '/search?category=education&sub=langues' },
      { label: 'Informatique',       href: '/search?category=education&sub=info' },
      { label: 'Musique',            href: '/search?category=education&sub=musique' },
    ],
  },
  {
    label: 'Auto',
    icon: Car,
    href: '/search?category=auto',
    sub: [
      { label: 'Garages',           href: '/search?category=auto&sub=garages' },
      { label: 'Concessionnaires',  href: '/search?category=auto&sub=concessionnaires' },
      { label: 'Location de voitures', href: '/search?category=auto&sub=location' },
      { label: 'Auto-école',        href: '/search?category=auto&sub=autoecole' },
    ],
  },
  {
    label: 'Immobilier',
    icon: Home,
    href: '/search?category=immobilier',
    sub: [
      { label: 'Agences',       href: '/search?category=immobilier&sub=agences' },
      { label: 'Location',      href: '/search?category=immobilier&sub=location' },
      { label: 'Vente',         href: '/search?category=immobilier&sub=vente' },
      { label: 'Architectes',   href: '/search?category=immobilier&sub=architectes' },
    ],
  },
  {
    label: 'Beauté',
    icon: Scissors,
    href: '/search?category=beaute',
    sub: [
      { label: 'Coiffeurs',     href: '/search?category=beaute&sub=coiffeurs' },
      { label: 'Spa & Massage', href: '/search?category=beaute&sub=spa' },
      { label: 'Esthétique',    href: '/search?category=beaute&sub=esthetique' },
      { label: 'Tatouage',      href: '/search?category=beaute&sub=tatouage' },
    ],
  },
  {
    label: 'Sport',
    icon: Dumbbell,
    href: '/search?category=sport',
    sub: [
      { label: 'Salles de sport', href: '/search?category=sport&sub=salles' },
      { label: 'Yoga & Pilates',  href: '/search?category=sport&sub=yoga' },
      { label: 'Natation',        href: '/search?category=sport&sub=natation' },
      { label: 'Arts martiaux',   href: '/search?category=sport&sub=artsmartiaux' },
    ],
  },
  {
    label: 'Informatique',
    icon: Laptop,
    href: '/search?category=informatique',
    sub: [
      { label: 'Réparation PC',       href: '/search?category=informatique&sub=reparation' },
      { label: 'Développement web',   href: '/search?category=informatique&sub=devweb' },
      { label: 'Sécurité réseau',     href: '/search?category=informatique&sub=securite' },
      { label: 'Formation bureautique', href: '/search?category=informatique&sub=formation' },
    ],
  },
];

// ─── Image Search Modal ───────────────────────────────────────────────────────
function ImageSearchModal({ onClose, onSearch }: {
  onClose: () => void;
  onSearch: (query: string, imageUrl?: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP…)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Max size is 10MB.');
      return;
    }
    setError(null);
    setFileName(file.name);
    // Pre-fill analysis result with a cleaned version of the filename
    setAnalysisResult(file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      // Send base64 image to our API route for AI analysis
      const res = await fetch('/api/image-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: preview }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysisResult(data.query);
    } catch {
      setError('Could not analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = () => {
    onSearch(analysisResult || fileName.replace(/\.[^.]+$/, ''), preview ?? undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to   { opacity: 1; transform: scale(1)   translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-400" />
            <h2 className="text-white font-semibold text-sm">Search by Image</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Drop zone */}
          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10
                ${isDragging
                  ? 'border-red-400 bg-red-500/10'
                  : 'border-white/15 hover:border-white/30 hover:bg-white/5'
                }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                ${isDragging ? 'bg-red-500/20' : 'bg-white/5'}`}>
                <Upload className={`w-6 h-6 ${isDragging ? 'text-red-400' : 'text-white/40'}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/80">
                  {isDragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-white/40 mt-1">JPG, PNG, WEBP — up to 10MB</p>
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
              <img src={preview} alt="Preview" className="w-full max-h-52 object-contain" />
              <button
                onClick={() => { setPreview(null); setFileName(''); setAnalysisResult(''); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {fileName && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-[11px] text-white/70">
                  {fileName}
                </div>
              )}
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <span>⚠️</span> {error}
            </p>
          )}

          {/* Search Query / AI Analysis result */}
          {preview && (
            <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white/5 border border-white/10 group focus-within:border-red-500/50 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center">
                    <span className="text-[10px]">{analysisResult ? '✨' : '🔍'}</span>
                  </div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                    {isAnalyzing ? 'AI is analyzing...' : 'Search Keywords (Click to edit)'}
                  </p>
                </div>
                {isAnalyzing && <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={analysisResult}
                  onChange={(e) => setAnalysisResult(e.target.value)}
                  placeholder="Describe what you're looking for..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all shadow-inner"
                />
              </div>
              
              {!isAnalyzing && !analysisResult && (
                <p className="text-[10px] text-white/30 italic px-1">
                  Tip: You can type your own keywords here or use AI below.
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {preview && !analysisResult && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all disabled:opacity-50"
              >
                {isAnalyzing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                  : <><span>✨</span> Analyze with AI</>
                }
              </button>
            )}

            <button
              onClick={handleSearch}
              disabled={!preview}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              {analysisResult ? 'Search' : 'Search by Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Floating Category Menu (prompt-exact pattern) ───────────────────────────
function CategoryFloatingMenu({ searchQuery, locationQuery }: { searchQuery: string, locationQuery: string }) {
  const [active, setActive] = useMotionState<string | null>(null);
  
  const getCombinedHref = (baseHref: string) => {
    const [path, query] = baseHref.split('?');
    const params = new URLSearchParams(query);
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    return `${path}?${params.toString()}`;
  };

  return (
    <Menu setActive={setActive}>

      {/* ── Restaurants — ProductItem grid (image cards) ── */}
      <MenuItem setActive={setActive} active={active} item="Restaurants">
        <div className="grid grid-cols-2 gap-6 p-2 text-sm">
          <ProductItem
            title="Restaurants tunisiens"
            href={getCombinedHref("/search?category=restaurants&sub=tunisien")}
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=150&fit=crop"
            description="Saveurs authentiques et cuisine traditionnelle"
          />
          <ProductItem
            title="Fast Food"
            href={getCombinedHref("/search?category=restaurants&sub=fastfood")}
            src="https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300&h=150&fit=crop"
            description="Burgers, sandwichs et repas rapides"
          />
          <ProductItem
            title="Pizzerias"
            href={getCombinedHref("/search?category=restaurants&sub=pizza")}
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=150&fit=crop"
            description="Pizzas artisanales cuites au feu de bois"
          />
          <ProductItem
            title="Cafés & Salons de thé"
            href={getCombinedHref("/search?category=cafes")}
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=150&fit=crop"
            description="Pause café, thé et pâtisseries"
          />
        </div>
      </MenuItem>

      {/* ── Services — simple HoveredLink list ── */}
      <MenuItem setActive={setActive} active={active} item="Services">
        <div className="flex flex-col space-y-1 text-sm">
          <HoveredLink href={getCombinedHref("/search?category=services&sub=plomberie")}>
            <Wrench className="w-3.5 h-3.5" /> Plomberie
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=services&sub=electricite")}>
            <Wrench className="w-3.5 h-3.5" /> Électricité
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=services&sub=clim")}>
            <Wrench className="w-3.5 h-3.5" /> Climatisation
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=services&sub=demenagement")}>
            <Wrench className="w-3.5 h-3.5" /> Déménagement
          </HoveredLink>
        </div>
      </MenuItem>

      {/* ── Shopping — ProductItem grid ── */}
      <MenuItem setActive={setActive} active={active} item="Shopping">
        <div className="grid grid-cols-2 gap-6 p-2 text-sm">
          <ProductItem
            title="Vêtements"
            href={getCombinedHref("/search?category=shopping&sub=vetements")}
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&h=150&fit=crop"
            description="Mode homme, femme et enfant"
          />
          <ProductItem
            title="Électronique"
            href={getCombinedHref("/search?category=shopping&sub=electronique")}
            src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&h=150&fit=crop"
            description="Smartphones, PC, TV et accessoires"
          />
          <ProductItem
            title="Maison & Déco"
            href={getCombinedHref("/search?category=shopping&sub=maison")}
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=150&fit=crop"
            description="Meubles, décoration et art de vivre"
          />
          <ProductItem
            title="Sport & Loisirs"
            href={getCombinedHref("/search?category=shopping&sub=sport")}
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&h=150&fit=crop"
            description="Équipements sportifs et loisirs"
          />
        </div>
      </MenuItem>

      {/* ── Santé — simple list ── */}
      <MenuItem setActive={setActive} active={active} item="Santé">
        <div className="flex flex-col space-y-1 text-sm">
          <HoveredLink href={getCombinedHref("/search?category=sante&sub=medecins")}>
            <Stethoscope className="w-3.5 h-3.5" /> Médecins
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=sante&sub=pharmacies")}>
            <Stethoscope className="w-3.5 h-3.5" /> Pharmacies
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=sante&sub=dentistes")}>
            <Stethoscope className="w-3.5 h-3.5" /> Dentistes
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=sante&sub=labo")}>
            <Stethoscope className="w-3.5 h-3.5" /> Laboratoires
          </HoveredLink>
        </div>
      </MenuItem>

      {/* ── Éducation — simple list ── */}
      <MenuItem setActive={setActive} active={active} item="Éducation">
        <div className="flex flex-col space-y-1 text-sm">
          <HoveredLink href={getCombinedHref("/search?category=education&sub=cours")}>
            <GraduationCap className="w-3.5 h-3.5" /> Cours particuliers
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=education&sub=langues")}>
            <GraduationCap className="w-3.5 h-3.5" /> Langues
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=education&sub=info")}>
            <GraduationCap className="w-3.5 h-3.5" /> Informatique
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=education&sub=musique")}>
            <GraduationCap className="w-3.5 h-3.5" /> Musique
          </HoveredLink>
        </div>
      </MenuItem>

      {/* ── Auto — ProductItem grid ── */}
      <MenuItem setActive={setActive} active={active} item="Auto">
        <div className="grid grid-cols-2 gap-6 p-2 text-sm">
          <ProductItem
            title="Garages & Réparation"
            href={getCombinedHref("/search?category=auto&sub=garages")}
            src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=300&h=150&fit=crop"
            description="Mécaniciens et centres auto agréés"
          />
          <ProductItem
            title="Concessionnaires"
            href={getCombinedHref("/search?category=auto&sub=concessionnaires")}
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=150&fit=crop"
            description="Vente de véhicules neufs et d'occasion"
          />
          <ProductItem
            title="Location de voitures"
            href={getCombinedHref("/search?category=auto&sub=location")}
            src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&h=150&fit=crop"
            description="Louez une voiture au meilleur prix"
          />
          <ProductItem
            title="Auto-école"
            href={getCombinedHref("/search?category=auto&sub=autoecole")}
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=150&fit=crop"
            description="Permis de conduire et formation"
          />
        </div>
      </MenuItem>

      {/* ── Immobilier — ProductItem grid ── */}
      <MenuItem setActive={setActive} active={active} item="Immobilier">
        <div className="grid grid-cols-2 gap-6 p-2 text-sm">
          <ProductItem
            title="Agences immobilières"
            href={getCombinedHref("/search?category=immobilier&sub=agences")}
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=150&fit=crop"
            description="Trouvez l'agence idéale près de chez vous"
          />
          <ProductItem
            title="Location"
            href={getCombinedHref("/search?category=immobilier&sub=location")}
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=150&fit=crop"
            description="Appartements et maisons à louer"
          />
          <ProductItem
            title="Vente"
            href={getCombinedHref("/search?category=immobilier&sub=vente")}
            src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=150&fit=crop"
            description="Achat de biens neufs et anciens"
          />
          <ProductItem
            title="Architectes"
            href={getCombinedHref("/search?category=immobilier&sub=architectes")}
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&h=150&fit=crop"
            description="Conception et rénovation de projets"
          />
        </div>
      </MenuItem>

      {/* ── Beauté — simple list ── */}
      <MenuItem setActive={setActive} active={active} item="Beauté">
        <div className="flex flex-col space-y-1 text-sm">
          <HoveredLink href={getCombinedHref("/search?category=beaute&sub=coiffeurs")}>
            <Scissors className="w-3.5 h-3.5" /> Coiffeurs
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=beaute&sub=spa")}>
            <Scissors className="w-3.5 h-3.5" /> Spa & Massage
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=beaute&sub=esthetique")}>
            <Scissors className="w-3.5 h-3.5" /> Esthétique
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=beaute&sub=tatouage")}>
            <Scissors className="w-3.5 h-3.5" /> Tatouage
          </HoveredLink>
        </div>
      </MenuItem>

      {/* ── Sport — simple list ── */}
      <MenuItem setActive={setActive} active={active} item="Sport">
        <div className="flex flex-col space-y-1 text-sm">
          <HoveredLink href={getCombinedHref("/search?category=sport&sub=salles")}>
            <Dumbbell className="w-3.5 h-3.5" /> Salles de sport
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=sport&sub=yoga")}>
            <Dumbbell className="w-3.5 h-3.5" /> Yoga & Pilates
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=sport&sub=natation")}>
            <Dumbbell className="w-3.5 h-3.5" /> Natation
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=sport&sub=artsmartiaux")}>
            <Dumbbell className="w-3.5 h-3.5" /> Arts martiaux
          </HoveredLink>
        </div>
      </MenuItem>

      {/* ── Informatique — simple list ── */}
      <MenuItem setActive={setActive} active={active} item="Informatique">
        <div className="flex flex-col space-y-1 text-sm">
          <HoveredLink href={getCombinedHref("/search?category=informatique&sub=reparation")}>
            <Laptop className="w-3.5 h-3.5" /> Réparation PC
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=informatique&sub=devweb")}>
            <Laptop className="w-3.5 h-3.5" /> Développement web
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=informatique&sub=securite")}>
            <Laptop className="w-3.5 h-3.5" /> Sécurité réseau
          </HoveredLink>
          <HoveredLink href={getCombinedHref("/search?category=informatique&sub=formation")}>
            <Laptop className="w-3.5 h-3.5" /> Formation bureautique
          </HoveredLink>
        </div>
      </MenuItem>

    </Menu>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { totalUnreadCount: messageUnreadCount } = useMessaging();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dbProfile, setDbProfile] = useState<{ name?: string, avatar?: string } | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeStatus, setStoreStatus] = useState<string | null>(null);
  const [ownedStores, setOwnedStores] = useState<any[]>([]);


  const [profileOpen, setProfileOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleNotificationsChange = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications);
  };
  
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useVoiceSearch({
    language: 'ar-TN',
    continuous: false,
    interimResults: false
  });

  const { search: doSmartSearch, results: searchResults, isLoading: isSearchLoading } = useSmartSearch();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Geoapify Autocomplete state
  const [debouncedLocQuery, setDebouncedLocQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [isLocLoading, setIsLocLoading] = useState(false);
  const saveCount = useSavesStore((state) => state.saveCount);
  const cartItemCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      doSmartSearch(debouncedQuery, { 
        limit: 8, 
        location: locationQuery, 
        isSuggestion: true 
      });
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [debouncedQuery, locationQuery, doSmartSearch]);

  // Debounce for Location
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLocQuery(locationQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [locationQuery]);

  // Fetch Geoapify Autocomplete
  useEffect(() => {
    const fetchLocations = async () => {
      if (debouncedLocQuery.trim().length > 2) {
        setIsLocLoading(true);
        setShowLocDropdown(true);
        try {
          const res = await fetch(`/api/geo/autocomplete?text=${encodeURIComponent(debouncedLocQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setLocationSuggestions(data.features || []);
          }
        } catch (e) {
          console.error('Autocomplete error', e);
        } finally {
          setIsLocLoading(false);
        }
      } else {
        setShowLocDropdown(false);
        setLocationSuggestions([]);
      }
    };
    fetchLocations();
  }, [debouncedLocQuery]);

  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);
  const [isLocating, setIsLocating] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isHome]);

  // Dynamic placeholder state
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [displayText, setDisplayText] = useState('');

  const typingSpeed = 100;
  const pauseDuration = 5000;

  const searchSuggestions = [
    'Je veux un PC pour mon fils étudiant',
    'Restaurant italien',
    'Plombier urgence',
    'Cours de piano',
    'Vélo électrique',
    'Photographe mariage',
    'Coach sportif',
    'Réparation téléphone',
  ];

  // Typing animation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentSuggestion = searchSuggestions[placeholderIndex];
    if (isTyping) {
      if (displayText.length < currentSuggestion.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentSuggestion.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        setIsTyping(false);
        timeout = setTimeout(() => setIsTyping(true), pauseDuration);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, typingSpeed / 2);
      } else {
        setPlaceholderIndex((prev: number) => (prev + 1) % searchSuggestions.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, placeholderIndex]);

  // Auth state
  useEffect(() => {
    const supabase = createClient();
    const fetchUserData = async (userId: string) => {
      // 1. Fetch official role and profile from database
      const { data: profile } = await supabase
        .from('users')
        .select('role, full_name, avatar_url')
        .eq('id', userId)
        .single();
      
      if (profile) {
        setUserRole((profile as any).role);
        setDbProfile({
          name: (profile as any).full_name,
          avatar: (profile as any).avatar_url
        });
      }

      // 2. Fetch ALL stores owned by this user
      const { data: stores } = await supabase
        .from('stores')
        .select('id, name, status, logo_url')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true });

      if (stores && stores.length > 0) {
        setOwnedStores(stores.map(s => ({ 
          id: s.id.toString(), 
          name: s.name, 
          status: s.status,
          logo: s.logo_url 
        })));
        // Default storeId to the first one for the main dashboard link
        setStoreId(stores[0].id.toString());
        setStoreStatus(stores[0].status);
      }
    };


    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setStoreId(null);
        setStoreStatus(null);
        setUserRole(null);
      }
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, []);


  // ─── Voice Search ───────────────────────────────────────────────────────────
  const handleVoiceSearch = () => {
    if (!isSupported) {
      alert('Voice search is not supported in your browser.');
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setSearchQuery('');
      startListening();
    }
  };

  // ─── Near Me (Geolocation) ──────────────────────────────────────────────────
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'Ro2yaMarketplace/1.0' } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Near me';
          setLocationQuery(city);
        } catch {
          setLocationQuery(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        alert('Could not get your location. Please allow location access.');
        setIsLocating(false);
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);

  router.push(`/search?${params.toString()}`);
  };

  // Called by the modal after AI analysis or direct submit
  const handleImageSearch = (query: string, imageUrl?: string) => {
    const params = new URLSearchParams();
    params.set('query', query);
    if (imageUrl) params.set('imageSearch', '1');
  router.push(`/search?${params.toString()}`);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Image search modal */}
      {imageSearchOpen && (
        <ImageSearchModal
          onClose={() => setImageSearchOpen(false)}
          onSearch={handleImageSearch}
        />
      )}

    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
        hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Rejection Banner */}
      {storeStatus === 'REJECTED' && (
        <div className="bg-rose-600 text-white text-[10px] sm:text-xs py-2 px-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest animate-in slide-in-from-top duration-500">
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Votre demande de boutique a été refusée par l'administrateur.</span>
        </div>
      )}

      <div className={`mx-auto transition-all duration-500 ${
        isHome ? 'max-w-[1400px] mt-2 sm:mt-4 px-2 sm:px-6' : 'max-w-full mt-0 px-0'
      }`}>
        <div className={`relative bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
          isHome ? 'rounded-2xl sm:rounded-3xl h-16 sm:h-20' : 'h-16 sm:h-20'
        } flex items-center px-4 sm:px-8 gap-4 sm:gap-8`}>
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 h-full overflow-visible">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                <img
                  src="/ro2ya_logo1.png"
                  alt="Platform Logo"
                  className="h-36 w-36 object-contain"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35)) drop-shadow(0 0 22px rgba(239,68,68,0.3))' }}
                />
              </Link>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center gap-2">
              <div className="flex flex-1 items-center bg-black/60 border border-white/20 rounded-xl backdrop-blur-md">

                {/* Text search */}
                <div className="flex-1 flex items-center rounded-xl gap-2 px-4 py-2 border-r border-white/10 relative">
                  <Search className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    type="text"
                    placeholder={displayText}
                    value={searchQuery}
                    onFocus={() => { if (searchQuery.length >= 2) setShowDropdown(true); }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-white placeholder-white/50"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    title={isListening ? 'Stop listening' : 'Voice search'}
                    className={`flex-shrink-0 p-1 rounded-full transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-white/40 hover:text-white'}`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* SMART SEARCH DROPDOWN */}
                  {showDropdown && (
                    <div className="absolute top-[115%] left-0 w-full min-w-[300px] md:w-[130%] bg-zinc-900 border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 flex flex-col backdrop-blur-xl">
                       {isSearchLoading ? (
                          <div className="p-5 text-center text-white/60 text-sm flex items-center justify-center gap-3 font-medium">
                             <Loader2 className="w-5 h-5 animate-spin text-red-500" /> Analyse sémantique...
                          </div>
                       ) : searchResults && searchResults.length > 0 ? (
                          <div className="py-2 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                             {searchResults.slice(0, 8).map((res: any, idx: number) => {
                                // Déterminer le lien selon le type de résultat
                                let href = '#';
                                let badge = '';
                                
                                if (res.result_type === 'STORE' || (!res.result_type && !res.item_type)) {
                                  href = `/merchants/business/${res.id}`;
                                  badge = 'Boutique';
                                } else if (res.result_type === 'ITEM' || res.item_type) {
                                  // Vector search met le store_id dans metadata
                                  const sId = res.metadata?.store_id || res.store_id;
                                  href = `/merchants/business/${sId}`;
                                  badge = 'Produit';
                                } else if (res.result_type === 'BUSINESS_DIR') {
                                  href = `/search?query=${encodeURIComponent(res.name)}`;
                                  badge = 'Annuaire';
                                } else if (res.result_type === 'SERVICE_DIR') {
                                  href = `/searchService?id=${res.id}`;
                                  badge = 'Service';
                                }

                                return (
                                  <Link key={idx} href={href} className="block px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0">
                                     <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-lg bg-red-500/10 flex flex-col items-center justify-center shrink-0 overflow-hidden relative">
                                         {res.image_url ? (
                                           <img src={res.image_url} alt="" className="w-full h-full object-cover" />
                                         ) : (
                                           <Search className="w-4 h-4 text-red-500" />
                                         )}
                                       </div>
                                       <div className="min-w-0 flex-1">
                                         <div className="flex items-center justify-between gap-2">
                                           <div className="text-white text-sm font-semibold truncate">{res.name || res.title}</div>
                                           {badge && <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white/70 px-1.5 py-0.5 rounded shrink-0">{badge}</span>}
                                         </div>
                                         <div className="text-white/50 text-xs truncate mt-0.5">
                                            {res.location_city ? `${res.location_city} • ` : ''}
                                            {res.description?.substring(0, 60) || 'Découvrir ce résultat...'}
                                         </div>
                                       </div>
                                     </div>
                                  </Link>
                                );
                             })}
                             <button type="button" onClick={handleSearch as any} className="w-full px-4 py-3 text-sm text-center text-red-400 font-bold hover:bg-white/5 transition border-t border-white/10 mt-1 flex justify-center items-center gap-2">
                               <Search className="w-4 h-4"/> Voir tous les résultats
                             </button>
                          </div>
                       ) : (
                          <div className="p-5 text-center text-white/50 text-sm">
                             Aucune correspondance avec cette recherche.
                          </div>
                       )}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 px-4 py-2 border-r border-white/10 relative">
                  <MapPin className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={locationQuery}
                    onFocus={() => { if (locationQuery.length > 2) setShowLocDropdown(true); }}
                    onBlur={() => setTimeout(() => setShowLocDropdown(false), 200)}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-32 bg-transparent outline-none text-sm text-white placeholder-white/50"
                  />
                  <button
                    type="button"
                    onClick={handleNearMe}
                    title="Use my location"
                    className="flex-shrink-0 p-1 rounded-full text-white/40 hover:text-white transition-colors"
                  >
                    {isLocating
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Navigation className="w-4 h-4" />}
                  </button>

                  {/* LOCATION DROPDOWN */}
                  {showLocDropdown && (
                    <div className="absolute top-[115%] left-0 w-[250px] bg-zinc-900 border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 flex flex-col backdrop-blur-xl">
                      {isLocLoading ? (
                        <div className="p-4 text-center text-white/60 text-xs flex items-center justify-center gap-2 font-medium">
                          <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Recherche...
                        </div>
                      ) : locationSuggestions.length > 0 ? (
                        <div className="py-2 max-h-[300px] overflow-y-auto">
                          {locationSuggestions.map((feat: any, idx: number) => {
                            const name = feat.properties.city || feat.properties.name || feat.properties.county;
                            const state = feat.properties.state;
                            if (!name) return null;
                            const fullAddr = `${name}${state ? `, ${state}` : ''}`;
                            return (
                              <div 
                                key={idx} 
                                onClick={() => {
                                  setLocationQuery(fullAddr);
                                  setShowLocDropdown(false);
                                }}
                                className="block px-4 py-2 hover:bg-white/5 transition border-b border-white/5 last:border-0 cursor-pointer"
                              >
                                <div className="text-white text-sm font-semibold truncate">{name}</div>
                                <div className="text-white/50 text-xs truncate mt-0.5">{state}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-white/50 text-xs">
                          Aucune adresse trouvée en Tunisie.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 📷 Image search button — inside the bar */}
                <button
                  type="button"
                  onClick={() => setImageSearchOpen(true)}
                  title="Search by image"
                  className="flex items-center gap-1.5 px-3 py-2 text-white/50 hover:text-white transition-colors group"
                >
                  <Camera className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                  <span className="text-xs hidden lg:block group-hover:text-red-400 transition-colors">Image</span>
                </button>

              </div>

              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl ml-2 mr-2 text-sm font-medium transition-colors">
                Search
              </button>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button className="hidden sm:block text-sm px-4 py-2 text-white bg-[#11111198] hover:bg-[#111111d1] shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none rounded-xl backdrop-blur-sm transition">
                write a review
              </button>

              {user ? (
                <>
                  {/* Dashboard/Add Business - ONLY FOR PRO/BUSINESS OWNER */}
                  {(() => {
                    const effectiveRole = userRole?.toLowerCase() || user.user_metadata?.role?.toLowerCase();
                    
                    return storeId && storeStatus !== 'REJECTED' ? (
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/${storeId}`}>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:shadow-lg hover:shadow-red-600/20 text-sm font-bold text-white transition-all ring-1 ring-white/10">
                            <FolderKanban className="w-4 h-4" />
                            Dashboard
                          </button>
                        </Link>
                        <Link href="/merchants/business/add">
                          <button 
                            title="Ajouter un autre établissement"
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white transition shadow-lg shadow-green-600/20"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <Link href="/merchants/business/add">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition shadow-lg shadow-red-600/20">
                          <Plus className="w-4 h-4" />
                          Add Business
                        </button>
                      </Link>
                    );
                  })()}

                    <div className="flex items-center gap-2">
                      {/* Cart Icon */}
                      <Link href="/profile/cart">
                        <button className="relative group/cart w-10 h-10 flex items-center justify-center rounded-2xl bg-[#11111198] hover:bg-[#111111d1] backdrop-blur-sm border border-white/10 transition-all duration-300">
                          <ShoppingCart className="w-5 h-5 text-white/70 group-hover/cart:text-white transition-colors" />
                          {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-black animate-in zoom-in duration-300">
                              {cartItemCount > 9 ? '9+' : cartItemCount}
                            </span>
                          )}
                        </button>
                      </Link>

                      {/* Message Icon */}
                      <Link href="/messages">
                        <button className="relative group/msg w-10 h-10 flex items-center justify-center rounded-2xl bg-[#11111198] hover:bg-[#111111d1] backdrop-blur-sm border border-white/10 transition-all duration-300">
                          <MessageCircle className="w-5 h-5 text-white/70 group-hover/msg:text-white transition-colors" />
                          {messageUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-black animate-in zoom-in duration-300">
                              {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                            </span>
                          )}
                        </button>
                      </Link>

                      {/* Notification Dropdown */}
                      <NotificationPopover
  notifications={notifications}
  onNotificationsChange={handleNotificationsChange}
  buttonClassName="relative group/notification w-10 h-10 flex items-center justify-center rounded-2xl bg-[#11111198] hover:bg-[#111111d1] backdrop-blur-sm border border-white/10 transition-all duration-300"
  popoverClassName="bg-[#11111198] backdrop-blur-sm border border-white/10"
  textColor="text-white"
  hoverBgColor="hover:bg-white/10"
  dividerColor="divide-white/10"
  headerBorderColor="border-white/10"
/>
                    </div>

                    <div className="relative inline-flex items-center justify-center ml-2">
                      {saveCount >= 3 && (
                        <div className="absolute -top-1.5 -right-6 z-50 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xl ring-2 ring-[#0b0f1a] animate-in zoom-in duration-500 whitespace-nowrap pointer-events-none">
                          {saveCount} sauvegardés
                        </div>
                      )}
                    <UserDropdown
                    user={{
                      name: dbProfile?.name || user.user_metadata?.full_name || user.email || 'User',
                      username: user.email || '',
                      avatar: dbProfile?.avatar || user.user_metadata?.avatar_url || '',
                      initials: (dbProfile?.name || user.user_metadata?.full_name || user.email || 'U')
                        .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
                      status: 'online',
                      role: userRole || user.user_metadata?.role,
                      ownedStores: ownedStores
                    }}
                    onSwitchStore={(id) => {
                      router.push(`/dashboard/${id}`);
                    }}
                    onAction={(action: string) => {

                      if (action === 'logout') handleSignOut();
                      
                      const currentRole = userRole?.toLowerCase() || user.user_metadata?.role?.toLowerCase();

                      if (action === 'profile') {
                        if (currentRole === 'business_owner' || currentRole === 'pro' || currentRole === 'admin') {
                          router.push('/profile/businessOwner');
                        } else {
                          router.push('/profile/user');
                        }
                      }
                      
                      if ((action === 'business-settings' || action === 'billing') && 
                          (currentRole === 'business_owner' || currentRole === 'pro')) {
                        router.push('/dashboard/account');
                      }

                      if (action === 'notifications' && currentRole === 'client') {
                        router.push('/profile/notifications');
                      }

                      if (action === 'panier' && currentRole === 'client') {
                        router.push('/profile/cart');
                      }
                    }}
                  />
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <button className="px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition">
                      Log in
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition">
                      Sign up
                    </button>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>

        {/* ── Floating Category Menu — exactly as per prompt ─────────── */}
        {/* Desktop only: floating pill below navbar */}
        {isHome && (
          <div className="hidden md:flex justify-center w-full mt-3 px-4">
            <CategoryFloatingMenu searchQuery={searchQuery} locationQuery={locationQuery} />
          </div>
        )}

        {/* Mobile: horizontal scroll chips */}
        {isHome && (
          <div className="md:hidden border-t border-white/10 bg-black/50 backdrop-blur-md px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {categoryMenuItems.map((cat) => {
              const Icon = cat.icon;
              const [path, query] = cat.href.split('?');
              const params = new URLSearchParams(query);
              if (searchQuery) params.set('query', searchQuery);
              if (locationQuery) params.set('location', locationQuery);
              const combinedHref = `${path}?${params.toString()}`;

              return (
                <Link
                  key={cat.label}
                  href={combinedHref}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-xs text-white/70 hover:text-white hover:bg-white/15 transition-all active:scale-95"
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                </Link>
              );
            })}
            <Link
              href="/categories"
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 text-xs text-red-400 font-semibold hover:bg-red-600/30 transition-all"
            >
              Tout voir
            </Link>
          </div>
        </div>
        )}

      </nav>
    </>
  );
}