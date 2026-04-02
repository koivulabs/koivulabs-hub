import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'References | Koivu Labs',
    description: 'Client work and references by Koivu Labs. Websites, AI integrations, and digital tools built for Finnish businesses.',
};

const references = [
    {
        name: 'Mystical La Luna',
        tagline: 'Mystical lifestyle & esoteric products',
        description: 'A brand-crafted website for a mystical lifestyle business. Built with atmospheric design, product presentation, and a tone that matches the brand\'s ethereal identity. Clean structure, fast performance, and mobile-first.',
        url: 'https://mysticalaluna.vercel.app',
        services: ['Website Design & Build', 'Brand-aligned UI', 'Mobile Optimization', 'Hosting & Deployment'],
        tech: ['Next.js', 'Tailwind CSS', 'Vercel'],
        year: '2026',
        comingSoon: true,
    },
    {
        name: 'Karhun Kattila',
        tagline: 'Artisan food & Finnish culture',
        description: 'A website for a small artisan food brand rooted in Finnish tradition. The design reflects warmth, authenticity, and handcrafted quality. Built for clarity and ease of use, with integrated content management.',
        url: 'https://karhunkattila.vercel.app',
        services: ['Website Design & Build', 'Content Structure', 'SEO Foundation', 'Hosting & Deployment'],
        tech: ['Next.js', 'Firebase', 'Tailwind CSS'],
        year: '2026',
        comingSoon: true,
    },
];

export default function ReferencesPage() {
    return (
        <main className="min-h-screen pt-32 pb-32 px-6 md:px-12 lg:px-24 bg-slate-950">
            <div className="max-w-5xl mx-auto">
                <header className="mb-24">
                    <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                        Client Work
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 mb-6 italic">
                        Refer<span className="text-teal-400">ences</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl">
                        Real projects for real clients. Every site shipped with Nordic precision and AI-first methodology.
                    </p>
                </header>

                <div className="space-y-8">
                    {references.map((ref, i) => (
                        <section
                            key={ref.name}
                            className="relative tree-glass p-8 md:p-12 group hover:border-teal-500/30 transition-all duration-500 overflow-hidden"
                        >
                            {/* "To Be Released" overlay */}
                            {ref.comingSoon && (
                                <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                                    <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase">
                                        To Be Released
                                    </span>
                                    <p className="text-slate-500 text-sm max-w-xs text-center">
                                        This case study is being finalized with the client.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                                {/* Left: Info */}
                                <div className="lg:col-span-2">
                                    <div className="flex items-baseline gap-4 mb-4">
                                        <span className="text-teal-400/20 font-black text-4xl">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <div>
                                            <h2 className="text-3xl font-bold italic text-slate-100 group-hover:text-teal-400 transition-colors">
                                                {ref.name}
                                            </h2>
                                            <p className="text-[10px] text-teal-400/60 font-bold tracking-[0.3em] uppercase mt-1">
                                                {ref.tagline}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed mb-6">
                                        {ref.description}
                                    </p>
                                    {!ref.comingSoon && (
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-teal-500/20 transition-all"
                                        >
                                            Visit Site
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                                            </svg>
                                        </a>
                                    )}
                                </div>

                                {/* Right: Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3">Services Delivered</h3>
                                        <ul className="space-y-2">
                                            {ref.services.map((s) => (
                                                <li key={s} className="flex items-center gap-3 text-slate-300 text-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3">Tech Stack</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {ref.tech.map((t) => (
                                                <span key={t} className="px-2.5 py-1 bg-slate-800 text-slate-400 text-[10px] rounded-md border border-slate-700 font-medium">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">Year</h3>
                                        <p className="text-slate-300 text-sm font-medium">{ref.year}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-24 p-8 md:p-12 tree-glass border-teal-500/20 nordic-glow text-center">
                    <h2 className="text-3xl font-bold italic text-slate-100 mb-3">
                        Want to be next?
                    </h2>
                    <p className="text-slate-400 max-w-lg mx-auto mb-8">
                        We build fast, we build right. If you need a website, AI integration, or digital tool — let&apos;s talk.
                    </p>
                    <a
                        href="mailto:hello@koivulabs.com"
                        className="inline-block px-8 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Contact Studio
                    </a>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-slate-600 hover:text-teal-400 text-[10px] tracking-widest uppercase transition-colors">
                        &larr; Return to Hub
                    </Link>
                </div>
            </div>
        </main>
    );
}
