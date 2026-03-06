import { NextRequest, NextResponse } from 'next/server';
import { transcribeVoice } from '@/lib/transcribeVoice';
import { refineToLogbookPost } from '@/lib/koivuVoice';
import { commitToGitHub } from '@/lib/githubCommit';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';
const MY_TELEGRAM_ID = Number(process.env.MY_TELEGRAM_USER_ID ?? '0');

// ─────────────────────────────────────────────
// Telegram helper
// ─────────────────────────────────────────────

async function sendMessage(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
}

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────

export async function GET() {
    return NextResponse.json({ status: 'Koivu Voice webhook online' });
}

// ─────────────────────────────────────────────
// Main webhook handler
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // 1. Verify webhook secret (set when registering webhook with Telegram)
    if (WEBHOOK_SECRET) {
        const secret = req.headers.get('x-telegram-bot-api-secret-token');
        if (secret !== WEBHOOK_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    let update: Record<string, unknown>;
    try {
        update = await req.json();
    } catch {
        return new NextResponse('Bad request', { status: 400 });
    }

    const message = update.message as Record<string, unknown> | undefined;

    // Ignore non-message updates (edits, reactions, etc.)
    if (!message) return NextResponse.json({ ok: true });

    const chatId = (message.chat as Record<string, unknown>)?.id as number;
    const userId = (message.from as Record<string, unknown>)?.id as number;

    // 2. Auth — only the owner can use this
    if (!MY_TELEGRAM_ID || userId !== MY_TELEGRAM_ID) {
        await sendMessage(chatId, '⛔ Unauthorized.');
        return NextResponse.json({ ok: true });
    }

    try {
        let rawText = '';

        // 3. Handle text or voice
        if (message.text) {
            rawText = message.text as string;

            // Allow /start command
            if (rawText === '/start') {
                await sendMessage(chatId, '✅ *Koivu Voice* is online.\n\nSend a text or voice message and I will turn it into a logbook entry on GitHub.');
                return NextResponse.json({ ok: true });
            }

        } else if (message.voice) {
            await sendMessage(chatId, '🎙 Transcribing voice...');
            const fileId = (message.voice as Record<string, unknown>).file_id as string;
            rawText = await transcribeVoice(fileId);
            await sendMessage(chatId, `📝 *Transcription:*\n\n${rawText.slice(0, 300)}${rawText.length > 300 ? '...' : ''}`);

        } else {
            await sendMessage(chatId, 'Send text or a voice message.');
            return NextResponse.json({ ok: true });
        }

        // 4. Refine with AI
        await sendMessage(chatId, '✍️ Refining with AI...');
        const post = await refineToLogbookPost(rawText);

        // 5. Commit to GitHub
        await sendMessage(chatId, '📦 Committing to GitHub...');
        const { url, path } = await commitToGitHub(post);

        // 6. Success
        await sendMessage(
            chatId,
            `✅ *Published*\n\n*${post.title}*\n\n` +
            `📅 ${post.date}\n` +
            `🏷 ${post.tags.join(', ')}\n\n` +
            `📁 \`${path}\`\n\n` +
            `[View on GitHub](${url})`
        );

    } catch (err) {
        console.error('[koivu-voice]', err);
        await sendMessage(chatId, `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}\n\nCheck Vercel logs.`);
    }

    // Always return 200 to prevent Telegram retries
    return NextResponse.json({ ok: true });
}
