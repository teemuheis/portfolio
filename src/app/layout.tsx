import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Teemu Heiskanen — Integration Engineer',
  description:
    'Portfolio of Teemu Heiskanen: API integrations, automation systems, and developer tooling. Featuring live Strava activity data.',
  openGraph: {
    title: 'Teemu Heiskanen — Integration Engineer',
    description: 'API integrations, automation, and developer tooling.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="bg-[#050505] text-white">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
