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

export function MoodSelector({
  moods,
  selectedMood,
  onMoodChange,
  onRandomize,
  isLoading,
}: MoodSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-6 mb-12">
      {/* Mood pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {moods.map((mood) => (
          <motion.button
            key={mood}
            onClick={() => onMoodChange(mood)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
              selectedMood === mood
                ? `bg-gradient-to-r ${getMoodGradient(mood)} text-white shadow-lg`
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
            disabled={isLoading}
          >
            <span className="mr-2">{MOOD_EMOJIS[mood]}</span>
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Randomize button */}
      <motion.button
        onClick={onRandomize}
        whileHover={{ rotate: 180 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
        className="text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        title="Randomize tracks"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </motion.button>
    </div>
  )
}

function getMoodGradient(mood: string): string {
  const gradients: Record<string, string> = {
    energetic: 'from-orange-400 to-red-400',
    chill: 'from-blue-400 to-indigo-400',
    focus: 'from-green-400 to-teal-400',
    happy: 'from-yellow-400 to-amber-400',
    melancholy: 'from-rose-400 to-purple-400',
    party: 'from-pink-400 to-purple-400',
  }
  return gradients[mood] || gradients.chill
}
