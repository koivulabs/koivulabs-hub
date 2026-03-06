'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handler = () => setVisible(window.scrollY > 500);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    if (!visible) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-40 w-10 h-10 bg-slate-900 border border-slate-700 text-teal-400 rounded-full flex items-center justify-center hover:border-teal-500 hover:bg-slate-800 transition-all duration-300 shadow-lg"
            aria-label="Back to top"
        >
            ↑
        </button>
    );
}
