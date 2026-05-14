'use client'
import { useState } from 'react'
import { calculateRecipe } from './lib/mockApi'
import { RecipeInput } from './components/RecipeInput'
import { DemoRecipePicker } from './components/DemoRecipePicker'
import { MacroSummary } from './components/MacroSummary'
import { MacroChart } from './components/MacroChart'
import { IngredientTable } from './components/IngredientTable'
import type { IngredientInput, ParsedIngredient, RecipeResult } from './lib/types'

type InputMode = 'demo' | 'manual'

export default function FoodBankDemo() {
  const [mode, setMode] = useState<InputMode>('demo')
  const [prefill, setPrefill] = useState<ParsedIngredient[] | undefined>()
  const [result, setResult] = useState<RecipeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleCalculate(ingredients: IngredientInput[], servings: number) {
    setLoading(true)
    setError('')
    try {
      const data = calculateRecipe(ingredients, servings)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleLoaded(ingredients: ParsedIngredient[]) {
    setPrefill(ingredients)
    setMode('manual')
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Disclaimer */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
        <span className="font-semibold">Demo version</span> — uses ~65 common Finnish and English foods.
        The full app has 23,000+ items (Fineli + Open Food Facts) and requires local database hosting.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">

        {/* Left panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex border-b border-gray-100">
            {(['demo', 'manual'] as InputMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 text-sm font-medium transition-colors rounded-t-2xl ${
                  mode === m
                    ? 'text-indigo-600 border-b-2 border-indigo-500 -mb-px bg-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {m === 'demo' ? 'Demo recipes' : 'Edit ingredients'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {mode === 'demo' ? (
              <DemoRecipePicker onLoaded={handleLoaded} />
            ) : (
              <RecipeInput
                onCalculate={handleCalculate}
                loading={loading}
                prefill={prefill}
              />
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!result && !error && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[449px] flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-3">🥗</div>
              <p className="text-sm text-gray-400">Your macro breakdown will appear here</p>
              <p className="text-xs text-gray-300 mt-1">Calories · Protein · Carbs · Fat</p>
            </div>
          )}

          {result && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <MacroSummary
                  total={result.total}
                  perServing={result.per_serving}
                  servings={result.servings}
                />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <MacroChart totals={result.total} />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <IngredientTable ingredients={result.ingredients} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
