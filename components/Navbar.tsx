'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Code, FolderKanban, Rocket, Search, MapPin } from "lucide-react";
import { DropdownMenu } from "./ui/dropdown-menu";


export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    router.push(`/search?${params.toString()}`);
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
<div className="hidden sm:block">
  <DropdownMenu
    options={[
      {
        label: "Add a Business",
        onClick: () => console.log("Add a Business"),
        Icon: <Rocket className="h-4 w-4" />,
      },
      {
        label: "claim your business for free",
        onClick: () => console.log("claim your business for free"),
        Icon: <FolderKanban className="h-4 w-4" />,
      },
      {
        label: "Log in to Business Account",
        onClick: () => console.log("Log in to Business Account"),
        Icon: <Briefcase className="h-4 w-4" />,
      },
      {
        label: "Developers",
        onClick: () => console.log("Developers"),
        Icon: <Code className="h-4 w-4" />,
      },
    ]}
  >
    <span className="text-sm">For Project</span>
  </DropdownMenu>
</div>

            <button className="hidden sm:block text-sm px-4 py-2 text-white bg-[#11111198] hover:bg-[#111111d1] shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none rounded-xl backdrop-blur-sm transition">
              write a review
            </button>

            <button className="px-4 py-2 rounded-xl  bg-red-600  text-sm font-semibold text-white transition">
              Log in
            </button>

            <button className="px-4 py-2 rounded-xl  bg-red-600  text-sm font-semibold text-white transition">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
