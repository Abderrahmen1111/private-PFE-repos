'use client';

import { Camera, MapPin, Calendar, BadgeCheck, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  name: string;
  email: string;
  city: string;
  memberSince: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export default function ProfileHeader({ name, email, city, memberSince, avatarUrl, isVerified }: ProfileHeaderProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative group">
      {/* Banner with Mesh Gradient Effect */}
      <div className="h-44 sm:h-56 rounded-3xl bg-[#4F46E5] relative overflow-hidden shadow-2xl shadow-indigo-200/50">
        {/* Animated Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[80%] rounded-full bg-[#818CF8] blur-[80px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[80%] rounded-full bg-[#C084FC] blur-[80px] opacity-40 animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[50%] rounded-full bg-[#EC4899] blur-[100px] opacity-20" />
        
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        
        {/* Subtle noise pattern */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Avatar + info */}
      <div className="px-6 sm:px-10 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 gap-6">
          {/* Avatar Area */}
          <div className="relative group/avatar">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative z-10"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                : <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{initials}</span>
              }
            </motion.div>
            
            {/* Pulsing glow behind avatar */}
            <div className="absolute inset-0 rounded-[2rem] bg-indigo-500/30 blur-xl scale-95 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 -z-0" />
            
            <button className="absolute bottom-1 right-1 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all text-gray-600">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons Area */}
          <div className="flex items-center gap-3 self-start sm:self-auto group/btns">
             <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-gray-100 text-sm font-bold text-gray-700 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              <Share2 className="w-4 h-4 text-indigo-500" />
              Share
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Name & metadata */}
        <div className="mt-6 sm:mt-8">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{name}</h1>
            {isVerified && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm shadow-blue-50">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Verified</span>
              </div>
            )}
          </div>
          
          <p className="text-sm font-medium text-gray-400 mt-1 max-w-sm">{email}</p>
          
          <div className="flex items-center gap-5 mt-5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 group/meta transition-colors hover:bg-white hover:border-indigo-100">
              <MapPin className="w-4 h-4 text-gray-400 group-hover/meta:text-indigo-500 transition-colors" />
              <span className="text-xs font-bold text-gray-600">{city}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 group/meta transition-colors hover:bg-white hover:border-indigo-100">
              <Calendar className="w-4 h-4 text-gray-400 group-hover/meta:text-indigo-500 transition-colors" />
              <span className="text-xs font-bold text-gray-600">Joined {memberSince}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}