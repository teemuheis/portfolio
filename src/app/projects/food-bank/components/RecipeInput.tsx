'use client'
import { useState, useEffect, useRef } from 'react'
import type { IngredientInput, ParsedIngredient } from '../lib/types'

interface Prefill {
  ingredients: ParsedIngredient[]
  servings: number
}

interface Row {
  name: string
  amount_g: string
}

interface Props {
  onCalculate: (ingredients: IngredientInput[], servings: number) => void
  loading: boolean
  prefill?: Prefill
}

function scaleAmount(raw: string, scale: number): string {
  const n = parseFloat(raw)
  if (isNaN(n) || n <= 0) return raw
  return String(Math.round(n * scale * 10) / 10)
}

export function RecipeInput({ onCalculate, loading, prefill }: Props) {
  const [rows, setRows] = useState<Row[]>([{ name: '', amount_g: '' }])
  const [servings, setServings] = useState(1)
  const [error, setError] = useState('')

  // Stable refs so the servings effect reads current values without stale closures
  const rowsRef = useRef(rows)
  rowsRef.current = rows
  const onCalculateRef = useRef(onCalculate)
  onCalculateRef.current = onCalculate
  // Whether the user has clicked Calculate at least once (gates auto-recalculate)
  const hasCalculated = useRef(false)
  // Previous servings value — used to compute proportional scale factor
  const prevServingsRef = useRef(1)

  useEffect(() => {
    if (!prefill) return
    setRows(prefill.ingredients.map((p) => ({ name: p.name, amount_g: String(p.amount_g) })))
    setServings(prefill.servings)
    prevServingsRef.current = prefill.servings
    hasCalculated.current = false // require fresh Calculate click for new recipe
  }, [prefill])

  useEffect(() => {
    const prev = prevServingsRef.current
    prevServingsRef.current = servings

    // Before first manual calculation: keep prevServings in sync but do nothing else
    if (!hasCalculated.current || prev === servings) return

    const scale = servings / prev
    const scaledRows = rowsRef.current.map((r) =>
      r.name.trim() ? { ...r, amount_g: scaleAmount(r.amount_g, scale) } : r
    )
    setRows(scaledRows)

    const valid = scaledRows.filter((r) => r.name.trim() && parseFloat(r.amount_g) > 0)
    if (valid.length === 0) return
    onCalculateRef.current(
      valid.map((r) => ({ name: r.name.trim(), amount_g: parseFloat(r.amount_g) })),
      servings
    )
  }, [servings])

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

    hasCalculated.current = true
    prevServingsRef.current = servings // baseline for future scaling
    onCalculate(
      valid.map((r) => ({ name: r.name.trim(), amount_g: parseFloat(r.amount_g) })),
      servings
    )
  }

  const inputClass =
    'rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-orange-500/60 focus:border-orange-500/40 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="jauheliha, chicken breast…"
              value={row.name}
              onChange={(e) => updateRow(i, 'name', e.target.value)}
              className={`flex-1 ${inputClass}`}
            />
            <div className="relative">
              <input
                type="number"
                placeholder="100"
                min="0.1"
                step="any"
                value={row.amount_g}
                onChange={(e) => updateRow(i, 'amount_g', e.target.value)}
                className={`w-24 pr-7 ${inputClass}`}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-white/30">g</span>
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              className="p-2 text-white/25 hover:text-red-400 disabled:opacity-20 transition-colors"
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
        className="text-sm text-orange-400/70 hover:text-orange-300 font-medium transition-colors"
      >
        + Add ingredient
      </button>

      {/* Servings stepper — clicking +/- scales ingredient amounts proportionally */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-sm text-white/40">Servings</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.10] transition-colors text-sm leading-none"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold text-white tabular-nums">{servings}</span>
          <button
            type="button"
            onClick={() => setServings((s) => s + 1)}
            className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.10] transition-colors text-sm leading-none"
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Calculating…' : 'Calculate macros'}
      </button>
    </form>
  )
}
