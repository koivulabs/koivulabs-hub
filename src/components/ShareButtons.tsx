'use client';

import { useState } from 'react';

interface ShareButtonsProps {
    title: string;
    url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const encoded = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return (
        <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">Share</span>
            <a
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-500 hover:text-teal-400 transition-colors font-bold tracking-widest uppercase"
            >
                X / Twitter
            </a>
            <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-500 hover:text-teal-400 transition-colors font-bold tracking-widest uppercase"
            >
                LinkedIn
            </a>
            <button
                onClick={copyLink}
                className="text-[10px] font-bold tracking-widest uppercase transition-colors"
                style={{ color: copied ? '#2dd4bf' : '' }}
            >
                {copied ? '✓ Copied' : 'Copy Link'}
            </button>
        </div>
    );
}
