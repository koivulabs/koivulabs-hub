'use client';

import { motion } from 'framer-motion';

interface RevealProps {
    children: React.ReactNode;
    /** Stagger delay in seconds */
    delay?: number;
    className?: string;
}

/**
 * Scroll-triggered reveal: content slides up and fades in once, on first view.
 * Reduced motion is handled centrally by MotionProvider (MotionConfig) —
 * do NOT branch the tree here, it causes SSR hydration mismatches.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay, ease: [0.21, 0.6, 0.35, 1] }}
        >
            {children}
        </motion.div>
    );
}
