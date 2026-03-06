import React from 'react';
import { notFound } from 'next/navigation';
import { projects } from '@/constants/projects';
import Link from 'next/link';

interface ProductPageProps {
    params: Promise<{ projectId: string }>;
}

export async function generateStaticParams() {
    return projects.map((project) => ({
        projectId: project.id,
    }));
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { projectId } = await params;
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-24 pb-32 px-6 md:px-12 lg:px-24">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors mb-12 group"
            >
                <span className="text-xl">←</span>
                <span className="text-sm font-semibold tracking-widest uppercase">Back to Hub</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Left Column: Mission & Identity */}
                <div className="space-y-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-widest uppercase mb-6">
                            {project.category} / {project.status}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 mb-6 italic">
                            {project.name}
                        </h1>
                        <p className="text-2xl text-slate-400 font-light leading-relaxed">
                            {project.description}
                        </p>
                    </div>

                    <div className="p-8 tree-glass nordic-glow border-teal-500/20">
                        <h3 className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-4">Strategic Vision</h3>
                        <p className="text-slate-100 text-lg italic leading-relaxed">
                            "{project.vision}"
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-slate-500 text-xs font-bold tracking-widest uppercase">Deep Context</h3>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            {project.longDescription}
                        </p>
                    </div>
                </div>

                {/* Right Column: Spec & Tech */}
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                            <h3 className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-4">Core Capabilities</h3>
                            <ul className="space-y-3">
                                {project.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                            <h3 className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-full border border-slate-700/50">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative group overflow-hidden rounded-3xl aspect-video bg-slate-900/80 border border-slate-800/50 flex items-center justify-center">
                        {/* Action Placeholder */}
                        <div className="text-center group-hover:scale-105 transition-transform duration-500">
                            <div className="w-20 h-20 mx-auto rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 nordic-glow">
                                <span className="text-2xl font-bold">{project.name[0]}</span>
                            </div>
                            <a
                                href={project.url}
                                target="_blank"
                                className="text-slate-100 font-bold tracking-widest uppercase hover:text-teal-400 transition-colors"
                            >
                                Launch Instance →
                            </a>
                        </div>

                        {/* Subtle Nordic Gradient Overlay */}
                        <div className="absolute inset-0 pointer-events-none birch-gradient opacity-40" />
                    </div>
                </div>
            </div>
        </main>
    );
}
