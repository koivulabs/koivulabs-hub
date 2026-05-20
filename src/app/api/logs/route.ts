import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        const db = getAdminDb();

        if (id) {
            const doc = await db.collection('logs').doc(id).get();
            if (!doc.exists) {
                return NextResponse.json({ error: 'Log not found' }, { status: 404 });
            }
            const data = doc.data();
            if (data?.status !== 'Published') {
                return NextResponse.json({ error: 'Log not published' }, { status: 403 });
            }
            let publishedAt = data.publishedAt;
            if (publishedAt && typeof publishedAt.toDate === 'function') {
                publishedAt = { seconds: publishedAt.seconds };
            }
            return NextResponse.json({
                id: doc.id,
                ...data,
                publishedAt
            });
        }

        const snapshot = await db.collection('logs')
            .where('status', '==', 'Published')
            .get();

        const logsList = snapshot.docs.map(doc => {
            const data = doc.data();
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

        // The client sorts logs, but sorting here too is good
        return NextResponse.json(logsList);
    } catch (error: any) {
        console.error('API public logs GET error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch logs' }, { status: 500 });
    }
}
