import { timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

export type AdminAuthResult =
    | { ok: true }
    | { ok: false; status: number; error: string };

export function checkAdminApiSecret(req: NextRequest): AdminAuthResult {
    const expected = process.env.ADMIN_API_SECRET;
    if (!expected) {
        return { ok: false, status: 500, error: 'ADMIN_API_SECRET not configured' };
    }

    const header = req.headers.get('authorization') ?? '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        return { ok: false, status: 401, error: 'Missing bearer token' };
    }

    const provided = match[1].trim();
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return { ok: false, status: 401, error: 'Unauthorized' };
    }

    return { ok: true };
}
