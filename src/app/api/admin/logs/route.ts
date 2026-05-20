import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { verifyAdminToken } from '@/lib/sessionToken';

// Helper to authorize admin
async function authorizeAdmin(req: NextRequest) {
    const token = req.cookies.get('__koivu_session')?.value;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!token || !projectId) {
        return null;
    }

    return await verifyAdminToken(token, projectId);
}

export async function GET(req: NextRequest) {
    const claims = await authorizeAdmin(req);
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const includeDrafts = searchParams.get('includeDrafts') === 'true';

        const db = getAdminDb();
        const queryRef = db.collection('logs');

        let snapshot;
        if (includeDrafts) {
            snapshot = await queryRef.orderBy('publishedAt', 'desc').get();
        } else {
            snapshot = await queryRef.where('status', '==', 'Published').get();
        }

        const logsList = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Timestamp to plain object for clean JSON serialization
            let publishedAt = data.publishedAt;
            if (publishedAt && typeof publishedAt.toDate === 'function') {
                publishedAt = { seconds: publishedAt.seconds };
            }
            return {
                id: doc.id,
                ...data,
                publishedAt
            };
        });

        // Client-side sorting for non-drafts is handled by client or we can return it.
        return NextResponse.json(logsList);
    } catch (error: any) {
        console.error('API logs GET error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch logs' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const claims = await authorizeAdmin(req);
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const log = await req.json();
        if (!log || !log.id) {
            return NextResponse.json({ error: 'Missing log or log ID' }, { status: 400 });
        }

        const db = getAdminDb();
        // Handle publishedAt date conversions: if it's sent, convert to Firestore timestamp
        const logData = { ...log };
        if (logData.publishedAt) {
            if (typeof logData.publishedAt === 'string') {
                logData.publishedAt = new Date(logData.publishedAt);
            } else if (typeof logData.publishedAt === 'object' && 'seconds' in logData.publishedAt) {
                logData.publishedAt = new Date(logData.publishedAt.seconds * 1000);
            }
        } else {
            logData.publishedAt = new Date();
        }

        await db.collection('logs').doc(log.id).set(logData, { merge: true });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API logs POST error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save log' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const claims = await authorizeAdmin(req);
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing log ID' }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection('logs').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API logs DELETE error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete log' }, { status: 500 });
    }
}
export async function PATCH(req: NextRequest) {
    const claims = await authorizeAdmin(req);
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const data = await req.json();

        if (!id || !data) {
            return NextResponse.json({ error: 'Missing log ID or update data' }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection('logs').doc(id).update(data);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API logs PATCH error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update log' }, { status: 500 });
    }
}
