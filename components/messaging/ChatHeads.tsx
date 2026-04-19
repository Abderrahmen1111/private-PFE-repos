'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMessaging } from '@/hooks/useMessaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle, Video, Compass, X, ChevronLeft, GripVertical, GripHorizontal, ExternalLink, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatWindow } from './ChatWindow';
import { ConversationSidebar } from './ConversationSidebar';
import { Button } from '@/components/ui/button';
import { DiscoverFeed } from '@/components/discover/discover-feed';
import { ShopCompactView } from '@/components/shop/ShopCompactView';

type Edge = 'left' | 'right' | 'top' | 'bottom';
type ViewMode = 'messages' | 'discover' | 'shop';

export function ChatHeads() {
  const router = useRouter();
  const [edge, setEdge] = useState<Edge>('right');
  const [isNearEdge, setIsNearEdge] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('messages');

  const { 
    conversations, 
    messages,
    currentUser,
    setActivePartnerId, 
    setIsOpen, 
    activePartnerId, 
    totalUnreadCount,
    fetchMessages,
    sendMessage,
    isOpen
  } = useMessaging();
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 40 });
  const springY = useSpring(y, { stiffness: 400, damping: 40 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      x.set(window.innerWidth - 180);
      y.set(window.innerHeight / 2 - 40);
      setEdge('right');
    }
  }, [x, y]);

  const handleDragEnd = (_: any, info: any) => {
    const { x: curX, y: curY } = info.point;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const distances = [
      { edge: 'left' as Edge, dist: curX },
      { edge: 'right' as Edge, dist: width - curX },
      { edge: 'top' as Edge, dist: curY },
      { edge: 'bottom' as Edge, dist: height - curY },
    ];

    const nearest = distances.reduce((prev, curr) => (prev.dist < curr.dist ? prev : curr));
    const thresholdX = width * 0.3;
    const thresholdY = height * 0.3;
    const isInCenter = curX > thresholdX && curX < (width - thresholdX) && 
                       curY > thresholdY && curY < (height - thresholdY);

    let targetX: number;
    let targetY: number;
    let finalEdge: Edge;

    if (isInCenter) {
      targetX = width - 180;
      targetY = height / 2 - 40;
      finalEdge = 'right';
    } else {
      finalEdge = nearest.edge;
      targetX = curX;
      targetY = curY;
      if (nearest.edge === 'left') targetX = 20;
      if (nearest.edge === 'right') targetX = width - 180;
      if (nearest.edge === 'top') targetY = 20;
      if (nearest.edge === 'bottom') targetY = height - 120;
    }

    setEdge(finalEdge);
    targetX = Math.max(20, Math.min(width - 160, targetX));
    targetY = Math.max(20, Math.min(height - 120, targetY));
    x.set(targetX);
    y.set(targetY);
    setIsNearEdge(!isInCenter);
  };

  const handleSelectPartner = (id: string) => {
    setActivePartnerId(id);
    fetchMessages(id);
  };

  // Calculate panel position: centered on hub but clamped to screen
  // Refined for absolute viewport tracking
  const panelX = useTransform(springX, (val) => {
    if (typeof window === 'undefined') return val - 146;
    const ideal = val - 146;
    return Math.max(20, Math.min(window.innerWidth - 440, ideal));
  });

  const panelY = useTransform(springY, (val) => {
    if (typeof window === 'undefined') return val - 285;
    const ideal = val - 285;
    return Math.max(20, Math.min(window.innerHeight - 670, ideal));
  });

  const activePartner = conversations.find((c: any) => c.user_id === activePartnerId) || null;
  const recentConversations = conversations.slice(0, 8);
  const isHorizontal = edge === 'top' || edge === 'bottom';

  return (
    <>
      {/* Global Edge Detectors */}
      {!isOpen && (
        <div className="fixed inset-0 pointer-events-none z-[130]">
          <div 
            className="absolute left-0 top-0 bottom-0 w-10 pointer-events-auto cursor-none" 
            onMouseEnter={() => { setIsNearEdge(true); x.set(20); setEdge('left'); }} 
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-10 pointer-events-auto cursor-none" 
            onMouseEnter={() => { setIsNearEdge(true); x.set(window.innerWidth - 180); setEdge('right'); }} 
          />
        </div>
      )}

      {/* DRAGGABLE MAIN HUB */}
      <motion.div 
        style={{ x: springX, y: springY }}
        drag
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={{ 
          left: 20, 
          right: typeof window !== 'undefined' ? window.innerWidth - 180 : 1000, 
          top: 20, 
          bottom: typeof window !== 'undefined' ? window.innerHeight - 120 : 1000 
        }}
        onDragEnd={handleDragEnd}
        onDragStart={() => setIsNearEdge(true)}
        className="fixed top-0 left-0 z-[140] pointer-events-auto flex items-center justify-center h-20 w-44 group"
      >
        {/* Unified Logo Hub */}
        <div 
          className={cn(
            "flex gap-3 px-4 py-3 bg-zinc-900/40 backdrop-blur-3xl border border-white/20 rounded-[30px] shadow-2xl transition-all duration-300 relative z-50 overflow-hidden",
            isOpen ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100 animate-in fade-in zoom-in duration-500",
            !isNearEdge && "opacity-0 scale-50 translate-x-10 pointer-events-none"
          )}
          onMouseEnter={() => setIsNearEdge(true)}
          onMouseLeave={() => {
            if (!isOpen) setIsNearEdge(false);
          }}
        >
          <div 
            className="relative p-2 rounded-2xl bg-white text-black hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg"
            onClick={() => { setViewMode('messages'); setIsOpen(true); }}
          >
            <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-lg">
                {totalUnreadCount}
              </span>
            )}
          </div>

          <div 
            className="p-2 rounded-2xl bg-zinc-900 text-white hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg border border-white/5"
            onClick={() => { setViewMode('discover'); setIsOpen(true); }}
          >
            <Video className="w-6 h-6" />
          </div>

          <div 
            className="p-2 rounded-2xl bg-indigo-600 text-white hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg border border-white/5"
            onClick={() => { setViewMode('shop'); setIsOpen(true); }}
          >
            <ShoppingBag className="w-6 h-6" />
          </div>

          <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripHorizontal className="w-4 h-4 text-white/40" />
          </div>
        </div>
      </motion.div>

        {/* THE TABBED PANEL (Moved Outside the draggable hub for better coordinate management) */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop to close on click outside */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[145]"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              style={{ x: panelX, y: panelY }}
              className="fixed top-0 left-0 z-[150] w-[420px] h-[650px] bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] flex flex-col pointer-events-auto ring-1 ring-white/20"
            >
              {/* Unified Tab Switcher Header */}
              <div className="flex flex-col border-b border-white/5 bg-zinc-950/50 p-4 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex bg-white/5 p-1 rounded-2xl ring-1 ring-white/10 shadow-inner">
                    <button
                      onClick={() => setViewMode('messages')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        viewMode === 'messages' ? "bg-white text-black shadow-xl scale-[1.02]" : "text-zinc-500 hover:text-white"
                      )}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Messages
                    </button>
                    <button
                      onClick={() => setViewMode('discover')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        viewMode === 'discover' ? "bg-white text-black shadow-xl scale-[1.02]" : "text-zinc-500 hover:text-white"
                      )}
                    >
                      <Video className="w-4 h-4" />
                      Découverte
                    </button>
                    <button
                      onClick={() => setViewMode('shop')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        viewMode === 'shop' ? "bg-white text-black shadow-xl scale-[1.02]" : "text-zinc-500 hover:text-white"
                      )}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Boutique
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white" 
                          onClick={() => {
                            let path = '/messages';
                            if (viewMode === 'discover') path = '/discover';
                            if (viewMode === 'shop') path = '/shop';
                            router.push(path);
                            setIsOpen(false);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="end" className="bg-zinc-900 border-white/10 text-white z-[200]">
                        <p>Ouvrir la page complète</p>
                      </TooltipContent>
                    </Tooltip>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10" 
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Header Content based on mode */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`${viewMode}-header`}
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 px-2"
                  >
                    {activePartnerId && viewMode === 'messages' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={() => setActivePartnerId(null)}>
                        <ChevronLeft className="h-5 h-5 text-white" />
                      </Button>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-lg leading-none text-white tracking-tight">
                        {viewMode === 'shop' 
                          ? 'La Boutique' 
                          : viewMode === 'discover' 
                            ? 'Découverte' 
                            : activePartnerId ? activePartner?.full_name : 'Boîte de réception'}
                      </span>
                      {viewMode === 'messages' && activePartnerId && activePartner?.online && (
                        <span className="flex items-center gap-1.5 text-[10px] text-green-500 font-medium mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          En ligne
                        </span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden flex min-h-0 bg-black">
                <AnimatePresence mode="wait">
                  {viewMode === 'messages' ? (
                    <motion.div 
                      key="chat-view"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="w-full h-full flex flex-col"
                    >
                      {!activePartnerId ? (
                        <ConversationSidebar conversations={conversations} onSelect={handleSelectPartner} />
                      ) : (
                        <div className="flex-1 flex flex-col h-full relative min-h-0">
                          {currentUser && (
                            <ChatWindow 
                              partner={activePartner}
                              messages={messages}
                              currentUserId={currentUser.id}
                              onSendMessage={(content, type, url, meta) => sendMessage(activePartnerId, content, type, url, meta)}
                            />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : viewMode === 'discover' ? (
                    <motion.div 
                      key="discover-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full h-full"
                    >
                      <DiscoverFeed isCompact={true} />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="shop-view"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full h-full"
                    >
                      <ShopCompactView />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Snap Indicator */}
      <AnimatePresence>
        {isNearEdge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed pointer-events-none z-[120] bg-primary/5 border-primary/20 transition-colors",
              edge === 'left' ? "left-0 top-0 bottom-0 w-2 border-r-2" : 
              edge === 'right' ? "right-0 top-0 bottom-0 w-2 border-l-2" :
              edge === 'top' ? "top-0 left-0 right-0 h-2 border-b-2" : "bottom-0 left-0 right-0 h-2 border-t-2"
            )}
          />
        )}
      </AnimatePresence>
    </>
  );
}
