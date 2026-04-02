import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

// --- Parse service account from .env.local ---
const envContent = readFileSync('.env.local', 'utf-8');

// Extract raw value between outer quotes
const saStart = envContent.indexOf('FIREBASE_SERVICE_ACCOUNT_KEY="') + 'FIREBASE_SERVICE_ACCOUNT_KEY="'.length;
let saEnd = envContent.length;
for (let i = saStart; i < envContent.length; i++) {
  // Find closing " that's followed by newline or EOF (not escaped \")
  if (envContent[i] === '"' && envContent[i - 1] !== '\\' && (i + 1 >= envContent.length || envContent[i + 1] === '\n' || envContent[i + 1] === '\r')) {
    saEnd = i;
    break;
  }
}
let raw = envContent.substring(saStart, saEnd);

// Unescape \" -> "
raw = raw.replace(/\\"/g, '"');

// Now raw has literal \n for ALL newlines. We need:
// - structural \n -> real newlines (for JSON formatting)
// - private_key internal \n -> keep as \n (it's a JSON escape)
// Strategy: just write as-is and replace \n with real newlines,
// then fix private key by re-escaping newlines inside it.

// Actually simpler: the raw string IS valid JSON if we interpret \n as literal chars.
// We just need to eval it as if \n means newline. Use Function constructor to process escapes.
const jsonStr = raw.replace(/\\n/g, '\n');

// Now re-escape newlines ONLY inside string values for valid JSON
// Split by lines, rejoin
const lines = jsonStr.split('\n');
let result = '';
let inString = false;
for (const char of jsonStr) {
  if (char === '"' && result[result.length - 1] !== '\\') {
    inString = !inString;
  }
  if (char === '\n' && inString) {
    result += '\\n';
  } else {
    result += char;
  }
}

const serviceAccount = JSON.parse(result);
console.log('Service account loaded:', serviceAccount.project_id);

// --- Init Firebase ---
const projectId = serviceAccount.project_id;
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId,
});
const db = getFirestore(app);

