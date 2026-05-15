import type { IngredientResult } from '../lib/types'

interface Props {
  ingredients: IngredientResult[]
  servings: number
}

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  fineli:      { label: 'Fineli',   className: 'bg-[#7ab893]/15 text-[#7ab893] border-[#7ab893]/20'   },
  usda:        { label: 'USDA',     className: 'bg-[#5aae94]/15 text-[#5aae94] border-[#5aae94]/20'   },
  usda_cached: { label: 'USDA',     className: 'bg-[#5aae94]/15 text-[#5aae94] border-[#5aae94]/20'   },
  hardcoded:   { label: 'Built-in', className: 'bg-[#7ab893]/8 text-[#7ab893]/55 border-[#7ab893]/12' },
  off:         { label: 'OFF',      className: 'bg-[#4e8066]/20 text-[#7ab893] border-[#4e8066]/25'   },
  unknown:     { label: 'Unknown',  className: 'bg-[#c07a5a]/15 text-[#c07a5a] border-[#c07a5a]/20'   },
}

function fmt(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

export function IngredientTable({ ingredients, servings }: Props) {
  const showPerServing = servings > 1

  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#7ab893]/35 mb-3">Ingredient breakdown</h2>
      <div className="overflow-x-auto rounded-xl border border-[#7ab893]/12">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#7ab893]/[0.05] text-left text-[11px] text-[#7ab893]/35 uppercase tracking-widest border-b border-[#7ab893]/10">
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
          <tbody className="divide-y divide-[#7ab893]/[0.05]">
            {ingredients.map((row, i) => {
              const isLow = row.confidence === 'low'
              const badge = SOURCE_BADGE[row.source] ?? SOURCE_BADGE.unknown
              const perServing = servings > 1 ? Math.round((row.amount_g / servings) * 10) / 10 : null
              return (
                <tr
                  key={i}
                  className={`transition-colors ${
                    isLow ? 'bg-[#c9a96e]/[0.05]' : 'hover:bg-[#7ab893]/[0.03]'
                  }`}
                >
                  <td className="px-4 py-2.5 font-medium text-[#dcefd5]/75">
                    {row.input}
                    {isLow && (
                      <span className="ml-1.5 text-[#c9a96e]/70 text-xs" title="Low-confidence match">⚠</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[#7ab893]/35 text-xs">{row.matched}</td>
                  <td className="px-4 py-2.5 text-right text-[#dcefd5]/45 tabular-nums">{fmt(row.amount_g)}</td>
                  {showPerServing && (
                    <td className="px-4 py-2.5 text-right text-[#7ab893]/65 tabular-nums">
                      {perServing !== null ? fmt(perServing) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-2.5 text-right font-semibold text-[#dcefd5]/70 tabular-nums">{fmt(row.energy_kcal)}</td>
                  <td className="px-4 py-2.5 text-right text-[#5aae94] tabular-nums">{fmt(row.protein_g)} g</td>
                  <td className="px-4 py-2.5 text-right text-[#c9a96e] tabular-nums">{fmt(row.carbs_g)} g</td>
                  <td className="px-4 py-2.5 text-right text-[#c07a5a] tabular-nums">{fmt(row.fat_g)} g</td>
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
