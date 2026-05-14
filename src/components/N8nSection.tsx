import type { DiagramData } from '@/types/n8n'
import N8nDiagram from './N8nDiagram'

interface Props {
  diagrams: DiagramData[]
}

export default function N8nSection({ diagrams }: Props) {
  return (
    <section id="automation" className="relative z-10 px-6 md:px-10 py-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-orange-300 uppercase tracking-[0.25em] text-sm mb-4">Automation</p>
          <h3 className="text-4xl font-bold">n8n Workflows</h3>
          <p className="text-white/50 mt-3 max-w-xl">
            Production workflows I&apos;ve built — from AI-powered food recognition to automated job-search pipelines.
          </p>
        </div>

        {diagrams.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {diagrams.map((d) => (
              <N8nDiagram key={d.name} diagram={d} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-10 text-center">
            <p className="text-white/30 text-sm">Workflow diagrams coming soon.</p>
          </div>
        )}
      </div>
    </section>
  )
}
