// One-time migration: fix Firestore log documents with spaces in their slugs

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { checkAdminApiSecret } from '@/lib/adminAuth';

function fixSlug(slug: string): string {
    return slug
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

const BROKEN_SLUGS = ['admin panel', 'testi 2', 'continuous learning'];

export async function POST(req: NextRequest) {
    const auth = checkAdminApiSecret(req);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = getAdminDb();
    const results: { slug: string; fixed: string; status: string }[] = [];

    for (const broken of BROKEN_SLUGS) {
        const fixed = fixSlug(broken);

        try {
            const snap = await db.doc(`logs/${broken}`).get();
            if (!snap.exists) {
                results.push({ slug: broken, fixed, status: 'not found' });
                continue;
            }

            const data = snap.data()!;
            data.id = fixed;

            await db.doc(`logs/${fixed}`).set(data);
            await db.doc(`logs/${broken}`).delete();

            results.push({ slug: broken, fixed, status: 'migrated' });
        } catch (err) {
            results.push({ slug: broken, fixed, status: `error: ${err instanceof Error ? err.message : 'unknown'}` });
        }
    }

    return NextResponse.json({ results });
}
