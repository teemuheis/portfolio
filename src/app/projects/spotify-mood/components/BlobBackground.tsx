'use client'

import { motion } from 'framer-motion'

type BlobBackgroundProps = {
  mood: string
  weather?: {
    energy: number
    valence: number
  }
}

type WeatherIcon = keyof typeof WEATHER_ICONS

const MOOD_PALETTES: Record<string, string[]> = {
  energetic: ['#ff3b3b', '#ff7a00', '#ff0055', '#ffd500'],
  chill: ['#7c3aed', '#06b6d4', '#4f46e5', '#0ea5e9'],
  focus: ['#059669', '#0d9488', '#34d399', '#14b8a6'],
  happy: ['#f59e0b', '#f97316', '#fbbf24', '#fb923c'],
  melancholy: ['#6d28d9', '#be185d', '#4f46e5', '#7c3aed'],
  party: ['#ec4899', '#8b5cf6', '#f43f5e', '#a855f7'],
}

const BLOBS = [
  { top: '-18%', left: '-14%', size: 640, opacity: 0.55, x: [0, 38, -20, 0], y: [0, -22, 28, 0], duration: 20 },
  { bottom: '-20%', right: '-16%', size: 620, opacity: 0.5, x: [0, -34, 24, 0], y: [0, 28, -20, 0], duration: 24 },
  { top: '26%', left: '12%', size: 360, opacity: 0.34, x: [0, 24, -18, 0], y: [0, 18, -22, 0], duration: 18 },
  { top: '10%', right: '12%', size: 320, opacity: 0.3, x: [0, -22, 26, 0], y: [0, -16, 20, 0], duration: 22 },
] as const

const WEATHER_ICONS = {
  sun: (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full">
      <circle cx="32" cy="32" r="10" fill="currentColor" />
      <path
        d="M32 5v9M32 50v9M5 32h9M50 32h9M13 13l6 6M45 45l6 6M51 13l-6 6M19 45l-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 80 52" aria-hidden="true" className="h-full w-full">
      <path
        d="M25 42h34c8 0 14-5 14-13s-6-13-14-13h-2C53 7 45 2 36 2 24 2 15 11 14 23 7 24 2 29 2 36c0 4 3 6 7 6h16Z"
        fill="currentColor"
      />
    </svg>
  ),
  rain: (
    <svg viewBox="0 0 80 70" aria-hidden="true" className="h-full w-full">
      <path
        d="M25 35h34c8 0 14-5 14-13S67 9 59 9h-2C53 3 45 0 36 0 25 0 16 7 14 18 7 19 2 24 2 30c0 3 3 5 7 5h16Z"
        fill="currentColor"
      />
      <path d="M21 50l-4 12M39 48l-4 12M58 50l-4 12" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 48 72" aria-hidden="true" className="h-full w-full">
      <path d="M30 2 6 39h18l-6 31 24-40H25L30 2Z" fill="currentColor" />
    </svg>
  ),
}

const WEATHER_ICON_LAYOUT: Array<{
  icon: WeatherIcon
  className: string
  size: number
  rotate: number
  duration: number
}> = [
  { icon: 'sun', className: 'left-[8%] top-[9%]', size: 118, rotate: -8, duration: 24 },
  { icon: 'cloud', className: 'right-[8%] top-[16%]', size: 148, rotate: 3, duration: 30 },
  { icon: 'rain', className: 'bottom-[13%] left-[10%]', size: 132, rotate: -3, duration: 26 },
  { icon: 'bolt', className: 'bottom-[14%] right-[14%]', size: 104, rotate: 9, duration: 20 },
]

const EQUALIZER_BARS = [32, 64, 42, 86, 54, 110, 48, 76, 38, 92, 58, 70]

