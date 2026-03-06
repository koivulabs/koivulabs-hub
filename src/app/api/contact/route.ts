import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // TODO: wire to email service (Resend, SendGrid, etc.)
        // For now, log and return success
        console.log('[CONTACT]', { name, email, subject, message: message.slice(0, 100) });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
