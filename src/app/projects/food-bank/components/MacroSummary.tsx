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
    <div className={`rounded-xl p-3.5 border transition-opacity ${accent} ${dim ? 'opacity-50' : ''}`}>
      <div className="text-xl font-bold text-[#dcefd5] tabular-nums">
        {value.toFixed(1)}
        <span className="text-xs font-normal ml-1 text-[#7ab893]/40">{unit}</span>
      </div>
      <div className="text-[11px] text-[#7ab893]/40 mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  )
}

export function MacroSummary({ total, perServing, servings }: Props) {
  const showPerServing = servings > 1

  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#7ab893]/35 mb-3">
        Total{showPerServing ? ` · ${servings} servings` : ''}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Calories" value={total.energy_kcal} unit="kcal" accent="bg-[#7ab893]/10 border-[#7ab893]/20" />
        <StatCard label="Protein"  value={total.protein_g}   unit="g"    accent="bg-[#5aae94]/10 border-[#5aae94]/20" />
        <StatCard label="Carbs"    value={total.carbs_g}     unit="g"    accent="bg-[#c9a96e]/10 border-[#c9a96e]/20" />
        <StatCard label="Fat"      value={total.fat_g}       unit="g"    accent="bg-[#c07a5a]/10 border-[#c07a5a]/20" />
      </div>

      {showPerServing && (
        <>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#7ab893]/35 mt-5 mb-3">Per serving</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatCard label="Calories" value={perServing.energy_kcal} unit="kcal" accent="bg-[#7ab893]/10 border-[#7ab893]/20" dim />
            <StatCard label="Protein"  value={perServing.protein_g}   unit="g"    accent="bg-[#5aae94]/10 border-[#5aae94]/20" dim />
            <StatCard label="Carbs"    value={perServing.carbs_g}     unit="g"    accent="bg-[#c9a96e]/10 border-[#c9a96e]/20" dim />
            <StatCard label="Fat"      value={perServing.fat_g}       unit="g"    accent="bg-[#c07a5a]/10 border-[#c07a5a]/20" dim />
          </div>
        </>
      )}
    </div>
  )
}
