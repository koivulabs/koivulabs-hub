import { NextRequest, NextResponse } from 'next/server';
import { transcribeVoice } from '@/lib/transcribeVoice';
import { refineToLogbookPost } from '@/lib/koivuVoice';
import { commitToGitHub, ImageAttachment } from '@/lib/githubCommit';
import { saveLogToFirestore } from '@/lib/firestoreRest';
import { downloadTelegramPhoto } from '@/lib/telegramPhoto';
import {
    savePendingPost,
    getPendingPost,
    deletePendingPost,
    getUserState,
    setUserState,
    clearUserState,
    PendingPost,
} from '@/lib/pendingPost';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';
const MY_TELEGRAM_ID = Number(process.env.MY_TELEGRAM_USER_ID ?? '0');

// ─────────────────────────────────────────────
// Telegram API helpers
// ─────────────────────────────────────────────

interface SendMessageOptions {
    chatId: number;
    text: string;
    replyMarkup?: unknown;
}

/** Send a message, optionally with inline keyboard. Returns the sent message ID. */
async function sendTelegramMessage({ chatId, text, replyMarkup }: SendMessageOptions): Promise<number | undefined> {
    const payload: Record<string, unknown> = {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
    };
    if (replyMarkup) {
        payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data.result?.message_id as number | undefined;
}

/** Shorthand for simple text messages (backwards-compatible with old sendMessage) */
async function sendMessage(chatId: number, text: string): Promise<void> {
    await sendTelegramMessage({ chatId, text });
}

/** Acknowledge a callback query (stops the loading spinner on the button) */
async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: text ?? '',
        }),
    });
}

/** Remove inline keyboard from a message after user clicks a button */
async function removeInlineKeyboard(chatId: number, messageId: number): Promise<void> {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [] },
        }),
    });
}

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────

export async function GET() {
    return NextResponse.json({ status: 'Koivu Voice webhook online' });
}

// ─────────────────────────────────────────────
// Preview builder
// ─────────────────────────────────────────────

function buildPreviewMessage(post: PendingPost): { text: string; replyMarkup: unknown } {
    const preview = post.content.length > 500
        ? post.content.slice(0, 500) + '...'
        : post.content;

    const imageInfo = post.imageFileIds.length > 0
        ? `\n📷 ${post.imageFileIds.length} kuva${post.imageFileIds.length > 1 ? 'a' : ''} liitteenä`
        : '';

    const text =
        `📝 *${post.title}*\n\n` +
        `${preview}\n\n` +
        `🏷 ${post.tags.join(', ')}\n` +
        `📅 ${post.date}` +
        imageInfo;

    const replyMarkup = {
        inline_keyboard: [
            [
                { text: '✅ Julkaise', callback_data: `publish:${post.pendingId}` },
                { text: '✏️ Muokkaa', callback_data: `edit:${post.pendingId}` },
            ],
            [
                { text: '❌ Hylkää', callback_data: `cancel:${post.pendingId}` },
            ],
        ],
    };

    return { text, replyMarkup };
}

// ─────────────────────────────────────────────
// Generate unique pending ID
// ─────────────────────────────────────────────

