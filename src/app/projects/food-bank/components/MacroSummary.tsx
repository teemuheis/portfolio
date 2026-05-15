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
  accent: string
  dim?: boolean
}

function StatCard({ label, value, unit, accent, dim }: StatCardProps) {
  return (
    <div className={`rounded-xl p-3.5 border transition-opacity ${accent} ${dim ? 'opacity-55' : ''}`}>
      <div className="text-xl font-bold text-white tabular-nums">
        {value.toFixed(1)}
        <span className="text-xs font-normal ml-1 text-white/40">{unit}</span>
      </div>
      <div className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  )
}

export function MacroSummary({ total, perServing, servings }: Props) {
  const showPerServing = servings > 1

  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
        Total{showPerServing ? ` · ${servings} servings` : ''}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Calories" value={total.energy_kcal} unit="kcal" accent="bg-orange-500/10 border-orange-500/25" />
        <StatCard label="Protein"  value={total.protein_g}   unit="g"    accent="bg-blue-500/10 border-blue-500/25"   />
        <StatCard label="Carbs"    value={total.carbs_g}     unit="g"    accent="bg-amber-500/10 border-amber-500/25"  />
        <StatCard label="Fat"      value={total.fat_g}       unit="g"    accent="bg-rose-500/10 border-rose-500/25"   />
      </div>

      {showPerServing && (
        <>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mt-5 mb-3">Per serving</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatCard label="Calories" value={perServing.energy_kcal} unit="kcal" accent="bg-orange-500/10 border-orange-500/25" dim />
            <StatCard label="Protein"  value={perServing.protein_g}   unit="g"    accent="bg-blue-500/10 border-blue-500/25"   dim />
            <StatCard label="Carbs"    value={perServing.carbs_g}     unit="g"    accent="bg-amber-500/10 border-amber-500/25"  dim />
            <StatCard label="Fat"      value={perServing.fat_g}       unit="g"    accent="bg-rose-500/10 border-rose-500/25"   dim />
          </div>
        </>
      )}
    </div>
  )
}
