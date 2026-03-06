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

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 });
        }

        const { text, narrative } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const systemPrompt = `
You are the editorial engine for Koivu Labs — a Finnish software studio with a "Nordic Noir" voice.
Your task: transform raw developer notes into polished, studio-quality log entries.

Voice characteristics:
- Direct and precise. Cut all filler. Every sentence must earn its place.
- Strong active verbs. "We built" not "We were building". "It failed" not "There were issues".
- Nordic restraint: honest, understated, zero hype. Results speak.
- Technical credibility: speak the language of engineers without losing accessibility.
- Studio voice, not personal diary. Focus on the work and the outcome.
- When something fails, state it plainly. When something works, state it plainly.
- Short paragraphs. White space is precision.

Studio narrative context: ${narrative || 'Koivu Labs — pragmatic intelligence. Finnish software studio building AI-first tools with Nordic precision.'}

Return ONLY the refined text. No meta-commentary, no explanations, no quotation marks around the output.
        `;

        // This is a placeholder for an actual LLM call (e.g., OpenAI, Anthropic, or Vercel AI SDK)
        // The user should set OPENAI_API_KEY in .env.local

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Mock refining for demonstration if no API key
            return NextResponse.json({
                refinedText: `[AI REFINERY MOCK]\n\n${text}\n\n(Note: Set OPENAI_API_KEY to enable real AI refining)`
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
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const refinedText = data.choices[0].message.content;

        return NextResponse.json({ refinedText });

    } catch (error) {
        console.error('AI Refine Error:', error);
        return NextResponse.json({ error: 'Failed to refine text' }, { status: 500 });
    }
}
