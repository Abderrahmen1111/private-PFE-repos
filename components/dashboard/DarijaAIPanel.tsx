'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
// ─── Web Speech API type shims (not in default TS lib) ────────────────────────
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: any, ev: Event) => any) | null;
  onresult: ((this: any, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: any, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: any, ev: Event) => any) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Sparkles, Loader2, Zap, Tag, Image as ImageIcon,
  CheckCircle2, AlertCircle, Package, ChevronRight, X, Mic, MicOff, Square
} from 'lucide-react'
import { translateDarijaForSearch, extractDarijaWords } from '@/lib/darija-dictionary'

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
type ActiveTab = 'text' | 'voice'
type VoiceState = 'idle' | 'recording' | 'processing'

interface DarijaAIPanelProps {
  open: boolean
  onClose: () => void
  storeId: number
  onApplyProduct?: (data: Omit<ParsedProduct, 'intent' | 'image_prompt'>) => void
  onApplyPromotion?: (data: Omit<ParsedPromotion, 'intent' | 'image_prompt'>) => void
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('text')
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ParsedResult>(null)
  const [error, setError] = useState<string | null>(null)

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [enrichedTranscript, setEnrichedTranscript] = useState('')
  const [darijaMatches, setDarijaMatches] = useState<Array<{ original: string; french: string; category: string }>>([])
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const reset = useCallback(() => {
    setPrompt('')
    setTranscript('')
    setEnrichedTranscript('')
    setDarijaMatches([])
    setResult(null)
    setError(null)
    setVoiceState('idle')
    recognitionRef.current?.stop()
  }, [])

  const handleClose = () => {
    reset()
    onClose()
  }

  // ── Voice Recording ─────────────────────────────────────────────────────

