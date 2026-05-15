'use client'

import dynamic from 'next/dynamic'

type SpotifyMoodLoaderProps = {
  authenticated: boolean
  userAuthenticated: boolean
}

const SpotifyMoodApp = dynamic(() => import('./SpotifyMoodApp').then(m => ({ default: m.SpotifyMoodApp })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  ),
})

export function SpotifyMoodLoader({ authenticated, userAuthenticated }: SpotifyMoodLoaderProps) {
  return <SpotifyMoodApp authenticated={authenticated} userAuthenticated={userAuthenticated} />
}
