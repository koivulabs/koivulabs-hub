'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { projectService } from '@/lib/projectService';
import { logService, DevLog } from '@/lib/logService';
import { Project, projects as staticProjects } from '@/constants/projects';
import ProjectForm from '@/components/admin/ProjectForm';
import LogForm from '@/components/admin/LogForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'projects' | 'logs'>('projects');
    const [projects, setProjects] = useState<Project[]>([]);
    const [logs, setLogs] = useState<DevLog[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingLog, setEditingLog] = useState<DevLog | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/admin/login');
            } else {
                setAuthChecked(true);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'projects') {
                const data = await projectService.getAllProjects();
                setProjects(data);
            } else {
                const data = await logService.getAllLogs(true);
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSaveProject = async (project: Project) => {
        try {
            await projectService.saveProject(project);
            setEditingProject(null);
            setIsAdding(false);
            loadData();
        } catch (error) {
            alert("Error saving project.");
        }
    };

    const handleSaveLog = async (log: DevLog) => {
        try {
            await logService.saveLog(log);
            setEditingLog(null);
            setIsAdding(false);
            loadData();
        } catch (error) {
            alert("Error saving log.");
        }
    };

    const handleSeedProjects = async () => {
        if (!confirm(`Seed ${staticProjects.length} projects from static data to Firebase?`)) return;
        setSeeding(true);
        try {
            await Promise.all(staticProjects.map(p => projectService.saveProject(p)));
            await loadData();
        } catch {
            alert('Seeding failed.');
        } finally {
            setSeeding(false);
        }
    };

    if (!authChecked) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-teal-500 animate-pulse font-black italic text-2xl">AUTHENTICATING...</div>
        </div>
    );

    if (loading && projects.length === 0 && logs.length === 0) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-teal-500 animate-pulse font-black italic text-2xl">CO-LOADING...</div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-24 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-100 italic">
                            Lab <span className="text-teal-400">Control</span>
                        </h1>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`text-[10px] font-black tracking-widest uppercase pb-1 border-b-2 transition-all ${activeTab === 'projects' ? 'text-teal-400 border-teal-400' : 'text-slate-500 border-transparent hover:text-slate-300'
                                    }`}
                            >
                                Tech-Tree
                            </button>
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`text-[10px] font-black tracking-widest uppercase pb-1 border-b-2 transition-all ${activeTab === 'logs' ? 'text-teal-400 border-teal-400' : 'text-slate-500 border-transparent hover:text-slate-300'
                                    }`}
                            >
                                Dev Logs
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeTab === 'projects' && (
                            <button
                                onClick={handleSeedProjects}
                                disabled={seeding}
                                title="Sync static project config to Firestore"
                                className="px-4 py-3 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black tracking-widest uppercase rounded-xl hover:text-teal-400 hover:border-teal-400/30 transition-all disabled:opacity-50"
                            >
                                {seeding ? 'SYNCING...' : 'SYNC FROM CODE ↓'}
                            </button>
                        )}
                        <button
                            onClick={() => setIsAdding(true)}
                            className="px-6 py-3 bg-teal-500 text-slate-950 font-black rounded-xl hover:bg-teal-400 transition-all transform active:scale-95"
                        >
                            {activeTab === 'projects' ? 'NEW MISSION +' : 'NEW LOG ENTRY +'}
                        </button>
                        <button
                            onClick={async () => {
                                await signOut(auth);
                                await fetch('/api/auth/session', { method: 'DELETE' });
                                router.push('/');
                            }}
                            className="px-4 py-3 bg-slate-900 border border-slate-800 text-slate-500 text-xs font-black rounded-xl hover:text-red-400 hover:border-red-500/30 transition-all"
                        >
                            EXIT
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {(isAdding || editingProject || editingLog) ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="tree-glass p-8"
                        >
                            <h2 className="text-xl font-bold mb-8 italic">
                                {isAdding ? 'Initiating New Entry' : 'Modifying Entry'}
                            </h2>
                            {activeTab === 'projects' ? (
                                <ProjectForm
                                    initialProject={editingProject || undefined}
                                    onSubmit={handleSaveProject}
                                    onCancel={() => { setIsAdding(false); setEditingProject(null); }}
                                />
                            ) : (
                                <LogForm
                                    initialLog={editingLog || undefined}
                                    onSubmit={handleSaveLog}
                                    onCancel={() => { setIsAdding(false); setEditingLog(null); }}
                                />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {activeTab === 'projects' ? projects.map(project => (
                                <div key={project.id} className="tree-glass p-6 group hover:border-teal-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-black italic">
                                            {project.name[0]}
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded border border-slate-800 text-slate-500 font-bold uppercase">
                                            {project.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-100">{project.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-6 line-clamp-2">{project.description}</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setEditingProject(project)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase rounded-lg transition-colors">Modify</button>
                                        <button onClick={async () => { if (confirm('Terminate?')) { await projectService.deleteProject(project.id); loadData(); } }} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black uppercase rounded-lg transition-colors border border-red-500/20">DEL</button>
                                    </div>
                                </div>
                            )) : logs.map(log => (
                                <div key={log.id} className="tree-glass p-6 group hover:border-teal-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-black italic">
                                            L
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border border-slate-800 font-bold uppercase ${log.status === 'Published' ? 'text-teal-500' : 'text-slate-500'}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-100">{log.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-6 line-clamp-2">{log.content}</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setEditingLog(log)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase rounded-lg transition-colors">Edit</button>
                                        <button onClick={async () => { if (confirm('Erase?')) { await logService.deleteLog(log.id); loadData(); } }} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black uppercase rounded-lg transition-colors border border-red-500/20">DEL</button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
