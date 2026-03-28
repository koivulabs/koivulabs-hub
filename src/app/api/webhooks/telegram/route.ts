import { NextRequest, NextResponse } from 'next/server';
import { transcribeVoice } from '@/lib/transcribeVoice';
import { refineToLogbookPost } from '@/lib/koivuVoice';
import { commitToGitHub, ImageAttachment } from '@/lib/githubCommit';
import {
    saveLogToFirestore,
    saveNowPage, backupNowPage, restoreNowBackup, NowPageData,
    deleteLogFromFirestore, listPublishedLogs,
    saveInvoiceSettings, getInvoiceSettings, InvoiceSettings,
    saveClient, getClient, listClients, ClientInfo,
    saveInvoice, getInvoice, listInvoices, getOrCreateOpenInvoice, Invoice,
    saveTimeEntry, listTimeEntriesByInvoice, TimeEntry,
} from '@/lib/firestoreRest';
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
        [{ text: '⏱ Kirjaa työ' }, { text: '⚙️ Työkalut' }],
        [{ text: '📊 Status' }, { text: '❓ Ohje' }],
    ],
    resize_keyboard: true,
    is_persistent: true,
};

const TOOLS_INLINE_MENU = {
    inline_keyboard: [
        [
            { text: '📌 Now-sivu', callback_data: 'tools:now' },
            { text: '🗑 Poista postaus', callback_data: 'tools:delete' },
        ],
        [
            { text: '🧾 Laskut', callback_data: 'tools:invoices' },
            { text: '📇 Asiakkaat', callback_data: 'tools:clients' },
        ],
        [
            { text: '👤 Omat tiedot', callback_data: 'tools:settings' },
        ],
    ],
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

        // Route time entry input
        if (userState.pendingId === 'time_input') {
            await clearUserState(userId);
            await handleTimeEntry(chatId, userId, message);
            return;
        }

        // Route setup wizard steps
        if (userState.pendingId.startsWith('setup_')) {
            await handleSetupStep(chatId, userId, message, userState.pendingId);
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

            if (rawText === '⏱ Kirjaa työ') {
                await sendMessage(chatId, '⏱ Sanele tai kirjoita mitä teit.\n\nEsim: _"Tein tänään 4h nettisivuja Hautsalolle Saarijärvellä"_');
                await setUserState(userId, { mode: 'editing', pendingId: 'time_input' });
                return;
            }

            if (rawText === '⚙️ Työkalut') {
                await sendTelegramMessage({
                    chatId,
                    text: '⚙️ *Työkalut*\n\nValitse toiminto:',
                    replyMarkup: TOOLS_INLINE_MENU,
                });
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
                    '⏱ *Kirjaa työ* — sanele tunnit ja työ\n' +
                    '⚙️ *Työkalut* — Now-sivu, poista, laskut, asiakkaat, asetukset\n' +
                    '📊 *Status* — sivuston tilanne\n' +
                    '/cancel — peruuta'
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
// Time entry — AI parser
// ─────────────────────────────────────────────

const TIME_ENTRY_SYSTEM_PROMPT = `
You parse a user's message about work done into a structured time entry.

Extract:
- client: Company or person name (string). If unclear, use "Ei asiakasta".
- description: What was done (string, 1-2 sentences, Finnish or English as input)
- location: Where the work was done (string, "" if not mentioned)
- date: Date of work (YYYY-MM-DD). If "today" or not mentioned, use TODAY_DATE.
- hours: Hours worked (number, can be decimal like 1.5). 0 if not mentioned.
- pricingModel: "hourly" if hourly rate mentioned, "fixed" if total/project price mentioned, "none" if no price discussed
- hourlyRate: Hourly rate in EUR (number, 0 if not hourly)
- fixedPrice: Fixed/project price in EUR (number, 0 if not fixed)

RULES:
- Input is Finnish or English. Keep description in the ORIGINAL language.
- "satanen tunti" = 100 EUR/h, "viiskymppiä tunti" = 50 EUR/h
- "4h" or "4 tuntia" = 4 hours
- Be generous with parsing: "pari tuntia" = 2, "puoli päivää" = 4
- If hours AND hourly rate given, calculate totalPrice = hours * hourlyRate
- If fixed price given, totalPrice = fixedPrice
- If no price info, totalPrice = 0

Return ONLY valid JSON:
{
  "client": "...",
  "description": "...",
  "location": "...",
  "date": "YYYY-MM-DD",
  "hours": 0,
  "pricingModel": "hourly|fixed|none",
  "hourlyRate": 0,
  "fixedPrice": 0,
  "totalPrice": 0
}
`;

interface ParsedTimeEntry {
    client: string;
    description: string;
    location: string;
    date: string;
    hours: number;
    pricingModel: 'hourly' | 'fixed' | 'none';
    hourlyRate: number;
    fixedPrice: number;
    totalPrice: number;
}

async function parseTimeEntry(rawText: string): Promise<ParsedTimeEntry> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    const today = new Date().toISOString().split('T')[0];
    const prompt = TIME_ENTRY_SYSTEM_PROMPT.replace('TODAY_DATE', today);

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
                { role: 'system', content: prompt },
                { role: 'user', content: rawText },
            ],
            temperature: 0.2,
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`OpenAI error: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return JSON.parse(data.choices[0].message.content) as ParsedTimeEntry;
}

// ─────────────────────────────────────────────
// Time entry handler
// ─────────────────────────────────────────────

async function handleTimeEntry(chatId: number, _userId: number, message: Record<string, unknown>): Promise<void> {
    try {
        let rawText = '';

        if (message.voice) {
            await sendMessage(chatId, '🎙 Transcribing...');
            const fileId = (message.voice as Record<string, unknown>).file_id as string;
            rawText = await transcribeVoice(fileId);
        } else if (message.text) {
            rawText = message.text as string;
        } else {
            await sendMessage(chatId, 'Lähetä teksti- tai ääniviesti työn kirjaamiseksi.');
            return;
        }

        await sendMessage(chatId, '✍️ Parsing...');
        const parsed = await parseTimeEntry(rawText);

        // Slugify client name for ID
        const clientId = parsed.client
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9äöå-]/g, '')
            .replace(/-+/g, '-');

        // Check if client exists, apply defaults if so
        const existingClient = await getClient(clientId);
        if (existingClient && parsed.pricingModel === 'none') {
            // Use client's default pricing
            parsed.pricingModel = existingClient.pricingModel;
            parsed.hourlyRate = existingClient.defaultHourlyRate;
            if (parsed.pricingModel === 'hourly' && parsed.hours > 0) {
                parsed.totalPrice = parsed.hours * parsed.hourlyRate;
            }
        }

        // Build preview
        let preview = '⏱ *Työn esikatselu*\n\n';
        preview += `👤 *Asiakas:* ${parsed.client}\n`;
        preview += `🔨 *Kuvaus:* ${parsed.description}\n`;
        if (parsed.location) preview += `📍 *Paikka:* ${parsed.location}\n`;
        preview += `📅 *Päivä:* ${parsed.date}\n`;
        if (parsed.hours > 0) preview += `⏱ *Tunnit:* ${parsed.hours}h\n`;

        if (parsed.pricingModel === 'hourly') {
            preview += `💰 *Hinta:* ${parsed.hourlyRate}€/h`;
            if (parsed.totalPrice > 0) preview += ` = *${parsed.totalPrice}€*`;
            preview += '\n';
        } else if (parsed.pricingModel === 'fixed') {
            preview += `💰 *Kiinteä hinta:* ${parsed.fixedPrice}€\n`;
        } else {
            preview += '💰 _Ei hintatietoa_\n';
        }

        if (existingClient) {
            preview += `\n_Asiakas tunnettu (oletushinta: ${existingClient.defaultHourlyRate}€/h)_`;
        }

        // Store parsed data temporarily
        const tempId = `te_${Date.now()}`;
        const pseudoPost: PendingPost = {
            pendingId: tempId,
            slug: 'time-entry',
            title: parsed.client,
            date: parsed.date,
            meta_description: clientId,  // store clientId here
            content: JSON.stringify(parsed),
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
                    { text: '✅ Tallenna', callback_data: `te_save:${tempId}` },
                    { text: '❌ Hylkää', callback_data: `te_cancel:${tempId}` },
                ],
            ],
        };

        await sendTelegramMessage({ chatId, text: preview, replyMarkup });

    } catch (err) {
        console.error('[koivu-voice] time entry error', err);
        await sendMessage(chatId, `❌ Kirjausvirhe: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

// ─────────────────────────────────────────────
// Tools callbacks — route from inline menu
// ─────────────────────────────────────────────

async function handleToolsCallback(chatId: number, userId: number, tool: string, messageId?: number): Promise<void> {
    if (messageId) await removeInlineKeyboard(chatId, messageId);

    switch (tool) {
        case 'now':
            await sendMessage(chatId, '📌 Lähetä teksti- tai ääniviesti, jolla päivitän Now-sivun.\n\nKerro mitä rakennat, opit, luet, et tee, ja missä olet.');
            await setUserState(userId, { mode: 'editing', pendingId: 'now_input' });
            break;

        case 'delete':
            await handleDeleteMenu(chatId);
            break;

        case 'invoices':
            await handleInvoiceMenu(chatId);
            break;

        case 'clients':
            await handleClientsMenu(chatId);
            break;

        case 'settings':
            await handleSettingsStart(chatId, userId);
            break;
    }
}

// ─────────────────────────────────────────────
// Invoice management
// ─────────────────────────────────────────────

async function handleInvoiceMenu(chatId: number): Promise<void> {
    try {
        const openInvoices = await listInvoices('open');

        if (openInvoices.length === 0) {
            await sendMessage(chatId, '🧾 Ei avoimia laskuja.\n\nKirjaa työtä ⏱-napilla, niin laskut syntyvät automaattisesti.');
            return;
        }

        await sendMessage(chatId, `🧾 *Avoimet laskut* (${openInvoices.length} kpl)\n`);

        for (const inv of openInvoices) {
            const entries = await listTimeEntriesByInvoice(inv.id);
            const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
            const totalPrice = entries.reduce((sum, e) => sum + e.totalPrice, 0);

            const text =
                `👤 *${inv.client}*\n` +
                `📊 ${entries.length} kirjausta, ${totalHours}h\n` +
                `💰 ${totalPrice > 0 ? totalPrice + '€' : 'Ei hintaa'}\n` +
                `📅 Avattu: ${new Date(inv.createdAt).toLocaleDateString('fi-FI')}`;

            const replyMarkup = {
                inline_keyboard: [
                    [
                        { text: '📋 Rivit', callback_data: `inv_detail:${inv.id}` },
                        { text: '📄 Luo PDF', callback_data: `inv_pdf:${inv.id}` },
                    ],
                    [
                        { text: '🔒 Sulje lasku', callback_data: `inv_close:${inv.id}` },
                    ],
                ],
            };

            await sendTelegramMessage({ chatId, text, replyMarkup });
        }
    } catch (err) {
        console.error('[koivu-voice] invoice menu error', err);
        await sendMessage(chatId, '❌ Laskujen haku epäonnistui.');
    }
}

// ─────────────────────────────────────────────
// Client management
// ─────────────────────────────────────────────

async function handleClientsMenu(chatId: number): Promise<void> {
    try {
        const clients = await listClients();

        if (clients.length === 0) {
            await sendMessage(chatId, '📇 Ei tallennettuja asiakkaita.\n\nAsiakkaat luodaan automaattisesti kun kirjaat työtä.');
            return;
        }

        let text = `📇 *Asiakkaat* (${clients.length} kpl)\n\n`;

        for (const c of clients) {
            text += `👤 *${c.name}*\n`;
            if (c.businessId) text += `📋 ${c.businessId}\n`;
            if (c.pricingModel === 'hourly' && c.defaultHourlyRate > 0) {
                text += `💰 ${c.defaultHourlyRate}€/h\n`;
            }
            text += '\n';
        }

        await sendMessage(chatId, text);
    } catch (err) {
        console.error('[koivu-voice] clients menu error', err);
        await sendMessage(chatId, '❌ Asiakkaiden haku epäonnistui.');
    }
}

// ─────────────────────────────────────────────
// Own details setup wizard
// ─────────────────────────────────────────────

const SETUP_FIELDS: Array<{ key: keyof InvoiceSettings; prompt: string; emoji: string }> = [
    { key: 'companyName', prompt: 'Yrityksen nimi?', emoji: '🏢' },
    { key: 'businessId', prompt: 'Y-tunnus?', emoji: '📋' },
    { key: 'address', prompt: 'Osoite?', emoji: '📍' },
    { key: 'iban', prompt: 'Tilinumero (IBAN)?', emoji: '🏦' },
    { key: 'email', prompt: 'Sähköposti laskuihin?', emoji: '📧' },
    { key: 'phone', prompt: 'Puhelin? (tai "ohita")', emoji: '📞' },
    { key: 'defaultHourlyRate', prompt: 'Oletus-tuntihinta (€)? (tai "ohita")', emoji: '💰' },
];

async function handleSettingsStart(chatId: number, userId: number): Promise<void> {
    // Load existing settings to show current values
    const existing = await getInvoiceSettings();
    if (existing) {
        let text = '👤 *Nykyiset laskutustiedot:*\n\n';
        text += `🏢 ${existing.companyName || '-'}\n`;
        text += `📋 ${existing.businessId || '-'}\n`;
        text += `📍 ${existing.address || '-'}\n`;
        text += `🏦 ${existing.iban || '-'}\n`;
        text += `📧 ${existing.email || '-'}\n`;
        text += `📞 ${existing.phone || '-'}\n`;
        text += `💰 ${existing.defaultHourlyRate > 0 ? existing.defaultHourlyRate + '€/h' : '-'}\n`;

        const replyMarkup = {
            inline_keyboard: [
                [
                    { text: '✏️ Muokkaa', callback_data: 'setup_start:1' },
                    { text: '✅ OK', callback_data: 'setup_start:0' },
                ],
            ],
        };

        await sendTelegramMessage({ chatId, text, replyMarkup });
    } else {
        await sendMessage(chatId, '👤 *Laskutustietojen asetus*\n\nKäydään tiedot läpi yksi kerrallaan.');
        await promptSetupField(chatId, userId, 0);
    }
}

async function promptSetupField(chatId: number, userId: number, fieldIndex: number): Promise<void> {
    if (fieldIndex >= SETUP_FIELDS.length) {
        // All done — save and show summary
        await clearUserState(userId);
        const settings = await getInvoiceSettings();
        if (settings) {
            await sendMessage(chatId, '✅ *Laskutustiedot tallennettu!*');
        }
        return;
    }

    const field = SETUP_FIELDS[fieldIndex];
    await sendMessage(chatId, `${field.emoji} ${field.prompt}`);
    await setUserState(userId, { mode: 'editing', pendingId: `setup_${fieldIndex}` });
}

async function handleSetupStep(chatId: number, userId: number, message: Record<string, unknown>, pendingId: string): Promise<void> {
    const fieldIndex = parseInt(pendingId.replace('setup_', ''), 10);
    if (isNaN(fieldIndex) || fieldIndex >= SETUP_FIELDS.length) {
        await clearUserState(userId);
        return;
    }

    const rawText = (message.text as string) ?? '';

    // Load or create settings
    const settings: InvoiceSettings = (await getInvoiceSettings()) ?? {
        companyName: '', businessId: '', address: '',
        iban: '', email: '', phone: '', defaultHourlyRate: 0,
    };

    const field = SETUP_FIELDS[fieldIndex];
    const skip = rawText.toLowerCase() === 'ohita' || rawText === '-';

    if (!skip) {
        if (field.key === 'defaultHourlyRate') {
            const rate = parseFloat(rawText.replace(/[€,]/g, '').trim());
            settings.defaultHourlyRate = isNaN(rate) ? 0 : rate;
        } else {
            (settings[field.key] as string) = rawText;
        }
    }

    await saveInvoiceSettings(settings);
    await promptSetupField(chatId, userId, fieldIndex + 1);
}

// ─────────────────────────────────────────────
// Telegram sendDocument helper (for PDF)
// ─────────────────────────────────────────────

async function sendTelegramDocument(chatId: number, content: string, filename: string, caption: string): Promise<void> {
    const encoder = new TextEncoder();
    const uint8 = encoder.encode(content);

    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    formData.append('caption', caption);
    formData.append('parse_mode', 'Markdown');
    formData.append('document', new Blob([uint8], { type: 'text/html' }), filename);

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: formData,
    });
}

