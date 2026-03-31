'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects as staticProjects, Project } from '@/constants/projects';
import Link from 'next/link';
import { projectService } from '@/lib/projectService';
import { trackProjectClick } from '@/lib/analytics';

// Tooltip content shared between canopy (floating panel) and roots (popover)
const TooltipContent: React.FC<{ project: Project }> = ({ project }) => {
    const isRoot = project.zone === 'roots';
    const accent = isRoot ? 'amber' : 'teal';
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
                    isRoot
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                }`}>
                    {project.name[0]}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-100">{project.name}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${isRoot ? 'text-amber-400' : 'text-teal-400'}`}>
                            {project.status}
                        </span>
                        {isRoot && (
                            <span className="text-[9px] font-bold tracking-widest uppercase text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                                Growing
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{project.description}&rdquo;</p>
            {project.currentMission && (
                <div className={`p-3 rounded-xl border ${isRoot ? 'bg-amber-500/5 border-amber-500/10' : 'bg-teal-500/5 border-teal-500/10'}`}>
                    <h4 className={`text-[10px] font-black tracking-widest uppercase mb-1 ${isRoot ? 'text-amber-400' : 'text-teal-400'}`}>
                        Current Mission
                    </h4>
                    <p className="text-[11px] text-slate-200 leading-snug">{project.currentMission}</p>
                </div>
            )}
            <div className="pt-4 border-t border-slate-800/50">
                <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Core Tech</h4>
                <div className="flex flex-wrap gap-2">
                    {project.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded-md border border-slate-700">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
            <div className={`text-xs font-bold animate-pulse ${accent === 'amber' ? 'text-amber-400' : 'text-teal-400'}`}>
                Click to explore mission →
            </div>
        </div>
    );
};

// Reusable interactive hotspot node
const ProjectNode: React.FC<{
    project: Project;
    isHovered: boolean;
    onEnter: () => void;
    onLeave: () => void;
    size?: 'md' | 'sm';
}> = ({ project, isHovered, onEnter, onLeave, size = 'md' }) => {
    const isRoot = project.zone === 'roots';
    const sizeClass = size === 'sm'
        ? 'w-12 h-12 md:w-14 md:h-14'
        : 'w-16 h-16 md:w-20 md:h-20';
    const textSize = size === 'sm' ? 'text-lg md:text-xl' : 'text-xl md:text-2xl';
    return (
        <Link href={`/${project.id}`} onClick={() => trackProjectClick(project.id)}>
            <motion.div
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                whileHover={{ scale: 1.1 }}
                className={`${sizeClass} rounded-full cursor-pointer flex items-center justify-center relative`}
            >
                <div className="node-pulse" />
                {isHovered && <div className="node-pulse" style={{ animationDelay: '0.5s', opacity: 0.8 }} />}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className={`absolute inset-0 rounded-full blur-xl ${isRoot ? 'bg-amber-400/15' : 'bg-teal-400/10'}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        />
                    )}
                </AnimatePresence>
                <div className={`relative z-10 ${textSize} font-black opacity-40 group-hover/node:opacity-100 transition-opacity duration-300 pointer-events-none italic ${isRoot ? 'text-amber-400' : 'text-teal-400'}`}>
                    {project.name[0]}
                </div>
                <div className={`absolute inset-0 rounded-full border transition-colors ${
                    isRoot
                        ? 'border-amber-500/10 group-hover/node:border-amber-500/50'
                        : 'border-teal-500/10 group-hover/node:border-teal-500/50'
                }`} />
            </motion.div>
        </Link>
    );
};

const InteractiveProjectTree: React.FC = () => {
    const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
    const [projects, setProjects] = useState<Project[]>(staticProjects);

    useEffect(() => {
        const loadDynamicProjects = async () => {
            try {
                const dynamicData = await projectService.getAllProjects();
                if (dynamicData.length > 0) {
                    setProjects(dynamicData);
                }
            } catch {
                console.warn('Using static project data (Firebase not connected)');
            }
        };
        loadDynamicProjects();
    }, []);

    const canopyProjects = projects.filter(p => p.zone === 'canopy');
    const rootProjects   = projects.filter(p => p.zone === 'roots');

    return (
        <div className="w-full max-w-5xl mx-auto">

            {/* ── CANOPY — Birch tree image ──────────────────────────────────── */}
            <div className="relative aspect-video rounded-t-3xl overflow-hidden shadow-2xl border border-b-0 border-slate-800/50 group bg-slate-900">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02]"
                    style={{ backgroundImage: "url('/images/birch_tech_tree.png')" }}
                />
                <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />

                {/* Canopy hotspots */}
                {canopyProjects.map((project) => {
                    const isHovered = hoveredProject?.id === project.id;
                    return (
                        <div
                            key={project.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/node"
                            style={{ left: `${project.treePosition.x}%`, top: `${project.treePosition.y}%` }}
                        >
                            <ProjectNode
                                project={project}
                                isHovered={isHovered}
                                onEnter={() => setHoveredProject(project)}
                                onLeave={() => setHoveredProject(null)}
                            />
                        </div>
                    );
                })}

                {/* Floating tooltip — top right, shared for canopy */}
                <AnimatePresence>
                    {hoveredProject && hoveredProject.zone === 'canopy' && (
                        <motion.div
                            key={hoveredProject.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-6 right-6 bottom-6 w-64 md:w-80 tree-glass p-6 md:p-8 z-30 shadow-2xl overflow-y-auto pointer-events-none"
                        >
                            <TooltipContent project={hoveredProject} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute bottom-4 left-6 z-10 pointer-events-none">
                    <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                        Interactive Ecosystem v2.0
                    </p>
                </div>
            </div>

            {/* ── ROOTS — Underground section ───────────────────────────────── */}
            {rootProjects.length > 0 && (
                <div
                    className="relative rounded-b-3xl border border-t-0 border-slate-700/40 overflow-visible shadow-2xl"
                    style={{ background: 'linear-gradient(180deg, #1c0f06 0%, #0e0905 50%, #080604 100%)', minHeight: '200px' }}
                >
                    {/* Wavy soil line — visual connection to tree above */}
                    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{ marginTop: '-1px' }}>
                        <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="w-full" style={{ height: '48px' }}>
                            <path
                                d="M0,24 C120,6 240,42 360,22 C480,4 600,38 720,24 C840,10 960,36 1080,20 C1120,14 1160,28 1200,24 L1200,0 L0,0 Z"
                                fill="#0f172a"
                            />
                        </svg>
                    </div>

                    {/* Decorative root lines */}
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-25">
                        <svg viewBox="0 0 1000 240" preserveAspectRatio="none" className="w-full h-full">
                            <path d="M500,0 Q360,55 220,85 Q110,105 30,155" stroke="#92400e" strokeWidth="2.5" fill="none"/>
                            <path d="M500,0 Q440,48 400,95 Q375,125 355,165" stroke="#78350f" strokeWidth="1.5" fill="none"/>
                            <path d="M500,0 Q500,65 500,135" stroke="#a16207" strokeWidth="3" fill="none"/>
                            <path d="M500,0 Q560,48 600,95 Q625,125 645,165" stroke="#78350f" strokeWidth="1.5" fill="none"/>
                            <path d="M500,0 Q640,55 780,85 Q890,105 970,155" stroke="#92400e" strokeWidth="2.5" fill="none"/>
                        </svg>
                    </div>

                    {/* Section label */}
                    <div className="relative z-20 pt-12 pb-3 px-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-amber-900/30" />
                        <span className="text-[10px] text-amber-700/60 font-bold tracking-[0.4em] uppercase">
                            Root System — Growing Projects
                        </span>
                        <div className="h-px flex-1 bg-amber-900/30" />
                    </div>

                    {/* Root project nodes */}
                    <div className="relative z-20 flex flex-wrap justify-center gap-20 pb-10 pt-2 px-10">
                        {rootProjects.map((project) => {
                            const isHovered = hoveredProject?.id === project.id;
                            return (
                                <div key={project.id} className="relative flex flex-col items-center gap-3 group/node">
                                    <ProjectNode
                                        project={project}
                                        isHovered={isHovered}
                                        onEnter={() => setHoveredProject(project)}
                                        onLeave={() => setHoveredProject(null)}
                                        size="sm"
                                    />
                                    <span className="text-[10px] text-amber-700/50 font-bold tracking-widest uppercase group-hover/node:text-amber-400 transition-colors">
                                        {project.name}
                                    </span>
                                    {/* Popover tooltip above the node */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-72 tree-glass p-5 shadow-2xl pointer-events-none z-40"
                                            >
                                                <TooltipContent project={project} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveProjectTree;
