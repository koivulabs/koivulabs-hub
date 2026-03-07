'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const token = await credential.user.getIdToken();
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            router.push('/admin');
        } catch {
            setError('Access denied. Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black italic text-slate-100">
                        Lab <span className="text-teal-400">Access</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-2 tracking-widest uppercase">Restricted Zone</p>
                <a href="/" className="text-slate-600 hover:text-teal-400 text-[10px] tracking-widest uppercase transition-colors mt-3 inline-block">
                    ← Back to Koivu Labs
                </a>
                </div>

                <form onSubmit={handleLogin} className="tree-glass p-8 space-y-6">
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block mb-2">
                            Identity
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                            placeholder="admin@koivulabs.com"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block mb-2">
                            Passphrase
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs font-bold tracking-wide">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-black rounded-lg transition-all transform active:scale-95"
                    >
                        {loading ? 'AUTHENTICATING...' : 'ENTER LAB →'}
                    </button>
                </form>
            </div>
        </main>
    );
}
