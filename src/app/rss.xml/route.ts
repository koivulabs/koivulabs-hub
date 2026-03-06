import { NextResponse } from 'next/server';

interface FirestoreDoc {
    name: string;
    fields: {
        title?: { stringValue: string };
        content?: { stringValue: string };
        status?: { stringValue: string };
        publishedAt?: { timestampValue: string };
    };
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export const dynamic = 'force-dynamic';

export async function GET() {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const base = 'https://koivulabs.com';

    let items = '';

    try {
        const res = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/logs?key=${apiKey}`,
            { cache: 'no-store' }
        );
        if (res.ok) {
            const data = await res.json();
            const docs: FirestoreDoc[] = (data.documents || [])
                .filter((d: FirestoreDoc) => d.fields?.status?.stringValue === 'Published')
                .sort((a: FirestoreDoc, b: FirestoreDoc) => {
                    const ta = new Date(a.fields?.publishedAt?.timestampValue || 0).getTime();
                    const tb = new Date(b.fields?.publishedAt?.timestampValue || 0).getTime();
                    return tb - ta;
                });

            items = docs.map((d) => {
                const title = d.fields.title?.stringValue || '';
                const content = d.fields.content?.stringValue || '';
                const pubDate = d.fields.publishedAt?.timestampValue || new Date().toISOString();
                const slug = d.name.split('/').pop() || '';
                const excerpt = content.replace(/\n/g, ' ').slice(0, 300);

                return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${base}/logbook/${escapeXml(slug)}</link>
      <guid isPermaLink="true">${base}/logbook/${escapeXml(slug)}</guid>
      <description>${escapeXml(excerpt)}...</description>
      <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
    </item>`;
            }).join('');
        }
    } catch {
        // Return empty feed on Firestore error
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Koivu Labs — Founder's Logbook</title>
    <link>${base}/logbook</link>
    <description>Dev logs, experiments, and founder reflections from Koivu Labs in Saarijärvi, Finland.</description>
    <language>en</language>
    <managingEditor>hello@koivulabs.com (Keijo Koivunen)</managingEditor>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
