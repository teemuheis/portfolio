import { useState } from 'react'
import { DEMO_RECIPES } from '../lib/mockData'
import type { ParsedIngredient } from '../lib/types'

interface Props {
  onLoaded: (ingredients: ParsedIngredient[], servings: number) => void
}

export function DemoRecipePicker({ onLoaded }: Props) {
  const [selected, setSelected] = useState(0)
  const recipe = DEMO_RECIPES[selected]

  function handleLoad() {
    onLoaded(
      recipe.ingredients.map((ing) => ({
        name: ing.name,
        amount_g: ing.amount_g,
        original: `${ing.amount_g} g ${ing.name}`,
      })),
      recipe.servings
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#7ab893]/40 font-medium uppercase tracking-widest">Try a demo recipe</p>

      <div className="grid grid-cols-2 gap-2">
        {DEMO_RECIPES.map((r, i) => (
          <button
            key={r.name}
            type="button"
            onClick={() => setSelected(i)}
            className={`rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
              selected === i
                ? 'bg-[#7ab893]/15 border border-[#7ab893]/40 text-[#7ab893]'
                : 'bg-[#7ab893]/[0.04] border border-[#7ab893]/10 text-[#dcefd5]/50 hover:text-[#dcefd5]/80 hover:bg-[#7ab893]/[0.08]'
            }`}
          >
            <div className="font-medium leading-tight">{r.name}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-[#7ab893]/[0.05] border border-[#7ab893]/10 px-4 py-3 space-y-2">
        <div>
          <p className="text-sm font-semibold text-[#dcefd5]/85">{recipe.name}</p>
          <p className="text-xs text-[#7ab893]/45 mt-0.5">{recipe.description}</p>
          <p className="text-xs text-[#7ab893]/30 mt-0.5">
            {recipe.ingredients.length} ingredients · {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
          </p>
        </div>
        <ul className="space-y-0.5 border-t border-[#7ab893]/8 pt-2">
          {recipe.ingredients.map((ing) => (
            <li key={ing.name} className="text-xs text-[#7ab893]/40 font-mono flex justify-between">
              <span>{ing.name}</span>
              <span className="text-[#7ab893]/25">{ing.amount_g} g</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleLoad}
        className="w-full rounded-xl bg-[#4e8066] px-4 py-2.5 text-sm font-semibold text-[#dcefd5] hover:bg-[#3d6655] active:bg-[#2f5244] transition-colors"
      >
        Load recipe →
      </button>

      <p className="text-xs text-[#7ab893]/25 border-t border-[#7ab893]/8 pt-3">
        Recipe text parsing requires the full backend. Manual ingredient input works in all cases.
      </p>
    </div>
  )
}
