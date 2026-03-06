import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
            <div className="text-center">
                <p className="text-teal-500 font-black text-sm tracking-[0.5em] uppercase mb-6">404</p>
                <h1 className="text-6xl md:text-8xl font-black italic text-slate-100 mb-6">
                    Lost in the<br /><span className="text-teal-400">Forest</span>
                </h1>
                <p className="text-slate-500 mb-12 max-w-sm mx-auto leading-relaxed">
                    This path doesn't exist in the birch network. Navigate back to the lab.
                </p>
                <Link
                    href="/"
                    className="px-8 py-3 bg-teal-500 text-slate-950 font-black rounded-lg hover:bg-teal-400 transition-all"
                >
                    Return to Hub →
                </Link>
            </div>
        </main>
    );
}
