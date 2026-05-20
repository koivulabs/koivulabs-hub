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
        const city = searchParams.get('city');
        const niche = searchParams.get('niche');

        const db = getAdminDb();
        let queryRef: any = db.collection('leads');

        if (city && niche) {
            queryRef = queryRef.where('city', '==', city).where('niche', '==', niche);
        }

        const snapshot = await queryRef.orderBy('createdAt', 'desc').get();
        const leadsList = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(leadsList);
    } catch (error: any) {
        console.error('API leads GET error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const claims = await authorizeAdmin(req);
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const lead = await req.json();
        if (!lead || !lead.id) {
            return NextResponse.json({ error: 'Missing lead or lead ID' }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection('leads').doc(lead.id).set(lead, { merge: true });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API leads POST error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save lead' }, { status: 500 });
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
            return NextResponse.json({ error: 'Missing lead ID or update data' }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection('leads').doc(id).update(data);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API leads PATCH error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 });
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
            return NextResponse.json({ error: 'Missing lead ID' }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection('leads').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API leads DELETE error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete lead' }, { status: 500 });
    }
}
