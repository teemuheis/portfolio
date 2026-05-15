import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { SpotifyMoodLoader } from './SpotifyMoodLoader'

export const metadata: Metadata = {
  title: 'Spotify Mood Randomizer',
  description: 'Discover songs based on your mood, vibe, and weather',
}

export default async function SpotifyMoodPage() {
  const cookieStore = await cookies()
  const authenticated =
    !!cookieStore.get('spotify_access_token')?.value ||
    !!cookieStore.get('spotify_refresh_token')?.value ||
    !!process.env.SPOTIFY_REFRESH_TOKEN ||
    !!process.env.NEXT_PUBLIC_SPOTIFY_BACKEND_URL

  return (
    <main>
      <SpotifyMoodLoader authenticated={authenticated} />
    </main>
  )
}
