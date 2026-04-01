'use client';

import React, { useState } from 'react';
import InteractiveProjectTree from './InteractiveProjectTree';
import RootSystem from './RootSystem';
import ProjectIndex from './ProjectIndex';

const EcosystemSection: React.FC = () => {
    const [showVisual, setShowVisual] = useState(true);

    return (
        <>
            {/* Toggle button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowVisual(!showVisual)}
                    className="px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 border bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-500"
                >
                    {showVisual ? 'Hide Visual Ecosystem' : 'Show Visual Ecosystem'}
                </button>
            </div>

            {/* Visual sections — toggle controlled */}
            {showVisual && (
                <div className="space-y-8">
                    {/* The Birch Tech-Tree */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-sm font-bold tracking-[0.5em] text-slate-500 uppercase mb-2">Technical Ecosystem</h2>
                                <p className="text-2xl text-slate-100 font-light italic">The Birch Tech-Tree <span className="text-teal-400">v1.6</span></p>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-xs text-slate-500 max-w-xs leading-relaxed uppercase tracking-widest opacity-60 font-medium">
                                    Mapping strategic project missions across the neural birch structure.
                                </p>
                            </div>
                        </div>
                        <InteractiveProjectTree />
                    </div>

                    {/* The Root System */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-sm font-bold tracking-[0.5em] text-amber-700/60 uppercase mb-2">Underground</h2>
                                <p className="text-2xl text-slate-100 font-light italic">Root System <span className="text-amber-400">— Growing</span></p>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-xs text-slate-500 max-w-xs leading-relaxed uppercase tracking-widest opacity-60 font-medium">
                                    Projects taking shape. Not yet in the canopy — still putting down roots.
                                </p>
                            </div>
                        </div>
                        <RootSystem />
                    </div>
                </div>
            )}

            {/* Project Index — always visible */}
            <div className="mt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-sm font-bold tracking-[0.5em] text-slate-500 uppercase mb-2">Project Index</h2>
                        <p className="text-2xl text-slate-100 font-light italic">All projects — <span className="text-teal-400">filterable</span></p>
                    </div>
                </div>
                <ProjectIndex />
            </div>
        </>
    );
};

export default EcosystemSection;
