'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2, Bell } from 'lucide-react';
import { toggleFollowStore, isFollowingStore } from '@/lib/actions/store-follows';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FollowButtonProps {
  storeId: number;
  initialIsFollowing?: boolean;
}

export default function FollowButton({ storeId, initialIsFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(!initialIsFollowing);

  // Sync initial state if not provided
  useEffect(() => {
    if (!initialIsFollowing) {
      const checkStatus = async () => {
        try {
          const status = await isFollowingStore(storeId);
          setIsFollowing(status);
        } catch (error) {
          console.error('Error checking follow status:', error);
        } finally {
          setIsChecking(false);
        }
      };
      checkStatus();
    } else {
      setIsChecking(false);
    }
  }, [storeId, initialIsFollowing]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    // Optimistic UI
    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      const result = await toggleFollowStore(storeId);
      
      if (result.followed) {
        toast.success('Abonné !', {
          description: 'Vous recevrez des notifications de cette boutique.',
          icon: <Bell className="w-4 h-4 fill-blue-500 text-blue-500" />,
        });
      } else {
        toast.info('Désabonné.');
      }
    } catch (error: any) {
      // Revert on error
      setIsFollowing(previousState);
      toast.error('Erreur', {
        description: error.message || "Impossible de s'abonner pour le moment.",
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
        ${isFollowing 
          ? 'bg-blue-50 border-blue-200 text-blue-700' 
          : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-md hover:shadow-lg'
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
              key={isFollowing ? 'following' : 'not-following'}
              initial={{ scale: 1 }}
              animate={{ 
                scale: isFollowing ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {isFollowing ? (
                <UserMinus className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <span className="relative z-10">
        {isFollowing ? 'Suivi' : 'Suivre'}
      </span>

      {/* Subtle background glow when following */}
      {isFollowing && (
        <motion.div
          layoutId="follow-glow"
          className="absolute inset-0 bg-blue-400/10 blur-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </button>
  );
}
