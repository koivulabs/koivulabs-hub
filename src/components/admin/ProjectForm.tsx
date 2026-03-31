'use client';

import React, { useState } from 'react';
import { Project } from '@/constants/projects';

interface ProjectFormProps {
    initialProject?: Project;
    onSubmit: (project: Project) => void;
    onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialProject, onSubmit, onCancel }) => {
    const [project, setProject] = useState<Project>(initialProject || {
        id: '',
        name: '',
        description: '',
        longDescription: '',
        url: '',
        logoUrl: '',
        category: 'Utility',
        status: 'Experimental',
        features: [],
        techStack: [],
        vision: '',
        currentMission: '',
        zone: 'canopy',
        treePosition: { x: 50, y: 50 }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    const handlePositionChange = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        setProject(prev => ({ ...prev, treePosition: { x, y } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(project);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project ID (unique)</label>
                        <input
                            name="id"
                            value={project.id}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                            required
                            disabled={!!initialProject}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Name</label>
                        <input
                            name="name"
                            value={project.name}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Zone</label>
                        <select
                            name="zone"
                            value={project.zone}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                        >
                            <option value="canopy">🌿 Canopy — shown in the tree</option>
                            <option value="roots">🌱 Roots — underground / growing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                        <select
                            name="category"
                            value={project.category}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                        >
                            <option value="Productivity">Productivity</option>
                            <option value="Finance">Finance</option>
                            <option value="Social">Social</option>
                            <option value="Utility">Utility</option>
                            <option value="OS">OS</option>
                            <option value="Infrastructure">Infrastructure</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
                        <select
                            name="status"
                            value={project.status}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                        >
                            <option value="Flagship">Flagship</option>
                            <option value="Active Lab">Active Lab</option>
                            <option value="Experimental">Experimental</option>
                            <option value="Legacy">Legacy</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        {project.zone === 'roots'
                            ? `Roots Position — X: ${project.treePosition.x}, Y: ${project.treePosition.y} (used for ordering in root row)`
                            : `Tree Position — Click to set X: ${project.treePosition.x}, Y: ${project.treePosition.y}`
                        }
                    </label>
                    <div
                        className="relative aspect-video bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 cursor-crosshair overflow-hidden group"
                        onClick={handlePositionChange}
                    >
                        <div className="absolute inset-0 opacity-20 bg-[url('/images/birch_tech_tree.png')] bg-cover bg-center" />
                        <div
                            className="absolute w-4 h-4 bg-teal-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(45,212,191,0.5)] border-2 border-white"
                            style={{ left: `${project.treePosition.x}%`, top: `${project.treePosition.y}%` }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Current Mission</label>
                        <input
                            name="currentMission"
                            value={project.currentMission}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                            placeholder="e.g. Optimizing Core Engine"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Short Description</label>
                <textarea
                    name="description"
                    value={project.description}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors h-20 resize-none"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Long Description</label>
                <textarea
                    name="longDescription"
                    value={project.longDescription}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors h-32 resize-none"
                />
            </div>

            <div className="flex gap-4 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-8 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-transform active:scale-95"
                >
                    Save Project
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;
