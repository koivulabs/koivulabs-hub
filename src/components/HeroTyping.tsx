'use client';

import { useEffect, useState } from 'react';

const TAGLINE = 'Pragmatic Intelligence. Bridging human common sense with AI power.';

export default function HeroTyping() {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(TAGLINE.slice(0, i + 1));
            i++;
            if (i >= TAGLINE.length) {
                clearInterval(interval);
                setDone(true);
            }
        }, 22);
        return () => clearInterval(interval);
    }, []);

    return (
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed mb-8">
            {displayed}
            {!done && <span className="animate-pulse text-teal-400">|</span>}
        </p>
    );
}