// ─────────────────────────────────────────────
// Generate invoice HTML & send as file
// ─────────────────────────────────────────────

async function generateAndSendInvoice(chatId: number, invoiceId: string): Promise<void> {
    const inv = await getInvoice(invoiceId);
    if (!inv) {
        await sendMessage(chatId, '⚠️ Laskua ei löytynyt.');
        return;
    }

    const entries = await listTimeEntriesByInvoice(inv.id);
    const settings = await getInvoiceSettings();
    const client = await getClient(inv.clientId);

    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const totalPrice = entries.reduce((sum, e) => sum + e.totalPrice, 0);

    const today = new Date().toLocaleDateString('fi-FI');
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fi-FI');

    // Build HTML invoice
    const rows = entries.map(e => {
        const priceStr = e.pricingModel === 'hourly'
            ? `${e.hours}h × ${e.hourlyRate}€ = ${e.totalPrice}€`
            : e.pricingModel === 'fixed'
                ? `${e.fixedPrice}€`
                : '-';
        return `<tr>
            <td>${e.date}</td>
            <td>${e.description}</td>
            <td>${e.hours > 0 ? e.hours + 'h' : '-'}</td>
            <td style="text-align:right">${priceStr}</td>
        </tr>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="fi">
<head><meta charset="UTF-8"><title>Lasku — ${inv.client}</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .party { flex: 1; }
  .party h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #666; }
  .party p { margin: 2px 0; font-size: 14px; }
  .meta { margin-bottom: 30px; }
  .meta span { margin-right: 30px; font-size: 14px; color: #444; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #f0f0f0; text-align: left; padding: 10px; font-size: 13px; text-transform: uppercase; color: #555; }
  td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
  .total { font-size: 20px; text-align: right; margin-top: 20px; padding-top: 16px; border-top: 2px solid #1a1a1a; }
  .footer { margin-top: 40px; font-size: 12px; color: #888; }
</style></head>
<body>
  <h1>LASKU</h1>
  <div class="meta">
    <span>📅 Päivä: ${today}</span>
    <span>📅 Eräpäivä: ${dueDate}</span>
    <span>📄 ${inv.id}</span>
  </div>
  <div class="header">
    <div class="party">
      <h3>Lähettäjä</h3>
      <p><strong>${settings?.companyName ?? 'KoivuLabs'}</strong></p>
      ${settings?.businessId ? `<p>${settings.businessId}</p>` : ''}
      ${settings?.address ? `<p>${settings.address}</p>` : ''}
      ${settings?.email ? `<p>${settings.email}</p>` : ''}
      ${settings?.phone ? `<p>${settings.phone}</p>` : ''}
    </div>
    <div class="party">
      <h3>Vastaanottaja</h3>
      <p><strong>${inv.client}</strong></p>
      ${client?.businessId ? `<p>${client.businessId}</p>` : ''}
      ${client?.address ? `<p>${client.address}</p>` : ''}
      ${client?.email ? `<p>${client.email}</p>` : ''}
    </div>
  </div>
  <table>
    <thead><tr><th>Päivä</th><th>Kuvaus</th><th>Tunnit</th><th style="text-align:right">Hinta</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total">
    ${totalHours > 0 ? `Tunnit yhteensä: ${totalHours}h<br>` : ''}
    <strong>Yhteensä: ${totalPrice}€</strong>
    <br><small>ALV 0% (pienyritys / arvonlisäverovelvollinen merkitsee itse)</small>
  </div>
  ${settings?.iban ? `<div class="footer"><p>Tilinumero: ${settings.iban}</p><p>Viitenumero: ${inv.id.replace(/[^0-9]/g, '').slice(-8)}</p></div>` : ''}
</body></html>`;

    const filename = `lasku_${inv.client.replace(/\s+/g, '_')}_${today.replace(/\./g, '-')}.html`;

    await sendTelegramDocument(chatId, html, filename, `🧾 *Lasku: ${inv.client}*\n💰 ${totalPrice}€ | ⏱ ${totalHours}h`);
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

    // ── Tools menu (no arg needed) ──
    if (action === 'tools') {
        await answerCallbackQuery(queryId);
        await handleToolsCallback(chatId, userId, actionArg, messageId);
        return;
    }

    // ── Setup start callback ──
    if (action === 'setup_start') {
        await answerCallbackQuery(queryId);
        if (messageId) await removeInlineKeyboard(chatId, messageId);
        if (actionArg === '1') {
            await promptSetupField(chatId, userId, 0);
        }
        return;
    }

    // ── Time entry callbacks ──
    if (action === 'te_save') {
        try {
            await answerCallbackQuery(queryId, '💾 Saving...');
            if (messageId) await removeInlineKeyboard(chatId, messageId);

            const pseudoPost = await getPendingPost(actionArg);
            if (!pseudoPost) {
                await sendMessage(chatId, '⚠️ Kirjausta ei löytynyt.');
                return;
            }

            const parsed: ParsedTimeEntry = JSON.parse(pseudoPost.content);
            const clientId = pseudoPost.meta_description; // stored clientId

            // Ensure client exists
            let client = await getClient(clientId);
            if (!client) {
                client = {
                    id: clientId,
                    name: parsed.client,
                    businessId: '',
                    address: '',
                    email: '',
                    contactPerson: '',
                    pricingModel: parsed.pricingModel,
                    defaultHourlyRate: parsed.hourlyRate,
                    createdAt: new Date().toISOString(),
                };
                await saveClient(client);
            }

            // Get or create open invoice for this client
            const invoice = await getOrCreateOpenInvoice(clientId, parsed.client);

            // Create time entry
            const entryId = `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const entry: TimeEntry = {
                id: entryId,
                invoiceId: invoice.id,
                client: parsed.client,
                description: parsed.description,
                location: parsed.location,
                date: parsed.date,
                hours: parsed.hours,
                pricingModel: parsed.pricingModel,
                hourlyRate: parsed.hourlyRate,
                fixedPrice: parsed.fixedPrice,
                totalPrice: parsed.totalPrice,
                createdAt: new Date().toISOString(),
            };
            await saveTimeEntry(entry);

            // Update invoice totals
            invoice.entries.push(entryId);
            invoice.totalHours += parsed.hours;
            invoice.totalPrice += parsed.totalPrice;
            await saveInvoice(invoice);

            await deletePendingPost(actionArg);

            await sendMessage(
                chatId,
                `✅ *Kirjattu!*\n\n` +
                `👤 ${parsed.client}\n` +
                `🔨 ${parsed.description}\n` +
                `⏱ ${parsed.hours}h` +
                (parsed.totalPrice > 0 ? ` | 💰 ${parsed.totalPrice}€` : '') +
                `\n\n📄 Lasku: ${invoice.id} (${invoice.entries.length} kirjausta)`
            );
        } catch (err) {
            console.error('[koivu-voice] te_save error', err);
            await sendMessage(chatId, `❌ Tallennus epäonnistui: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        return;
    }

    if (action === 'te_cancel') {
        await answerCallbackQuery(queryId, '❌ Hylätty');
        if (messageId) await removeInlineKeyboard(chatId, messageId);
        await deletePendingPost(actionArg);
        await sendMessage(chatId, '❌ Kirjaus hylätty.');
        return;
    }

    // ── Invoice callbacks ──
    if (action === 'inv_detail') {
        try {
            await answerCallbackQuery(queryId);
            if (messageId) await removeInlineKeyboard(chatId, messageId);

            const entries = await listTimeEntriesByInvoice(actionArg);
            if (entries.length === 0) {
                await sendMessage(chatId, '📋 Ei kirjauksia tällä laskulla.');
                return;
            }

            let text = '📋 *Laskun rivit:*\n\n';
            for (const e of entries) {
                text += `📅 ${e.date} — ${e.description}\n`;
                text += `⏱ ${e.hours}h`;
                if (e.totalPrice > 0) text += ` | 💰 ${e.totalPrice}€`;
                text += '\n\n';
            }
            await sendMessage(chatId, text);
        } catch (err) {
            console.error('[koivu-voice] inv_detail error', err);
            await sendMessage(chatId, '❌ Rivien haku epäonnistui.');
        }
        return;
    }

    if (action === 'inv_pdf') {
        try {
            await answerCallbackQuery(queryId, '📄 Generating...');
            if (messageId) await removeInlineKeyboard(chatId, messageId);
            await generateAndSendInvoice(chatId, actionArg);
        } catch (err) {
            console.error('[koivu-voice] inv_pdf error', err);
            await sendMessage(chatId, `❌ PDF-generointi epäonnistui: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        return;
    }

    if (action === 'inv_close') {
        try {
            await answerCallbackQuery(queryId, '🔒 Closing...');
            if (messageId) await removeInlineKeyboard(chatId, messageId);

            const inv = await getInvoice(actionArg);
            if (!inv) {
                await sendMessage(chatId, '⚠️ Laskua ei löytynyt.');
                return;
            }

            inv.status = 'closed';
            inv.closedAt = new Date().toISOString();
            await saveInvoice(inv);

            await sendMessage(
                chatId,
                `🔒 *Lasku suljettu*\n\n` +
                `👤 ${inv.client}\n` +
                `💰 ${inv.totalPrice}€ | ⏱ ${inv.totalHours}h\n\n` +
                '_Uusi avoin lasku luodaan automaattisesti seuraavalla kirjauksella._'
            );
        } catch (err) {
            console.error('[koivu-voice] inv_close error', err);
            await sendMessage(chatId, '❌ Laskun sulkeminen epäonnistui.');
        }
        return;
    }

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