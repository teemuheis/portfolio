'use client'
import { useEffect, useRef, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import type { MacroTotals } from '../lib/types'

interface Props {
  totals: MacroTotals
}

// Earthy matcha-palette chart colors
const COLORS = {
  Protein: '#5aae94',  // teal-green
  Carbs:   '#c9a96e',  // warm gold
  Fat:     '#c07a5a',  // terracotta
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
    <div className="rounded-xl border border-[#7ab893]/20 bg-[#0f1e0e] px-3 py-2 text-sm shadow-xl">
      <span className="font-semibold text-[#dcefd5]">{name}</span>
      <div className="text-[#7ab893]/60 mt-0.5">{value.toFixed(1)} g</div>
      <div className="text-[#7ab893]/35 text-xs">{data.kcal.toFixed(0)} kcal</div>
    </div>
  )
}

export function MacroChart({ totals }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // ResizeObserver fires after actual layout — avoids the 14px measurement bug
  // that occurs with ResponsiveContainer measuring synchronously at mount
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
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#7ab893]/35 mb-3">Macro split</h2>
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
                <span style={{ color: 'rgba(220,239,213,0.55)', fontSize: 13 }}>
                  {value} <span style={{ color: 'rgba(122,184,147,0.35)' }}>{pct}%</span>
                </span>
              )
            }}
          />
        </PieChart>
      )}
    </div>
  )
}
