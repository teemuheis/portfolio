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

interface Props {
  activities: StravaActivity[]
}

export default function Hero({ activities }: Props) {
  return (
    <section className="flex-1 flex min-h-0 flex-col md:flex-row">

      {/* Left panel — identity, solid dark background */}
      <div className="flex flex-col justify-center px-10 md:px-14 lg:px-20 py-12 md:py-0 md:w-[42%] md:shrink-0 bg-[#080808]">

        <div className="w-10 h-[3px] bg-orange-500 mb-8" />

        <h1 className="text-[clamp(2.8rem,4.5vw,5rem)] font-black leading-[0.88] tracking-tight text-white mb-7">
          Solutions<br />
          <span className="text-orange-400">Engineer.</span>
        </h1>

        <p className="text-base text-white/50 leading-relaxed max-w-[380px] mb-10">
          Backend tooling, automation systems and API-driven workflows —
          built to stay visible and debuggable in production.
        </p>

        <div className="flex flex-wrap gap-4 mb-14">
          <a
            href="#projects"
            className="px-7 py-3 bg-orange-500 hover:bg-orange-400 transition-colors font-semibold text-sm tracking-wide text-white shadow-[0_0_48px_rgba(249,115,22,0.4)]"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-7 py-3 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-colors text-white/65 hover:text-white text-sm tracking-wide"
          >
            Get in Touch
          </a>
        </div>

        <div className="flex items-center gap-8">
          <div>
            <p className="text-2xl font-black text-white tabular-nums leading-none">
              {activities.length > 0 ? activities.length : '—'}
            </p>
            <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase mt-1.5">Activities mapped</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-2xl font-black text-orange-400 leading-none">Live</p>
            <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase mt-1.5">Strava data</p>
          </div>
        </div>
      </div>

      {/* Vertical divider — desktop only */}
      <div className="hidden md:block w-px bg-orange-500/20 shrink-0" />

      {/* Right panel — Strava map fills the rest */}
      <div className="relative flex-1 min-h-[50vh] md:min-h-0">
        <StravaMap activities={activities} />
      </div>

    </section>
  )
}
