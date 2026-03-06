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
                            Koivu Labs isn't just a development studio; it's a pragmatic laboratory. We explore the intersection of human common sense and AI capability. Our goal is to build tools that actually work—tools that solve real problems with minimal friction and maximum speed.
                        </p>
                    </section>

                    <section className="p-12 tree-glass border-teal-500/20 nordic-glow">
                        <h2 className="text-2xl font-bold text-teal-400 mb-6 italic">Founder's Journey</h2>
                        <p className="text-lg text-slate-200 leading-relaxed italic">
                            "In January 2026, I didn't know what Firebase was. I started experimenting with AI tools as an 'old man' trying to keep up. I found that with the right intent and pragmatic tools, we can move faster than ever imagined. Koivu Labs is the result of that experimentation."
                        </p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-slate-500 tracking-[0.5em] uppercase">Core Philosophy</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="text-teal-400 font-bold">01</span>
                                    <p className="text-slate-400">Pragmatism over perfection. If it works, it's right.</p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-teal-400 font-bold">02</span>
                                    <p className="text-slate-400">Nordic precision. Clean code, clean design, clean intent.</p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-teal-400 font-bold">03</span>
                                    <p className="text-slate-400">AI-First lifecycle. Leveraging intelligence at every layer.</p>
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
                            { date: 'Jan 2026', text: 'Zero code knowledge. First "Hello World". Decision made: build or stay behind.' },
                            { date: 'Feb 2026', text: 'First Firebase project. State, components, data flow. Things starting to click.' },
                            { date: 'Mar 2026', text: 'Koivu Labs born. First deployment goes live. Learning in public begins.' },
                            { date: 'Now', text: 'Shipping features weekly. 7 projects in development. Still learning. Won\'t stop.' },
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
