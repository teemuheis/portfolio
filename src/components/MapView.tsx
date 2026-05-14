'use client'

import dynamic from 'next/dynamic'
import type { StravaActivity } from '@/types/strava'

const StravaMap = dynamic(() => import('./StravaMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#0b0b0b] flex items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-orange-400 animate-ping" />
    </div>
  ),
})

export default function MapView({ activities }: { activities: StravaActivity[] }) {
  return <StravaMap activities={activities} />
}
