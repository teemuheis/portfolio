'use client'

import type { Track } from '@/lib/spotify'
import { useCallback, useEffect, useState } from 'react'
import { AlbumArtwork } from './components/AlbumArtwork'
import { BlobBackground } from './components/BlobBackground'
import { MoodSelector } from './components/MoodSelector'
import { TrackCard } from './components/TrackCard'

type WeatherModifier = {
  energy: number
  valence: number
}

const MOODS = ['energetic', 'chill', 'focus', 'happy', 'melancholy', 'party']

const MOOD_ACCENT: Record<string, string> = {
  energetic: 'bg-gradient-to-r from-orange-400 to-red-400',
  chill: 'bg-gradient-to-r from-blue-400 to-indigo-400',
  focus: 'bg-gradient-to-r from-green-400 to-teal-400',
  happy: 'bg-gradient-to-r from-yellow-400 to-amber-400',
  melancholy: 'bg-gradient-to-r from-rose-400 to-purple-400',
  party: 'bg-gradient-to-r from-pink-400 to-purple-400',
}

type SpotifyMoodAppProps = {
  authenticated: boolean
}

export function SpotifyMoodApp({ authenticated }: SpotifyMoodAppProps) {
  const [mood, setMood] = useState<string>('chill')
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [weatherMod, setWeatherMod] = useState<WeatherModifier>({
    energy: 0,
    valence: 0,
  })

  // Get geolocation and weather
  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(
            `/api/weather?lat=${latitude}&lon=${longitude}`
          )
          const data = (await res.json()) as WeatherModifier
          setWeatherMod(data)
        } catch (error) {
          console.error('Weather fetch error:', error)
        }
      },
      () => {
        console.log('Geolocation denied')
      }
    )
  }, [])

  // Fetch recommendations
  const fetchTracks = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/spotify/recommendations?mood=${mood}&energy_mod=${weatherMod.energy}&valence_mod=${weatherMod.valence}`
      )
      const data = (await res.json()) as {
        tracks: Track[]
        mood: string
      }
      setTracks(data.tracks)
      setCurrentTrackIndex(0)
    } catch (error) {
      console.error('Recommendations fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [mood, weatherMod])

  // Fetch on mood change
  useEffect(() => {
    fetchTracks()
  }, [mood, fetchTracks])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Spotify Mood Randomizer
          </h1>
          <p className="text-gray-600 mb-8">
            Discover songs based on your mood, vibe, and weather
          </p>
          <a
            href="/api/spotify/auth"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Connect Spotify
          </a>
        </div>
      </div>
    )
  }

  const currentTrack = tracks[currentTrackIndex] || null

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BlobBackground mood={mood} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mood Randomizer
          </h1>
          <p className="text-gray-600">Pick a vibe, discover your next favorite</p>
        </div>

        {/* Mood selector */}
        <MoodSelector
          moods={MOODS}
          selectedMood={mood}
          onMoodChange={setMood}
          onRandomize={fetchTracks}
          isLoading={isLoading}
        />

        {/* Album artwork */}
        <div className="mb-24">
          <AlbumArtwork track={currentTrack} mood={mood} />
        </div>

        {/* Track list */}
        {tracks.length > 0 && (
          <div className="space-y-3 max-w-2xl mx-auto mb-12">
            {tracks.slice(0, 5).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={playingTrackId === track.id}
                onPlay={() => setPlayingTrackId(track.id)}
                onPause={() => setPlayingTrackId(null)}
                accentColor={MOOD_ACCENT[mood] || MOOD_ACCENT.chill}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
              <span>Loading tracks...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
