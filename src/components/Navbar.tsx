'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
    { href: '/#lab', label: 'Projects' },
    { href: '/logbook', label: 'Logbook' },
    { href: '/services', label: 'Services' },
    { href: '/now', label: 'Now' },
    { href: '/about', label: 'About' },
];

const Navbar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => setOpen(false), [pathname]);

    if (pathname.startsWith('/admin')) return null;

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50' : 'bg-transparent'}`}>
            <nav className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                <Link href="/" className="font-black italic text-lg tracking-tight text-slate-100 hover:text-teal-400 transition-colors">
                    KOIVU <span className="text-teal-400">LABS</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${pathname === link.href ? 'text-teal-400' : 'text-slate-400 hover:text-slate-100'}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
                        <a href="#" aria-label="GitHub" className="text-slate-600 hover:text-slate-300 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                        </a>
                        <a href="#" aria-label="X / Twitter" className="text-slate-600 hover:text-slate-300 transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="#" aria-label="LinkedIn" className="text-slate-600 hover:text-slate-300 transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                    </div>
                    <a
                        href="mailto:hello@koivulabs.com"
                        className="px-4 py-2 border border-teal-500/30 text-teal-400 text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg hover:bg-teal-500/10 transition-all"
                    >
                        Contact
                    </a>
                </div>

                <button
                    className="md:hidden flex flex-col gap-1 p-2"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-5 h-0.5 bg-slate-400 transition-all duration-300 ${open ? 'rotate-45 translate-y-[6px]' : ''}`} />
                    <span className={`block w-5 h-0.5 bg-slate-400 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
                    <span className={`block w-5 h-0.5 bg-slate-400 transition-all duration-300 ${open ? '-rotate-45 -translate-y-[6px]' : ''}`} />
                </button>
            </nav>

            {open && (
                <div className="md:hidden bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50 px-6 py-8 flex flex-col gap-6">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-bold tracking-widest uppercase text-slate-300 hover:text-teal-400 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <a href="mailto:hello@koivulabs.com" className="text-sm font-bold tracking-widest uppercase text-teal-400">
                        Contact →
                    </a>
                </div>
            )}
        </header>
    );
};

export default Navbar;
