export type PublishedAtInput =
    | { seconds: number }
    | { toDate: () => Date }
    | { timestampValue: string }
    | string
    | null
    | undefined;

export interface DevLog {
    id: string;
    title: string;
    content: string;
    tags: string[];
    status: 'Draft' | 'Published';
    publishedAt: PublishedAtInput;
    metaTitle?: string;
    metaDescription?: string;
    aeoKeywords?: string[];
}

/** Normalize publishedAt into a Date.
 *  Tolerates: Firestore Timestamp ({seconds}), ISO string (from Telegram bot),
 *  REST API format ({timestampValue}), or missing/invalid. */
export function toPublishedDate(publishedAt: PublishedAtInput): Date | null {
    if (!publishedAt) return null;
    if (typeof publishedAt === 'string') {
        const d = new Date(publishedAt);
        return isNaN(d.getTime()) ? null : d;
    }
    if (typeof publishedAt === 'object') {
        if ('seconds' in publishedAt && typeof publishedAt.seconds === 'number') {
            return new Date(publishedAt.seconds * 1000);
        }
        if ('_seconds' in publishedAt && typeof (publishedAt as any)._seconds === 'number') {
            return new Date((publishedAt as any)._seconds * 1000);
        }
        if ('toDate' in publishedAt && typeof publishedAt.toDate === 'function') {
            return publishedAt.toDate();
        }
        if ('timestampValue' in publishedAt && typeof publishedAt.timestampValue === 'string') {
            const d = new Date(publishedAt.timestampValue);
            return isNaN(d.getTime()) ? null : d;
        }
    }
    return null;
}

export const logService = {
    async getAllLogs(includeDrafts = false): Promise<DevLog[]> {
        // If includeDrafts=true, fetch from the protected admin endpoint.
        // Otherwise, fetch from the unprotected public endpoint.
        const url = includeDrafts ? "/api/admin/logs?includeDrafts=true" : "/api/logs";
        const res = await fetch(url);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to load logs");
        }
        const logs = await res.json() as DevLog[];
        
        // Always return sorted client-side for consistency
        return logs.sort((a, b) => {
            const da = toPublishedDate(a.publishedAt)?.getTime() ?? 0;
            const db = toPublishedDate(b.publishedAt)?.getTime() ?? 0;
            return db - da;
        });
    },

    async saveLog(log: DevLog): Promise<void> {
        const res = await fetch("/api/admin/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(log)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to save log");
        }
    },

    async getLog(logId: string): Promise<DevLog | null> {
        // Public single log request
        const res = await fetch(`/api/logs?id=${logId}`);
        if (!res.ok) {
            if (res.status === 404) return null;
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to fetch log");
        }
        return res.json();
    },

    async deleteLog(logId: string): Promise<void> {
        const res = await fetch(`/api/admin/logs?id=${logId}`, {
            method: "DELETE"
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to delete log");
        }
    }
};
