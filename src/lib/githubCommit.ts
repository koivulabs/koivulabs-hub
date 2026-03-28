// Commits a logbook markdown file (and optional images) to the GitHub repo via API

import { LogbookPost, formatMarkdown } from './koivuVoice';

export interface ImageAttachment {
    base64: string;     // base64-encoded image data (raw, no data: prefix)
    extension: string;  // e.g. 'jpg', 'png'
}

/** Commit a single file to GitHub. Returns the HTML URL. */
async function commitFile(
    token: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
): Promise<string> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ message, content, branch: 'main' }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`GitHub API error: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return data.content.html_url as string;
}

export async function commitToGitHub(
    post: LogbookPost,
    images?: ImageAttachment[],
): Promise<{ url: string; path: string }> {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER ?? 'koivulabs';
    const repo = process.env.GITHUB_REPO_NAME ?? 'koivulabs-hub';

    if (!token) throw new Error('GITHUB_TOKEN not set');

    // 1. Commit images first (if any) and collect their paths
    const imagePaths: string[] = [];

    if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const imageName = `${post.date}-${post.slug}-${i + 1}.${img.extension}`;
            const imagePath = `public/logbook/images/${imageName}`;

            await commitFile(
                token, owner, repo, imagePath, img.base64,
                `img: ${post.title} (${i + 1}/${images.length})`,
            );

            // Path as it will be served by Next.js (public/ is stripped)
            imagePaths.push(`/logbook/images/${imageName}`);
        }
    }

    // 2. Commit the markdown file
    // Note: image references are already injected into post.content by the caller
    const filename = `${post.date}-${post.slug}.md`;
    const path = `src/content/logbook/${filename}`;
    const markdown = formatMarkdown(post);
    const content = Buffer.from(markdown, 'utf-8').toString('base64');

    const url = await commitFile(
        token, owner, repo, path, content,
        `log: ${post.title}\n\nPublished via Koivu Voice (Telegram → AI → GitHub)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`,
    );

    return { url, path };
}
