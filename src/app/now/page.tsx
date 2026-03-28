'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GitHubCalendar from '@/components/GitHubCalendar';

// Fallback content (used until first Telegram update)
const FALLBACK = {
    building: [
        'Koivu Labs Hub — the studio portal you\'re looking at. Features shipping week by week.',
        'BrainBuffer — working on voice-to-text latency. The gap between thought and storage should be zero.',
        'Learning Firebase security rules properly. No shortcuts.',
    ],
    learning: [
        'Next.js App Router — server components, middleware, edge functions.',
        'TypeScript — fewer any types every week.',
        'How to ask AI the right questions, not just accept the first answer.',
    ],
    reading: [
        'Documentation. More documentation. Occasionally something that isn\'t documentation.',
    ],
    notDoing: [
        'Pretending to know more than I do.',
        'Waiting until things are perfect before shipping.',
    ],
    location: 'Northern Central Finland. Quiet. The kind of quiet that makes it easy to focus.',
    updatedAt: 'March 2026',
};

interface NowData {
    building: string[];
    learning: string[];
    reading: string[];
    notDoing: string[];
    location: string;
    updatedAt: string;
}

export default function NowPage() {
    const [data, setData] = useState<NowData>(FALLBACK);

    useEffect(() => {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        if (!projectId || !apiKey) return;

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/siteContent/now?key=${apiKey}`;

        fetch(url)
            .then(res => res.ok ? res.json() : null)
            .then(doc => {
                if (!doc?.fields) return;
                const f = doc.fields;
                const toStrings = (field: { arrayValue?: { values?: Array<{ stringValue: string }> } }) =>
                    field?.arrayValue?.values?.map((v: { stringValue: string }) => v.stringValue) ?? [];

                setData({
                    building:  toStrings(f.building),
                    learning:  toStrings(f.learning),
                    reading:   toStrings(f.reading),
                    notDoing:  toStrings(f.notDoing),
                    location:  f.location?.stringValue ?? FALLBACK.location,
                    updatedAt: f.updatedAt?.stringValue ?? FALLBACK.updatedAt,
                });
            })
            .catch(() => { /* keep fallback */ });
    }, []);

    const sections: { title: string; items: string[] }[] = [
        { title: 'Building', items: data.building },
        { title: 'Learning', items: data.learning },
        { title: 'Reading', items: data.reading },
    ];

    return (
        <main className="min-h-screen pt-32 pb-32 px-6 md:px-12 lg:px-24 bg-slate-950">
            <div className="max-w-2xl mx-auto">
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                        Updated {data.updatedAt}
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold italic text-slate-100 mb-4">
                        Now
                    </h1>
                    <p className="text-slate-600 text-xs leading-relaxed">
                        A living snapshot of what&apos;s happening at the lab. Inspired by{' '}
                        <a href="https://nownownow.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-400 transition-colors">
                            nownownow.com
                        </a>.
                    </p>
                </header>

                <div className="space-y-14 text-slate-400 leading-relaxed">
                    {sections.map(section => (
                        <section key={section.title}>
                            <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">{section.title}</h2>
                            <ul className="space-y-4">
                                {section.items.map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <span className="text-teal-400/30 font-black mt-0.5 shrink-0">—</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}

                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">Location</h2>
                        <p>{data.location}</p>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">Not doing</h2>
                        <ul className="space-y-4">
                            {data.notDoing.map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <span className="text-teal-400/30 font-black mt-0.5 shrink-0">—</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <section className="mt-14">
                    <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-teal-400 mb-5">Commit Activity</h2>
                    <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50 overflow-x-auto">
                        <GitHubCalendar />
                    </div>
                    <p className="text-slate-700 text-xs mt-3 tracking-widest uppercase">github.com/akkkrrr</p>
                </section>

                <div className="mt-16 pt-8 border-t border-slate-800/50 flex justify-between items-center">
                    <Link href="/" className="text-slate-600 hover:text-teal-400 text-[10px] tracking-widest uppercase transition-colors">
                        ← Return to Hub
                    </Link>
                    <span className="text-slate-800 text-[10px] tracking-widest uppercase font-bold">{data.updatedAt}</span>
                </div>
            </div>
        </main>
    );
}
