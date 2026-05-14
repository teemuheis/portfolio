const experience = [
  {
    title: 'Solutions Engineer',
    company: 'Vero Solutions',
    period: '2023 – Present',
    highlights: [
      'Built API integrations connecting CRMs, ERPs and automation platforms for enterprise clients',
      'Designed and deployed n8n workflow automation reducing manual ops work by 60%',
      'Led technical onboarding and solution scoping for SaaS implementations',
    ],
  },
  {
    title: 'Technical Support Lead',
    company: 'Vero Solutions',
    period: '2021 – 2023',
    highlights: [
      'Owned integration troubleshooting across REST APIs, webhooks and OAuth flows',
      'Built internal tooling (Python, Make.com) to automate ticket triage and reporting',
    ],
  },
]

const skills: Record<string, string[]> = {
  'APIs & Integrations': ['REST', 'OAuth 2.0', 'Webhooks', 'Bruno', 'Postman'],
  'Automation': ['n8n', 'Make.com', 'Python scripting', 'cron / systemd'],
  'AI Tooling': ['Claude Code', 'OpenAI API', 'Anthropic SDK', 'Prompt engineering'],
  'Frontend': ['TypeScript', 'React', 'Next.js', 'Tailwind CSS'],
  'Infrastructure': ['Docker', 'AWS (EC2, S3)', 'Nginx', 'Linux'],
}

export default function CV() {
  return (
    <section id="skills" className="relative z-10 px-6 md:px-10 py-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-orange-300 uppercase tracking-[0.25em] text-sm mb-4">Experience &amp; Skills</p>
          <h3 className="text-4xl font-bold">Background</h3>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-12">
          {/* Timeline */}
          <div className="relative pl-6 border-l border-orange-500/20 space-y-10">
            {experience.map((role) => (
              <div key={role.title} className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-[#050505]" />
                <p className="text-xs text-white/40 mb-1">{role.period}</p>
                <h4 className="text-xl font-semibold">{role.title}</h4>
                <p className="text-orange-300/80 text-sm mb-3">{role.company}</p>
                <ul className="space-y-1.5">
                  {role.highlights.map((h) => (
                    <li key={h} className="text-white/55 text-sm leading-relaxed flex gap-2">
                      <span className="text-orange-500/60 shrink-0 mt-1">—</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Skills grid */}
          <div className="space-y-6">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/70"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
