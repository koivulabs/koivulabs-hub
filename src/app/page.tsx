import Link from 'next/link';
import Reveal from '@/components/Reveal';
import Magnetic from '@/components/MagneticLink';

const work = [
  { name: 'Mystical La Luna', meta: 'Brand site · 2026' },
  { name: 'Karhun Kattila', meta: 'Artisan food · 2026' },
];

const services = [
  { n: '01', title: 'Build', desc: 'Websites, web applications and internal tools. Designed, built and deployed — end to end.' },
  { n: '02', title: 'Consult', desc: 'Digital strategy and AI integration. Concrete recommendations, no hype.' },
  { n: '03', title: 'Experiment', desc: 'Rapid prototyping to validate an idea before committing to it.' },
];

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 px-6 md:px-12">
        <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.35em] uppercase text-teal-400 mb-8">
            Software Studio — Saarijärvi, Finland
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-slate-100 leading-[1.05] mb-8">
            Real tools, built for{' '}
            <em className="serif-display font-normal text-teal-400">real clients.</em>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-xl">
            Websites and AI integrations for Finnish businesses.
            No hype — shipped work.
          </p>
          <div className="mt-12">
            <Magnetic>
              <a
                href="mailto:hello@koivulabs.com"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-teal-500/40 text-teal-400 text-xs font-bold tracking-[0.22em] uppercase hover:border-teal-400 hover:bg-teal-500/10 transition-colors backdrop-blur-sm"
              >
                Start a project
                <span aria-hidden="true">→</span>
              </a>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* Selected Work */}
      <section className="px-6 md:px-12 pb-24 md:pb-36">
        <Reveal className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-[11px] font-bold tracking-[0.35em] uppercase text-slate-500">
              Selected Work
            </h2>
            <Link
              href="/references"
              className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 hover:text-teal-400 transition-colors"
            >
              All work →
            </Link>
          </div>
          <div className="border-t border-slate-800">
            {work.map(item => (
              <Link
                key={item.name}
                href="/references"
                className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6 py-7 border-b border-slate-800 transition-colors"
              >
                <span className="text-2xl md:text-3xl font-medium tracking-tight text-slate-200 group-hover:text-teal-400 transition-colors">
                  {item.name}
                </span>
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-600 group-hover:text-slate-400 transition-colors shrink-0">
                  {item.meta}
                  <span className="inline-block ml-3 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Services */}
      <section className="px-6 md:px-12 pb-24 md:pb-36">
        <Reveal className="max-w-5xl mx-auto" delay={0.1}>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-[11px] font-bold tracking-[0.35em] uppercase text-slate-500">
              Services
            </h2>
            <Link
              href="/services"
              className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 hover:text-teal-400 transition-colors"
            >
              Details →
            </Link>
          </div>
          <div className="border-t border-slate-800">
            {services.map(s => (
              <div
                key={s.n}
                className="grid grid-cols-[3rem_1fr] md:grid-cols-[6rem_14rem_1fr] gap-x-4 py-7 border-b border-slate-800 items-baseline"
              >
                <span className="text-[11px] font-bold tracking-[0.25em] text-teal-400/60">{s.n}</span>
                <h3 className="text-xl md:text-2xl font-medium tracking-tight text-slate-200">{s.title}</h3>
                <p className="col-span-2 md:col-span-1 col-start-2 md:col-start-3 text-sm text-slate-500 leading-relaxed max-w-md mt-1 md:mt-0">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Contact */}
      <section className="px-6 md:px-12 pb-28 md:pb-40">
        <Reveal className="max-w-5xl mx-auto">
          <p className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-100 leading-tight max-w-2xl mb-10">
            Have a project in mind?{' '}
            <em className="serif-display font-normal text-slate-500">Let&rsquo;s keep it simple.</em>
          </p>
          <Magnetic>
            <a
              href="mailto:hello@koivulabs.com"
              className="inline-flex items-baseline gap-3 text-lg md:text-xl text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              hello@koivulabs.com
              <span className="text-sm" aria-hidden="true">→</span>
            </a>
          </Magnetic>
        </Reveal>
      </section>
    </main>
  );
}
