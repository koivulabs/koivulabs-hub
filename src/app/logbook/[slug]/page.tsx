'use client';

import React, { useEffect, useState } from 'react';
import { logService, DevLog } from '@/lib/logService';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string }>;
}

export default function LogEntryPage({ params }: Props) {
    const [log, setLog] = useState<DevLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);

    useEffect(() => {
        params.then(({ slug }) => {
            logService.getLog(slug)
                .then(data => {
                    if (!data || data.status !== 'Published') {
                        setMissing(true);
                    } else {
                        setLog(data);
                        document.title = `${data.title} | Koivu Labs`;
                    }
                })
                .finally(() => setLoading(false));
        });
    }, [params]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-teal-500 animate-pulse font-black italic text-2xl">OPENING LOG...</div>
        </div>
    );

    if (missing || !log) return notFound();

    return (
        <main className="min-h-screen bg-slate-950 pt-32 pb-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-3xl mx-auto">
                <Link href="/logbook" className="text-teal-500 text-xs font-bold tracking-widest uppercase hover:underline mb-12 inline-block">
                    ← Back to Logbook
                </Link>

                <article>
                    <header className="mb-16">
                        <time className="text-teal-500/50 text-[10px] font-black tracking-widest uppercase block mb-6">
                            {new Date(log.publishedAt?.seconds * 1000).toLocaleDateString('fi-FI')}
                        </time>
                        <h1 className="text-4xl md:text-6xl font-bold italic text-slate-100 leading-tight mb-6">
                            {log.title}
                        </h1>
                        <div className="flex gap-2 flex-wrap">
                            {log.tags?.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-bold uppercase">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </header>

                    <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed text-lg">
                        {log.content.split('\n').filter(Boolean).map((para, i) => (
                            <p key={i} className="mb-6">{para}</p>
                        ))}
                    </div>
                </article>

                <footer className="mt-24 pt-8 border-t border-slate-800/50 flex justify-between items-center">
                    <Link href="/logbook" className="text-slate-500 hover:text-teal-400 text-xs font-bold tracking-widest uppercase transition-colors">
                        ← All Entries
                    </Link>
                    <span className="text-[10px] text-slate-700 font-bold tracking-widest uppercase">Koivu Labs</span>
                </footer>
            </div>
        </main>
    );
}
