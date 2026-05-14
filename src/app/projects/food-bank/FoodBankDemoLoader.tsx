'use client'
import dynamic from 'next/dynamic'

// ssr:false must live in a client component in Next.js 16+
const FoodBankDemo = dynamic(() => import('./FoodBankDemo'), { ssr: false })

export default function FoodBankDemoLoader() {
  return <FoodBankDemo />
}
