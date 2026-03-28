// Pending post storage via Firestore REST API
// Stores draft posts waiting for user approval before publishing

import { LogbookPost } from './koivuVoice';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PendingPost extends LogbookPost {
    pendingId: string;
    chatId: number;
    messageId?: number; // Telegram message ID for editing the preview
    status: 'pending' | 'editing';
    createdAt: string;
    imageFileIds: string[]; // Telegram file_id references for attached photos
}

export interface UserState {
    mode: 'idle' | 'editing';
    pendingId?: string;
}

// ─────────────────────────────────────────────
// Firestore REST helpers
// ─────────────────────────────────────────────

function firestoreUrl(path: string): string {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!projectId || !apiKey) throw new Error('Firebase env vars not set');
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?key=${apiKey}`;
}

// ─────────────────────────────────────────────
// Pending Posts CRUD
// ─────────────────────────────────────────────

export async function savePendingPost(post: PendingPost): Promise<void> {
    const url = firestoreUrl(`pendingPosts/${post.pendingId}`);

    const body = {
        fields: {
            pendingId:        { stringValue: post.pendingId },
            slug:             { stringValue: post.slug },
            title:            { stringValue: post.title },
            date:             { stringValue: post.date },
            meta_description: { stringValue: post.meta_description },
            content:          { stringValue: post.content },
            chatId:           { integerValue: String(post.chatId) },
            messageId:        post.messageId ? { integerValue: String(post.messageId) } : { nullValue: null },
            status:           { stringValue: post.status },
            createdAt:        { stringValue: post.createdAt },
            tags: {
                arrayValue: {
                    values: post.tags.map(t => ({ stringValue: t })),
                },
            },
            imageFileIds: {
                arrayValue: {
                    values: (post.imageFileIds ?? []).map(id => ({ stringValue: id })),
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
        throw new Error(`Firestore save pending error: ${JSON.stringify(err)}`);
    }
}

export async function getPendingPost(pendingId: string): Promise<PendingPost | null> {
    const url = firestoreUrl(`pendingPosts/${pendingId}`);

    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Firestore get pending error: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const f = data.fields;
    if (!f) return null;

    return {
        pendingId:        f.pendingId?.stringValue ?? '',
        slug:             f.slug?.stringValue ?? '',
        title:            f.title?.stringValue ?? '',
        date:             f.date?.stringValue ?? '',
        meta_description: f.meta_description?.stringValue ?? '',
        content:          f.content?.stringValue ?? '',
        chatId:           Number(f.chatId?.integerValue ?? 0),
        messageId:        f.messageId?.integerValue ? Number(f.messageId.integerValue) : undefined,
        status:           (f.status?.stringValue ?? 'pending') as 'pending' | 'editing',
        createdAt:        f.createdAt?.stringValue ?? '',
        tags:             f.tags?.arrayValue?.values?.map((v: { stringValue: string }) => v.stringValue) ?? [],
        imageFileIds:     f.imageFileIds?.arrayValue?.values?.map((v: { stringValue: string }) => v.stringValue) ?? [],
    };
}

export async function deletePendingPost(pendingId: string): Promise<void> {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!projectId || !apiKey) throw new Error('Firebase env vars not set');

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pendingPosts/${pendingId}?key=${apiKey}`;

    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
        const err = await res.json();
        throw new Error(`Firestore delete pending error: ${JSON.stringify(err)}`);
    }
}

// ─────────────────────────────────────────────
// User State (editing mode tracking)
// ─────────────────────────────────────────────

export async function getUserState(userId: number): Promise<UserState> {
    const url = firestoreUrl(`userState/${userId}`);

    const res = await fetch(url);
    if (res.status === 404) return { mode: 'idle' };
    if (!res.ok) return { mode: 'idle' };

    const data = await res.json();
    const f = data.fields;
    if (!f) return { mode: 'idle' };

    return {
        mode: (f.mode?.stringValue ?? 'idle') as 'idle' | 'editing',
        pendingId: f.pendingId?.stringValue || undefined,
    };
}

export async function setUserState(userId: number, state: UserState): Promise<void> {
    const url = firestoreUrl(`userState/${userId}`);

    const fields: Record<string, unknown> = {
        mode: { stringValue: state.mode },
    };
    if (state.pendingId) {
        fields.pendingId = { stringValue: state.pendingId };
    }

    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Firestore set user state error: ${JSON.stringify(err)}`);
    }
}

export async function clearUserState(userId: number): Promise<void> {
    await setUserState(userId, { mode: 'idle' });
}