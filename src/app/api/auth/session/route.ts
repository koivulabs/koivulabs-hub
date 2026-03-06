import { NextResponse } from 'next/server';

const COOKIE = '__koivu_session';
const SECURE = process.env.NODE_ENV === 'production';

export async function POST(req: Request) {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, token, {
        httpOnly: true,
        secure: SECURE,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/',
    });
    return res;
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, '', { httpOnly: true, secure: SECURE, sameSite: 'strict', maxAge: 0, path: '/' });
    return res;
}
