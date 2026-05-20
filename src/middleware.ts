import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/sessionToken';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('__koivu_session')?.value;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    console.log(`[Middleware Debug] token: ${token ? token.substring(0, 20) + '...' : 'MISSING'} | projectId: ${projectId || 'MISSING'}`);

    const loginUrl = new URL('/admin/login', request.url);

    if (!token || !projectId) {
        console.log(`[Middleware Redirect] Reason: Missing token or projectId`);
        return NextResponse.redirect(loginUrl);
    }

    const claims = await verifyAdminToken(token, projectId);
    if (!claims) {
        console.log(`[Middleware Redirect] Reason: Invalid token claims`);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.set('__koivu_session', '', { maxAge: 0, path: '/' });
        return res;
    }

    console.log(`[Middleware Pass] Valid admin token detected for ${claims.email}`);
    return NextResponse.next();
}

export const config = {
    matcher: '/admin/((?!login).*)',
};
