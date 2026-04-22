import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const TELEGRAM_USER_ID = process.env.MY_TELEGRAM_USER_ID ?? '';

function sanitize(s: string, max: number): string {
    return s.trim().slice(0, max);
}

async function pingTelegram(text: string): Promise<void> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_USER_ID) return;
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_USER_ID, text, parse_mode: 'HTML' }),
        });
    } catch (err) {
        console.error('[CONTACT] Telegram ping failed', err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const name = typeof body.name === 'string' ? sanitize(body.name, 200) : '';
        const email = typeof body.email === 'string' ? sanitize(body.email, 320) : '';
        const subject = typeof body.subject === 'string' ? sanitize(body.subject, 200) : '';
        const message = typeof body.message === 'string' ? sanitize(body.message, 5000) : '';

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const db = getAdminDb();
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const createdAt = new Date().toISOString();

        await db.doc(`contactMessages/${id}`).set({
            id, name, email, subject, message, createdAt, status: 'new',
        });

        const escaped = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        await pingTelegram(
            `📬 <b>New contact</b>\n` +
            `<b>From:</b> ${escaped(name)} &lt;${escaped(email)}&gt;\n` +
            `<b>Subject:</b> ${escaped(subject)}\n\n` +
            `${escaped(message.slice(0, 1500))}${message.length > 1500 ? '…' : ''}`,
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[CONTACT]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
