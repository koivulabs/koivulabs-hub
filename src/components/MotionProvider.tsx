'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Central reduced-motion policy for all framer-motion components.
 * reducedMotion="user" keeps the SSR/client tree identical (no branching
 * on matchMedia) and lets framer skip transform animations for users
 * with prefers-reduced-motion — opacity fades remain, which is the
 * accepted reduced-motion-safe pattern.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
