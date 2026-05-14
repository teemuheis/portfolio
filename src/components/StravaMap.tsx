'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Polyline } from 'leaflet'
import { decodePolyline } from '@/lib/polyline'
import type { StravaActivity } from '@/types/strava'
import ActivityCard from './ActivityCard'

interface Props {
  activities: StravaActivity[]
}

interface Controls {
  speedMultiplier: number
  layerRoutes: boolean
  lineWeight: number
  drawMs: number
}

let LeafletModule: typeof import('leaflet') | null = null

async function getLeaflet() {
  if (LeafletModule) return LeafletModule
  await import('leaflet/dist/leaflet.css')
  LeafletModule = await import('leaflet')
  return LeafletModule
}

function animateRoute(polyline: Polyline, durationMs: number): () => void {
  const el = polyline.getElement() as SVGPathElement | null
  if (!el) return () => {}

  const length = el.getTotalLength() + 1
  el.style.strokeDasharray = `${length}`
  el.style.strokeDashoffset = `${length}`

  let start: number | null = null
  let rafId: number

  function step(ts: number) {
    if (start === null) start = ts
    const progress = Math.min((ts - start) / durationMs, 1)
    el!.style.strokeDashoffset = `${length * (1 - progress)}`
    if (progress < 1) rafId = requestAnimationFrame(step)
  }

  rafId = requestAnimationFrame(step)
  return () => cancelAnimationFrame(rafId)
}

