'use client';

import React, { useState } from 'react';
import { DevLog } from '@/lib/logService';

interface LogFormProps {
    initialLog?: DevLog;
    onSubmit: (log: DevLog) => void;
    onCancel: () => void;
}

interface SeoMeta {
    slug: string;
    meta_title: string;
    meta_description: string;
    tags: string[];
    aeo_keywords: string[];
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
    const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
    const [seoMeta, setSeoMeta] = useState<SeoMeta | null>(
        initialLog ? {
            slug: initialLog.id,
            meta_title: initialLog.metaTitle || '',
            meta_description: initialLog.metaDescription || '',
            tags: initialLog.tags || [],
            aeo_keywords: initialLog.aeoKeywords || [],
        } : null
    );
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
                body: JSON.stringify({ text: log.content, narrative })
            });
            const data = await res.json();
            if (data.refinedText) {
                setLog(prev => ({ ...prev, content: data.refinedText }));
            }
        } catch (error) {
            console.error('Refine failed:', error);
        } finally {
            setIsRefining(false);
        }
    };

    const handleGenerateMeta = async () => {
        if (!log.content) return;
        setIsGeneratingMeta(true);
        try {
            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: log.content })
            });
            const data = await res.json();
            if (data.metadata) {
                const meta: SeoMeta = data.metadata;
                setSeoMeta(meta);
                // Auto-fill slug if empty
                if (!log.id) {
                    setLog(prev => ({ ...prev, id: meta.slug }));
                }
                // Auto-fill tags
                setLog(prev => ({ ...prev, tags: meta.tags }));
            }
        } catch (error) {
            console.error('Metadata generation failed:', error);
        } finally {
            setIsGeneratingMeta(false);
        }
    };

    const handleSeoMetaChange = (field: keyof SeoMeta, value: string) => {
        setSeoMeta(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...log,
            metaTitle: seoMeta?.meta_title || undefined,
            metaDescription: seoMeta?.meta_description || undefined,
            aeoKeywords: seoMeta?.aeo_keywords || undefined,
        });
    };

    const inputClass = "w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-teal-500 outline-none transition-colors";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-slate-100">

            {/* ID + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Log ID (slug)</label>
                    <input
                        name="id"
                        value={log.id}
                        onChange={handleChange}
                        placeholder="e.g. implementing-ai-refinery"
                        className={inputClass}
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
                        className={inputClass}
                    >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </select>
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                <input
                    name="title"
                    value={log.title}
                    onChange={handleChange}
                    className={inputClass}
                    required
                />
            </div>

            {/* AI Narrative Voice */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">AI Narrative Voice</label>
                <textarea
                    value={narrative}
                    onChange={e => setNarrative(e.target.value)}
                    className={`${inputClass} h-20 resize-none text-slate-400 text-xs`}
                    placeholder="Describe the voice and style for AI refinement..."
                />
            </div>

            {/* Content */}
            <div className="relative">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-500">Content (Markdown)</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleGenerateMeta}
                            disabled={isGeneratingMeta || !log.content}
                            className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border transition-all ${isGeneratingMeta
                                ? 'bg-violet-500/20 border-violet-500/50 text-violet-400 animate-pulse'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-500 hover:text-violet-400'
                            }`}
                        >
                            {isGeneratingMeta ? 'Generating...' : 'Generate SEO →'}
                        </button>
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
                </div>
                <textarea
                    name="content"
                    value={log.content}
                    onChange={handleChange}
                    className={`${inputClass} h-64 resize-none font-mono`}
                    placeholder="Write your raw thoughts here..."
                    required
                />
            </div>

            {/* SEO Metadata Panel */}
            {seoMeta && (
                <div className="p-5 bg-slate-900/60 border border-violet-500/20 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-violet-400 text-[10px] font-black tracking-widest uppercase">SEO / AEO Metadata</span>
                        <span className="text-slate-700 text-[10px]">— AI generated, editable</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Meta Title <span className="text-slate-700 normal-case font-normal">max 60 chars</span></label>
                            <input
                                value={seoMeta.meta_title}
                                onChange={e => handleSeoMetaChange('meta_title', e.target.value)}
                                className={`${inputClass} text-xs`}
                                maxLength={60}
                            />
                            <span className="text-slate-700 text-[10px]">{seoMeta.meta_title.length}/60</span>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Slug</label>
                            <input
                                value={seoMeta.slug}
                                onChange={e => handleSeoMetaChange('slug', e.target.value)}
                                className={`${inputClass} text-xs font-mono`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Meta Description <span className="text-slate-700 normal-case font-normal">max 160 chars</span></label>
                        <textarea
                            value={seoMeta.meta_description}
                            onChange={e => handleSeoMetaChange('meta_description', e.target.value)}
                            className={`${inputClass} h-16 resize-none text-xs`}
                            maxLength={160}
                        />
                        <span className="text-slate-700 text-[10px]">{seoMeta.meta_description.length}/160</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {seoMeta.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-2">AEO Keywords</label>
                            <div className="flex flex-col gap-1">
                                {seoMeta.aeo_keywords.map(kw => (
                                    <span key={kw} className="text-[10px] text-slate-500 font-mono">→ {kw}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
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
