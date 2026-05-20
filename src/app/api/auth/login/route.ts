import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/sessionToken';

const COOKIE = '__koivu_session';
const SECURE = process.env.NODE_ENV === 'production';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (!apiKey || !projectId) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        // Make server-side request to Firebase Auth REST API with Referer spoofing
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
        const authRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://koivulabs.com' // Spoof referer to bypass localhost restriction
            },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
            })
        });

        const authData = await authRes.json();
        if (!authRes.ok) {
            return NextResponse.json({ error: authData.error?.message || 'Authentication failed' }, { status: authRes.status });
        }

        const token = authData.idToken;
        const claims = await verifyAdminToken(token, projectId);
        if (!claims) {
            return NextResponse.json({ error: 'Unauthorized: Access restricted to administrators' }, { status: 401 });
        }

        const { getAdminAuth } = await import('@/lib/firebaseAdmin');
        const customToken = await getAdminAuth().createCustomToken(claims.sub as string, { admin: true });

        const res = NextResponse.json({ ok: true, customToken });
        res.cookies.set(COOKIE, token, {
            httpOnly: true,
            secure: SECURE,
            sameSite: 'strict',
            maxAge: 60 * 60,
            path: '/',
        });
        return res;
    } catch (error: any) {
        console.error('Server-side login error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

