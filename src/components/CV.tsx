const experience = [
  {
    title: 'Tech Lead',
    subtitle: 'Senior API Integration Engineer',
    company: 'Supermetrics',
    period: '2023 – Present',
    highlights: [
      'Leads discovery phase — translating ambiguous business requirements into integration architecture and technical roadmaps before development begins',
      'Designed and shipped two production platforms: a connector feasibility pipeline (cut a 1–2 day manual process to hours) and a four-agent bug investigation pipeline',
      'Owns architectural decisions across two teams — aligning internal stakeholders, managing technical standards, and ensuring cross-functional delivery stays unblocked',
      'Upskilling engineers through mentoring and code reviews; running beta validation sessions against real user workflows before full rollout',
    ],
  },
  {
    title: 'Connector Specialist',
    company: 'Supermetrics',
    period: '2022 – 2023',
    highlights: [
      'Implementing connectors and features to specification; bug fixes, security improvements, and PR reviews',
    ],
  },
  {
    title: 'Lead Technical Support Specialist',
    company: 'Supermetrics',
    period: '2019 – 2022',
    highlights: [
      'Debugging BigQuery and Snowflake integrations at enterprise scale; bridging customer success and R&D to resolve critical data pipeline issues',
      'Single point of contact for the most complex integration failures — diagnosing root cause across the full stack and coordinating fix delivery',
    ],
  },
  {
    title: 'Hardware Integrations & Tech Support',
    company: 'Virta',
    period: '2017 – 2019',
    highlights: [
      'Technical point of contact for energy companies, retailers, and parking operators on EV charging infrastructure — from requirements through go-live',
      'Testing and integrating EV charging hardware using OCPP; protocol-level debugging between hardware and cloud platform in a production environment',
    ],
  },
  {
    title: 'Project Specialist',
    company: 'Saimaa UAS',
    period: '2015 – 2017',
    highlights: [
      'Led commercialisation of electric motor innovations and conducted technical market research',
    ],
  },
]

const skills: Record<string, string[]> = {
  'Solution Ownership': ['Solution Discovery', 'Technical roadmaps', 'Stakeholder coordination', 'Vendor management', 'Project delivery'],
  'Integration & Architecture': ['API integration', 'System architecture', 'REST APIs', 'Google Cloud / BigQuery', 'Snowflake'],
  'Leadership & Delivery': ['Team leadership', 'Cross-functional delivery', 'Mentoring', 'User adoption', 'KPI & reporting'],
}

const education = {
  institution: 'LUT University, Lappeenranta',
  degree: 'Bachelor of Science, Industrial Management',
  period: '2010 – 2014',
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
              <div key={`${role.title}-${role.period}`} className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-[#050505]" />
                <p className="text-xs text-white/40 mb-1">{role.period}</p>
                <h4 className="text-xl font-semibold">{role.title}</h4>
                <p className="text-orange-300/80 text-sm mb-1">{role.company}</p>
                {'subtitle' in role && (
                  <p className="text-white/30 text-xs italic mb-2">{role.subtitle}</p>
                )}
                <ul className="space-y-1.5 mt-2">
                  {role.highlights.map((h) => (
                    <li key={h} className="text-white/55 text-sm leading-relaxed flex gap-2">
                      <span className="text-orange-500/60 shrink-0 mt-1">—</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Education */}
            <div className="relative">
              <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-white/20 ring-4 ring-[#050505]" />
              <p className="text-xs text-white/40 mb-1">{education.period}</p>
              <h4 className="text-base font-semibold">{education.degree}</h4>
              <p className="text-white/40 text-sm">{education.institution}</p>
            </div>
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
