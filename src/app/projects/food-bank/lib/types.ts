export interface IngredientInput {
  name: string
  amount_g: number
}

export interface IngredientResult {
  input: string
  matched: string
  amount_g: number
  energy_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  source: 'fineli' | 'usda' | 'usda_cached' | 'hardcoded' | 'off' | 'unknown'
  confidence: 'high' | 'low'
}

export interface MacroTotals {
  energy_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface ParsedIngredient {
  name: string
  amount_g: number
  original: string
}

export interface ParseResult {
  ingredients: ParsedIngredient[]
  unparsed: string[]
  method: 'claude' | 'regex'
}

export interface RecipeResult {
  servings: number
  total: MacroTotals
  per_serving: MacroTotals
  ingredients: IngredientResult[]
}

export interface DemoRecipe {
  name: string
  description: string
  servings: number
  ingredients: { name: string; amount_g: number }[]
}
