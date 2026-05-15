import type { Metadata } from 'next'
import Link from 'next/link'
import FoodBankDemoLoader from './FoodBankDemoLoader'

export const metadata: Metadata = {
  title: 'Food Bank Nutrition Calculator — Demo',
  description: 'Recipe macro calculator demo with Finnish and English ingredient support. Full version uses 23,000+ foods from Fineli and Open Food Facts.',
}

export default function FoodBankPage() {
  return (
    <div className="min-h-screen bg-[#0b120a]">
      <nav className="border-b border-[#7ab893]/10 px-6 py-4 flex items-center gap-3">
        <Link
          href="/projects"
          className="text-sm text-[#7ab893]/50 hover:text-[#7ab893]/90 transition-colors"
        >
          ← Projects
        </Link>
        <span className="text-[#7ab893]/20">/</span>
        <span className="text-sm text-[#dcefd5]/60 font-medium">Food Bank Calculator</span>
      </nav>
      <FoodBankDemoLoader />
    </div>
  )
}
