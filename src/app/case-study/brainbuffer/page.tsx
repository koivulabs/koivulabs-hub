import { Metadata } from 'next';
import Link from 'next/link';
import TechBadge from '@/components/TechBadge';

export const metadata: Metadata = {
    title: 'BrainBuffer Case Study | Koivu Labs',
    description: 'How we built BrainBuffer — a premium AI cognitive offload tool for high-output creators. From zero to v4.3 in 60 days.',
    openGraph: {
        title: 'BrainBuffer Case Study | Koivu Labs',
        description: 'How we built BrainBuffer — a premium AI cognitive offload tool for high-output creators.',
    },
};

const stack = ['Next.js', 'PostgreSQL', 'Whisper AI', 'Tailwind CSS', 'OpenAI API'];

const metrics = [
    { value: 'v4.3', label: 'Current version' },
    { value: '< 2s', label: 'Avg. capture time' },
    { value: 'Fi / En', label: 'Languages' },
    { value: 'GPT-4o + R1', label: 'AI Engine' },
];

const timeline = [
    { phase: '01', title: 'Problem definition', detail: 'Mapped the exact moment of friction: the gap between a thought appearing and it being safely stored. Every existing tool was either too slow, too complex, or too ugly to use under cognitive load.' },
    { phase: '02', title: 'Core loop first', detail: 'Built the capture → structure → retrieve loop before any UI polish. Validated that AI-assisted structuring actually saved time vs. raw note-dumping.' },
    { phase: '03', title: 'Dual model architecture', detail: "GPT-4o handles real-time structuring and tagging. DeepSeek R1 handles longer reasoning tasks like synthesis and cross-note connections. Each model does what it's best at." },
    { phase: '04', title: 'Finnish-first design', detail: 'Built with Finnish language support from day one — not as an afterthought. Language detection is automatic; the AI responds in the language you input in.' },
    { phase: '05', title: 'PWA + offline core', detail: 'Thought capture cannot depend on network state. Core write operations work offline and sync when connection returns. Mobile home screen installable.' },
    { phase: '06', title: 'Iteration to v4.3', detail: 'Four major versions in under 60 days. Each version focused on a single improvement: speed, then AI quality, then UI clarity, then cross-device sync.' },
];

