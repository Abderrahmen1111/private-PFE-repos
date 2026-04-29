'use client'

import React, { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Sparkles, Loader2, Zap, Tag, Image as ImageIcon,
  CheckCircle2, AlertCircle, Package, ChevronRight, X
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedProduct {
  intent: 'create_product'
  name: string
  description: string
  price?: number
  category?: string
  image_url?: string | null
  image_prompt: string
}

interface ParsedPromotion {
  intent: 'create_promotion'
  title: string
  description: string
  discount_percent?: number
  discount_text?: string
  image_url?: string | null
  image_prompt: string
}

type ParsedResult = ParsedProduct | ParsedPromotion | null

interface DarijaAIPanelProps {
  open: boolean
  onClose: () => void
  storeId: number
  onApplyProduct?: (data: Omit<ParsedProduct, 'intent' | 'image_prompt'>) => void
  onApplyPromotion?: (data: Omit<ParsedPromotion, 'intent' | 'image_prompt'>) => void
  /** Restrict to one intent type, or allow both */
  mode?: 'product' | 'promotion' | 'auto'
}

// ─── Example prompts ──────────────────────────────────────────────────────────

const EXAMPLES = {
  product: [
    'zid produit jdid: kasket noire b 25 DT',
    'n7eb nzid sabat nike blanc taille 42 b 180 dt',
    '3mel item jdid: t-shirt rayé b 35 dinars',
  ],
  promotion: [
    'dir promo 20% 3la kol les produits soldes',
    'n7eb n3mel offre: chri zouz 7ob wa7ed b half prix',
    'promo ramadan: 30% takhfidh 3la kol haja',
  ],
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DarijaAIPanel({
  open,
  onClose,
  storeId,
  onApplyProduct,
  onApplyPromotion,
  mode = 'auto',
}: DarijaAIPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ParsedResult>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setPrompt('')
    setResult(null)
    setError(null)
  }, [])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Écris ton prompt en Darija d\'abord !')
      return
    }
    setIsProcessing(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/ai-darija', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, storeId, generateImage: true }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors du traitement.')
        return
      }

      if (data.intent === 'unknown') {
        setError(data.message || "Impossible de comprendre le prompt. Réessaie avec plus de détails.")
        return
      }

      setResult(data as ParsedResult)
      toast.success('Données extraites avec succès !')
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApply = () => {
    if (!result) return

    if (result.intent === 'create_product' && onApplyProduct) {
      const { intent: _i, image_prompt: _p, ...data } = result
      onApplyProduct(data)
      toast.success('Formulaire produit pré-rempli !')
      handleClose()
    } else if (result.intent === 'create_promotion' && onApplyPromotion) {
      const { intent: _i, image_prompt: _p, ...data } = result
      onApplyPromotion(data)
      toast.success('Formulaire promotion pré-rempli !')
      handleClose()
    } else {
      toast.error("Aucune action disponible pour ce type de résultat.")
    }
  }

  const exampleList = mode === 'product'
    ? EXAMPLES.product
    : mode === 'promotion'
      ? EXAMPLES.promotion
      : [...EXAMPLES.product.slice(0, 1), ...EXAMPLES.promotion.slice(0, 1)]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-[#0d0f1a] border border-violet-500/20 text-white p-0 overflow-hidden shadow-2xl shadow-violet-900/30">

        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent p-6 border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.15),transparent_70%)]" />
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <span className="bg-gradient-to-r from-violet-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Assistant IA — Darija
              </span>
            </DialogTitle>
            <p className="text-sm text-slate-400 mt-1">
              Décris ton produit ou ta promotion en Darija tunisien, l'IA fait le reste ✨
            </p>
          </DialogHeader>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Prompt Input */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ton prompt en Darija
            </label>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Exemple: zid produit jdid kasket noire b 25 DT..."
              className="bg-slate-900/60 border-violet-500/20 focus:border-violet-500/60 text-white placeholder:text-slate-600 min-h-[90px] resize-none transition-all"
              disabled={isProcessing}
            />
            {/* Examples */}
            <div className="flex flex-wrap gap-2">
              {exampleList.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="text-[11px] text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2.5 py-1 rounded-full transition-all"
                >
                  {ex.slice(0, 40)}{ex.length > 40 ? '…' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-violet-900/40 transition-all"
            onClick={handleGenerate}
            disabled={isProcessing || !prompt.trim()}
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyse en cours...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Générer avec l'IA</>
            )}
          </Button>

          {/* Loading State */}
          {isProcessing && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-2">
              {['Lecture du prompt Darija…', 'Extraction des données…', 'Génération de l\'image…'].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isProcessing && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* ── Result Card ── */}
          {result && !isProcessing && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
              {/* Result Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/10 bg-emerald-500/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">
                  {result.intent === 'create_product' ? '🛍 Produit détecté' : '🏷 Promotion détectée'}
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Text Data */}
                <div className="space-y-3">
                  {result.intent === 'create_product' ? (
                    <>
                      <Field icon={<Package className="w-4 h-4 text-violet-400" />} label="Nom" value={result.name} />
                      {result.price && <Field icon={<Tag className="w-4 h-4 text-emerald-400" />} label="Prix" value={`${result.price} DT`} />}
                      {result.category && <Field icon={<Zap className="w-4 h-4 text-yellow-400" />} label="Catégorie" value={result.category} />}
                      {result.description && <Field icon={<ChevronRight className="w-4 h-4 text-slate-400" />} label="Description" value={result.description} />}
                    </>
                  ) : (
                    <>
                      <Field icon={<Zap className="w-4 h-4 text-pink-400" />} label="Titre" value={result.title} />
                      {result.discount_percent && <Field icon={<Tag className="w-4 h-4 text-emerald-400" />} label="Réduction" value={`${result.discount_percent}%`} />}
                      {result.discount_text && <Field icon={<Tag className="w-4 h-4 text-orange-400" />} label="Offre" value={result.discount_text} />}
                      {result.description && <Field icon={<ChevronRight className="w-4 h-4 text-slate-400" />} label="Description" value={result.description} />}
                    </>
                  )}
                </div>

                {/* Image Preview */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Image générée
                  </span>
                  {result.image_url ? (
                    <img
                      src={result.image_url}
                      alt="AI Generated"
                      className="w-full aspect-square object-cover rounded-lg border border-white/10"
                    />
                  ) : (
                    <div className="aspect-square rounded-lg border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-600 text-xs text-center p-4 gap-2">
                      <ImageIcon className="w-8 h-8 opacity-30" />
                      <span>Image non disponible<br />(quota ou délai technique)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-white/5 bg-slate-950/80 flex gap-3">
          <Button
            variant="ghost"
            className="flex-1 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-1.5" /> Fermer
          </Button>

          {result && (
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-900/30"
              onClick={handleApply}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Appliquer au formulaire
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  )
}
