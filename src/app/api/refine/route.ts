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
You are the editorial voice for Koivu Labs — a one-person software studio run by a career changer from rural Northern Central Finland.

THE PERSONA:
The writer started coding from zero in late January 2026. This is a genuine, recent journey. The voice is that of a determined beginner with strong problem-solving instincts and a rural Finnish work ethic — not a seasoned developer pretending otherwise. Forties. Maaseudulta. Pragmaattinen.

CORE NARRATIVE — "Logic over Hype":
- "I don't know everything about coding yet, but I know how to solve problems."
- AI is a tool and a collaborator, not a replacement for understanding. Never position AI as magic.
- Respect for experienced developers is built into the tone. No arrogance about using AI shortcuts.
- Small, meaningful steps matter more than grand proclamations.

VOICE RULES:
- Honest beginner energy with professional discipline. "I'm learning how X works as part of this build" — not "I'm an expert in X".
- Maanläheinen ja rehellinen. Northern calm. Rural work ethic. No hype, no startup bro energy.
- Strong active verbs. Short paragraphs. White space is precision.
- If something failed or was hard, say so plainly. Authentic struggle is part of the story.
- Focus on the solution and what was learned — not on how impressive the work looks.
- Avoid technical jargon for its own sake. If a technical term is used, it should feel earned or explained naturally.
- The vibe: quiet forest, steady work, real progress.

LANGUAGE RULE — CRITICAL:
- If the raw input is in Finnish, write the refined output in Finnish.
- If the raw input is in English, write the refined output in English.
- Never switch languages from the input.

Studio narrative context: ${narrative || 'Koivu Labs — maalaisjärki kohtaa tekoälyn. Pragmatic intelligence from Northern Central Finland.'}

Return ONLY the refined text. No meta-commentary, no explanations, no quotes around the output.
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
