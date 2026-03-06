'use client';

import React, { useState } from 'react';
import { DevLog } from '@/lib/logService';

interface LogFormProps {
    initialLog?: DevLog;
    onSubmit: (log: DevLog) => void;
    onCancel: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ initialLog, onSubmit, onCancel }) => {
    const [log, setLog] = useState<DevLog>(initialLog || {
        id: '',
        title: '',
        content: '',
        tags: [],
        status: 'Draft',
        publishedAt: null
    });
    const [isRefining, setIsRefining] = useState(false);
    const [narrative, setNarrative] = useState("Koivu Labs — maalaisjärki kohtaa tekoälyn. Career changer, started from zero in early 2026. Honest about the learning curve. Small steps, real progress. Northern Central Finland. Quiet forest energy, steady work ethic.");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLog(prev => ({ ...prev, [name]: value }));
    };

    const handleRefine = async () => {
        if (!log.content) return;
        setIsRefining(true);
        try {
            const res = await fetch('/api/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: log.content,
                    narrative
                })
            });
            const data = await res.json();
            if (data.refinedText) {
                setLog(prev => ({ ...prev, content: data.refinedText }));
            }
        } catch (error) {
            console.error("Refine failed:", error);
        } finally {
            setIsRefining(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(log);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Log ID (slug)</label>
                    <input
                        name="id"
                        value={log.id}
                        onChange={handleChange}
                        placeholder="e.g. implementing-ai-refinery"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                        required
                        disabled={!!initialLog}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
                    <select
                        name="status"
                        value={log.status}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                    >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                <input
                    name="title"
                    value={log.title}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">AI Narrative Voice</label>
                <textarea
                    value={narrative}
                    onChange={e => setNarrative(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs focus:border-teal-500 outline-none transition-colors h-20 resize-none text-slate-400"
                    placeholder="Describe the voice and style for AI refinement..."
                />
            </div>

            <div className="relative">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-500">Content (Markdown)</label>
                    <button
                        type="button"
                        onClick={handleRefine}
                        disabled={isRefining || !log.content}
                        className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border transition-all ${isRefining
                                ? 'bg-teal-500/20 border-teal-500/50 text-teal-400 animate-pulse'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-teal-500 hover:text-teal-400'
                            }`}
                    >
                        {isRefining ? 'Refining...' : 'Refine with AI ✨'}
                    </button>
                </div>
                <textarea
                    name="content"
                    value={log.content}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors h-64 resize-none font-mono"
                    placeholder="Write your raw thoughts here..."
                    required
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
                    Save Entry
                </button>
            </div>
        </form>
    );
};

export default LogForm;
