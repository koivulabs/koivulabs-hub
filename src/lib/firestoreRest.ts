// Server-side Firestore writes via REST API (no client SDK needed)

import { LogbookPost } from './koivuVoice';

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
