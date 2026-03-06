// Transcribes a Telegram voice message using OpenAI Whisper

export async function transcribeVoice(fileId: string): Promise<string> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN not set');

    // Step 1: Get file path from Telegram
    const fileRes = await fetch(
        `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    const fileData = await fileRes.json();

    if (!fileData.ok) {
        throw new Error(`Telegram getFile error: ${JSON.stringify(fileData)}`);
    }

    const filePath: string = fileData.result.file_path;

    // Step 2: Download audio file
    const audioRes = await fetch(
        `https://api.telegram.org/file/bot${botToken}/${filePath}`
    );

    if (!audioRes.ok) {
        throw new Error(`Failed to download voice file: ${audioRes.status}`);
    }

    const audioBuffer = await audioRes.arrayBuffer();

    // Step 3: Transcribe with Whisper (auto-detects Finnish/English)
    const formData = new FormData();
    formData.append(
        'file',
        new Blob([audioBuffer], { type: 'audio/ogg' }),
        'voice.ogg'
    );
    formData.append('model', 'whisper-1');
    // No language param — Whisper auto-detects Finnish / English

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
    });

    if (!whisperRes.ok) {
        const err = await whisperRes.json();
        throw new Error(`Whisper error: ${JSON.stringify(err)}`);
    }

    const whisperData = await whisperRes.json();
    return whisperData.text as string;
}
