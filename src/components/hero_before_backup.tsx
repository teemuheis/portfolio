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

const TECHS = ['Python', 'REST APIs', 'Automation', 'Claude Code', 'OpenAI', 'Data Pipelines', 'Docker', 'TypeScript']

interface Props {
  activities: StravaActivity[]
}

export default function Hero({ activities }: Props) {
  return (
    <section className="relative z-10 grid lg:grid-cols-[1.1fr_1fr] gap-10 px-6 md:px-10 py-20 items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,0,0.08),transparent_40%)]" />

      {/* Left */}
      <div className="relative space-y-8 max-w-2xl">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-200 text-sm">
          <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          Building integrations, automations &amp; developer tooling
        </div>

        <div className="space-y-5">
          <h2 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">
            Developer.<br />Problem Solver.<br />Endurance Driven.
          </h2>
          <p className="text-lg text-white/60 leading-relaxed max-w-xl">
            I build reliable backend tooling, automation systems and API-driven workflows.
            This page visualizes my latest Strava activity routes in real time — combining engineering with movement.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href="#projects"
            className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 transition-colors font-medium shadow-[0_0_40px_rgba(255,140,0,0.35)]"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/80"
          >
            Contact Me
          </a>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {TECHS.map((tech) => (
            <div
              key={tech}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* Right — map */}
      <div className="relative h-[580px] md:h-[650px] rounded-[32px] overflow-hidden border border-white/10 bg-[#0b0b0b] shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>
        <StravaMap activities={activities} />
      </div>
    </section>
  )
}
