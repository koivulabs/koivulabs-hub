export interface Project {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    url: string;
    logoUrl: string;
    category: 'Productivity' | 'Finance' | 'Social' | 'Utility' | 'OS' | 'Infrastructure';
    status: 'Flagship' | 'Active Lab' | 'Experimental' | 'Legacy';
    features: string[];
    techStack: string[];
    vision: string;
    currentMission?: string;
    // 'canopy' = visible in the birch tree crown (existing projects)
    // 'roots'  = underground section — new/growing projects
    zone: 'canopy' | 'roots';
    treePosition: { x: number; y: number };
}

export const projects: Project[] = [
    {
        id: 'brainbuffer',
        name: 'BrainBuffer',
        description: 'Thought capture at the speed of light. Minimalist tool for instant idea preservation.',
        longDescription: 'BrainBuffer is designed for high-performance individuals who need to offload thoughts instantly without friction. It serves as a digital extension of your working memory, ensuring no insight is lost to the void of distraction.',
        url: 'https://brainbuffer.app',
        logoUrl: '/logos/brainbuffer.png',
        category: 'Productivity',
        status: 'Flagship',
        features: ['Instant Voice Capture', 'Minimalist UI', 'Bi-directional Sync', 'Offline First'],
        techStack: ['Next.js', 'PostgreSQL', 'Whisper AI', 'Tailwind CSS'],
        vision: 'To make the gap between thought and storage zero.',
        currentMission: 'Optimizing Voice-to-Text latency for instant capture.',
        zone: 'canopy',
        treePosition: { x: 50, y: 15 }
    },
    {
        id: 'human-dashboard',
        name: 'Human Dashboard',
        description: 'Central OS for life and projects. Everything manageable in one sophisticated view.',
        longDescription: 'A comprehensive control center that bridges the gap between digital projects and physical life. Human Dashboard provides a unified interface for tracking goals, health metrics, and project progress in a single, Nordic-inspired dashboard.',
        url: 'https://human-dash2.vercel.app/',
        logoUrl: '/logos/human-dash.png',
        category: 'OS',
        status: 'Active Lab',
        features: ['Unified API Integration', 'Health Metric Tracking', 'Project Lifecycle Management', 'Visual Goal Mapping'],
        techStack: ['React', 'Supabase', 'TypeScript', 'Node.js'],
        vision: 'The operating system for the modern human.',
        currentMission: 'Integrating GitHub contribution calendar into the main view.',
        zone: 'canopy',
        treePosition: { x: 66, y: 29 }
    },
    {
        id: 'vuoto',
        name: 'Vuoto',
        description: 'Financial tracking and receipt management. Stop your money from leaking.',
        longDescription: 'Vuoto is a pragmatic financial companion that focuses on the "leakage" in personal economy. By combining OCR receipt scanning with intelligent categorization, it helps users identify where their resources are truly going.',
        url: 'https://receipt-2b283.web.app/',
        logoUrl: '/logos/vuoto.png',
        category: 'Finance',
        status: 'Active Lab',
        features: ['AI Receipt Scanning', 'Leakage Analytics', 'Multi-currency Support', 'Exportable Reports'],
        techStack: ['Next.js', 'Firebase', 'Google Vision API', 'Chart.js'],
        vision: 'Financial clarity through pragmatic intelligence.',
        currentMission: 'Refining OCR accuracy for complex retail receipts.',
        zone: 'canopy',
        treePosition: { x: 35, y: 29 }
    },
    {
        id: 'jobbot',
        name: 'JobBot',
        description: 'Intelligent tool for job seeking and career management.',
        longDescription: 'JobBot streamlines the modern career search by automating the tracking of applications and providing AI-driven feedback on CV compatibility. It turns the chaotic process of job hunting into a structured pipeline.',
        url: '#',
        logoUrl: '/logos/jobbot.png',
        category: 'Utility',
        status: 'Active Lab',
        features: ['Application Tracker', 'CV Analysis', 'Interview Simulation', 'Market Insight Scraping'],
        techStack: ['Python', 'FastAPI', 'Llama 3', 'React'],
        vision: 'Taking the stress out of professional growth.',
        currentMission: 'Expanding market insight scraping to international platforms.',
        zone: 'canopy',
        treePosition: { x: 26, y: 49 }
    },
    {
        id: 'vibe-checker',
        name: 'Vibe Checker',
        description: 'Analysis of social energy and vibes for optimized interaction.',
        longDescription: 'An experimental tool that uses sentiment analysis and social dynamics modeling to help users understand the "vibe" of a digital conversation or social environment before engaging.',
        url: '#',
        logoUrl: '/logos/vibe.png',
        category: 'Social',
        status: 'Active Lab',
        features: ['Sentiment Heatmaps', 'Digital Tone Analysis', 'Interaction Energy Modeling', 'Vibe Notifications'],
        techStack: ['Next.js', 'OpenAI API', 'Tailwind CSS', 'Framer Motion'],
        vision: 'Quantifying the unquantifiable social energy.',
        currentMission: 'Training neural models on nuanced Nordic communication styles.',
        zone: 'canopy',
        treePosition: { x: 74, y: 49 }
    },
    {
        id: 'mpm',
        name: 'MPM',
        description: 'Multi-Project Manager. Early coding experiments in project organization.',
        longDescription: 'The Multi-Project Manager (MPM) represents the roots of Koivu Labs. It was the first attempt at creating a unified interface for project management, laying the groundwork for what would eventually become the Human Dashboard.',
        url: '#',
        logoUrl: '/logos/mpm.png',
        category: 'Utility',
        status: 'Legacy',
        features: ['Simple Task Lists', 'Basic Time Tracking', 'File Organization', 'Context Notes'],
        techStack: ['HTML/CSS', 'JavaScript', 'Local Storage'],
        vision: 'The beginning of organized digital life.',
        zone: 'canopy',
        treePosition: { x: 38, y: 72 }
    },
    {
        id: 'vibe-coder',
        name: 'Vibe Coder',
        description: 'Tool for utilizing the "vibe coding" method in modern development.',
        longDescription: 'Vibe Coder is an experimental playground for exploring the synergy between intuition and AI-assisted programming. It implements the "vibe coding" philosophy: moving fast with high-level intent and AI execution.',
        url: '#',
        logoUrl: '/logos/vibecoder.png',
        category: 'Utility',
        status: 'Experimental',
        features: ['Intent-to-Code mapping', 'Vibe-based Debugging', 'Dynamic Code Generation', 'Feedback Loops'],
        techStack: ['Next.js', 'Claude API', 'Tailwind CSS', 'Monaco Editor'],
        vision: 'Redefining development at the speed of thought.',
        currentMission: 'Exploring late-stage code generation with deep context injection.',
        zone: 'canopy',
        treePosition: { x: 62, y: 72 }
    },
    {
        id: 'koivu-voice',
        name: 'Koivu Voice',
        description: 'Voice-to-logbook pipeline. Speak a thought, it ships as a published post.',
        longDescription: 'Koivu Voice is the studio\'s internal publishing nervous system. A Telegram bot listens for voice memos or text, routes them through OpenAI Whisper for transcription, refines the raw thought into a structured logbook entry with GPT-4o, then commits the markdown file to GitHub and writes to Firestore simultaneously. The entire chain from thought to live post runs in seconds with no manual steps.',
        url: '#',
        logoUrl: '/logos/koivu-voice.png',
        category: 'Infrastructure',
        status: 'Active Lab',
        features: ['Telegram Bot Interface', 'Whisper Voice Transcription', 'GPT-4o AI Refinement', 'Auto-publish to GitHub + Firestore'],
        techStack: ['Telegram Bot API', 'OpenAI Whisper', 'GPT-4o', 'Next.js', 'Firestore REST API'],
        vision: 'Zero friction from raw thought to published post.',
        currentMission: 'Field testing voice-to-logbook pipeline in daily studio use.',
        zone: 'canopy',
        treePosition: { x: 84, y: 62 }
    },
    {
        id: 'skillboost-suomi',
        name: 'SkillBoost Suomi',
        description: 'Free education recommendation tool for job seekers and career switchers in Finland.',
        longDescription: 'SkillBoost Suomi fetches real-time course data from Opintopolku.fi\'s open API and scores them based on the user\'s profile using a BM25-based algorithm. It provides personalized recommendations, labor market statistics, and an educational path map to assist in career planning.',
        url: 'https://skillboost-finland.vercel.app',
        logoUrl: '/logos/skillboost.png',
        category: 'Utility',
        status: 'Active Lab',
        features: ['Real-time Course Recommendations', 'Opintopolku API Integration', 'Statistics Finland Data Visualization', 'Personalized Career Action Plan (PDF)'],
        techStack: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS', 'Recharts'],
        vision: 'Bridging the gap between education and employment through intelligent guidance.',
        currentMission: 'Expanding API coverage and refining the recommendation scoring model.',
        zone: 'canopy',
        treePosition: { x: 18, y: 38 }
    },
    // ─── ROOTS ───────────────────────────────────────────────────────────────
    // Projects growing underground — new products in active development
    {
        id: 'unreel',
        name: 'UnReel',
        description: 'YouTube video truth analyzer. Cuts through hype to tell you what a video actually contains.',
        longDescription: 'UnReel is a multi-model video research tool that watches YouTube videos the way a critical analyst would. Gemini processes visual content natively while a user-selected thinking AI (Claude, GPT-4o, or Gemini) generates structured reports, claim maps, and a trust score — exposing sales funnels, sponsored content, and misinformation in seconds.',
        url: '#',
        logoUrl: '/logos/unreel.png',
        category: 'Utility',
        status: 'Active Lab',
        features: ['Multi-model Analysis Pipeline', 'Bullshit Detector / Trust Score', 'Claim Map with Fact-check', 'Full Report & Article Export'],
        techStack: ['Next.js', 'Gemini', 'Claude API', 'TypeScript', 'Firebase'],
        vision: 'Make every YouTube video auditable in seconds.',
        currentMission: 'Shipping MVP with Quick Scan and Trust Score — full report mode in next sprint.',
        zone: 'roots',
        treePosition: { x: 30, y: 40 }
    },
    {
        id: 'voice2post',
        name: 'Voice2Post',
        description: 'Record your voice, get a publish-ready social post. Zero editing friction.',
        longDescription: 'Voice2Post captures raw voice recordings and transforms them into polished, platform-ready content using AI transcription and rewriting. The user speaks naturally, selects the target platform and tone, and the post is ready. Built for founders, creators, and anyone who thinks faster than they type.',
        url: '#',
        logoUrl: '/logos/voice2post.png',
        category: 'Productivity',
        status: 'Active Lab',
        features: ['Voice Recording Interface', 'AI Transcription', 'Multi-platform Post Formatting', 'Tone & Style Selection'],
        techStack: ['Next.js', 'Firebase', 'OpenAI Whisper', 'TypeScript', 'Tailwind CSS'],
        vision: 'Collapse the distance between a thought and a published post.',
        currentMission: 'Finalizing post review UI and Firebase auth — preparing for Vercel deployment under KoivuLabs.',
        zone: 'roots',
        treePosition: { x: 60, y: 35 }
    },
    {
        id: 'koivuchat',
        name: 'KoivuChat',
        description: 'AI chatbot platform for Finnish businesses. Custom-trained, brand-matched, GDPR-ready.',
        longDescription: 'KoivuChat is the commercial chatbot product from Koivu Labs — now in its third generation. V3 is built entirely custom: no Flowise, no Qdrant, just Next.js + Firebase + LLM APIs. It learns from the client\'s data and answers customer questions 24/7. Deployed as an embeddable widget that matches the client\'s brand. Currently powering Call2u\'s customer service.',
        url: '/koivuchat',
        logoUrl: '/logos/koivuchat.png',
        category: 'Infrastructure',
        status: 'Flagship',
        features: ['Custom AI Training', 'Embeddable Widget', 'Brand-matched Design', 'GDPR / EU Data Compliance'],
        techStack: ['Next.js', 'Firebase', 'Claude API', 'TypeScript', 'Tailwind CSS'],
        vision: 'Every Finnish business deserves an AI that speaks their language.',
        currentMission: 'V3 architecture stabilization. Re-speccing product page to match new reality.',
        zone: 'roots',
        treePosition: { x: 45, y: 65 }
    }
];
