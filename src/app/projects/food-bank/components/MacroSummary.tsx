import type { MacroTotals } from '../lib/types'

interface Props {
  total: MacroTotals
  perServing: MacroTotals
  servings: number
}

interface StatCardProps {
  label: string
  value: number
  unit: string
  color: string
}

function StatCard({ label, value, unit, color }: StatCardProps) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="text-2xl font-bold text-gray-800">
        {value.toFixed(1)}<span className="text-sm font-normal ml-1 text-gray-500">{unit}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

export function MacroSummary({ total, perServing, servings }: Props) {
  const showPerServing = servings > 1

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
        Total{showPerServing ? ` (${servings} servings)` : ''}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Calories" value={total.energy_kcal} unit="kcal" color="bg-orange-50" />
        <StatCard label="Protein"  value={total.protein_g}   unit="g"    color="bg-blue-50"   />
        <StatCard label="Carbs"    value={total.carbs_g}     unit="g"    color="bg-amber-50"  />
        <StatCard label="Fat"      value={total.fat_g}       unit="g"    color="bg-rose-50"   />
      </div>

      {showPerServing && (
        <>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-5 mb-3">Per serving</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Calories" value={perServing.energy_kcal} unit="kcal" color="bg-orange-50/60" />
            <StatCard label="Protein"  value={perServing.protein_g}   unit="g"    color="bg-blue-50/60"   />
            <StatCard label="Carbs"    value={perServing.carbs_g}     unit="g"    color="bg-amber-50/60"  />
            <StatCard label="Fat"      value={perServing.fat_g}       unit="g"    color="bg-rose-50/60"   />
          </div>
        </>
      )}
    </div>
  )
}
