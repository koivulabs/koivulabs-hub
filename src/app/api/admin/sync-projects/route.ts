// Syncs all static projects to Firestore projects collection

import { NextRequest, NextResponse } from 'next/server';
import { projects } from '@/constants/projects';

const BASE = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/projects`;
const KEY = `?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string') {
            fields[k] = { stringValue: v };
        } else if (typeof v === 'number') {
            fields[k] = { doubleValue: v };
        } else if (Array.isArray(v)) {
            fields[k] = {
                arrayValue: {
                    values: v.map(item =>
                        typeof item === 'string' ? { stringValue: item } : { doubleValue: item }
                    ),
                },
            };
        } else if (typeof v === 'object' && v !== null) {
            fields[k] = { mapValue: { fields: toFirestoreFields(v as Record<string, unknown>) } };
        }
    }
    return fields;
}

export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: { id: string; status: string }[] = [];

    for (const project of projects) {
        const fields = toFirestoreFields(project as unknown as Record<string, unknown>);
        const res = await fetch(`${BASE}/${project.id}${KEY}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields }),
        });
        results.push({ id: project.id, status: res.ok ? 'synced' : `error ${res.status}` });
    }

    return NextResponse.json({ results });
}
