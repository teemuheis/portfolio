'use client'

import { motion } from 'framer-motion'

export const MOOD_LABELS: Record<string, string> = {
  ignite:   'Ignite',
  drift:    'Drift',
  flow:     'Flow State',
  golden:   'Golden Hour',
  electric: 'Electric',
}

const MOOD_EMOJIS: Record<string, string> = {
  ignite:   '⚡',
  drift:    '🌊',
  flow:     '🎯',
  golden:   '☀️',
  electric: '🎉',
}

const MOOD_GRADIENTS: Record<string, [string, string]> = {
  ignite:   ['#ff3b3b', '#ff7a00'],
  drift:    ['#7c3aed', '#0ea5e9'],
  flow:     ['#059669', '#14b8a6'],
  golden:   ['#f59e0b', '#f97316'],
  electric: ['#ec4899', '#8b5cf6'],
}

const MOOD_GLOWS: Record<string, string> = {
  ignite:   '0 0 28px rgba(255,59,59,0.55)',
  drift:    '0 0 28px rgba(124,58,237,0.55)',
  flow:     '0 0 28px rgba(5,150,105,0.55)',
  golden:   '0 0 28px rgba(245,158,11,0.55)',
  electric: '0 0 28px rgba(236,72,153,0.55)',
}

type MoodButtonProps = {
  mood: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

export function MoodButton({ mood, isSelected, onClick, disabled }: MoodButtonProps) {
  const [from, to] = MOOD_GRADIENTS[mood] || MOOD_GRADIENTS.drift
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      style={
        isSelected
          ? {
              background: `linear-gradient(135deg, ${from}, ${to})`,
              boxShadow: MOOD_GLOWS[mood],
              border: '1px solid transparent',
              color: '#fff',
            }
          : {
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.60)',
            }
      }
      className="px-6 py-2.5 rounded-full font-medium text-sm transition-shadow disabled:opacity-40 cursor-pointer"
    >
      <span className="mr-2">{MOOD_EMOJIS[mood]}</span>
      {MOOD_LABELS[mood] ?? mood}
    </motion.button>
  )
}
