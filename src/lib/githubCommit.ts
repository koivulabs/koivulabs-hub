// Commits a logbook markdown file directly to the GitHub repo via API

import { LogbookPost, formatMarkdown } from './koivuVoice';

export async function commitToGitHub(post: LogbookPost): Promise<{ url: string; path: string }> {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER ?? 'koivulabs';
    const repo = process.env.GITHUB_REPO_NAME ?? 'koivulabs-hub';

    if (!token) throw new Error('GITHUB_TOKEN not set');

    const filename = `${post.date}-${post.slug}.md`;
    const path = `src/content/logbook/${filename}`;
    const markdown = formatMarkdown(post);
    const content = Buffer.from(markdown, 'utf-8').toString('base64');

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
            message: `log: ${post.title}\n\nPublished via Koivu Voice (Telegram → AI → GitHub)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`,
            content,
            branch: 'main',
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`GitHub API error: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return {
        url: data.content.html_url,
        path,
    };
}