function weatherSignature(weather?: BlobBackgroundProps['weather']) {
  const energy = weather?.energy ?? 0
  const valence = weather?.valence ?? 0

  if (energy > 0.18 && valence > 0.05) {
    return { primary: 'sun' as WeatherIcon, secondary: 'bolt' as WeatherIcon, color: '#fbbf24' }
  }
  if (energy > 0.18) {
    return { primary: 'bolt' as WeatherIcon, secondary: 'cloud' as WeatherIcon, color: '#f97316' }
  }
  if (valence < -0.12) {
    return { primary: 'rain' as WeatherIcon, secondary: 'cloud' as WeatherIcon, color: '#38bdf8' }
  }
  if (valence < 0) {
    return { primary: 'cloud' as WeatherIcon, secondary: 'rain' as WeatherIcon, color: '#94a3b8' }
  }
  return { primary: 'cloud' as WeatherIcon, secondary: 'sun' as WeatherIcon, color: '#a7f3d0' }
}

export function BlobBackground({ mood, weather }: BlobBackgroundProps) {
  const colors = MOOD_PALETTES[mood] || MOOD_PALETTES.chill
  const [, c2, , c4] = colors
  const signature = weatherSignature(weather)

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#080810]">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 28%, ${signature.color}2e, transparent 34%), radial-gradient(circle at 24% 72%, ${c2}30, transparent 32%), radial-gradient(circle at 80% 70%, ${c4}24, transparent 34%)`,
        }}
      />

      {BLOBS.map((blob, i) => (
        <motion.div
          key={`${blob.size}-${i}`}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            opacity: blob.opacity,
            background: `radial-gradient(circle, ${colors[i]} 0%, ${colors[i]}66 38%, transparent 70%)`,
            ...('top' in blob ? { top: blob.top } : { bottom: blob.bottom }),
            ...('left' in blob ? { left: blob.left } : { right: blob.right }),
          }}
          animate={{ x: [...blob.x], y: [...blob.y], scale: [1, 1.08, 0.98, 1] }}
          transition={{ duration: blob.duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-[46%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12"
        style={{
          boxShadow: `0 0 0 1px ${signature.color}30 inset`,
        }}
        animate={{ rotate: [0, 360], scale: [0.96, 1.04, 0.96] }}
        transition={{
          rotate: { duration: 44, repeat: Infinity, ease: 'linear' },
          scale: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      <motion.div
        className="absolute left-1/2 top-[46%] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 border-t-white/35"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />

      {WEATHER_ICON_LAYOUT.map((item, i) => {
        const active = item.icon === signature.primary || item.icon === signature.secondary
        const Icon = WEATHER_ICONS[item.icon]

        return (
          <motion.div
            key={item.icon}
            className={`absolute ${item.className}`}
            style={{
              width: item.size,
              height: item.size,
              color: active ? signature.color : 'rgba(255,255,255,0.35)',
              opacity: active ? 0.36 : 0.12,
              rotate: `${item.rotate}deg`,
            }}
            animate={{ y: [0, i % 2 === 0 ? -18 : 18, 0], scale: active ? [1, 1.08, 1] : [1, 1.03, 1] }}
            transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          >
            {Icon}
          </motion.div>
        )
      })}

      <div className="absolute bottom-0 left-1/2 flex h-36 w-[min(760px,90vw)] -translate-x-1/2 items-end justify-center gap-2 opacity-45">
        {EQUALIZER_BARS.map((height, i) => (
          <motion.span
            key={`${height}-${i}`}
            className="w-2 rounded-full"
            style={{
              height,
              background: `linear-gradient(180deg, ${signature.color}, ${c2})`,
            }}
            animate={{ scaleY: [0.45, 1, 0.55] }}
            transition={{
              duration: 1.9 + (i % 4) * 0.28,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: i * 0.08,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            signature.primary === 'rain'
              ? 'repeating-linear-gradient(108deg, transparent 0 44px, rgba(125,211,252,0.18) 45px 47px, transparent 48px 92px)'
              : 'repeating-linear-gradient(108deg, transparent 0 64px, rgba(255,255,255,0.1) 65px 66px, transparent 67px 132px)',
        }}
        animate={{ x: signature.primary === 'rain' ? [0, -72] : [0, 48] }}
        transition={{ duration: signature.primary === 'rain' ? 5 : 22, repeat: Infinity, ease: 'linear' }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,8,16,0.1)_42%,rgba(8,8,16,0.64)_100%)]" />
    </div>
  )
}