// --- Static projects (inline to avoid TS import issues) ---
const projects = [
  { id: 'brainbuffer', name: 'BrainBuffer', description: 'Thought capture at the speed of light. Minimalist tool to dump, tag, and retrieve ideas instantly.', longDescription: 'BrainBuffer is a frictionless thought-capture tool designed for fast-moving minds.', url: 'https://brainbuffer.app', logoUrl: '', category: 'Productivity', status: 'Flagship', features: ['Instant capture', 'Smart tagging', 'Quick retrieval', 'Minimal UI'], techStack: ['Next.js', 'Firebase', 'Vercel'], vision: 'The fastest path from thought to record.', currentMission: 'Public Beta Polish', zone: 'canopy', treePosition: { x: 50, y: 15 } },
  { id: 'human-dashboard', name: 'Human Dashboard', description: 'Central OS for life and projects. Everything in one view.', longDescription: 'Human Dashboard is a personal operating system.', url: 'https://humandashboard.app', logoUrl: '', category: 'OS', status: 'Active Lab', features: ['Life dashboard', 'Project tracking', 'Habit monitoring', 'Goal setting'], techStack: ['React', 'Firebase', 'Vite'], vision: 'One screen to run your entire life.', currentMission: 'Integrating AI summaries', zone: 'canopy', treePosition: { x: 66, y: 29 } },
  { id: 'vuoto', name: 'Vuoto', description: 'Financial tracking and receipt management.', longDescription: 'Vuoto brings clarity to personal finances.', url: 'https://vuoto.app', logoUrl: '', category: 'Finance', status: 'Active Lab', features: ['Receipt scanning', 'Expense tracking', 'Spending insights', 'Budget alerts'], techStack: ['Next.js', 'Firebase', 'OpenAI Vision'], vision: 'Financial clarity through intelligent automation.', currentMission: 'Receipt AI pipeline', zone: 'canopy', treePosition: { x: 35, y: 29 } },
  { id: 'jobbot', name: 'JobBot', description: 'AI-powered job application assistant.', longDescription: 'JobBot streamlines the job application process.', url: 'https://jobbot.fi', logoUrl: '', category: 'Productivity', status: 'Active Lab', features: ['AI cover letters', 'CV generation', 'Job matching', 'Application tracking'], techStack: ['Next.js', 'OpenAI', 'Firebase'], vision: 'Never write a cover letter from scratch again.', currentMission: 'Multi-language support', zone: 'canopy', treePosition: { x: 26, y: 49 } },
  { id: 'vibe-checker', name: 'Vibe Checker', description: 'Real-time sentiment analysis for text and conversations.', longDescription: 'Vibe Checker analyzes text sentiment in real-time.', url: '', logoUrl: '', category: 'Social', status: 'Active Lab', features: ['Sentiment analysis', 'Tone detection', 'Message scoring', 'Conversation insights'], techStack: ['React', 'OpenAI', 'Vercel'], vision: 'Read the room before you enter it.', currentMission: 'Chrome extension MVP', zone: 'canopy', treePosition: { x: 74, y: 49 } },
  { id: 'mpm', name: 'MPM', description: 'Micro Project Manager for solo developers.', longDescription: 'MPM strips project management to its essence.', url: '', logoUrl: '', category: 'Productivity', status: 'Legacy', features: ['Task boards', 'Progress tracking', 'Simple UI', 'Solo-dev focus'], techStack: ['React', 'Supabase'], vision: 'Project management without the overhead.', zone: 'canopy', treePosition: { x: 38, y: 72 } },
  { id: 'vibe-coder', name: 'Vibe Coder', description: 'AI-assisted coding companion.', longDescription: 'Vibe Coder learns your coding patterns.', url: '', logoUrl: '', category: 'Productivity', status: 'Experimental', features: ['Style matching', 'Code suggestions', 'Pattern learning', 'Pair programming'], techStack: ['TypeScript', 'OpenAI', 'VS Code'], vision: 'An AI that codes like you do.', currentMission: 'Style fingerprinting engine', zone: 'canopy', treePosition: { x: 62, y: 72 } },
  { id: 'koivu-voice', name: 'Koivu Voice', description: 'Voice-first interface for KoivuLabs ecosystem.', longDescription: 'Koivu Voice provides a unified voice interface.', url: '', logoUrl: '', category: 'Infrastructure', status: 'Active Lab', features: ['Voice commands', 'Cross-app control', 'Natural language', 'Hands-free mode'], techStack: ['Whisper', 'OpenAI', 'WebSockets'], vision: 'Your voice is the ultimate interface.', currentMission: 'Wake word detection', zone: 'canopy', treePosition: { x: 84, y: 62 } },
  { id: 'skillboost-suomi', name: 'SkillBoost Suomi', description: 'AI-driven learning paths for Finnish professionals.', longDescription: 'SkillBoost Suomi creates personalized learning paths.', url: '', logoUrl: '', category: 'Productivity', status: 'Active Lab', features: ['Learning paths', 'Skill assessment', 'Progress tracking', 'Finnish market focus'], techStack: ['Next.js', 'OpenAI', 'Firebase'], vision: 'Democratizing professional development in Finland.', currentMission: 'Content partnership pipeline', zone: 'canopy', treePosition: { x: 18, y: 38 } },
  { id: 'unreel', name: 'UnReel', description: 'AI-powered short video creation from text.', longDescription: 'UnReel transforms written content into engaging short-form videos.', url: '', logoUrl: '', category: 'Social', status: 'Active Lab', features: ['Text-to-video', 'AI voiceover', 'Auto-editing', 'Multi-platform export'], techStack: ['Next.js', 'FFmpeg', 'OpenAI'], vision: 'Everyone deserves a content studio.', currentMission: 'Video pipeline MVP', zone: 'roots', treePosition: { x: 30, y: 40 } },
  { id: 'voice2post', name: 'Voice2Post', description: 'Speak your thoughts, get polished posts.', longDescription: 'Voice2Post captures voice memos and transforms them into publication-ready content.', url: '', logoUrl: '', category: 'Social', status: 'Active Lab', features: ['Voice capture', 'AI refinement', 'Multi-platform posting', 'Tone matching'], techStack: ['Whisper', 'OpenAI', 'Next.js'], vision: 'Your voice, your brand, zero friction.', currentMission: 'Telegram voice integration', zone: 'roots', treePosition: { x: 60, y: 35 } },
  { id: 'koivuchat', name: 'KoivuChat', description: 'White-label AI chatbot platform for businesses.', longDescription: 'KoivuChat provides a complete chatbot-as-a-service platform.', url: 'https://koivulabs.fi/koivuchat', logoUrl: '', category: 'Infrastructure', status: 'Flagship', features: ['White-label', 'Knowledge base', 'Multi-channel', 'Analytics dashboard'], techStack: ['Next.js', 'Flowise', 'Qdrant', 'Firebase'], vision: 'AI customer service accessible to every business.', currentMission: 'Widget v2 + Qdrant RAG', zone: 'roots', treePosition: { x: 45, y: 65 } },
];

console.log(`\nSyncing ${projects.length} projects...\n`);

for (const project of projects) {
  try {
    await db.doc(`projects/${project.id}`).set(project);
    const icon = project.zone === 'roots' ? '\u{1F331}' : '\u{1F33F}';
    console.log(`  ${icon} ${project.name} (${project.zone}, pos: ${project.treePosition.x},${project.treePosition.y})`);
  } catch (err) {
    console.error(`  \u2717 ${project.name}: ${err.message}`);
  }
}

console.log('\nSync complete!');
process.exit(0);
