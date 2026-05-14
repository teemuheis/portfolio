import type { IngredientResult } from '../lib/types'

interface Props {
  ingredients: IngredientResult[]
}

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  fineli:      { label: 'Fineli',   className: 'bg-green-100 text-green-700'  },
  usda:        { label: 'USDA',     className: 'bg-blue-100 text-blue-700'    },
  usda_cached: { label: 'USDA',     className: 'bg-blue-100 text-blue-700'    },
  hardcoded:   { label: 'Built-in', className: 'bg-gray-100 text-gray-600'    },
  off:         { label: 'OFF',      className: 'bg-purple-100 text-purple-700' },
  unknown:     { label: 'Unknown',  className: 'bg-red-100 text-red-600'      },
}

export function IngredientTable({ ingredients }: Props) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Ingredient breakdown</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Input</th>
              <th className="px-4 py-3">Matched as</th>
              <th className="px-4 py-3 text-right">g</th>
              <th className="px-4 py-3 text-right">kcal</th>
              <th className="px-4 py-3 text-right">Protein</th>
              <th className="px-4 py-3 text-right">Carbs</th>
              <th className="px-4 py-3 text-right">Fat</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ingredients.map((row, i) => {
              const isLow = row.confidence === 'low'
              const badge = SOURCE_BADGE[row.source] ?? SOURCE_BADGE.unknown
              return (
                <tr key={i} className={isLow ? 'bg-amber-50' : 'bg-white hover:bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {row.input}
                    {isLow && <span className="ml-1.5 text-amber-500" title="Low-confidence match">⚠</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{row.matched}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{row.amount_g}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{row.energy_kcal}</td>
                  <td className="px-4 py-3 text-right text-blue-600">{row.protein_g} g</td>
                  <td className="px-4 py-3 text-right text-amber-600">{row.carbs_g} g</td>
                  <td className="px-4 py-3 text-right text-rose-500">{row.fat_g} g</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
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
