import { NextRequest, NextResponse } from 'next/server';
import { transcribeVoice } from '@/lib/transcribeVoice';
import { refineToLogbookPost } from '@/lib/koivuVoice';
import { commitToGitHub, ImageAttachment } from '@/lib/githubCommit';
import { saveLogToFirestore, saveNowPage, backupNowPage, restoreNowBackup, NowPageData, deleteLogFromFirestore, listPublishedLogs } from '@/lib/firestoreRest';
import { downloadTelegramPhoto } from '@/lib/telegramPhoto';
import {
    savePendingPost,
    getPendingPost,
    deletePendingPost,
    listPendingPosts,
    countPublishedLogs,
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
// Persistent reply keyboard (always visible)
// ─────────────────────────────────────────────

const MAIN_MENU_KEYBOARD = {
    keyboard: [
        [{ text: '📝 Uusi postaus' }, { text: '📋 Draftit' }],
        [{ text: '📌 Now' }, { text: '🗑 Poista' }],
        [{ text: '📊 Status' }, { text: '❓ Ohje' }],
    ],
    resize_keyboard: true,
    is_persistent: true,
};

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
        // Route Now-page input to its own handler
        if (userState.pendingId === 'now_input') {
            await clearUserState(userId);
            await handleNowUpdate(chatId, userId, message);
            return;
        }

        await handleEditInput(chatId, userId, message, userState.pendingId);
        return;
    }

    try {
        let rawText = '';
        const photoFileIds: string[] = [];

        // Handle text, voice, or photo
        if (message.text) {
            rawText = message.text as string;

            // /start command — show welcome + persistent keyboard
            if (rawText === '/start') {
                await sendTelegramMessage({
                    chatId,
                    text:
                        '✅ *Koivu Voice* is online.\n\n' +
                        'Lähetä teksti-, ääni- tai kuvaviesti, niin muokkaan siitä logbook-postauksen.\n\n' +
                        'Tai käytä nappeja alhaalla 👇',
                    replyMarkup: MAIN_MENU_KEYBOARD,
                });
                return;
            }

            // /cancel command — exit editing mode anytime
            if (rawText === '/cancel') {
                await clearUserState(userId);
                await sendMessage(chatId, '🚫 Peruutettu. Lähetä uusi viesti aloittaaksesi alusta.');
                return;
            }

            // ── Menu button handlers ──

            if (rawText === '📝 Uusi postaus') {
                await sendMessage(chatId, '🎙 Lähetä ääni-, teksti- tai kuvaviesti niin teen siitä postauksen.');
                return;
            }

            if (rawText === '📋 Draftit') {
                await handleDrafts(chatId);
                return;
            }

            if (rawText === '📊 Status') {
                await handleStatus(chatId);
                return;
            }

            if (rawText === '📌 Now') {
                await sendMessage(chatId, '📌 Lähetä teksti- tai ääniviesti, jolla päivitän Now-sivun.\n\nKerro mitä rakennat, opit, luet, et tee, ja missä olet.');
                await setUserState(userId, { mode: 'editing', pendingId: 'now_input' });
                return;
            }

            if (rawText === '🗑 Poista') {
                await handleDeleteMenu(chatId);
                return;
            }

            if (rawText === '❓ Ohje') {
                await sendMessage(
                    chatId,
                    '📖 *Koivu Voice — Ohje*\n\n' +
                    '🎙 *Ääniviesti* — puhut, botti kirjoittaa postauksen\n' +
                    '📝 *Tekstiviesti* — kirjoitat, botti refinaa\n' +
                    '📷 *Kuva + caption* — kuva liitetään postaukseen\n\n' +
                    '✅ Julkaise / ✏️ Muokkaa / ❌ Hylkää napeilla\n\n' +
                    '📋 *Draftit* — keskeneräiset postaukset\n' +
                    '📌 *Now* — päivitä Now-sivu\n' +
                    '🗑 *Poista* — poista julkaistu postaus\n' +
                    '📊 *Status* — sivuston tilanne\n' +
                    '/cancel — peruuta muokkaus'
                );
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
// Drafts — list pending posts
// ─────────────────────────────────────────────

async function handleDrafts(chatId: number): Promise<void> {
    try {
        const drafts = await listPendingPosts();

        if (drafts.length === 0) {
            await sendMessage(chatId, '📋 Ei drafteja. Lähetä viesti luodaksesi uuden postauksen.');
            return;
        }

        await sendMessage(chatId, `📋 *Draftit* (${drafts.length} kpl)\n`);

        for (const draft of drafts) {
            const { text, replyMarkup } = buildPreviewMessage(draft);
            await sendTelegramMessage({ chatId, text, replyMarkup });
        }
    } catch (err) {
        console.error('[koivu-voice] drafts error', err);
        await sendMessage(chatId, '❌ Draftien haku epäonnistui.');
    }
}

// ─────────────────────────────────────────────
// Status — site overview
// ─────────────────────────────────────────────

async function handleStatus(chatId: number): Promise<void> {
    try {
        const [publishedCount, drafts] = await Promise.all([
            countPublishedLogs(),
            listPendingPosts(),
        ]);

        const statusText =
            `📊 *Koivu Labs Status*\n\n` +
            `📰 Julkaistuja postauksia: *${publishedCount}*\n` +
            `📋 Drafteja odottamassa: *${drafts.length}*\n\n` +
            `🌐 [koivulabs.com](https://koivulabs.com)\n` +
            `📓 [Logbook](https://koivulabs.com/logbook)`;

        await sendMessage(chatId, statusText);
    } catch (err) {
        console.error('[koivu-voice] status error', err);
        await sendMessage(chatId, '❌ Statuksen haku epäonnistui.');
    }
}

// ─────────────────────────────────────────────
// Now-page update — AI parses voice/text into sections
// ─────────────────────────────────────────────

const NOW_SYSTEM_PROMPT = `
You parse a user's message into structured "Now page" sections for a developer studio website.

The Now page has these sections:
- building: Current projects and what's being worked on (array of strings)
- learning: Technologies, skills, and concepts being studied (array of strings)
- reading: Books, articles, documentation being consumed (array of strings)
- notDoing: Things deliberately being avoided or deprioritized (array of strings)
- location: Physical location description (single string)

RULES:
- Input may be Finnish or English. Output always in English.
- Each array item should be 1-2 sentences max. Concise, direct.
- Nordic voice: restrained, professional, no hype.
- If the user doesn't mention a section, keep it empty (empty array or empty string).
- The location field defaults to "" if not mentioned.

Return ONLY a valid JSON object:
{
  "building": ["..."],
  "learning": ["..."],
  "reading": ["..."],
  "notDoing": ["..."],
  "location": "..."
}
`;

/** Use AI to parse raw text into NowPageData sections */
async function parseNowPageContent(rawText: string): Promise<NowPageData> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: NOW_SYSTEM_PROMPT },
                { role: 'user', content: rawText },
            ],
            temperature: 0.3,
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`OpenAI error: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    const today = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
        building: parsed.building ?? [],
        learning: parsed.learning ?? [],
        reading: parsed.reading ?? [],
        notDoing: parsed.notDoing ?? [],
        location: parsed.location ?? '',
        updatedAt: today,
    };
}

/** Track users who are in "now update" mode */
// We reuse UserState with mode = 'now_update' stored in a simple variable
// Since we're serverless, we track this via a special pendingPost with a known ID
const NOW_UPDATE_MODE_PREFIX = 'now_';

async function handleNowUpdate(chatId: number, userId: number, message: Record<string, unknown>): Promise<void> {
    try {
        let rawText = '';

        if (message.voice) {
            await sendMessage(chatId, '🎙 Transcribing...');
            const fileId = (message.voice as Record<string, unknown>).file_id as string;
            rawText = await transcribeVoice(fileId);
        } else if (message.text) {
            rawText = message.text as string;
        } else {
            await sendMessage(chatId, 'Lähetä teksti- tai ääniviesti Now-sivun päivittämiseksi.');
            return;
        }

        await sendMessage(chatId, '✍️ Parsing Now content...');
        const nowData = await parseNowPageContent(rawText);

        // Build preview
        const sections = [
            { emoji: '🔨', label: 'Building', items: nowData.building },
            { emoji: '📚', label: 'Learning', items: nowData.learning },
            { emoji: '📖', label: 'Reading', items: nowData.reading },
            { emoji: '🚫', label: 'Not doing', items: nowData.notDoing },
        ];

        let preview = '📌 *Now-sivun esikatselu*\n\n';
        for (const s of sections) {
            if (s.items.length > 0) {
                preview += `${s.emoji} *${s.label}*\n`;
                for (const item of s.items) {
                    preview += `— ${item}\n`;
                }
                preview += '\n';
            }
        }
        if (nowData.location) {
            preview += `📍 *Location*\n${nowData.location}\n\n`;
        }
        preview += `🕐 Updated: ${nowData.updatedAt}`;

        // Store now data temporarily in a pendingPost-like doc for the callback
        const nowPendingId = `${NOW_UPDATE_MODE_PREFIX}${Date.now()}`;

        // We'll encode the NowPageData as JSON in the content field of a pseudo-pendingPost
        const pseudoPost: PendingPost = {
            pendingId: nowPendingId,
            slug: 'now-update',
            title: 'Now Page Update',
            date: new Date().toISOString().split('T')[0],
            meta_description: '',
            content: JSON.stringify(nowData),
            chatId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            tags: [],
            imageFileIds: [],
        };
        await savePendingPost(pseudoPost);

        const replyMarkup = {
            inline_keyboard: [
                [
                    { text: '✅ Päivitä Now', callback_data: `now_publish:${nowPendingId}` },
                    { text: '❌ Peruuta', callback_data: `now_cancel:${nowPendingId}` },
                ],
            ],
        };

        await sendTelegramMessage({ chatId, text: preview, replyMarkup });

    } catch (err) {
        console.error('[koivu-voice] now update error', err);
        await sendMessage(chatId, `❌ Now-päivitys epäonnistui: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

// ─────────────────────────────────────────────
// Delete published post — list and delete
// ─────────────────────────────────────────────

async function handleDeleteMenu(chatId: number): Promise<void> {
    try {
        const logs = await listPublishedLogs();

        if (logs.length === 0) {
            await sendMessage(chatId, '📭 Ei julkaistuja postauksia poistettavaksi.');
            return;
        }

        // Show up to 10 most recent
        const recent = logs.slice(0, 10);
        await sendMessage(chatId, `🗑 *Poista postaus*\n\nValitse poistettava (${logs.length} julkaistua):\n`);

        for (const log of recent) {
            const dateStr = log.publishedAt
                ? new Date(log.publishedAt).toLocaleDateString('fi-FI')
                : '?';

            const replyMarkup = {
                inline_keyboard: [
                    [{ text: '🗑 Poista tämä', callback_data: `delete_log:${log.slug}` }],
                ],
            };

            await sendTelegramMessage({
                chatId,
                text: `📰 *${log.title}*\n📅 ${dateStr}`,
                replyMarkup,
            });
        }
    } catch (err) {
        console.error('[koivu-voice] delete menu error', err);
        await sendMessage(chatId, '❌ Postausten haku epäonnistui.');
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

    // Split on first colon only (slug may not contain colons, but be safe)
    const colonIdx = data.indexOf(':');
    const action = colonIdx >= 0 ? data.slice(0, colonIdx) : data;
    const actionArg = colonIdx >= 0 ? data.slice(colonIdx + 1) : '';

    if (!actionArg) {
        await answerCallbackQuery(queryId, '⚠️ Invalid action');
        return;
    }

    // ── Now-page callbacks ──
    if (action === 'now_restore') {
        try {
            await answerCallbackQuery(queryId, '↩️ Restoring...');
            if (messageId) await removeInlineKeyboard(chatId, messageId);

            const restored = await restoreNowBackup();
            if (!restored) {
                await sendMessage(chatId, '⚠️ Ei edellistä versiota palautettavaksi.');
                return;
            }

            await sendMessage(
                chatId,
                '↩️ *Now-sivu palautettu!*\n\n' +
                `🕐 Palautettu versio: ${restored.updatedAt}\n\n` +
                '[Katso Now-sivu](https://koivulabs.com/now)'
            );
        } catch (err) {
            console.error('[koivu-voice] now restore error', err);
            await sendMessage(chatId, `❌ Palautus epäonnistui: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        return;
    }

    if (action === 'now_publish' || action === 'now_cancel') {
        try {
            if (action === 'now_cancel') {
                await answerCallbackQuery(queryId, '❌ Peruutettu');
                if (messageId) await removeInlineKeyboard(chatId, messageId);
                await deletePendingPost(actionArg);
                await sendMessage(chatId, '❌ Now-päivitys peruutettu.');
                return;
            }

            // now_publish
            await answerCallbackQuery(queryId, '📦 Saving...');
            if (messageId) await removeInlineKeyboard(chatId, messageId);

            const pseudoPost = await getPendingPost(actionArg);
            if (!pseudoPost) {
                await sendMessage(chatId, '⚠️ Now-dataa ei löytynyt.');
                return;
            }

            const nowData: NowPageData = JSON.parse(pseudoPost.content);

            // Back up current Now page before overwriting
            await backupNowPage();

            await saveNowPage(nowData);
            await deletePendingPost(actionArg);

            const confirmMarkup = {
                inline_keyboard: [
                    [{ text: '↩️ Palauta edellinen', callback_data: 'now_restore:1' }],
                ],
            };

            await sendTelegramMessage({
                chatId,
                text:
                    '✅ *Now-sivu päivitetty!*\n\n' +
                    `🕐 ${nowData.updatedAt}\n\n` +
                    '[Katso Now-sivu](https://koivulabs.com/now)\n\n' +
                    '_Edellinen versio tallennettu. Voit palauttaa sen alla olevalla napilla._',
                replyMarkup: confirmMarkup,
            });
        } catch (err) {
            console.error('[koivu-voice] now callback error', err);
            await sendMessage(chatId, `❌ Now-virhe: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        return;
    }

    // ── Delete log callback ──
    if (action === 'delete_log') {
        try {
            await answerCallbackQuery(queryId, '🗑 Deleting...');
            if (messageId) await removeInlineKeyboard(chatId, messageId);

            await deleteLogFromFirestore(actionArg);
            await sendMessage(chatId, `✅ Postaus \`${actionArg}\` poistettu Firestoresta.`);
        } catch (err) {
            console.error('[koivu-voice] delete log error', err);
            await sendMessage(chatId, `❌ Poisto epäonnistui: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        return;
    }

    // ── Standard post callbacks (publish/edit/cancel) ──
    const pendingId = actionArg;
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

                    // Build image paths and inject into post content
                    // so BOTH GitHub and Firestore get the image references
                    const imagePaths = images.map((img, i) => {
                        const imageName = `${post.date}-${post.slug}-${i + 1}.${img.extension}`;
                        return `/logbook/images/${imageName}`;
                    });
                    const imageMarkdown = imagePaths
                        .map((p, i) => `![${post.title} - image ${i + 1}](${p})`)
                        .join('\n\n');
                    post.content = post.content + '\n\n' + imageMarkdown;
                }

                // Publish: GitHub (with images) + Firestore in parallel
                // Both now receive post with image references in content
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