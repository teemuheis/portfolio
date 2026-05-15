import { useState, useEffect } from 'react'
import type { IngredientInput, ParsedIngredient } from '../lib/types'

interface Row {
  name: string
  amount_g: string
}

interface Props {
  onCalculate: (ingredients: IngredientInput[], servings: number) => void
  loading: boolean
  prefill?: ParsedIngredient[]
}

export function RecipeInput({ onCalculate, loading, prefill }: Props) {
  const [rows, setRows] = useState<Row[]>([{ name: '', amount_g: '' }])
  const [servings, setServings] = useState('1')
  const [error, setError] = useState('')

  useEffect(() => {
    if (prefill && prefill.length > 0) {
      setRows(prefill.map((p) => ({ name: p.name, amount_g: String(p.amount_g) })))
    }
  }, [prefill])

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, { name: '', amount_g: '' }])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const valid = rows.filter((r) => r.name.trim() && parseFloat(r.amount_g) > 0)
    if (valid.length === 0) {
      setError('Add at least one ingredient with a name and amount.')
      return
    }

    const srv = Math.max(1, parseInt(servings) || 1)
    onCalculate(
      valid.map((r) => ({ name: r.name.trim(), amount_g: parseFloat(r.amount_g) })),
      srv
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ingredient (e.g. kananmuna, chicken breast)"
              value={row.name}
              onChange={(e) => updateRow(i, 'name', e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="relative">
              <input
                type="number"
                placeholder="100"
                min="0.1"
                step="any"
                value={row.amount_g}
                onChange={(e) => updateRow(i, 'amount_g', e.target.value)}
                className="w-24 rounded-lg border border-gray-200 px-3 py-2 pr-8 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">g</span>
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              className="p-2 text-gray-400 hover:text-red-400 disabled:opacity-30 transition-colors"
              aria-label="Remove ingredient"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
      >
        + Add ingredient
      </button>

      <div className="flex items-center gap-3 pt-1">
        <label className="text-sm text-gray-500">Servings:</label>
        <input
          type="number"
          min="1"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          className="w-16 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-700 px-4 py-2.5 text-base font-semibold text-white hover:bg-indigo-800 disabled:opacity-60 transition-colors"
      >
        {loading ? 'Calculating…' : 'Calculate macros'}
      </button>
    </form>
  )
}
