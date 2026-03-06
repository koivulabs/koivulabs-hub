import React from 'react';
import Link from 'next/link';

const posts = [
    {
        date: 'March 6, 2026',
        title: 'The "Old Man" and the AI: Why I started this.',
        excerpt: 'In January, I didn\'t know what Firebase was. I just wanted to see if I could keep up. Here is what happened...',
        category: 'The Journey'
    },
    {
        date: 'February 20, 2026',
        title: 'Vibe Coding: Moving at the speed of thought.',
        excerpt: 'Testing the limits of high-level intent with AI execution. It’s not about typing; it’s about having a vision.',
        category: 'Engineering'
    }
];

export default function LogbookPage() {
    return (
        <main className="min-h-screen pt-24 pb-32 px-6 md:px-12 lg:px-24 bg-slate-950">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors mb-16 uppercase tracking-widest text-xs font-bold">
                ← Return to Hub
            </Link>

            <div className="max-w-4xl mx-auto">
                <div className="mb-20">
                    <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                        Internal Archive
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 mb-6 italic">
                        Founder's <span className="text-teal-400">Log</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl">
                        A raw, pragmatic account of the "Old Man's" journey through the AI revolution.
                        From January ignorance to real-world utility.
                    </p>
                </div>

                <div className="space-y-12">
                    {posts.map((post, i) => (
                        <article key={i} className="group p-8 tree-glass hover:border-teal-500/30 transition-all duration-500 cursor-pointer">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                                    {post.date} / {post.category}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors mb-4 italic">
                                {post.title}
                            </h2>
                            <p className="text-slate-400 leading-relaxed text-lg mb-6">
                                {post.excerpt}
                            </p>
                            <div className="text-teal-400 text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                Read Entry →
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-20 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 text-center italic">
                    <p className="text-slate-500">More entries being declassified as the lab expands.</p>
                </div>
            </div>
        </main>
    );
}
