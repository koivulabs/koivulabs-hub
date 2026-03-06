'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { logService, DevLog } from '@/lib/logService';
import Link from 'next/link';

export default function LogbookPage() {
    const [logs, setLogs] = useState<DevLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const data = await logService.getAllLogs();
                setLogs(data);
            } catch (error) {
                console.error("Failed to load logbook:", error);
            } finally {
                setLoading(false);
            }
        };
        loadLogs();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-teal-500 animate-pulse font-black italic text-2xl">OPENING LOGS...</div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-950 pt-32 pb-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-3xl mx-auto">
                <header className="mb-20">
                    <Link href="/" className="text-teal-500 text-xs font-bold tracking-widest uppercase hover:underline mb-8 inline-block">
                        ← Return to Lab
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 italic">
                        Founder's <span className="text-teal-400">Log</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-4 uppercase tracking-[0.3em] font-medium">
                        Raw technical insights and studio updates.
                    </p>
                </header>

                <div className="space-y-16">
                    {logs.length === 0 ? (
                        <div className="tree-glass p-12 text-center text-slate-500 italic">
                            The logbook is currently empty. Missions in progress.
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <motion.article
                                key={log.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className="absolute -left-12 top-0 bottom-0 w-px bg-slate-800 hidden md:block">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <time className="text-teal-500/50 text-[10px] font-black tracking-widest uppercase">
                                        {new Date(log.publishedAt?.seconds * 1000).toLocaleDateString('fi-FI')}
                                    </time>
                                    <Link href={`/logbook/${log.id}`}>
                                        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors cursor-pointer">
                                            {log.title}
                                        </h2>
                                    </Link>
                                    <p className="text-slate-400 leading-relaxed text-lg line-clamp-3">
                                        {log.content.split('\n').find(p => p.trim()) ?? ''}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {log.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-bold uppercase">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <Link href={`/logbook/${log.id}`} className="text-teal-400 text-xs font-bold tracking-widest uppercase hover:underline shrink-0 ml-4">
                                            Read Entry →
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
