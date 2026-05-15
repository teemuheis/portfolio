import type { Metadata } from 'next'
import { SpotifyMoodLoader } from './SpotifyMoodLoader'

export const metadata: Metadata = {
  title: 'Spotify Mood Randomizer',
  description: 'Discover songs based on your mood, vibe, and weather',
}

export default function SpotifyMoodPage() {
  return (
    <main>
      <SpotifyMoodLoader />
    </main>
  )
}
