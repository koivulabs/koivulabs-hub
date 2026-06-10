'use client';

import { useEffect, useRef } from 'react';

interface MagneticProps {
    children: React.ReactNode;
    /** How far (px) the pull field reaches from the element center */
    radius?: number;
    /** 0–1, how strongly the element follows the cursor */
    strength?: number;
    className?: string;
}

/** Wraps content that gets pulled toward the cursor inside `radius`. */
export default function Magnetic({ children, radius = 120, strength = 0.3, className = '' }: MagneticProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;

        let raf = 0;
        const onMove = (e: PointerEvent) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const rect = el.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                const dist = Math.hypot(dx, dy);
                if (dist < radius) {
                    const pull = (1 - dist / radius) * strength;
                    el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
                } else if (el.style.transform) {
                    el.style.transform = '';
                }
            });
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
        };
    }, [radius, strength]);

    return (
        <span ref={ref} className={`inline-block transition-transform duration-200 ease-out will-change-transform ${className}`}>
            {children}
        </span>
    );
}
