'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Target, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Tag,
  Clock,
  Package,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Recommendation {
  type: "dormant_product" | "happy_hour" | "bundle" | "upsell";
  title: string;
  description: string;
  suggested_action: string;
  suggestedDiscount?: number;
  targetItems: number[];
  targetItemNames: string[];
  urgency: "low" | "medium" | "high";
  estimatedImpact: string;
  confidence: number;
}

interface AIAdvisorSectionProps {
  storeId: number;
  onApplyPromotion?: (rec: Recommendation) => void;
}

export default function AIAdvisorSection({ storeId, onApplyPromotion }: AIAdvisorSectionProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    setIsRateLimited(false);
    
    try {
      const response = await fetch(`/api/dashboard/${storeId}/sales-recommendations`);
      const data = await response.json();

      if (data.error) {
        if (data.code === 429) {
          setIsRateLimited(true);
          setError("L'IA Ro2ya est actuellement très sollicitée.");
        } else {
          setError(data.error);
        }
        return;
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Failed to fetch AI recommendations:", err);
      setError("Impossible de charger les conseils IA pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchRecommendations();
    }
  }, [storeId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'dormant_product': return <Package className="w-5 h-5 text-amber-400" />;
      case 'happy_hour': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'bundle': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'upsell': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/5 rounded-[40px] border border-dashed border-white/10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-white font-black uppercase tracking-widest text-xs">Analyse des Ventes par l'IA...</p>
          <p className="text-white/40 text-[10px] font-bold">Nous calculons vos opportunités de croissance</p>
        </div>
      </div>
    );
  }

  if (isRateLimited) {
    return (
      <Card className="bg-amber-500/5 border-amber-500/10 rounded-[40px] overflow-hidden">
        <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">IA en Pause Café ☕</h3>
            <p className="text-white/60 max-w-md mx-auto text-sm">
              L'IA Ro2ya a besoin de quelques secondes pour reprendre son souffle. Les limites de l'API gratuite ont été atteintes.
            </p>
          </div>
          <Button 
            onClick={fetchRecommendations} 
            className="rounded-2xl font-black px-8 py-6 bg-amber-500 hover:bg-amber-600 text-black uppercase tracking-widest text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Réessayer l'analyse
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 rounded-[40px] border-dashed">
        <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white/40 uppercase tracking-tight">Pas encore de conseils</h3>
            <p className="text-white/20 max-w-md mx-auto text-sm font-medium">
              L'IA a besoin de plus de données de vente ou de vues pour générer des recommandations stratégiques précises.
            </p>
          </div>
          <Button variant="outline" onClick={fetchRecommendations} className="rounded-2xl border-white/10 hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Conseiller Stratégique IA</h3>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Optimisation de vos revenus en temps réel</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-3 py-1 uppercase text-[10px] tracking-widest">
          Beta Inteligente
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, idx) => (
          <Card key={idx} className="group relative bg-black/40 border-white/5 hover:border-primary/30 rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              {getIcon(rec.type)}
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-4">
                <Badge className={cn("text-[9px] font-black uppercase tracking-widest border", getUrgencyColor(rec.urgency))}>
                  Urgence {rec.urgency}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <ArrowUpRight className="w-3 h-3" /> {rec.estimatedImpact}
                </div>
              </div>
              <CardTitle className="text-xl font-black text-white leading-tight group-hover:text-primary transition-colors">
                {rec.title}
              </CardTitle>
              <CardDescription className="text-white/50 text-sm font-medium leading-relaxed">
                {rec.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-0">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Action Suggérée</span>
                </div>
                <p className="text-sm font-bold text-white group-hover:text-primary/90 transition-colors">
                  {rec.suggested_action}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/30">Indice de Confiance</span>
                  <span className="text-primary">{Math.round(rec.confidence * 100)}%</span>
                </div>
                <Progress value={rec.confidence * 100} className="h-1 bg-white/5" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button 
                  onClick={() => onApplyPromotion?.(rec)}
                  className="flex-1 rounded-2xl bg-white hover:bg-primary hover:text-white text-black font-black uppercase tracking-widest text-[10px] h-12 transition-all duration-300"
                >
                  Appliquer le conseil
                </Button>
                <Button variant="ghost" className="h-12 w-12 rounded-2xl border border-white/5 hover:bg-white/5">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Missing icon import from lucide-react in previous block
import { Brain } from 'lucide-react';
