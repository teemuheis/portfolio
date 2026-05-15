'use client'
import { useEffect, useRef, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import type { MacroTotals } from '../lib/types'

interface Props {
  totals: MacroTotals
}

const COLORS = {
  Protein: '#6366f1',
  Carbs:   '#f59e0b',
  Fat:     '#f43f5e',
}

interface TooltipPayload {
  name: string
  value: number
  payload: { kcal: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: data } = payload[0]
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm shadow-xl">
      <span className="font-semibold text-white">{name}</span>
      <div className="text-white/50 mt-0.5">{value.toFixed(1)} g</div>
      <div className="text-white/30 text-xs">{data.kcal.toFixed(0)} kcal</div>
    </div>
  )
}

export function MacroChart({ totals }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Use ResizeObserver to get the real container width before rendering the chart.
  // ResponsiveContainer measures synchronously at mount and gets 14px if the parent
  // isn't laid out yet — ResizeObserver fires only after actual layout.
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(w)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const { protein_g, carbs_g, fat_g } = totals
  const total = protein_g + carbs_g + fat_g
  if (total === 0) return null

  const data = [
    { name: 'Protein', value: protein_g, kcal: protein_g * 4 },
    { name: 'Carbs',   value: carbs_g,   kcal: carbs_g   * 4 },
    { name: 'Fat',     value: fat_g,     kcal: fat_g     * 9 },
  ]

  return (
    <div ref={containerRef}>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">Macro split</h2>
      {width > 0 && (
        <PieChart width={width} height={220}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const item = data.find((d) => d.name === value)
              const pct = item ? ((item.value / total) * 100).toFixed(0) : 0
              return (
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                  {value} <span style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                </span>
              )
            }}
          />
        </PieChart>
      )}
    </div>
  )
}
