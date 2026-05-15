import type { IngredientResult } from '../lib/types'

interface Props {
  ingredients: IngredientResult[]
  servings: number
}

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  fineli:      { label: 'Fineli',   className: 'bg-green-500/15 text-green-400 border-green-500/20'   },
  usda:        { label: 'USDA',     className: 'bg-blue-500/15 text-blue-400 border-blue-500/20'      },
  usda_cached: { label: 'USDA',     className: 'bg-blue-500/15 text-blue-400 border-blue-500/20'      },
  hardcoded:   { label: 'Built-in', className: 'bg-white/10 text-white/40 border-white/10'            },
  off:         { label: 'OFF',      className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  unknown:     { label: 'Unknown',  className: 'bg-red-500/15 text-red-400 border-red-500/20'         },
}

function fmt(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

export function IngredientTable({ ingredients, servings }: Props) {
  const showPerServing = servings > 1

  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">Ingredient breakdown</h2>
      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04] text-left text-[11px] text-white/35 uppercase tracking-widest border-b border-white/8">
              <th className="px-4 py-2.5">Ingredient</th>
              <th className="px-4 py-2.5">Matched as</th>
              <th className="px-4 py-2.5 text-right">g total</th>
              {showPerServing && <th className="px-4 py-2.5 text-right">g / srv</th>}
              <th className="px-4 py-2.5 text-right">kcal</th>
              <th className="px-4 py-2.5 text-right">Protein</th>
              <th className="px-4 py-2.5 text-right">Carbs</th>
              <th className="px-4 py-2.5 text-right">Fat</th>
              <th className="px-4 py-2.5">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {ingredients.map((row, i) => {
              const isLow = row.confidence === 'low'
              const badge = SOURCE_BADGE[row.source] ?? SOURCE_BADGE.unknown
              const perServing = servings > 1 ? Math.round((row.amount_g / servings) * 10) / 10 : null
              return (
                <tr
                  key={i}
                  className={`transition-colors ${
                    isLow ? 'bg-amber-500/[0.06]' : 'hover:bg-white/[0.025]'
                  }`}
                >
                  <td className="px-4 py-2.5 font-medium text-white/80">
                    {row.input}
                    {isLow && (
                      <span className="ml-1.5 text-amber-500/70 text-xs" title="Low-confidence match">⚠</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-white/35 text-xs">{row.matched}</td>
                  <td className="px-4 py-2.5 text-right text-white/50 tabular-nums">{fmt(row.amount_g)}</td>
                  {showPerServing && (
                    <td className="px-4 py-2.5 text-right text-orange-400/70 tabular-nums">
                      {perServing !== null ? fmt(perServing) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-2.5 text-right font-semibold text-white/75 tabular-nums">{fmt(row.energy_kcal)}</td>
                  <td className="px-4 py-2.5 text-right text-indigo-400 tabular-nums">{fmt(row.protein_g)} g</td>
                  <td className="px-4 py-2.5 text-right text-amber-400 tabular-nums">{fmt(row.carbs_g)} g</td>
                  <td className="px-4 py-2.5 text-right text-rose-400 tabular-nums">{fmt(row.fat_g)} g</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
