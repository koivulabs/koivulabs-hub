'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { projects, Project } from '@/constants/projects';

type Filter = 'all' | 'canopy' | 'roots' | 'Flagship' | 'Active Lab' | 'Experimental' | 'Legacy';

const statusColor: Record<string, string> = {
    Flagship:       'bg-teal-500/15 text-teal-400 border-teal-500/25',
    'Active Lab':   'bg-blue-500/15 text-blue-400 border-blue-500/25',
    Experimental:   'bg-purple-500/15 text-purple-400 border-purple-500/25',
    Legacy:         'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const isRoot = project.zone === 'roots';
    return (
        <Link href={`/${project.id}`} className="group block">
            <div className={`relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isRoot
                    ? 'bg-slate-900/60 border-slate-700/50 hover:border-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800/50 hover:border-teal-500/40'
            }`}>
                {/* Zone indicator strip */}
                <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${isRoot ? 'bg-amber-500/40' : 'bg-teal-500/30'}`} />

                <div className="flex items-start justify-between gap-4 mb-3 pl-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg italic flex-shrink-0 ${
                            isRoot ? 'bg-amber-500/15 text-amber-400' : 'bg-teal-500/15 text-teal-400'
                        }`}>
                            {project.name[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100 group-hover:text-teal-400 transition-colors leading-tight">
                                {project.name}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                                {project.category}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor[project.status]}`}>
                            {project.status}
                        </span>
                        {isRoot && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                🌱 Growing
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed pl-3 mb-4 line-clamp-2">
                    {project.description}
                </p>

                {project.currentMission && (
                    <div className="pl-3 mb-4">
                        <p className="text-[11px] text-slate-600 italic line-clamp-1">
                            ↳ {project.currentMission}
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap gap-1.5 pl-3">
                    {project.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-500 rounded-md border border-slate-700/50">
                            {tech}
                        </span>
                    ))}
                    {project.techStack.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 text-slate-600">
                            +{project.techStack.length - 3}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

const ProjectIndex: React.FC = () => {
    const [filter, setFilter] = useState<Filter>('all');

    const filters: { key: Filter; label: string }[] = [
        { key: 'all',          label: 'All' },
        { key: 'canopy',       label: '🌿 Canopy' },
        { key: 'roots',        label: '🌱 Roots' },
        { key: 'Flagship',     label: 'Flagship' },
        { key: 'Active Lab',   label: 'Active Lab' },
        { key: 'Experimental', label: 'Experimental' },
        { key: 'Legacy',       label: 'Legacy' },
    ];

    const filtered: Project[] = projects.filter(p => {
        if (filter === 'all')    return true;
        if (filter === 'canopy') return p.zone === 'canopy';
        if (filter === 'roots')  return p.zone === 'roots';
        return p.status === filter;
    });

    return (
        <div>
            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 mb-8">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-200 border ${
                            filter === f.key
                                ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
                                : 'bg-slate-900/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                        }`}
                    >
                        {f.label}
                        <span className="ml-1.5 opacity-50">
                            {f.key === 'all'    ? projects.length
                            : f.key === 'canopy' ? projects.filter(p => p.zone === 'canopy').length
                            : f.key === 'roots'  ? projects.filter(p => p.zone === 'roots').length
                            : projects.filter(p => p.status === f.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-600">
                    <p className="text-sm font-bold tracking-widest uppercase">No projects match this filter</p>
                </div>
            )}
        </div>
    );
};

export default ProjectIndex;
