import Link from 'next/link'

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
    title: 'Food Bank Nutrition Calculator',
    desc: 'Web app for bulk recipe macro calculation using a 23k+ food database (Fineli + Open Food Facts) with Finnish recipe parsing and vector search.',
    href: '/projects/food-bank',
    external: false,
    label: 'Live demo →',
    tags: ['React', 'Python', 'SQLite', 'Vector search'],
  },
  {
    title: 'Portfolio Landing Page',
    desc: 'This site — built with Next.js, Leaflet, and Framer Motion. Pulls live Strava data server-side; secrets never touch the browser.',
    href: 'https://github.com/teemuheis',
    external: true,
    label: 'GitHub →',
    tags: ['Next.js', 'TypeScript', 'Leaflet', 'Strava API'],
  },
]

export default function Projects() {
  return (
    <section id="projects" className="relative z-10 px-6 md:px-10 py-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-orange-300 uppercase tracking-[0.25em] text-sm mb-4">Featured Work</p>
          <h3 className="text-4xl font-bold">Projects &amp; Experiments</h3>
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
                <h4 className="text-xl font-semibold mb-3">{project.title}</h4>
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

            const className = "group rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 hover:border-orange-500/20 hover:shadow-[0_0_30px_rgba(255,140,0,0.06)] transition-all block"

            return project.external ? (
              <a
                key={project.title}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            ) : (
              <Link key={project.title} href={project.href} className={className}>
                {inner}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
