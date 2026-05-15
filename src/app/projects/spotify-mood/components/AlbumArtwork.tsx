'use client'

import type { Track } from '@/lib/spotify'
import { AnimatePresence, motion } from 'framer-motion'

type AlbumArtworkProps = {
  track: Track | null
  mood: string
}

const MOOD_COLORS: Record<string, string> = {
  energetic: 'from-orange-300 to-red-300',
  chill: 'from-blue-300 to-indigo-300',
  focus: 'from-green-300 to-teal-300',
  happy: 'from-yellow-300 to-amber-300',
  melancholy: 'from-rose-300 to-purple-300',
  party: 'from-pink-300 to-purple-300',
}

export function AlbumArtwork({ track, mood }: AlbumArtworkProps) {
  const imageUrl =
    track?.album.images.find((img) => img.width >= 300)?.url ||
    track?.album.images[0]?.url ||
    null

  const accentColor = MOOD_COLORS[mood] || MOOD_COLORS.chill

  return (
    <div className="relative flex items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key={track!.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <img
              src={imageUrl}
              alt={track?.album.name}
              className="w-64 h-64 rounded-3xl shadow-2xl object-cover"
            />

            {/* Subtle pulse ring when playing */}
            <motion.div
              className={`absolute inset-0 rounded-3xl border-2 bg-gradient-to-r ${accentColor}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ opacity: 0.2 }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${accentColor} opacity-40 shadow-2xl flex items-center justify-center`}
          >
            <p className="text-gray-400 text-sm">No image</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track info below */}
      {track && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-0 translate-y-28 text-center max-w-xs px-4"
        >
          <h2 className="text-2xl font-bold text-gray-800 line-clamp-2">
            {track.name}
          </h2>
          <p className="text-gray-600 text-sm mt-1 line-clamp-1">
            {track.artists.map((a) => a.name).join(', ')}
          </p>
        </motion.div>
      )}
    </div>
  )
}
