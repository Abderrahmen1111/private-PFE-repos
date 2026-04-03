'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { toggleSaveAction, isStoreSaved } from '@/lib/actions/favorites';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteButtonProps {
  storeId: number;
  initialIsSaved?: boolean;
}

export default function FavoriteButton({ storeId, initialIsSaved = false }: FavoriteButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(!initialIsSaved);

  // Sync initial state if not provided
  useEffect(() => {
    if (!initialIsSaved) {
      const checkStatus = async () => {
        try {
          const status = await isStoreSaved(storeId);
          setIsSaved(status);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        } finally {
          setIsChecking(false);
        }
      };
      checkStatus();
    } else {
      setIsChecking(false);
    }
  }, [storeId, initialIsSaved]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    // Optimistic UI
    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      const result = await toggleSaveAction(storeId);
      
      if (result.saved) {
        toast.success('Établissement enregistré !', {
          description: 'Vous pouvez le retrouver dans votre profil.',
          icon: <Bookmark className="w-4 h-4 fill-emerald-500 text-emerald-500" />,
        });
      } else {
        toast.info('Retiré de vos enregistrements.');
      }
    } catch (error: any) {
      // Revert on error
      setIsSaved(previousState);
      toast.error('Erreur', {
        description: error.message || "Impossible d'enregistrer pour le moment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isChecking}
      className={`
        relative overflow-hidden group
        px-4 py-2 rounded-lg font-semibold transition-all active:scale-95
        flex items-center gap-2 border-2 
        ${isSaved 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key={isSaved ? 'saved' : 'unsaved'}
              initial={{ scale: 1 }}
              animate={{ 
                scale: isSaved ? [1, 1.4, 1] : 1,
                rotate: isSaved ? [0, -15, 15, 0] : 0 
              }}
              transition={{ duration: 0.3 }}
            >
              <Bookmark 
                className={`w-4 h-4 transition-colors ${isSaved ? 'fill-emerald-600 text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'}`} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <span className="relative z-10">
        {isSaved ? 'Enregistré' : 'Enregistrer'}
      </span>

      {/* Subtle background glow when saved */}
      {isSaved && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 bg-emerald-400/10 blur-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </button>
  );
}
