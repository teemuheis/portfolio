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

interface Prefill {
  ingredients: ParsedIngredient[]
  servings: number
}

export default function FoodBankDemo() {
  const [mode, setMode] = useState<InputMode>('demo')
  const [prefill, setPrefill] = useState<Prefill | undefined>()
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

  function handleLoaded(ingredients: ParsedIngredient[], servings: number) {
    setPrefill({ ingredients, servings })
    setMode('manual')
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Disclaimer */}
      <div className="mb-6 rounded-xl border border-[#7ab893]/20 bg-[#7ab893]/[0.06] px-4 py-2.5 text-xs text-[#7ab893]/75">
        <span className="font-semibold text-[#7ab893]">Demo</span> — uses ~65 hardcoded foods.
        Full version has 23,000+ items (Fineli + Open Food Facts) and requires local database hosting.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">

        {/* Left panel */}
        <div className="rounded-2xl border border-[#7ab893]/15 bg-[#7ab893]/[0.04]">
          <div className="flex border-b border-[#7ab893]/10">
            {(['demo', 'manual'] as InputMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors rounded-t-2xl ${
                  mode === m
                    ? 'text-[#7ab893] border-b-2 border-[#7ab893] -mb-px'
                    : 'text-[#7ab893]/30 hover:text-[#7ab893]/60'
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
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-[#c07a5a]/20 bg-[#c07a5a]/[0.06] px-4 py-3 text-sm text-[#c07a5a]">
              {error}
            </div>
          )}

          {!result && !error && (
            <div className="rounded-2xl border border-[#7ab893]/15 bg-[#7ab893]/[0.04] min-h-[440px] flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-[#7ab893]/10 border border-[#7ab893]/20 flex items-center justify-center mb-4 text-2xl">
                🍵
              </div>
              <p className="text-[#dcefd5]/50 text-sm font-medium">Your macro breakdown will appear here</p>
              <p className="text-[#7ab893]/25 text-xs mt-1.5">Pick a demo recipe → Load recipe → Calculate macros</p>
            </div>
          )}

          {result && (
            <>
              <div className="rounded-2xl border border-[#7ab893]/15 bg-[#7ab893]/[0.04] p-6">
                <MacroSummary
                  total={result.total}
                  perServing={result.per_serving}
                  servings={result.servings}
                />
              </div>
              <div className="rounded-2xl border border-[#7ab893]/15 bg-[#7ab893]/[0.04] p-6">
                <MacroChart totals={result.total} />
              </div>
              <div className="rounded-2xl border border-[#7ab893]/15 bg-[#7ab893]/[0.04] p-6">
                <IngredientTable ingredients={result.ingredients} servings={result.servings} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
