import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Now | Koivu Labs',
    description: 'What Koivu Labs is working on right now. A snapshot of current projects, learning, and location.',
};

const updated = 'March 2026';

export default function NowPage() {
    return (
        <main className="min-h-screen pt-32 pb-32 px-6 md:px-12 lg:px-24 bg-slate-950">
            <div className="max-w-2xl mx-auto">
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                        Updated {updated}
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold italic text-slate-100 mb-4">
                        Now
                    </h1>
                    <p className="text-slate-600 text-xs leading-relaxed">
                        A living snapshot of what's happening at the lab. Inspired by{' '}
                        <a href="https://nownownow.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-400 transition-colors">
                            nownownow.com
                        </a>.
                    </p>
                </header>

                <div className="space-y-14 text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">Building</h2>
                        <ul className="space-y-4">
                            {[
                                'Koivu Labs Hub — the studio portal you\'re looking at. Features shipping week by week.',
                                'BrainBuffer — working on voice-to-text latency. The gap between thought and storage should be zero.',
                                'Learning Firebase security rules properly. No shortcuts.',
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <span className="text-teal-400/30 font-black mt-0.5 shrink-0">—</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">Learning</h2>
                        <ul className="space-y-4">
                            {[
                                'Next.js App Router — server components, middleware, edge functions.',
                                'TypeScript — fewer any types every week.',
                                'How to ask AI the right questions, not just accept the first answer.',
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <span className="text-teal-400/30 font-black mt-0.5 shrink-0">—</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">Location</h2>
                        <p>Northern Central Finland. Quiet. The kind of quiet that makes it easy to focus.</p>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">Reading</h2>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <span className="text-teal-400/30 font-black mt-0.5 shrink-0">—</span>
                                <span>Documentation. More documentation. Occasionally something that isn't documentation.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">Not doing</h2>
                        <ul className="space-y-4">
                            {[
                                'Pretending to know more than I do.',
                                'Waiting until things are perfect before shipping.',
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <span className="text-teal-400/30 font-black mt-0.5 shrink-0">—</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-800/50 flex justify-between items-center">
                    <Link href="/" className="text-slate-600 hover:text-teal-400 text-[10px] tracking-widest uppercase transition-colors">
                        ← Return to Hub
                    </Link>
                    <span className="text-slate-800 text-[10px] tracking-widest uppercase font-bold">{updated}</span>
                </div>
            </div>
        </main>
    );
}
