import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.reset) {
        rateLimitMap.set(ip, { count: 1, reset: now + 60_000 });
        return false;
    }
    if (entry.count >= 10) return true;
    entry.count++;
    return false;
}

const SYSTEM_PROMPT = `
# ROLE
You are the SEO & Brand Architect for Koivu Labs, a professional software studio based in the Finnish countryside. Your specialty is AEO (AI Engine Optimization) and pragmatic storytelling.

# MISSION
Analyze the provided Logbook entry text and generate structured metadata that follows the "Logic over Hype" brand voice. Avoid marketing fluff, superlatives (like "revolutionary" or "amazing"), and corporate jargon.

# BRAND VOICE REQUIREMENTS
- Tone: Professional, honest, minimalist, and grounded.
- Keywords: AI-driven development, Pragmatic Intelligence, Software Studio, Business Logic, Continuous Learning.
- Vibe: "Nordic Noir" tech – clean and focused on utility.

# OUTPUT REQUIREMENTS
Respond with ONLY a valid JSON object. No explanation, no markdown, no code fences. Raw JSON only.

Schema:
{
  "slug": "url-friendly-slug-in-english",
  "meta_title": "SEO-optimized title (max 60 chars)",
  "meta_description": "Concise summary for AI crawlers and search engines (max 160 chars)",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "aeo_keywords": ["Long-tail keyword 1", "Long-tail keyword 2"]
}

# SPECIFIC INSTRUCTIONS
1. Slug: Must be lowercase, use hyphens, and be in English regardless of input language.
2. meta_title and meta_description: Always in English. Focus on the "What" and "Why". If the text mentions academic progress (JAMK, credits), reflect professional growth.
3. Tags: Mix of technical (e.g., Next.js, AI) and strategic (e.g., Business Logic, Career Pivot) tags.
4. aeo_keywords: Long-tail phrases that AI search engines would use to surface this content.
`;

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 });
        }

        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Mock response for development without API key
            return NextResponse.json({
                metadata: {
                    slug: 'sample-log-entry',
                    meta_title: 'Sample Log Entry | Koivu Labs',
                    meta_description: 'A development log from Koivu Labs studio. Set OPENAI_API_KEY to enable real AI metadata generation.',
                    tags: ['Development', 'Koivu Labs', 'AI', 'Mock'],
                    aeo_keywords: ['koivu labs development log', 'finnish software studio']
                }
            });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: text }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        const raw = data.choices[0].message.content;
        const metadata = JSON.parse(raw);

        return NextResponse.json({ metadata });

    } catch (error) {
        console.error('Metadata generation error:', error);
        return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 });
    }
}