  const startRecording = useCallback(() => {
    const SR = typeof window !== 'undefined'
      ? (window.SpeechRecognition || (window as any).webkitSpeechRecognition)
      : null

    if (!SR) {
      setError('Ton navigateur ne supporte pas la reconnaissance vocale. Utilise Chrome.')
      return
    }

    const recognition = new SR()
    recognition.lang = 'ar-TN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => setVoiceState('recording')

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = ''
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript + ' '
      }
      setTranscript(full.trim())
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted') {
        setError(`Erreur microphone: ${event.error}`)
      }
      setVoiceState('idle')
    }

    recognition.onend = () => {
      if (voiceState === 'recording') {
        setVoiceState('idle')
      }
    }

    setTranscript('')
    setEnrichedTranscript('')
    setDarijaMatches([])
    setResult(null)
    setError(null)
    recognition.start()
  }, [voiceState])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setVoiceState('idle')
  }, [])

  // ── Enrich transcript with Darija dictionary ────────────────────────────

  const enrichTranscript = useCallback((raw: string) => {
    const translated = translateDarijaForSearch(raw)
    const matches = extractDarijaWords(raw)
    setEnrichedTranscript(translated)
    setDarijaMatches(matches)
    return translated
  }, [])

  // ── Send to AI API ──────────────────────────────────────────────────────

  const handleGenerate = async (inputText?: string) => {
    const text = inputText || prompt
    if (!text.trim()) {
      toast.error("Écris ou dicte ton prompt d'abord !")
      return
    }
    setIsProcessing(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/ai-darija', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, storeId, generateImage: true }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors du traitement.')
        return
      }
      if (data.intent === 'unknown') {
        const isQuota = data.raw?.includes('429') || data.message?.includes('429') || data.raw === 'QUOTA_EXCEEDED_429'
        setError(isQuota ? "⚠️ Quota IA dépassé (429). Patientez 1 minute ou utilisez une clé API personnelle." : (data.message || "Impossible de comprendre. Réessaie avec plus de détails."))
        return
      }
      setResult(data as ParsedResult)
      toast.success('Données extraites avec succès !')
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setIsProcessing(false)
      setVoiceState('idle')
    }
  }

  const handleVoiceGenerate = () => {
    if (!transcript.trim()) {
      toast.error('Enregistre un message vocal d\'abord !')
      return
    }
    const enriched = enrichTranscript(transcript)
    // Send the enriched (Darija→French) version to the AI
    handleGenerate(enriched)
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
              Décris ton produit en Darija — par texte ou par voix ✨
            </p>
          </DialogHeader>

          {/* ── Tab Switcher ── */}
          <div className="relative mt-4 flex p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'text' ? 'bg-violet-500/20 text-violet-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sparkles className="w-4 h-4" /> Texte
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'voice' ? 'bg-violet-500/20 text-violet-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Mic className="w-4 h-4" /> Voix Darija
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* ═══ TEXT TAB ═══ */}
          {activeTab === 'text' && (
            <>
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
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-violet-900/40"
                onClick={() => handleGenerate()}
                disabled={isProcessing || !prompt.trim()}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyse en cours...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Générer avec l&apos;IA</>
                )}
              </Button>
            </>
          )}

          {/* ═══ VOICE TAB ═══ */}
          {activeTab === 'voice' && (
            <>
              {/* Mic Button */}
              <div className="flex flex-col items-center gap-5">
                <div className="relative flex items-center justify-center">
                  {voiceState === 'recording' && (
                    <>
                      <div className="absolute w-[100px] h-[100px] rounded-full border border-red-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                      <div className="absolute w-[120px] h-[120px] rounded-full border border-red-500/15 animate-ping" style={{ animationDuration: '2s' }} />
                    </>
                  )}
                  <button
                    onClick={voiceState === 'recording' ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                      voiceState === 'recording'
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40'
                        : 'bg-violet-500 hover:bg-violet-600 shadow-violet-500/40'
                    } ${isProcessing ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    {voiceState === 'recording' ? (
                      <Square className="w-6 h-6 text-white fill-white" />
                    ) : (
                      <Mic className="w-7 h-7 text-white" />
                    )}
                  </button>
                </div>

                {/* Wave visualizer */}
                {voiceState === 'recording' && (
                  <div className="flex items-center gap-1 h-8">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-red-400 rounded-full animate-pulse"
                        style={{
                          height: `${6 + Math.random() * 22}px`,
                          animationDelay: `${i * 0.07}s`,
                          animationDuration: '0.8s',
                        }}
                      />
                    ))}
                  </div>
                )}

                <p className="text-sm text-center text-slate-400">
                  {voiceState === 'idle' && 'Appuie sur le micro et parle en Darija, français ou arabe'}
                  {voiceState === 'recording' && <span className="text-red-400">🔴 Enregistrement... appuie pour arrêter</span>}
                </p>
              </div>

              {/* Transcript */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ce que tu as dit
                </label>
                <Textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="عندي كسكسي بالمرق، كل يوم طازج..."
                  className="bg-slate-900/60 border-violet-500/20 focus:border-violet-500/60 text-white placeholder:text-slate-600 min-h-[70px] resize-none"
                  dir="auto"
                />
              </div>

              {/* Darija matches preview */}
              {darijaMatches.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Mots Darija détectés
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {darijaMatches.map((m, i) => (
                      <span key={i} className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                        {m.original} → {m.french}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enriched preview */}
              {enrichedTranscript && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    Texte enrichi envoyé à l&apos;IA
                  </label>
                  <p className="text-sm text-slate-300 bg-violet-500/5 border border-violet-500/10 rounded-lg p-3">
                    {enrichedTranscript}
                  </p>
                </div>
              )}

              {/* Generate from voice */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-400 hover:text-white"
                  onClick={() => { setTranscript(''); setEnrichedTranscript(''); setDarijaMatches([]); setResult(null); }}
                >
                  Effacer
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-violet-900/40"
                  onClick={handleVoiceGenerate}
                  disabled={isProcessing || !transcript.trim()}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Générer →</>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* ── Shared: Loading State ── */}
          {isProcessing && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                <span>Analyse du texte Darija...</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span>Extraction des caractéristiques...</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white font-medium">
                <Sparkles className="w-3 h-3 animate-pulse text-yellow-400" />
                <span>Génération de l&apos;image par l&apos;IA (attente ~15s)...</span>
              </div>
            </div>
          )}

          {/* ── Shared: Error State ── */}
          {error && !isProcessing && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* ── Shared: Result Card ── */}
          {result && !isProcessing && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/10 bg-emerald-500/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">
                  {result.intent === 'create_product' ? '🛍 Produit détecté' : '🏷 Promotion détectée'}
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Image générée
                  </span>
                  {result.image_url ? (
                    <img src={result.image_url} alt="AI Generated" className="w-full aspect-square object-cover rounded-lg border border-white/10" />
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
