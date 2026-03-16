import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import CopyEmail from '@/components/CopyEmail';

export const metadata: Metadata = {
    title: 'Manifesto | Koivu Labs',
    description: 'A software studio from Saarijärvi, Finland. Rooted in Nordic precision, powered by modern intelligence. The story of Koivu Labs and its founder.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-24 pb-32 px-6 md:px-12 lg:px-24 bg-slate-950">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors mb-16 uppercase tracking-widest text-xs font-bold">
                ← Return to Hub
            </Link>

            <div className="max-w-4xl mx-auto">
                <div className="mb-20">
                    <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                        Manifesto v1.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 mb-6 italic">
                        About <span className="text-teal-400">Koivu Labs</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light leading-relaxed">
                        A software studio from Saarijärvi, Finland.
                        Rooted in Nordic precision, powered by modern intelligence.
                    </p>
                </div>

                <div className="space-y-20">
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-slate-100 italic">Strategic Context</h2>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                            Koivu Labs isn't just a development studio — it's a pragmatic laboratory. We work at the intersection of human common sense and AI capability. Our goal is to build tools that actually work: solving real problems with minimal friction and maximum execution speed.
                        </p>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                            We don't overcomplicate. We don't over-engineer. We ship, measure, and improve.
                        </p>
                    </section>

                    <section className="p-12 tree-glass border-teal-500/20 nordic-glow">
                        <h2 className="text-2xl font-bold text-teal-400 mb-6 italic">Founder's Note</h2>
                        <p className="text-lg text-slate-200 leading-relaxed italic">
                            "In early 2026, I made a deliberate decision: build AI-native from day one. No legacy thinking, no old habits carried over from how software used to be built. Just a clear thesis — AI has fundamentally changed what a small, focused studio can deliver — and the discipline to follow it through. Koivu Labs is that experiment. It's still accelerating."
                        </p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-slate-500 tracking-[0.5em] uppercase">Core Philosophy</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="text-teal-400 font-bold">01</span>
                                    <p className="text-slate-400">Pragmatism over perfection. If it works and ships, it's right.</p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-teal-400 font-bold">02</span>
                                    <p className="text-slate-400">Nordic precision. Clean code, clean design, clean intent.</p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-teal-400 font-bold">03</span>
                                    <p className="text-slate-400">AI-First by design. Intelligence at every layer, not as an afterthought.</p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-teal-400 font-bold">04</span>
                                    <p className="text-slate-400">Small surface, deep focus. We pick the right problem and go all in.</p>
                                </li>
                            </ul>
                        </div>

                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                            <h3 className="text-teal-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">Contact Studio</h3>
                            <div className="space-y-4">
                                <CopyEmail email="hello@koivulabs.com" className="block text-2xl font-bold text-slate-100 hover:text-teal-400 cursor-copy" />
                                <p className="text-sm text-slate-500">
                                    Saarijärvi, Finland <br />
                                    Global Deployment Hub
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Journey Timeline */}
                <div className="mt-20 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-100 italic">The Timeline</h2>
                    <div className="relative pl-8 border-l border-slate-800">
                        {[
                            { date: 'Jan 2026', text: 'Clear decision: build AI-native from the ground up. Thesis defined, stack chosen, work begins.' },
                            { date: 'Feb 2026', text: 'First full-stack projects ship. Firebase, Next.js, real deployments. The tempo is set.' },
                            { date: 'Mar 2026', text: 'Koivu Labs founded. KoivuChat MVP live in production. First paying clients in pipeline.' },
                            { date: 'Now', text: 'Shipping features weekly. Multiple products in active development. The lab doesn\'t sleep.' },
                        ].map((item, i) => (
                            <div key={i} className="mb-10 relative">
                                <div className="absolute -left-[41px] w-3 h-3 rounded-full bg-teal-500 border-2 border-slate-950 shadow-[0_0_8px_rgba(45,212,191,0.4)]" />
                                <div className="text-[10px] text-teal-400/60 font-black tracking-widest uppercase mb-1">{item.date}</div>
                                <p className="text-slate-400 leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <p className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">
                        EST. 2026 / KOIVU LABS HUB
                    </p>
                </div>
            </div>
        </main>
    );
}
