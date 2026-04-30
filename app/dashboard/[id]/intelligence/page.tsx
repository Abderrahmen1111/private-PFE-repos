'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  MessageCircle,
  Zap,
  Target,
  Clock,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';

export default function IntelligencePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/${id}/intelligence`);
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (error: any) {
      toast.error("Failed to load intelligence: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchIntelligence();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">L'IA analyse vos interactions sociales...</p>
      </div>
    );
  }

  if (!data || !data.aggregate) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Brain className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Pas encore assez de données</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Nous avons besoin de commentaires sur vos Reels pour générer des analyses intelligentes. 
          Commencez par publier du contenu et interagir avec votre audience.
        </p>
        <Button onClick={fetchIntelligence}>Réessayer</Button>
      </div>
    );
  }

  const { aggregate, globalRecommendations, results } = data;
  const sentimentData = [
    { name: 'Positif', value: aggregate.sentimentBreakdown.positive, color: '#10b981' },
    { name: 'Neutre', value: aggregate.sentimentBreakdown.neutral, color: '#6366f1' },
    { name: 'Négatif', value: aggregate.sentimentBreakdown.negative, color: '#ef4444' },
  ];

  const totalResults = results?.length || 1;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Social Intelligence <Sparkles className="w-8 h-8 text-purple-400" />
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Analyse prédictive et recommandations IA pour votre business.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchIntelligence}>
          <RefreshCw className="w-4 h-4" /> Actualiser
        </Button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-white/10 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-purple-300 uppercase tracking-widest">Health Score</p>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black text-white">{aggregate.overallHealthScore}%</h2>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Optimal</Badge>
            </div>
            <Progress value={aggregate.overallHealthScore} className="h-2 mt-4 bg-white/5" />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Alertes Critiques</p>
            <div className="flex items-baseline gap-2">
              <h2 className={`text-5xl font-black ${aggregate.criticalAlerts > 0 ? 'text-red-500' : 'text-white'}`}>
                {aggregate.criticalAlerts}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Nécessitent une action immédiate</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5 backdrop-blur-sm md:col-span-2">
          <CardContent className="pt-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Sentiment Global</p>
              <div className="space-y-3">
                {sentimentData.map(s => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{s.name}</span>
                      <span>{Math.round((s.value / totalResults) * 100)}%</span>
                    </div>
                    <Progress value={(s.value / totalResults) * 100} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> Recommandations Stratégiques
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {globalRecommendations.map((rec: any, idx: number) => (
              <Card key={idx} className="group hover:bg-white/5 transition-all cursor-default border-white/5 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-3 rounded-2xl ${
                      rec.impact === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {rec.impact === 'high' ? <Zap className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={
                          rec.impact === 'high' ? 'border-red-500/50 text-red-400' : 'border-blue-500/50 text-blue-400'
                        }>
                          {rec.impact.toUpperCase()} IMPACT
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                          <Clock className="w-3 h-3" /> {rec.timeframe}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{rec.action}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">Catégorie: <span className="text-slate-200 capitalize">{rec.category}</span></p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Topics & Signals */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Sujets Chauds</h3>
          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {aggregate.topTopics.map((t: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <span className="font-semibold capitalize">{t.topic}</span>
                    </div>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                      {t.count} mentions
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Signals */}
          <h3 className="text-2xl font-bold mt-8">Signaux d'achat</h3>
          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                  <span className="text-sm">Intention d'achat</span>
                </div>
                <span className="font-bold">{Math.round((results?.filter((a:any) => a.analysis.purchase_signals.has_purchase_intent).length / totalResults) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">Sensibilité prix</span>
                </div>
                <span className="font-bold">{Math.round((results?.filter((a:any) => a.analysis.purchase_signals.price_sensitivity).length / totalResults) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm">Mention concurrence</span>
                </div>
                <span className="font-bold">{Math.round((results?.filter((a:any) => a.analysis.purchase_signals.competitor_mention).length / totalResults) * 100)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actionable Alerts Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-500" /> Alertes Stratégiques IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results?.flatMap((r: any) => r.alerts).slice(0, 4).map((alert: any, idx: number) => (
            <Card key={idx} className={`border-l-4 ${
              alert.level === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500'
            } bg-slate-900/40 backdrop-blur-sm`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    {alert.level === 'critical' ? '🚨' : '⚠️'} {alert.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] uppercase">{alert.type.replace(/_/g, ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{alert.message}</p>
                <div className="space-y-2">
                  {alert.recommendations.map((rec: any, ridx: number) => (
                    <div key={ridx} className="flex items-start gap-2 text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5" />
                      <span>{rec.action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
