'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

/** Lenis inertial scrolling. Skipped for reduced motion, touch devices and /admin. */
export default function SmoothScroll() {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname.startsWith('/admin')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const lenis = new Lenis({
            autoRaf: true,
            anchors: true,
            lerp: 0.12,
        });

        return () => lenis.destroy();
    }, [pathname]);

    return null;
}
