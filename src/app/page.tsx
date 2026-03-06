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

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-slate-800/50 text-center">
        <div className="flex justify-center gap-6 mb-4 text-slate-500 text-xs font-bold tracking-widest uppercase">
          <a href="/about" className="hover:text-teal-400 transition-colors">Manifesto</a>
          <a href="/registry" className="hover:text-teal-400 transition-colors">The Registry</a>
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