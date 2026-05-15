'use client'

import dynamic from 'next/dynamic'

const SpotifyMoodApp = dynamic(() => import('./SpotifyMoodApp').then(m => ({ default: m.SpotifyMoodApp })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="text-white/30 text-sm">Loading…</div>
    </div>
  ),
})

export function SpotifyMoodLoader() {
  return <SpotifyMoodApp />
}
