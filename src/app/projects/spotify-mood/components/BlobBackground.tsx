'use client'

import { motion } from 'framer-motion'
import type React from 'react'

type BlobBackgroundProps = {
  mood: string
}

const BLOB_PALETTES: Record<string, { blobs: string[]; figures: string }> = {
  energetic: {
    blobs: ['#ff6b6b', '#ffa500'],
    figures:
      '<circle cx="20%" cy="30%" r="8" fill="#ff8c42" opacity="0.08"/><circle cx="70%" cy="60%" r="6" fill="#ff6b6b" opacity="0.08"/>',
  },
  chill: {
    blobs: ['#a78bfa', '#87ceeb'],
    figures:
      '<path d="M 30% 40% Q 40% 35% 45% 45 Q 40% 50% 30% 40%" stroke="#87ceeb" stroke-width="1" fill="none" opacity="0.08"/>',
  },
  focus: {
    blobs: ['#6ee7b7', '#cbd5e1'],
    figures:
      '<polygon points="25%,30% 35%,25% 40%,35% 30%,40%" fill="#6ee7b7" opacity="0.08"/>',
  },
  happy: {
    blobs: ['#fcd34d', '#fdba74'],
    figures:
      '<circle cx="20%" cy="25%" r="5" fill="#fcd34d" opacity="0.08"/><circle cx="65%" cy="70%" r="7" fill="#fdba74" opacity="0.08"/><circle cx="45%" cy="50%" r="4" fill="#fcd34d" opacity="0.08"/>',
  },
  melancholy: {
    blobs: ['#d8b4fe', '#5b21b6'],
    figures:
      '<line x1="15%" y1="20%" x2="25%" y2="30%" stroke="#d8b4fe" stroke-width="1" opacity="0.08"/><line x1="70%" y1="60%" x2="80%" y2="70%" stroke="#d8b4fe" stroke-width="1" opacity="0.08"/>',
  },
  party: {
    blobs: ['#e879f9', '#ec4899'],
    figures:
      '<polygon points="30%,25% 38%,20% 40%,30% 32%,35%" fill="#e879f9" opacity="0.08"/>',
  },
}

export function BlobBackground({ mood }: BlobBackgroundProps) {
  const palette = BLOB_PALETTES[mood] || BLOB_PALETTES.chill
  const [blob1Color, blob2Color] = palette.blobs

  const blobVariants = {
    animate: {
      x: [0, 50, -30, 30, 0],
      y: [0, -40, 30, -20, 0],
      scale: [0.95, 1.05, 1, 1.1, 0.95],
    },
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f8f7f5]">
      {/* Blob 1 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-[80px]"
        style={{ background: blob1Color, opacity: 0.15, top: '10%', left: '5%' }}
        variants={blobVariants}
        animate="animate"
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror' }}
      />

      {/* Blob 2 */}
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-[80px]"
        style={{ background: blob2Color, opacity: 0.12, top: '60%', right: '10%' }}
        variants={blobVariants}
        animate="animate"
        transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      {/* Blob 3 */}
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-[80px]"
        style={{ background: blob1Color, opacity: 0.1, bottom: '10%', left: '30%' }}
        variants={blobVariants}
        animate="animate"
        transition={{ duration: 24, repeat: Infinity, repeatType: 'mirror', delay: 2 }}
      />

      {/* Blob 4 */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-[80px]"
        style={{ background: blob2Color, opacity: 0.08, top: '40%', right: '20%' }}
        variants={blobVariants}
        animate="animate"
        transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', delay: 3 }}
      />

      {/* Mood figures (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        dangerouslySetInnerHTML={{ __html: palette.figures }}
      />
    </div>
  )
}
