import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, narrative } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // System prompt that defines the "Koivu Labs" voice
        const systemPrompt = `
You are the AI editor for Koivu Labs, a Finnish Software Studio. 
Your task is to refine the user's raw dev log text into a polished, professional, yet slightly "Nordic Noir" and pragmatic post.
Maintain the following narrative: ${narrative || 'A Finnish Software Studio focused on AI-driven utility. Bridging human common sense with AI power.'}

Rules:
1. Keep it professional but minimalist.
2. Use strong, active verbs.
3. Keep a sense of "Nordic Precision" (clean, honest, direct).
4. Do not yap. No fluff.
5. If the user mentions a specific problem, emphasize the "pragmatic intelligence" used to solve it.

Return ONLY the refined text.
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
