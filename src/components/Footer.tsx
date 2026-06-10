'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/references', label: 'Work' },
    { href: '/services', label: 'Services' },
    { href: '/logbook', label: 'Logbook' },
    { href: '/about', label: 'About' },
];

const metaLinks = [
    { href: '/now', label: 'Now' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/admin/login', label: 'Lab Access' },
];

const socials = [
    {
        href: 'https://github.com/koivulabs',
        label: 'GitHub',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
        ),
    },
    {
        href: 'https://x.com/koivu_labs',
        label: 'X / Twitter',
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        ),
    },
    {
        href: 'https://www.linkedin.com/in/keijo-koivunen-ab333a3b2/',
        label: 'LinkedIn',
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        ),
    },
];

const Footer: React.FC = () => {
    const pathname = usePathname();
    if (pathname.startsWith('/admin')) return null;

    return (
        <footer className="relative z-10 border-t border-slate-800/50">
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-5">
                        <Link href="/" className="font-black italic text-xl tracking-tight text-slate-100 hover:text-teal-400 transition-colors">
                            KOIVU <span className="text-teal-400">LABS</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mt-4 max-w-xs">
                            Pragmatic Intelligence. A Finnish software studio bridging human
                            common sense with AI power — from Saarijärvi to production.
                        </p>
                        <a
                            href="mailto:hello@koivulabs.com"
                            className="inline-block mt-6 text-teal-400 text-sm font-semibold hover:text-teal-300 transition-colors"
                        >
                            hello@koivulabs.com
                        </a>
                    </div>

                    {/* Navigate */}
                    <div className="md:col-span-3">
                        <h3 className="text-[10px] text-slate-600 font-bold tracking-[0.3em] uppercase mb-5">Navigate</h3>
                        <ul className="space-y-3">
                            {navLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-slate-400 text-sm hover:text-teal-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Studio */}
                    <div className="md:col-span-4">
                        <h3 className="text-[10px] text-slate-600 font-bold tracking-[0.3em] uppercase mb-5">Studio</h3>
                        <ul className="space-y-3 mb-8">
                            {metaLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-slate-400 text-sm hover:text-teal-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-4">
                            {socials.map(social => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="text-slate-600 hover:text-teal-400 transition-colors"
                                >
                                    {social.icon}
                                </a>
                            ))}
                            <a href="/rss.xml" aria-label="RSS Feed" className="text-slate-600 hover:text-teal-400 transition-colors">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} Koivu Labs
                    </p>
                    <p className="text-slate-700 text-[10px] font-bold tracking-widest uppercase">
                        Built with Nordic precision · Saarijärvi, Finland
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
