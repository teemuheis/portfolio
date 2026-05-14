export default function Footer() {
  return (
    <footer id="contact" className="relative z-10 px-6 md:px-10 py-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div>
          <h4 className="text-3xl font-bold mb-3">Interested in working together?</h4>
          <p className="text-white/50 max-w-xl">
            Open to roles involving developer experience, integrations, automation systems and AI-enhanced workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:teemu.heiskanen@gmail.com"
            className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 transition-colors font-medium shadow-[0_0_40px_rgba(255,140,0,0.35)]"
          >
            Contact Me
          </a>
          <a
            href="https://github.com/teemuheis"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/80"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/teemu-heiskanen"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/80"
          >
            LinkedIn
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 text-center text-white/20 text-xs">
        Built with Next.js · Deployed on Vercel
      </div>
    </footer>
  )
}
