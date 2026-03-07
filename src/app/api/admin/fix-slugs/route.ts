// One-time migration: fix Firestore log documents with spaces in their slugs

import { NextRequest, NextResponse } from 'next/server';

const BASE = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/logs`;
const KEY = `?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

async function getDoc(slug: string) {
    const res = await fetch(`${BASE}/${encodeURIComponent(slug)}${KEY}`);
    if (!res.ok) return null;
    return res.json();
}

async function createDoc(slug: string, fields: unknown) {
    const res = await fetch(`${BASE}/${slug}${KEY}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
    });
    return res.ok;
}

async function deleteDoc(slug: string) {
    const res = await fetch(`${BASE}/${encodeURIComponent(slug)}${KEY}`, {
        method: 'DELETE',
    });
    return res.ok;
}

function fixSlug(slug: string): string {
    return slug
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

const BROKEN_SLUGS = ['admin panel', 'testi 2', 'continuous learning'];

export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: { slug: string; fixed: string; status: string }[] = [];

    for (const broken of BROKEN_SLUGS) {
        const fixed = fixSlug(broken);
        const docData = await getDoc(broken);

        if (!docData || docData.error) {
            results.push({ slug: broken, fixed, status: 'not found' });
            continue;
        }

        // Update the id field inside the document to match new slug
        const fields = { ...docData.fields, id: { stringValue: fixed } };

        const created = await createDoc(fixed, fields);
        if (!created) {
            results.push({ slug: broken, fixed, status: 'create failed' });
            continue;
        }

        const deleted = await deleteDoc(broken);
        results.push({ slug: broken, fixed, status: deleted ? 'migrated' : 'created but old not deleted' });
    }

    return NextResponse.json({ results });
}
