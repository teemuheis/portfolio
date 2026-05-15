'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

type BlobBackgroundProps = {
  mood: string
}

const MOOD_PALETTES: Record<string, string[]> = {
  energetic: ['#ff3b3b', '#ff7a00', '#ff0055', '#ffd500'],
  chill:     ['#7c3aed', '#06b6d4', '#4f46e5', '#0ea5e9'],
  focus:     ['#059669', '#0d9488', '#34d399', '#14b8a6'],
  happy:     ['#f59e0b', '#f97316', '#fbbf24', '#fb923c'],
  melancholy:['#6d28d9', '#be185d', '#4f46e5', '#7c3aed'],
  party:     ['#ec4899', '#8b5cf6', '#f43f5e', '#a855f7'],
}

const ANIM_CONFIGS = [
  { x: [0, 60, -40, 20, 0],   y: [0, -50, 40, -20, 0],  scale: [1, 1.15, 0.95, 1.1, 1],    dur: 14, delay: 0   },
  { x: [0, -70, 30, -30, 0],  y: [0, 60, -50, 30, 0],   scale: [1, 1.1, 1.2, 0.95, 1],     dur: 16, delay: 1   },
  { x: [0, 80, -60, 40, 0],   y: [0, -60, 50, -30, 0],  scale: [0.9, 1.2, 1, 1.15, 0.9],   dur: 12, delay: 2   },
  { x: [0, -50, 70, -20, 0],  y: [0, 70, -40, 60, 0],   scale: [1.1, 0.9, 1.15, 1, 1.1],   dur: 18, delay: 0.5 },
  { x: [0, 40, -30, 50, 0],   y: [0, -40, 60, -20, 0],  scale: [1, 1.2, 0.85, 1.1, 1],     dur: 10, delay: 3   },
  { x: [0, -60, 30, -40, 0],  y: [0, 30, -50, 20, 0],   scale: [0.95, 1.15, 1, 1.2, 0.95], dur: 13, delay: 1.5 },
  { x: [0, 35, -25, 45, 0],   y: [0, -35, 55, -15, 0],  scale: [1.05, 0.9, 1.2, 1, 1.05],  dur: 9,  delay: 2.5 },
  { x: [0, -45, 20, -35, 0],  y: [0, 45, -30, 25, 0],   scale: [0.95, 1.1, 0.9, 1.15, 0.95],dur: 11, delay: 4  },
  { x: [0, 55, -35, 15, 0],   y: [0, -25, 45, -35, 0],  scale: [1.1, 0.95, 1.2, 0.9, 1.1], dur: 15, delay: 0.8 },
]

export function BlobBackground({ mood }: BlobBackgroundProps) {
  const colors = MOOD_PALETTES[mood] || MOOD_PALETTES.chill
  const [c1, c2, c3, c4] = colors
  const blobColors = [c1, c2, c3, c4, c1, c3, c2, c4, c3]

  const [blobPositions] = useState(() => {
    const r = (a: number, b: number) => Math.random() * (b - a) + a
    return [
      { style: { top: `${r(-30, -5)}%`,   left:   `${r(-30, -5)}%`  }, size: r(650, 820), blur: 42, opacity: 0.72 },
      { style: { bottom: `${r(-30, -5)}%`,right:  `${r(-30, -5)}%`  }, size: r(600, 760), blur: 42, opacity: 0.72 },
      { style: { top: `${r(20, 55)}%`,    left:   `${r(5, 40)}%`    }, size: r(450, 580), blur: 36, opacity: 0.58 },
      { style: { top: `${r(0, 30)}%`,     right:  `${r(5, 35)}%`    }, size: r(400, 520), blur: 36, opacity: 0.54 },
      { style: { bottom: `${r(10, 40)}%`, left:   `${r(0, 25)}%`    }, size: r(300, 400), blur: 28, opacity: 0.52 },
      { style: { bottom: `${r(0, 20)}%`,  right:  `${r(10, 40)}%`   }, size: r(280, 380), blur: 28, opacity: 0.52 },
      { style: { top: `${r(35, 65)}%`,    right:  `${r(15, 45)}%`   }, size: r(160, 270), blur: 22, opacity: 0.48 },
      { style: { top: `${r(50, 80)}%`,    left:   `${r(25, 55)}%`   }, size: r(140, 240), blur: 22, opacity: 0.48 },
      { style: { top: `${r(10, 45)}%`,    left:   `${r(30, 65)}%`   }, size: r(200, 300), blur: 26, opacity: 0.44 },
    ]
  })

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#080810]">
      {blobPositions.map((blob, i) => {
        const anim = ANIM_CONFIGS[i]
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: blobColors[i],
              width: blob.size,
              height: blob.size,
              filter: `blur(${blob.blur}px)`,
              opacity: blob.opacity,
              ...blob.style,
            }}
            animate={{ x: anim.x, y: anim.y, scale: anim.scale }}
            transition={{
              duration: anim.dur,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: anim.delay,
            }}
          />
        )
      })}
    </div>
  )
}
