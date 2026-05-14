import { MOCK_DB } from './mockData'
import type { IngredientInput, IngredientResult, MacroTotals, ParseResult, RecipeResult } from './types'

function lookupIngredient(name: string, amount_g: number): IngredientResult {
  const query = name.toLowerCase().trim()
  const scale = amount_g / 100

  // Exact match
  if (query in MOCK_DB) {
    const entry = MOCK_DB[query]
    return {
      input: name,
      matched: entry.matched,
      amount_g,
      energy_kcal: round(entry.energy_kcal * scale),
      protein_g:   round(entry.protein_g   * scale),
      carbs_g:     round(entry.carbs_g     * scale),
      fat_g:       round(entry.fat_g       * scale),
      source: 'hardcoded',
      confidence: 'high',
    }
  }

  // Substring match — query word contained in a DB key or vice-versa
  const fuzzyKey = Object.keys(MOCK_DB).find(
    (k) => k.includes(query) || query.includes(k)
  )
  if (fuzzyKey) {
    const entry = MOCK_DB[fuzzyKey]
    return {
      input: name,
      matched: entry.matched,
      amount_g,
      energy_kcal: round(entry.energy_kcal * scale),
      protein_g:   round(entry.protein_g   * scale),
      carbs_g:     round(entry.carbs_g     * scale),
      fat_g:       round(entry.fat_g       * scale),
      source: 'hardcoded',
      confidence: 'low',
    }
  }

  return {
    input: name,
    matched: 'unknown',
    amount_g,
    energy_kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    source: 'unknown',
    confidence: 'low',
  }
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}

export function calculateRecipe(ingredients: IngredientInput[], servings: number): RecipeResult {
  const results: IngredientResult[] = ingredients.map((ing) =>
    lookupIngredient(ing.name, ing.amount_g)
  )

  const total: MacroTotals = { energy_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  for (const r of results) {
    total.energy_kcal += r.energy_kcal
    total.protein_g   += r.protein_g
    total.carbs_g     += r.carbs_g
    total.fat_g       += r.fat_g
  }
  for (const k of Object.keys(total) as (keyof MacroTotals)[]) {
    total[k] = round(total[k])
  }

  const per_serving: MacroTotals = {
    energy_kcal: round(total.energy_kcal / servings),
    protein_g:   round(total.protein_g   / servings),
    carbs_g:     round(total.carbs_g     / servings),
    fat_g:       round(total.fat_g       / servings),
  }

  return { servings, total, per_serving, ingredients: results }
}

// Minimal client-side line parser — handles common Finnish recipe formats.
// Handles: "400 g jauheliha", "2 dl maito", "1 rkl voi", "1 kananmuna"
export function parseRecipeText(text: string): ParseResult {
  const UNITS: Record<string, number> = {
    g: 1, kg: 1000,
    dl: 100, cl: 10, ml: 1, l: 1000,
    rkl: 15, tl: 5,
  }
  const DENSITY: Record<string, number> = {
    maito: 103, kerma: 100, piimä: 103, jogurtti: 103,
    öljy: 92, voi: 95,
    jauho: 60, vehnäjauho: 60,
    sokeri: 85, korppujauho: 50, kaura: 40,
  }
  const PIECES: Record<string, number> = {
    kananmuna: 60, muna: 60,
    sipuli: 80, porkkana: 80, peruna: 100,
    tomaatti: 100, omena: 150, banaani: 120,
  }

  const FRACTION: Record<string, number> = { '½': 0.5, '⅓': 0.333, '¼': 0.25, '¾': 0.75, '⅔': 0.667 }

  function parseQty(s: string): number {
    for (const [sym, val] of Object.entries(FRACTION)) {
      if (s.includes(sym)) {
        const prefix = s.replace(sym, '').trim()
        return (prefix ? parseFloat(prefix) || 0 : 0) + val
      }
    }
    return parseFloat(s.replace(',', '.')) || 1
  }

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const ingredients = []
  const unparsed = []

  for (const line of lines) {
    const m = line.match(
      /^([½⅓¼¾⅔\d.,]+(?:\s*[½⅓¼¾⅔])?)\s*(g|kg|dl|cl|ml|l|rkl|tl|kpl)\.?\s+(.+)/i
    )
    if (!m) {
      // Try "N kpl name" or just "N name" (piece count)
      const pieceMatch = line.match(/^(\d+)\s+(?:kpl\s+)?(.+)/i)
      if (pieceMatch) {
        const qty = parseFloat(pieceMatch[1]) || 1
        const ingName = pieceMatch[2].trim().toLowerCase()
        const pieceG = Object.entries(PIECES).find(([k]) => ingName.includes(k))?.[1]
        if (pieceG) {
          ingredients.push({ name: ingName, amount_g: round(qty * pieceG), original: line })
          continue
        }
      }
      unparsed.push(line)
      continue
    }

    const qty = parseQty(m[1])
    const unit = m[2].toLowerCase()
    const ingName = m[3].trim().toLowerCase()
    const mlPer = UNITS[unit] ?? 0

    let amount_g: number
    if (unit === 'g' || unit === 'kg') {
      amount_g = qty * mlPer
    } else if (unit === 'kpl') {
      const pieceG = Object.entries(PIECES).find(([k]) => ingName.includes(k))?.[1] ?? 100
      amount_g = qty * pieceG
    } else {
      // Volume unit — apply density
      const density = Object.entries(DENSITY).find(([k]) => ingName.includes(k))?.[1] ?? 100
      amount_g = qty * mlPer * (density / 100)
    }

    if (amount_g > 0) {
      ingredients.push({ name: ingName, amount_g: round(amount_g), original: line })
    } else {
      unparsed.push(line)
    }
  }

  return { ingredients, unparsed, method: 'regex' }
}
