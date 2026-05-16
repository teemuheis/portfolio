'use client'

import type { Track } from '@/lib/spotify'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AlbumArtwork } from './components/AlbumArtwork'
import { BlobBackground } from './components/BlobBackground'
import { MoodButton } from './components/MoodSelector'
import { TrackCard } from './components/TrackCard'

type WeatherModifier = { energy: number; valence: number; description?: string }
type WeatherMood = { icon: string; label: string; tone: string }

const TOP_MOODS = ['ignite', 'drift', 'flow']
const BOTTOM_MOODS = ['golden', 'electric']
const RATE_LIMIT = 5
const BASE_VOLUME = 0.2
const SPOTIFY_BACKEND_URL = process.env.NEXT_PUBLIC_SPOTIFY_BACKEND_URL?.replace(/\/$/, '')

const MOOD_ACCENT: Record<string, string> = {
  ignite:   'bg-gradient-to-r from-red-500 to-orange-500',
  drift:    'bg-gradient-to-r from-violet-500 to-sky-400',
  flow:     'bg-gradient-to-r from-emerald-500 to-teal-400',
  golden:   'bg-gradient-to-r from-amber-400 to-orange-400',
  electric: 'bg-gradient-to-r from-pink-500 to-purple-500',
}

function weatherMood({ description }: WeatherModifier): WeatherMood {
  switch (description) {
    case 'Sunny':  return { icon: '☀', label: 'bright lift',  tone: '#fbbf24' }
    case 'Stormy': return { icon: '↯', label: 'charged air',  tone: '#fb923c' }
    case 'Rainy':  return { icon: '☔', label: 'rain weight',  tone: '#38bdf8' }
    case 'Snowy':  return { icon: '❄', label: 'soft cold',    tone: '#bae6fd' }
    case 'Foggy':  return { icon: '☁', label: 'misty veil',   tone: '#94a3b8' }
    case 'Cloudy': return { icon: '☁', label: 'soft shade',   tone: '#94a3b8' }
    default:       return { icon: '◐', label: 'neutral drift', tone: '#a7f3d0' }
  }
}

