// Server-side Firestore reads/writes via REST API (no client SDK needed)

import { LogbookPost } from './koivuVoice';

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

function firestoreBaseUrl(): { projectId: string; apiKey: string } {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!projectId || !apiKey) throw new Error('Firebase env vars not set');
    return { projectId, apiKey };
}

function docUrl(collection: string, docId: string): string {
    const { projectId, apiKey } = firestoreBaseUrl();
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?key=${apiKey}`;
}

export async function saveLogToFirestore(post: LogbookPost): Promise<void> {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
        throw new Error('Firebase env vars not set');
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/logs/${post.slug}?key=${apiKey}`;

    const body = {
        fields: {
            id:              { stringValue: post.slug },
            title:           { stringValue: post.title },
            content:         { stringValue: post.content },
            status:          { stringValue: 'Published' },
            publishedAt:     { timestampValue: new Date().toISOString() },
            metaDescription: { stringValue: post.meta_description },
            tags: {
                arrayValue: {
                    values: post.tags.map(t => ({ stringValue: t })),
                },
            },
        },
    };

    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Firestore REST error: ${JSON.stringify(err)}`);
    }
}

// ─────────────────────────────────────────────
// Now page
// ─────────────────────────────────────────────

export interface NowPageData {
    building: string[];
    learning: string[];
    reading: string[];
    notDoing: string[];
    location: string;
    updatedAt: string;
}

export async function saveNowPage(data: NowPageData): Promise<void> {
    const url = docUrl('siteContent', 'now');

    const toArray = (items: string[]) => ({
        arrayValue: { values: items.map(s => ({ stringValue: s })) },
    });

    const body = {
        fields: {
            building:  toArray(data.building),
            learning:  toArray(data.learning),
            reading:   toArray(data.reading),
            notDoing:  toArray(data.notDoing),
            location:  { stringValue: data.location },
            updatedAt: { stringValue: data.updatedAt },
        },
    };

    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Firestore save now error: ${JSON.stringify(err)}`);
    }
}

export async function getNowPage(): Promise<NowPageData | null> {
    const url = docUrl('siteContent', 'now');

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const f = data.fields;
    if (!f) return null;

    const toStrings = (field: { arrayValue?: { values?: Array<{ stringValue: string }> } }) =>
        field?.arrayValue?.values?.map(v => v.stringValue) ?? [];

    return {
        building:  toStrings(f.building),
        learning:  toStrings(f.learning),
        reading:   toStrings(f.reading),
        notDoing:  toStrings(f.notDoing),
        location:  f.location?.stringValue ?? '',
        updatedAt: f.updatedAt?.stringValue ?? '',
    };
}

// ─────────────────────────────────────────────
// Delete published log
// ─────────────────────────────────────────────

export async function deleteLogFromFirestore(slug: string): Promise<void> {
    const url = docUrl('logs', slug);

    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
        const err = await res.json();
        throw new Error(`Firestore delete log error: ${JSON.stringify(err)}`);
    }
}

export interface PublishedLog {
    slug: string;
    title: string;
    publishedAt: string;
}

export async function listPublishedLogs(): Promise<PublishedLog[]> {
    const { projectId, apiKey } = firestoreBaseUrl();
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/logs?key=${apiKey}&pageSize=50`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.documents) return [];

    return data.documents
        .map((doc: { fields: Record<string, { stringValue?: string; timestampValue?: string }> }) => {
            const f = doc.fields;
            return {
                slug: f.id?.stringValue ?? '',
                title: f.title?.stringValue ?? '',
                publishedAt: f.publishedAt?.timestampValue ?? '',
            };
        })
        .filter((log: PublishedLog) => log.slug)
        .sort((a: PublishedLog, b: PublishedLog) => b.publishedAt.localeCompare(a.publishedAt));
}
