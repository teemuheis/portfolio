'use client'

import type { Track } from '@/lib/spotify'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { AlbumArtwork } from './components/AlbumArtwork'
import { BlobBackground } from './components/BlobBackground'
import { MoodSelector } from './components/MoodSelector'
import { TrackCard } from './components/TrackCard'

type WeatherModifier = { energy: number; valence: number }

const MOODS = ['energetic', 'chill', 'focus', 'happy', 'melancholy', 'party']

const MOOD_ACCENT: Record<string, string> = {
  energetic: 'bg-gradient-to-r from-red-500 to-orange-500',
  chill:     'bg-gradient-to-r from-violet-500 to-sky-400',
  focus:     'bg-gradient-to-r from-emerald-500 to-teal-400',
  happy:     'bg-gradient-to-r from-amber-400 to-orange-400',
  melancholy:'bg-gradient-to-r from-violet-600 to-pink-500',
  party:     'bg-gradient-to-r from-pink-500 to-purple-500',
}

type SpotifyMoodAppProps = { authenticated: boolean }

export function SpotifyMoodApp({ authenticated }: SpotifyMoodAppProps) {
  const [mood, setMood] = useState<string>('chill')
  const [general, setGeneral] = useState<Track[]>([])
  const [personal, setPersonal] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [weatherMod, setWeatherMod] = useState<WeatherModifier>({ energy: 0, valence: 0 })

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`)
        const data = (await res.json()) as WeatherModifier
        setWeatherMod(data)
      } catch {}
    })
  }, [])

  const fetchTracks = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/spotify/recommendations?mood=${mood}&energy_mod=${weatherMod.energy}&valence_mod=${weatherMod.valence}`
      )
      const data = (await res.json()) as {
        general?: Track[]
        personal?: Track[]
        error?: string
      }
      if (data.general) setGeneral(data.general)
      if (data.personal) setPersonal(data.personal)
    } catch (error) {
      console.error('Recommendations fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [mood, weatherMod])

  useEffect(() => {
    fetchTracks()
  }, [mood, fetchTracks])

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#080810]">
        <BlobBackground mood="chill" />
        <div className="relative z-10 text-center max-w-md">
          <motion.h1
            className="text-6xl font-black text-white tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Mood<br />
            <span className="text-white/30">Randomizer</span>
          </motion.h1>
          <p className="text-white/40 mb-10 text-sm tracking-widest uppercase">
            pick a vibe · let the weather decide
          </p>
          <motion.a
            href="/api/spotify/auth"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block px-8 py-3.5 rounded-full text-white font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
              boxShadow: '0 0 30px rgba(124,58,237,0.4)',
            }}
          >
            Connect Spotify
          </motion.a>
        </div>
      </div>
    )
  }

  const featuredTrack = general[0] ?? personal[0] ?? null
  const accentColor = MOOD_ACCENT[mood] || MOOD_ACCENT.chill

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#080810]">
      <BlobBackground mood={mood} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Header + controls — centered narrow column */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <motion.h1
              className="text-6xl md:text-7xl font-black text-white tracking-tight leading-none mb-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Mood<br />
              <span className="text-white/25">Randomizer</span>
            </motion.h1>
            <motion.p
              className="text-white/35 text-xs tracking-[0.25em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              pick a vibe · let the weather decide
            </motion.p>
          </div>

          <MoodSelector
            moods={MOODS}
            selectedMood={mood}
            onMoodChange={setMood}
            onRandomize={fetchTracks}
            isLoading={isLoading}
          />

          <div className="mb-12">
            <AlbumArtwork track={featuredTrack} mood={mood} />
          </div>

          {isLoading && (
            <div className="text-center py-4 text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Finding tracks…
            </div>
          )}
        </div>

        {/* Track lists — side by side on wide screens */}
        {(general.length > 0 || personal.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            {general.length > 0 && (
              <section>
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 px-1 flex items-center gap-3"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  For this vibe
                  <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </h2>
                <div className="space-y-2">
                  {general.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={playingTrackId === track.id}
                      onPlay={() => setPlayingTrackId(track.id)}
                      onPause={() => setPlayingTrackId(null)}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              </section>
            )}

            {personal.length > 0 && (
              <section>
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 px-1 flex items-center gap-3"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  Teemu recommends
                  <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </h2>
                <div className="space-y-2">
                  {personal.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={playingTrackId === track.id}
                      onPlay={() => setPlayingTrackId(track.id)}
                      onPause={() => setPlayingTrackId(null)}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
