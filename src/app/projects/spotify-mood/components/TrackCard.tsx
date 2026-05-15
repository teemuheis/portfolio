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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && track.preview_url) {
      audio.src = track.preview_url
      audio.play().catch(() => {
        console.log('Preview playback blocked')
        onPause()
      })
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
  }, [isPlaying, track, onPause])

  const imageUrl =
    track.album.images.find((img) => img.width >= 100)?.url ||
    track.album.images[0]?.url

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/80 transition-colors"
    >
      {/* Play/pause button */}
      <motion.button
        onClick={() => (isPlaying ? onPause() : onPlay())}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex-shrink-0"
        title={isPlaying ? 'Pause' : 'Play preview'}
        disabled={!track.preview_url}
      >
        {isPlaying ? (
          <svg
            className="w-8 h-8 text-gray-700"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg
            className={`w-8 h-8 ${track.preview_url ? 'text-gray-700' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </motion.button>

      {/* Album art */}
      {imageUrl && (
        <div className="relative flex-shrink-0">
          <img
            src={imageUrl}
            alt={track.album.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          {isPlaying && (
            <motion.div
              className={`absolute inset-0 rounded-lg border-2 ${accentColor}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ opacity: 0.3 }}
            />
          )}
        </div>
      )}

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 text-sm truncate">
          {track.name}
        </h3>
        <p className="text-gray-600 text-xs truncate">
          {track.artists.map((a) => a.name).join(', ')}
        </p>

        {/* Progress bar */}
        {track.preview_url && (
          <div className="mt-2 relative h-1 bg-gray-300 rounded-full overflow-hidden">
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
        className="flex-shrink-0 text-gray-500 hover:text-green-500 transition-colors"
        title="Open in Spotify"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.6 10.561 19.14 12.84c.361.22.479.659.301 1.1zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </a>

      <audio ref={audioRef} crossOrigin="anonymous" />
    </motion.div>
  )
}
