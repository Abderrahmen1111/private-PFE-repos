"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface Artist {
  name: string;
  sales: string;
  items: number;
  verified: boolean;
  image: string;
  rank: number;
}

export const ArtistsColumn = (props: {
  className?: string;
  artists: Artist[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.artists.map((artist, i) => (
                <div 
                  className="p-6 rounded-2xl border border-white/10 shadow-lg shadow-purple-500/10 max-w-xs w-full backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300 group" 
                  key={i}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img
                        width={64}
                        height={64}
                        src={artist.image}
                        alt={artist.name}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all"
                      />
                      <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                        {artist.rank}
                      </div>
                      {artist.verified && (
                        <div className="absolute -bottom-1 -right-1">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold tracking-tight leading-5 text-lg group-hover:text-blue-400 transition-colors">
                        {artist.name}
                      </div>
                      <div className="leading-5 opacity-60 tracking-tight text-sm">
                        {artist.items} items
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Sales</div>
                      <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {artist.sales}
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-all text-xs font-medium">
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};