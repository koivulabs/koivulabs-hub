// Pending post storage via Firebase Admin SDK
// Stores draft posts waiting for user approval before publishing

import { LogbookPost } from './koivuVoice';
import { getAdminDb } from './firebaseAdmin';

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
// Helper
// ─────────────────────────────────────────────

function db() {
    return getAdminDb();
}

// ─────────────────────────────────────────────
// Pending Posts CRUD
// ─────────────────────────────────────────────

export async function savePendingPost(post: PendingPost): Promise<void> {
    await db().doc(`pendingPosts/${post.pendingId}`).set({
        pendingId: post.pendingId,
        slug: post.slug,
        title: post.title,
        date: post.date,
        meta_description: post.meta_description,
        content: post.content,
        chatId: post.chatId,
        messageId: post.messageId ?? null,
        status: post.status,
        createdAt: post.createdAt,
        tags: post.tags,
        imageFileIds: post.imageFileIds ?? [],
    });
}

export async function getPendingPost(pendingId: string): Promise<PendingPost | null> {
    const snap = await db().doc(`pendingPosts/${pendingId}`).get();
    if (!snap.exists) return null;

    const d = snap.data()!;
    return {
        pendingId: d.pendingId ?? '',
        slug: d.slug ?? '',
        title: d.title ?? '',
        date: d.date ?? '',
        meta_description: d.meta_description ?? '',
        content: d.content ?? '',
        chatId: Number(d.chatId ?? 0),
        messageId: d.messageId ? Number(d.messageId) : undefined,
        status: (d.status ?? 'pending') as 'pending' | 'editing',
        createdAt: d.createdAt ?? '',
        tags: d.tags ?? [],
        imageFileIds: d.imageFileIds ?? [],
    };
}

/** List all pending posts */
export async function listPendingPosts(): Promise<PendingPost[]> {
    const snap = await db().collection('pendingPosts').limit(50).get();

    return snap.docs
        .map(doc => {
            const d = doc.data();
            return {
                pendingId: d.pendingId ?? '',
                slug: d.slug ?? '',
                title: d.title ?? '',
                date: d.date ?? '',
                meta_description: d.meta_description ?? '',
                content: d.content ?? '',
                chatId: Number(d.chatId ?? 0),
                messageId: d.messageId ? Number(d.messageId) : undefined,
                status: (d.status ?? 'pending') as 'pending' | 'editing',
                createdAt: d.createdAt ?? '',
                tags: d.tags ?? [],
                imageFileIds: d.imageFileIds ?? [],
            } as PendingPost;
        })
        .filter(p => p.pendingId);
}

/** Count published logbook entries */
export async function countPublishedLogs(): Promise<number> {
    const snap = await db().collection('logs').limit(100).get();
    return snap.docs.length;
}

export async function deletePendingPost(pendingId: string): Promise<void> {
    await db().doc(`pendingPosts/${pendingId}`).delete();
}

// ─────────────────────────────────────────────
// User State (editing mode tracking)
// ─────────────────────────────────────────────

export async function getUserState(userId: number): Promise<UserState> {
    const snap = await db().doc(`userState/${userId}`).get();
    if (!snap.exists) return { mode: 'idle' };

    const d = snap.data()!;
    return {
        mode: (d.mode ?? 'idle') as 'idle' | 'editing',
        pendingId: d.pendingId || undefined,
    };
}

export async function setUserState(userId: number, state: UserState): Promise<void> {
    const data: Record<string, unknown> = {
        mode: state.mode,
    };
    if (state.pendingId) {
        data.pendingId = state.pendingId;
    }

    await db().doc(`userState/${userId}`).set(data);
}

export async function clearUserState(userId: number): Promise<void> {
    await setUserState(userId, { mode: 'idle' });
}
