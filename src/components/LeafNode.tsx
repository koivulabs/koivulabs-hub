'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/constants/projects';
import Link from 'next/link';

interface LeafNodeProps {
    project: Project;
    x: number;
    y: number;
    delay?: number;
}

const LeafNode: React.FC<LeafNodeProps> = ({ project, x, y, delay = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/${project.id}`}>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: delay
                    }}
                    className="relative cursor-pointer group"
                >
                    {/* Glowing Pulse Background */}
                    <div className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${project.status === 'Flagship' ? 'bg-teal-400/40 group-hover:bg-teal-300' : 'bg-slate-400/20 group-hover:bg-teal-400/30'
                        }`} />

                    {/* The "Leaf" / Circle */}
                    <div className={`relative w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isHovered ? 'scale-110 border-teal-400 bg-slate-900 leaf-glow' : 'border-slate-700 bg-slate-900/80'
                        }`}>
                        <span className={`text-sm md:text-base font-bold transition-colors ${isHovered ? 'text-teal-400' : 'text-slate-400'
                            }`}>
                            {project.name[0]}
                        </span>
                    </div>

                    {/* Floating Label (Mobile/Always or Desktop/Hover) */}
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className={`text-[10px] md:text-xs font-semibold tracking-tighter uppercase transition-opacity duration-300 ${isHovered ? 'opacity-100 text-teal-400' : 'opacity-40 text-slate-500'
                            }`}>
                            {project.name}
                        </span>
                    </div>
                </motion.div>
            </Link>

            {/* Tooltip Content */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 bottom-full mb-6 left-1/2 -translate-x-1/2 w-48 md:w-64 tree-glass p-4 shadow-2xl pointer-events-none"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-teal-400" />
                            <h4 className="text-sm font-bold text-slate-100">{project.name}</h4>
                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 uppercase">
                                {project.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">
                            {project.description}
                        </p>
                        {project.currentMission && (
                            <div className="mt-2 p-1.5 bg-teal-500/5 border border-teal-500/10 rounded-lg">
                                <p className="text-[9px] text-teal-400 font-black tracking-widest uppercase">Mission</p>
                                <p className="text-[10px] text-slate-300 leading-tight">{project.currentMission}</p>
                            </div>
                        )}
                        <div className="mt-3 flex items-center gap-1 text-[10px] text-teal-400/80 font-medium italic">
                            Explore Product <span className="text-lg">→</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeafNode;
