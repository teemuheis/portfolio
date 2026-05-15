import type { Metadata } from 'next'
import Link from 'next/link'
import FoodBankDemoLoader from './FoodBankDemoLoader'

export const metadata: Metadata = {
  title: 'Food Bank Nutrition Calculator — Demo',
  description: 'Recipe macro calculator demo with Finnish and English ingredient support. Full version uses 23,000+ foods from Fineli and Open Food Facts.',
}

export default function FoodBankPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <Link
          href="/projects"
          className="text-sm text-white/40 hover:text-white/80 transition-colors"
        >
          ← Projects
        </Link>
        <span className="text-white/15">/</span>
        <span className="text-sm text-white/60 font-medium">Food Bank Calculator</span>
      </nav>
      <FoodBankDemoLoader />
    </div>
  )
}