function generatePendingId(): string {
    return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─────────────────────────────────────────────
// Handle incoming message (voice or text)
// ─────────────────────────────────────────────

async function handleMessage(message: Record<string, unknown>): Promise<void> {
    const chatId = (message.chat as Record<string, unknown>)?.id as number;
    const userId = (message.from as Record<string, unknown>)?.id as number;

    // Auth — only the owner can use this
    if (!MY_TELEGRAM_ID || userId !== MY_TELEGRAM_ID) {
        await sendMessage(chatId, '⛔ Unauthorized.');
        return;
    }

    // Check if user is in editing mode
    const userState = await getUserState(userId);

    if (userState.mode === 'editing' && userState.pendingId) {
        await handleEditInput(chatId, userId, message, userState.pendingId);
        return;
    }

    try {
        let rawText = '';
        const photoFileIds: string[] = [];

        // Handle text, voice, or photo
        if (message.text) {
            rawText = message.text as string;

            // /start command
            if (rawText === '/start') {
                await sendMessage(
                    chatId,
                    '✅ *Koivu Voice* is online.\n\n' +
                    'Lähetä teksti-, ääni- tai kuvaviesti, niin muokkaan siitä logbook-postauksen.\n' +
                    'Saat esikatselun ja voit julkaista, muokata tai hylätä sen.'
                );
                return;
            }

            // /cancel command — exit editing mode anytime
            if (rawText === '/cancel') {
                await clearUserState(userId);
                await sendMessage(chatId, '🚫 Peruutettu. Lähetä uusi viesti aloittaaksesi alusta.');
                return;
            }

        } else if (message.voice) {
            await sendMessage(chatId, '🎙 Transcribing voice...');
            const fileId = (message.voice as Record<string, unknown>).file_id as string;
            rawText = await transcribeVoice(fileId);
            await sendMessage(chatId, `📝 *Transcription:*\n\n${rawText.slice(0, 300)}${rawText.length > 300 ? '...' : ''}`);

        } else if (message.photo) {
            // Telegram sends an array of sizes — pick the largest (last)
            const photos = message.photo as Array<Record<string, unknown>>;
            const largest = photos[photos.length - 1];
            const fileId = largest.file_id as string;
            photoFileIds.push(fileId);

            // Photo can have a caption — use that as raw text
            rawText = (message.caption as string) ?? '';

            if (!rawText) {
                await sendMessage(chatId, '📷 Kuva vastaanotettu! Lisää kuvateksti (caption) viestiin, niin käytän sitä postauksen pohjana.\n\nTai lähetä kuva captionin kanssa.');
                return;
            }

            await sendMessage(chatId, `📷 Kuva + teksti vastaanotettu.`);

        } else {
            await sendMessage(chatId, 'Lähetä teksti-, ääni- tai kuvaviesti.');
            return;
        }

        // Refine with AI
        await sendMessage(chatId, '✍️ Refining with AI...');
        const post = await refineToLogbookPost(rawText);

        // Save as pending (DO NOT publish yet)
        const pendingId = generatePendingId();
        const pendingPost: PendingPost = {
            ...post,
            pendingId,
            chatId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            imageFileIds: photoFileIds,
        };

        await savePendingPost(pendingPost);

        // Send preview with inline buttons
        const { text, replyMarkup } = buildPreviewMessage(pendingPost);
        const msgId = await sendTelegramMessage({ chatId, text, replyMarkup });

        // Save the message ID so we can remove buttons later
        if (msgId) {
            pendingPost.messageId = msgId;
            await savePendingPost(pendingPost);
        }

    } catch (err) {
        console.error('[koivu-voice]', err);
        await sendMessage(chatId, `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}\n\nCheck Vercel logs.`);
    }
}

// ─────────────────────────────────────────────
// Handle edit input (user is in editing mode)
// ─────────────────────────────────────────────

async function handleEditInput(
    chatId: number,
    userId: number,
    message: Record<string, unknown>,
    pendingId: string,
): Promise<void> {
    try {
        const existing = await getPendingPost(pendingId);
        if (!existing || existing.status !== 'editing') {
            await clearUserState(userId);
            await sendMessage(chatId, '⚠️ Muokattavaa postausta ei löytynyt. Lähetä uusi viesti.');
            return;
        }

        let rawText = '';

        if (message.text) {
            rawText = message.text as string;

            // Allow cancel during editing
            if (rawText === '/cancel') {
                existing.status = 'pending';
                await savePendingPost(existing);
                await clearUserState(userId);

                const { text, replyMarkup } = buildPreviewMessage(existing);
                await sendTelegramMessage({ chatId, text, replyMarkup });
                return;
            }

        } else if (message.voice) {
            await sendMessage(chatId, '🎙 Transcribing voice...');
            const fileId = (message.voice as Record<string, unknown>).file_id as string;
            rawText = await transcribeVoice(fileId);
        } else {
            await sendMessage(chatId, 'Lähetä teksti- tai ääniviesti muokkauksen pohjaksi.');
            return;
        }

        // Re-refine
        await sendMessage(chatId, '✍️ Refining with AI...');
        const post = await refineToLogbookPost(rawText);

        // Update pending post with new content
        existing.slug = post.slug;
        existing.title = post.title;
        existing.meta_description = post.meta_description;
        existing.tags = post.tags;
        existing.content = post.content;
        existing.date = post.date;
        existing.status = 'pending';

        await savePendingPost(existing);
        await clearUserState(userId);

        // Send new preview
        const { text, replyMarkup } = buildPreviewMessage(existing);
        await sendTelegramMessage({ chatId, text, replyMarkup });

    } catch (err) {
        console.error('[koivu-voice] edit error', err);
        await clearUserState(userId);
        await sendMessage(chatId, `❌ Muokkausvirhe: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

// ─────────────────────────────────────────────
// Handle callback queries (button clicks)
// ─────────────────────────────────────────────

async function handleCallbackQuery(callbackQuery: Record<string, unknown>): Promise<void> {
    const data = callbackQuery.data as string;
    const queryId = callbackQuery.id as string;
    const from = callbackQuery.from as Record<string, unknown>;
    const userId = from?.id as number;
    const message = callbackQuery.message as Record<string, unknown> | undefined;
    const chatId = (message?.chat as Record<string, unknown>)?.id as number;
    const messageId = message?.message_id as number | undefined;

    // Auth
    if (!MY_TELEGRAM_ID || userId !== MY_TELEGRAM_ID) {
        await answerCallbackQuery(queryId, '⛔ Unauthorized');
        return;
    }

    const [action, pendingId] = data.split(':');

    if (!pendingId) {
        await answerCallbackQuery(queryId, '⚠️ Invalid action');
        return;
    }

    const post = await getPendingPost(pendingId);

    // Duplicate click guard
    if (!post) {
        await answerCallbackQuery(queryId, '⚠️ Post not found or already processed');
        return;
    }

    try {
        switch (action) {
            case 'publish': {
                if (post.status !== 'pending') {
                    await answerCallbackQuery(queryId, '⚠️ Post is being edited');
                    return;
                }

                await answerCallbackQuery(queryId, '📦 Publishing...');

                // Remove buttons from preview message
                if (messageId) {
                    await removeInlineKeyboard(chatId, messageId);
                }

                // Download attached images from Telegram (if any)
                let images: ImageAttachment[] | undefined;
                if (post.imageFileIds.length > 0) {
                    await sendMessage(chatId, `📷 Downloading ${post.imageFileIds.length} image(s)...`);
                    images = await Promise.all(
                        post.imageFileIds.map(async (fileId) => {
                            const photo = await downloadTelegramPhoto(fileId);
                            return { base64: photo.base64, extension: photo.extension };
                        })
                    );
                }

                // Publish: GitHub (with images) + Firestore in parallel
                const [{ url, path }] = await Promise.all([
                    commitToGitHub(post, images),
                    saveLogToFirestore(post),
                ]);

                // Clean up pending
                await deletePendingPost(pendingId);
                await clearUserState(userId);

                await sendMessage(
                    chatId,
                    `✅ *Published*\n\n*${post.title}*\n\n` +
                    `📅 ${post.date}\n` +
                    `🏷 ${post.tags.join(', ')}\n\n` +
                    `📁 \`${path}\`\n\n` +
                    `[View on GitHub](${url})\n` +
                    `[View on Logbook](https://koivulabs.com/logbook/${post.slug})`
                );
                break;
            }

            case 'edit': {
                await answerCallbackQuery(queryId, '✏️ Edit mode');

                // Remove buttons from preview
                if (messageId) {
                    await removeInlineKeyboard(chatId, messageId);
                }

                // Set user into editing mode
                post.status = 'editing';
                await savePendingPost(post);
                await setUserState(userId, { mode: 'editing', pendingId });

                await sendMessage(
                    chatId,
                    '✏️ *Edit mode*\n\n' +
                    'Lähetä uusi teksti- tai ääniviesti.\n' +
                    'Se korvaa nykyisen sisällön ja refinataan uudelleen.\n\n' +
                    'Peruuta: /cancel'
                );
                break;
            }

            case 'cancel': {
                await answerCallbackQuery(queryId, '❌ Cancelled');

                // Remove buttons
                if (messageId) {
                    await removeInlineKeyboard(chatId, messageId);
                }

                await deletePendingPost(pendingId);
                await clearUserState(userId);

                await sendMessage(chatId, '❌ Hylätty. Lähetä uusi viesti aloittaaksesi alusta.');
                break;
            }

            default: {
                await answerCallbackQuery(queryId, '⚠️ Unknown action');
            }
        }
    } catch (err) {
        console.error('[koivu-voice] callback error', err);
        await sendMessage(chatId, `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

// ─────────────────────────────────────────────
// Main webhook handler
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // Verify webhook secret
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

    // Route: callback query (button click) or message
    if (update.callback_query) {
        await handleCallbackQuery(update.callback_query as Record<string, unknown>);
    } else if (update.message) {
        await handleMessage(update.message as Record<string, unknown>);
    }

    // Always return 200 to prevent Telegram retries
    return NextResponse.json({ ok: true });
}