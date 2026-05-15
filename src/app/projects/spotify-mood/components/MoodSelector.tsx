'use client'

import { motion } from 'framer-motion'

type MoodSelectorProps = {
  moods: string[]
  selectedMood: string
  onMoodChange: (mood: string) => void
  onRandomize: () => void
  isLoading?: boolean
}

const MOOD_EMOJIS: Record<string, string> = {
  energetic: '⚡',
  chill: '❄️',
  focus: '🎯',
  happy: '😊',
  melancholy: '🌙',
  party: '🎉',
}

const MOOD_GRADIENTS: Record<string, [string, string]> = {
  energetic: ['#ff3b3b', '#ff7a00'],
  chill:     ['#7c3aed', '#0ea5e9'],
  focus:     ['#059669', '#14b8a6'],
  happy:     ['#f59e0b', '#f97316'],
  melancholy:['#6d28d9', '#be185d'],
  party:     ['#ec4899', '#8b5cf6'],
}

const MOOD_GLOWS: Record<string, string> = {
  energetic: '0 0 28px rgba(255,59,59,0.55)',
  chill:     '0 0 28px rgba(124,58,237,0.55)',
  focus:     '0 0 28px rgba(5,150,105,0.55)',
  happy:     '0 0 28px rgba(245,158,11,0.55)',
  melancholy:'0 0 28px rgba(109,40,217,0.55)',
  party:     '0 0 28px rgba(236,72,153,0.55)',
}

export function MoodSelector({
  moods,
  selectedMood,
  onMoodChange,
  onRandomize,
  isLoading,
}: MoodSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-6 mb-12">
      <div className="flex flex-wrap justify-center gap-3">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood
          const [from, to] = MOOD_GRADIENTS[mood] || MOOD_GRADIENTS.chill
          return (
            <motion.button
              key={mood}
              onClick={() => onMoodChange(mood)}
              whileHover={{ y: -3, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
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
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </motion.button>
          )
        })}
      </div>

      <motion.button
        onClick={onRandomize}
        whileHover={{ rotate: 180, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        disabled={isLoading}
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
  )
}
