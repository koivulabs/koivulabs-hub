'use client';

import React, { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
    const [status, setStatus] = useState<Status>('idle');
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            setStatus(res.ok ? 'sent' : 'error');
        } catch {
            setStatus('error');
        }
    };

    if (status === 'sent') {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 text-2xl mb-6">
                    ✓
                </div>
                <h3 className="text-xl font-bold italic text-slate-100 mb-2">Message received.</h3>
                <p className="text-slate-400 text-sm">I'll get back to you within 24h. Nordic efficiency guaranteed.</p>
            </div>
        );
    }

    const inputClass = "w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:bg-slate-900/80 transition-all";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Name</label>
                    <input
                        name="name"
                        type="text"
                        required
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Subject</label>
                <select
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="" disabled>Select engagement type</option>
                    <option value="Build — Custom Development">Build — Custom Development</option>
                    <option value="Consult — AI Strategy">Consult — AI Strategy</option>
                    <option value="Experiment — Research Collab">Experiment — Research Collab</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Message</label>
                <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe what you're building or what you need..."
                    value={form.message}
                    onChange={handleChange}
                    className={inputClass}
                />
            </div>

            {status === 'error' && (
                <p className="text-red-400 text-xs font-bold tracking-widest uppercase">
                    Something went wrong. Email hello@koivulabs.com directly.
                </p>
            )}

            <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-black rounded-lg transition-all transform hover:scale-[1.02] text-sm tracking-widest uppercase"
            >
                {status === 'sending' ? 'Sending...' : 'Send Message →'}
            </button>
        </form>
    );
}
