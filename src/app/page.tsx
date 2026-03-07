import InteractiveProjectTree from '@/components/InteractiveProjectTree';
import HeroTyping from '@/components/HeroTyping';
import CopyEmail from '@/components/CopyEmail';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950">
      {/* Hero Section */}
      <section className="relative z-20 pt-24 pb-12 md:pt-32 md:pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-widest uppercase mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Software Studio / Saarijärvi
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-slate-100 mb-6 drop-shadow-sm italic">
            Koivu <span className="text-teal-400">Labs</span>
          </h1>

          <HeroTyping />

          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:hello@koivulabs.com"
              className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Contact Studio
            </a>
            <a
              href="/logbook"
              className="px-8 py-3 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-800 transition-all duration-300"
            >
              Founder's Log
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 px-6 md:px-12 lg:px-24 pb-12">
        <div className="max-w-7xl mx-auto border-y border-slate-800/50 py-6 flex flex-wrap gap-8 md:gap-16">
          {[
            { value: '8', label: 'Active Projects' },
            { value: 'Est. 2026', label: 'Founded' },
            { value: 'Saarijärvi', label: 'Finland' },
            { value: 'AI-First', label: 'Methodology' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-teal-400 font-black text-lg">{stat.value}</div>
              <div className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Tech-Tree v1.4 */}
      <section id="lab" className="relative z-10 px-6 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-sm font-bold tracking-[0.5em] text-slate-500 uppercase mb-2">Technical Ecosystem</h2>
              <p className="text-2xl text-slate-100 font-light italic">The Birch Tech-Tree <span className="text-teal-400">v1.5</span></p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed uppercase tracking-widest opacity-60 font-medium">
                Mapping 8 strategic project missions across the neural birch structure.
              </p>
            </div>
          </div>

          <InteractiveProjectTree />
        </div>
      </section>

      {/* What We Build */}
      <section className="relative z-10 px-6 py-20 md:py-32 md:px-12 lg:px-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-sm font-bold tracking-[0.5em] text-slate-500 uppercase mb-2">Studio Services</h2>
            <p className="text-2xl text-slate-100 font-light italic">Three modes of <span className="text-teal-400">operation</span></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Build', desc: 'AI-first web applications and digital tools. We ship fast, we ship right.' },
              { n: '02', title: 'Consult', desc: 'Digital strategy and AI integration. Concrete recommendations, no hype.' },
              { n: '03', title: 'Experiment', desc: 'Applied research and rapid prototyping. Fail cheaply, learn quickly.' },
            ].map(s => (
              <div key={s.n} className="tree-glass p-8 group hover:border-teal-500/30 transition-all duration-500">
                <span className="text-teal-400/20 font-black text-3xl block mb-4">{s.n}</span>
                <h3 className="text-xl font-bold italic text-slate-100 group-hover:text-teal-400 transition-colors mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-right">
            <a href="/services" className="text-teal-400 text-xs font-bold tracking-widest uppercase hover:underline">
              Full Services Overview →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-slate-800/50 text-center">
        <div className="flex justify-center gap-5 mb-6">
          <a href="https://github.com/koivulabs" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-slate-700 hover:text-slate-400 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
          </a>
          <a href="https://x.com/koivu_labs" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="text-slate-700 hover:text-slate-400 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a href="https://www.linkedin.com/in/keijo-koivunen-ab333a3b2/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-700 hover:text-slate-400 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </a>
          <a href="/rss.xml" aria-label="RSS Feed" className="text-slate-700 hover:text-teal-500 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" /></svg>
          </a>
        </div>
        <div className="flex justify-center gap-6 mb-4 text-slate-500 text-xs font-bold tracking-widest uppercase">
          <a href="/registry" className="hover:text-teal-400 transition-colors">The Registry</a>
          <a href="/privacy" className="hover:text-teal-400 transition-colors">Privacy</a>
          <a href="/admin/login" className="hover:text-teal-400 transition-colors">Lab Access</a>
        </div>
        <p className="text-slate-600 text-[10px] tracking-tight">
          &copy; {new Date().getFullYear()} KOIVU LABS. BUILT WITH NORDIC PRECISION.
        </p>
      </footer>

      {/* Background Decorative Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-teal-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px]" />
      </div>
    </main>
  );
}