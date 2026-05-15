'use client'

import type { Track } from '@/lib/spotify'
import { AnimatePresence, motion } from 'framer-motion'

type AlbumArtworkProps = {
  track: Track | null
  mood: string
}

const MOOD_BLOOM: Record<string, string> = {
  energetic: '#ff3b3b',
  chill: '#7c3aed',
  focus: '#059669',
  happy: '#f59e0b',
  melancholy: '#6d28d9',
  party: '#ec4899',
}

export function AlbumArtwork({ track, mood }: AlbumArtworkProps) {
  const imageUrl =
    track?.album.images.find((img) => img.width >= 300)?.url ||
    track?.album.images[0]?.url ||
    null

  const bloomColor = MOOD_BLOOM[mood] || MOOD_BLOOM.chill

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key={track!.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative"
          >
            {/* Bloom glow behind artwork */}
            <motion.div
              className="absolute rounded-full -z-10"
              style={{
                background: bloomColor,
                width: 320,
                height: 320,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(60px)',
              }}
              animate={{ opacity: [0.5, 0.75, 0.5], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <img
              src={imageUrl}
              alt={track?.album.name}
              className="w-64 h-64 rounded-3xl shadow-2xl object-cover relative z-10"
              style={{ boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)` }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-64 h-64 rounded-3xl flex items-center justify-center relative"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-white/30 text-sm">No image</p>
          </motion.div>
        )}
      </AnimatePresence>

      {track && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-xs px-4"
        >
          <h2 className="text-2xl font-bold text-white line-clamp-2 leading-tight">
            {track.name}
          </h2>
          <p className="text-white/50 text-sm mt-1.5 line-clamp-1">
            {track.artists.map((a) => a.name).join(', ')}
          </p>
        </motion.div>
      )}
    </div>
  )
}
