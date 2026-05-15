import type { Metadata } from 'next'
import Link from 'next/link'
import FoodBankDemoLoader from './FoodBankDemoLoader'

export const metadata: Metadata = {
  title: 'Food Bank Nutrition Calculator — Demo',
  description: 'Recipe macro calculator demo with Finnish and English ingredient support. Full version uses 23,000+ foods from Fineli and Open Food Facts.',
}

export default function FoodBankPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <Link
          href="/projects"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Projects
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-600 font-medium">Food Bank Calculator</span>
      </nav>
      <FoodBankDemoLoader />
    </div>
  )
}
