import React from 'react';

const techStyles: Record<string, string> = {
    'Next.js': 'bg-white/5 text-slate-200 border-white/10',
    'React': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'TypeScript': 'bg-blue-600/10 text-blue-400 border-blue-600/20',
    'Firebase': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Tailwind CSS': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'Python': 'bg-yellow-400/10 text-yellow-300 border-yellow-400/20',
    'PostgreSQL': 'bg-blue-700/10 text-blue-400 border-blue-700/20',
    'Supabase': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Node.js': 'bg-green-600/10 text-green-400 border-green-600/20',
    'OpenAI API': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Claude API': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Framer Motion': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'FastAPI': 'bg-teal-600/10 text-teal-400 border-teal-600/20',
    'Chart.js': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Whisper AI': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'Llama 3': 'bg-purple-600/10 text-purple-400 border-purple-600/20',
    'Monaco Editor': 'bg-blue-800/10 text-blue-400 border-blue-800/20',
    'Google Vision API': 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface TechBadgeProps {
    tech: string;
    size?: 'sm' | 'xs';
}

export default function TechBadge({ tech, size = 'sm' }: TechBadgeProps) {
    const style = techStyles[tech] ?? 'bg-slate-800/50 text-slate-400 border-slate-700/50';
    const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';

    return (
        <span className={`px-2.5 py-1 rounded-full border ${style} ${textSize} font-medium`}>
            {tech}
        </span>
    );
}
