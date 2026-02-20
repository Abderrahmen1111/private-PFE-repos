'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Code, FolderKanban, Rocket, Search, MapPin, User, LogOut, Plus } from "lucide-react";
import { DropdownMenu } from "./ui/dropdown-menu";
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/supabase/auth';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Track auth state
  useEffect(() => {
    const supabase = createClient();

    // Use getSession (reads from cookies/storage, no API call) for immediate check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Navbar] getSession result:', session ? `user=${session.user.email}` : 'NO SESSION');
      setUser(session?.user ?? null);
    });

    // Listen for real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Navbar] onAuthStateChange:', event, session ? `user=${session.user.email}` : 'NO SESSION');
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    router.push(`/search?${params.toString()}`);
  };

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glass container */}
      <div >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href="/" className="flex items-center">
              {/* <img src="/logo1.png" alt="Logo" className="w-50 h-20 object-contain" /> */}
            </a>
          </div>

          {/* Search bar - unified form with location */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center gap-2">
            <div className="flex flex-1 items-center bg-black/60 border border-white/20 rounded-xl backdrop-blur-md">
              {/* Search input */}
              <div className="flex-1 flex items-center rounded-xl gap-2 px-4 py-2 border-r border-white/10">
                <Search className="w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="restaurants, cafes, bars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-white placeholder-white/50"
                />
              </div>

              {/* Location input */}
              <div className="flex items-center rounded-xl gap-2 px-4 py-2">
                <MapPin className="w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-40 bg-transparent outline-none text-sm text-white placeholder-white/50"
                />
              </div>

              {/* Search button inside bar for desktops */}
            </div>
            <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl ml-2 mr-2">
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
                {/* Add Business button — only visible when logged in */}
                <Link href="/business/add">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition">
                    <Plus className="w-4 h-4" />
                    Add Business
                  </button>
                </Link>

                {/* Profile avatar dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition"
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-white font-medium truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login & Sign Up — only visible when logged out */}
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
  );
}

