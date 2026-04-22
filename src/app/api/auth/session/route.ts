import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/sessionToken';

const COOKIE = '__koivu_session';
const SECURE = process.env.NODE_ENV === 'production';

export async function POST(req: Request) {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 });

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const claims = await verifyAdminToken(token, projectId);
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, token, {
        httpOnly: true,
        secure: SECURE,
        sameSite: 'strict',
        // Firebase ID tokens expire after 1h; cookie should match.
        maxAge: 60 * 60,
        path: '/',
    });
    return res;
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, '', { httpOnly: true, secure: SECURE, sameSite: 'strict', maxAge: 0, path: '/' });
    return res;
}
