// In-memory rate limit keyed by IP.
//
// NOTE: Vercel Functions scale horizontally, so each lambda instance has
// its own Map. The real global limit is therefore `limit * N instances`.
// Fine as a local cheap guard; swap to Upstash/Vercel KV for a hard cap.

type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();

export function isRateLimited(ip: string, limit = 10, windowMs = 60_000): boolean {
    const now = Date.now();
    const entry = buckets.get(ip);
    if (!entry || now > entry.reset) {
        buckets.set(ip, { count: 1, reset: now + windowMs });
        return false;
    }
    if (entry.count >= limit) return true;
    entry.count++;
    return false;
}

export function clientIp(req: Request): string {
    const header = req.headers.get('x-forwarded-for') ?? '';
    const first = header.split(',')[0]?.trim();
    return first || 'unknown';
}
