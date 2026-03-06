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
