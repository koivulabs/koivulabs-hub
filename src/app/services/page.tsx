import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Services | Koivu Labs',
    description: 'Koivu Labs builds AI-first digital tools, consults on digital strategy, and runs applied research experiments. Finnish software studio based in Saarijärvi.',
};

const services = [
    {
        number: '01',
        title: 'Build',
        subtitle: 'AI-First Software Development',
        description: 'We design and build pragmatic digital tools from the ground up. Web applications, internal tools, MVPs. Every project is approached with minimal friction and maximum execution speed. We ship.',
        capabilities: [
            'Full-stack web applications',
            'AI-integrated workflows',
            'Firebase & cloud infrastructure',
            'UI/UX with Nordic precision',
        ],
    },
    {
        number: '02',
        title: 'Consult',
        subtitle: 'Digital Strategy & AI Integration',
        description: 'We help teams and businesses identify where AI can create real leverage — not theoretical, not hype. Concrete recommendations, technical audits, and hands-on integration support.',
        capabilities: [
            'AI readiness assessments',
            'Technical stack audits',
            'Workflow automation mapping',
            'Implementation roadmaps',
        ],
    },
    {
        number: '03',
        title: 'Experiment',
        subtitle: 'Applied Research & Prototyping',
        description: 'Some ideas need room to breathe before they become products. We run fast, structured experiments to validate concepts — failing cheaply and learning quickly.',
        capabilities: [
            'Concept prototyping',
            'LLM integration testing',
            'Feasibility analysis',
            'Research documentation',
        ],
    },
];

export default function ServicesPage() {
    return (
        <main className="min-h-screen pt-32 pb-32 px-6 md:px-12 lg:px-24 bg-slate-950">
            <div className="max-w-5xl mx-auto">
                <header className="mb-24">
                    <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                        What We Do
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 mb-6 italic">
                        Studio <span className="text-teal-400">Services</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl">
                        Three modes of operation. All grounded in pragmatic intelligence and Nordic execution discipline.
                    </p>
                </header>

                <div className="space-y-6">
                    {services.map((service) => (
                        <section
                            key={service.number}
                            className="tree-glass p-8 md:p-12 group hover:border-teal-500/30 transition-all duration-500"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                <div>
                                    <div className="flex items-baseline gap-4 mb-4">
                                        <span className="text-teal-400/30 font-black text-4xl">{service.number}</span>
                                        <div>
                                            <h2 className="text-3xl font-bold italic text-slate-100 group-hover:text-teal-400 transition-colors">
                                                {service.title}
                                            </h2>
                                            <p className="text-[10px] text-teal-400/60 font-bold tracking-[0.3em] uppercase mt-1">
                                                {service.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4">Capabilities</h3>
                                    <ul className="space-y-3">
                                        {service.capabilities.map((cap) => (
                                            <li key={cap} className="flex items-center gap-3 text-slate-300 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 shrink-0" />
                                                {cap}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-24 p-12 tree-glass border-teal-500/20 nordic-glow text-center">
                    <h2 className="text-2xl font-bold italic text-slate-100 mb-4">
                        Ready to work with the lab?
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Direct communication. No account managers, no delays. Tell us what you're building.
                    </p>
                    <a
                        href="mailto:hello@koivulabs.com"
                        className="inline-block px-8 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-lg transition-all transform hover:scale-105"
                    >
                        hello@koivulabs.com
                    </a>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-slate-600 hover:text-teal-400 text-[10px] tracking-widest uppercase transition-colors">
                        ← Return to Hub
                    </Link>
                </div>
            </div>
        </main>
    );
}