export function SpotifyMoodApp() {
  const [mood, setMood] = useState<string>('drift')
  const [general, setGeneral] = useState<Track[]>([])
  const [personal, setPersonal] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [weatherMod, setWeatherMod] = useState<WeatherModifier>({ energy: 0, valence: 0 })
  const [hasWeather, setHasWeather] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [muted, setMuted] = useState(false)
  const fetchCountRef = useRef(0)
  const isRateLimitedRef = useRef(false)

  const volume = muted ? 0 : BASE_VOLUME

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`)
        const data = (await res.json()) as WeatherModifier
        setWeatherMod(data)
        setHasWeather(true)
      } catch {}
    })
  }, [])

  const fetchTracks = useCallback(async () => {
    if (isRateLimitedRef.current) return
    setPlayingTrackId(null)
    setIsLoading(true)
    try {
      const searchParams = new URLSearchParams({
        mood,
        energy_mod: String(weatherMod.energy),
        valence_mod: String(weatherMod.valence),
      })
      const endpoint = SPOTIFY_BACKEND_URL
        ? `${SPOTIFY_BACKEND_URL}/api/mood/recommendations?${searchParams}`
        : `/api/spotify/recommendations?${searchParams}`
      const res = await fetch(endpoint)
      const data = (await res.json()) as { general?: Track[]; personal?: Track[]; error?: string }
      if (data.general) setGeneral(data.general)
      if (data.personal) setPersonal(data.personal)
    } catch (error) {
      console.error('Recommendations fetch error:', error)
    } finally {
      setIsLoading(false)
      fetchCountRef.current += 1
      if (fetchCountRef.current >= RATE_LIMIT) {
        isRateLimitedRef.current = true
        setIsRateLimited(true)
      }
    }
  }, [mood, weatherMod])

  useEffect(() => {
    fetchTracks()
  }, [mood, fetchTracks])

  const isDisabled = isLoading || isRateLimited
  const featuredTrack = general[0] ?? personal[0] ?? null
  const accentColor = MOOD_ACCENT[mood] || MOOD_ACCENT.drift

  const handleFeaturedToggle = useCallback(() => {
    if (!featuredTrack) return
    setPlayingTrackId(id => id === featuredTrack.id ? null : featuredTrack.id)
  }, [featuredTrack])

  return (
    <div className="min-h-screen relative">
      <BlobBackground mood={mood} weather={weatherMod} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
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

          {/* Weather signal + volume toggle */}
          <div className="relative flex justify-center mb-7">
            <WeatherSignal weather={weatherMod} hasWeather={hasWeather} />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <VolumeToggle isMuted={muted} onToggle={() => setMuted(m => !m)} />
            </div>
          </div>

          {/* Top mood row — 3 buttons */}
          <div className="flex justify-center gap-3 mb-6">
            {TOP_MOODS.map((m) => (
              <MoodButton
                key={m}
                mood={m}
                isSelected={mood === m}
                onClick={() => setMood(m)}
                disabled={isDisabled}
              />
            ))}
          </div>

          {/* Album artwork with play button */}
          <div className="mb-6">
            <AlbumArtwork
              track={featuredTrack}
              mood={mood}
              isPlaying={featuredTrack !== null && playingTrackId === featuredTrack.id}
              onToggle={handleFeaturedToggle}
            />
          </div>

          {/* Bottom mood row — 2 buttons + shuffle */}
          <div className="flex justify-center items-center gap-3 mb-8">
            {BOTTOM_MOODS.map((m) => (
              <MoodButton
                key={m}
                mood={m}
                isSelected={mood === m}
                onClick={() => setMood(m)}
                disabled={isDisabled}
              />
            ))}
            <motion.button
              onClick={fetchTracks}
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isDisabled}
              title="Shuffle tracks"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              className="transition-colors hover:!text-white disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
          </div>

          {isRateLimited && (
            <p
              className="text-center text-xs tracking-[0.2em] uppercase -mt-2 mb-6"
              style={{ color: 'rgba(255,255,255,0.22)' }}
            >
              That&apos;s your lot — refresh to explore more.
            </p>
          )}

          {isLoading && (
            <div className="text-center py-4 text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Finding tracks…
            </div>
          )}
        </div>

        {/* Track lists */}
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
                  {general.slice(0, 8).map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={playingTrackId === track.id}
                      onPlay={() => setPlayingTrackId(track.id)}
                      onPause={() => setPlayingTrackId(null)}
                      accentColor={accentColor}
                      volume={volume}
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
                      volume={volume}
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

function WeatherSignal({
  weather,
  hasWeather,
}: {
  weather: WeatherModifier
  hasWeather: boolean
}) {
  const signal = weatherMood(weather)
  const energy = Math.round(Math.abs(weather.energy) * 100)
  const valence = Math.round(Math.abs(weather.valence) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-fit items-center gap-4 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/55 shadow-2xl backdrop-blur-md"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-base"
        style={{
          background: `${signal.tone}22`,
          boxShadow: `0 0 26px ${signal.tone}55`,
          color: signal.tone,
        }}
      >
        {hasWeather ? signal.icon : '⌖'}
      </span>
      <span className="font-medium uppercase tracking-[0.18em]">
        {hasWeather ? signal.label : 'waiting for sky'}
      </span>
      <span className="hidden h-5 w-px bg-white/10 sm:block" />
      <span className="hidden tabular-nums text-white/35 sm:block">
        E {energy} · V {valence}
      </span>
    </motion.div>
  )
}

function VolumeToggle({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center gap-1.5 select-none"
      style={{ color: isMuted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)' }}
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ) : (
        <>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
          <div className="flex items-end gap-0.5 h-3.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.45)', minHeight: 2 }}
                animate={{ height: ['35%', '100%', '60%', '85%', '35%'] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </>
      )}
    </motion.button>
  )
}
