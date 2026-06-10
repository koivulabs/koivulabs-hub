'use client';

import { usePathname } from 'next/navigation';
import AuroraBackground from './AuroraBackground';

/** Mounts the aurora per route: full strength on home, ambient elsewhere, off in admin. */
export default function AuroraRoute() {
    const pathname = usePathname();
    if (pathname.startsWith('/admin')) return null;
    return <AuroraBackground intensity={pathname === '/' ? 1 : 0.4} />;
}
