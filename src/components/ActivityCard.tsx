'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { StravaActivity } from '@/types/strava'

function fmt(activity: StravaActivity) {
  const km = (activity.distance / 1000).toFixed(1)
  const totalSecs = activity.elapsed_time
  const paceSec = activity.distance > 0 ? (totalSecs / (activity.distance / 1000)) : 0
  const paceMin = Math.floor(paceSec / 60)
  const paceFrac = Math.floor(paceSec % 60)
  return {
    km,
    pace: `${paceMin}:${String(paceFrac).padStart(2, '0')} /km`,
    elevation: `${Math.round(activity.total_elevation_gain)}m`,
  }
}

interface Props {
  activity: StravaActivity | null
  activeIndex: number
}

export default function ActivityCard({ activity, activeIndex }: Props) {
  if (!activity) return null
  const { km, pace, elevation } = fmt(activity)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-10 right-4 max-w-[220px] rounded-xl border border-orange-500/15 bg-black/60 backdrop-blur-xl p-4 z-10"
      >
        <p className="text-[10px] text-white/35 tracking-[0.15em] uppercase mb-1">Now showing</p>
        <p className="text-sm font-semibold truncate mb-2">{activity.name}</p>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="text-orange-300 font-bold text-sm">{km} km</span>
          <span>{pace}</span>
          <span>{elevation}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
