import InteractiveProjectTree from '@/components/InteractiveProjectTree';

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

          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed mb-8">
            Pragmatic Intelligence. Bridging human common sense with AI power.
          </p>

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
            { value: '7', label: 'Active Projects' },
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
              <p className="text-2xl text-slate-100 font-light italic">The Birch Tech-Tree <span className="text-teal-400">v1.4</span></p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed uppercase tracking-widest opacity-60 font-medium">
                Mapping 7 strategic project missions across the neural birch structure.
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
        <div className="flex justify-center gap-6 mb-4 text-slate-500 text-xs font-bold tracking-widest uppercase">
          <a href="/about" className="hover:text-teal-400 transition-colors">Manifesto</a>
          <a href="/registry" className="hover:text-teal-400 transition-colors">The Registry</a>
          <a href="/services" className="hover:text-teal-400 transition-colors">Services</a>
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