export default function StravaMap({ activities }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const polylineRef = useRef<Polyline | null>(null)
  const trailLinesRef = useRef<Polyline[]>([])
  const cancelAnimationRef = useRef<(() => void) | null>(null)
  const activitiesRef = useRef(activities)
  const activeIndexRef = useRef(0)
  // drawTrigger increments when the map has settled after flyToBounds —
  // polyline creation and animation both wait for this signal
  const [drawTrigger, setDrawTrigger] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mapReady, setMapReady] = useState(false)
  const [mapFading, setMapFading] = useState(false)
  const [cycleResetKey, setCycleResetKey] = useState(0)
  const [controls, setControls] = useState<Controls>({
    speedMultiplier: 2,
    layerRoutes: true,
    lineWeight: 5,
    drawMs: 5000,
  })
  const controlsRef = useRef(controls)

  activitiesRef.current = activities
  activeIndexRef.current = activeIndex
  controlsRef.current = controls

  // Effect 1: initialize map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    let cancelled = false

    getLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false,
        doubleClickZoom: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      map.setView([0, 0], 2)
      mapRef.current = map
      setMapReady(true)
    })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      setMapReady(false)
    }
  }, [])

  // Effect 2: navigate map smoothly to new activity bounds.
  // Demotes current polyline to ghost (or removes), flies to new bounds,
  // then signals via drawTrigger when the map has settled.
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LeafletModule) return
    const acts = activitiesRef.current
    if (!acts.length) return
    const coords = decodePolyline(acts[activeIndex].polyline)
    if (!coords.length) return

    const map = mapRef.current
    const { layerRoutes } = controlsRef.current

    // Demote current line before navigating away
    if (polylineRef.current) {
      if (layerRoutes) {
        const el = polylineRef.current.getElement() as SVGElement | null
        if (el) { el.style.opacity = '0.2'; el.style.filter = 'none' }
        trailLinesRef.current.push(polylineRef.current)
      } else {
        polylineRef.current.remove()
      }
      polylineRef.current = null
    }
    if (!layerRoutes) {
      trailLinesRef.current.forEach((pl) => pl.remove())
      trailLinesRef.current = []
    }

    // Briefly dim the map during the transition so the repositioning is masked
    setMapFading(true)
    const fadeTimer = setTimeout(() => setMapFading(false), 350)

    const bounds = LeafletModule.latLngBounds(coords)
    const onMoveEnd = () => setDrawTrigger((t) => t + 1)
    map.once('moveend', onMoveEnd)
    map.flyToBounds(bounds, { padding: [50, 50], duration: 0.4, easeLinearity: 0.6 })

    return () => {
      clearTimeout(fadeTimer)
      map.off('moveend', onMoveEnd)
    }
  }, [activeIndex, mapReady, controls.layerRoutes])

  // Effect 3: create polyline after the map has settled (drawTrigger).
  // Using visibility:hidden around getTotalLength prevents the flash of a fully-drawn
  // route that would otherwise appear before strokeDashoffset is applied.
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LeafletModule || drawTrigger === 0) return
    const acts = activitiesRef.current
    if (!acts.length) return
    const coords = decodePolyline(acts[activeIndexRef.current].polyline)
    if (!coords.length) return

    const { lineWeight } = controlsRef.current
    const pl = LeafletModule.polyline(coords, { color: '#f97316', weight: lineWeight, className: 'route-line' })
    pl.addTo(mapRef.current)

    const svgEl = pl.getElement() as SVGPathElement | null
    if (svgEl) {
      // Hide during measurement so the fully-visible route never paints
      svgEl.style.visibility = 'hidden'
      svgEl.style.filter = 'drop-shadow(0 0 6px #f97316)'
      const len = svgEl.getTotalLength() + 1
      svgEl.style.strokeDasharray = `${len}`
      svgEl.style.strokeDashoffset = `${len}`
      // Restore — element is now hidden behind dashoffset, not visibility
      svgEl.style.visibility = ''
    }
    polylineRef.current = pl
  }, [drawTrigger, mapReady, controls.lineWeight])

  // Effect 4: own all animation — fires after Effect 3 sets the polyline
  useEffect(() => {
    if (!mapReady || !polylineRef.current) return

    cancelAnimationRef.current?.()
    cancelAnimationRef.current = null

    const pl = polylineRef.current
    const initRaf = requestAnimationFrame(() => {
      if (polylineRef.current === pl)
        cancelAnimationRef.current = animateRoute(pl, controlsRef.current.drawMs)
    })

    return () => {
      cancelAnimationFrame(initRaf)
      cancelAnimationRef.current?.()
      cancelAnimationRef.current = null
    }
  }, [mapReady, drawTrigger, controls.drawMs])

  // Effect 5: cycle through activities
  useEffect(() => {
    if (activities.length <= 1) return
    const periodMs = 10_000 / controls.speedMultiplier
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % activities.length)
    }, periodMs)
    return () => clearInterval(interval)
  }, [activities.length, controls.speedMultiplier, cycleResetKey])

  // Effect 6: click to advance + reset cycle timer
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current
    const handler = () => {
      setActiveIndex((i) => (i + 1) % activitiesRef.current.length)
      setCycleResetKey((k) => k + 1)
    }
    map.on('click', handler)
    map.getContainer().style.cursor = 'pointer'
    return () => { map.off('click', handler) }
  }, [mapReady])

  const hasActivities = activities.length > 0

  return (
    <div className="relative h-full w-full">
      {!hasActivities && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" fill="none">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path
              d="M100 800 C200 650, 350 700, 400 500 S600 200, 820 300"
              stroke="#f97316"
              strokeWidth="10"
              strokeLinecap="round"
              filter="url(#glow)"
              opacity="0.6"
            />
          </svg>
        </div>
      )}
      {/* z-0 establishes a stacking context so Leaflet's internal z-indices (400+) stay contained */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Transition overlay — dims the map briefly when switching activities */}
      <div
        className="absolute inset-0 z-[5] bg-black pointer-events-none transition-opacity duration-300"
        style={{ opacity: mapFading ? 0.45 : 0 }}
      />

      <ActivityCard
        activity={hasActivities ? activities[activeIndex] : null}
        activeIndex={activeIndex}
      />

      {activities.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20 bg-white/5">
          <div
            key={`${activeIndex}-${controls.speedMultiplier}-${controls.drawMs}`}
            className="h-full bg-orange-500 animate-progress-bar"
          />
        </div>
      )}
    </div>
  )
}
