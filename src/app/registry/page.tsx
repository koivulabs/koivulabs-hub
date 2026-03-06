import React from 'react';
import { projects } from '@/constants/projects';
import Link from 'next/link';

export default function RegistryPage() {
    return (
        <main className="min-h-screen pt-24 pb-32 px-6 md:px-12 lg:px-24 bg-slate-950">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors mb-16 uppercase tracking-widest text-xs font-bold">
                ← Return to Hub
            </Link>

            <div className="max-w-6xl mx-auto">
                <div className="mb-20">
                    <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                        Complete Inventory
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 mb-6 italic">
                        The <span className="text-teal-400">Registry</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl">
                        A comprehensive list of every mission, project, and experiment deployed by Koivu Labs.
                        From flagship products to archived seeds.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/${project.id}`}>
                            <div className="p-6 tree-glass hover:border-teal-500/30 transition-all duration-300 group h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] text-teal-400/60 font-bold uppercase tracking-widest">
                                            {project.category}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${project.status === 'Flagship' ? 'border-teal-500/50 text-teal-400' : 'border-slate-700 text-slate-500'
                                            } uppercase font-bold tracking-tighter`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors mb-3 italic">
                                        {project.name}
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-4">
                                    View Detail →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 border-t border-slate-800/50 pt-12 text-center text-slate-600">
                    <p className="text-xs tracking-widest uppercase font-bold">Registry Updated: March 2026</p>
                </div>
            </div>
        </main>
    );
}
