import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy | Koivu Labs',
    description: 'Privacy policy for Koivu Labs. How we handle data in compliance with GDPR and Finnish law.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen pt-32 pb-32 px-6 md:px-12 lg:px-24 bg-slate-950">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold italic text-slate-100 mb-4">
                        Privacy <span className="text-teal-400">Policy</span>
                    </h1>
                    <p className="text-slate-500 text-sm">Last updated: March 2026</p>
                </header>

                <div className="prose prose-invert max-w-none space-y-12 text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-100 mb-4">1. Data Controller</h2>
                        <p>
                            Koivu Labs<br />
                            Saarijärvi, Finland<br />
                            Email: <a href="mailto:hello@koivulabs.com" className="text-teal-400 hover:underline">hello@koivulabs.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-100 mb-4">2. Data We Collect</h2>
                        <p className="mb-4">
                            Koivu Labs collects minimal data. We operate on a privacy-by-default principle.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex gap-3">
                                <span className="text-teal-400 font-bold shrink-0">—</span>
                                <span><strong className="text-slate-300">Authentication data:</strong> Email address and password hash, stored by Firebase Authentication, used exclusively for admin portal access. This data is never shared or sold.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-teal-400 font-bold shrink-0">—</span>
                                <span><strong className="text-slate-300">Content data:</strong> Project information and dev log entries stored in Firebase Firestore. This is editorial content, not personal user data.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-teal-400 font-bold shrink-0">—</span>
                                <span><strong className="text-slate-300">Visitor data:</strong> We do not currently run active analytics or tracking on public-facing pages. No cookies are placed on visitors without consent.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-100 mb-4">3. Third-Party Services</h2>
                        <ul className="space-y-3">
                            <li className="flex gap-3">
                                <span className="text-teal-400 font-bold shrink-0">—</span>
                                <span><strong className="text-slate-300">Firebase (Google):</strong> Used for authentication and database storage. Subject to Google's privacy policy. Data is stored in EU regions where possible.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-teal-400 font-bold shrink-0">—</span>
                                <span><strong className="text-slate-300">Vercel:</strong> Hosting provider. May log request metadata (IP, user agent) for security and performance purposes per their privacy policy.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-teal-400 font-bold shrink-0">—</span>
                                <span><strong className="text-slate-300">OpenAI:</strong> Used optionally for AI text refinement in the admin portal. Text submitted for refinement is processed according to OpenAI's data policy. No public visitor data is sent to OpenAI.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-100 mb-4">4. Legal Basis for Processing</h2>
                        <p>
                            Processing of admin authentication data is based on legitimate interest in securing the content management system. No personal data of public visitors is actively processed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-100 mb-4">5. Data Retention</h2>
                        <p>
                            Authentication data is retained as long as the admin account is active. Content data (projects, logs) is retained indefinitely as editorial content. You may request deletion at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-100 mb-4">6. Your Rights (GDPR)</h2>
                        <p className="mb-4">Under the General Data Protection Regulation, you have the right to:</p>
                        <ul className="space-y-2">
                            {[
                                'Access the personal data we hold about you',
                                'Request correction of inaccurate data',
                                'Request deletion of your data',
                                'Object to processing',
                                'Data portability',
                                'Lodge a complaint with the Finnish Data Protection Ombudsman (tietosuoja.fi)',
                            ].map(right => (
                                <li key={right} className="flex gap-3">
                                    <span className="text-teal-400 font-bold shrink-0">—</span>
                                    <span>{right}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-100 mb-4">7. Contact</h2>
                        <p>
                            For any privacy-related requests or questions, contact us at{' '}
                            <a href="mailto:hello@koivulabs.com" className="text-teal-400 hover:underline">hello@koivulabs.com</a>.
                            We respond within 30 days as required by GDPR.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-800/50">
                    <Link href="/" className="text-slate-600 hover:text-teal-400 text-[10px] tracking-widest uppercase transition-colors">
                        ← Return to Hub
                    </Link>
                </div>
            </div>
        </main>
    );
}
