'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, Search, MapPin, Plus, Camera, X, Upload, Loader2, Mic, MicOff, Navigation } from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/supabase/auth';
import Link from 'next/link';
import { UserDropdown } from '@/components/ui/user-dropdown';

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
    const query = analysisResult || fileName.replace(/\.[^.]+$/, '');
    onSearch(query, preview ?? undefined);
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

          {/* AI Analysis result */}
          {analysisResult && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-base mt-0.5">✨</span>
              <div>
                <p className="text-[11px] text-white/50 mb-0.5">AI detected</p>
                <p className="text-sm text-white font-medium">{analysisResult}</p>
              </div>
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

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

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
        setPlaceholderIndex((prev) => (prev + 1) % searchSuggestions.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, placeholderIndex]);

  // Auth state
  useEffect(() => {
    const supabase = createClient();
    const fetchStoreId = async (userId: string) => {
      // Fetch ANY store owned by this user
      const { data } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        setStoreId((data as any).id.toString());
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchStoreId(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchStoreId(session.user.id);
      } else {
        setStoreId(null);
      }
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, []);


  // ─── Voice Search ───────────────────────────────────────────────────────────
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in your browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
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
    await signOut();
    router.push('/');
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

      <header className="fixed top-0 left-0 right-0 z-50">
        <div>
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-16">

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
                <div className="flex-1 flex items-center rounded-xl gap-2 px-4 py-2 border-r border-white/10">
                  <Search className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    type="text"
                    placeholder={displayText}
                    value={searchQuery}
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
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 px-4 py-2 border-r border-white/10">
                  <MapPin className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={locationQuery}
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

              <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl ml-2 mr-2 text-sm font-medium transition-colors">
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
                  {storeId ? (
                    <Link href={`/dashboard/${storeId}`}>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/20 text-sm font-bold text-white transition-all ring-1 ring-white/10">
                        <FolderKanban className="w-4 h-4" />
                        My Dashboard
                      </button>
                    </Link>
                  ) : (
                    <Link href="/business/add">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition shadow-lg shadow-red-600/20">
                        <Plus className="w-4 h-4" />
                        Add Business
                      </button>
                    </Link>
                  )}

                  <UserDropdown
                    user={{
                      name: user.user_metadata?.full_name || user.email || 'User',
                      username: user.email || '',
                      avatar: user.user_metadata?.avatar_url || '',
                      initials: (user.user_metadata?.full_name || user.email || 'U')
                        .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
                      status: 'online',
                    }}
                    onAction={(action: string) => {
                      if (action === 'logout') handleSignOut();
                    }}
                  />
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
      </header>
    </>
  );
}