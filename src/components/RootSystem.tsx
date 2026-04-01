'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects as staticProjects, Project } from '@/constants/projects';
import Link from 'next/link';
import { projectService } from '@/lib/projectService';
import { trackProjectClick } from '@/lib/analytics';

const RootSystem: React.FC = () => {
    const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
    const [projects, setProjects] = useState<Project[]>(staticProjects);

    useEffect(() => {
        const loadDynamicProjects = async () => {
            try {
                const dynamicData = await projectService.getAllProjects();
                if (dynamicData.length > 0) {
                    setProjects(dynamicData);
                }
            } catch (error) {
                console.warn('Using static project data (Firebase not connected)');
            }
        };
        loadDynamicProjects();
    }, []);

    const rootProjects = projects.filter(p => p.zone === 'roots');

    if (rootProjects.length === 0) return null;

    return (
        <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl border border-amber-900/30 group bg-slate-900">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02]"
                style={{ backgroundImage: "url('/images/birch_tech_roots.png')" }}
            />

            {/* Subtle warm overlay */}
            <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

            {/* Interactive Hotspots */}
            {rootProjects.map((project) => {
                const isHovered = hoveredProject?.id === project.id;

                return (
                    <div
                        key={project.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/node"
                        style={{ left: `${project.treePosition.x}%`, top: `${project.treePosition.y}%` }}
                    >
                        <Link href={`/${project.id}`} onClick={() => trackProjectClick(project.id)}>
                            <motion.div
                                onMouseEnter={() => setHoveredProject(project)}
                                onMouseLeave={() => setHoveredProject(null)}
                                whileHover={{ scale: 1.1 }}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full cursor-pointer flex items-center justify-center relative"
                            >
                                {/* Breathing Pulse — amber variant */}
                                <div className="node-pulse-amber" />

                                {isHovered && (
                                    <div className="node-pulse-amber" style={{ animationDelay: '0.5s', opacity: 0.8 }} />
                                )}

                                {/* Hover Glow */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            layoutId="rootGlow"
                                            className="absolute inset-0 rounded-full bg-amber-400/15 blur-xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Project Initial */}
                                <div className="relative z-10 text-xl md:text-2xl font-black text-amber-400 opacity-40 group-hover/node:opacity-100 transition-opacity duration-300 pointer-events-none italic">
                                    {project.name[0]}
                                </div>

                                {/* Border */}
                                <div className="absolute inset-0 rounded-full border border-amber-500/10 group-hover/node:border-amber-500/50 transition-colors" />
                            </motion.div>
                        </Link>
                    </div>
                );
            })}

            {/* Side Panel / Floating Tooltip */}
            <AnimatePresence>
                {hoveredProject && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-6 right-6 bottom-6 w-64 md:w-80 tree-glass p-6 md:p-8 z-30 shadow-2xl overflow-y-auto pointer-events-none"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold border border-amber-500/30">
                                    {hoveredProject.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-100">{hoveredProject.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
                                            {hoveredProject.status}
                                        </span>
                                        <span className="text-[9px] font-bold tracking-widest uppercase text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                                            Growing
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 leading-relaxed italic">
                                &ldquo;{hoveredProject.description}&rdquo;
                            </p>

                            {hoveredProject.currentMission && (
                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                    <h4 className="text-[10px] text-amber-400 font-black tracking-widest uppercase mb-1">Current Mission</h4>
                                    <p className="text-[11px] text-slate-200 leading-snug">
                                        {hoveredProject.currentMission}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-800/50">
                                <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Core Tech</h4>
                                <div className="flex flex-wrap gap-2">
                                    {hoveredProject.techStack.slice(0, 3).map(tech => (
                                        <span key={tech} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded-md border border-slate-700">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="text-amber-400 text-xs font-bold animate-pulse">
                                Click to explore mission →
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute bottom-4 left-6 z-10 pointer-events-none">
                <p className="text-[10px] text-amber-700/50 font-bold tracking-[0.3em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                    Root System — Growing Projects
                </p>
            </div>
        </div>
    );
};

export default RootSystem;