export default function BrainBufferCaseStudy() {
    return (
        <main className="min-h-screen bg-slate-950 pt-32 pb-32 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto">

                {/* Back */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors mb-16 group"
                >
                    <span className="text-xl">←</span>
                    <span className="text-sm font-semibold tracking-widest uppercase">Back to Hub</span>
                </Link>

                {/* Header */}
                <header className="mb-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase">
                            Flagship / Live
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">
                            Case Study
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 mb-6 italic">
                        Brain<span className="text-teal-400">Buffer</span>
                    </h1>
                    <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl">
                        Premium AI cognitive offload for high-output creators. Thought capture at the speed of light.
                    </p>
                </header>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                    {metrics.map(m => (
                        <div key={m.label} className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50 text-center">
                            <div className="text-2xl font-black text-teal-400 mb-1">{m.value}</div>
                            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{m.label}</div>
                        </div>
                    ))}
                </div>

                {/* The Problem */}
                <section className="mb-16">
                    <h2 className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase mb-6">The Problem</h2>
                    <div className="p-8 tree-glass border-teal-500/20 nordic-glow">
                        <p className="text-slate-100 text-xl italic leading-relaxed mb-6">
                            "Every tool I tried was either too slow, too complex, or too beautiful to actually use when a thought hit."
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            High-output creators — builders, founders, researchers — operate in a constant state of cognitive overflow.
                            A good idea has a half-life of seconds. The standard response is to grab your phone, open an app, navigate to a new note,
                            type in a small text box, and save. By then, the thought is either gone or distorted.
                        </p>
                        <p className="text-slate-400 leading-relaxed mt-4">
                            Existing note tools optimize for organization and retrieval. None of them optimize for the capture moment itself.
                            BrainBuffer was built to fix exactly that: zero-friction thought preservation with AI structuring happening automatically in the background.
                        </p>
                    </div>
                </section>

                {/* The Solution */}
                <section className="mb-16">
                    <h2 className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase mb-6">The Solution</h2>
                    <div className="space-y-4">
                        <p className="text-slate-300 text-lg leading-relaxed">
                            BrainBuffer reduces the capture flow to a single action. Open, dump, done. The AI handles everything else:
                            tagging, structuring, linking related thoughts, suggesting next actions. The user never touches organizational controls
                            during capture mode.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            The dual-model architecture splits responsibilities cleanly. GPT-4o runs in real-time alongside typing,
                            providing instant tagging and light structure. DeepSeek R1 processes in the background for deeper synthesis —
                            connecting today's thought to something you captured three weeks ago. Two engines, each doing what they're best at.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            Finnish and English are treated as equal first-class citizens. No language switching, no settings.
                            Write in Finnish, get Finnish back. Swap mid-thought if you want. The system follows you.
                        </p>
                    </div>
                </section>

                {/* Build Timeline */}
                <section className="mb-16">
                    <h2 className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase mb-6">Build Process</h2>
                    <div className="space-y-4">
                        {timeline.map(step => (
                            <div key={step.phase} className="flex gap-6 p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 group hover:border-teal-500/20 transition-all">
                                <span className="text-teal-400/30 font-black text-2xl shrink-0 group-hover:text-teal-400/60 transition-colors">
                                    {step.phase}
                                </span>
                                <div>
                                    <h3 className="text-slate-100 font-bold mb-2">{step.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{step.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack */}
                <section className="mb-16">
                    <h2 className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase mb-6">Stack</h2>
                    <div className="flex flex-wrap gap-3">
                        {stack.map(tech => (
                            <TechBadge key={tech} tech={tech} />
                        ))}
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mt-6">
                        Next.js handles both the frontend and the API layer. PostgreSQL stores structured thought data with full-text search.
                        Whisper AI powers voice-to-text capture. Tailwind keeps the UI surgical — every pixel intentional, nothing decorative.
                    </p>
                </section>

                {/* Key Learnings */}
                <section className="mb-20">
                    <h2 className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase mb-6">Key Learnings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Speed is the feature', body: 'Users tolerate imperfect AI output. They will not tolerate a 3-second load time before they can type. Perceived latency kills tools like this.' },
                            { title: 'AI should be invisible', body: 'The best moments in BrainBuffer are when users don\'t notice the AI at all — the structure just appears, the tags are already right.' },
                            { title: 'Build for one person first', body: 'The first version was built to solve my own exact problem. That constraint produced a more coherent product than any feature matrix would have.' },
                            { title: 'PWA over native (for now)', body: 'Shipping a PWA got BrainBuffer onto test devices in days, not weeks. When native-specific features are needed, the investment is justified. Until then, web wins.' },
                        ].map(l => (
                            <div key={l.title} className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40">
                                <h3 className="text-teal-400 text-sm font-bold mb-2">{l.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{l.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <div className="p-10 tree-glass border-teal-500/20 nordic-glow text-center">
                    <p className="text-[10px] text-teal-400/60 font-bold tracking-[0.4em] uppercase mb-4">Live Product</p>
                    <h2 className="text-2xl font-bold italic text-slate-100 mb-2">See it running.</h2>
                    <p className="text-slate-400 text-sm mb-8">BrainBuffer is live and being used daily. No demo account needed.</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href="https://brainbuffer.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-lg transition-all transform hover:scale-105 text-sm"
                        >
                            Launch BrainBuffer →
                        </a>
                        <Link
                            href="/brainbuffer"
                            className="px-8 py-3 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-800 transition-all text-sm"
                        >
                            Project Overview
                        </Link>
                    </div>
                </div>

                {/* Bottom nav */}
                <div className="mt-16 flex justify-between items-center">
                    <Link href="/" className="text-slate-500 hover:text-teal-400 text-[10px] font-bold tracking-widest uppercase transition-colors">
                        ← Back to Hub
                    </Link>
                    <Link href="/services" className="text-slate-500 hover:text-teal-400 text-[10px] font-bold tracking-widest uppercase transition-colors">
                        Work with us →
                    </Link>
                </div>
            </div>
        </main>
    );
}
