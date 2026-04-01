// Syncs all static projects to Firestore projects collection

import { NextRequest, NextResponse } from 'next/server';
import { projects } from '@/constants/projects';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const results: { id: string; status: string }[] = [];

    for (const project of projects) {
        try {
            await db.doc(`projects/${project.id}`).set(
                project as unknown as Record<string, unknown>,
            );
            results.push({ id: project.id, status: 'synced' });
        } catch (err) {
            results.push({ id: project.id, status: `error: ${err instanceof Error ? err.message : 'unknown'}` });
        }
    }

    return NextResponse.json({ results });
}
