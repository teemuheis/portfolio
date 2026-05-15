'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { MacroTotals } from '../lib/types'

interface Props {
  totals: MacroTotals
}

const COLORS = {
  Protein: '#6366f1',
  Carbs: '#f59e0b',
  Fat: '#f43f5e',
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
    <div className="bg-white border border-gray-100 rounded-lg shadow-md px-3 py-2 text-sm">
      <span className="font-semibold">{name}</span>
      <div className="text-gray-500">{value.toFixed(1)} g</div>
      <div className="text-gray-400">{data.kcal.toFixed(0)} kcal</div>
    </div>
  )
}

export function MacroChart({ totals }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { protein_g, carbs_g, fat_g } = totals
  const total = protein_g + carbs_g + fat_g

  if (total === 0) return null
  // Wait for stable DOM before letting ResponsiveContainer measure its container
  if (!mounted) return <div style={{ height: 240 }} />

  const data = [
    { name: 'Protein', value: protein_g, kcal: protein_g * 4 },
    { name: 'Carbs', value: carbs_g, kcal: carbs_g * 4 },
    { name: 'Fat', value: fat_g, kcal: fat_g * 9 },
  ]

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Macro split</h2>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
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
                <span className="text-sm text-gray-600">
                  {value} {pct}%
                </span>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
