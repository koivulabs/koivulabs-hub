import React from 'react';
import { Project } from '@/constants/projects';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    return (
        <a
            href={project.url}
            target={project.url.startsWith('http') ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="group bg-slate-900/40 backdrop-blur-sm birch-border p-6 rounded-xl flex flex-col gap-4 h-full nordic-glow transition-all duration-500 hover:-translate-y-1 hover:bg-slate-900/60"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:text-teal-300 transition-colors">
                        {/* Placeholder for project icon if logoUrl is not available */}
                        <span className="font-bold text-lg">{project.name[0]}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-100 group-hover:text-teal-400 transition-colors">
                        {project.name}
                    </h3>
                </div>

                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${project.status === 'Flagship' ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' :
                        project.status === 'Legacy' ? 'bg-slate-800 border-slate-700 text-slate-500' :
                            'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                    {project.status}
                </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                {project.description}
            </p>

            <div className="mt-auto flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500 group-hover:text-slate-400 transition-colors">
                    {project.category}
                </span>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </a>
    );
};

export default ProjectCard;
