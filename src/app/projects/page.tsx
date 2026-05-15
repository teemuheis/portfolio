import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Projects — Teemu Heiskanen',
  description: 'Portfolio projects and live demos.',
}

interface Project {
  title: string
  desc: string
  href: string
  external: boolean
  label: string
  tags: string[]
}

const PROJECTS: Project[] = [
  {
    title: 'Food Bank Nutrition Calculator',
    desc: 'Web app for bulk recipe macro calculation using a 23k+ food database (Fineli + Open Food Facts) with Finnish recipe parsing and vector search.',
    href: '/projects/food-bank',
    external: false,
    label: 'Live demo →',
    tags: ['React', 'Python', 'SQLite', 'Vector search'],
  },
  {
    title: 'Config Driven Request Builder',
    desc: 'CLI parser that extracts deeply nested API request definitions and transforms them into Bruno collections — reducing manual collection setup from hours to seconds.',
    href: 'https://github.com/teemuheis',
    external: true,
    label: 'GitHub →',
    tags: ['Python', 'CLI', 'Bruno', 'API tooling'],
  },
  {
    title: 'AI Food Recognition Workflow',
    desc: 'Telegram bot using image recognition and macro estimation pipelines. Photo in → structured nutrition data out, logged to a spreadsheet.',
    href: 'https://github.com/teemuheis',
    external: true,
    label: 'GitHub →',
    tags: ['n8n', 'OpenAI', 'Telegram', 'SQLite'],
  },
  {
    title: 'Portfolio Landing Page',
    desc: 'This site — built with Next.js, Leaflet, and Framer Motion. Pulls live Strava data server-side; secrets never touch the browser.',
    href: 'https://github.com/teemuheis/portfolio',
    external: true,
    label: 'GitHub →',
    tags: ['Next.js', 'TypeScript', 'Leaflet', 'Strava API'],
  },
]

export default function ProjectsPage() {
  const cardClass = "group rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 hover:border-orange-500/20 hover:shadow-[0_0_30px_rgba(255,140,0,0.06)] transition-all block"

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <nav className="px-6 py-5 flex items-center gap-3 border-b border-white/5">
        <Link href="/" className="text-sm text-white/40 hover:text-white/80 transition-colors">
          ← Home
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/70 font-medium">Projects</span>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-orange-300 uppercase tracking-[0.25em] text-sm mb-4">Featured Work</p>
          <h1 className="text-4xl font-bold">Projects &amp; Experiments</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {PROJECTS.map((project) => {
            const inner = (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-400 shadow-[0_0_16px_rgba(255,140,0,0.8)]" />
                  <span className="text-sm text-white/30 group-hover:text-orange-200 transition-colors">
                    {project.label}
                  </span>
                </div>
                <h2 className="text-xl font-semibold mb-3">{project.title}</h2>
                <p className="text-white/55 leading-relaxed text-sm mb-5">{project.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/8 text-xs text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )

            return project.external ? (
              <a key={project.title} href={project.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                {inner}
              </a>
            ) : (
              <Link key={project.title} href={project.href} className={cardClass}>
                {inner}
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
