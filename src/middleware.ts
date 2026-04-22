import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/sessionToken';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('__koivu_session')?.value;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    const loginUrl = new URL('/admin/login', request.url);

    if (!token || !projectId) {
        return NextResponse.redirect(loginUrl);
    }

    const claims = await verifyAdminToken(token, projectId);
    if (!claims) {
        const res = NextResponse.redirect(loginUrl);
        res.cookies.set('__koivu_session', '', { maxAge: 0, path: '/' });
        return res;
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/((?!login).*)',
};
