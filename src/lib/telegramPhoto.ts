// Download a photo from Telegram and return it as a base64-encoded buffer
// Telegram sends multiple sizes — we always pick the largest one

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';

export interface TelegramPhotoResult {
    base64: string;     // base64-encoded image data
    mimeType: string;   // e.g. 'image/jpeg'
    extension: string;  // e.g. 'jpg'
}

export async function downloadTelegramPhoto(fileId: string): Promise<TelegramPhotoResult> {
    if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN not set');

    // Get file path from Telegram
    const fileRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    const fileData = await fileRes.json();

    if (!fileData.ok) {
        throw new Error(`Telegram getFile error: ${JSON.stringify(fileData)}`);
    }

    const filePath: string = fileData.result.file_path;

    // Download the actual file
    const photoRes = await fetch(
        `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
    );

    if (!photoRes.ok) {
        throw new Error(`Failed to download photo: ${photoRes.status}`);
    }

    const buffer = await photoRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Determine mime type from file extension
    const ext = filePath.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
    };

    return {
        base64,
        mimeType: mimeMap[ext] ?? 'image/jpeg',
        extension: ext === 'jpeg' ? 'jpg' : ext,
    };
}
       