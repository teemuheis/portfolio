import MapView from '@/components/MapView'
import { getStravaActivities } from '@/lib/strava'

export default async function Home() {
  const activities = await getStravaActivities()

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#0b0b0b]">
      <MapView activities={activities} />

      {/* Contact overlay — top-left */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none select-none">
        <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl px-5 py-4">
          <p className="text-[10px] text-white/30 tracking-[0.18em] uppercase mb-1">Portfolio</p>
          <p className="text-lg font-bold text-white leading-tight">Teemu Heiskanen</p>
          <p className="text-sm text-orange-400/90 mb-6">Integration Engineer</p>
          <div className="flex flex-col gap-1.5">
            <a
              href="mailto:teemu.heiskanen@gmail.com"
              className="pointer-events-auto text-[11px] text-white/45 hover:text-white/80 transition-colors tracking-wide"
            >
              teemu.heiskanen@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/teemu-heiskanen-8b7bb0a8/"
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto text-[11px] text-white/45 hover:text-white/80 transition-colors tracking-wide"
            >
              linkedin.com/in/teemu-heiskanen
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
