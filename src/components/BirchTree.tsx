'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { projects as staticProjects, Project } from '@/constants/projects';
import LeafNode from './LeafNode';
import { projectService } from '@/lib/projectService';

const BirchTree: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>(staticProjects);

    useEffect(() => {
        const loadDynamicProjects = async () => {
            try {
                const dynamicData = await projectService.getAllProjects();
                if (dynamicData.length > 0) {
                    setProjects(dynamicData);
                }
            } catch (error) {
                console.error("Firebase not configured or empty, using static data.", error);
            }
        };
        loadDynamicProjects();
    }, []);
    return (
        <div className="relative w-full max-w-[800px] aspect-[4/5] mx-auto md:-mt-20">
            {/* SVG Tree Frame */}
            <svg
                className="absolute inset-0 w-full h-full drop-shadow-2xl opacity-60 md:opacity-100"
                viewBox="0 0 400 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Trunk with Texture */}
                <motion.path
                    d="M185 500L200 450C205 400 200 350 195 300C190 250 195 200 205 150C215 100 210 50 205 0"
                    stroke="url(#birchGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Major Branches */}
                <motion.path
                    d="M198 320C150 280 100 300 60 280"
                    stroke="url(#birchGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                />
                <motion.path
                    d="M202 280C250 240 300 260 350 240"
                    stroke="url(#birchGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                />
                <motion.path
                    d="M196 420C140 400 80 440 40 420"
                    stroke="url(#birchGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                />
                <motion.path
                    d="M204 380C260 360 320 400 380 380"
                    stroke="url(#birchGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1.2 }}
                />

                {/* Small Twigs */}
                <motion.path d="M100 295C80 280 70 290 60 285" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <motion.path d="M300 255C320 240 330 250 340 245" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

                <defs>
                    <linearGradient id="birchGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#CBD5E1" />
                        <stop offset="25%" stopColor="#F8FAFC" />
                        <stop offset="50%" stopColor="#E2E8F0" />
                        <stop offset="75%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#CBD5E1" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Interactive Project Leaves */}
            <div className="absolute inset-0">
                {projects.map((project, index) => (
                    <LeafNode
                        key={project.id}
                        project={project}
                        x={project.treePosition.x}
                        y={project.treePosition.y}
                        delay={1.5 + index * 0.1}
                    />
                ))}
            </div>
        </div>
    );
};

export default BirchTree;
