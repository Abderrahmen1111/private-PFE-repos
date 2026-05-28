import { DiscoverFeed } from '@/components/discover/discover-feed'
import { Suspense } from 'react'

export default function DiscoverPage() {
  return (
    <main className="bg-black text-white">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-black">
           <div className="w-12 h-12 border-4 border-t-red-500 border-red-500/20 rounded-full animate-spin" />
           <p className="text-white/40 font-bold animate-pulse">Chargement...</p>
        </div>
      }>
        <DiscoverFeed />
      </Suspense>
    </main>
  )
}
