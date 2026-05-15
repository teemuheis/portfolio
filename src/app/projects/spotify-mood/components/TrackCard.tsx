'use client'

import type { Track } from '@/lib/spotify'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type TrackCardProps = {
  track: Track
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  accentColor: string
}

// Module-level cache — survives re-renders, clears on page reload
const itunesCache = new Map<string, string | null>()

async function fetchItunesPreview(track: Track): Promise<string | null> {
  if (itunesCache.has(track.id)) return itunesCache.get(track.id)!

  const artist = track.artists[0]?.name ?? ''
  const term = encodeURIComponent(`${artist} ${track.name}`)
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=5&media=music`
    )
    const data = await res.json() as { results?: Array<{ previewUrl?: string; trackName?: string }> }
    const needle = track.name.toLowerCase().slice(0, 12)
    const match = data.results?.find(
      (r) => r.previewUrl && r.trackName?.toLowerCase().includes(needle)
    )
    const url = match?.previewUrl ?? null
    itunesCache.set(track.id, url)
    return url
  } catch {
    itunesCache.set(track.id, null)
    return null
  }
}

export function TrackCard({
  track,
  isPlaying,
  onPlay,
  onPause,
  accentColor,
}: TrackCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [resolvedPreviewUrl, setResolvedPreviewUrl] = useState<string | null>(track.preview_url)
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)

  // Reset when the track prop changes
  useEffect(() => {
    setResolvedPreviewUrl(track.preview_url)
    setDuration(0)
    setCurrentTime(0)
  }, [track.id, track.preview_url])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && resolvedPreviewUrl) {
      audio.src = resolvedPreviewUrl
      audio.play().catch(() => onPause())
    } else {
      audio.pause()
    }

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => onPause()

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isPlaying, resolvedPreviewUrl, onPause])

  const handleToggle = async () => {
    if (isPlaying) {
      onPause()
      return
    }

    let url = resolvedPreviewUrl
    if (!url) {
      setIsFetchingPreview(true)
      url = await fetchItunesPreview(track)
      setResolvedPreviewUrl(url)
      setIsFetchingPreview(false)
    }

    if (url) onPlay()
  }

  const imageUrl =
    track.album.images.find((img) => img.width >= 100)?.url ||
    track.album.images[0]?.url

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      onClick={handleToggle}
      style={{
        background: isPlaying ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
        border: isPlaying ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
      }}
      className="rounded-2xl p-4 flex items-center gap-4 transition-all select-none"
    >
      {/* Play/pause/loading indicator */}
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="flex-shrink-0"
        style={{ color: 'rgba(255,255,255,0.9)' }}
      >
        {isFetchingPreview ? (
          <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </motion.div>

      {/* Album art */}
      {imageUrl && (
        <div className="relative flex-shrink-0">
          <img
            src={imageUrl}
            alt={track.album.name}
            className="w-11 h-11 rounded-lg object-cover"
          />
          {isPlaying && (
            <div
              className="absolute -inset-0.5 rounded-lg pointer-events-none"
              style={{ boxShadow: '0 0 0 1.5px rgba(255,255,255,0.4)' }}
            />
          )}
        </div>
      )}

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white text-sm truncate">{track.name}</h3>
          {isPlaying && (
            <div className="flex-shrink-0 flex items-end gap-0.5 h-3.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full bg-white/70"
                  animate={{ height: ['40%', '100%', '60%', '90%', '40%'] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                  style={{ minHeight: 2 }}
                />
              ))}
            </div>
          )}
        </div>
        <p className="text-white/45 text-xs truncate mt-0.5">
          {track.artists.map((a) => a.name).join(', ')}
        </p>
        {resolvedPreviewUrl && (
          <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className={`h-full ${accentColor}`}
              style={{ width: `${progressPercent}%` }}
              transition={{ type: 'tween', duration: 0.1 }}
            />
          </div>
        )}
      </div>

      {/* Spotify link */}
      <a
        href={track.external_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0 transition-colors"
        style={{ color: 'rgba(255,255,255,0.25)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#1db954')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
        title="Open in Spotify"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.6 10.561 19.14 12.84c.361.22.479.659.301 1.1zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </a>

      <audio ref={audioRef} crossOrigin="anonymous" />
    </motion.div>
  )
}
