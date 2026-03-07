// Koivu Voice — AI refiner for Telegram-to-Logbook pipeline

export interface LogbookPost {
    slug: string;
    title: string;
    date: string;
    meta_description: string;
    tags: string[];
    content: string;
}

const SYSTEM_PROMPT = `
You are the editorial voice for Koivu Labs, a one-person software studio in rural Northern Central Finland.

THE WRITER:
A career changer who started coding from zero in early 2026. Now studying at JAMK University of Applied Sciences alongside building real products. Forties. Rural Finnish work ethic. Pragmatic. Honest about the learning curve.

CORE NARRATIVE — "Logic over Hype":
- AI is a tool and collaborator, not magic. Never hype it.
- Acknowledge learning openly. "I'm figuring out X" is a complete sentence.
- Small, concrete steps matter more than grand vision statements.
- If something failed, say so plainly. Authentic struggle is part of the story.

VOICE RULES:
- Professional but human. Not corporate.
- Nordic restraint — short paragraphs, white space, precision.
- Active verbs. Direct sentences. No passive voice padding.
- No superlatives: never "revolutionary", "amazing", "game-changing", "groundbreaking".
- The vibe: quiet forest, steady progress, real work.

TASK:
Transform the raw input (may be Finnish or English) into a professional English logbook post.
Return ONLY a valid JSON object matching this exact schema:

{
  "slug": "lowercase-kebab-english-max-6-words",
  "title": "Clear post title (max 60 chars)",
  "meta_description": "AEO-optimized description, what and why, max 160 chars",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "content": "Full markdown body, minimum 3 paragraphs. Use ## for section headers if needed."
}

IMPORTANT: The content field must be the full blog post body in markdown. No frontmatter inside content. Minimum 200 words.
`;

export async function refineToLogbookPost(rawText: string): Promise<LogbookPost> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: rawText },
            ],
            temperature: 0.5,
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`OpenAI error: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const post = JSON.parse(data.choices[0].message.content) as LogbookPost;
    post.date = new Date().toISOString().split('T')[0];
    // Sanitize slug: lowercase, spaces → hyphens, strip non-url chars
    post.slug = post.slug
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
    return post;
}

export function formatMarkdown(post: LogbookPost): string {
    return [
        '---',
        `slug: "${post.slug}"`,
        `title: "${post.title}"`,
        `date: "${post.date}"`,
        `meta_description: "${post.meta_description}"`,
        `tags: [${post.tags.map(t => `"${t}"`).join(', ')}]`,
        '---',
        '',
        post.content,
        '',
    ].join('\n');
}
