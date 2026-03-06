'use client';

import { useState } from 'react';

interface CopyEmailProps {
    email: string;
    className?: string;
}

export default function CopyEmail({ email, className = '' }: CopyEmailProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`group relative transition-colors ${className}`}
            title="Click to copy"
        >
            <span className={copied ? 'text-teal-400' : ''}>{copied ? '✓ Copied!' : email}</span>
        </button>
    );
}
