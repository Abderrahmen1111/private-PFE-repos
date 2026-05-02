'use client';

import React from 'react';
import { Camera, Maximize2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from '@/components/ui/dialog';

interface BusinessGallerySectionProps {
  images: string[];
  businessName: string;
}

export default function BusinessGallerySection({ images, businessName }: BusinessGallerySectionProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Camera className="w-6 h-6 text-red-500" />
          Galerie Photos
        </h2>
        <span className="text-sm font-medium text-gray-500">{images.length} photos</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => {
          const isVideo = url.match(/\.(mp4|webm|ogg|mov)$|^data:video\//i);
          
          return (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group cursor-pointer hover:ring-2 hover:ring-red-500/20 transition-all">
                  {isVideo ? (
                    <video src={url} className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={url} 
                      alt={`${businessName} gallery ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 drop-shadow-md" />
                  </div>

                  {isVideo && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1.5 rounded-lg">
                      <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                    </div>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0">
                <div className="relative w-full h-full flex items-center justify-center min-h-[50vh]">
                  {isVideo ? (
                    <video src={url} controls autoPlay className="max-w-full max-h-[85vh]" />
                  ) : (
                    <img src={url} alt={`${businessName} full ${index + 1}`} className="max-w-full max-h-[85vh] object-contain" />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}
