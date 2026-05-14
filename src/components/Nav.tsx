'use client'

export default function Nav() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6 border-b border-white/5 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold tracking-[0.2em] uppercase">Teemu Heiskanen</h1>
        <p className="text-sm text-white/40 mt-1">Solutions Engineer · API Integrations · Automation</p>
      </div>
      <nav className="hidden md:flex gap-8 text-sm text-white/60">
        {['Skills', 'Projects', 'Automation', 'Contact'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="hover:text-orange-300 transition-colors"
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  )
}
