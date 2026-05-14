import { useState } from 'react'
import { DEMO_RECIPES } from '../lib/mockData'
import type { ParsedIngredient } from '../lib/types'

interface Props {
  onLoaded: (ingredients: ParsedIngredient[]) => void
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
      }))
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Try a demo recipe</p>

      <div className="grid grid-cols-2 gap-2">
        {DEMO_RECIPES.map((r, i) => (
          <button
            key={r.name}
            type="button"
            onClick={() => setSelected(i)}
            className={`rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
              selected === i
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            <div className="font-medium leading-tight">{r.name}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 space-y-1">
        <p className="text-sm font-medium text-gray-700">{recipe.name}</p>
        <p className="text-xs text-gray-400">{recipe.description}</p>
        <p className="text-xs text-gray-400">
          {recipe.ingredients.length} ingredients · {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
        </p>
        <ul className="pt-1 space-y-0.5">
          {recipe.ingredients.map((ing) => (
            <li key={ing.name} className="text-xs text-gray-500 font-mono">
              {ing.amount_g} g {ing.name}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleLoad}
        className="w-full rounded-lg bg-indigo-700 px-4 py-2.5 text-base font-semibold text-white hover:bg-indigo-800 transition-colors"
      >
        Load recipe →
      </button>

      <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
        Recipe text parsing requires the full backend. Manual ingredient input works in all cases.
      </p>
    </div>
  )
}
