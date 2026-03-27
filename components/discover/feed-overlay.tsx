type FeedOverlayProps = {
  merchant: string
  product: string
  description: string
  price: string
  merchantId: string
  isSaved?: boolean
  onToggleSave?: () => void
}

export function FeedOverlay({
  merchant,
  product,
  description,
  price,
  merchantId,
  isSaved = false,
  onToggleSave,
}: FeedOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
      <div className="pointer-events-auto w-full max-w-[72%] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-500">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
          {merchant}
        </p>
        <h2 className="mt-1 text-2xl font-bold leading-tight text-white">{product}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/85">{description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-white">{price}</span>
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={isSaved ? 'Saved' : 'Save'}
            className="rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
