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
        const db = getAdminDb();
        const snapshot = await db.collection('projects').orderBy('name').get();
        const projectsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(projectsList);
    } catch (error: any) {
        console.error('API projects GET error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const claims = await authorizeAdmin(req);
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const project = await req.json();
        if (!project || !project.id) {
            return NextResponse.json({ error: 'Missing project or project ID' }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection('projects').doc(project.id).set(project, { merge: true });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API projects POST error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save project' }, { status: 500 });
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
            return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection('projects').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API projects DELETE error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
    }
}
