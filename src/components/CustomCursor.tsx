'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Trailing cursor ring: a teal ring lerps after the native cursor and grows
 * over interactive elements. The native cursor stays visible (a11y) — this
 * augments rather than replaces it. Desktop fine-pointer only.
 */
export default function CustomCursor() {
    const ringRef = useRef<HTMLDivElement>(null);
    const [enabled, setEnabled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const fine = window.matchMedia('(pointer: fine)').matches;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setEnabled(fine && !reduced);
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const ring = ringRef.current;
        if (!ring) return;

        let x = window.innerWidth / 2, y = window.innerHeight / 2;
        let tx = x, ty = y;
        let scale = 1, tScale = 1;
        let visible = false;

        const onMove = (e: PointerEvent) => {
            tx = e.clientX; ty = e.clientY;
            if (!visible) { visible = true; ring.style.opacity = '1'; x = tx; y = ty; }
            const interactive = (e.target as Element | null)?.closest?.('a, button, [role="button"], input, select, textarea, label');
            tScale = interactive ? 2.2 : 1;
        };
        const onLeave = () => { visible = false; ring.style.opacity = '0'; };
        const onDown = () => { tScale = 0.8; };
        const onUp = () => { tScale = 1; };

        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);

        let raf = 0;
        const tick = () => {
            x += (tx - x) * 0.18;
            y += (ty - y) * 0.18;
            scale += (tScale - scale) * 0.2;
            ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            document.documentElement.removeEventListener('pointerleave', onLeave);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
        };
    }, [enabled]);

    if (!enabled || pathname.startsWith('/admin')) return null;

    return (
        <div
            ref={ringRef}
            aria-hidden="true"
            className="fixed top-0 left-0 z-[80] w-8 h-8 rounded-full border border-teal-400/60 pointer-events-none opacity-0 transition-opacity duration-300"
        />
    );
}
